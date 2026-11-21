import * as React from 'react';
import { renderHook } from '@testing-library/react';
import {
  useKeepSelectedTabInView,
  useScrollButtonCompensation,
} from '../useScrollButtonCompensation.js';

// jsdom has no layout: the tests give the strip its geometry by hand.

interface Strip {
  root: HTMLDivElement;
  scroller: HTMLDivElement;
  start: HTMLDivElement;
  end: HTMLDivElement;
  tab: HTMLDivElement;
}

function rect(left: number, width: number): DOMRect {
  return {
    left,
    right: left + width,
    width,
    top: 0,
    bottom: 40,
    height: 40,
    x: left,
    y: 0,
  } as DOMRect;
}

function makeStrip({ rtl = false } = {}): Strip {
  const root = document.createElement('div');
  const start = document.createElement('div');
  const end = document.createElement('div');
  const scroller = document.createElement('div');
  start.className = 'MuiTabs-scrollButtons';
  end.className = 'MuiTabs-scrollButtons';
  scroller.className = 'MuiTabs-scroller';
  if (rtl) scroller.style.direction = 'rtl';
  const tab = document.createElement('div');
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-selected', 'true');
  scroller.append(tab);
  root.append(start, scroller, end);
  document.body.append(root);
  let scrollLeft = 0;
  Object.defineProperty(scroller, 'scrollLeft', {
    get: () => scrollLeft,
    set: (v: number) => {
      scrollLeft = v;
    },
  });
  Object.defineProperty(scroller, 'scrollWidth', { value: 1000, configurable: true });
  Object.defineProperty(scroller, 'clientWidth', { value: 200, configurable: true });
  scroller.getBoundingClientRect = () => rect(100, 200);
  return { root, scroller, start, end, tab };
}

function setWidth(el: HTMLElement, width: number) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  el.style.width = `${width}px`;
}

let frames: FrameRequestCallback[] = [];
const flushFrames = (count = 2) => {
  for (let i = 0; i < count; i += 1) {
    const queue = frames;
    frames = [];
    queue.forEach((cb) => cb(0));
  }
};
let observers: { cb: ResizeObserverCallback; targets: Element[] }[] = [];
const fireResize = () => observers.forEach((o) => o.cb([], {} as ResizeObserver));

beforeEach(() => {
  frames = [];
  observers = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = [];
  });
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
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useKeepSelectedTabInView', () => {
  const mount = (strip: Strip, selected: string | null = 'a', count = 1) =>
    renderHook(({ sel, n }) => useKeepSelectedTabInView({ current: strip.root }, sel, n), {
      initialProps: { sel: selected, n: count },
    });

  it('scrolls the rest of a tab hidden past the end into view, once the strip settles', () => {
    const strip = makeStrip();
    strip.scroller.scrollLeft = 378;
    strip.tab.getBoundingClientRect = () => rect(200, 139.6); // right edge 339.6 > 300
    mount(strip);
    flushFrames(1);
    expect(strip.scroller.scrollLeft).toBe(378); // not settled yet
    flushFrames(1);
    expect(strip.scroller.scrollLeft).toBe(378 + 40);
  });

  it('scrolls a tab hidden past the start into view', () => {
    const strip = makeStrip();
    strip.scroller.scrollLeft = 100;
    strip.tab.getBoundingClientRect = () => rect(80, 60);
    mount(strip);
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(80);
  });

  it('uses the reading direction in RTL', () => {
    const strip = makeStrip({ rtl: true });
    strip.scroller.scrollLeft = -378;
    strip.tab.getBoundingClientRect = () => rect(60, 100); // past the left (end) edge by 40
    mount(strip);
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(-418);
    strip.tab.getBoundingClientRect = () => rect(250, 100); // past the right (start) edge by 50
    fireResize();
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(-368);
  });

  it('waits while the strip keeps scrolling (MUI animation) and checks again on resize', () => {
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(150, 100);
    mount(strip);
    flushFrames(1);
    strip.scroller.dispatchEvent(new Event('scroll'));
    flushFrames(1);
    expect(strip.scroller.scrollLeft).toBe(0);
    // The end arrow appears: the strip narrows and the tab is now past its end.
    strip.scroller.getBoundingClientRect = () => rect(100, 120);
    fireResize();
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(30);
  });

  it('stops when the user moves the strip, so it never fights them', () => {
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(250, 100);
    mount(strip);
    strip.root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    flushFrames();
    fireResize();
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(0);
  });

  it('has no time limit: a late resize still reveals the tab', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(150, 100);
    mount(strip);
    flushFrames();
    now = 10_000;
    strip.tab.getBoundingClientRect = () => rect(250, 100);
    fireResize();
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(50);
  });

  it('stops listening when unmounted', () => {
    const strip = makeStrip();
    const hook = mount(strip);
    hook.unmount();
    expect(observers).toHaveLength(0);
  });

  it('restarts when the selection or the number of tabs changes', () => {
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(150, 100);
    const hook = mount(strip);
    flushFrames();
    strip.tab.getBoundingClientRect = () => rect(250, 100);
    hook.rerender({ sel: 'b', n: 2 });
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(50);
  });

  it('does nothing without a selection, a selected tab or a strip', () => {
    const strip = makeStrip();
    mount(strip, null);
    strip.tab.removeAttribute('aria-selected');
    mount(strip, 'a');
    flushFrames();
    expect(strip.scroller.scrollLeft).toBe(0);
    renderHook(() => useKeepSelectedTabInView({ current: null }, 'a', 1));
    renderHook(() => useKeepSelectedTabInView(React.createRef(), 'a', 1));
  });
});

describe('useScrollButtonCompensation', () => {
  it('keeps the tabs in place when the start arrow shows or hides', () => {
    const strip = makeStrip();
    setWidth(strip.start, 0);
    setWidth(strip.end, 40);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    // At the start of the strip, the hidden start arrow's room is kept as scroll padding.
    expect(strip.scroller.style.scrollPaddingRight).toBe('0px');
    strip.scroller.scrollLeft = 100;
    setWidth(strip.start, 40);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(140);
    expect(strip.scroller.style.scrollPaddingRight).toBe('');
  });

  it('keeps the strip at its end when the end arrow appears there', () => {
    const strip = makeStrip();
    setWidth(strip.start, 40);
    setWidth(strip.end, 0);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    strip.scroller.scrollLeft = 790; // max is 800
    setWidth(strip.end, 40);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(800);
  });

  it('does nothing without the scroll arrows', () => {
    const strip = makeStrip();
    strip.start.remove();
    strip.end.remove();
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    expect(observers).toHaveLength(0);
  });
});
