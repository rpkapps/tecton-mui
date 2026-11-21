import * as React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useScrollButtonCompensation } from '../useScrollButtonCompensation.js';
import {
  createTabStripStore,
  instantScrollTheme,
  SCROLL_ARROW_WIDTH,
  selectedTabTarget,
  TabStripContext,
  TabStripScrollButton,
  useTabStrip,
  writeScrollLeft,
  type TabStripStore,
} from '../tabStrip.js';
import type { Theme } from '@mui/material/styles';

// jsdom has no layout: the tests give the strip its geometry by hand. The scroller is 200px wide at
// x = 100 (its view is [100, 300]) and scrolls over 1000px (max 800).

interface Strip {
  root: HTMLDivElement;
  scroller: HTMLDivElement;
  start: HTMLDivElement;
  end: HTMLDivElement;
  tab: HTMLDivElement;
  /** Scrolls as the user would (the native position, not through the `scrollLeft` setter). */
  userScroll: (value: number) => void;
  /** Places the selected tab `offset` px into the scrolled content. */
  placeTab: (offset: number, width: number) => void;
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
  // Like the browser's own accessor (an own property here, so that jsdom gets a scroll position).
  Object.defineProperty(scroller, 'scrollLeft', {
    configurable: true,
    get: () => scrollLeft,
    set: (v: number) => {
      scrollLeft = v;
    },
  });
  Object.defineProperty(scroller, 'scrollWidth', { value: 1000, configurable: true });
  Object.defineProperty(scroller, 'clientWidth', { value: 200, configurable: true });
  scroller.getBoundingClientRect = () => rect(100, 200);
  let tabOffset = 0;
  let tabWidth = 100;
  tab.getBoundingClientRect = () => rect(100 + tabOffset - scrollLeft, tabWidth);
  return {
    root,
    scroller,
    start,
    end,
    tab,
    userScroll: (value) => {
      scrollLeft = value;
      scroller.dispatchEvent(new Event('scroll'));
    },
    placeTab: (offset, width) => {
      tabOffset = offset;
      tabWidth = width;
    },
  };
}

function setWidth(el: HTMLElement, width: number) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  el.style.width = `${width}px`;
}

let observers: { cb: ResizeObserverCallback; targets: Element[] }[] = [];
const fireResize = () => observers.forEach((o) => o.cb([], {} as ResizeObserver));

let frames = new Map<number, FrameRequestCallback>();
/** Runs the animation frames requested so far, at time `now`. */
const runFrame = (now: number) => {
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((cb) => cb(now));
};

