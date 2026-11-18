# Enterprise UI Component Library — Technical Specification

**Document status:** Consolidated implementation specification  
**Version:** 1.0 (planning baseline)  
**Date:** 2026-11-17  
**UI package placeholder:** `__PACKAGE_NAME__`  
**MCP package placeholder:** `__MCP_PACKAGE_NAME__`  
**Documentation URL placeholder:** `__DOCS_URL__`  
**Repository name placeholder:** `__REPOSITORY_NAME__`

> **Scope note:** This document records architectural and product decisions agreed during planning. Examples that reference not-yet-built exports are **target APIs**, not claims that those exports already exist. All Tecton UMD export details and precise MUI feature/peer-dependency compatibility must be validated during implementation.

## 1. Executive summary

Build a **private, enterprise React component library** with familiar MUI component names, imports, props, and customization APIs. Use **MIT-licensed MUI Core, MUI Lab, and selected MUI X Community packages internally**; avoid unnecessary wrappers for standard components. Apply **Tecton as the preconfigured visual design system** and independently implement selected commercial-equivalent capabilities without importing or copying commercial MUI X code.

Deliver the project as a **pnpm workspace** containing:

1. `__PACKAGE_NAME__` — the React UI package (public component API).
2. A Tecton integration layer — initially extracts/normalizes data from pinned Tecton v0.11.2 UMD and CSS sources, replaceable later by npm-based sourcing.
3. A consumer-only documentation site — **TanStack Router + Vite + MDX**, styled using the Tecton-backed UI package, with a static output compatible with GitHub Pages.
4. `__MCP_PACKAGE_NAME__` — a **transparent relay** to the official MUI MCP server, with no custom tooling or token injection in its initial release.
5. Repository-level contributor documentation, tests, CI, versioning, and manual dependency-update scripts.

**Out of scope:** Storybook for this new project, MUI X Charts, MUI X Scheduler, commercial MUI X packages/source code, consumer ESLint requirements, an application/MFE orchestration framework, and automatic dependency update bots.

## 2. Goals and non-goals

### 2.1 Goals

- Give enterprise applications an intuitive, MUI-compatible React API with Tecton styling **out of the box**.
- Support **React 19+**, TypeScript, ESM, tree shaking, SSR, and hydration.
- Support **both root named imports and individual component default imports**, plus the conventional `styles` subpath.
- Keep standard components as **direct MUI passthrough re-exports** wherever possible.
- Ship all stable MUI Core components and all applicable MUI Lab components at the selected baseline.
- Offer one unified `DataGrid`, separate picker component families including Pro-equivalent range pickers, and Community/Pro-equivalent Tree View functionality.
- Minimize the impact of upstream MUI upgrades by **isolating custom extensions and avoiding forks/private APIs**.
- Keep Tecton tokens versioned and centrally sourced while preserving normal MUI customization API compatibility.
- Provide a useful, consumer-focused documentation site plus a **proper `packages/ui/README.md`**.
- Use transparent, independently versioned AI documentation access through an MCP relay.

### 2.2 Non-goals

- Reimplementing foundational MUI Core behavior when existing MIT code meets requirements.
- Importing or redistributing MUI X Pro/Premium code, assets, tests, or proprietary documentation without proper rights.
- Creating an MFE loader, Module Federation integration, root manager, dependency-sharing mechanism, or cross-MFE messaging service.
- Forcing consumer applications to install ESLint or a custom lint configuration.
- Runtime warnings or technical blocking of consumers' styling overrides.
- A Storybook application or Next.js-based documentation site.
- MUI X Charts or any charting integration; MUI X Scheduler; spreadsheet formulas, MUI-style computed columns, pivoting, Excel export, or an AI grid assistant.

## 3. Selected technology and project constraints

| Topic | Decision |
|---|---|
| UI framework | React **19 minimum**; later major versions only after compatibility testing |
| Language | TypeScript, strict mode |
| Package format | **ESM-only**; TypeScript declarations; tree-shakeable exports |
| Package manager / monorepo | **pnpm workspaces**; **no Turborepo** |
| UI foundation | Latest stable compatible versions of MIT-licensed MUI Core, MUI Lab, and MUI X Community at bootstrap; **pin exact installed versions** |
| Styling | MUI + **Emotion**; Tecton default theme and styles |
| Default icon system | **Tecton icons**; custom `Icon` component; no required `@mui/icons-material` dependency |
| Date handling | **date-fns** default; `en-US` default; other supported MUI date adapters configurable |
| Unit/component testing | **Vitest** and React Testing Library as applicable |
| Browser / visual / SSR testing | **Playwright**, with accessibility tooling (e.g. axe-core) |
| Lint/format within repo | **ESLint + Prettier** |
| Versioning | **Changesets** |
| CI | **GitHub Actions** on pull requests |
| Dependency updates | **Manual pnpm workflow**; no Renovate/Dependabot requirement |
| Documentation | **TanStack Router + Vite + MDX**, static output, client-side search |
| Documentation hosting | GitHub Pages-compatible build; **private hosting/access decision deferred** |
| Publishing | **Private npm package**; registry selection deferred |
| Tecton source | Initially **v0.11.2 CDN UMD + CSS**, eventually swappable to npm packages |
| MCP | Stdio transparent relay to official `@mui/mcp`, pinned upstream version |

