import type { GridRowId } from '@mui/x-data-grid';
import type { GridCellSelectionModel } from '../../public-types.js';

export interface CellCoord {
  id: GridRowId;
  field: string;
}

/** Rectangle between two cells, in visible row/column order. */
export function rangeModel(
  start: CellCoord,
  end: CellCoord,
  rowOrder: readonly GridRowId[],
  fieldOrder: readonly string[],
): GridCellSelectionModel {
  const r1 = rowOrder.indexOf(start.id);
  const r2 = rowOrder.indexOf(end.id);
  const c1 = fieldOrder.indexOf(start.field);
  const c2 = fieldOrder.indexOf(end.field);
  if (r1 < 0 || r2 < 0 || c1 < 0 || c2 < 0) return {};
  const model: GridCellSelectionModel = {};
  const fields = fieldOrder.slice(Math.min(c1, c2), Math.max(c1, c2) + 1);
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
    const cells: Record<string, boolean> = {};
    for (const f of fields) cells[f] = true;
    model[rowOrder[r]] = cells;
  }
  return model;
}

export function mergeModels(
  a: GridCellSelectionModel,
  b: GridCellSelectionModel,
): GridCellSelectionModel {
  const out: GridCellSelectionModel = { ...a };
  for (const [id, cells] of Object.entries(b)) out[id] = { ...out[id], ...cells };
  return out;
}

export function toggleCell(model: GridCellSelectionModel, cell: CellCoord): GridCellSelectionModel {
  const row = { ...model[cell.id] };
  if (row[cell.field]) delete row[cell.field];
  else row[cell.field] = true;
  const out = { ...model, [cell.id]: row };
  if (Object.keys(row).length === 0) delete out[cell.id];
  return out;
}

export function isModelEmpty(model: GridCellSelectionModel): boolean {
  return Object.values(model).every((cells) => !Object.values(cells).some(Boolean));
}

const esc = (value: string) =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&');

/**
 * Highlight rules for the selection. Rows sharing the same field set are grouped into one `:is()`
 * selector, so a rectangle of N rows x M columns produces a single rule. Updating this stylesheet
 * re-highlights cells without re-rendering any React cell.
 */
export function selectionCss(scope: string, model: GridCellSelectionModel): string {
  const groups = new Map<string, string[]>();
  for (const [id, cells] of Object.entries(model)) {
    const fields = Object.keys(cells).filter((f) => cells[f]);
    if (!fields.length) continue;
    const key = fields.sort().join('\u0000');
    const list = groups.get(key) ?? [];
    list.push(id);
    groups.set(key, list);
  }
  const rules: string[] = [];
  for (const [key, ids] of groups) {
    const rows = ids.map((id) => `[data-id="${esc(id)}"]`).join(',');
    const fields = key
      .split('\u0000')
      .map((f) => `[data-field="${esc(f)}"]`)
      .join(',');
    rules.push(
      `.${scope} .MuiDataGrid-row:is(${rows}) > .MuiDataGrid-cell:is(${fields}){background-image:linear-gradient(var(--tdg-cell-selected, rgba(118,82,146,0.16)),var(--tdg-cell-selected, rgba(118,82,146,0.16)));box-shadow:inset 0 0 0 1px var(--tecton-color-focus-ring, #765292);}`,
    );
  }
  return rules.join('\n');
}

/** Selected cells as text rows (visible order) for copying. */
export function selectionToMatrix(
  model: GridCellSelectionModel,
  rowOrder: readonly GridRowId[],
  fieldOrder: readonly string[],
  getText: (id: GridRowId, field: string) => string,
): string[][] {
  const fieldsUsed = new Set<string>();
  for (const cells of Object.values(model))
    for (const f of Object.keys(cells)) if (cells[f]) fieldsUsed.add(f);
  const fields = fieldOrder.filter((f) => fieldsUsed.has(f));
  const out: string[][] = [];
  for (const id of rowOrder) {
    const cells = model[id];
    if (!cells || !Object.values(cells).some(Boolean)) continue;
    out.push(fields.map((f) => (cells[f] ? getText(id, f) : '')));
  }
  return out;
}

export const toTsv = (matrix: string[][]) =>
  matrix.map((row) => row.map((v) => v.replace(/[\t\n\r]/g, ' ')).join('\t')).join('\r\n');

/** Default paste parser: rows by newline, cells by tab; trailing empty line dropped. */
export function defaultSplitClipboardText(text: string): string[][] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines.map((line) => line.split('\t'));
}

/** Top-left cell of a selection model (in visible order), if any. */
export function selectionOrigin(
  model: GridCellSelectionModel,
  rowOrder: readonly GridRowId[],
  fieldOrder: readonly string[],
): CellCoord | null {
  for (const id of rowOrder) {
    const cells = model[id];
    if (!cells) continue;
    const field = fieldOrder.find((f) => cells[f]);
    if (field) {
      const minField = fieldOrder.find((f) => Object.values(model).some((c) => c[f]));
      return { id, field: minField ?? field };
    }
  }
  return null;
}
