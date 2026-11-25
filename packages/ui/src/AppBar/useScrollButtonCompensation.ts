'use client';
import * as React from 'react';

/**
 * The Tecton drop-in app bar's patch over MUI's scrollable `Tabs` (`<wc-app-bar>` 1.2.0), as it is.
 *
 * The strip hides a disabled scroll arrow (`display: none`), so an arrow showing or hiding changes
 * the scroller's width. When the start arrow's width changes, the tabs are moved back by as much, so
 * the visible ones stay in place. When the end arrow shows while the strip is at (or within the
 * arrow's width of) its end, the strip goes to the end, so the last tab reaches it.
 *
 * While the start arrow is hidden at the start, the scroller gets a `scroll-padding-right` as wide
 * as that arrow: MUI's scroll-into-view then keeps a selected tab clear of the room the start arrow
 * takes when it shows.
 *
 * In RTL the scroll position is negative, so only the scroll padding applies (as in the drop-in).
 *
 * `tabsRef` is the `Tabs` root, holding MUI's own scroller and scroll buttons.
 */
export function useScrollButtonCompensation(tabsRef: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const scroller = tabsRef.current?.querySelector<HTMLElement>('.MuiTabs-scroller');
    const [start, end] = Array.from(
      tabsRef.current?.querySelectorAll<HTMLElement>('.MuiTabs-scrollButtons') ?? [],
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
