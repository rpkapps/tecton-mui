// Runtime corrections applied to verbatim Tecton sources. Keep this list minimal: each patch fixes
// a verified defect against the pinned MUI release, must match exactly once, and is documented in
// repo-docs/tecton-integration.md. Prefer styles/tecton/compat.ts (theme-level overrides) when the
// fix can be expressed as theme options.
export const RUNTIME_PATCHES = [
  {
    file: 'components/shared.ts',
    reason:
      'MUI X passes `ownerState` to slot components (e.g. picker openPickerIcon); the Tecton slot icon spread it onto a DOM <span>, causing React unknown-prop warnings',
    find: '    comp = (props) => {\n      const passed = (props?.className as string | undefined) ?? "";',
    replace:
      '    comp = ({ ownerState: _ownerState, ...props }) => {\n      const passed = (props?.className as string | undefined) ?? "";',
  },
];
