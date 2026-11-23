import * as React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useScrollButtonCompensation } from '../../internal/tab-strip/useScrollButtonCompensation.js';
import {
  createTabStripStore,
  selectedTabTarget,
  TabStripContext,
  useTabStrip,
  writeScrollLeft,
  type TabStripStore,
} from '../../internal/tab-strip/tabStrip.js';
import { arrowSx, SCROLL_ARROW_WIDTH, TabStripScrollButton } from '../TabStripScrollButton.js';
import { createTheme, ThemeProvider as MuiThemeProvider, type Theme } from '@mui/material/styles';

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

/**
 * Replaces the strip's tabs with tabs `widths` px wide, laid out from its start (the view's left
 * edge in LTR, its right edge in RTL), and fits the scroll width to them.
 */
function layTabs(strip: Strip, widths: readonly number[], { rtl = false } = {}) {
  const list = strip.scroller.querySelector('[role="tablist"]')!;
  list.replaceChildren();
  let at = 0;
  for (const width of widths) {
    const tab = document.createElement('div');
    tab.setAttribute('role', 'tab');
    const offset = at;
    tab.getBoundingClientRect = () => {
      const { scrollLeft } = strip.scroller;
      return rtl
        ? rect(300 - scrollLeft - offset - width, width)
        : rect(100 - scrollLeft + offset, width);
    };
    list.append(tab);
    at += width;
  }
  Object.defineProperty(strip.scroller, 'scrollWidth', { value: at, configurable: true });
}

/** The other physical direction (RTL tests click the mirror image of the LTR ones). */
const mirror = (direction: 'left' | 'right') => (direction === 'left' ? 'right' : 'left');

function setWidth(el: HTMLElement, width: number) {
  Object.defineProperty(el, 'offsetWidth', { value: width, configurable: true });
  el.style.width = `${width}px`;
}

let observers: { cb: ResizeObserverCallback; targets: Element[] }[] = [];
const fireResize = () => observers.forEach((o) => o.cb([], {} as ResizeObserver));

