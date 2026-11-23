import {
  allocateHeading,
  hiddenActionCount,
  visibleTabIndices,
  type ActionsMeasure,
  type HeadingMeasure,
  type TabsMeasure,
} from '../layout.js';

// A heading like the canonical Storybook one: a 160px title cluster, seven 90px tabs and six
// actions, the last one the primary button.
const tabs: TabsMeasure = {
  items: [90, 90, 90, 90, 90, 90, 90],
  gap: 2,
  padding: 12,
  more: 80,
  pinned: 0,
};
const actions: ActionsMeasure = {
  items: [40, 1, 120, 120, 70, 140],
  separators: [false, true, false, false, false, false],
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

describe('visibleTabIndices', () => {
  it('shows the first tabs, with the selected one in place of the last when further along', () => {
    expect(visibleTabIndices(5, 5, 4)).toEqual([0, 1, 2, 3, 4]);
    expect(visibleTabIndices(5, 9, 4)).toEqual([0, 1, 2, 3, 4]);
    expect(visibleTabIndices(5, 3, 1)).toEqual([0, 1, 2]);
    expect(visibleTabIndices(5, 3, 4)).toEqual([0, 1, 4]);
    expect(visibleTabIndices(5, 1, 3)).toEqual([3]);
    expect(visibleTabIndices(5, 2, -1)).toEqual([0, 1]);
    expect(visibleTabIndices(0, 3, -1)).toEqual([]);
  });
});

describe('hiddenActionCount', () => {
  it('takes a separator that would come first along with the hidden actions', () => {
    expect(hiddenActionCount(actions, 0)).toBe(0);
    expect(hiddenActionCount(actions, 1)).toBe(2);
    expect(hiddenActionCount(actions, 2)).toBe(2);
    expect(hiddenActionCount(actions, 3)).toBe(3);
    expect(hiddenActionCount(actions, 9)).toBe(6);
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

  it('collapses the actions first, the first ones first, and keeps the last one', () => {
    // The search button goes, and the separator after it with it: 41 + 16 - 56 (⋮) = 1px saved.
    expect(allocateHeading(measure(FULL - 1))).toMatchObject({ tabs: 7, actions: 2 });
    expect(allocateHeading(measure(FULL - 130))).toMatchObject({ tabs: 7, actions: 3 });
    expect(allocateHeading(measure(FULL - 300))).toMatchObject({ tabs: 7, actions: 5 });
  });

  it('then collapses the tabs into the More pill, keeping the selected one', () => {
    // All actions but the last: ⋮ + primary = 40 + 16 + 140 = 196. Five tabs + More:
    // 12 + 5 * 90 + 4 * 2 + 2 + 80 = 552. Row: 160 + 32 + 552 + 32 + 196 = 972.
    expect(allocateHeading(measure(972))).toMatchObject({ compact: false, tabs: 5, actions: 5 });
    expect(allocateHeading(measure(972, { tabs: { ...tabs, pinned: 6 } }))).toMatchObject({
      tabs: 5,
    });
    expect(allocateHeading(measure(971))).toMatchObject({ tabs: 4, actions: 5 });
  });

  it('then collapses the last action too', () => {
    // One tab + More: 12 + 90 + 2 + 80 = 184; ⋮ alone: 40. Row: 160 + 32 + 184 + 32 + 40 = 448.
    expect(allocateHeading(measure(448))).toMatchObject({ compact: false, tabs: 1, actions: 6 });
  });

  it('turns compact when even that does not fit: the tabs get a row of their own', () => {
    expect(allocateHeading(measure(447))).toEqual({
      measuring: false,
      compact: true,
      // 12 + 3 * 90 + 2 * 2 + 2 + 80 = 368 fits in 447.
      tabs: 3,
      // Title + ⋮ + primary: 160 + 32 + 196 = 388.
      actions: 5,
    });
    // The first row: title + ⋮ only (the title shortens below that). Two tabs + More: 276.
    expect(allocateHeading(measure(300))).toMatchObject({ compact: true, tabs: 2, actions: 6 });
    expect(allocateHeading(measure(150))).toMatchObject({ compact: true, tabs: 1, actions: 6 });
  });

  it('keeps one row without tabs, collapsing the actions', () => {
    const noTabs = (available: number) => allocateHeading(measure(available, { tabs: null }));
    // 160 + 32 + 571 = 763
    expect(noTabs(763)).toMatchObject({ compact: false, actions: 0 });
    expect(noTabs(700)).toMatchObject({ compact: false, actions: 3 });
    // Not even the title and ⋮: everything collapses, the title shortens.
    expect(noTabs(100)).toMatchObject({ compact: false, actions: 6 });
  });

  it('works with any part missing', () => {
    expect(allocateHeading(measure(100, { tabs: null, actions: null }))).toMatchObject({
      compact: false,
    });
    expect(allocateHeading(measure(300, { title: null, actions: null }))).toMatchObject({
      tabs: 2,
    });
    expect(allocateHeading(measure(200, { title: null, tabs: null }))).toMatchObject({
      actions: 5,
    });
  });
});
