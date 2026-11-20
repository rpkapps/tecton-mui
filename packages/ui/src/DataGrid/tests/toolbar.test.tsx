import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  DataGrid,
  FilterPanelTrigger,
  Toolbar,
  ToolbarButton,
  type GridColDef,
  type GridFilterModel,
} from '../index.js';
import { ThemeProvider } from '../../styles/index.js';

type Row = { id: number; name: string; dept: string; salary: number };
const rows: Row[] = [
  { id: 1, name: 'Ada', dept: 'Eng', salary: 300 },
  { id: 2, name: 'Bob', dept: 'Ops', salary: 100 },
  { id: 3, name: 'Cy', dept: 'Eng', salary: 200 },
  { id: 4, name: 'Di', dept: 'Ops', salary: 50 },
];
const columns: GridColDef<Row>[] = [
  { field: 'name', headerName: 'Name' },
  { field: 'dept', headerName: 'Dept' },
  { field: 'salary', headerName: 'Salary', type: 'number' },
];
const twoFilters: GridFilterModel = {
  items: [
    { id: 1, field: 'dept', operator: 'equals', value: 'Eng' },
    { id: 2, field: 'salary', operator: '>', value: 150 },
  ],
};
const names = () =>
  Array.from(document.querySelectorAll('[role="gridcell"][data-field="name"]')).map(
    (c) => c.textContent,
  );

function Grid(props: Partial<React.ComponentProps<typeof DataGrid<Row>>>) {
  return (
    <ThemeProvider>
      <div style={{ width: 800, height: 600 }}>
        <DataGrid<Row> rows={rows} columns={columns} disableVirtualization {...props} />
      </div>
    </ThemeProvider>
  );
}

describe('DataGrid toolbar', () => {
  it('marks the default toolbar filter button with the unified filter model', () => {
    const { rerender } = render(<Grid showToolbar />);
    const badge = () =>
      screen.getByRole('button', { name: 'Filters' }).querySelector('.MuiBadge-badge')!;
    expect(badge()).toHaveClass('MuiBadge-invisible');
    // Two conditions: more than the Community grid itself accepts, so its own count stays 0.
    rerender(<Grid showToolbar filterModel={twoFilters} />);
    expect(names()).toEqual(['Ada', 'Cy']);
    expect(badge()).not.toHaveClass('MuiBadge-invisible');
  });

  it('shows the columns, filters and export controls and an export menu', () => {
    render(<Grid showToolbar />);
    expect(screen.getByRole('button', { name: 'Columns' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(screen.getAllByRole('menuitem').map((i) => i.textContent)).toEqual([
      'Print',
      'Download as CSV',
    ]);
  });

  it('filters rows with the quick filter', async () => {
    vi.useFakeTimers();
    try {
      render(<Grid showToolbar />);
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ops' } });
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
      expect(names()).toEqual(['Bob', 'Di']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('passes the active filter count to a custom FilterPanelTrigger', () => {
    function CustomToolbar() {
      return (
        <Toolbar>
          <FilterPanelTrigger
            render={(props, state) => (
              <ToolbarButton {...props}>{`Filters (${state.filterCount})`}</ToolbarButton>
            )}
          />
        </Toolbar>
      );
    }
    render(<Grid showToolbar slots={{ toolbar: CustomToolbar }} filterModel={twoFilters} />);
    expect(screen.getByRole('button', { name: 'Filters (2)' })).toBeInTheDocument();
  });

  it('can hide the quick filter and the export button through slotProps.toolbar', () => {
    render(
      <Grid
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: false,
            csvOptions: { disableToolbarButton: true },
            printOptions: { disableToolbarButton: true },
          } as never,
        }}
      />,
    );
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Export' })).toBeNull();
  });
});
