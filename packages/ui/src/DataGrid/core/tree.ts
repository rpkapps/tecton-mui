import type { GridRowId, GridValidRowModel } from '@mui/x-data-grid';

/**
 * Intermediate hierarchy produced by the pipeline. Leaves keep the user's row object (identity is
 * preserved so Community's memoized rows don't re-render); generated groups have `row === null`.
 */
export interface GridNode<R extends GridValidRowModel = GridValidRowModel> {
  id: GridRowId;
  depth: number;
  row: R | null;
  /** `null` for leaves. */
  children: GridNode<R>[] | null;
  /** Row grouping field, `null` for tree data. */
  groupingField: string | null;
  groupingKey: unknown;
  /** Tree data: last path segment. */
  label?: string;
  /** Server-side groups: children reported by the data source before they are loaded. */
  childrenCount?: number;
}

export const isGroupNode = (node: GridNode): boolean =>
  (node.children !== null && node.children.length > 0) || (node.childrenCount ?? 0) !== 0;

export function forEachNode<R extends GridValidRowModel>(
  nodes: readonly GridNode<R>[],
  fn: (node: GridNode<R>) => void,
): void {
  for (const node of nodes) {
    fn(node);
    if (node.children) forEachNode(node.children, fn);
  }
}

/** Collects every node with a user row (leaves and tree-data parents), in tree order. */
export function collectRows<R extends GridValidRowModel>(nodes: readonly GridNode<R>[]): R[] {
  const out: R[] = [];
  forEachNode(nodes, (n) => {
    if (n.row) out.push(n.row);
  });
  return out;
}
