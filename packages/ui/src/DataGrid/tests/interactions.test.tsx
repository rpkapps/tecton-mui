import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DataGrid, useGridApiRef, type GridColDef, type GridDataSource } from '../index.js';

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
const cellsOf = (field: string) =>
  Array.from(
    document.querySelectorAll(
      `.MuiDataGrid-row:not(.TectonDataGrid-pinnedRow) [role="gridcell"][data-field="${field}"]`,
    ),
  ).map((c) => c.textContent);
const headerFields = () =>
  Array.from(document.querySelectorAll('.MuiDataGrid-columnHeader[data-field]')).map(
    (h) => (h as HTMLElement).dataset.field,
  );

function Harness(
  props: Partial<React.ComponentProps<typeof DataGrid<Row>>> & {
    onApi?: (api: ReturnType<typeof useGridApiRef>) => void;
  },
) {
  const apiRef = useGridApiRef();
  const { onApi, ...rest } = props;
  React.useEffect(() => {
    onApi?.(apiRef);
  }, [apiRef, onApi]);
  return (
    <div style={{ width: 800, height: 600 }}>
      <DataGrid<Row>
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        disableVirtualization
        {...rest}
      />
    </div>
  );
}

async function openColumnMenu(api: ReturnType<typeof useGridApiRef>, field: string) {
  await act(async () => api.current!.showColumnMenu(field));
  return screen.findByRole('menu');
}

describe('DataGrid column menu', () => {
  it('pins, groups, aggregates, sorts and moves columns from the menu', async () => {
    let api!: ReturnType<typeof useGridApiRef>;
    const onPinnedColumnsChange = vi.fn();
    const onRowGroupingModelChange = vi.fn();
    const onAggregationModelChange = vi.fn();
    const onColumnOrderChange = vi.fn();
    render(
      <Harness
        onApi={(a) => (api = a)}
        onPinnedColumnsChange={onPinnedColumnsChange}
        onRowGroupingModelChange={onRowGroupingModelChange}
        onAggregationModelChange={onAggregationModelChange}
        onColumnOrderChange={onColumnOrderChange}
      />,
    );
    await openColumnMenu(api, 'salary');
    fireEvent.click(screen.getByText('Pin to left'));
    expect(onPinnedColumnsChange).toHaveBeenCalledWith({ left: ['salary'], right: [] });
    expect(headerFields()[0]).toBe('salary');

    await openColumnMenu(api, 'salary');
    fireEvent.click(screen.getByText('Unpin'));
    expect(onPinnedColumnsChange).toHaveBeenLastCalledWith({ left: [], right: [] });

    await openColumnMenu(api, 'name');
    fireEvent.click(screen.getByText('Pin to right'));
    expect(headerFields().at(-1)).toBe('name');

    await openColumnMenu(api, 'salary');
    fireEvent.click(screen.getByRole('menuitem', { name: 'sum' }));
    expect(onAggregationModelChange).toHaveBeenCalledWith({ salary: 'sum' });

    await openColumnMenu(api, 'dept');
    fireEvent.click(screen.getByText('Group by Dept'));
    expect(onRowGroupingModelChange).toHaveBeenCalledWith(['dept']);
    expect(document.querySelectorAll('.TectonDataGrid-row--group')).toHaveLength(2);

    await openColumnMenu(api, 'dept');
    fireEvent.click(screen.getByText('Stop grouping by Dept'));
    expect(onRowGroupingModelChange).toHaveBeenLastCalledWith([]);

    await openColumnMenu(api, 'dept');
    fireEvent.click(screen.getByText('Move left'));
    expect(onColumnOrderChange).toHaveBeenCalledWith({
      field: 'dept',
      oldIndex: 1,
      targetIndex: 0,
    });

    await openColumnMenu(api, 'salary');
    fireEvent.click(screen.getByText(/sort by desc/i));
    expect(cellsOf('salary')).toEqual(['300', '200', '100']);
    await openColumnMenu(api, 'salary');
    fireEvent.click(screen.getByText(/unsort/i));
    expect(cellsOf('salary')).toEqual(['300', '100', '200']);
  }, 60_000);
});

