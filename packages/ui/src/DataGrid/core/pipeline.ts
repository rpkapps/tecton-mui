import type { GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import {
  DETAIL_ID_SUFFIX,
  ROW_AGGREGATES,
  SYNTHETIC,
  type SyntheticMeta,
  type VisibleRowInfo,
} from './rows.js';
import { isGroupNode, type GridNode } from './tree.js';
import type { AggregationResult } from '../features/grouping-aggregation/aggregation.js';
import type { GridGroupNodeInfo } from '../public-types.js';

export interface ExpansionConfig {
  overrides: ReadonlyMap<GridRowId, boolean>;
  defaultDepth: number;
  isGroupExpandedByDefault?: (node: GridGroupNodeInfo) => boolean;
}

export function groupInfo(node: GridNode): GridGroupNodeInfo {
  return {
    id: node.id,
    depth: node.depth,
    groupingField: node.groupingField,
    groupingKey: node.groupingKey,
    childrenCount: node.children?.length ?? 0,
  };
}

export function isNodeExpanded(node: GridNode, config: ExpansionConfig): boolean {
  const override = config.overrides.get(node.id);
  if (override !== undefined) return override;
  if (config.isGroupExpandedByDefault) return config.isGroupExpandedByDefault(groupInfo(node));
  return config.defaultDepth === -1 || node.depth < config.defaultDepth;
}

/** Per-visible-row metadata used by cells (aria-level/expanded, indentation, counts). */
export interface RowMeta {
  depth: number;
  childrenCount: number;
  label?: string;
  groupingField: string | null;
  groupingKey: unknown;
  isGroup: boolean;
}

export interface FlattenResult<R extends GridValidRowModel> {
  rows: R[];
  /** Number of detail-panel rows included in `rows`. */
  detailCount: number;
  info: VisibleRowInfo[];
  meta: Map<GridRowId, RowMeta>;
}

/**
 * Caches synthetic row objects by id so their identity is stable across flattens: expanding one
 * group must not hand Community a new object for every other group row.
 */
export class SyntheticRowCache {
  private cache = new Map<GridRowId, { row: object; sig: unknown[] }>();

  get(id: GridRowId, sig: unknown[], create: () => SyntheticMeta, build?: () => object): object {
    const hit = this.cache.get(id);
    if (hit && hit.sig.length === sig.length && hit.sig.every((v, i) => Object.is(v, sig[i])))
      return hit.row;
    const row = build ? build() : { [SYNTHETIC]: create() };
    this.cache.set(id, { row, sig });
    return row;
  }

  prune(alive: ReadonlySet<GridRowId>): void {
    for (const id of this.cache.keys()) if (!alive.has(id)) this.cache.delete(id);
  }
}

/** Depth-first flatten honoring expansion; inserts detail-panel rows after expanded masters. */
export function flattenTree<R extends GridValidRowModel>(
  roots: readonly GridNode<R>[],
  expansion: ExpansionConfig,
  aggregation: AggregationResult,
  detailExpanded: ReadonlySet<GridRowId> | null,
  cache: SyntheticRowCache,
  inlineAggregation: (node: GridNode<R>) => boolean,
): FlattenResult<R> {
  const rows: R[] = [];
  const info: VisibleRowInfo[] = [];
  const meta = new Map<GridRowId, RowMeta>();
  const alive = new Set<GridRowId>();
  let detailCount = 0;

  const visit = (nodes: readonly GridNode<R>[]) => {
    for (const node of nodes) {
      const hasChildren = isGroupNode(node);
      const childrenCount = node.children?.length || Math.max(0, node.childrenCount ?? 0);
      meta.set(node.id, {
        depth: node.depth,
        childrenCount,
        label: node.label,
        groupingField: node.groupingField,
        groupingKey: node.groupingKey,
        isGroup: hasChildren || node.row === null,
      });
      if (node.row) {
        const aggregates =
          hasChildren && inlineAggregation(node) ? aggregation.byGroup.get(node.id) : undefined;
        // Tree-data parents carry their aggregates on a cached copy so Community re-renders them
        // when the aggregate changes (the user's row object itself is never mutated).
        rows.push(
          aggregates
            ? (cache.get(
                `${String(node.id)}::aggregate`,
                [node.row, aggregates],
                () => ({ kind: 'group', id: node.id, depth: node.depth }),
                () => ({ ...node.row!, [ROW_AGGREGATES]: aggregates }),
              ) as R)
            : node.row,
        );
        if (aggregates) alive.add(`${String(node.id)}::aggregate`);
      } else {
        const aggregates = inlineAggregation(node) ? aggregation.byGroup.get(node.id) : undefined;
        alive.add(node.id);
        rows.push(
          cache.get(node.id, [aggregates, childrenCount, node.groupingKey, node.depth], () => ({
            kind: 'group',
            id: node.id,
            depth: node.depth,
            groupingField: node.groupingField,
            groupingKey: node.groupingKey,
            childrenCount,
            aggregates,
          })) as R,
        );
      }
      info.push({ id: node.id, depth: node.depth, isGroup: hasChildren || node.row === null });
      if (node.row && detailExpanded?.has(node.id)) {
        const detailId = `${String(node.id)}${DETAIL_ID_SUFFIX}`;
        alive.add(detailId);
        detailCount++;
        const master = node.row;
        rows.push(
          cache.get(detailId, [master], () => ({
            kind: 'detail',
            id: detailId,
            depth: node.depth,
            masterId: node.id,
            masterRow: master,
          })) as R,
        );
      }
      if (hasChildren && node.children && isNodeExpanded(node, expansion)) visit(node.children);
    }
  };
  visit(roots);
  cache.prune(alive);
  return { rows, info, meta, detailCount };
}

/**
 * Page slice. Rows matching `isAttached` (detail panels) do not count towards the page size and
 * stay on the page of the row they follow.
 */
export function paginate<T>(
  rows: readonly T[],
  page: number,
  pageSize: number,
  enabled: boolean,
  isAttached?: (row: T) => boolean,
): readonly T[] {
  if (!enabled) return rows;
  if (!isAttached) return rows.slice(page * pageSize, (page + 1) * pageSize);
  const out: T[] = [];
  let index = -1;
  const first = page * pageSize;
  const last = first + pageSize - 1;
  for (const row of rows) {
    if (!isAttached(row)) index++;
    if (index > last) break;
    if (index >= first) out.push(row);
  }
  return out;
}