**Versioning rule:** MUI Core, Lab, and X packages **do not need numerically identical patch versions**. Select and pin individually compatible releases based on actual peer-dependency constraints and integration tests.

## 4. High-level architecture

```text
                         Enterprise applications
                         imports from __PACKAGE_NAME__
                                   |
                                   v
                        __PACKAGE_NAME__ public API
                  /               |               \
                 v                v                v
          Core / Lab          Specialized       Theming API
          re-exports          components        /styles
                 |           /    |     \            |
                 v          v     v      v           v
            MIT MUI       Data   Pickers Tree      Tecton adapter
            Core/Lab      Grid          View             |
                           |                             v
                       MIT MUI X               normalized Tecton config
                       Community                        ^
                           + custom                       |
                         feature modules           UMD (now) / npm (later)

  Documentation: TanStack Router + MDX -> consumes __PACKAGE_NAME__
  AI tooling:    __MCP_PACKAGE_NAME__ -> transparent relay -> official MUI MCP
```

### 4.1 Dependency boundaries

- **React and React DOM:** peer dependencies; each consumer must install a compatible pair.
- **MUI Core, Lab, X Community, Emotion, and default date adapter:** runtime dependencies/internal implementation details as packaging and peer-resolution tests permit. Never force docs/test tools into the UI package runtime graph.
- **Tecton:** supplied through the isolated token/style adapter, **not** directly coupled to individual component implementations.
- **Other picker adapters:** explicit optional integrations; importing a Button must not include date adapter code.
- **TanStack, MDX, search, and documentation components:** documentation app only.
- **MCP relay:** independent package/process; not a runtime dependency of the UI package.

Package exports and peer-dependency decisions must be checked in a real consumer test application, including cases with multiple independently mounted React roots. The UI package must **not** impose any Module Federation sharing policy.

## 5. Component exports and implementation strategy

### 5.1 Re-export-first policy

**Default:** export a stable MIT-licensed MUI component directly when Tecton theming can style it without changing behavior.

```ts
// packages/ui/src/Button/index.ts — illustrative
export { default } from '@mui/material/Button';
export type { ButtonProps } from '@mui/material/Button';
```

Create custom wrappers/adapters **only** when there is a specific requirement, such as the Tecton theme provider, default date adapter, Tecton icon API, enhanced Data Grid, Pro-equivalent range picker, or enhanced Tree View.

- Preserve refs, polymorphic typing, slots, slot props, `muiName` where relevant, event semantics, accessibility, and SSR behavior.
- **Never fork or patch upstream MUI source** for standard components.
- Avoid nonpublic MUI extension points. If a required capability cannot be built reliably with public APIs, implement an isolated independent layer rather than depending on internals.
- Do not promise 100% drop-in compatibility until the compatibility suite proves it.

### 5.2 Supported import styles

```tsx
// Root named imports
import { Button, TextField, DataGrid } from '__PACKAGE_NAME__';

// Individual component imports
import Button from '__PACKAGE_NAME__/Button';
import DataGrid from '__PACKAGE_NAME__/DataGrid';

// Theming utilities
import { ThemeProvider, createTheme, styled, useTheme } from '__PACKAGE_NAME__/styles';
```

- Support both root and individual component imports, following MUI conventions.
- Expose documented styles and provider subpaths, including `__PACKAGE_NAME__/styles`.
- Include `.d.ts` declarations for every public path.
- Declare exports explicitly; retain CSS files during tree shaking (e.g. correct package `sideEffects` handling).
- Confirm import of `__PACKAGE_NAME__/Button` does **not** eagerly bundle Data Grid, Date Pickers, Tree View, docs, or tests.

### 5.3 MUI Core and Lab

- Include **all stable MUI Core components** available in the selected compatible release.
- Include **all applicable MUI Lab components** available in the selected compatible release; document their upstream instability and version-specific availability.
- Include `CssBaseline` and `ScopedCssBaseline`; the host shell uses one global `CssBaseline` (see §7).
- Experimental or otherwise unsupported Core APIs are not automatically promised; maintain an export inventory for the pinned version.
- Standard components use direct passthrough exports wherever possible.

