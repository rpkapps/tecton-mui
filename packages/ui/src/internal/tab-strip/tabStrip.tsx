'use client';
// A Tabs strip that scrolls: when its scroll arrows show, and how the strip scrolls. Shared by the
// app bar's tab strip (MUI scrollable Tabs, its arrows as Tabs slots) and the heading's filled tab
// group (pills Tabs, whose scroller this drives directly, its arrows beside the Tabs).
//
// MUI decides both on its own timing: the arrows follow an IntersectionObserver (its updates can
// lag or be missed, which left an arrow on at the end of the strip or the start arrow off while
// scrolled), and the selected tab is scrolled into view by an animation started in a passive effect,
// with a target taken before the arrows settle (every second added tab ended under the end arrow,
// in the drop-in too). Here the strip owns both:
// - an arrow shows exactly while the strip can scroll its way, re-measured on every scroll, resize
//   and render;
// - all scrolling the strip does (bringing the selected tab into view, arrow clicks) is one slide
//   with MUI's duration and easing, whose target is recomputed every frame, so an arrow that shows
//   or hides on the way cannot leave it short. MUI's own writes to the strip's scroll position are
//   ignored (see `attach`), so nothing else moves it; the user's wheel, touch and keyboard focus
//   scroll it natively as before.
import * as React from 'react';
import { useTheme } from '@mui/material/styles';

const useEnhancedEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export const LEFT = 1;
export const RIGHT = 2;

/** MUI's Tabs scroll easing (`easeInOutSin`). */
const ease = (t: number) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;

/** The browser's `scrollLeft` accessor (read when a strip attaches: there is no DOM on the server). */
const nativeScrollLeft = () => Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');
/** The real `scrollLeft` accessor of each guarded scroller (see `attach`). */
const scrollLeftAccessors = new WeakMap<HTMLElement, PropertyDescriptor>();

/** Sets a scroller's `scrollLeft`, also on a strip whose MUI writes are ignored. */
export function writeScrollLeft(el: HTMLElement, value: number) {
  const accessor = scrollLeftAccessors.get(el);
  if (accessor?.set) accessor.set.call(el, value);
  else el.scrollLeft = value;
}

/** A scroll target, recomputed every frame: an absolute `scrollLeft`, or null to stop. */
type Target = () => number | null;

/** Which ways the strip can scroll (physical directions, as MUI's scroll buttons use). */
export interface TabStripStore {
  subscribe: (listener: () => void) => () => void;
  /**
   * Bit field: 1 / 2 = the left / right arrow shows (the strip can scroll that way from where it
   * is, or from where a slide is taking it).
   */
  getSnapshot: () => number;
  /** Re-measures the strip; notifies when the arrows change. */
  measure: () => void;
  /** Follows a scroller (scroll events, its size and its tabs' sizes); returns a detach function. */
  attach: (scroller: HTMLElement) => () => void;
  /** Slides one page toward `direction`: about the strip's width, in whole tabs (see `pageTarget`). */
  scrollPage: (direction: 'left' | 'right') => void;
  /** Brings the selected tab into view: slides, or jumps with `instant`. */
  revealSelected: (instant?: boolean) => void;
  /** Stops a slide in progress (the user took over). */
  stop: () => void;
  /** Whether a slide is in progress. */
  isSliding: () => boolean;
  /** Slide duration in ms (the theme's standard duration). 0 jumps. */
  setDuration: (ms: number) => void;
  /** The slide duration, which an arrow also takes to show (0 with reduced motion). */
  getDuration: () => number;
  /**
   * Moves the strip `delta` px toward its end, keeping a slide in progress on course: used when the
   * start arrow shows or hides during a slide, so that the tabs do not jump by its width.
   */
  shift: (delta: number) => void;
}

const isRtl = (el: HTMLElement) => getComputedStyle(el).direction === 'rtl';

function scrollPadding(value: string, size: number) {
  const number = parseFloat(value);
  if (Number.isNaN(number)) return 0;
  return value.endsWith('%') ? (number / 100) * size : number;
}

/**
 * Where the strip must scroll to show the selected tab, with MUI's own rule (Tabs
 * `scrollSelectedIntoView`): keep it between the scroller's edges shrunk by its scroll-padding;
 * align its start edge if it is out of view there or does not fit, else its end edge. Returns the
 * current position when it is in view, null without a selected tab.
 */
