'use client';
// The app bar's tab strip: when its scroll arrows show, and keeping the selected tab in view.
//
// MUI decides both on its own timing: the arrows follow an IntersectionObserver (its updates can
// lag or be missed, which left an arrow on at the end of the strip or the start arrow off while
// scrolled), and the selected tab is scrolled into view by an animation started in a passive effect,
// with a target taken before the arrows settle (every second added tab ended under the end arrow,
// in the drop-in too). Here both follow the strip's geometry directly:
// - an arrow shows exactly while the strip can scroll its way, re-measured on every scroll, resize
//   and render;
// - the selected tab is scrolled into view during the commit that selects or adds it, before the
//   browser paints, by the same rule MUI uses. MUI then finds it in view and has nothing to do.
import * as React from 'react';
import TabScrollButton, { type TabScrollButtonProps } from '@mui/material/TabScrollButton';
import type { Theme } from '@mui/material/styles';

const useEnhancedEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

const LEFT = 1;
const RIGHT = 2;

/** Which ways the strip can scroll (physical directions, as MUI's scroll buttons use). */
export interface TabStripStore {
  subscribe: (listener: () => void) => () => void;
  /** Bit field: 1 = can scroll left, 2 = can scroll right. */
  getSnapshot: () => number;
  /** Re-measures the strip; notifies when the arrows change. */
  measure: () => void;
  /** Follows a scroller (scroll events, its size and its tabs' sizes); returns a detach function. */
  attach: (scroller: HTMLElement) => () => void;
  /** Scrolls one page toward `direction` (the tabs that fit, as MUI's scroll buttons do). */
  scrollPage: (direction: 'left' | 'right') => void;
}

const isRtl = (el: HTMLElement) => getComputedStyle(el).direction === 'rtl';

export function createTabStripStore(): TabStripStore {
  let snapshot = 0;
  let scroller: HTMLElement | null = null;
  const listeners = new Set<() => void>();
  const measure = () => {
    if (!scroller) return;
    const max = scroller.scrollWidth - scroller.clientWidth;
    const rtl = isRtl(scroller);
    // Distance scrolled from the start (scrollLeft is negative in RTL).
    const fromStart = rtl ? -scroller.scrollLeft : scroller.scrollLeft;
    // Within a pixel of an edge counts as the edge: browsers round scroll positions (RTL by up to
    // a pixel), and an arrow that only scrolls a fraction of a pixel would do nothing.
    const canStart = max > 1 && fromStart > 1;
    const canEnd = max > 1 && fromStart < max - 1;
    const next = ((rtl ? canEnd : canStart) ? LEFT : 0) | ((rtl ? canStart : canEnd) ? RIGHT : 0);
    if (next !== snapshot) {
      snapshot = next;
      listeners.forEach((listener) => listener());
    }
  };
  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    measure,
    scrollPage: (direction) => {
      if (!scroller) return;
      // MUI's page: the tabs that fit in the strip, or the strip's width if the first one does not.
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
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      scroller.scrollBy({
        left: direction === 'left' ? -page : page,
        behavior: reduce ? 'auto' : 'smooth',
      });
    },
    attach: (el) => {
      scroller = el;
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
        el.removeEventListener('scroll', measure);
        observer?.disconnect();
        mutations?.disconnect();
        if (scroller === el) scroller = null;
      };
    },
  };
}

const getServerSnapshot = () => 0;

export const TabStripContext = React.createContext<TabStripStore | null>(null);

/**
 * `slots.scrollButtons` of the app bar's Tabs: MUI's scroll button, enabled while the strip can
 * scroll its way (the theme hides a disabled one). A click scrolls one page with the browser's own
 * smooth scrolling (MUI's animation is turned off for the strip, see `instantScrollTheme`).
 */
