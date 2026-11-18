import type { GridRowId, GridValidRowModel } from '@mui/x-data-grid';

export type HistoryOperation<R extends GridValidRowModel = GridValidRowModel> =
  | { type: 'rows'; changes: Array<{ id: GridRowId; before: R; after: R }> }
  | { type: 'rowOrder'; before: GridRowId[]; after: GridRowId[] };

/** Bounded undo/redo stack. Recording a new operation clears the redo branch. */
export class HistoryStack<R extends GridValidRowModel = GridValidRowModel> {
  private past: HistoryOperation<R>[] = [];
  private future: HistoryOperation<R>[] = [];

  constructor(public size: number) {}

  record(op: HistoryOperation<R>): void {
    if (this.size <= 0) return;
    this.past.push(op);
    if (this.past.length > this.size) this.past.shift();
    this.future = [];
  }

  popUndo(): HistoryOperation<R> | undefined {
    const op = this.past.pop();
    if (op) this.future.push(op);
    return op;
  }

  popRedo(): HistoryOperation<R> | undefined {
    const op = this.future.pop();
    if (op) this.past.push(op);
    return op;
  }

  canUndo = (): boolean => this.past.length > 0;
  canRedo = (): boolean => this.future.length > 0;

  clear(): void {
    this.past = [];
    this.future = [];
  }
}

export function isUndoShortcut(e: KeyboardEvent): boolean {
  return (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
}

export function isRedoShortcut(e: KeyboardEvent): boolean {
  const key = e.key.toLowerCase();
  return (e.ctrlKey || e.metaKey) && ((e.shiftKey && key === 'z') || (!e.shiftKey && key === 'y'));
}