export function selectedTabTarget(scroller: HTMLElement): number | null {
  const tab = scroller.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
  // A strip laid out with no width yet (mid-layout, hidden, collapsed) has nothing to bring the
  // tab into; the strip's resize observer reveals it once it has a width.
  if (!tab || scroller.clientWidth <= 0) return null;
  const t = tab.getBoundingClientRect();
  const s = scroller.getBoundingClientRect();
  const style = getComputedStyle(scroller);
  const portStart = s.left + scrollPadding(style.scrollPaddingLeft, scroller.clientWidth);
  const portEnd = s.right - scrollPadding(style.scrollPaddingRight, scroller.clientWidth);
  if (t.left < portStart || t.right - t.left > portEnd - portStart) {
    return scroller.scrollLeft + (t.left - portStart);
  }
  if (t.right > portEnd) return scroller.scrollLeft + (t.right - portEnd);
  return scroller.scrollLeft;
}

/** The shortest step a page takes, as a share of the strip (shorter reads as a click that did nothing). */
const MIN_PAGE = 1 / 3;
/** How much of a tab cut off by the strip's edge still counts as shown: its padding and close slot. */
const SHOWN_SLACK = 48;

/**
 * Where one page toward `direction` (physical) takes the strip from `base` (a `scrollLeft`): about
 * the strip's width in whole tabs, counted from where the strip is.
 *
 * Toward the right, the tab cut off by the right edge moves to the left edge. When only a sliver of
 * it is cut off (`SHOWN_SLACK`, less on a very narrow strip), it counts as shown and the strip moves
 * past it instead; when it is nearly as wide as the strip or wider, so that the step would be
 * shorter than `MIN_PAGE`, the strip moves exactly one strip width. A page that would stop within a
 * sliver of the end of the strip goes to the end. Toward the left, the mirror image.
 *
 * (MUI counts the tabs that fit from the first tab, wherever the strip is: on a strip narrower than
 * Home and the first tab together, every click moved it by Home's 48px.)
 *
 * The target follows the tab every frame, since an arrow that shows or hides on the way moves the
 * strip's edges (and, in RTL, where a `scrollLeft` puts the tabs).
 */
function pageTarget(scroller: HTMLElement, direction: 'left' | 'right', base: number): Target {
  const size = scroller.clientWidth;
  const toRight = direction === 'right';
  const slack = Math.min(SHOWN_SLACK, size * MIN_PAGE);
  // The view at `base` in scroll space, where a point's position is the `scrollLeft` that puts it
  // at the strip's left edge.
  const viewStart = base;
  const viewEnd = base + size;
  const offset = scroller.scrollLeft - scroller.getBoundingClientRect().left;
  // Toward the right, the first tab not fully in view past the right edge; toward the left, the
  // last one past the left edge.
  let next: { tab: Element; left: number; right: number } | null = null;
  for (const tab of Array.from(scroller.querySelector('[role="tablist"]')?.children ?? [])) {
    const r = tab.getBoundingClientRect();
    const left = r.left + offset;
    const right = r.right + offset;
    if (
      toRight
        ? right > viewEnd + 1 && (!next || left < next.left)
        : left < viewStart - 1 && (!next || right > next.right)
    ) {
      next = { tab, left, right };
    }
  }

  let target: Target;
  if (!next) {
    // Nothing past the edge but the rest of the scroll range (the slide clamps to it).
    const page = toRight ? viewEnd : viewStart - size;
    target = () => page;
  } else {
    const { tab } = next;
    // The `scrollLeft` that puts the tab's `edge`, moved `by` px, at the strip's left edge (toward
    // the right) or right edge (toward the left).
    const align = (edge: 'left' | 'right', by: number) => () => {
      if (!tab.isConnected) return null;
      const s = scroller.getBoundingClientRect();
      return (
        scroller.scrollLeft + tab.getBoundingClientRect()[edge] + by - (toRight ? s.left : s.right)
      );
    };
    // In the direction of travel: whether the tab is partly in view, how much of it is cut off, and
    // the step that brings its near edge to the strip's other edge.
    const [cut, hidden, step] = toRight
      ? [next.left < viewEnd - 1, next.right - viewEnd, next.left - viewStart]
      : [next.right > viewStart + 1, viewStart - next.left, viewEnd - next.right];
    const [near, far] = toRight ? (['left', 'right'] as const) : (['right', 'left'] as const);
    if (cut && hidden <= slack) target = align(far, 0);
    else if (step >= size * MIN_PAGE) target = align(near, 0);
    else target = align(near, (toRight ? viewEnd : viewStart) - next[near]);
  }

  return () => {
    const to = target();
    if (to == null) return null;
    const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const rtl = isRtl(scroller);
    const end = toRight ? (rtl ? 0 : max) : rtl ? -max : 0;
    return Math.abs(end - to) <= slack ? end : to;
  };
}

