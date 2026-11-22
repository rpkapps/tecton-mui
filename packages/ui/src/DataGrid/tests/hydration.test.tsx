import * as React from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { DataGrid, type GridColDef } from '../index.js';

// After hydration the Community grid renders its root one render late (`useIsSSR`): the first
// client commit matches the server markup, which has no grid root. Every feature that listens on
// the root must still attach once the root appears.

type Row = { id: number; name: string; dept: string; salary: number };
const rows: Row[] = [
  { id: 1, name: 'Ada', dept: 'Eng', salary: 300 },
  { id: 2, name: 'Bob', dept: 'Ops', salary: 100 },
  { id: 3, name: 'Cy', dept: 'Eng', salary: 200 },
];
const columns: GridColDef<Row>[] = [
  { field: 'name', headerName: 'Name', editable: true },
  { field: 'dept', headerName: 'Dept' },
  { field: 'salary', headerName: 'Salary', type: 'number', editable: true },
];

type GridProps = Partial<React.ComponentProps<typeof DataGrid<Row>>>;
function Grid(props: GridProps) {
  return (
    <div style={{ width: 800, height: 600 }}>
      <DataGrid<Row> rows={rows} columns={columns} disableVirtualization {...props} />
    </div>
  );
}

const roots: Root[] = [];

/** Server-renders the grid, then hydrates it in its own React root. */
async function hydrateGrid(props: GridProps = {}): Promise<HTMLElement> {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(<Grid {...props} />);
  await act(async () => {
    roots.push(hydrateRoot(container, <Grid {...props} />, { onRecoverableError: () => {} }));
  });
  return container;
}

async function renderGrid(props: GridProps = {}): Promise<HTMLElement> {
  const container = document.body.appendChild(document.createElement('div'));
  await act(async () => {
    const root = createRoot(container);
    root.render(<Grid {...props} />);
    roots.push(root);
  });
  return container;
}

afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

const gridRoot = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.MuiDataGrid-root')!;
const cell = (container: HTMLElement, id: number, field: string) =>
  container.querySelector<HTMLElement>(
    `.MuiDataGrid-row[data-id="${id}"] [data-field="${field}"]`,
  )!;
const header = (container: HTMLElement, field: string) =>
  container.querySelector<HTMLElement>(`.MuiDataGrid-columnHeader[data-field="${field}"]`)!;
const headerFields = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]')).map(
    (h) => h.dataset.field,
  );
const names = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll(
      '.MuiDataGrid-row:not(.TectonDataGrid-pinnedRow) [data-field="name"]',
    ),
  ).map((c) => c.textContent);
const rect = (x: number, width: number) =>
  ({ x, y: 0, left: x, top: 0, width, height: 40, right: x + width, bottom: 40 }) as DOMRect;

/** Counts the listeners that are attached to each event target (by type and capture phase). */
function trackListeners() {
  const active = new Map<EventTarget, Map<string, number>>();
  const keyOf = (type: string, options?: boolean | AddEventListenerOptions) =>
    `${type}${(typeof options === 'boolean' ? options : options?.capture) ? ' (capture)' : ''}`;
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  const count = (target: EventTarget, key: string, delta: number) => {
    const counts = active.get(target) ?? new Map<string, number>();
    counts.set(key, (counts.get(key) ?? 0) + delta);
    active.set(target, counts);
  };
  vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function (
    this: EventTarget,
    type,
    listener,
    options,
  ) {
    count(this, keyOf(type, options), 1);
    return add.call(this, type, listener, options);
  });
  vi.spyOn(EventTarget.prototype, 'removeEventListener').mockImplementation(function (
    this: EventTarget,
    type,
    listener,
    options,
  ) {
    count(this, keyOf(type, options), -1);
    return remove.call(this, type, listener, options);
  });
  return (target: EventTarget | null): string[] =>
    [...(target ? (active.get(target) ?? []) : [])]
      .filter(([, n]) => n > 0)
      .map(([key, n]) => `${key} x${n}`)
      .sort();
}

