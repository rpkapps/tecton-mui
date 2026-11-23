import {
  collapseOrder,
  collapsedWidth,
  collapsibleCount,
  fitCollapse,
  hiddenItems,
  type CollapseMeasure,
} from '../collapse.js';

// A row like the canonical heading's actions: search, a separator, two selects, a toggle and the
// primary button.
const actions: CollapseMeasure = {
  items: [40, 1, 120, 120, 70, 140],
  separators: [false, true, false, false, false, false],
  pinned: [false, false, false, false, false, false],
  late: [false, false, false, false, false, false],
  gap: 16,
  overflow: 40,
};

describe('collapseOrder', () => {
  it('collapses first to last, the late ones after the others, the last action at the end', () => {
    expect(collapseOrder(actions)).toEqual([0, 2, 3, 4, 5]);
    // A closed search (first, late) goes after the other secondary actions.
    expect(collapseOrder({ ...actions, late: [true, false, false, false, false, false] })).toEqual([
      2, 3, 4, 0, 5,
    ]);
    // An open search (pinned) never collapses.
    expect(
      collapseOrder({ ...actions, pinned: [true, false, false, false, false, false] }),
    ).toEqual([2, 3, 4, 5]);
    expect(collapseOrder({ separators: [], pinned: [], late: [] })).toEqual([]);
  });
});

describe('hiddenItems', () => {
  const hiddenIndices = (kinds: Parameters<typeof hiddenItems>[0], count: number) =>
    hiddenItems(kinds, count).flatMap((hidden, index) => (hidden ? [index] : []));

  it('takes the separators left without an action before them along with the hidden actions', () => {
    expect(hiddenIndices(actions, 0)).toEqual([]);
    // The search button goes, and the separator after it, now first in the row.
    expect(hiddenIndices(actions, 1)).toEqual([0, 1]);
    expect(hiddenIndices(actions, 2)).toEqual([0, 1, 2]);
    expect(hiddenIndices(actions, 9)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('keeps a separator between two actions that show, and drops doubled or trailing ones', () => {
    const kinds = {
      separators: [false, true, false, true, false],
      pinned: [true, false, false, false, false],
      late: [false, false, false, false, false],
    };
    // [search (pinned)] | [view] | [create]: the view goes, two separators meet: one stays.
    expect(hiddenIndices(kinds, 1)).toEqual([2, 3]);
    // Everything that can go: the pinned search alone, without a separator after it.
    expect(hiddenIndices(kinds, 2)).toEqual([1, 2, 3, 4]);
  });
});

describe('collapsedWidth and fitCollapse', () => {
  it('measures the row with the overflow button in place of the collapsed items', () => {
    // 491 + 5 * 16
    expect(collapsedWidth(actions, 0)).toBe(571);
    // ⋮ + 120 + 120 + 70 + 140 (the separator went with the search)
    expect(collapsedWidth(actions, 1)).toBe(40 + 16 + 450 + 3 * 16);
    // ⋮ alone
    expect(collapsedWidth(actions, collapsibleCount(actions))).toBe(40);
  });

  it('collapses as few items as fit, every one when even the overflow button does not', () => {
    expect(fitCollapse(actions, 571)).toBe(0);
    expect(fitCollapse(actions, 570)).toBe(1);
    expect(fitCollapse(actions, 196)).toBe(4);
    expect(fitCollapse(actions, 100)).toBe(5);
    expect(fitCollapse(actions, 10)).toBe(5);
  });
});
