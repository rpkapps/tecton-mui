import * as React from 'react';

/** Attribute on the grid root that scopes the grid's generated stylesheets (cell selection). */
export const GRID_SCOPE_ATTRIBUTE = 'data-tecton-grid-scope';

// One counter per page, shared through the global symbol registry: two copies of the library on
// one page (micro-frontends that each bundle it) still hand out distinct scopes.
const COUNTER = Symbol.for('tecton-mui.dataGridScope');

/** The next page-unique grid scope. `''` on the server, where no stylesheet is written. */
export function nextGridScope(): string {
  if (typeof document === 'undefined') return '';
  const registry = globalThis as unknown as Record<symbol, number | undefined>;
  const next = (registry[COUNTER] ?? 0) + 1;
  registry[COUNTER] = next;
  return String(next);
}

/**
 * A scope that no other grid on the page shares, for selectors such as
 * `[data-tecton-grid-scope="3"] .MuiDataGrid-row`. `React.useId()` is not unique enough: two
 * independently hydrated React roots, or roots rendered by separate React copies, produce the same
 * ids, and one grid's selection would then highlight cells in the other.
 *
 * The returned ref writes the scope to the root element. It is never rendered, so the server and
 * client markup stay identical, and React leaves the attribute alone on re-render.
 */
export function useGridScope(): [scope: string, scopeRef: (element: HTMLElement | null) => void] {
  const [scope] = React.useState(nextGridScope);
  const scopeRef = React.useCallback(
    (element: HTMLElement | null) => {
      element?.setAttribute(GRID_SCOPE_ATTRIBUTE, scope);
    },
    [scope],
  );
  return [scope, scopeRef];
}

/** Selector prefix that matches only the grid with this scope. */
export const gridScopeSelector = (scope: string): string => `[${GRID_SCOPE_ATTRIBUTE}="${scope}"]`;