/** Keeps a target within the strip's scroll range (negative in RTL). */
function clampScroll(scroller: HTMLElement, value: number) {
  const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
  return isRtl(scroller) ? Math.min(0, Math.max(-max, value)) : Math.max(0, Math.min(max, value));
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function createTabStripStore(): TabStripStore {
  let snapshot = 0;
  let scroller: HTMLElement | null = null;
  let duration = 300;
  /** `from`: where the slide started; `at`: where it last put the strip (both move with `shift`). */
  let slide: { frame: number; end: () => number | null; from: number; at: number } | null = null;
  const listeners = new Set<() => void>();

  const measure = () => {
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const rtl = isRtl(scroller);
    // During a slide the arrows show where the strip is going: an arrow that goes away does so as
    // the slide starts, when the room it leaves only shows more of the tabs, rather than when the
    // strip arrives at its edge (where the tabs would jump by its width).
    const ways = (position: number) => {
      // Distance scrolled from the start (scrollLeft is negative in RTL).
      const fromStart = rtl ? -position : position;
      // Within a pixel of an edge counts as the edge: browsers round scroll positions (RTL by up
      // to a pixel), and an arrow that only scrolls a fraction of a pixel would do nothing.
      const canStart = max > 1 && fromStart > 1;
      const canEnd = max > 1 && fromStart < max - 1;
      return ((rtl ? canEnd : canStart) ? LEFT : 0) | ((rtl ? canStart : canEnd) ? RIGHT : 0);
    };
    const to = slide?.end();
    const next = ways(to == null ? scroller.scrollLeft : clampScroll(scroller, to));
    if (next !== snapshot) {
      snapshot = next;
      listeners.forEach((listener) => listener());
    }
  };

  const stop = () => {
    if (slide) cancelAnimationFrame(slide.frame);
    slide = null;
  };

  /** Slides to `target` (re-evaluated every frame) with MUI's easing. */
  const slideTo = (target: Target, instant = false) => {
    const el = scroller;
    if (!el) return;
    stop();
    const first = target();
    if (first == null) return;
    const from = el.scrollLeft;
    if (Math.abs(clampScroll(el, first) - from) < 0.5) return;
    if (instant || duration <= 0 || prefersReducedMotion()) {
      writeScrollLeft(el, clampScroll(el, first));
      measure();
      return;
    }
    const current = { frame: 0, end: target, from, at: from };
    let start: number | null = null;
    const step = (now: number) => {
      if (slide !== current) return;
      start ??= now;
      const t = Math.min(1, (now - start) / duration);
      const to = target();
      if (to == null) {
        slide = null;
        measure();
        return;
      }
      // `from` moves with `shift`, so the slide stays on course when the strip's edge moves.
      current.at = current.from + (clampScroll(el, to) - current.from) * ease(t);
      writeScrollLeft(el, current.at);
      if (t < 1) current.frame = requestAnimationFrame(step);
      else {
        slide = null;
        measure();
      }
    };
    slide = current;
    current.frame = requestAnimationFrame(step);
    measure();
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    measure,
    stop: () => {
      stop();
      measure();
    },
    isSliding: () => slide != null,
    setDuration: (ms) => {
      duration = ms;
    },
    getDuration: () => (prefersReducedMotion() ? 0 : duration),
    shift: (delta) => {
      const el = scroller;
      if (!el || !delta) return;
      const physical = isRtl(el) ? -delta : delta;
      if (!slide) {
        writeScrollLeft(el, el.scrollLeft + physical);
        return;
      }
      // From where the slide put the strip: the browser may already have clamped the position to
      // the new scroll range (at the end of the strip), which is part of the same correction.
      slide.from += physical;
      slide.at += physical;
      writeScrollLeft(el, slide.at);
    },
    revealSelected: (instant) => {
      const el = scroller;
      if (!el) return;
      // Already sliding to the selected tab: the slide follows the new geometry on its own.
      slideTo(() => selectedTabTarget(el), instant);
    },
    scrollPage: (direction) => {
      const el = scroller;
      if (!el) return;
      // A click during a slide pages on from where that slide is going.
      const base = clampScroll(el, (slide && slide.end()) ?? el.scrollLeft);
      slideTo(pageTarget(el, direction, base));
    },
    attach: (el) => {
      scroller = el;
      // The strip is the only one to move the scroller: MUI's own writes (its scroll-into-view,
      // whose target is taken before the arrows settle) are ignored. Reads, native scrolling and
      // `writeScrollLeft` are unaffected.
      const own = Object.getOwnPropertyDescriptor(el, 'scrollLeft');
      const accessor = own ?? nativeScrollLeft();
      if (accessor?.get && accessor.set && (!own || own.configurable)) {
        scrollLeftAccessors.set(el, accessor);
        Object.defineProperty(el, 'scrollLeft', {
          configurable: true,
          get: () => accessor.get!.call(el),
          set: () => {},
        });
      }
      el.addEventListener('scroll', measure, { passive: true });
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
      observer?.observe(el);
      // Tab widths (fonts, labels, tags) change how far the strip can scroll.
      const list = el.querySelector('[role="tablist"]');
      const mutations =
        list && observer && typeof MutationObserver !== 'undefined'
          ? new MutationObserver(() => {
              Array.from(list.children).forEach((tab) => observer.observe(tab));
              measure();
            })
          : null;
      if (list && observer) Array.from(list.children).forEach((tab) => observer.observe(tab));
      if (list) mutations?.observe(list, { childList: true });
      measure();
      return () => {
        stop();
        el.removeEventListener('scroll', measure);
        observer?.disconnect();
        mutations?.disconnect();
        if (scrollLeftAccessors.has(el)) {
          scrollLeftAccessors.delete(el);
          if (own) Object.defineProperty(el, 'scrollLeft', own);
          else delete (el as { scrollLeft?: number }).scrollLeft;
        }
        if (scroller === el) scroller = null;
      };
    },
  };
}

const getServerSnapshot = () => 0;
const noopSubscribe = () => () => {};

export const TabStripContext = React.createContext<TabStripStore | null>(null);

/**
 * The state of one of the strip's scroll arrows: whether it shows (the strip can scroll its way, or
 * is sliding to where it can), whether it is at the start of the strip, how long it takes to grow in
 * (0 for its first state, on load or after hydration, and with reduced motion), and what a click
 * does (slide one page).
 */
export function useTabStripArrow(direction: 'left' | 'right') {
  const store = React.useContext(TabStripContext);
  const state = React.useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.getSnapshot ?? getServerSnapshot,
    getServerSnapshot,
  );
  const theme = useTheme();
  const shown = (state & (direction === 'left' ? LEFT : RIGHT)) !== 0;
  const atStart = (direction === 'left') !== (theme.direction === 'rtl');
  // The arrows take their first state at once (on load, after hydration); later changes animate.
  const [animate, setAnimate] = React.useState(false);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  const duration = animate ? (store?.getDuration() ?? 0) : 0;
  const onClick = React.useCallback(() => store?.scrollPage(direction), [store, direction]);
  return { shown, atStart, duration, onClick };
}