### 5.4 Icons

- Default icon source is **Tecton**, via the provided icons CSS/assets.
- Export `Icon` from `__PACKAGE_NAME__/Icon` with a typed `name` property, once actual available icon names have been extracted/verified.
- Preserve standard MUI icon-placement props such as `startIcon` and `endIcon` on consuming components; ordinary SVG children remain usable.
- Do **not** require the MUI Material Icons package for normal operation.
- Global font/icon CSS initialization remains explicit and host-owned.

### 5.5 Unified Data Grid

Export **one** `DataGrid` component. Do **not** expose separate `DataGridPro` or `DataGridPremium` public components.

**Foundation:** `@mui/x-data-grid` (Community/MIT) plus **independently implemented** advanced feature modules.

**Baseline behavior:** preserve MUI-compatible defaults; advanced capabilities are **available but activated by standard props/configuration**. No feature-tier flags, separate licenses, or unexpected automatic grouping/pinning.

**Pro target:** all feature capabilities designated Pro in the pinned MUI feature inventory, **excluding separate localization/theming extension work** because shared Tecton/MUI infrastructure already covers those concerns. The planning inventory includes:

- Multi-column sorting and filtering; header filters.
- Column pinning and reordering; row pinning and reordering.
- Multi-row/range row selection.
- Tree data; master/detail panels.
- Expanded virtualization and page-size capabilities.
- Server-side lazy loading and batched row updates.

**Selected Premium target:**

- Row grouping.
- Aggregation and group/grand-total summaries.
- Cell range selection.
- Clipboard paste.
- Server-side grouping and server-side aggregation.
- Undo/redo for supported grid operations.

**Explicit exclusions:**

- AI assistant.
- Spreadsheet-style formulas and formula-driven/computed columns (ordinary Community `valueGetter` remains available).
- Charts and chart integration.
- Pivoting, including server-side pivoting.
- Excel export (standard Community exports remain available where supported).

**Important qualification:** The bullet lists above capture the agreed **product target**, not a verified version-specific license-tier matrix. During implementation, audit MUI's feature inventory for the exact pinned version, including features that changed tiers or APIs. Some Pro/Premium capabilities may **not** be realizable as plug-ins to Community using public APIs; those require a separate independent implementation and may materially affect effort. No commercial MUI X source or proprietary implementation may be used to fill gaps.

**Modularity requirements:**

```text
DataGrid/
├── index.ts
├── public-types.ts
├── mui-community-adapter/
├── features/
│   ├── sorting-filtering/
│   ├── pinning-reordering/
│   ├── tree-data/
│   ├── grouping-aggregation/
│   ├── selection-clipboard/
│   ├── server-data/
│   └── undo-redo/
└── tests/
```

Every advanced feature must have an explicit API/behavior test suite and an upgrade boundary.

### 5.6 Date and Time Pickers

- Include all relevant **MUI X Community Date and Time Picker** components.
- Independently implement the selected **Pro-equivalent picker features**, including applicable date/time/date-time range pickers.
- Keep **separate component names**, e.g. `DatePicker`, `TimePicker`, `DateTimePicker`, `DateRangePicker`, `TimeRangePicker`, `DateTimeRangePicker`, and their applicable mobile, desktop, and lower-level counterparts.
- Preserve relevant standard MUI props, value types, slots, events, and accessibility.
- `LocalizationProvider` stays **separate** from `ThemeProvider`, following MUI's conceptual model.
- `LocalizationProvider` defaults to **`AdapterDateFns`**, native JavaScript `Date` values, and **`en-US`** settings while allowing explicit adapter/locale overrides.
- Support MUI's other compatible adapters where feasible without bundling unused adapters.
- Document version-specific range-picker availability and independently verify non-Community APIs; do not import commercial picker packages.

### 5.7 Tree View

- Include **`SimpleTreeView`** as a separate Community-compatible component.
- Include one unified **`RichTreeView`** with Community functionality and independently implemented Pro-equivalent features.
- Do not expose a separate `RichTreeViewPro` public API.
- Reuse MIT Community implementation/public extension points where viable; isolate advanced feature engines.

### 5.8 Excluded product families

- **All MUI X Charts** packages and any chart integration.
- **All MUI X Scheduler** components.

## 6. Tecton integration and theming

### 6.1 Source artifacts and version

Initial pinned upstream: **Tecton `0.11.2`**.

```text
Fonts CSS:
https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/tecton-core/0.11.2/fonts.css

Icons CSS:
https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/tecton-core/0.11.2/icons.css

MUI UMD:
https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/tecton-mui/0.11.2/index.umd.js
```