beforeEach(() => {
  observers = [];
  frames = new Map();
  let nextFrame = 1;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextFrame;
    nextFrame += 1;
    frames.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
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
    const strip = makeStrip();
    const store = createTabStripStore();
    const listener = vi.fn();
    store.subscribe(listener);
    const detach = store.attach(strip.scroller);
    expect(store.getSnapshot()).toBe(2); // at the start: only right
    strip.userScroll(400);
    expect(store.getSnapshot()).toBe(3);
    strip.userScroll(799.5); // within a pixel of the end counts as the end
    expect(store.getSnapshot()).toBe(1);
    expect(listener).toHaveBeenCalledTimes(3);
    store.measure();
    expect(listener).toHaveBeenCalledTimes(3); // no change, no notification
    detach();
    strip.userScroll(0);
    expect(store.getSnapshot()).toBe(1);
  });

  it('maps start and end to the physical sides in RTL', () => {
    const strip = makeStrip({ rtl: true });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    expect(store.getSnapshot()).toBe(1); // at the start (right): can scroll left only
    strip.userScroll(-800);
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

  it("ignores MUI's writes to the scroll position while attached", () => {
    const strip = makeStrip();
    const store = createTabStripStore();
    const detach = store.attach(strip.scroller);
    strip.scroller.scrollLeft = 300; // MUI's scroll-into-view
    expect(strip.scroller.scrollLeft).toBe(0);
    writeScrollLeft(strip.scroller, 120); // the strip's own writes
    expect(strip.scroller.scrollLeft).toBe(120);
    detach();
    strip.scroller.scrollLeft = 300;
    expect(strip.scroller.scrollLeft).toBe(300);
  });

  it('leaves a scroller whose position cannot be guarded writable', () => {
    const scroller = document.createElement('div');
    let value = 0;
    Object.defineProperty(scroller, 'scrollLeft', {
      get: () => value,
      set: (v: number) => {
        value = v;
      },
    });
    const detach = createTabStripStore().attach(scroller);
    scroller.scrollLeft = 30;
    expect(scroller.scrollLeft).toBe(30);
    detach();
  });

  describe('scrollPage', () => {
    function pagedStrip() {
      const strip = makeStrip();
      const list = strip.scroller.querySelector('[role="tablist"]')!;
      for (const width of [80, 90, 100]) {
        const tab = document.createElement('div');
        Object.defineProperty(tab, 'clientWidth', { value: width });
        list.append(tab);
      }
      Object.defineProperty(strip.tab, 'clientWidth', { value: 0, configurable: true });
      return strip;
    }

    it("slides one page of whole tabs with MUI's duration and easing", () => {
      const strip = pagedStrip();
      const store = createTabStripStore();
      store.scrollPage('right'); // not attached: nothing to scroll
      store.attach(strip.scroller);
      store.scrollPage('right'); // 0 + 80 + 90 fit in 200
      expect(store.isSliding()).toBe(true);
      expect(strip.scroller.scrollLeft).toBe(0);
      runFrame(1000);
      expect(strip.scroller.scrollLeft).toBe(0);
      runFrame(1150); // half way, half the distance (ease-in-out)
      expect(strip.scroller.scrollLeft).toBe(85);
      runFrame(1300);
      expect(strip.scroller.scrollLeft).toBe(170);
      expect(store.isSliding()).toBe(false);
      expect(frames.size).toBe(0);
    });

    it('pages on from where a slide in progress is going', () => {
      const strip = pagedStrip();
      const store = createTabStripStore();
      store.attach(strip.scroller);
      store.scrollPage('right');
      runFrame(0);
      runFrame(150);
      store.scrollPage('right');
      runFrame(1000);
      expect(strip.scroller.scrollLeft).toBe(85); // carries on from where it is
      runFrame(1300);
      expect(strip.scroller.scrollLeft).toBe(340);
    });

    it('jumps with no duration or reduced motion, and stays within the scroll range', () => {
      const strip = pagedStrip();
      const store = createTabStripStore();
      store.attach(strip.scroller);
      store.setDuration(0);
      store.scrollPage('left'); // already at the start
      expect(store.isSliding()).toBe(false);
      store.scrollPage('right');
      expect(strip.scroller.scrollLeft).toBe(170);
      Object.defineProperty(strip.tab, 'clientWidth', { value: 500, configurable: true });
      store.setDuration(300);
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
      store.scrollPage('right'); // a first tab wider than the strip: one strip width
      expect(strip.scroller.scrollLeft).toBe(370);
      for (let i = 0; i < 4; i += 1) store.scrollPage('right');
      expect(strip.scroller.scrollLeft).toBe(800);
    });

    it('stops when asked', () => {
      const strip = pagedStrip();
      const store = createTabStripStore();
      store.attach(strip.scroller);
      store.scrollPage('right');
      store.stop();
      runFrame(5000);
      expect(strip.scroller.scrollLeft).toBe(0);
      expect(store.isSliding()).toBe(false);
    });
  });

  describe('revealSelected', () => {
    it('jumps with `instant`, else slides to a target that follows the strip', () => {
      const strip = makeStrip();
      const store = createTabStripStore();
      store.revealSelected(); // not attached
      store.attach(strip.scroller);
      strip.placeTab(150, 100); // 50px past the end
      store.revealSelected(true);
      expect(strip.scroller.scrollLeft).toBe(50);
      strip.placeTab(350, 100); // a tab added further on
      store.revealSelected();
      runFrame(0);
      runFrame(150);
      expect(strip.scroller.scrollLeft).toBe(150); // half way to 250
      // The strip narrows on the way (an arrow shows): the slide still ends on the tab.
      Object.defineProperty(strip.scroller, 'clientWidth', { value: 150, configurable: true });
      strip.scroller.getBoundingClientRect = () => rect(100, 150);
      runFrame(300);
      expect(strip.scroller.scrollLeft).toBe(300);
    });

    it('stops when the selected tab goes away mid-slide, and leaves a visible tab alone', () => {
      const strip = makeStrip();
      const store = createTabStripStore();
      store.attach(strip.scroller);
      strip.placeTab(50, 100);
      store.revealSelected();
      expect(store.isSliding()).toBe(false);
      strip.placeTab(400, 100);
      store.revealSelected();
      runFrame(0);
      strip.tab.removeAttribute('aria-selected');
      runFrame(150);
      expect(store.isSliding()).toBe(false);
      expect(strip.scroller.scrollLeft).toBe(0);
    });
  });
});

describe('selectedTabTarget', () => {
  it('aligns the end edge of a tab past the end', () => {
    const strip = makeStrip();
    strip.placeTab(150, 100); // ends at 350, view ends at 300
    expect(selectedTabTarget(strip.scroller)).toBe(50);
  });

  it('aligns the start edge of a tab past the start, or of a tab wider than the strip', () => {
    const strip = makeStrip();
    strip.userScroll(100);
    strip.placeTab(70, 60);
    expect(selectedTabTarget(strip.scroller)).toBe(70);
    strip.placeTab(120, 300);
    expect(selectedTabTarget(strip.scroller)).toBe(120);
  });

  it('honours scroll-padding like MUI, and leaves a visible tab where it is', () => {
    const strip = makeStrip();
    strip.scroller.style.scrollPaddingRight = '10%'; // 20px of 200
    strip.placeTab(50, 140); // ends at 290 > 280
    expect(selectedTabTarget(strip.scroller)).toBe(10);
    strip.scroller.style.scrollPaddingRight = '';
    strip.userScroll(10);
    strip.placeTab(50, 100);
    expect(selectedTabTarget(strip.scroller)).toBe(10);
  });

  it('has no target without a selected tab or while the strip has no width', () => {
    const strip = makeStrip();
    strip.placeTab(250, 100);
    Object.defineProperty(strip.scroller, 'clientWidth', { value: 0, configurable: true });
    expect(selectedTabTarget(strip.scroller)).toBeNull();
    Object.defineProperty(strip.scroller, 'clientWidth', { value: 200, configurable: true });
    strip.tab.removeAttribute('aria-selected');
    expect(selectedTabTarget(strip.scroller)).toBeNull();
  });
});

