import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// NestJS needs decorator metadata at runtime; esbuild (Vitest's default) doesn't emit it,
// so we transform with SWC (which does). Mirrors the official NestJS + Vitest setup.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts', 'src/**/*.spec.ts'],
    globals: true,
  },
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
