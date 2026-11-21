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
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(start);
    observer.observe(end);
    return () => observer.disconnect();
  }, [tabsRef]);
}
