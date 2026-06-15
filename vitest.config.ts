import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Kept separate from vite.config.ts so the production build's type-check
// (tsc -b) never sees the `test` key, avoiding vite/vitest type conflicts.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Gate the pure logic core — utils, the IndexedDB layer, and the data
      // loaders. Pages, hooks, and UI components are React render-glue that's
      // exercised by hand and (eventually) e2e, not unit tests; including them
      // would force a meaninglessly low global floor. Mirrors restaurants
      // excluding its Leaflet-coupled components from the coverage gate.
      include: ['src/utils/**', 'src/db/**', 'src/data/**'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
      // Floors sit ~5 points below measured (stmts 89.3 / branch 79 / funcs 92)
      // so an incidental dip doesn't redden CI; raise them as coverage grows.
      // Vitest 4's v8 coverage is AST-aware, so it counts branches more
      // granularly than v2 did — the branch % dropped (~92 → ~79) on identical
      // code/tests, hence the lower branch floor here.
      thresholds: {
        statements: 80,
        branches: 74,
        functions: 68,
        lines: 80,
      },
    },
  },
});
