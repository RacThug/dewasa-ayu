// Flat ESLint config (ESLint 10). Shared across the monorepo: `eslint .` from the
// repo root lints every workspace. Type-aware rules are intentionally deferred until
// packages (and their tsconfigs) exist in #12 — for now this is fast, syntax-level
// linting plus import sorting and strict unused-vars.
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      'mockups/**',
      'prisma/generated/**',
      'packages/constants/src/sasih-data.ts',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Node tooling scripts (generators) run in Node and use its globals.
  {
    files: ['**/scripts/**'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
  // Keep last: turns off stylistic rules that would conflict with Prettier.
  eslintConfigPrettier,
);
