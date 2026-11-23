// How the heading's row shares its width between the title, the tabs and the actions. Pure and
// DOM-free: `Heading` measures the parts' natural widths (heading.tsx) and applies the result.
//
// The row never wraps. When the parts do not fit, they give way in this order (priority+):
//
// 1. The actions collapse into the overflow (⋮) button, the first ones first; the last action,
//    the primary one in the Tecton design, stays. Late actions (a closed search) go after the
//    others, pinned ones (an open search field) never, and separators follow the actions around
//    them (internal/overflow/collapse.ts).
// 2. The tab group narrows and scrolls, with arrows, as the app bar's tab strip does, down to the
//    selected tab between its two arrows.
// 3. The last action collapses too.
// 4. When even that does not fit (a narrow container), the heading turns compact: the title and the
//    actions share the first row (actions collapsing first again, then the title shortens with an
//    ellipsis) and the tabs get a row of their own below, scrolling there.

import {
  collapsedWidth,
  collapsibleCount,
  type CollapseMeasure,
} from '../internal/overflow/collapse.js';

/** Widths of the tab group. */
export interface TabsMeasure {
  /** Every tab in view. */
  natural: number;
  /** The narrowest it may get: the selected tab between the two scroll arrows. */
  min: number;
}

/** Natural widths of the actions (see internal/overflow/collapse.ts). */
export type ActionsMeasure = CollapseMeasure;

export interface HeadingMeasure {
  /** The row's content width. */
  available: number;
  /** Space between the title, the tabs and the actions. */
  gap: number;
  /**
   * The natural width of the heading's start (the title and what sits beside it), or `null` when it
   * has none.
   */
  title: number | null;
  tabs: TabsMeasure | null;
  actions: ActionsMeasure | null;
}

export interface HeadingLayout {
  /** The parts render everything at its natural width, to be measured. */
  measuring: boolean;
  /** The tabs have a row of their own, below the title and the actions. */
  compact: boolean;
  /** The heading has tabs: they, not the title, take what room is left in a one-row heading. */
  tabs: boolean;
  /** How many of the actions that can collapse are in the overflow tray (the first ones). */
  actions: number;
}

/** Before the first measure (and on the server): everything shows. */
export const INITIAL_LAYOUT: HeadingLayout = {
  measuring: true,
  compact: false,
  tabs: false,
  actions: 0,
};

/** Everything shows: no room to measure (no layout yet, or a hidden heading). */
export const FULL_LAYOUT: HeadingLayout = { ...INITIAL_LAYOUT, measuring: false };

/** Sub-pixel rounding between measured and laid out widths. */
const EPSILON = 0.5;

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function rowWidth(gap: number, parts: (number | null)[]) {
  const present = parts.filter((part): part is number => part !== null);
  return sum(present) + gap * Math.max(0, present.length - 1);
}

/** Shares the row between the parts (see the top of this file). */
export function allocateHeading(measure: HeadingMeasure): HeadingLayout {
  const { available, gap, title, tabs, actions } = measure;
  const actionCount = actions ? collapsibleCount(actions) : 0;
  /** Whether the row fits with the tabs at their natural (or narrowest) width. */
  const fits = (narrow: boolean, hiddenActions: number) =>
    rowWidth(gap, [
      title,
      tabs ? (narrow ? tabs.min : tabs.natural) : null,
      actions ? collapsedWidth(actions, hiddenActions) : null,
    ]) <=
    available + EPSILON;
  const layout = (hiddenActions: number, compact = false): HeadingLayout => ({
    measuring: false,
    compact,
    tabs: tabs !== null,
    actions: hiddenActions,
  });

  // 1. Everything, every tab in view.
  if (fits(false, 0)) return layout(0);
  // 2. The actions but the last collapse, the first ones first.
  for (let count = 1; count < actionCount; count += 1) {
    if (fits(false, count)) return layout(count);
  }
  // 3. The tabs narrow and scroll (the row gives them what is left).
  const allButLast = Math.max(0, actionCount - 1);
  if (fits(true, allButLast)) return layout(allButLast);
  // 4. The last action too.
  const all = actionCount;
  if (fits(true, all)) return layout(all);
  if (!tabs) {
    // One row of title and actions; the title shortens once the actions are all collapsed.
    for (let count = 0; count <= actionCount; count += 1) {
      if (fits(true, count)) return layout(count);
    }
    return layout(all);
  }

  // 5. Compact: the title and the actions on the first row, the tabs on a row of their own (which
  // scroll there if they must).
  for (let count = 0; count <= actionCount; count += 1) {
    const row = rowWidth(gap, [title, actions ? collapsedWidth(actions, count) : null]);
    if (row <= available + EPSILON) return layout(count, true);
  }
  return layout(all, true);
}