/** The arrows that show (bit 1: left, bit 2: right). */
const shown = (store: TabStripStore) => store.getSnapshot();

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
    expect(shown(store)).toBe(2); // at the start: only right
    strip.userScroll(400);
    expect(shown(store)).toBe(3);
    strip.userScroll(799.5); // within a pixel of the end counts as the end
    expect(shown(store)).toBe(1);
    expect(listener).toHaveBeenCalledTimes(3);
    store.measure();
    expect(listener).toHaveBeenCalledTimes(3); // no change, no notification
    detach();
    strip.userScroll(0);
    expect(shown(store)).toBe(1);
  });

  it('maps start and end to the physical sides in RTL', () => {
    const strip = makeStrip({ rtl: true });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    expect(shown(store)).toBe(1); // at the start (right): can scroll left only
    strip.userScroll(-800);
    expect(shown(store)).toBe(2);
  });

  it('has no arrows when the tabs fit', () => {
    const strip = makeStrip();
    Object.defineProperty(strip.scroller, 'scrollWidth', { value: 200, configurable: true });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    expect(shown(store)).toBe(0);
  });

  it('re-measures when tabs are added', async () => {
    const strip = makeStrip();
    Object.defineProperty(strip.scroller, 'scrollWidth', { value: 200, configurable: true });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    Object.defineProperty(strip.scroller, 'scrollWidth', { value: 600, configurable: true });
    strip.scroller.querySelector('[role="tablist"]')!.append(document.createElement('div'));
    await Promise.resolve();
    expect(shown(store)).toBe(2);
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
    /** A 200px strip of tabs `widths` px wide (its scroll width fits them). */
    function pagedStrip(widths: readonly number[], options: { rtl?: boolean } = {}) {
      const strip = makeStrip(options);
      layTabs(strip, widths, options);
      return strip;
    }
    // 770px of tabs: [0, 80], [80, 170], [170, 270], then 100px each (max 570).
    const WHOLE_TABS = [80, 90, 100, 100, 100, 100, 100, 100];

    /** Pages at once, one click per direction given, and returns where each click left the strip. */
    function pageThrough(strip: Strip, clicks: readonly ('left' | 'right')[]) {
      const store = createTabStripStore();
      store.attach(strip.scroller);
      store.setDuration(0);
      return clicks.map((direction) => {
        store.scrollPage(direction);
        return strip.scroller.scrollLeft;
      });
    }

    it("slides a page of whole tabs with MUI's duration and easing", () => {
      const strip = pagedStrip(WHOLE_TABS);
      const store = createTabStripStore();
      store.scrollPage('right'); // not attached: nothing to scroll
      store.attach(strip.scroller);
      store.scrollPage('right'); // the tab across the right edge moves to the left edge
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
      const strip = pagedStrip(WHOLE_TABS);
      const store = createTabStripStore();
      store.attach(strip.scroller);
      store.scrollPage('right');
      runFrame(0);
      runFrame(150);
      store.scrollPage('right'); // from 170: the view [170, 370] ends on a tab edge
      runFrame(1000);
      expect(strip.scroller.scrollLeft).toBe(85); // carries on from where it is
      runFrame(1300);
      expect(strip.scroller.scrollLeft).toBe(370);
    });

    it('pages from where the strip is, a tab cut off by a sliver counting as shown', () => {
      // Home and a first tab 3px too wide for the strip together: MUI paged by Home's 48px.
      // Tabs: [0, 48], [48, 203], [203, 413], [413, 583], [583, 753] (max 553).
      const widths = [48, 155, 210, 170, 170];
      const clicks = ['right', 'right', 'right', 'left', 'left', 'left'] as const;
      // Right: past [48, 203] and [203, 413] (cut off by 3 and 10px), then [583, 753] (cut off by
      // 140px) to the left edge, which is within a sliver of the end: to the end. Left: the mirror
      // image, and from 3px, the start.
      expect(pageThrough(pagedStrip(widths), clicks)).toEqual([203, 413, 553, 383, 213, 0]);
      expect(pageThrough(pagedStrip(widths, { rtl: true }), clicks.map(mirror))).toEqual([
        -203, -413, -553, -383, -213, 0,
      ]);
    });

    it('moves one strip width at a time across a tab nearly as wide as the strip, or wider', () => {
      // Tabs: [0, 48], [48, 468], [468, 568], [568, 668] (max 468).
      const widths = [48, 420, 100, 100];
      const clicks = ['right', 'right', 'right', 'left', 'left', 'left'] as const;
      // Right: [48, 468] to the left edge would only be a 48px step: a strip width, twice; then
      // [568, 668] to the left edge (past the end). Left: the wide tab's end to the right edge, a
      // strip width, then its start is in view but for 20px: the start.
      expect(pageThrough(pagedStrip(widths), clicks)).toEqual([200, 400, 468, 268, 68, 0]);
      expect(pageThrough(pagedStrip(widths, { rtl: true }), clicks.map(mirror))).toEqual([
        -200, -400, -468, -268, -68, 0,
      ]);
    });

    it('follows its tab when an arrow narrows the strip on the way', () => {
      const strip = pagedStrip([100, 100, 100, 100, 100, 100, 100, 100, 100, 100]);
      writeScrollLeft(strip.scroller, 800); // at the end
      const store = createTabStripStore();
      store.attach(strip.scroller);
      store.scrollPage('left'); // [700, 800] to the right edge: to 600
      runFrame(0);
      // The end arrow shows: the strip is 48px narrower.
      Object.defineProperty(strip.scroller, 'clientWidth', { value: 152, configurable: true });
      strip.scroller.getBoundingClientRect = () => rect(100, 152);
      runFrame(300);
      expect(strip.scroller.scrollLeft).toBe(648); // [700, 800] still ends at the right edge
    });

    it('jumps with no duration or reduced motion, and stays within the scroll range', () => {
      const strip = pagedStrip(WHOLE_TABS);
      const store = createTabStripStore();
      store.attach(strip.scroller);
      store.setDuration(0);
      store.scrollPage('left'); // already at the start
      expect(store.isSliding()).toBe(false);
      store.scrollPage('right');
      expect(strip.scroller.scrollLeft).toBe(170);
      store.setDuration(300);
      vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
      store.scrollPage('right');
      expect(strip.scroller.scrollLeft).toBe(370);
      for (let i = 0; i < 3; i += 1) store.scrollPage('right');
      expect(strip.scroller.scrollLeft).toBe(570);
    });

    it('shows the arrows for where a slide is going, so they change along with it', () => {
      const strip = pagedStrip([80, 90, 130]); // max 100
      const store = createTabStripStore();
      store.attach(strip.scroller);
      expect(shown(store)).toBe(2);
      store.scrollPage('right'); // to the end
      expect(shown(store)).toBe(1); // at once: start arrow on, end arrow off
      runFrame(0);
      runFrame(150);
      expect(shown(store)).toBe(1);
      runFrame(300);
      expect(strip.scroller.scrollLeft).toBe(100);
      expect(shown(store)).toBe(1);
      store.scrollPage('left'); // to the start
      expect(shown(store)).toBe(2);
      runFrame(1000);
      runFrame(1150);
      store.stop(); // stopped half way: the arrows follow where it is
      expect(strip.scroller.scrollLeft).toBe(50);
      expect(shown(store)).toBe(3);
      expect(store.isSliding()).toBe(false);
    });

    it('stops when asked', () => {
      const strip = pagedStrip(WHOLE_TABS);
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

describe('shift', () => {
  function slidingStrip({ rtl = false } = {}) {
    const strip = makeStrip({ rtl });
    layTabs(strip, Array<number>(10).fill(100), { rtl });
    const store = createTabStripStore();
    store.attach(strip.scroller);
    return { strip, store };
  }

  it('moves a strip at rest toward its end', () => {
    const { strip, store } = slidingStrip();
    store.shift(0);
    store.shift(30);
    expect(strip.scroller.scrollLeft).toBe(30);
    createTabStripStore().shift(10); // not attached
  });

  it('keeps a slide on course from where it put the strip, in LTR and RTL', () => {
    for (const rtl of [false, true]) {
      const { strip, store } = slidingStrip({ rtl });
      writeScrollLeft(strip.scroller, rtl ? -400 : 400);
      store.scrollPage(rtl ? 'right' : 'left'); // a page toward the start: to 200
      runFrame(0);
      runFrame(150); // half way: 300
      expect(Math.abs(strip.scroller.scrollLeft)).toBe(300);
      strip.userScroll(rtl ? -290 : 290); // the browser clamped it to a smaller range
      store.shift(-48); // the start arrow went: the tabs keep their place
      expect(Math.abs(strip.scroller.scrollLeft)).toBe(252);
      runFrame(300);
      expect(Math.abs(strip.scroller.scrollLeft)).toBe(200);
      store.stop();
    }
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
    expect(shown(hook.result.current)).toBe(3);
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
    const scrollPage = vi.spyOn(store, 'scrollPage').mockImplementation(() => {});
    renderButtons(store);
    expect(screen.getByLabelText('left')).toHaveClass('Mui-disabled');
    expect(screen.getByLabelText('right')).not.toHaveClass('Mui-disabled');
    fireEvent.click(screen.getByLabelText('right'));
    expect(scrollPage).toHaveBeenCalledWith('right');
    act(() => strip.userScroll(800));
    expect(screen.getByLabelText('left')).not.toHaveClass('Mui-disabled');
    expect(screen.getByLabelText('right')).toHaveClass('Mui-disabled');
  });

  it('is a cell as wide as the Home tab while shown, and takes no room while hidden', () => {
    const strip = makeStrip();
    const store = createTabStripStore();
    store.attach(strip.scroller);
    renderButtons(store);
    expect(SCROLL_ARROW_WIDTH).toBe(48);
    expect(screen.getByLabelText('right')).toHaveStyle({ width: '48px' });
    expect(screen.getByLabelText('left')).toHaveStyle({ width: '0px' });
  });

  it('animates showing and hiding only after the first paint', () => {
    const strip = makeStrip();
    const store = createTabStripStore();
    store.attach(strip.scroller);
    const getDuration = vi.spyOn(store, 'getDuration');
    renderButtons(store);
    expect(getDuration).not.toHaveBeenCalled(); // first state at once
    act(() => runFrame(0));
    expect(getDuration).toHaveBeenCalled();
  });

  it('draws a divider toward the tabs, grows in over the slide duration and goes at once', () => {
    const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
    expect(arrowSx(true, true, 300)).toMatchObject({
      width: 48,
      borderRight: expect.stringContaining('1px solid'),
      transition: `width 300ms ${ease}, opacity 300ms ${ease}`,
    });
    expect(arrowSx(true, false, 0)).toMatchObject({
      borderLeft: expect.stringContaining('1px solid'),
      transition: 'none',
    });
    expect(arrowSx(false, true, 300)).toMatchObject({
      width: 0,
      borderRight: 'none',
      transition: 'none',
    });
  });

  it('puts the divider on the tabs side, in LTR and RTL', () => {
    /** The divider side in the arrow's own (unflipped) rule. */
    const dividerSide = (el: HTMLElement) => {
      const css = Array.from(document.querySelectorAll('style'))
        .map((style) => style.textContent)
        .join('');
      const own = Array.from(el.classList).find(
        (c) => css.includes(`.${c}{`) && c.startsWith('css-'),
      );
      const rule = css.slice(css.indexOf(`.${own}{`)).split('}')[0];
      return /border-right:1px/.test(rule) ? 'right' : /border-left:1px/.test(rule) ? 'left' : null;
    };
    for (const rtl of [false, true]) {
      const strip = makeStrip({ rtl });
      const store = createTabStripStore();
      store.attach(strip.scroller);
      strip.userScroll(rtl ? -400 : 400); // both arrows on
      const view = render(
        <MuiThemeProvider theme={createTheme({ direction: rtl ? 'rtl' : 'ltr' })}>
          <TabStripContext.Provider value={store}>
            <TabStripScrollButton direction="left" orientation="horizontal" aria-label="left" />
            <TabStripScrollButton direction="right" orientation="horizontal" aria-label="right" />
          </TabStripContext.Provider>
        </MuiThemeProvider>,
      );
      // Written for LTR: the start arrow's divider is on its right, the end arrow's on its left.
      // In RTL the start arrow is the physical right one, and the RTL style cache mirrors the rule.
      expect(dividerSide(screen.getByLabelText(rtl ? 'right' : 'left'))).toBe('right');
      expect(dividerSide(screen.getByLabelText(rtl ? 'left' : 'right'))).toBe('left');
      view.unmount();
    }
  });

  it('hides an arrow at once when a click slides the strip to its end', () => {
    const strip = makeStrip();
    layTabs(strip, [120, 180]); // max 100
    const store = createTabStripStore();
    store.attach(strip.scroller);
    renderButtons(store);
    fireEvent.click(screen.getByLabelText('right')); // slides to the end
    expect(screen.getByLabelText('right')).toHaveClass('Mui-disabled');
    expect(screen.getByLabelText('right')).toHaveStyle({ width: '0px' });
    expect(screen.getByLabelText('left')).not.toHaveClass('Mui-disabled');
  });

  it('is disabled outside an app bar strip', () => {
    renderButtons(null);
    expect(screen.getByLabelText('left')).toHaveClass('Mui-disabled');
    fireEvent.click(screen.getByLabelText('left'));
  });
});

describe('useTabStrip motion', () => {
  it("jumps when the app's theme always reduces motion", () => {
    const strip = makeStrip();
    strip.placeTab(50, 100);
    const theme = {
      motion: { reducedMotion: 'always' },
      transitions: { duration: { standard: 300 } },
    };
    const hook = renderHook(({ sel }) => useTabStrip({ current: strip.root }, sel, 1), {
      initialProps: { sel: 'a' },
      wrapper: ({ children }) => (
        <MuiThemeProvider theme={(outer: Theme) => ({ ...outer, ...theme }) as Theme}>
          {children}
        </MuiThemeProvider>
      ),
    });
    expect(hook.result.current.getDuration()).toBe(0);
    strip.placeTab(350, 100);
    hook.rerender({ sel: 'b' });
    expect(strip.scroller.scrollLeft).toBe(250);
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

  it('folds the start arrow into a slide in progress, and leaves the end to it', () => {
    const strip = makeStrip();
    setWidth(strip.start, 48);
    setWidth(strip.end, 0);
    const shift = vi.fn();
    const sliding = { isSliding: () => true, shift };
    renderHook(() => useScrollButtonCompensation({ current: strip.root }, sliding));
    strip.userScroll(790);
    setWidth(strip.start, 0); // hides as a slide to the start begins
    setWidth(strip.end, 48);
    fireResize();
    expect(shift).toHaveBeenCalledWith(-48);
    expect(strip.scroller.scrollLeft).toBe(790); // no snap to the end
  });

  it('does nothing without the scroll arrows', () => {
    const strip = makeStrip();
    strip.start.remove();
    strip.end.remove();
    renderHook(() => useScrollButtonCompensation({ current: strip.root }));
    expect(observers).toHaveLength(0);
  });
});
