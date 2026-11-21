'use client';
import * as React from 'react';

/**
 * The app bar hides a tab scroll arrow while the strip cannot scroll its way (the disabled arrow
 * takes no room). Showing or hiding an arrow changes the scroller's width, which would shift the
 * tabs under the pointer; this keeps the visible tabs in place and lets the last tab reach the end
 * of the strip. Same behaviour as the Tecton drop-in app bar.
 */
export function useScrollButtonCompensation(tabsRef: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const root = tabsRef.current;
    const scroller = root?.querySelector<HTMLElement>('.MuiTabs-scroller');
    const [start, end] = Array.from(
      root?.querySelectorAll<HTMLElement>('.MuiTabs-scrollButtons') ?? [],
    );
    if (!scroller || !start || !end || typeof ResizeObserver === 'undefined') return undefined;
    let startWidth = start.offsetWidth;
    let endWidth = end.offsetWidth;
    const update = () => {
      const nextStart = start.offsetWidth;
      const nextEnd = end.offsetWidth;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      if (nextStart !== startWidth && scroller.scrollLeft > 0) {
        scroller.scrollLeft += nextStart - startWidth;
      }
      if (nextEnd > endWidth && scroller.scrollLeft >= maxScroll - (nextEnd - endWidth) - 0.5) {
        scroller.scrollLeft = maxScroll;
      }
      startWidth = nextStart;
      endWidth = nextEnd;
      const atStart = nextStart === 0 && scroller.scrollLeft < 1;
      scroller.style.scrollPaddingRight = atStart ? getComputedStyle(start).width : '';
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(start);
    observer.observe(end);
    return () => observer.disconnect();
  }, [tabsRef]);
}

/** Two frames with no scroll: MUI's scroll-into-view animation sets `scrollLeft` every frame. */
const SETTLE_FRAMES = 2;
/** How long after a selection change the strip is watched. */
const WATCH_MS = 1500;

/**
 * Keeps the selected tab fully in view after it changes (selected, added or closed).
 *
 * MUI scrolls the selected tab into view with the strip's width at that moment. When that scroll
 * makes the strip scrollable on its end side, the end arrow appears afterwards, narrows the strip by
 * its width, and the tab ends up partly hidden under it (every second added tab, in the drop-in
 * too). Once the strip has stopped scrolling, this scrolls the rest of the tab into view. Any
 * scrolling by the user (pointer, wheel, keyboard) ends the watch, so it never fights them.
 */
export function useKeepSelectedTabInView(
  tabsRef: React.RefObject<HTMLElement | null>,
  selected: string | null,
  tabCount: number,
) {
  React.useEffect(() => {
    const root = tabsRef.current;
    const scroller = root?.querySelector<HTMLElement>('.MuiTabs-scroller');
    if (!root || !scroller || selected == null || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const until = performance.now() + WATCH_MS;
    let frame = 0;
    let quietFrames = 0;
    let active = true;

    const reveal = () => {
      const tab = scroller.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!tab) return;
      const t = tab.getBoundingClientRect();
      const s = scroller.getBoundingClientRect();
      const rtl = getComputedStyle(scroller).direction === 'rtl';
      // Overflow past the visible end (right in LTR, left in RTL) and start, in pixels.
      const pastEnd = rtl ? s.left - t.left : t.right - s.right;
      const pastStart = rtl ? t.right - s.right : s.left - t.left;
      // Whole pixels: the browser can drop a sub-pixel scroll and leave the tab 1px short.
      if (pastEnd > 0.5 && pastStart < 0.5) {
        const by = Math.ceil(pastEnd);
        scroller.scrollLeft += rtl ? -by : by;
      } else if (pastStart > 0.5 && pastEnd < 0.5) {
        const by = Math.ceil(pastStart);
        scroller.scrollLeft -= rtl ? -by : by;
      }
    };
    const tick = () => {
      frame = 0;
      if (!active) return;
      quietFrames += 1;
      if (quietFrames < SETTLE_FRAMES) {
        frame = requestAnimationFrame(tick);
        return;
      }
      reveal();
      if (performance.now() >= until) stop();
    };
    const restart = () => {
      if (!active) return;
      if (performance.now() >= until) {
        stop();
        return;
      }
      quietFrames = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const observer = new ResizeObserver(restart);
    const stop = () => {
      active = false;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener('scroll', restart);
      for (const type of USER_SCROLL_EVENTS) root.removeEventListener(type, stop, true);
    };
    observer.observe(scroller);
    scroller.addEventListener('scroll', restart, { passive: true });
    for (const type of USER_SCROLL_EVENTS) root.addEventListener(type, stop, true);
    restart();
    return stop;
  }, [tabsRef, selected, tabCount]);
}

/** Interactions that mean the user is moving the strip (or the focus in it) themselves. */
const USER_SCROLL_EVENTS = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
