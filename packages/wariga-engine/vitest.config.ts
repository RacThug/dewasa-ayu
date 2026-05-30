import { defineConfig } from 'vitest/config';

// Engine test runner. Tests live beside source as `src/**/*.test.ts`. The engine
// ships ZERO runtime dependencies; Vitest and the calculation oracle
// (balinese-date-js-lib) are devDependencies used only here, never bundled.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
});
