import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve workspace packages to TypeScript sources (see the "@tecton-mui/source" export condition).
    conditions: ['@tecton-mui/source'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tooling/vitest.setup.ts'],
    include: [
      'packages/*/src/**/*.test.{ts,tsx}',
      'packages/*/tests/**/*.test.{ts,tsx}',
      'apps/*/src/**/*.test.{ts,tsx}',
    ],
    css: false,
    coverage: {
      provider: 'v8',
      include: ['packages/ui/src/**/*.{ts,tsx}', 'packages/mcp/src/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/tests/**',
        // Generated passthrough re-exports and generated Tecton theme data carry no logic of ours.
        'packages/ui/src/internal/passthrough/**',
        'packages/ui/src/styles/tecton/generated/**',
        'packages/ui/src/index.ts',
        'packages/mcp/src/cli.ts',
      ],
      // Tracked dimensions: statements, branches, functions and lines, each >= 80% (SPEC §11.2).
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
