import * as React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  DataGrid,
  useGridAdvancedApiRef,
  type GridAdvancedApi,
  type GridColDef,
  type GridDataSource,
} from '../index.js';
import { ROW_GROUPING_SINGLE_FIELD } from '../features/grouping-aggregation/rowGrouping.js';
import { toDateInput } from '../features/sorting-filtering/HeaderFilterRow.js';
import { layoutSlots } from '../features/pinning-reordering/useColumnReorder.js';

type Row = { id: number; name: string; dept: string; salary: number; count?: number };
const rows: Row[] = [
  { id: 1, name: 'Ada', dept: 'Eng', salary: 300 },
  { id: 2, name: 'Bob', dept: 'Ops', salary: 100 },
  { id: 3, name: 'Cy', dept: 'Eng', salary: 200 },
  { id: 4, name: 'Di', dept: 'Ops', salary: 50 },
];
const columns: GridColDef<Row>[] = [
  { field: 'name', headerName: 'Name', editable: true },
  { field: 'dept', headerName: 'Dept' },
  { field: 'salary', headerName: 'Salary', type: 'number', editable: true },
];

type GridProps = Partial<React.ComponentProps<typeof DataGrid<Row>>>;
function Grid({ onApi, ...props }: GridProps & { onApi?: (api: GridAdvancedApi<Row>) => void }) {
  const apiRef = useGridAdvancedApiRef<Row>();
  React.useEffect(() => {
    if (apiRef.current) onApi?.(apiRef.current);
  });
  return (
    <div style={{ width: 800, height: 600 }}>
      <DataGrid<Row>
        rows={rows}
        columns={columns}
        disableVirtualization
        advancedApiRef={apiRef}
        {...props}
      />
    </div>
  );
}

const cellsOf = (field: string) =>
  Array.from(
    document.querySelectorAll(
      `.MuiDataGrid-row:not(.TectonDataGrid-row--detail):not(.TectonDataGrid-pinnedRow) [role="gridcell"][data-field="${field}"]`,
    ),
  ).map((c) => c.textContent);
const cell = (id: number, field: string) =>
  document.querySelector(`.MuiDataGrid-row[data-id="${id}"] [data-field="${field}"]`)!;
const tick = (ms = 50) => act(() => new Promise((r) => setTimeout(r, ms)));

