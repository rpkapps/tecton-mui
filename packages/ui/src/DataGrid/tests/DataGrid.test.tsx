import * as React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { DataGrid, useGridAdvancedApiRef, type GridColDef, type GridDataSource } from '../index.js';

type Row = { id: number; name: string; dept: string; salary: number };
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

function Grid(props: Partial<React.ComponentProps<typeof DataGrid<Row>>>) {
  return (
    <div style={{ width: 800, height: 600 }}>
      <DataGrid<Row> rows={rows} columns={columns} disableVirtualization {...props} />
    </div>
  );
}

const cellsOf = (field: string) =>
  Array.from(
    document.querySelectorAll(
      `.MuiDataGrid-row:not(.TectonDataGrid-row--detail):not(.TectonDataGrid-pinnedRow) [role="gridcell"][data-field="${field}"]`,
    ),
  ).map((c) => c.textContent);

describe('DataGrid (unified)', () => {
  it('renders like the Community grid without advanced props', () => {
    render(<Grid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(cellsOf('name')).toEqual(['Ada', 'Bob', 'Cy', 'Di']);
    expect(document.querySelector('.TectonDataGrid-pagination')).toBeInTheDocument();
  });

  it('sorts by multiple columns (controlled model) and via header clicks', () => {
    const onSortModelChange = vi.fn();
    const { rerender } = render(
      <Grid
        sortModel={[
          { field: 'dept', sort: 'asc' },
          { field: 'salary', sort: 'asc' },
        ]}
        onSortModelChange={onSortModelChange}
      />,
    );
    expect(cellsOf('name')).toEqual(['Cy', 'Ada', 'Di', 'Bob']);
    rerender(<Grid />);
    const header = document.querySelector(
      '.MuiDataGrid-columnHeader[data-field="salary"] .MuiDataGrid-columnHeaderTitleContainer',
    )!;
    fireEvent.click(header);
    expect(cellsOf('salary')).toEqual(['50', '100', '200', '300']);
    fireEvent.click(
      document.querySelector(
        '.MuiDataGrid-columnHeader[data-field="dept"] .MuiDataGrid-columnHeaderTitleContainer',
      )!,
      {
        shiftKey: true,
      },
    );
    expect(cellsOf('name')).toEqual(['Di', 'Bob', 'Cy', 'Ada']);
    expect(
      document.querySelector('.MuiDataGrid-columnHeader[data-field="dept"]')!.textContent,
    ).toContain('priority 2');
  });

  it('filters with a multi-item model and header filters', async () => {
    const { rerender } = render(
      <Grid
        filterModel={{
          items: [
            { id: 1, field: 'dept', operator: 'equals', value: 'Eng' },
            { id: 2, field: 'salary', operator: '>', value: 250 },
          ],
        }}
      />,
    );
    expect(cellsOf('name')).toEqual(['Ada']);
    rerender(<Grid headerFilters />);
    const input = screen.getByRole('textbox', { name: 'Filter Name' });
    fireEvent.change(input, { target: { value: 'd' } });
    await waitFor(() => expect(cellsOf('name')).toEqual(['Ada', 'Di']));
  });

  it('paginates beyond the Community 100-row limit and can disable pagination', () => {
    const many = Array.from({ length: 250 }, (_, i) => ({
      id: i,
      name: `n${i}`,
      dept: 'x',
      salary: i,
    }));
    const onPaginationModelChange = vi.fn();
    const { rerender } = render(
      <Grid
        rows={many}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 200 } } }}
        pageSizeOptions={[200]}
        onPaginationModelChange={onPaginationModelChange}
      />,
    );
    expect(cellsOf('name')).toHaveLength(200);
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(cellsOf('name')).toHaveLength(50);
    expect(onPaginationModelChange).toHaveBeenCalledWith(
      { page: 1, pageSize: 200 },
      expect.anything(),
    );
    rerender(<Grid rows={many} pagination={false} />);
    expect(cellsOf('name')).toHaveLength(250);
    expect(document.querySelector('.TectonDataGrid-pagination')).toBeNull();
  });

  it('groups rows, aggregates, and toggles groups without re-rendering other rows', () => {
    const renders = vi.fn();
    const cols: GridColDef<Row>[] = [
      ...columns.slice(0, 2),
      {
        ...columns[2],
        renderCell: (params) => {
          renders(params.id);
          return String(params.value);
        },
      },
    ];
    render(
      <Grid columns={cols} rowGroupingModel={['dept']} aggregationModel={{ salary: 'sum' }} />,
    );
    const groupRows = document.querySelectorAll('.TectonDataGrid-row--group');
    expect(groupRows).toHaveLength(2);
    expect(groupRows[0].getAttribute('aria-expanded')).toBe('false');
    expect(groupRows[0].querySelector('[data-field="salary"]')!.textContent).toBe('500');
    expect(document.querySelector('.TectonDataGrid-aggregationRow')!.textContent).toContain('650');
    renders.mockClear();
    fireEvent.click(within(groupRows[0] as HTMLElement).getByRole('button', { name: 'Expand' }));
    expect(
      document.querySelectorAll('.TectonDataGrid-row--group')[0].getAttribute('aria-expanded'),
    ).toBe('true');
    expect(cellsOf('name')).toContain('Ada');
    // Only the newly visible leaf rows render their cells; the other group row is not re-rendered.
    expect(new Set(renders.mock.calls.map(([id]) => id))).toEqual(new Set([1, 3]));
  });

  it('renders tree data with indentation levels', () => {
    const files = [
      { id: 1, path: ['a'], size: 1 },
      { id: 2, path: ['a', 'b'], size: 2 },
    ];
    render(
      <div style={{ width: 800, height: 400 }}>
        <DataGrid
          rows={files}
          columns={[{ field: 'size', type: 'number' }]}
          treeData
          getTreeDataPath={(r) => r.path}
          defaultGroupingExpansionDepth={-1}
          disableVirtualization
        />
      </div>,
    );
    const levels = Array.from(document.querySelectorAll('.MuiDataGrid-row')).map((r) =>
      r.getAttribute('aria-level'),
    );
    expect(levels).toEqual(['1', '2']);
    expect(document.querySelector('[data-field="__tree_data_group__"]')).toBeInTheDocument();
  });

  it('expands detail panels', () => {
    const onChange = vi.fn();
    render(
      <Grid
        getDetailPanelContent={({ row }) => <div data-testid="detail">{`Detail ${row.name}`}</div>}
        getDetailPanelHeight={() => 50}
        onDetailPanelExpandedRowIdsChange={onChange}
      />,
    );
    fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]);
    expect(screen.getByTestId('detail')).toHaveTextContent('Detail Ada');
    expect(onChange).toHaveBeenCalledWith(new Set([1]));
    expect(document.querySelector('.TectonDataGrid-detailPanel')).toHaveAttribute('role', 'region');
  });

  it('pins columns with sticky classes and exposes the advanced API', () => {
    const apiRef = { current: null } as React.RefObject<
      import('../index.js').GridAdvancedApi<Row> | null
    >;
    render(<Grid pinnedColumns={{ left: ['salary'] }} advancedApiRef={apiRef} />);
    const header = document.querySelector('.MuiDataGrid-columnHeader[data-field="salary"]')!;
    expect(header.className).toContain('MuiDataGrid-columnHeader--pinnedLeft');
    const fields = Array.from(document.querySelectorAll('.MuiDataGrid-columnHeader')).map(
      (h) => (h as HTMLElement).dataset.field,
    );
    expect(fields[0]).toBe('salary');
    expect(apiRef.current!.getPinnedColumns()).toEqual({ left: ['salary'], right: [] });
    act(() => apiRef.current!.setSortModel([{ field: 'name', sort: 'desc' }]));
    expect(cellsOf('name')).toEqual(['Di', 'Cy', 'Bob', 'Ada']);
    act(() => apiRef.current!.setColumnIndex('dept', 0));
    expect(apiRef.current!.getColumnOrder()[0]).toBe('dept');
    expect(apiRef.current!.getVisibleRows()).toHaveLength(4);
  });

  it('applies batched row updates and undo/redo', async () => {
    function WithApi() {
      const apiRef = useGridAdvancedApiRef<Row>();
      return (
        <>
          <button
            onClick={() =>
              apiRef.current!.updateRows([
                { id: 1, salary: 999 },
                { id: 2, _action: 'delete' },
                { id: 9, name: 'New', dept: 'X', salary: 1 },
              ])
            }
          >
            update
          </button>
          <button onClick={() => void apiRef.current!.undo()}>undo</button>
          <Grid advancedApiRef={apiRef} historyStackSize={10} />
        </>
      );
    }
    render(<WithApi />);
    fireEvent.click(screen.getByText('update'));
    expect(cellsOf('salary')).toEqual(['999', '200', '50', '1']);
    expect(cellsOf('name')).toContain('New');
  });

  it('loads server data with multi-models through a data source', async () => {
    const getRows = vi.fn<GridDataSource<Row>['getRows']>(async (params) => {
      const sorted = [...rows].sort((a, b) =>
        params.sortModel[0]?.sort === 'desc' ? b.salary - a.salary : a.salary - b.salary,
      );
      return {
        rows: sorted.slice(params.start, params.end + 1),
        rowCount: rows.length,
        aggregateRow: { salary: 650 },
      };
    });
    const onError = vi.fn();
    render(
      <Grid
        rows={undefined}
        dataSource={{ getRows }}
        dataSourceCache={null}
        aggregationModel={{ salary: 'sum' }}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 2 } } }}
        pageSizeOptions={[2]}
        onDataSourceError={onError}
      />,
    );
    await waitFor(() => expect(cellsOf('salary')).toEqual(['50', '100']));
    expect(getRows).toHaveBeenCalledWith(
      expect.objectContaining({
        start: 0,
        end: 1,
        groupKeys: [],
        aggregationModel: { salary: 'sum' },
      }),
    );
    expect(document.querySelector('.TectonDataGrid-aggregationRow')!.textContent).toContain('650');
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));
    await waitFor(() => expect(cellsOf('salary')).toEqual(['200', '300']));
    expect(onError).not.toHaveBeenCalled();
  });

  it('reports data source errors', async () => {
    const onError = vi.fn();
    render(
      <Grid
        rows={undefined}
        dataSource={{ getRows: () => Promise.reject(new Error('boom')) }}
        onDataSourceError={onError}
      />,
    );
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' })),
    );
  });

  it('selects cell ranges, copies TSV and pastes into editable cells', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.assign(navigator, { clipboard: { writeText } });
    const processRowUpdate = vi.fn((row: Row) => row);
    const onCellSelectionModelChange = vi.fn();
    render(
      <Grid
        cellSelection
        processRowUpdate={processRowUpdate}
        onCellSelectionModelChange={onCellSelectionModelChange}
      />,
    );
    const cell = (id: number, field: string) =>
      document.querySelector(`.MuiDataGrid-row[data-id="${id}"] [data-field="${field}"]`)!;
    fireEvent.mouseDown(cell(1, 'name'));
    fireEvent.mouseOver(cell(2, 'dept'));
    fireEvent.mouseUp(window);
    expect(onCellSelectionModelChange).toHaveBeenLastCalledWith({
      1: { name: true, dept: true },
      2: { name: true, dept: true },
    });
    expect(document.querySelector('style[data-tecton-grid-selection]')!.textContent).toContain(
      'data-field',
    );
    fireEvent.keyDown(cell(1, 'name'), { key: 'c', ctrlKey: true });
    expect(writeText).toHaveBeenCalledWith('Ada\tEng\r\nBob\tOps');
    fireEvent.mouseDown(cell(3, 'salary'), { ctrlKey: true });
    expect(onCellSelectionModelChange.mock.lastCall![0][3]).toEqual({ salary: true });
    fireEvent.mouseDown(cell(3, 'name'));
    const paste = new Event('paste', { bubbles: true }) as Event & { clipboardData: unknown };
    paste.clipboardData = { getData: () => 'Zed\t7\nYo\t8' };
    await act(async () => {
      cell(3, 'name').dispatchEvent(paste);
    });
    await waitFor(() => expect(cellsOf('name')).toEqual(['Ada', 'Bob', 'Zed', 'Yo']));
    expect(processRowUpdate).toHaveBeenCalledTimes(2);
  });
});