describe('useTabStrip', () => {
  const mount = (strip: Strip, selected: string | null = 'a', count = 1) =>
    renderHook(({ sel, n }) => useTabStrip({ current: strip.root }, sel, n), {
      initialProps: { sel: selected, n: count },
    });

  it('shows the selected tab at once on the first render, then slides to it when it changes', () => {
    const strip = makeStrip();
    strip.placeTab(150, 100);
    const hook = mount(strip);
    expect(strip.scroller.scrollLeft).toBe(50);
    expect(hook.result.current.getSnapshot()).toBe(3);
    strip.placeTab(350, 100);
    hook.rerender({ sel: 'b', n: 1 });
    expect(strip.scroller.scrollLeft).toBe(50);
    expect(hook.result.current.isSliding()).toBe(true);
    runFrame(0);
    runFrame(300); // the default theme's standard duration
    expect(strip.scroller.scrollLeft).toBe(250);
    expect(hook.result.current.isSliding()).toBe(false);
  });

  it('follows the strip as it changes size (an arrow shows), until the user moves it', () => {
    const strip = makeStrip();
    strip.placeTab(50, 100);
    const hook = mount(strip);
    hook.rerender({ sel: 'a', n: 2 }); // a tab was added
    Object.defineProperty(strip.scroller, 'clientWidth', { value: 120, configurable: true });
    strip.scroller.getBoundingClientRect = () => rect(100, 120); // narrowed by an arrow
    act(() => fireResize());
    act(() => runFrame(0));
    act(() => runFrame(300));
    expect(strip.scroller.scrollLeft).toBe(30);
    strip.root.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    strip.scroller.getBoundingClientRect = () => rect(100, 100);
    act(() => fireResize());
    expect(frames.size).toBe(0);
    expect(strip.scroller.scrollLeft).toBe(30);
  });

  it('stops a slide when the user takes over', () => {
    const strip = makeStrip();
    const hook = mount(strip);
    strip.placeTab(350, 100);
    hook.rerender({ sel: 'b', n: 1 });
    runFrame(0);
    runFrame(150);
    strip.root.dispatchEvent(new Event('wheel', { bubbles: true }));
    runFrame(300);
    expect(strip.scroller.scrollLeft).toBe(125);
    expect(hook.result.current.isSliding()).toBe(false);
  });

  it('does nothing without a selection or a strip', () => {
    const strip = makeStrip();
    strip.placeTab(250, 100);
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
    act(() => strip.userScroll(800));
    expect(screen.getByLabelText('left')).not.toHaveClass('Mui-disabled');
    expect(screen.getByLabelText('right')).toHaveClass('Mui-disabled');
  });

  it('is as wide as the Home tab', () => {
    renderButtons(createTabStripStore());
    expect(SCROLL_ARROW_WIDTH).toBe(48);
    expect(screen.getByLabelText('right')).toHaveStyle({ width: '48px' });
  });

  it('is disabled outside an app bar strip', () => {
    renderButtons(null);
    expect(screen.getByLabelText('left')).toHaveClass('Mui-disabled');
    fireEvent.click(screen.getByLabelText('left'));
  });
});

describe('instantScrollTheme', () => {
  it("turns off MUI's own scroll animation for the strip only", () => {
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
    setWidth(strip.end, 48);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    strip.userScroll(100);
    setWidth(strip.start, 48);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(148);
  });

  it('keeps the strip at its end when the end arrow appears there', () => {
    const strip = makeStrip();
    setWidth(strip.start, 48);
    setWidth(strip.end, 0);
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    strip.userScroll(790); // max is 800
    setWidth(strip.end, 48);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(800);
  });

  it('leaves the strip to a slide in progress', () => {
    const strip = makeStrip();
    setWidth(strip.start, 0);
    setWidth(strip.end, 48);
    const isSliding = () => true;
    renderHook(() => useScrollButtonCompensation({ current: strip.root }, isSliding));
    strip.userScroll(100);
    setWidth(strip.start, 48);
    fireResize();
    expect(strip.scroller.scrollLeft).toBe(100);
  });

  it('does nothing without the scroll arrows', () => {
    const strip = makeStrip();
    strip.start.remove();
    strip.end.remove();
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    expect(observers).toHaveLength(0);
  });
});