describe('DataGrid filter panel', () => {
  it('adds, edits and removes multiple filter items', async () => {
    let api!: ReturnType<typeof useGridApiRef>;
    const onFilterModelChange = vi.fn();
    render(<Harness onApi={(a) => (api = a)} onFilterModelChange={onFilterModelChange} />);
    await act(async () => api.current!.showFilterPanel());
    expect(onFilterModelChange).toHaveBeenCalled();
    fireEvent.click(await screen.findByRole('button', { name: 'Add filter' }));
    const model = onFilterModelChange.mock.lastCall![0];
    expect(model.items.length).toBe(2);
    const valueInputs = screen.getAllByRole('textbox', { name: /value/i });
    fireEvent.change(valueInputs[0], { target: { value: 'Ad' } });
    await waitFor(() => expect(cellsOf('name')).toEqual(['Ada']));
    fireEvent.click(screen.getByRole('button', { name: 'Remove all' }));
    await waitFor(() => expect(cellsOf('name')).toEqual(['Ada', 'Bob', 'Cy']));
  });

  it('merges filters started from the Community column menu', async () => {
    let api!: ReturnType<typeof useGridApiRef>;
    const onFilterModelChange = vi.fn();
    render(
      <Harness
        onApi={(a) => (api = a)}
        filterModel={{ items: [{ id: 'x', field: 'name', operator: 'contains', value: 'a' }] }}
        onFilterModelChange={onFilterModelChange}
      />,
    );
    await act(async () => api.current!.showFilterPanel('dept'));
    const merged = onFilterModelChange.mock.calls.find(([m]) => m.items.length === 2)?.[0];
    expect(merged.items.map((i: { field: string }) => i.field)).toEqual(['name', 'dept']);
  });
});

function rect(left: number, width: number, top = 0, height = 40): DOMRect {
  return {
    left,
    width,
    top,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON() {},
  } as DOMRect;
}