describe('DataGrid server data', () => {
  it('does not re-request a failing group on every render', async () => {
    const getRows = vi.fn<GridDataSource<Row>['getRows']>(async (params) => {
      if (params.groupKeys.length === 0)
        return { rows: [{ id: 100, name: '', dept: 'Eng', salary: 0, count: 2 }], rowCount: 1 };
      throw new Error('children failed');
    });
    const onError = vi.fn();
    render(
      <Grid
        rows={undefined}
        rowGroupingModel={['dept']}
        onDataSourceError={onError}
        dataSource={{
          getRows,
          getGroupKey: (row) => row.dept,
          getChildrenCount: (row) => row.count ?? 0,
        }}
      />,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Expand' }));
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    await tick(200);
    const childCalls = getRows.mock.calls.filter(([p]) => p.groupKeys.length > 0);
    expect(childCalls).toHaveLength(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('refetchRows() goes to the server even with the default cache', async () => {
    let server = rows.map((r) => ({ ...r }));
    const getRows = vi.fn<GridDataSource<Row>['getRows']>(async () => ({
      rows: server,
      rowCount: server.length,
    }));
    let api!: GridAdvancedApi<Row>;
    render(<Grid rows={undefined} dataSource={{ getRows }} onApi={(a) => (api = a)} />);
    await waitFor(() => expect(cellsOf('name')).toEqual(['Ada', 'Bob', 'Cy', 'Di']));
    server = server.map((r) => (r.id === 1 ? { ...r, name: 'Ada v2' } : r));
    act(() => api.refetchRows());
    await waitFor(() => expect(getRows).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(cellsOf('name')[0]).toBe('Ada v2'));
  });

  it('drops local patches when the server sends new data', async () => {
    let server = rows.map((r) => ({ ...r }));
    const getRows = vi.fn<GridDataSource<Row>['getRows']>(async () => ({
      rows: server,
      rowCount: server.length,
    }));
    let api!: GridAdvancedApi<Row>;
    render(<Grid rows={undefined} dataSource={{ getRows }} onApi={(a) => (api = a)} />);
    await waitFor(() => expect(cellsOf('salary')[0]).toBe('300'));
    act(() => api.updateRows([{ id: 1, salary: 999 }]));
    expect(cellsOf('salary')[0]).toBe('999');
    server = server.map((r) => (r.id === 1 ? { ...r, salary: 400 } : r));
    act(() => api.refetchRows({ clearCache: true }));
    await waitFor(() => expect(cellsOf('salary')[0]).toBe('400'));
  });

  it('loads server tree data children without getGroupKey (row id as group key)', async () => {
    const getRows = vi.fn<GridDataSource<Row>['getRows']>(async (params) =>
      params.groupKeys.length === 0
        ? { rows: [{ id: 1, name: 'Parent', dept: 'x', salary: 0, count: 1 }], rowCount: 1 }
        : { rows: [{ id: 2, name: 'Child', dept: 'x', salary: 0 }], rowCount: 1 },
    );
    render(
      <Grid
        rows={undefined}
        treeData
        dataSource={{ getRows, getChildrenCount: (row) => row.count ?? 0 }}
      />,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Expand' }));
    await waitFor(() =>
      expect(getRows).toHaveBeenCalledWith(expect.objectContaining({ groupKeys: ['1'] })),
    );
    await waitFor(() => expect(cellsOf('name')).toEqual(['Parent', 'Child']));
  });
});

describe('DataGrid row updates and grouping', () => {
  it('re-adding a deleted id renders one new row', () => {
    let api!: GridAdvancedApi<Row>;
    render(<Grid onApi={(a) => (api = a)} />);
    act(() => api.updateRows([{ id: 1, _action: 'delete' }]));
    expect(cellsOf('name')).toEqual(['Bob', 'Cy', 'Di']);
    act(() => api.updateRows([{ id: 1, name: 'Again' }]));
    const names = cellsOf('name');
    expect(names.filter((n) => n === 'Again')).toHaveLength(1);
    expect(names).toHaveLength(4);
    expect(document.querySelectorAll('.MuiDataGrid-row[data-id="1"]')).toHaveLength(1);
  });

  it('sorts groups by the generated grouping column', () => {
    render(
      <Grid
        rowGroupingModel={['dept']}
        sortModel={[{ field: ROW_GROUPING_SINGLE_FIELD, sort: 'desc' }]}
      />,
    );
    const labels = Array.from(document.querySelectorAll('.TectonDataGrid-row--group')).map((row) =>
      row.getAttribute('data-id'),
    );
    expect(labels.length).toBe(2);
    expect(labels[0]).toContain('Ops');
    expect(labels[1]).toContain('Eng');
  });
});

describe('DataGrid clipboard paste', () => {
  it('respects isCellEditable and pairs paste start/end events', async () => {
    const processRowUpdate = vi.fn((row: Row) => row);
    const onClipboardPasteStart = vi.fn();
    const onClipboardPasteEnd = vi.fn();
    render(
      <Grid
        cellSelection
        processRowUpdate={processRowUpdate}
        isCellEditable={(params) => params.row.id !== 2}
        onClipboardPasteStart={onClipboardPasteStart}
        onClipboardPasteEnd={onClipboardPasteEnd}
      />,
    );
    fireEvent.mouseDown(cell(1, 'name'));
    const paste = new Event('paste', { bubbles: true }) as Event & { clipboardData: unknown };
    paste.clipboardData = { getData: () => 'One\nTwo\nThree' };
    await act(async () => {
      cell(1, 'name').dispatchEvent(paste);
    });
    await waitFor(() => expect(onClipboardPasteEnd).toHaveBeenCalledTimes(1));
    expect(onClipboardPasteStart).toHaveBeenCalledTimes(1);
    expect(cellsOf('name')).toEqual(['One', 'Bob', 'Three', 'Di']);
    expect(processRowUpdate).toHaveBeenCalledTimes(2);
  });

  it('reports rejected row updates and still ends the paste', async () => {
    const onProcessRowUpdateError = vi.fn();
    const onClipboardPasteEnd = vi.fn();
    render(
      <Grid
        cellSelection
        processRowUpdate={(row) => (row.id === 1 ? Promise.reject(new Error('nope')) : row)}
        onProcessRowUpdateError={onProcessRowUpdateError}
        onClipboardPasteEnd={onClipboardPasteEnd}
      />,
    );
    fireEvent.mouseDown(cell(1, 'name'));
    const paste = new Event('paste', { bubbles: true }) as Event & { clipboardData: unknown };
    paste.clipboardData = { getData: () => 'One\nTwo' };
    await act(async () => {
      cell(1, 'name').dispatchEvent(paste);
    });
    await waitFor(() => expect(onClipboardPasteEnd).toHaveBeenCalledTimes(1));
    expect(onProcessRowUpdateError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'nope' }),
    );
    expect(cellsOf('name')).toEqual(['Ada', 'Two', 'Cy', 'Di']);
  });
});

describe('DataGrid helpers', () => {
  it('formats header filter dates in local time for date and datetime-local inputs', () => {
    const d = new Date(2024, 0, 15, 0, 30);
    expect(toDateInput(d)).toBe('2024-01-15');
    expect(toDateInput(d, true)).toBe('2024-01-15T00:30');
    expect(toDateInput(new Date(NaN))).toBe('');
  });

  it('builds column drop slots for columns that are not rendered (virtualization)', () => {
    const slots = layoutSlots(
      {
        enabled: true,
        rootRef: { current: null },
        canMove: (f) => f !== '__check__',
        sectionOf: (f) => (f === 'pinned' ? 'left' : 'center'),
        onMove: () => {},
        columnLayout: () => [
          { field: 'pinned', width: 50 },
          { field: 'a', width: 100 },
          { field: 'b', width: 120 },
          { field: 'c', width: 80 },
        ],
      },
      'center',
      'b',
      1000,
    );
    expect(slots).toEqual([
      { field: 'a', start: 900, size: 100 },
      { field: 'b', start: 1000, size: 120 },
      { field: 'c', start: 1120, size: 80 },
    ]);
  });
});