Reference host-page includes (as provided upstream; for inspection, demos, and parity checks only — see §6.2 item 5):

```html
<link rel="stylesheet" href="https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/tecton-core/0.11.2/fonts.css">
<link rel="stylesheet" href="https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/tecton-core/0.11.2/icons.css">
<script src="https://d1md5uq86jnv53.cloudfront.net/lmk/webframework/utils/tecton-mui/0.11.2/index.umd.js"></script>
```

Note the split origin: fonts and icons CSS come from **`tecton-core`**, while the UMD comes from **`tecton-mui`**; the asset manifest must track both paths and their shared version.

The UMD **has not yet been inspected**. Do not assume export names, token object structure, or its runtime-loading semantics until the artifact is provided. The earlier Tecton sample indicates the following concepts, subject to verification:

```tsx
import '@webframework/tecton-core/icons.css';
import '@webframework/tecton-core/fonts.css';

injectTectonTokens();
const mode = themeManager.getMode();
const theme = createMuiTheme({ mode });
// themeManager.subscribe(...); themeManager.toggleMode();
```

### 6.2 Replaceable source adapter

```text
Tecton UMD adapter  ──┐
                      ├──> NormalizedTectonTheme + asset manifest
Tecton npm adapter  ──┘                 |
                                       v
                           __PACKAGE_NAME__/styles
```

Required approach:

1. Initially extract/build from a **pinned, approved** UMD artifact and corresponding CSS assets.
2. Normalize exports to an **internal adapter contract** not visible to applications.
3. Generate and package default MUI theme configuration and/or CSS variable initialization assets, as the actual Tecton API dictates.
4. Allow a future **npm source adapter** to replace UMD sourcing without changing component imports or public theme APIs.
5. Do **not** make production applications fetch the development Storybook or a CloudFront UMD at every startup.
6. Validate the source version, available tokens, theme modes, and required stylesheet assets as part of builds.
7. Preserve fonts and icons as separately managed global CSS assets.

**Deferred:** inspecting actual UMD exports; confirming exact Tecton npm package names and access; deciding how CI obtains private/CDN artifacts.

### 6.3 Public theme behavior

- Preserve the MUI names **`ThemeProvider`**, **`createTheme`**, `useTheme`, `styled`, and the standard `sx`, `slots`, `slotProps`, `variants`, `defaultProps`, and `styleOverrides` customization interfaces.
- A no-configuration `ThemeProvider` must use **Tecton default tokens**.
- `createTheme` must start from Tecton defaults where applicable and support normal MUI-compatible options.
- Preserve standard nested-provider and theme consumption semantics to the extent technically compatible.
- Support light/dark modes. **Tecton's `themeManager` is the source of truth**, and all applications on a page use one shared mode.
- Avoid parallel/contradictory React mode state; subscribe and unsubscribe cleanly.
- Make initial mode selection and theme initialization **SSR/hydration safe**; avoid avoidable flash-of-incorrect-theme.
- Support RTL (`direction: 'rtl'`) and Emotion RTL processing; test menus, portals, pinning, and scrolling.

### 6.4 Policy on overrides

**Organization policy:** consumer applications **should not** visually override Tecton styling or tokens.

**Technical decision:** keep MUI styling APIs **fully functional** for compatibility. **Do not** strip `sx`, `className`, `style`, `styled`, or theme options; **do not** issue runtime/development warnings; **do not** require consumer ESLint. Consequently, styling uniformity is a documented policy rather than an unbreakable runtime guarantee. Repository-level linting remains in place for library contributors.

## 7. Shell, MFE, and standalone style loading

The library has **no MFE runtime responsibilities**. Each MFE may have its own React root in a **regular DOM container**; shell/MFE React version sharing and Module Federation are external concerns.

The library's responsibilities are only to offer clear, explicit style entry points and preconfigured theme behavior.

| Environment | Global fonts/icons/token CSS | Component CSS / Emotion | Theme context | `CssBaseline` |
|---|---|---|---|---|
| Shell | **Load once explicitly** | Automatic + available component entry point | Own `ThemeProvider` as needed | **Apply once** |
| Hosted MFE | **Do not duplicate** | Explicit component stylesheet where needed; Emotion renders component styles | Own `ThemeProvider` (independent root) | **Do not apply global reset** |
| Standalone MFE/app | **Explicitly load/initialize** | Component stylesheet / Emotion | Own `ThemeProvider` | Explicitly apply if it owns the page |

Target stylesheet exports:

```tsx
// Shell or standalone host
import '__PACKAGE_NAME__/styles/global.css';

// Hosted MFE (only static component styles, if any)
import '__PACKAGE_NAME__/styles/components.css';
```

