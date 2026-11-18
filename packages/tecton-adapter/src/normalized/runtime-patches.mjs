// Runtime corrections applied to verbatim Tecton sources. Keep this list minimal: each patch fixes
// a verified defect against the pinned MUI release, must match exactly once, and is documented in
// repo-docs/tecton-integration.md. Prefer styles/tecton/compat.ts (theme-level overrides) when the
// fix can be expressed as theme options.
export const RUNTIME_PATCHES = [
  {
    file: 'components/shared.ts',
    reason:
      'MUI X passes non-DOM props to slot components (`ownerState` from picker icons, `sortingOrder` from Data Grid sort icons); the Tecton slot icon spread them onto a DOM <span>, causing React unknown-prop warnings',
    find: '    comp = (props) => {\n      const passed = (props?.className as string | undefined) ?? "";',
    replace:
      '    comp = ({ ownerState: _ownerState, sortingOrder: _sortingOrder, ...props }) => {\n      const passed = (props?.className as string | undefined) ?? "";',
  },
];
