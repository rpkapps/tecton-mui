'use client';
// The app bar's tab strip: when its scroll arrows show, and how the strip scrolls.
//
// MUI decides both on its own timing: the arrows follow an IntersectionObserver (its updates can
// lag or be missed, which left an arrow on at the end of the strip or the start arrow off while
// scrolled), and the selected tab is scrolled into view by an animation started in a passive effect,
// with a target taken before the arrows settle (every second added tab ended under the end arrow,
// in the drop-in too). Here the strip owns both:
// - an arrow shows exactly while the strip can scroll its way, re-measured on every scroll, resize
//   and render;
// - all scrolling the bar does (bringing the selected tab into view, arrow clicks) is one slide with
//   MUI's duration and easing, whose target is recomputed every frame, so an arrow that shows or
//   hides on the way cannot leave it short. MUI's own writes to the strip's scroll position are
//   ignored (see `attach`), so nothing else moves it; the user's wheel, touch and keyboard focus
//   scroll it natively as before.
import * as React from 'react';
import TabScrollButton, { type TabScrollButtonProps } from '@mui/material/TabScrollButton';
import { useTheme } from '@mui/material/styles';
import { cssVar } from '../styles/tecton/index.js';

const useEnhancedEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

const LEFT = 1;
const RIGHT = 2;
/** `LEFT` / `RIGHT` shifted: the strip can scroll that way from where it is right now. */
const NOW = 2;

/** Same width as the Home (fixed) tab cell, so the start arrow and Home take the same room. */
export const SCROLL_ARROW_WIDTH = 48;

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
   * Bit field. 1 / 2: the left / right arrow shows (the strip can scroll that way from where it is,
   * or from where a slide is taking it). 4 / 8: it can scroll that way from where it is now.
   */
  getSnapshot: () => number;
  /** Re-measures the strip; notifies when the arrows change. */
  measure: () => void;
  /** Follows a scroller (scroll events, its size and its tabs' sizes); returns a detach function. */
  attach: (scroller: HTMLElement) => () => void;
  /** Slides one page toward `direction` (the tabs that fit, as MUI's scroll buttons do). */
  scrollPage: (direction: 'left' | 'right') => void;
  /** Brings the selected tab into view: slides, or jumps with `instant`. */
  revealSelected: (instant?: boolean) => void;
  /** Stops a slide in progress (the user took over). */
  stop: () => void;
  /** Whether a slide is in progress. */
  isSliding: () => boolean;
  /** Slide duration in ms (the theme's standard duration). 0 jumps. */
  setDuration: (ms: number) => void;
  /** The slide duration, which the arrows also take to show or hide (0 with reduced motion). */
  getDuration: () => number;
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

