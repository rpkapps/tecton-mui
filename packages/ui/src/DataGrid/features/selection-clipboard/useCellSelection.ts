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

function setStyleText(el: HTMLStyleElement | null, text: string): void {
  if (el) el.textContent = text;
}

const SELECTING_CLASS = 'TectonDataGrid--cellSelecting';
/** [row delta, column delta] per arrow key (column delta in LTR). */
const ARROW_STEPS: Record<string, readonly [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};
const cssEscape = (value: string) =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(value) : value.replace(/["\\]/g, '\\$&');

/** Layout-independent Ctrl/Cmd+V check (same rule as the Community grid). */
const isPasteShortcut = (event: KeyboardEvent) =>
  (event.ctrlKey || event.metaKey) &&
  !event.shiftKey &&
  !event.altKey &&
  String.fromCharCode(event.keyCode) === 'V';

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
    setStyleText(
      o.styleRef.current,
      o.enabled
        ? selectionCss(o.scope, o.model, ref.current.rowOrder(), ref.current.fieldOrder())
        : '',
    );
  }, [o.enabled, o.model, o.scope, o.styleRef]);

  React.useEffect(() => {
    const root = o.rootRef.current;
    if (!root || !o.enabled) return undefined;
    let anchor: CellCoord | null = null;
    /** The moving end of the range (extended by drag, Shift+click and Shift+Arrow keys). */
    let head: CellCoord | null = null;
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
        // Shift+click would otherwise extend a native text selection.
        event.preventDefault();
        window.getSelection()?.removeAllRanges();
        head = cell;
        current.setModel(rangeModel(anchor, cell, current.rowOrder(), current.fieldOrder()));
        return;
      }
      anchor = cell;
      head = cell;
      base = {};
      current.setModel({ [cell.id]: { [cell.field]: true } });
      const onMove = (e: MouseEvent) => {
        const over = cellFromEvent(e.target, ref.current.resolveId);
        if (!over || !anchor || over.field.startsWith('__')) return;
        if (over.id !== anchor.id || over.field !== anchor.field) {
          // Dragging across cells selects cells, not text.
          root.classList.add(SELECTING_CLASS);
          window.getSelection()?.removeAllRanges();
        }
        head = over;
        ref.current.setModel(
          mergeModels(
            base,
            rangeModel(anchor, over, ref.current.rowOrder(), ref.current.fieldOrder()),
          ),
        );
      };
      const onUp = () => {
        root.classList.remove(SELECTING_CLASS);
        root.removeEventListener('mouseover', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      root.addEventListener('mouseover', onMove);
      window.addEventListener('mouseup', onUp);
    };

    const onKeyDownCapture = (event: KeyboardEvent) => {
      const current = ref.current;
      if (isEditableTarget(event.target)) return;
      const step = ARROW_STEPS[event.key];
      if (step && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const focused = current.focusedCell() ?? cellFromEvent(event.target, current.resolveId);
        if (!focused || focused.field.startsWith('__')) return;
        const rows = current.rowOrder();
        const fields = current.fieldOrder();
        if (!anchor || !head || isModelEmpty(current.model)) {
          anchor = focused;
          head = focused;
        }
        const rtl = getComputedStyle(root).direction === 'rtl';
        const r = Math.min(rows.length - 1, Math.max(0, rows.indexOf(head.id) + step[0]));
        const c = Math.min(
          fields.length - 1,
          Math.max(0, fields.indexOf(head.field) + step[1] * (rtl ? -1 : 1)),
        );
        if (rows[r] === undefined || fields[c] === undefined) return;
        event.preventDefault();
        event.stopPropagation(); // Community would move focus / extend row selection instead
        head = { id: rows[r], field: fields[c] };
        current.setModel(rangeModel(anchor, head, rows, fields));
        root
          .querySelector(
            `.MuiDataGrid-row[data-id="${cssEscape(String(head.id))}"] > .MuiDataGrid-cell[data-field="${cssEscape(head.field)}"]`,
          )
          ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        return;
      }
      if (step && !event.shiftKey) {
        // Plain navigation starts a new range from the next focused cell.
        anchor = null;
        head = null;
        return;
      }
      const isCopy = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c';
      if (!isCopy || isModelEmpty(current.model)) return;
      // A text selection inside the grid is a leftover of pointer interaction: copy the cells.
      const selection = window.getSelection();
      if (selection?.toString()) {
        if (!selection.anchorNode || !root.contains(selection.anchorNode)) return;
        selection.removeAllRanges();
      }
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
    // Community starts editing the focused cell on Ctrl/Cmd+V (so the paste lands in its input).
    // With grid paste enabled, the keystroke must not reach the cell; the native paste event still
    // fires on the focused cell and is handled above.
    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (!isPasteShortcut(event) || isEditableTarget(event.target)) return;
      const cell = (event.target as Element | null)?.closest?.('.MuiDataGrid-cell');
      if (!cell || cell.classList.contains('MuiDataGrid-cell--editing')) return;
      event.stopPropagation();
    };
    root.addEventListener('paste', onPaste);
    root.addEventListener('keydown', onKeyDownCapture, true);
    return () => {
      root.removeEventListener('paste', onPaste);
      root.removeEventListener('keydown', onKeyDownCapture, true);
    };
  }, [o.pasteEnabled, o.rootRef]);
}
