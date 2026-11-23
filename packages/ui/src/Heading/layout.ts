// How the heading's row shares its width between the title, the tabs and the actions. Pure and
// DOM-free: `Heading` measures the parts' natural widths (heading.tsx) and applies the result.
//
// The row never wraps. When the parts do not fit, they give way in this order (priority+):
//
// 1. The actions collapse into the overflow (⋮) button, the first ones first; the last action,
//    the primary one in the Tecton design, stays. Late actions (a closed search) go after the
//    others, pinned ones (an open search field) never, and separators follow the actions around
//    them.
// 2. The tab group narrows and scrolls, with arrows, as the app bar's tab strip does, down to the
//    selected tab between its two arrows.
// 3. The last action collapses too.
// 4. When even that does not fit (a narrow container), the heading turns compact: the title and the
//    actions share the first row (actions collapsing first again, then the title shortens with an
//    ellipsis) and the tabs get a row of their own below, scrolling there.

/** Widths of the tab group. */
export interface TabsMeasure {
  /** Every tab in view. */
  natural: number;
  /** The narrowest it may get: the selected tab between the two scroll arrows. */
  min: number;
}

/** Natural widths of the actions. */
export interface ActionsMeasure {
  /** Each action's width, in order. */
  items: number[];
  /** Which actions are separators (vertical dividers): they follow the actions around them. */
  separators: boolean[];
  /** Which actions never collapse (an open search field). */
  pinned: boolean[];
  /** Which actions collapse after the others, before the last one (a closed search). */
  late: boolean[];
  /** Space between two actions. */
  gap: number;
  /** The overflow (⋮) button's width. */
  overflow: number;
}

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

type ActionKinds = Pick<ActionsMeasure, 'separators' | 'pinned' | 'late'>;

/**
 * The order in which the actions collapse: first to last, the late ones after the others, and the
 * last action (the primary one) at the very end. Separators and pinned actions never do.
 */
export function actionCollapseOrder(actions: ActionKinds): number[] {
  const { separators, pinned, late } = actions;
  const candidates = separators
    .map((separator, index) => (separator || pinned[index] ? -1 : index))
    .filter((index) => index >= 0);
  const primary = candidates.pop();
  if (primary === undefined) return [];
  return [
    ...candidates.filter((index) => !late[index]),
    ...candidates.filter((index) => late[index]),
    primary,
  ];
}

/** How many actions can collapse: those that are neither separators nor pinned. */
export function collapsibleActionCount(actions: ActionKinds) {
  return actionCollapseOrder(actions).length;
}

/**
 * Which actions are in the overflow tray when `count` of them collapse: the first `count` in
 * collapse order, and the separators that would be left with nothing before them in the row,
 * after another separator or at its end.
 */
export function hiddenActions(actions: ActionKinds, count: number): boolean[] {
  const { separators } = actions;
  const hidden = separators.map(() => false);
  actionCollapseOrder(actions)
    .slice(0, Math.max(0, count))
    .forEach((index) => {
      hidden[index] = true;
    });
  if (count <= 0) return hidden;
  let afterAction = false;
  separators.forEach((separator, index) => {
    if (hidden[index]) return;
    if (!separator) afterAction = true;
    else if (afterAction) afterAction = false;
    else hidden[index] = true;
  });
  for (let index = separators.length - 1; index >= 0; index -= 1) {
    if (hidden[index]) continue;
    if (!separators[index]) break;
    hidden[index] = true;
  }
  return hidden;
}

function actionsWidth(actions: ActionsMeasure, count: number) {
  const hidden = hiddenActions(actions, count);
  const shown = actions.items.filter((_, index) => !hidden[index]);
  const collapsed = hidden.some((isHidden, index) => isHidden && !actions.separators[index]);
  const overflow = collapsed ? actions.overflow + (shown.length > 0 ? actions.gap : 0) : 0;
  return overflow + sum(shown) + actions.gap * Math.max(0, shown.length - 1);
}

function rowWidth(gap: number, parts: (number | null)[]) {
  const present = parts.filter((part): part is number => part !== null);
  return sum(present) + gap * Math.max(0, present.length - 1);
}

/** Shares the row between the parts (see the top of this file). */
export function allocateHeading(measure: HeadingMeasure): HeadingLayout {
  const { available, gap, title, tabs, actions } = measure;
  const actionCount = actions ? collapsibleActionCount(actions) : 0;
  /** Whether the row fits with the tabs at their natural (or narrowest) width. */
  const fits = (narrow: boolean, hiddenActions: number) =>
    rowWidth(gap, [
      title,
      tabs ? (narrow ? tabs.min : tabs.natural) : null,
      actions ? actionsWidth(actions, hiddenActions) : null,
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
    const row = rowWidth(gap, [title, actions ? actionsWidth(actions, count) : null]);
    if (row <= available + EPSILON) return layout(count, true);
  }
  return layout(all, true);
}
