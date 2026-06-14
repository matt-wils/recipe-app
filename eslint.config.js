import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Build output, PWA dev artifacts, coverage reports, and the Stryker sandbox
  // are generated, not authored — never lint them.
  globalIgnores(['dist', 'dev-dist', 'coverage', '.stryker-tmp', 'reports']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Disables ESLint's stylistic rules that would conflict with Prettier.
      // Must come last so it wins.
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // The app deliberately sets state in effects for two correct patterns this
      // newer rule flags: reading platform APIs on mount (InstallBanner reads
      // navigator/matchMedia/localStorage to decide whether to show the iOS
      // install hint) and resetting derived state when inputs change (HomePage
      // re-picks a recipe and clears `justCooked` whenever filters/recipes change).
      // Both are the "synchronize with an external system" / reset-on-change cases
      // React's own docs allow, so the rule is off here.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Vite/vitest/stryker config + Node-run scripts use Node globals (process, etc.)
    // and are loaded by tooling rather than shipped to the browser.
    files: ['**/*.config.{ts,js}', 'scripts/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
]);
