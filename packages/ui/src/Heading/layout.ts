// How the heading's row shares its width between the title, the tabs and the actions. Pure and
// DOM-free: `Heading` measures the parts' natural widths (heading.tsx) and applies the result.
//
// The row never wraps. When the parts do not fit, they give way in this order (priority+):
//
// 1. The actions collapse into the overflow (⋮) button, the first ones first; the last action,
//    the primary one in the Tecton design, stays. Late actions (a closed search) go after the
//    others, pinned ones (an open search field) never, and separators follow the actions around
//    them (internal/overflow/collapse.ts).
// 2. The tabs after the selected one collapse into the More pill, the last ones first. The selected
//    tab stays visible.
// 3. The last action collapses too.
// 4. When even that does not fit (a narrow container), the heading turns compact: the title and the
//    actions share the first row (actions collapsing first again, then the title shortens with an
//    ellipsis) and the tabs get a row of their own below.

import {
  collapsedWidth,
  collapsibleCount,
  type CollapseMeasure,
} from '../internal/overflow/collapse.js';

/** Natural widths of the tab group. */
export interface TabsMeasure {
  /** Each tab's width, in order. */
  items: number[];
  /** Space between two tabs (and between the last tab and the More pill). */
  gap: number;
  /** The group surface's inline padding, both sides together. */
  padding: number;
  /** The More pill's width. */
  more: number;
  /** Index of the selected tab, or -1. It always stays visible. */
  pinned: number;
}

/** Natural widths of the actions (see internal/overflow/collapse.ts). */
export type ActionsMeasure = CollapseMeasure;

export interface HeadingMeasure {
  /** The row's content width. */
  available: number;
  /** Space between the title, the tabs and the actions. */
  gap: number;
  /** The title cluster's natural width, or `null` without a title. */
  title: number | null;
  tabs: TabsMeasure | null;
  actions: ActionsMeasure | null;
}

export interface HeadingLayout {
  /** The parts render everything at its natural width, to be measured. */
  measuring: boolean;
  /** The tabs have a row of their own, below the title and the actions. */
  compact: boolean;
  /** How many tabs show (the rest are in the More menu). */
  tabs: number;
  /** How many of the actions that can collapse are in the overflow tray (the first ones). */
  actions: number;
}

/** Before the first measure (and on the server): everything shows. */
export const INITIAL_LAYOUT: HeadingLayout = {
  measuring: true,
  compact: false,
  tabs: Number.POSITIVE_INFINITY,
  actions: 0,
};

/** Everything shows: no room to measure (no layout yet, or a hidden heading). */
export const FULL_LAYOUT: HeadingLayout = { ...INITIAL_LAYOUT, measuring: false };

/** Sub-pixel rounding between measured and laid out widths. */
const EPSILON = 0.5;

/**
 * The tabs that show when `count` of `total` fit: the first ones, with the selected tab (`pinned`)
 * in place of the last of them when it is further along.
 */
export function visibleTabIndices(total: number, count: number, pinned: number): number[] {
  const shown = Math.max(0, Math.min(count, total));
  const indices = Array.from({ length: shown }, (_, index) => index);
  if (shown > 0 && shown < total && pinned >= shown) indices[shown - 1] = pinned;
  return indices;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function tabsWidth(tabs: TabsMeasure, count: number) {
  const total = tabs.items.length;
  const indices = visibleTabIndices(total, count, tabs.pinned);
  const shown = indices.map((index) => tabs.items[index]!);
  const more = indices.length < total ? tabs.more + (indices.length > 0 ? tabs.gap : 0) : 0;
  return tabs.padding + sum(shown) + tabs.gap * Math.max(0, shown.length - 1) + more;
}

function rowWidth(gap: number, parts: (number | null)[]) {
  const present = parts.filter((part): part is number => part !== null);
  return sum(present) + gap * Math.max(0, present.length - 1);
}

/** Shares the row between the parts (see the top of this file). */
export function allocateHeading(measure: HeadingMeasure): HeadingLayout {
  const { available, gap, title, tabs, actions } = measure;
  const tabCount = tabs?.items.length ?? 0;
  const actionCount = actions ? collapsibleCount(actions) : 0;
  const fits = (shownTabs: number, hiddenActions: number) =>
    rowWidth(gap, [
      title,
      tabs ? tabsWidth(tabs, shownTabs) : null,
      actions ? collapsedWidth(actions, hiddenActions) : null,
    ]) <=
    available + EPSILON;
  const layout = (shownTabs: number, hiddenActions: number, compact = false): HeadingLayout => ({
    measuring: false,
    compact,
    tabs: shownTabs,
    actions: hiddenActions,
  });

  // 1. Everything.
  if (fits(tabCount, 0)) return layout(tabCount, 0);
  // 2. The actions but the last collapse, the first ones first.
  for (let count = 1; count < actionCount; count += 1) {
    if (fits(tabCount, count)) return layout(tabCount, count);
  }
  const allButLast = Math.max(0, actionCount - 1);
  // 3. The tabs after the selected one collapse, the last ones first.
  for (let shown = tabCount - 1; shown >= 1; shown -= 1) {
    if (fits(shown, allButLast)) return layout(shown, allButLast);
  }
  // 4. The last action too.
  const all = actionCount;
  for (let shown = tabCount; shown >= 1; shown -= 1) {
    if (fits(shown, all)) return layout(shown, all);
  }
  if (tabCount === 0) {
    // One row of title and actions; the title shortens once the actions are all collapsed.
    for (let count = 0; count <= actionCount; count += 1) {
      if (fits(0, count)) return layout(0, count);
    }
    return layout(0, all);
  }

  // 5. Compact: the title and the actions on the first row, the tabs on a row of their own.
  let hidden = all;
  for (let count = 0; count <= actionCount; count += 1) {
    const row = rowWidth(gap, [title, actions ? collapsedWidth(actions, count) : null]);
    if (row <= available + EPSILON) {
      hidden = count;
      break;
    }
  }
  let shown = 1;
  for (let count = tabCount; count >= 1; count -= 1) {
    if (tabsWidth(tabs!, count) <= available + EPSILON) {
      shown = count;
      break;
    }
  }
  return layout(shown, hidden, true);
}
