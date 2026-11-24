// How the heading's row shares its width between the title, the tabs and the actions, as the Tecton
// drop-in heading (`<wc-heading>`, its fold rules) does. Pure and DOM-free: `Heading` measures the
// parts' natural widths (heading.tsx) and applies the result.
//
// Above 720px (on the heading's own width) the heading keeps to one row. When the parts do not fit:
//
// 1. The actions fold into the overflow (⋮) menu, by kind: first the secondary buttons, then the
//    view toggle, the selects, filter and search (internal/overflow/collapse.ts `foldOrder`). The
//    last action, the primary one, never folds; an open search field neither.
// 2. Then the last tabs fold into the More tab, down to none: the More tab alone, named after the
//    open tab.
// 3. A title that still does not fit ends with an ellipsis.
//
// At 720px and below the heading is narrow (`compact`): smaller gutters and gaps, the primary action
// shows its icon only, and the tabs are one dropdown on a row of their own, so only the actions fold.

import {
  collapsedWidth,
  collapsibleCount,
  type CollapseMeasure,
} from '../internal/overflow/collapse.js';

/** The heading's width at and below which it is narrow (the Tecton Storybook header breakpoint). */
export const NARROW_WIDTH = 720;

/** Natural widths of the tab group. */
export interface TabsMeasure {
  /** Each tab's width, in order. */
  items: number[];
  /** Space between two tabs (and between the last tab and the More tab). */
  gap: number;
  /** The group surface's inline padding, both sides together. */
  padding: number;
  /** The More tab's width. */
  more: number;
}

/** Natural widths of the actions (see internal/overflow/collapse.ts). */
export type ActionsMeasure = CollapseMeasure;

export interface HeadingMeasure {
  /** The row's content width. */
  available: number;
  /** Space between the title and the tabs. */
  tabsGap: number;
  /** The least space before the actions while the parts fit. */
  actionsGap: number;
  /** The heading is narrow: the tabs have a row of their own. */
  narrow: boolean;
  /** The title cluster's natural width, or `null` without a title. */
  title: number | null;
  tabs: TabsMeasure | null;
  actions: ActionsMeasure | null;
}

export interface HeadingLayout {
  /** The parts render everything at its natural width, to be measured. */
  measuring: boolean;
  /** The heading is narrow: the tabs are one dropdown on a row of their own. */
  compact: boolean;
  /** How many tabs show before the More tab (the rest are in its menu). */
  tabs: number;
  /** How many of the actions that can fold are in the overflow menu (in fold order). */
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

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

/** The tab group's width with the first `count` tabs, and the More tab when some do not show. */
export function tabsWidth(tabs: TabsMeasure, count: number) {
  const shown = tabs.items.slice(0, Math.max(0, count));
  const widths = shown.length < tabs.items.length ? [...shown, tabs.more] : shown;
  return tabs.padding + sum(widths) + tabs.gap * Math.max(0, widths.length - 1);
}

/** Shares the row between the parts (see the top of this file). */
export function allocateHeading(measure: HeadingMeasure): HeadingLayout {
  const { available, tabsGap, actionsGap, narrow, title, tabs, actions } = measure;
  const inRow = !narrow && tabs !== null && tabs.items.length > 0;
  const tabCount = inRow ? tabs!.items.length : 0;
  const foldable = actions ? collapsibleCount(actions) : 0;
  const fits = (folded: number, shownTabs: number) => {
    const start = (title ?? 0) + (inRow ? tabsGap + tabsWidth(tabs!, shownTabs) : 0);
    const end = actions ? collapsedWidth(actions, folded) : 0;
    return start + (end > 0 ? actionsGap + end : 0) <= available + EPSILON;
  };

  // 1. The actions fold, one by one in fold order, until the row fits with every tab.
  let folded = 0;
  while (folded < foldable && !fits(folded, tabCount)) folded += 1;
  // 2. Then the last tabs, down to the More tab alone.
  let shown = tabCount;
  while (shown > 0 && !fits(folded, shown)) shown -= 1;
  // 3. Whatever is left over shortens the title (an ellipsis).
  return { measuring: false, compact: narrow, tabs: shown, actions: folded };
}
