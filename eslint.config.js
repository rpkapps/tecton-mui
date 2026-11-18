import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'packages/tecton-adapter/vendor/**',
      'packages/ui/src/styles/tecton/generated/**',
      'packages/ui/src/internal/passthrough/**',
      'packages/ui/assets/**',
      'apps/docs/src/routeTree.gen.ts',
      'apps/docs/src/generated/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      // Library policy (AGENTS.md): no imports of commercial MUI X packages.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@mui/x-data-grid-pro*',
                '@mui/x-data-grid-premium*',
                '@mui/x-date-pickers-pro*',
                '@mui/x-tree-view-pro*',
                '@mui/x-license*',
              ],
              message: 'Commercial MUI X packages must never be used.',
            },
            {
              group: ['@mui/x-charts*', '@mui/x-scheduler*'],
              message: 'Charts and Scheduler are out of scope.',
            },
            {
              group: ['@mui/material/*/*', '@mui/x-*/internals*', '@mui/x-*/**/internals/**'],
              message: 'Do not depend on non-public MUI internals.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'tests/**', 'tooling/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