These are **target exports**; their final generated content depends on the UMD/CSS inspection. The global stylesheet may incorporate or reference fonts/icons and required token CSS, subject to bundler and deployment compatibility. Token initialization that requires JavaScript must have an explicit, documented host setup step; importing CSS alone must not be falsely represented as executing JavaScript.

Requirements:

- No automatic global CSS asset injection by ordinary component imports.
- No second global CSS reset from MFEs.
- No application-level CSS variable pollution from component styles.
- Dialog/Menu/Popover portal behavior must work with separate React roots sharing a document.
- Do not automatically configure Emotion sharing, React share scopes, or MFE communication.
- Support `CssBaseline` and `ScopedCssBaseline` exports, even though the shell owns the page-wide reset.

## 8. Documentation: consumer portal only

### 8.1 Technology and deployment

- **TanStack Router + Vite + MDX**; static build, no server required at runtime.
- **GitHub Pages compatible**, including repository base path, asset URLs, and deep-link refresh handling or prerendering as selected at implementation time.
- Use a static/client-side search solution (e.g. Pagefind), with no backend required.
- The docs app must be **built with components from `__PACKAGE_NAME__`** and therefore styled with **Tecton**. No separate UI component framework for the portal.
- Live examples must render the actual library components and target the documented public imports.
- **No Storybook** in this project. The upstream Tecton Storybook may remain an external reference/source, not an app dependency.
- Private access controls are **deferred**. A private repository does **not** itself guarantee a private GitHub Pages site. **Never publish confidential content to an unauthenticated Pages endpoint.**

### 8.2 Consumer-facing information architecture

```text
Getting Started
  - Installation
  - Quick Start
  - Shell Integration
  - MFE / Standalone Integration
  - SSR Setup
  - Migration from MUI

Components
  - Inputs
  - Data Display
  - Feedback
  - Surfaces
  - Navigation
  - Layout
  - Utilities
  - Lab
  - Data Grid
  - Date & Time Pickers
  - Tree View

API Reference
  - Generated component props, events, slots, methods, and types

Guides (consumer-only)
  - ThemeProvider and shared light/dark mode
  - LocalizationProvider / date-fns / locales
  - Tecton fonts, icons, and style entry points
  - Known compatibility differences / accessibility limitations

Releases
  - Changelog
  - Consumer migration guides
```

**Not in the portal:** contributor setup, dependency management for maintainers, repo architecture, internal build scripts, tests, private publishing instructions for maintainers, licensing/pricing marketing, MUI upsell pages, or advanced application styling tutorials that conflict with the Tecton policy.

### 8.3 Component-page template

Every component page should provide, as applicable:

1. Purpose and basic usage.
2. Interactive demo(s) rendered with `__PACKAGE_NAME__`.
3. Copyable TSX examples using supported imports.
4. API/props/slots/events generated from the **actual TypeScript exports**.
5. Accessibility and keyboard guidance.
6. Supported behavior and version-specific limitations.
7. For Data Grid/Tree View/Range Pickers, a transparent advanced-feature compatibility matrix.

### 8.4 Licensed content reuse and customization

- Preserve MUI's familiar **information architecture**, component taxonomy, terminology, and page conventions as useful.
- Copy/adapt **only source documentation verified to be reusable under applicable licenses**; retain required license/copyright notices.
- Treat commercial MUI X documentation, screenshots, proprietary demos, and prose as **not reusable without verified permission**. Independently author pages for independently implemented Pro/Premium-equivalent functionality.
- Use your own branding and Tecton styling; do not clone protected MUI branding/trade dress.
- Generate API tables from our code, not unverified upstream claims.
- A **private** portal does not waive copyright or contractual obligations. Review the source rights and applicable organizational contracts before documentation imports.
- MUI MCP access is for guidance/reference, **not** an independent documentation republication license.

### 8.5 Controlled upstream synchronization

- Synchronize eligible MUI documentation **only when a developer manually updates the relevant MUI dependency**.
- The sync process must respect a manifest of **included / modified / excluded** pages.
- Preserve enterprise-specific text, Tecton styling, `__PACKAGE_NAME__` imports, and original advanced-feature content.
- Produce reviewable changes in a PR; no unattended merging.
- Run docs build, link checking, API reference generation, visual tests, and license-notice validation before approval.
- Versions need not be numerically aligned across MUI packages.

## 9. Repository documentation and package README

Repository/contributor documentation belongs **in the repository**, not the consumer UI docs site.