describe('DataGrid drag reordering', () => {
  it('reorders columns by dragging a header', () => {
    const onColumnOrderChange = vi.fn();
    render(<Harness onColumnOrderChange={onColumnOrderChange} />);
    const headers = Array.from(
      document.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]'),
    );
    headers.forEach((h, i) =>
      vi.spyOn(h, 'getBoundingClientRect').mockReturnValue(rect(i * 100, 100)),
    );
    const salary = headers.find((h) => h.dataset.field === 'salary')!;
    fireEvent.pointerDown(salary, { button: 0, clientX: 250 });
    fireEvent.pointerMove(window, { clientX: 230 });
    fireEvent.pointerMove(window, { clientX: 20 });
    // Live feedback: a ghost follows the pointer and the other columns slide aside.
    expect(document.querySelector('.TectonDataGrid-dragGhost')?.textContent).toBe('Salary');
    expect(document.querySelector('style[data-tecton-grid-drag]')?.textContent).toContain(
      '[data-field="name"]{transform:translateX(100px)',
    );
    expect(salary.classList.contains('MuiDataGrid-columnHeader--moving')).toBe(true);
    fireEvent.pointerUp(window);
    expect(document.querySelector('.TectonDataGrid-dragGhost')).toBeNull();
    expect(onColumnOrderChange).toHaveBeenCalledWith({
      field: 'salary',
      oldIndex: 2,
      targetIndex: 0,
    });
    expect(headerFields()).toEqual(['salary', 'name', 'dept']);
    // The click that ends a drag must not sort.
    fireEvent.click(salary.querySelector('.MuiDataGrid-columnHeaderTitleContainer')!);
    expect(cellsOf('salary')).toEqual(['300', '100', '200']);
    // Dropping beyond the last header appends.
    const fresh = Array.from(
      document.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]'),
    );
    fresh.forEach((h, i) =>
      vi.spyOn(h, 'getBoundingClientRect').mockReturnValue(rect(i * 100, 100)),
    );
    fireEvent.pointerDown(fresh[0], { button: 0, clientX: 50 });
    fireEvent.pointerMove(window, { clientX: 500 });
    fireEvent.pointerUp(window);
    expect(headerFields()).toEqual(['name', 'dept', 'salary']);
    // Escape cancels a drag in progress.
    const again = Array.from(
      document.querySelectorAll<HTMLElement>('.MuiDataGrid-columnHeader[data-field]'),
    );
    again.forEach((h, i) =>
      vi.spyOn(h, 'getBoundingClientRect').mockReturnValue(rect(i * 100, 100)),
    );
    fireEvent.pointerDown(again[2], { button: 0, clientX: 250 });
    fireEvent.pointerMove(window, { clientX: 20 });
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.pointerUp(window);
    expect(headerFields()).toEqual(['name', 'dept', 'salary']);
    expect(document.querySelector('.TectonDataGrid-dragGhost')).toBeNull();
  });

  it('reorders rows with the drag handle and keyboard, and undoes the move', async () => {
    const onRowOrderChange = vi.fn();
    render(<Harness rowReordering onRowOrderChange={onRowOrderChange} historyStackSize={5} />);
    const rowEl = (id: number) =>
      document.querySelector<HTMLElement>(`.MuiDataGrid-row[data-id="${id}"]`)!;
    // jsdom has no layout: give rows natural positions (offsetTop ignores the slide transforms).
    [1, 2, 3].forEach((id, i) => {
      Object.defineProperty(rowEl(id), 'offsetTop', { configurable: true, value: i * 50 });
      Object.defineProperty(rowEl(id), 'offsetHeight', { configurable: true, value: 50 });
      vi.spyOn(rowEl(id), 'getBoundingClientRect').mockReturnValue(rect(0, 800, i * 50, 50));
    });
    const handle = rowEl(1).querySelector<HTMLElement>('[data-row-reorder-handle]')!;
    fireEvent.pointerDown(handle, { button: 0, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 10, clientY: 90 });
    // The source row is dimmed and the row it passed slides up into its slot.
    expect(rowEl(1).classList.contains('MuiDataGrid-row--beingDragged')).toBe(true);
    expect(document.querySelector('style[data-tecton-grid-drag]')?.textContent).toContain(
      '[data-id="2"]{transform:translateY(-50px)',
    );
    expect(document.querySelector('.TectonDataGrid-dragGhost')?.textContent).toBe('Ada');
    fireEvent.pointerMove(window, { clientX: 10, clientY: 140 });
    fireEvent.pointerUp(window);
    expect(rowEl(1).classList.contains('MuiDataGrid-row--beingDragged')).toBe(false);
    expect(onRowOrderChange).toHaveBeenCalledWith({ row: rows[0], oldIndex: 0, targetIndex: 2 });
    expect(cellsOf('name')).toEqual(['Bob', 'Cy', 'Ada']);
    const bobHandle = document.querySelector<HTMLElement>(
      '.MuiDataGrid-row[data-id="2"] [data-row-reorder-handle]',
    )!;
    fireEvent.keyDown(bobHandle, { key: 'ArrowDown', altKey: true });
    expect(cellsOf('name')).toEqual(['Cy', 'Bob', 'Ada']);
    fireEvent.keyDown(document.querySelector('.MuiDataGrid-root')!, { key: 'z', ctrlKey: true });
    await waitFor(() => expect(cellsOf('name')).toEqual(['Bob', 'Cy', 'Ada']));
    fireEvent.keyDown(document.querySelector('.MuiDataGrid-root')!, { key: 'y', ctrlKey: true });
    await waitFor(() => expect(cellsOf('name')).toEqual(['Cy', 'Bob', 'Ada']));
  });

  it('disables row reordering while sorted', () => {
    render(<Harness rowReordering sortModel={[{ field: 'name', sort: 'asc' }]} />);
    expect(document.querySelector('[data-row-reorder-handle]')).toBeDisabled();
  });
});

