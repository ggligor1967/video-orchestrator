/**
 * Root ESLint configuration for the Video Orchestrator monorepo.
 * Supports JavaScript files in the backend.
 * Flat config format (ESLint 9+)
 */

const js = require('@eslint/js');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.turbo/**',
      '**/node_modules/**',
      'apps/ui/src-tauri/target/**',
      'packages/*/dist/**',
      'apps/ui/.svelte-kit/**',
      'apps/ui/dist/**',
      'apps/orchestrator/dist/**',
    ],
  },
  {
    files: ['apps/**/*.js', 'packages/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        FormData: 'readonly',
        document: 'readonly',
        window: 'readonly',
        globalThis: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'warn',
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
    },
  },
];
