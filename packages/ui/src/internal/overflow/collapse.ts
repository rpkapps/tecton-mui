// Which items of a row of actions collapse into its overflow (⋮) button, and how wide the row is
// then. Pure and DOM-free; `useCollapsingItems` measures the items and renders the result. Shared by
// the heading's actions (`HeadingActions`) and the app bar's (`AppBarActions`).
//
// By default the items collapse first to last, so the last one (the primary action in the Tecton
// design) stays the longest. Late items (a closed search) go after the others, pinned ones (an open
// search field) never, and separators (vertical dividers) follow the items around them. A row can give
// its own order instead (`order`): the heading folds its actions by kind, as the Tecton drop-in
// heading does (`foldOrder`).

/** The kinds of the items, in order. */
export interface CollapseKinds {
  /** Which items are separators (vertical dividers): they follow the items around them. */
  separators: boolean[];
  /** Which items never collapse (an open search field). */
  pinned: boolean[];
  /** Which items collapse after the others, before the last one (a closed search). */
  late: boolean[];
  /**
   * The order in which the items collapse, when the row sets it (indices of items that are neither
   * separators nor pinned). Items left out never collapse.
   */
  order?: number[];
}

/** Natural widths of a row of items. */
export interface CollapseMeasure extends CollapseKinds {
  /** Each item's width, in order. */
  items: number[];
  /** Space between two items. */
  gap: number;
  /** The overflow (⋮) button's width. */
  overflow: number;
}

/** Sub-pixel rounding between measured and laid out widths. */
const EPSILON = 0.5;

/**
 * The order in which the items collapse: first to last, the late ones after the others, and the
 * last item (the primary one) at the very end. Separators and pinned items never do.
 */
export function collapseOrder(kinds: CollapseKinds): number[] {
  const { separators, pinned, late, order } = kinds;
  if (order) return order.filter((index) => !separators[index] && !pinned[index]);
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

/** What an action is, for the order in which the heading folds it (`foldOrder`). */
export type ActionKind =
  'primary' | 'button' | 'toggle' | 'select' | 'icon' | 'search' | 'separator';

/** The rank of each kind: lower ranks fold first. */
const FOLD_RANK: Record<Exclude<ActionKind, 'separator' | 'primary'>, number> = {
  button: 0,
  toggle: 1,
  select: 2,
  icon: 3,
  search: 4,
};

/**
 * The order in which the heading folds its actions, as the Tecton drop-in heading does: first the
 * (secondary) buttons, then the toggle button groups (the view toggle), the selects, the icon buttons
 * (filter before search: from the end of the row) and the search last. The primary action (a
 * contained button in the primary color) never folds. Within a kind, the actions fold in the order
 * of the row, the icon buttons from its end.
 */
export function foldOrder(kinds: ActionKind[]): number[] {
  return kinds
    .map((kind, index) => ({ kind, index }))
    .filter(
      (item): item is { kind: Exclude<ActionKind, 'separator' | 'primary'>; index: number } =>
        item.kind !== 'separator' && item.kind !== 'primary',
    )
    .sort(
      (a, b) =>
        FOLD_RANK[a.kind] - FOLD_RANK[b.kind] ||
        (a.kind === 'icon' ? b.index - a.index : a.index - b.index),
    )
    .map((item) => item.index);
}

/** How many items can collapse: those that are neither separators nor pinned. */
export function collapsibleCount(kinds: CollapseKinds) {
  return collapseOrder(kinds).length;
}

/**
 * Which items are in the overflow tray when `count` of them collapse: the first `count` in
 * collapse order, and the separators that would be left with nothing before them in the row,
 * after another separator or at its end.
 */
export function hiddenItems(kinds: CollapseKinds, count: number): boolean[] {
  const { separators } = kinds;
  const hidden = separators.map(() => false);
  collapseOrder(kinds)
    .slice(0, Math.max(0, count))
    .forEach((index) => {
      hidden[index] = true;
    });
  if (count <= 0) return hidden;
  let afterItem = false;
  separators.forEach((separator, index) => {
    if (hidden[index]) return;
    if (!separator) afterItem = true;
    else if (afterItem) afterItem = false;
    else hidden[index] = true;
  });
  for (let index = separators.length - 1; index >= 0; index -= 1) {
    if (hidden[index]) continue;
    if (!separators[index]) break;
    hidden[index] = true;
  }
  return hidden;
}

/** The row's width when `count` items collapse: the items left, and the overflow button. */
export function collapsedWidth(measure: CollapseMeasure, count: number) {
  const hidden = hiddenItems(measure, count);
  const shown = measure.items.filter((_, index) => !hidden[index]);
  const collapsed = hidden.some((isHidden, index) => isHidden && !measure.separators[index]);
  const overflow = collapsed ? measure.overflow + (shown.length > 0 ? measure.gap : 0) : 0;
  return (
    overflow +
    shown.reduce((total, width) => total + width, 0) +
    measure.gap * Math.max(0, shown.length - 1)
  );
}

/**
 * How many items collapse for the row to fit in `available`: as few as can, every one that can when
 * even the overflow button alone is too wide.
 */
export function fitCollapse(measure: CollapseMeasure, available: number) {
  const total = collapsibleCount(measure);
  for (let count = 0; count < total; count += 1) {
    if (collapsedWidth(measure, count) <= available + EPSILON) return count;
  }
  return total;
}