/** MUI's page: the tabs that fit in the strip, or the strip's width if the first one does not. */
function pageSize(scroller: HTMLElement) {
  const size = scroller.clientWidth;
  let page = 0;
  const tabs = Array.from(scroller.querySelector('[role="tablist"]')?.children ?? []);
  for (let i = 0; i < tabs.length; i += 1) {
    const width = (tabs[i] as HTMLElement).clientWidth;
    if (page + width > size) {
      if (i === 0) page = size;
      break;
    }
    page += width;
  }
  return page;
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
  let slide: { frame: number; end: () => number | null } | null = null;
  const listeners = new Set<() => void>();

  const measure = () => {
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const rtl = isRtl(scroller);
    // During a slide the arrows show where the strip is going, so that they grow or shrink along
    // with it rather than pop in or out when it arrives (which would make the tabs jump).
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
    const now = ways(scroller.scrollLeft);
    const next = (to == null ? now : ways(clampScroll(scroller, to))) | (now << NOW);
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
    let start: number | null = null;
    const step = (now: number) => {
      if (!slide) return;
      start ??= now;
      const t = Math.min(1, (now - start) / duration);
      const to = target();
      if (to == null) {
        slide = null;
        measure();
        return;
      }
      writeScrollLeft(el, from + (clampScroll(el, to) - from) * ease(t));
      if (t < 1) slide.frame = requestAnimationFrame(step);
      else {
        slide = null;
        measure();
      }
    };
    slide = { frame: requestAnimationFrame(step), end: target };
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
      const base = (slide && slide.end()) ?? el.scrollLeft;
      const to = base + (direction === 'left' ? -1 : 1) * pageSize(el);
      slideTo(() => to);
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

const divider = `1px solid ${cssVar('color-divider-subtle')}`;

/**
 * An arrow's look: a cell as wide as the Home tab with a divider toward the tabs (written for LTR;
 * the RTL style cache mirrors it), or no room at all while it cannot scroll. Showing and hiding
 * animate with the strip's slide, so the tabs move smoothly instead of jumping by an arrow's width.
 */
export function arrowSx(shown: boolean, atStart: boolean, duration: number) {
  return {
    width: shown ? SCROLL_ARROW_WIDTH : 0,
    overflow: 'hidden',
    [atStart ? 'borderRight' : 'borderLeft']: shown ? divider : 'none',
    transition:
      duration > 0
        ? `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        : 'none',
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  } as const;
}

/**
 * `slots.scrollButtons` of the app bar's Tabs: MUI's scroll button, as wide as the Home tab, shown
 * while the strip can scroll its way (or is sliding to where it can) and taking no room otherwise. A
 * click slides one page, as MUI's does.
 */
export const TabStripScrollButton = React.forwardRef<HTMLButtonElement, TabScrollButtonProps>(
  function TabStripScrollButton(props, ref) {
    const store = React.useContext(TabStripContext);
    const state = React.useSyncExternalStore(
      store?.subscribe ?? noopSubscribe,
      store?.getSnapshot ?? getServerSnapshot,
      getServerSnapshot,
    );
    const theme = useTheme();
    const direction = props.direction === 'left' ? 'left' : 'right';
    const way = direction === 'left' ? LEFT : RIGHT;
    const can = (state & way) !== 0;
    // An arrow shrinking away during a slide stays enabled until the strip gets there, so that the
    // ripple of the click that started the slide plays out (MUI drops it from a disabled button).
    const enabled = can || (state & (way << NOW)) !== 0;
    const atStart = (direction === 'left') !== (theme.direction === 'rtl');
    // The arrows take their first state at once (on load, after hydration); later changes animate.
    const [animate, setAnimate] = React.useState(false);
    React.useEffect(() => {
      const frame = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(frame);
    }, []);
    const duration = animate ? (store?.getDuration() ?? 0) : 0;
    const sx = React.useMemo(() => arrowSx(can, atStart, duration), [can, atStart, duration]);
    return (
      <TabScrollButton
        ref={ref}
        {...props}
        sx={sx}
        disabled={!enabled}
        onClick={() => store?.scrollPage(direction)}
      />
    );
  },
);

/** Interactions that mean the user is moving the strip (or the focus in it) themselves. */
const USER_SCROLL_EVENTS = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;

/**
 * Drives the app bar's tab strip: follows its geometry for the scroll arrows, and keeps the selected
 * tab in view: on the first render and while the strip settles (fonts, an arrow showing or hiding),
 * at once, as MUI would; when it changes later (selected, added or closed), with a slide. It stops
 * following once the user moves the strip themselves.
 */
export function useTabStrip(
  tabsRef: React.RefObject<HTMLElement | null>,
  selected: string | null,
  tabCount: number,
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
    const root = tabsRef.current;
    const scroller = root?.querySelector<HTMLElement>('.MuiTabs-scroller');
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
  }, [store, tabsRef, selected, tabCount]);

  // Every render can change the tabs (labels, tags, count): re-measure before paint.
  useEnhancedEffect(() => {
    store.measure();
  });

  return store;
}