```text
README.md                         # repo overview and workspace map
AGENTS.md                         # AI implementation rules
CONTRIBUTING.md                   # contributor workflow
LICENSES/ or THIRD_PARTY_NOTICES  # required notices and attributions
repo-docs/
  architecture.md
  development.md
  dependencies.md
  testing.md
  tecton-integration.md
  mui-upgrades.md
  documentation-sync.md
  releasing.md
packages/ui/README.md             # consumer-focused package README
```

### 9.1 `packages/ui/README.md` requirements

A proper package README must ship with the private npm package and include:

- Library purpose, features, supported React version, and package license/third-party notice links.
- Installation: `pnpm add __PACKAGE_NAME__` (final registry setup deferred).
- Both supported component import styles.
- Default `ThemeProvider` with Tecton styling.
- **Explicit** shell, hosted MFE, and standalone stylesheet setup.
- `CssBaseline` vs `ScopedCssBaseline` guidance.
- Shared light/dark mode and RTL.
- `LocalizationProvider`, default date-fns adapter, and locale configuration.
- Unified Data Grid, Tree View, and picker usage examples.
- Scope limitations and links to the consumer docs portal (`__DOCS_URL__`).
- Consumer-visible versioning and changelog reference.

The README must **not** claim a verified global CSS/token initialization mechanism until the UMD adapter is inspected. Executable examples must be checked against published package exports during CI.

## 10. MCP relay and AI coding instructions

### 10.1 Initial MCP implementation

`__MCP_PACKAGE_NAME__` is a **transparent relay** to the official MUI MCP server.

- Launch/connect to a **pinned** upstream `@mui/mcp` version.
- Relay protocol traffic, tool discovery, schemas, calls, responses, and errors **without modification**.
- Do **not** introduce custom tools, content filtering, prompt injection, documentation rewriting, or Tecton context in v1.
- Preserve streaming/process lifetime and clean shutdown; keep transport diagnostics off MCP stdout.
- Keep the relay an independent package not required by application builds or docs site runtime.
- Use black-box protocol tests to verify parity with the pinned upstream MCP.

### 10.2 `AGENTS.md`

The repository's own `AGENTS.md` is authoritative for AI coding agents. It should instruct them to:

- Prefer MIT MUI passthrough exports.
- Consult version-pinned official MUI references and public APIs.
- Preserve MUI-compatible import and prop patterns.
- Apply Tecton through the centralized adapter/theme.
- Never import, copy, or imitate proprietary MUI X implementation code.
- Never copy commercial documentation content without verified permission.
- Keep custom advanced features modular and upgradeable.
- Write tests/docs for each API change; comply with React 19+, ESM, SSR, WCAG testing, and no-Storybook requirements.

## 11. Testing, accessibility, and quality gates

### 11.1 Required tooling

- **TypeScript strict checking**.
- **ESLint + Prettier** in the repository (not required for consumers).
- **Vitest** for unit, component, and public API compatibility tests.
- **Playwright** for browser interactions, visual regressions, RTL, light/dark, and SSR/hydration testing.
- Automated accessibility tooling (e.g. axe-core) **plus manual keyboard/screen-reader coverage** for complex components.
- Bundle/exports tests for ESM tree shaking, subpath resolution, and dependency isolation.

### 11.2 Coverage and acceptance gates

- **80% minimum test coverage** enforced in CI (define exact tracked dimensions in the Vitest config).
- Set stricter component-specific targets for **Data Grid, Date Pickers, and Tree View** once baseline test suites are established.
- PR CI must validate builds, type checking, lint/format, tests, accessibility, docs examples, license notices, and SSR/hydration behavior.
- Require real consumer fixture tests for root/subpath imports and ESM build correctness.
- On manual MUI dependency upgrades, also run public API compatibility, visual regression, accessibility, docs sync, and component-specific advanced-feature suites.

### 11.3 WCAG 2.2 AA and Tecton exception handling

The library **targets WCAG 2.2 AA**, but automated pass rates alone do not establish formal compliance.

- **Tecton owners:** visual tokens (color contrast, font and icon affordances, visual states).
- **Library owners:** semantics, keyboard behavior, ARIA, focus management, interaction, correct token usage.
- Test rendered components in both Tecton modes and RTL.
- Distinguish upstream token defects from implementation defects in the PR report.
- **Approved Tecton-related accessibility exceptions may be merged via PR**, with documented owner, rationale, reviewer approval, and follow-up tracking.
- Unapproved regressions block merge; approved exceptions must **not** be reported as compliant.

## 12. Dependency updates, release management, and CI

### 12.1 Manual updates only

- No Renovate or other scheduled update automation is required.
- Developers run a **pnpm-based manual update process** selecting specific packages/versions.
- Pin exact package versions in the lockfile; do not force matching patch versions across MUI families.
- Validate peer-dependency constraints before accepting new versions.
- Documentation sync is triggered for the **updated affected MUI packages**, not on a calendar schedule.
- Review resulting changes in a PR; **no automatic merge**.

