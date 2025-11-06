/**
 * ESLint configuration for the monorepo.
 * Uses the flat config format introduced in ESLint v9.
 */

module.exports = [
  {
    // Apply to JavaScript files in apps and packages directories
    files: ['apps/**/*.js', 'packages/**/*.js', 'apps/**/*.svelte', 'packages/**/*.svelte'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      svelte3: require('eslint-plugin-svelte3'),
    },
    processor: 'svelte3/svelte3',
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    settings: {
      // Suppress specific Svelte warnings if needed
      'svelte3/ignore-warnings': (warning) => warning.code === 'a11y-no-onchange',
    },
  },
];