/** Interactions that mean the user is moving the strip (or the focus in it) themselves. */
const USER_SCROLL_EVENTS = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;

/**
 * Drives a tab strip: follows its geometry for the scroll arrows, and keeps the selected
 * tab in view: on the first render and while the strip settles (fonts, an arrow showing or hiding),
 * at once, as MUI would; when it changes later (selected, added or closed), with a slide. It stops
 * following once the user moves the strip themselves, anywhere in `controlsRef` (the Tabs by
 * default; the element that also holds the arrows when they sit beside the Tabs).
 */
export function useTabStrip(
  tabsRef: React.RefObject<HTMLElement | null>,
  selected: string | null,
  tabCount: number,
  controlsRef?: React.RefObject<HTMLElement | null>,
): TabStripStore {
  const [store] = React.useState(createTabStripStore);
  const theme = useTheme();
  store.setDuration(
    theme.motion?.reducedMotion === 'always' ? 0 : (theme.transitions?.duration?.standard ?? 300),
  );

  useEnhancedEffect(() => {
    const scroller = tabsRef.current?.querySelector<HTMLElement>('.MuiTabs-scroller');
    return scroller ? store.attach(scroller) : undefined;
  }, [store, tabsRef]);

  const mounted = React.useRef(false);
  useEnhancedEffect(() => {
    const root = controlsRef?.current ?? tabsRef.current;
    const scroller = tabsRef.current?.querySelector<HTMLElement>('.MuiTabs-scroller');
    const first = !mounted.current;
    mounted.current = true;
    if (!root || !scroller || selected == null) return undefined;
    // First render: at once, like MUI's own scroll-into-view on mount. Later: slide.
    store.revealSelected(first);
    if (typeof ResizeObserver === 'undefined') return undefined;
    // Follow the strip as it settles; a slide in progress already follows it.
    const observer = new ResizeObserver(() => {
      if (!store.isSliding()) store.revealSelected(first);
      store.measure();
    });
    observer.observe(scroller);
    const list = scroller.querySelector('[role="tablist"]');
    if (list) Array.from(list.children).forEach((tab) => observer.observe(tab));
    const release = () => {
      observer.disconnect();
      for (const type of USER_SCROLL_EVENTS) root.removeEventListener(type, takeOver, true);
    };
    // The user takes over: stop following, and stop a slide (an arrow click starts its own).
    function takeOver() {
      release();
      store.stop();
    }
    for (const type of USER_SCROLL_EVENTS) root.addEventListener(type, takeOver, true);
    return release;
  }, [store, tabsRef, controlsRef, selected, tabCount]);

  // Every render can change the tabs (labels, tags, count): re-measure before paint.
  useEnhancedEffect(() => {
    store.measure();
  });

  return store;
}
