import * as React from 'react';
import { act } from '@testing-library/react';
import { createRoot, hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { DataGrid, type GridCellSelectionModel, type GridColDef } from '../index.js';
import { GRID_SCOPE_ATTRIBUTE, nextGridScope } from '../core/scope.js';

// Micro-frontends mount grids in independent React roots on one page. Hydrated roots (and roots
// rendered by separate React copies) produce the same `useId()` values, so anything that scopes
// page-level CSS to one grid must not rely on them.

type Row = { id: number; name: string; dept: string };
const rows: Row[] = [
  { id: 1, name: 'Ada', dept: 'Eng' },
  { id: 2, name: 'Bob', dept: 'Ops' },
];
const columns: GridColDef<Row>[] = [
  { field: 'name', headerName: 'Name' },
  { field: 'dept', headerName: 'Dept' },
];

const selected: GridCellSelectionModel = {
  1: { name: true, dept: true },
  2: { name: true, dept: true },
};

function Grid(props: { cellSelectionModel?: GridCellSelectionModel }) {
  return (
    <div style={{ width: 800, height: 600 }}>
      <DataGrid<Row> rows={rows} columns={columns} disableVirtualization cellSelection {...props} />
    </div>
  );
}

const roots: Root[] = [];

/**
 * Server-renders a grid into a new container, then hydrates it in its own React root. Both trees
 * have the same shape, so before the fix both grids derived the same scope from `useId()`.
 */
async function hydrateGrid(element: React.ReactElement): Promise<HTMLElement> {
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = renderToString(element);
  await act(async () => {
    roots.push(hydrateRoot(container, element, { onRecoverableError: () => {} }));
  });
  return container;
}

const scopeOf = (container: HTMLElement) =>
  container.querySelector('.MuiDataGrid-root')?.getAttribute(GRID_SCOPE_ATTRIBUTE);

afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.innerHTML = '';
});

describe('DataGrid in independent React roots', () => {
  it('keeps the cell selection of one hydrated root out of the other', async () => {
    const a = await hydrateGrid(<Grid cellSelectionModel={selected} />);
    const b = await hydrateGrid(<Grid />);
    expect(scopeOf(a)).toBeTruthy();
    expect(scopeOf(b)).toBeTruthy();
    expect(scopeOf(a)).not.toBe(scopeOf(b));

    const css = a.querySelector('style[data-tecton-grid-selection]')!.textContent!;
    const tint = css.slice(0, css.indexOf('{'));
    expect(tint).not.toBe('');
    const highlighted = Array.from(document.querySelectorAll(tint));
    expect(highlighted).toHaveLength(4);
    expect(highlighted.every((element) => a.contains(element))).toBe(true);
    expect(b.querySelectorAll('.MuiDataGrid-cell[data-field="name"]').length).toBeGreaterThan(0);
    expect(b.querySelector('style[data-tecton-grid-selection]')!.textContent).toBe('');
  });

  it('gives grids in client-rendered roots distinct scopes too', async () => {
    const a = document.body.appendChild(document.createElement('div'));
    const b = document.body.appendChild(document.createElement('div'));
    await act(async () => {
      for (const container of [a, b]) {
        const root = createRoot(container);
        root.render(<Grid />);
        roots.push(root);
      }
    });
    expect(scopeOf(a)).toBeTruthy();
    expect(scopeOf(a)).not.toBe(scopeOf(b));
  });

  it('renders no scope on the server, so hydration markup matches', () => {
    const html = renderToString(<Grid />);
    expect(html).toContain('data-tecton-grid-selection=""');
    expect(html).not.toContain(GRID_SCOPE_ATTRIBUTE);
  });

  it('shares the scope counter with other copies of the library on the page', () => {
    const counter = Symbol.for('tecton-mui.dataGridScope');
    const registry = globalThis as unknown as Record<symbol, number | undefined>;
    // Another copy (a second micro-frontend bundle) has already handed out 40 more scopes.
    registry[counter] = (registry[counter] ?? 0) + 40;
    const expected = String(registry[counter] + 1);
    expect(nextGridScope()).toBe(expected);
  });
});
