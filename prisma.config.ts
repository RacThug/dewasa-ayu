// Dewasa Ayu — Prisma CLI configuration (Prisma 7).
//
// Prisma 7 reads CLI config from this file; the legacy package.json "prisma"
// key (including "prisma.seed") is no longer used. Prisma 7 also stopped
// auto-loading .env, so we load it here to expose DATABASE_URL to the schema's
// env("DATABASE_URL"), to `migrate`, and to `seed`.
import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // `prisma db seed` runs this command. tsx executes the TypeScript seed
    // directly under the repo's ESM + TS setup with no separate build step.
    seed: 'tsx prisma/seed.ts',
  },
  // Prisma 7 reads the Migrate/CLI connection URL from here (no longer from the
  // schema). dotenv (imported above) populates process.env.DATABASE_URL.
  datasource: {
    url: env('DATABASE_URL'),
  },
});
