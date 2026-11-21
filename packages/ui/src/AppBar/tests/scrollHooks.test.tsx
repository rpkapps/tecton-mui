import * as React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useScrollButtonCompensation } from '../useScrollButtonCompensation.js';
import {
  createTabStripStore,
  instantScrollTheme,
  revealSelectedTab,
  TabStripContext,
  TabStripScrollButton,
  useTabStrip,
  type TabStripStore,
} from '../tabStrip.js';
import type { Theme } from '@mui/material/styles';

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
  const list = document.createElement('div');
  list.setAttribute('role', 'tablist');
  const tab = document.createElement('div');
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-selected', 'true');
  list.append(tab);
  scroller.append(list);
  root.append(start, scroller, end);
  document.body.append(root);
  let scrollLeft = 0;
  Object.defineProperty(scroller, 'scrollLeft', {
    get: () => scrollLeft,
    set: (v: number) => {
      scrollLeft = v;
    },
  });
  scroller.scrollBy = ((options: ScrollToOptions) => {
    scrollLeft += options.left ?? 0;
  }) as typeof scroller.scrollBy;
  Object.defineProperty(scroller, 'scrollWidth', { value: 1000, configurable: true });
  Object.defineProperty(scroller, 'clientWidth', { value: 200, configurable: true });
  scroller.getBoundingClientRect = () => rect(100, 200);
  return { root, scroller, start, end, tab };
}

