# tecton-mui

Material UI components styled with the **Tecton** design system, for internal React 19 apps.

- **Same API as MUI.** Every MUI Core, Lab and MUI X Community component is re-exported unchanged:
  same names, props, slots, refs and theme keys. Existing MUI code works after changing the import
  path from `@mui/material/...` to `@tecton-mui/ui/...` (the one exception: MUI's font-ligature
  `Icon` is replaced by the Tecton `Icon`).
- **Tecton out of the box.** `<ThemeProvider>` with no props applies the Tecton theme, fonts,
  icons and tokens. Light/dark mode is shared by every React root on the page, so a shell and its
  micro-frontends switch together. RTL and SSR are supported.
- **Advanced components, no MUI X license.** One `DataGrid` with pinning, reordering, grouping,
  aggregation, tree data, master/detail, cell selection with copy/paste, undo/redo and server-side
  data. Date, time and date-time **range pickers**. A `RichTreeView` with drag-and-drop
  reordering, lazy loading and virtualization. These are written from scratch on public MUI X
  Community APIs; no commercial MUI X code is used.
- **Extras MUI does not ship:** `NumberField`, `NumberSpinner`, `Menubar` (the mui.com recipes,
  packaged as components), the Tecton `ActionBar` tool palette and `ColorSwatchControl` color
  input, and a typed Tecton `Icon`.

## See it

```bash
corepack enable
pnpm install
pnpm docs:dev
```

The docs portal opens at http://localhost:5173: every component with live examples and their source,
API tables and the support matrices for the advanced components. Other ways to look at it:

| Command             | What you get                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `pnpm docs:preview` | Production build of the docs portal, served on port 4173 (all interfaces)                                        |
| `pnpm harness`      | The e2e test app on port 4310, e.g. `/?scenario=grid:all&mode=dark&dir=rtl` (also `pickers`, `tree`, `showcase`) |

Requirements: Node.js 22+, pnpm 10 (`corepack enable` picks the pinned version).

## Use it

```bash
pnpm add @tecton-mui/ui react react-dom
```

```tsx
import '@tecton-mui/ui/styles/global.css'; // fonts, icons and tokens; once per page
import { ThemeProvider } from '@tecton-mui/ui/styles';
import { LocalizationProvider } from '@tecton-mui/ui';
import Button from '@tecton-mui/ui/Button';
import DataGrid from '@tecton-mui/ui/DataGrid';
import DateRangePicker from '@tecton-mui/ui/DateRangePicker';

// rows and columns: your data, as for the MUI DataGrid
export function App() {
  return (
    <ThemeProvider>
      <LocalizationProvider>
        <Button variant="contained">Save</Button>
        <DateRangePicker label="Reporting period" />
        <DataGrid
          rows={rows}
          columns={columns}
          pinnedColumns={{ left: ['name'] }}
          rowGroupingModel={['department']}
          aggregationModel={{ salary: 'sum' }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
```

[`packages/ui/README.md`](./packages/ui/README.md) covers setup for shells, hosted
micro-frontends and SSR, dark mode, RTL, icons, dates, and the advanced components.

## Repository

| Path                      | Contents                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `packages/ui`             | The published library, `@tecton-mui/ui`                                               |
| `packages/mcp`            | `@tecton-mui/mcp`, a relay to the official MUI MCP server for AI coding assistants    |
| `packages/tecton-adapter` | Build-time import of the pinned Tecton release into the theme (generated, not edited) |
| `apps/docs`               | The docs portal                                                                       |
| `tests/e2e`               | Playwright tests and the harness app                                                  |
| `tooling`                 | Export generator, MUI docs sync, bundle and packaging checks                          |

## Develop

```bash
pnpm test               # unit tests (Vitest)
pnpm test:e2e           # browser tests (Playwright)
pnpm lint && pnpm typecheck
```

Before opening a PR, run the full check list in [AGENTS.md §10](./AGENTS.md#10-every-change) and
add a changeset (`pnpm changeset`). Some files are generated and must not be edited by hand:
passthrough modules and the export map (`pnpm inventory`), the Tecton theme (`pnpm tecton:sync`)
and the synced MUI examples (`pnpm docs:sync`).

- [AGENTS.md](./AGENTS.md): the rules for every change (humans and AI agents)
- [CONTRIBUTING.md](./CONTRIBUTING.md): workflow and PR checklist
- [SPEC.md](./SPEC.md): product decisions
- [repo-docs/](./repo-docs): architecture, testing, Tecton integration, MUI upgrades, releasing

Only MIT-licensed MUI packages may be used. Commercial MUI X packages (`*-pro`, `*-premium`,
`@mui/x-license`) and their code or docs must never be imported, copied or imitated. ESLint blocks
the imports.
