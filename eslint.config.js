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
      // Design-process assets, not app source: the Claude Design handoff (raw
      // browser-global HTML/JS artifacts) and the design-sync re-sync tooling.
      'docs/design/handoff-senja/**',
      '.design-sync/**',
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
  // CommonJS tooling configs (e.g. webpack.config.cjs) use require/module.exports.
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { require: 'readonly', module: 'writable', __dirname: 'readonly' },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Keep last: turns off stylistic rules that would conflict with Prettier.
  eslintConfigPrettier,
);