describe('DataGrid server-side features', () => {
  it('loads group children on expansion (server-side grouping)', async () => {
    const getRows = vi.fn<GridDataSource<Row & { count?: number }>['getRows']>(async (params) => {
      if (params.groupKeys.length === 0) {
        return { rows: [{ id: 100, name: '', dept: 'Eng', salary: 500, count: 2 }], rowCount: 1 };
      }
      return { rows: rows.filter((r) => r.dept === params.groupKeys[0]), rowCount: 2 };
    });
    render(
      <Harness
        rows={undefined}
        rowGroupingModel={['dept']}
        dataSource={{
          getRows,
          getGroupKey: (row) => row.dept,
          getChildrenCount: (row) => (row as { count?: number }).count ?? 0,
          getAggregatedValue: (row, field) => (field === 'salary' ? row.salary : undefined),
        }}
        aggregationModel={{ salary: 'sum' }}
      />,
    );
    await waitFor(() => expect(getRows).toHaveBeenCalled());
    const toggle = await screen.findByRole('button', { name: 'Expand' });
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(getRows).toHaveBeenCalledWith(
        expect.objectContaining({ groupKeys: ['Eng'], groupFields: ['dept'] }),
      ),
    );
    await waitFor(() => expect(cellsOf('name')).toEqual(['', 'Ada', 'Cy']));
  });

  it('lazy loads rows for the rendered range', async () => {
    let api!: ReturnType<typeof useGridApiRef>;
    const all = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      name: `r${i}`,
      dept: 'x',
      salary: i,
    }));
    const getRows = vi.fn<GridDataSource<Row>['getRows']>(async (params) => ({
      rows: all.slice(params.start, params.end + 1),
      rowCount: all.length,
    }));
    render(
      <Harness
        onApi={(a) => (api = a)}
        rows={undefined}
        lazyLoading
        lazyLoadingRequestThrottleMs={0}
        dataSource={{ getRows }}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
      />,
    );
    await waitFor(() => expect(cellsOf('name')[0]).toBe('r0'));
    expect(document.querySelectorAll('.TectonDataGrid-row--skeleton').length).toBe(20);
    act(() =>
      api.current!.publishEvent('renderedRowsIntervalChange', {
        firstRowIndex: 12,
        lastRowIndex: 25,
      } as never),
    );
    await waitFor(() =>
      expect(getRows).toHaveBeenCalledWith(expect.objectContaining({ start: 10, end: 19 })),
    );
    await waitFor(() =>
      expect(document.querySelectorAll('.TectonDataGrid-row--skeleton').length).toBe(0),
    );
  });
});

describe('DataGrid editing history', () => {
  it('undoes and redoes pasted values', async () => {
    const processRowUpdate = vi.fn((row: Row) => row);
    render(<Harness cellSelection historyStackSize={5} processRowUpdate={processRowUpdate} />);
    const cell = document.querySelector('.MuiDataGrid-row[data-id="1"] [data-field="name"]')!;
    fireEvent.mouseDown(cell);
    const paste = new Event('paste', { bubbles: true }) as Event & { clipboardData: unknown };
    paste.clipboardData = { getData: () => 'Zed' };
    await act(async () => {
      cell.dispatchEvent(paste);
    });
    await waitFor(() => expect(cellsOf('name')[0]).toBe('Zed'));
    const root = document.querySelector('.MuiDataGrid-root')!;
    await act(async () => {
      fireEvent.keyDown(root, { key: 'z', ctrlKey: true });
    });
    await waitFor(() => expect(cellsOf('name')[0]).toBe('Ada'));
    await act(async () => {
      fireEvent.keyDown(root, { key: 'z', ctrlKey: true, shiftKey: true });
    });
    await waitFor(() => expect(cellsOf('name')[0]).toBe('Zed'));
  });
});

describe('DataGrid checkbox column', () => {
  it('keeps the Community checkbox classes, also when columns are pinned', () => {
    render(<Harness checkboxSelection pinnedColumns={{ left: ['name'] }} />);
    const header = document.querySelector('.MuiDataGrid-columnHeader[data-field="__check__"]')!;
    expect(header.classList.contains('MuiDataGrid-columnHeaderCheckbox')).toBe(true);
    expect(header.classList.contains('MuiDataGrid-columnHeader--pinnedLeft')).toBe(true);
    const cell = document.querySelector(
      '.MuiDataGrid-row .MuiDataGrid-cell[data-field="__check__"]',
    )!;
    expect(cell.classList.contains('MuiDataGrid-cellCheckbox')).toBe(true);
  });
});