describe('DataGrid after hydration', () => {
  it('attaches the same root and scroller listeners as a client-rendered grid', async () => {
    const props: GridProps = {
      cellSelection: true,
      historyStackSize: 5,
      rowReordering: true,
      pinnedColumns: { left: ['name'], right: ['salary'] },
      onRowsScrollEnd: () => {},
    };
    const listeners = trackListeners();
    const client = await renderGrid(props);
    const hydrated = await hydrateGrid(props);
    const scroller = (container: HTMLElement) =>
      container.querySelector('.MuiDataGrid-virtualScroller');
    expect(listeners(gridRoot(client)).length).toBeGreaterThan(0);
    expect(listeners(gridRoot(hydrated))).toEqual(listeners(gridRoot(client)));
    expect(listeners(scroller(hydrated))).toEqual(listeners(scroller(client)));
  });

  it('selects, copies, pastes and undoes cell ranges', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.assign(navigator, { clipboard: { writeText } });
    const onCellSelectionModelChange = vi.fn();
    const grid = await hydrateGrid({
      cellSelection: true,
      historyStackSize: 5,
      processRowUpdate: (row) => row,
      onCellSelectionModelChange,
    });
    fireEvent.mouseDown(cell(grid, 1, 'name'));
    fireEvent.mouseOver(cell(grid, 2, 'dept'));
    fireEvent.mouseUp(window);
    expect(onCellSelectionModelChange).toHaveBeenLastCalledWith({
      1: { name: true, dept: true },
      2: { name: true, dept: true },
    });
    fireEvent.keyDown(cell(grid, 1, 'name'), { key: 'c', ctrlKey: true });
    expect(writeText).toHaveBeenCalledWith('Ada\tEng\r\nBob\tOps');

    fireEvent.mouseDown(cell(grid, 3, 'name'));
    const paste = new Event('paste', { bubbles: true }) as Event & { clipboardData: unknown };
    paste.clipboardData = { getData: () => 'Zed' };
    await act(async () => {
      cell(grid, 3, 'name').dispatchEvent(paste);
    });
    await waitFor(() => expect(names(grid)[2]).toBe('Zed'));
    await act(async () => {
      fireEvent.keyDown(gridRoot(grid), { key: 'z', ctrlKey: true });
    });
    await waitFor(() => expect(names(grid)[2]).toBe('Cy'));
  });

  it('moves a focused column header with Alt+Arrow keys', async () => {
    const grid = await hydrateGrid();
    fireEvent.keyDown(header(grid, 'name'), { key: 'ArrowRight', altKey: true });
    expect(headerFields(grid)).toEqual(['dept', 'name', 'salary']);
  });

  it('reorders columns by dragging a header', async () => {
    const grid = await hydrateGrid();
    Array.from(grid.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]')).forEach(
      (h, i) => vi.spyOn(h, 'getBoundingClientRect').mockReturnValue(rect(i * 100, 100)),
    );
    fireEvent.pointerDown(header(grid, 'salary'), { button: 0, clientX: 250 });
    fireEvent.pointerMove(window, { clientX: 230 });
    fireEvent.pointerMove(window, { clientX: 20 });
    fireEvent.pointerUp(window);
    expect(headerFields(grid)).toEqual(['salary', 'name', 'dept']);
  });

  it('writes the sticky offsets of pinned columns and the scroll edges', async () => {
    const grid = await hydrateGrid({ pinnedColumns: { left: ['name', 'dept'] } });
    const root = gridRoot(grid);
    expect(root.style.getPropertyValue('--tdg-pl-0')).toBe('0px');
    expect(root.style.getPropertyValue('--tdg-pl-1')).toMatch(/^\d+px$/);
    await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));
    expect(root.dataset.tdgScrollX).toBeTruthy();
    expect(root.dataset.tdgScrollY).toBeTruthy();
  });
});
