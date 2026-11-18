// Type-only compatibility patches applied to verbatim Tecton TypeScript so it compiles under this
// repository's strict settings (verbatimModuleSyntax, noImplicitAny) against the pinned MUI types.
// Rules: a patch may only add type syntax (annotations, `type` modifiers, @ts-expect-error);
// it must never change emitted JavaScript. Each patch must match exactly once or the build fails,
// so an upstream change forces a review of the patch list.
export const TYPE_PATCHES = [
  {
    file: 'createMuiTheme.ts',
    reason: 'verbatimModuleSyntax requires type-only imports to be marked',
    find: '  createTheme as muiCreateTheme,\n  Theme,\n  ThemeOptions,\n',
    replace: '  createTheme as muiCreateTheme,\n  type Theme,\n  type ThemeOptions,\n',
  },
  {
    file: 'components/pickers.ts',
    reason:
      'MUI X slot overrides are declared loosely, so the callback parameter is not contextually typed',
    find: 'sectionsContainer: ({ ownerState }) => ({',
    replace: 'sectionsContainer: ({ ownerState }: { ownerState?: any }) => ({',
  },
  {
    file: 'components/tables.ts',
    reason:
      'MUI 9 moved TablePaginationActions icon slots to TablePagination `slots.actions`; the runtime fix lives in styles/tecton/compat.ts',
    find: '          actions: {\n            slots: {',
    replace:
      '          actions: {\n            // @ts-expect-error superseded by styles/tecton/compat.ts on MUI 9\n            slots: {',
  },
];

import { RUNTIME_PATCHES } from './runtime-patches.mjs';

export function applyPatches(modules, prefix) {
  const out = { ...modules };
  for (const patch of [...TYPE_PATCHES, ...RUNTIME_PATCHES]) {
    const key = `${prefix}${patch.file}`;
    const source = out[key];
    if (source == null) throw new Error(`[tecton-adapter] type patch target ${key} missing`);
    const count = source.split(patch.find).length - 1;
    if (count !== 1) {
      throw new Error(
        `[tecton-adapter] type patch for ${key} matched ${count} times (${patch.reason})`,
      );
    }
    out[key] = source.replace(patch.find, patch.replace);
  }
  return out;
}
