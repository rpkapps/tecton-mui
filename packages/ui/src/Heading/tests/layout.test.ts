import {
  allocateHeading,
  type ActionsMeasure,
  type HeadingMeasure,
  type TabsMeasure,
} from '../layout.js';

// A heading like the canonical Storybook one: a 160px title cluster, seven 90px tabs and six
// actions, the last one the primary button. The tab group: 12 + 7 * 90 + 6 * 2 = 654 with every tab
// in view; at narrowest, the selected tab between two arrows: 12 + 90 + 2 * (32 + 2) = 170.
const tabs: TabsMeasure = { natural: 654, min: 170 };
const actions: ActionsMeasure = {
  items: [40, 1, 120, 120, 70, 140],
  separators: [false, true, false, false, false, false],
  pinned: [false, false, false, false, false, false],
  late: [false, false, false, false, false, false],
  gap: 16,
  overflow: 40,
};
// 160 + 32 + (12 + 7 * 90 + 6 * 2) + 32 + (491 + 5 * 16) = 1449
const FULL = 1449;
const measure = (available: number, patch: Partial<HeadingMeasure> = {}): HeadingMeasure => ({
  available,
  gap: 32,
  title: 160,
  tabs,
  actions,
  ...patch,
});

describe('allocateHeading', () => {
  it('shows everything when it fits', () => {
    expect(allocateHeading(measure(FULL))).toEqual({
      measuring: false,
      compact: false,
      tabs: true,
      actions: 0,
    });
  });

  it('collapses the actions first, the first ones first, and keeps the last one', () => {
    // The search button goes, and the separator after it with it: 41 + 16 - 56 (⋮) = 1px saved.
    expect(allocateHeading(measure(FULL - 1))).toMatchObject({ actions: 1 });
    expect(allocateHeading(measure(FULL - 130))).toMatchObject({ actions: 2 });
    // ⋮ + primary: 40 + 16 + 140 = 196; row: 160 + 32 + 654 + 32 + 196 = 1074.
    expect(allocateHeading(measure(1074))).toMatchObject({ compact: false, actions: 4 });
  });

  it('then narrows the tabs, which scroll, down to the selected tab between two arrows', () => {
    // Narrower than 1074: the tabs take what is left, down to 160 + 32 + 170 + 32 + 196 = 590.
    expect(allocateHeading(measure(1073))).toMatchObject({ compact: false, actions: 4 });
    expect(allocateHeading(measure(590))).toMatchObject({ compact: false, actions: 4 });
  });

  it('then collapses the last action too', () => {
    // ⋮ alone: 160 + 32 + 170 + 32 + 40 = 434.
    expect(allocateHeading(measure(589))).toMatchObject({ compact: false, actions: 5 });
    expect(allocateHeading(measure(434))).toMatchObject({ compact: false, actions: 5 });
  });

  it('turns compact when even that does not fit: the tabs get a row of their own', () => {
    // The first row: title + ⋮ + primary (388) fits in 433.
    expect(allocateHeading(measure(433))).toEqual({
      measuring: false,
      compact: true,
      tabs: true,
      actions: 4,
    });
    // Title + ⋮ only (the title shortens below that).
    expect(allocateHeading(measure(300))).toMatchObject({ compact: true, actions: 5 });
    expect(allocateHeading(measure(150))).toMatchObject({ compact: true, actions: 5 });
  });

  it('keeps one row without tabs, collapsing the actions', () => {
    const noTabs = (available: number) => allocateHeading(measure(available, { tabs: null }));
    // 160 + 32 + 571 = 763
    expect(noTabs(763)).toMatchObject({ compact: false, tabs: false, actions: 0 });
    expect(noTabs(700)).toMatchObject({ compact: false, actions: 2 });
    // Not even the title and ⋮: everything collapses, the title shortens.
    expect(noTabs(100)).toMatchObject({ compact: false, actions: 5 });
  });

  it('works with any part missing', () => {
    expect(allocateHeading(measure(100, { tabs: null, actions: null }))).toMatchObject({
      compact: false,
      tabs: false,
    });
    // Tabs alone narrow in their one row.
    expect(allocateHeading(measure(300, { title: null, actions: null }))).toMatchObject({
      compact: false,
      tabs: true,
    });
    expect(allocateHeading(measure(200, { title: null, tabs: null }))).toMatchObject({
      actions: 4,
    });
  });
});
