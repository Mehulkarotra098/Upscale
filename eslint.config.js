// Lint rules for all hand-written JavaScript (server, API, admin app, scripts, tests).
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';

export default [
  { ignores: ['public/**', 'node_modules/**', 'source/**', 'admin/dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      'no-empty': ['error', { allowEmptyCatch: false }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'no-console': 'off',
    },
  },
  {
    // Preact app: JSX components count as used. JSX compiles with the automatic runtime, so no `h` import is needed.
    files: ['admin/src/**/*.{js,jsx}', 'card/src/**/*.{js,jsx}'],
    plugins: { react },
    languageOptions: { globals: { ...globals.browser } },
    rules: { 'react/jsx-uses-vars': 'error' },
  },
  {
    // Card maker: the core runs in the browser and in tests.
    files: ['card/src/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // Check tools run page code inside a headless browser, so they also see its globals.
    files: ['card/tools/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.browser, lab: 'readonly', pdfjs: 'writable', diff: 'readonly', toB64: 'readonly', touchObj: 'readonly' },
    },
  },
];
