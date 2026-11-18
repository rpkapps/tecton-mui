import type { GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { GROUP_ID_PREFIX } from '../../core/rows.js';
import type { GridNode } from '../../core/tree.js';

const SEP = '\u001f';

/**
 * Builds a tree from `getTreeDataPath`. Missing intermediate parents are auto-generated (row =
 * null), like MUI's tree data. Children keep input order; sorting happens in a later stage.
 */
export function buildTreeDataHierarchy<R extends GridValidRowModel>(
  rows: readonly R[],
  getRowId: (row: R) => GridRowId,
  getTreeDataPath: (row: R) => readonly string[],
): GridNode<R>[] {
  const roots: GridNode<R>[] = [];
  const byPath = new Map<string, GridNode<R>>();

  const ensure = (path: readonly string[]): GridNode<R> => {
    const key = path.join(SEP);
    let node = byPath.get(key);
    if (node) return node;
    node = {
      id: `${GROUP_ID_PREFIX}tree-${key}`,
      depth: path.length - 1,
      row: null,
      children: [],
      groupingField: null,
      groupingKey: path[path.length - 1],
      label: path[path.length - 1],
    };
    byPath.set(key, node);
    attach(node, path);
    return node;
  };

  const attach = (node: GridNode<R>, path: readonly string[]) => {
    if (path.length === 1) roots.push(node);
    else {
      const parent = ensure(path.slice(0, -1));
      (parent.children ??= []).push(node);
    }
  };

  for (const row of rows) {
    const path = getTreeDataPath(row);
    if (path.length === 0) continue;
    const key = path.join(SEP);
    const existing = byPath.get(key);
    if (existing) {
      if (existing.row === null) {
        // A real row for a previously auto-generated parent: adopt it in place.
        existing.row = row;
        existing.id = getRowId(row);
        continue;
      }
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `MUI X: duplicate tree data path "${path.join('/')}"; the later row is ignored.`,
        );
      }
      continue;
    }
    const node: GridNode<R> = {
      id: getRowId(row),
      depth: path.length - 1,
      row,
      children: null,
      groupingField: null,
      groupingKey: path[path.length - 1],
      label: path[path.length - 1],
    };
    byPath.set(key, node);
    attach(node, path);
  }
  // Parents that received children get an array; leaves keep null.
  for (const node of byPath.values())
    if (node.children && node.children.length === 0) node.children = null;
  return roots;
}