function setWidth(el: HTMLElement, width: number) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  el.style.width = `${width}px`;
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
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('createTabStripStore', () => {
  it('enables an arrow exactly while the strip can scroll its way (LTR)', () => {
    const strip = makeStrip(); // scrollWidth 1000, clientWidth 200: max 800
    const store = createTabStripStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const detach = store.attach(strip.scroller);
    expect(store.getSnapshot()).toBe(2); // at the start: only right
    strip.scroller.scrollLeft = 400;
    strip.scroller.dispatchEvent(new Event('scroll'));
    expect(store.getSnapshot()).toBe(3);
    strip.scroller.scrollLeft = 799.5; // within a pixel of the end counts as the end
    store.measure();
    expect(store.getSnapshot()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(3);
    store.measure();
    expect(listener).toHaveBeenCalledTimes(3); // no change, no notification
    detach();
    strip.scroller.scrollLeft = 0;
    strip.scroller.dispatchEvent(new Event('scroll'));
    expect(store.getSnapshot()).toBe(1);
  });

  it('maps start and end to the physical sides in RTL', () => {
    const strip = makeStrip({ rtl: true });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    expect(store.getSnapshot()).toBe(1); // at the start (right): can scroll left only
    strip.scroller.scrollLeft = -800;
    store.measure();
    expect(store.getSnapshot()).toBe(2);
  });

  it('has no arrows when the tabs fit', () => {
    const strip = makeStrip();
    Object.defineProperty(strip.scroller, 'scrollWidth', { value: 200, configurable: true });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    expect(store.getSnapshot()).toBe(0);
  });

  it('re-measures when tabs are added', async () => {
    const strip = makeStrip();
    Object.defineProperty(strip.scroller, 'scrollWidth', { value: 200, configurable: true });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    Object.defineProperty(strip.scroller, 'scrollWidth', { value: 600, configurable: true });
    strip.scroller.querySelector('[role="tablist"]')!.append(document.createElement('div'));
    await Promise.resolve();
    expect(store.getSnapshot()).toBe(2);
  });

  it('scrolls one page of whole tabs per arrow click, as MUI does', () => {
    const strip = makeStrip();
    const list = strip.scroller.querySelector('[role="tablist"]')!;
    for (const width of [80, 90, 100]) {
      const tab = document.createElement('div');
      Object.defineProperty(tab, 'clientWidth', { value: width });
      list.append(tab);
    }
    Object.defineProperty(strip.tab, 'clientWidth', { value: 0, configurable: true });
    const store = createTabStripStore();
    store.scrollPage('right'); // not attached: nothing to scroll
    store.attach(strip.scroller);
    store.scrollPage('right');
    expect(strip.scroller.scrollLeft).toBe(170); // 0 + 80 + 90 fit in 200
    store.scrollPage('left');
    expect(strip.scroller.scrollLeft).toBe(0);
    Object.defineProperty(strip.tab, 'clientWidth', { value: 500, configurable: true });
    store.scrollPage('right'); // a first tab wider than the strip: one strip width
    expect(strip.scroller.scrollLeft).toBe(200);
  });
});

describe('revealSelectedTab', () => {
  it('aligns the end edge of a tab past the end', () => {
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(250, 100); // 50px past the end (300)
    revealSelectedTab(strip.scroller);
    expect(strip.scroller.scrollLeft).toBe(50);
  });

  it('aligns the start edge of a tab past the start, or of a tab wider than the strip', () => {
    const strip = makeStrip();
    strip.scroller.scrollLeft = 100;
    strip.tab.getBoundingClientRect = () => rect(70, 60);
    revealSelectedTab(strip.scroller);
    expect(strip.scroller.scrollLeft).toBe(70);
    strip.tab.getBoundingClientRect = () => rect(120, 300);
    revealSelectedTab(strip.scroller);
    expect(strip.scroller.scrollLeft).toBe(90);
  });

  it('honours scroll-padding like MUI, and leaves a visible tab alone', () => {
    const strip = makeStrip();
    strip.scroller.style.scrollPaddingRight = '10%'; // 20px of 200
    strip.tab.getBoundingClientRect = () => rect(150, 140); // ends at 290 > 280
    revealSelectedTab(strip.scroller);
    expect(strip.scroller.scrollLeft).toBe(10);
    strip.scroller.style.scrollPaddingRight = '';
    strip.tab.getBoundingClientRect = () => rect(150, 100);
    revealSelectedTab(strip.scroller);
    expect(strip.scroller.scrollLeft).toBe(10);
    strip.tab.removeAttribute('aria-selected');
    revealSelectedTab(strip.scroller);
    expect(strip.scroller.scrollLeft).toBe(10);
  });
});

describe('useTabStrip', () => {
  const mount = (strip: Strip, selected: string | null = 'a', count = 1) =>
    renderHook(({ sel, n }) => useTabStrip({ current: strip.root }, sel, n), {
      initialProps: { sel: selected, n: count },
    });

  it('leaves the first render to MUI, then reveals the selected tab when it changes', () => {
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(250, 100);
    const hook = mount(strip);
    expect(strip.scroller.scrollLeft).toBe(0);
    hook.rerender({ sel: 'b', n: 1 });
    expect(strip.scroller.scrollLeft).toBe(50);
    expect(hook.result.current.getSnapshot()).toBe(3);
  });

  it('reveals it again when the strip changes size (an arrow shows), until the user moves it', () => {
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(150, 100);
    const hook = mount(strip);
    hook.rerender({ sel: 'a', n: 2 }); // a tab was added
    strip.scroller.getBoundingClientRect = () => rect(100, 120); // narrowed by an arrow
    act(() => fireResize());
    expect(strip.scroller.scrollLeft).toBe(30);
    strip.root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    strip.scroller.getBoundingClientRect = () => rect(100, 100);
    act(() => fireResize());
    expect(strip.scroller.scrollLeft).toBe(30);
  });

  it('does nothing without a selection or a strip', () => {
    const strip = makeStrip();
    strip.tab.getBoundingClientRect = () => rect(250, 100);
    const hook = mount(strip, null);
    hook.rerender({ sel: null, n: 2 });
    expect(strip.scroller.scrollLeft).toBe(0);
    const empty = renderHook(({ n }) => useTabStrip({ current: null }, 'a', n), {
      initialProps: { n: 1 },
    });
    empty.rerender({ n: 2 });
  });
});

describe('TabStripScrollButton', () => {
  function renderButtons(store: TabStripStore | null) {
    return render(
      <TabStripContext.Provider value={store}>
        <TabStripScrollButton direction="left" orientation="horizontal" aria-label="left" />
        <TabStripScrollButton direction="right" orientation="horizontal" aria-label="right" />
      </TabStripContext.Provider>,
    );
  }

  it('is enabled only toward a side the strip can scroll, and scrolls a page when clicked', () => {
    const strip = makeStrip();
    const store = createTabStripStore();
    store.attach(strip.scroller);
    const scrollPage = vi.spyOn(store, 'scrollPage');
    renderButtons(store);
    expect(screen.getByLabelText('left')).toHaveClass('Mui-disabled');
    expect(screen.getByLabelText('right')).not.toHaveClass('Mui-disabled');
    fireEvent.click(screen.getByLabelText('right'));
    expect(scrollPage).toHaveBeenCalledWith('right');
    strip.scroller.scrollLeft = 800;
    act(() => store.measure());
    expect(screen.getByLabelText('left')).not.toHaveClass('Mui-disabled');
    expect(screen.getByLabelText('right')).toHaveClass('Mui-disabled');
  });

  it('is disabled outside an app bar strip', () => {
    renderButtons(null);
    expect(screen.getByLabelText('left')).toHaveClass('Mui-disabled');
    fireEvent.click(screen.getByLabelText('left'));
  });
});

describe('instantScrollTheme', () => {
  it('turns off MUI animations for the strip only', () => {
    const outer = { palette: {}, motion: { reducedMotion: 'system' } } as unknown as Theme;
    const theme = instantScrollTheme(outer);
    expect(theme.motion.reducedMotion).toBe('always');
    expect(outer.motion.reducedMotion).toBe('system');
  });
});

describe('useScrollButtonCompensation', () => {
  it('keeps the tabs in place when the start arrow shows or hides', () => {
    const strip = makeStrip();
    setWidth(strip.start, 0);
    setWidth(strip.end, 40);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    strip.scroller.scrollLeft = 100;
    setWidth(strip.start, 40);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(140);
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