### 12.2 Pull request CI

Use GitHub Actions to run:

1. Workspace install and integrity checks (`pnpm install --frozen-lockfile`).
2. TypeScript, ESLint, and Prettier.
3. Vitest + coverage thresholds.
4. Playwright interactions, visuals, accessibility, RTL, dark/light, and SSR.
5. UI package build, exports/type declarations, and tree-shaking fixtures.
6. Documentation static build, examples, and link/route checks.
7. Applicable provenance/license checks and, on upstream updates, approved documentation synchronization checks.

### 12.3 Versioning and publishing

- Use **Changesets** for changelogs and semver release planning.
- Publish the UI package **privately** when registry selection is finalized.
- Keep docs, UI implementation, Tecton adapter version, and release notes traceable to their tested package versions.
- Do not conflate GitHub Pages documentation deployment with npm package publication.

## 13. Proposed repository organization

```text
enterprise-ui/
├── README.md
├── AGENTS.md
├── CONTRIBUTING.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .changeset/
├── .github/
│   └── workflows/
│       └── ci.yml
├── repo-docs/
│   ├── architecture.md
│   ├── development.md
│   ├── dependencies.md
│   ├── testing.md
│   ├── tecton-integration.md
│   ├── mui-upgrades.md
│   ├── documentation-sync.md
│   └── releasing.md
├── packages/
│   ├── ui/
│   │   ├── README.md
│   │   ├── package.json
│   │   └── src/
│   │       ├── Button/
│   │       ├── TextField/
│   │       ├── Icon/
│   │       ├── DataGrid/
│   │       ├── RichTreeView/
│   │       ├── DatePicker/
│   │       ├── LocalizationProvider/
│   │       ├── styles/
│   │       └── index.ts
│   ├── tecton-adapter/
│   │   ├── src/
│   │   │   ├── source-umd/
│   │   │   ├── source-npm/         # future adapter, no runtime dependence now
│   │   │   └── normalized/
│   │   └── scripts/
│   └── mcp/
│       └── src/
├── apps/
│   └── docs/
│       ├── src/
│       │   ├── routes/
│       │   ├── content/
│       │   ├── components/
│       │   └── navigation/
│       ├── vite.config.ts
│       └── package.json
└── tooling/
    ├── compatibility/
    ├── docs-sync/
    ├── bundle-tests/
    └── scripts/
```

Layout is an **implementation proposal**; folder names may evolve without changing the public contract.

## 14. Implementation phases

| Phase | Deliverables | Exit criteria |
|---|---|---|
| 1. Workspace foundation | pnpm workspaces, ESM build, TS strict mode, lint/format, CI, Changesets, package placeholders | Reproducible clean checkout/build/tests |
| 2. Tecton adapter/theme | Obtain UMD, normalize source, style entry points, `ThemeProvider`, light/dark, date-fns, icon foundation | Tecton demo matches source in both modes; SSR/RTL passes |
| 3. MUI Core + Lab | Re-export inventory, named/subpath exports, types, theme integration, `Icon` | API/bundle tests, docs examples, accessibility baseline |
| 4. Consumer docs | TanStack/Vite/MDX site, Tecton components, search, licensed Core import, consumer README | Static build, navigation, links, demos, GitHub Pages-compatible output |
| 5. Advanced MUI X | Unified Data Grid, Pro-equivalent pickers, Tree View enhancements | Selected feature matrices and compatibility/accessibility tests pass |
| 6. MCP and release hardening | Transparent relay, AGENTS.md, notices, changelog, packaging fixtures | MCP relay parity, reproducible release candidate, PR sign-off |

Phases can overlap, but broad promises of advanced feature parity must not precede functional validation.

## 15. Open/deferred decisions and validation work

These are **intentionally deferred**, not blockers to writing a spec:

1. **Tecton UMD inspection:** obtain actual `index.umd.js`, verify exports and generated CSS variables, inspect `themeManager`, `injectTectonTokens`, and `createMuiTheme`, and confirm required global assets.
2. **Tecton npm switch:** identify exact npm packages and entitlement/access; keep source adapter replaceable.
3. **Private package registry:** determine host, credentials, release permissions, and installation instructions.
4. **Private GitHub Pages:** confirm organization's available Pages visibility options before deploying confidential docs. Static Pages compatibility is required regardless of final hosting decision.
5. **Version-pinned MUI compatibility matrix:** resolve actual Core/Lab/X peer requirements and audited feature-tier inventory for latest stable versions selected during setup.
6. **Feasibility of advanced X extensions:** prototype grouping, server-side capabilities, clipboard/range behavior, and picker/tree Pro equivalents against Community public APIs; use independent layers if not feasible.
7. **Accessibility critical-path specifics:** finalize exact Vitest coverage metrics, higher thresholds for complex components, exception reviewer ownership, and manual assistive-technology test matrix.
8. **Final package names and docs URL:** replace `__PACKAGE_NAME__`, `__MCP_PACKAGE_NAME__`, `__DOCS_URL__`, and `__REPOSITORY_NAME__` only when decided.

