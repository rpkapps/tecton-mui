# Testing

| Layer                  | Tool                                | Command                                     | Location                                                |
| ---------------------- | ----------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Types                  | TypeScript (strict)                 | `pnpm typecheck`                            | every package with a `typecheck` script                 |
| Lint / format          | ESLint (flat config), Prettier      | `pnpm lint`, `pnpm format:check`            | `eslint.config.js`, `.prettierrc.json`                  |
| Generated output       | export generator, Tecton adapter    | `pnpm inventory:check`, `pnpm tecton:check` | `tooling/compatibility`, `packages/tecton-adapter`      |
| Unit / component / API | Vitest, Testing Library, jsdom      | `pnpm test`, `pnpm test:coverage`           | `packages/*/src/**/*.test.ts(x)`, `packages/*/tests/**` |
| Packaging              | Node, Vite (library build)          | `pnpm test:bundle`                          | `tooling/bundle-tests`                                  |
| Browser                | Playwright, `@axe-core/playwright`  | `pnpm test:e2e`                             | `tests/e2e`                                             |
| Docs                   | Vite build, prerender, link checker | `pnpm --filter @tecton-mui/docs build`      | `apps/docs/scripts`                                     |

## Vitest

- Configuration: root `vitest.config.ts`. It uses jsdom, globals and `tooling/vitest.setup.ts`
  (jest-dom matchers, cleanup, and `matchMedia` / `ResizeObserver` stubs). Workspace packages
  resolve to source through the `@tecton-mui/source` condition.
- Included: `packages/*/src/**/*.test.{ts,tsx}`, `packages/*/tests/**/*.test.{ts,tsx}`,
  `apps/*/src/**/*.test.{ts,tsx}`. Put tests next to the code in a `tests/` folder (for example
  `packages/ui/src/DataGrid/tests/`).
- **Coverage** (`pnpm test:coverage`, v8): statements, branches, functions and lines must each be
  at least **80%** across `packages/ui/src` and `packages/mcp/src`. Generated passthroughs, the
  generated Tecton output, the root barrel and the MCP CLI entry are excluded. Stricter
  per-component thresholds for the Data Grid, pickers and Tree View are planned (SPEC §11.2) but
  not configured yet.
