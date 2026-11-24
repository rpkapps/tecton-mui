import { foldOrder } from '../../internal/overflow/collapse.js';
import {
  allocateHeading,
  tabsWidth,
  type ActionsMeasure,
  type HeadingMeasure,
  type TabsMeasure,
} from '../layout.js';

// The drop-in heading's "All parts" row (wc-heading 1.0.0): a 165px title cluster, seven tabs, and
// search, filter, |, View, Sort, |, the view toggle, |, Publish and Create Project.
const tabs: TabsMeasure = {
  items: [80, 70, 55, 65, 90, 80, 80],
  gap: 8,
  padding: 12,
  more: 70,
};
const kinds = [
  'icon',
  'icon',
  'separator',
  'select',
  'select',
  'separator',
  'toggle',
  'separator',
  'button',
  'primary',
] as const;
const actions: ActionsMeasure = {
  items: [32, 32, 1, 152, 152, 1, 130, 1, 70, 120],
  separators: kinds.map((kind) => kind === 'separator'),
  pinned: kinds.map(() => false),
  late: kinds.map(() => false),
  order: foldOrder([...kinds]),
  gap: 16,
  overflow: 32,
};

const measure = (available: number, overrides: Partial<HeadingMeasure> = {}): HeadingMeasure => ({
  available,
  tabsGap: 32,
  actionsGap: 32,
  narrow: false,
  title: 165,
  tabs,
  actions,
  ...overrides,
});

// Every tab: 12 + 520 + 6 * 8 = 580. Every action: 691 + 9 * 16 = 835.
const FULL = 165 + 32 + 580 + 32 + 835;

describe('foldOrder', () => {
  it('folds the buttons, then the toggles, the selects, the icon buttons from the end; never the primary', () => {
    expect(foldOrder([...kinds])).toEqual([8, 6, 3, 4, 1, 0]);
    expect(foldOrder(['search', 'icon', 'button', 'primary'])).toEqual([2, 1, 0]);
    // Without a primary action, every action folds.
    expect(foldOrder(['icon', 'toggle'])).toEqual([1, 0]);
  });
});

describe('tabsWidth', () => {
  it('is the group padding, the tabs that show, the More tab and the gaps between them', () => {
    expect(tabsWidth(tabs, 7)).toBe(580);
    // Four tabs and More: 12 + 270 + 70 + 4 * 8.
    expect(tabsWidth(tabs, 4)).toBe(384);
    // The More tab alone.
    expect(tabsWidth(tabs, 0)).toBe(82);
  });
});

describe('allocateHeading', () => {
  it('shows everything when it fits', () => {
    expect(allocateHeading(measure(FULL))).toEqual({
      measuring: false,
      compact: false,
      tabs: 7,
      actions: 0,
    });
  });

  it('folds the actions in fold order first, with every tab in view', () => {
    // Publish goes (and ⋮ comes): 835 - 70 - 16 + 32 + 16 = 797.
    expect(allocateHeading(measure(FULL - 1))).toMatchObject({ tabs: 7, actions: 1 });
    expect(allocateHeading(measure(FULL - 38))).toMatchObject({ tabs: 7, actions: 1 });
    // Then the view toggle (and the divider after it).
    expect(allocateHeading(measure(FULL - 39))).toMatchObject({ tabs: 7, actions: 2 });
  });

  it('then folds the last tabs into the More tab, down to the More tab alone', () => {
    // Every action but the primary folded: ⋮ + Create Project = 32 + 16 + 120 = 168.
    const row = (shown: number) => 165 + 32 + tabsWidth(tabs, shown) + 32 + 168;
    expect(allocateHeading(measure(row(7)))).toMatchObject({ tabs: 7, actions: 6 });
    expect(allocateHeading(measure(row(7) - 1))).toMatchObject({ tabs: 6, actions: 6 });
    expect(allocateHeading(measure(row(4)))).toMatchObject({ tabs: 4, actions: 6 });
    expect(allocateHeading(measure(row(0)))).toMatchObject({ tabs: 0, actions: 6 });
    // Narrower still: the title shortens; the primary action never folds.
    expect(allocateHeading(measure(200))).toEqual({
      measuring: false,
      compact: false,
      tabs: 0,
      actions: 6,
    });
  });

  it('keeps the tabs out of the row when narrow, and folds the actions with the narrow gap', () => {
    const narrow = { narrow: true, actionsGap: 16 };
    // Title + 16 + every action.
    expect(allocateHeading(measure(165 + 16 + 835, narrow))).toEqual({
      measuring: false,
      compact: true,
      tabs: 0,
      actions: 0,
    });
    expect(allocateHeading(measure(165 + 16 + 835 - 1, narrow))).toMatchObject({
      compact: true,
      actions: 1,
    });
  });

  it('works with any part missing', () => {
    expect(allocateHeading(measure(400, { tabs: null }))).toMatchObject({ tabs: 0 });
    // 165 + 32 + one tab and More (170) fits in 400; two tabs and More (248) do not.
    expect(allocateHeading(measure(400, { actions: null }))).toMatchObject({
      tabs: 1,
      actions: 0,
    });
    expect(allocateHeading(measure(100, { title: null, tabs: null, actions: null }))).toEqual({
      measuring: false,
      compact: false,
      tabs: 0,
      actions: 0,
    });
  });
});
