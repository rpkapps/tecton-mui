import { renderHook } from '@testing-library/react';
import { useScrollButtonCompensation } from '../useScrollButtonCompensation.js';

// jsdom has no layout: the tests give the strip its geometry by hand. The scroller is 200px wide and
// scrolls over 1000px (max 800), between MUI's two scroll buttons.

function makeStrip() {
  const root = document.createElement('div');
  const start = document.createElement('div');
  const end = document.createElement('div');
  const scroller = document.createElement('div');
  start.className = 'MuiTabs-scrollButtons';
  end.className = 'MuiTabs-scrollButtons';
  scroller.className = 'MuiTabs-scroller';
  root.append(start, scroller, end);
  document.body.append(root);
  let scrollLeft = 0;
  Object.defineProperty(scroller, 'scrollLeft', {
    configurable: true,
    get: () => scrollLeft,
    set: (v: number) => {
      scrollLeft = Math.max(0, Math.min(800, v));
    },
  });
  Object.defineProperty(scroller, 'scrollWidth', { value: 1000, configurable: true });
  Object.defineProperty(scroller, 'clientWidth', { value: 200, configurable: true });
  return { root, scroller, start, end };
}

/** An arrow's width: 0 while it is hidden (disabled), MUI's 40px while it shows. */
function setWidth(el: HTMLElement, width: number) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  el.style.width = '40px';
}

let observers: { cb: ResizeObserverCallback; targets: Element[] }[] = [];
const fireResize = () => observers.forEach((o) => o.cb([], {} as ResizeObserver));

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      entry: { cb: ResizeObserverCallback; targets: Element[] };
      constructor(cb: ResizeObserverCallback) {
        this.entry = { cb, targets: [] };
        observers.push(this.entry);
      }
      observe(el: Element) {
        this.entry.targets.push(el);
      }
      disconnect() {
        observers = observers.filter((o) => o !== this.entry);
      }
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useScrollButtonCompensation', () => {
  it('watches both scroll buttons, and stops when unmounted', () => {
    const strip = makeStrip();
    const hook = renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    expect(observers).toHaveLength(1);
    expect(observers[0]!.targets).toEqual([strip.start, strip.end]);
    hook.unmount();
    expect(observers).toHaveLength(0);
  });

  it('keeps the tabs in place when the start arrow shows or hides', () => {
    const strip = makeStrip();
    setWidth(strip.start, 0);
    setWidth(strip.end, 40);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    strip.scroller.scrollLeft = 100;
    setWidth(strip.start, 40);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(140);
    setWidth(strip.start, 0);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(100);
  });

  it('leaves a strip at its start where it is when the start arrow shows', () => {
    const strip = makeStrip();
    setWidth(strip.start, 0);
    setWidth(strip.end, 40);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    setWidth(strip.start, 40);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(0);
  });

  it('takes the strip to its end when the end arrow shows there, or within its width of it', () => {
    const strip = makeStrip();
    setWidth(strip.start, 40);
    setWidth(strip.end, 0);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    strip.scroller.scrollLeft = 760; // max is 800
    setWidth(strip.end, 40);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(800);
  });

  it('leaves the strip where it is when the end arrow shows away from the end', () => {
    const strip = makeStrip();
    setWidth(strip.start, 40);
    setWidth(strip.end, 0);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    strip.scroller.scrollLeft = 759;
    setWidth(strip.end, 40);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(759);
  });

  it("pads the scroller's end by the start arrow's width while that arrow is hidden at the start", () => {
    const strip = makeStrip();
    setWidth(strip.start, 0);
    setWidth(strip.end, 40);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    // MUI's scroll-into-view then keeps a selected tab clear of the start arrow's room.
    expect(strip.scroller.style.scrollPaddingRight).toBe('40px');
    strip.scroller.scrollLeft = 100;
    setWidth(strip.start, 40);
    fireResize();
    expect(strip.scroller.style.scrollPaddingRight).toBe('');
  });

  it('does nothing without the scroll arrows', () => {
    const strip = makeStrip();
    strip.start.remove();
    strip.end.remove();
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    expect(observers).toHaveLength(0);
    expect(strip.scroller.style.scrollPaddingRight).toBe('');
  });
});
