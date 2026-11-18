import type { GridRowId } from '@mui/x-data-grid';
import type { RowMeta } from './pipeline.js';
import type { UiState } from './context.js';

/** Expansion of a visible group row, from explicit overrides or defaults. */
export function isExpandedFromMeta(id: GridRowId, meta: RowMeta | undefined, ui: UiState): boolean {
  const override = ui.expansion.get(id);
  if (override !== undefined) return override;
  if (!meta) return false;
  if (ui.isGroupExpandedByDefault) {
    return ui.isGroupExpandedByDefault({
      id,
      depth: meta.depth,
      groupingField: meta.groupingField,
      groupingKey: meta.groupingKey,
      childrenCount: meta.childrenCount,
    });
  }
  return ui.defaultExpansionDepth === -1 || meta.depth < ui.defaultExpansionDepth;
}