export const TabStripScrollButton = React.forwardRef<HTMLButtonElement, TabScrollButtonProps>(
  function TabStripScrollButton(props, ref) {
    const store = React.useContext(TabStripContext);
    const state = React.useSyncExternalStore(
      store?.subscribe ?? noopSubscribe,
      store?.getSnapshot ?? getServerSnapshot,
      getServerSnapshot,
    );
    const direction = props.direction === 'left' ? 'left' : 'right';
    const can = state & (direction === 'left' ? LEFT : RIGHT);
    return (
      <TabScrollButton
        ref={ref}
        {...props}
        disabled={!can}
        onClick={() => store?.scrollPage(direction)}
      />
    );
  },
);

const noopSubscribe = () => () => {};

/**
 * Nested theme for the strip's Tabs: MUI scrolls instead of animating. Its scroll-into-view
 * animation picks its target before the arrows settle and then overrides any correction for 300ms;
 * the strip does its own scrolling (see `useTabStrip` and `TabStripScrollButton`).
 */
export const instantScrollTheme = (outer: Theme): Theme => ({
  ...outer,
  motion: { ...outer.motion, reducedMotion: 'always' },
});

function scrollPadding(value: string, size: number) {
  const number = parseFloat(value);
  if (Number.isNaN(number)) return 0;
  return value.endsWith('%') ? (number / 100) * size : number;
}

/**
 * Scrolls the selected tab into view at once, with MUI's own rule (Tabs `scrollSelectedIntoView`):
 * keep it between the scroller's edges shrunk by its scroll-padding; align its start edge if it is
 * out of view there or does not fit, else its end edge.
 */
export function revealSelectedTab(scroller: HTMLElement) {
  const tab = scroller.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
  if (!tab) return;
  const t = tab.getBoundingClientRect();
  const s = scroller.getBoundingClientRect();
  const style = getComputedStyle(scroller);
  const portStart = s.left + scrollPadding(style.scrollPaddingLeft, scroller.clientWidth);
  const portEnd = s.right - scrollPadding(style.scrollPaddingRight, scroller.clientWidth);
  if (t.left < portStart || t.right - t.left > portEnd - portStart) {
    scroller.scrollLeft += t.left - portStart;
  } else if (t.right > portEnd) {
    scroller.scrollLeft += t.right - portEnd;
  }
}

/** Interactions that mean the user is moving the strip (or the focus in it) themselves. */
const USER_SCROLL_EVENTS = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;

/**
 * Drives the app bar's tab strip: follows its geometry for the scroll arrows, and keeps the selected
 * tab in view when it changes (selected, added or closed) and while the strip changes size after
 * that (an arrow showing or hiding, the bar resized), until the user moves the strip themselves.
 */
export function useTabStrip(
  tabsRef: React.RefObject<HTMLElement | null>,
  selected: string | null,
  tabCount: number,
): TabStripStore {
  const [store] = React.useState(createTabStripStore);

  useEnhancedEffect(() => {
    const scroller = tabsRef.current?.querySelector<HTMLElement>('.MuiTabs-scroller');
    return scroller ? store.attach(scroller) : undefined;
  }, [store, tabsRef]);

  // The first render is left to MUI (its scroll-into-view on mount is instant, and the drop-in
  // renders what it does); later selections, added and closed tabs are handled here.
  const mounted = React.useRef(false);
  useEnhancedEffect(() => {
    const root = tabsRef.current;
    const scroller = root?.querySelector<HTMLElement>('.MuiTabs-scroller');
    const first = !mounted.current;
    mounted.current = true;
    if (first || !root || !scroller || selected == null) return undefined;
    const reveal = () => {
      revealSelectedTab(scroller);
      store.measure();
    };
    reveal();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(reveal);
    observer.observe(scroller);
    const stop = () => {
      observer.disconnect();
      for (const type of USER_SCROLL_EVENTS) root.removeEventListener(type, stop, true);
    };
    for (const type of USER_SCROLL_EVENTS) root.addEventListener(type, stop, true);
    return stop;
  }, [store, tabsRef, selected, tabCount]);

  // Every render can change the tabs (labels, tags, count): re-measure before paint.
  useEnhancedEffect(() => {
    store.measure();
  });

  return store;
}
