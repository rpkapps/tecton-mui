import * as React from 'react';
import type { GridRowId } from '@mui/x-data-grid';
import type { GridCellSelectionModel } from '../../public-types.js';
import {
  defaultSplitClipboardText,
  isModelEmpty,
  mergeModels,
  rangeModel,
  selectionCss,
  selectionOrigin,
  selectionToMatrix,
  toTsv,
  toggleCell,
  type CellCoord,
} from './cellSelection.js';

export interface CellSelectionOptions {
  enabled: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
  styleRef: React.RefObject<HTMLStyleElement | null>;
  scope: string;
  model: GridCellSelectionModel;
  setModel: (model: GridCellSelectionModel) => void;
  /** Maps a DOM `data-id` back to the row id. */
  resolveId: (domId: string) => GridRowId | undefined;
  rowOrder: () => GridRowId[];
  fieldOrder: () => string[];
  getText: (id: GridRowId, field: string) => string;
  onCopy?: (text: string) => void;
  // Paste
  pasteEnabled: boolean;
  splitClipboardPastedText?: (text: string) => string[][];
  focusedCell: () => CellCoord | null;
  onPaste: (origin: CellCoord, matrix: string[][]) => void;
}

function cellFromEvent(
  target: EventTarget | null,
  resolveId: (s: string) => GridRowId | undefined,
): CellCoord | null {
  if (!(target instanceof Element)) return null;
  const cell = target.closest<HTMLElement>('.MuiDataGrid-cell[data-field]');
  const row = cell?.closest<HTMLElement>('.MuiDataGrid-row[data-id]');
  if (!cell || !row || cell.closest('.TectonDataGrid-pinnedRows')) return null;
  const id = resolveId(row.dataset.id!);
  return id === undefined ? null : { id, field: cell.dataset.field! };
}

const isEditableTarget = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * Cell range selection (drag, shift-click, ctrl/cmd-click), copy as TSV and paste from TSV.
 * Highlighting is a generated stylesheet, so selecting cells never re-renders grid cells.
 */
export function useCellSelection(o: CellSelectionOptions): void {
  const ref = React.useRef(o);
  ref.current = o;

  React.useEffect(() => {
    if (o.styleRef.current)
      o.styleRef.current.textContent = o.enabled ? selectionCss(o.scope, o.model) : '';
  }, [o.enabled, o.model, o.scope, o.styleRef]);

  React.useEffect(() => {
    const root = o.rootRef.current;
    if (!root || !o.enabled) return undefined;
    let anchor: CellCoord | null = null;
    let base: GridCellSelectionModel = {};

    const onMouseDown = (event: MouseEvent) => {
      if (event.button !== 0 || isEditableTarget(event.target)) return;
      const cell = cellFromEvent(event.target, ref.current.resolveId);
      if (!cell || cell.field.startsWith('__')) return;
      const current = ref.current;
      if (event.ctrlKey || event.metaKey) {
        current.setModel(toggleCell(current.model, cell));
        anchor = cell;
        return;
      }
      if (event.shiftKey && anchor) {
        current.setModel(rangeModel(anchor, cell, current.rowOrder(), current.fieldOrder()));
        return;
      }
      anchor = cell;
      base = {};
      current.setModel({ [cell.id]: { [cell.field]: true } });
      const onMove = (e: MouseEvent) => {
        const over = cellFromEvent(e.target, ref.current.resolveId);
        if (!over || !anchor || over.field.startsWith('__')) return;
        ref.current.setModel(
          mergeModels(
            base,
            rangeModel(anchor, over, ref.current.rowOrder(), ref.current.fieldOrder()),
          ),
        );
      };
      const onUp = () => {
        root.removeEventListener('mouseover', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      root.addEventListener('mouseover', onMove);
      window.addEventListener('mouseup', onUp);
    };

    const onKeyDownCapture = (event: KeyboardEvent) => {
      const current = ref.current;
      const isCopy = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c';
      if (!isCopy || isEditableTarget(event.target) || isModelEmpty(current.model)) return;
      if (window.getSelection()?.toString()) return;
      event.preventDefault();
      event.stopPropagation(); // replaces Community's row/cell copy for this keystroke
      const text = toTsv(
        selectionToMatrix(current.model, current.rowOrder(), current.fieldOrder(), current.getText),
      );
      void navigator.clipboard?.writeText(text).catch(() => undefined);
      current.onCopy?.(text);
    };

    root.addEventListener('mousedown', onMouseDown);
    root.addEventListener('keydown', onKeyDownCapture, true);
    return () => {
      root.removeEventListener('mousedown', onMouseDown);
      root.removeEventListener('keydown', onKeyDownCapture, true);
    };
  }, [o.enabled, o.rootRef]);

  React.useEffect(() => {
    const root = o.rootRef.current;
    if (!root || !o.pasteEnabled) return undefined;
    const onPaste = (event: ClipboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const text = event.clipboardData?.getData('text/plain');
      if (!text) return;
      const current = ref.current;
      const origin =
        (current.enabled
          ? selectionOrigin(current.model, current.rowOrder(), current.fieldOrder())
          : null) ?? current.focusedCell();
      if (!origin) return;
      event.preventDefault();
      const matrix = (current.splitClipboardPastedText ?? defaultSplitClipboardText)(text);
      current.onPaste(origin, matrix);
    };
    root.addEventListener('paste', onPaste);
    return () => root.removeEventListener('paste', onPaste);
  }, [o.pasteEnabled, o.rootRef]);
}