- The MCP relay tests (`packages/mcp/tests`) start the real pinned `@mui/mcp`. See
  [packages/mcp/README.md](../packages/mcp/README.md#development).

### What to test

- **Passthroughs** need no per-component tests. `pnpm inventory:check` and `pnpm test:bundle`
  cover their wiring.
- **Hand-written modules**: public API and behavior, controlled and uncontrolled use, events,
  keyboard, ARIA attributes.
- **Advanced features**: one explicit suite per feature (see the `tests/` folders under
  `DataGrid`, `RichTreeView` and the range-picker modules), plus combined-feature tests.
- **Render counts**: interaction paths in advanced components must assert that only the affected
  cells, rows or items re-render. Spy on a `renderCell` or slot and compare the ids that rendered.
  Examples: `DataGrid/tests/DataGrid.test.tsx` ("groups rows … without re-rendering other rows")
  and `DateRangeCalendar/tests/DateRangeCalendar.test.tsx` ("re-render budget").
- **Theme and mode**: `packages/ui/src/styles/tests/` covers `ThemeProvider`, the mode store and the
  SSR helpers.

## Bundle tests

`pnpm test:bundle` runs `tooling/bundle-tests/run.mjs`. If `packages/ui/dist` is missing, it builds
the package first. It checks the package through the consumer fixture
(`tooling/bundle-tests/fixture`), which resolves the built package through its `exports` map:

1. Every `exports` entry points at an existing JS file and declaration file.
2. The root and representative subpaths import in plain Node ESM, the root `Button` is the same
   object as the subpath `Button`, and a tree with `ThemeProvider`, `Button`, `Icon`,
   `LocalizationProvider` + `DateRangePicker`, `RichTreeView` and `DataGrid` renders with
   `renderToString`.
3. Tree shaking: bundles of `@tecton-mui/ui/Button`, `{ Button }` from the root and
   `ThemeProvider` contain no Data Grid, picker, Tree View, date-fns, token CSS or docs tooling
   code.
4. `global.css` contains fonts, icons and tokens, and every font file it references exists in
   `dist/styles`. `components.css` declares no globals, resets or custom properties.

Rebuild (`pnpm --filter @tecton-mui/ui build`) before rerunning after source changes. The script
only builds when `dist/` is missing.

## Playwright

- Configuration: `playwright.config.ts`. A single Chromium project. The `webServer` starts the
  harness with `node tests/e2e/harness/server.mjs 4310` and reuses a running server outside CI.
- **Preinstalled browser:** set `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome` to use a local
  Chromium instead of the Playwright-managed one. Otherwise run
  `pnpm exec playwright install chromium` once.
- Specs:
  - `datagrid.spec.ts`: advanced grid interactions (multi-sort, header filters, detail panels,
    grouping and aggregation, pinned columns while scrolling, column drag reordering, tree data).
  - `platform.spec.ts`:
    - SSR/hydration with no mismatches, keeping the stored dark mode, and a single tokens `<style>`.
    - Shared light/dark mode across two React roots, portals across roots, a single global
      `CssBaseline`, and mode changes from another tab.
    - RTL layout with sticky pinned columns.
    - axe scans of each scenario in both modes.
    - Visual regression of the showcase in both modes.
  - `modal-layer.spec.ts`: dialogs of two independent MUI copies on one page (scenario
    `modal-layer`; the second copy is MUI's CommonJS build, aliased as `mui-second-copy/*` in the
    harness Vite config): one focus owner, scroll lock and page hiding until the last one closes,
    focus back to the dialog below, and nothing changed for modals of one copy.
- **Accessibility:** the axe scans use the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and
  `wcag22aa` tags. Serious and critical violations fail the test unless they are covered by an
  approved entry in `tests/e2e/a11y-exceptions.json` (see
  [CONTRIBUTING.md](../CONTRIBUTING.md#accessibility-exceptions)). Automated scans do not replace
  manual keyboard and screen-reader checks of complex components (grid, pickers, tree).
- **Visual baselines** live in `tests/e2e/platform.spec.ts-snapshots/`. After an intended visual
  change (for example a Tecton or MUI upgrade), update them with
  `pnpm test:e2e --update-snapshots`, review the images, and commit them in the same PR. Baselines
  depend on the platform's fonts and rendering, so generate them in the same environment as CI.

### Adding a browser scenario

Add the scenario to the harness (`tests/e2e/harness/src/App.tsx` or a scenario component) and
select it with `?scenario=<name>`. `mode=light|dark` sets the Tecton mode and `dir=rtl` switches
direction. Then add the spec in `tests/e2e/`. Add new scenarios to the axe scenario list in
`platform.spec.ts` when they render new components.

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `dev`. Each job installs
with `pnpm install --frozen-lockfile` on Node 22:

| Job      | Steps                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checks` | `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm tecton:check`, `pnpm inventory:check`, `pnpm test:coverage` (the coverage report is uploaded) |
| `build`  | Build `@tecton-mui/ui` and `@tecton-mui/mcp`, `pnpm test:bundle`, and check that `THIRD_PARTY_NOTICES.md` and `README.md` exist in `packages/ui`        |
| `e2e`    | `pnpm exec playwright install --with-deps chromium`, `pnpm test:e2e` (interactions, axe, RTL, light/dark, SSR, visual); the HTML report is uploaded     |
| `docs`   | Docs portal build with `DOCS_BASE=/<repository>/` (API generation, prerender, Pagefind, link check), then `pnpm docs:sync --check`                      |

All jobs must pass before merge. On manual MUI upgrades, also review the inventory diff, the visual
diffs and the docs sync output ([mui-upgrades.md](./mui-upgrades.md)).