## 16. Explicit acceptance criteria

A first release is acceptable only when:

- [ ] A React 19+ application can install the private UI package and use standard components with **both root and individual imports**.
- [ ] A new application using the exported `ThemeProvider` receives approved Tecton styling with no visual theme configuration.
- [ ] Shell loads fonts/icons/token globals once; hosted MFE imports only needed component assets; standalone mode documents explicit setup.
- [ ] Shared light/dark mode behaves correctly across independent React roots, with no duplicate global `CssBaseline`.
- [ ] `CssBaseline`, `ScopedCssBaseline`, RTL, Emotion, SSR, and hydration scenarios pass tests.
- [ ] The Tecton-backed `Icon` works with verified icon names; no Material Icons dependency is required.
- [ ] `LocalizationProvider` defaults to date-fns/en-US, is not automatically nested inside `ThemeProvider`, and supports explicit alternative adapters.
- [ ] All selected MUI Core/Lab components and planned X component exports are documented and version-audited.
- [ ] Unified `DataGrid`, picker range components, and `RichTreeView` feature claims match passing tests and are not backed by commercial MUI X code.
- [ ] Importing a basic component does not inadvertently bundle unrelated advanced components or docs tooling.
- [ ] Consumer docs are statically buildable, use **our Tecton-styled UI package**, contain no contributor-only pages, and document licensing provenance for reused source materials.
- [ ] `packages/ui/README.md` provides accurate installation, shell/MFE, theming, localization, and component usage instructions.
- [ ] Vitest, Playwright, coverage, accessibility reports, visual tests, SSR checks, and API/bundle checks run on GitHub pull requests.
- [ ] Tecton-originated accessibility exceptions require explicit documented PR approval; no unsupported compliance claim is made.
- [ ] `__MCP_PACKAGE_NAME__` transparently relays official MUI MCP traffic without changing tools or data.
- [ ] Dependency and documentation updates are manually triggered, reviewable, and not auto-merged.

---

## Appendix A — Illustrative consumer usage

> Target syntax; exact exports and Tecton initialization sequence will be verified after implementation.

**Shell / standalone host:**

```tsx
import '__PACKAGE_NAME__/styles/global.css';
import CssBaseline from '__PACKAGE_NAME__/CssBaseline';
import { ThemeProvider } from '__PACKAGE_NAME__/styles';

function Shell() {
  // Initialize Tecton tokens through the approved adapter before rendering,
  // if required by the verified Tecton integration.
  return (
    <ThemeProvider>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
```

**Hosted MFE in a separate React root:**

```tsx
import '__PACKAGE_NAME__/styles/components.css';
import Button from '__PACKAGE_NAME__/Button';
import { ThemeProvider } from '__PACKAGE_NAME__/styles';

export function FeatureRoot() {
  return (
    <ThemeProvider>
      <Button variant="contained">Save</Button>
    </ThemeProvider>
  );
}
```

**Date Picker:**

```tsx
import DatePicker from '__PACKAGE_NAME__/DatePicker';
import { LocalizationProvider } from '__PACKAGE_NAME__';

<LocalizationProvider>
  <DatePicker label="Start date" />
</LocalizationProvider>;
```

**Unified Data Grid:**

```tsx
import DataGrid from '__PACKAGE_NAME__/DataGrid';

<DataGrid
  rows={rows}
  columns={columns}
  pagination
  pinnedColumns={{ left: ['id'] }}
  rowGroupingModel={['department']}
  aggregationModel={{ salary: 'sum' }}
/>;
```

## Appendix B — Legal and provenance guardrails

This specification is **engineering guidance, not a legal opinion**. Rights should be assessed against the actual versions, licenses, source files, and contracts in use.

- MUI Core and applicable Community packages may be used under their governing MIT terms, including retention of required notices.
- **Internal/private use does not make every upstream documentation page or asset freely copyable.** Verify the license of each imported file.
- Do not infer that commercially licensed MUI X documentation or code is MIT-licensed merely because a Community package is.
- Use independent implementations and original documentation for paid-equivalent features unless separately authorized.
- Review API-compatibility, existing MUI agreements, and AI development provenance with organizational counsel before production deployment.
