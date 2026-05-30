# @dewasa-ayu/api

REST API (NestJS 11) over the Wariga engine. Implements API-001. Base path `/api/v1`.

## Run

```bash
pnpm --filter @dewasa-ayu/api dev      # watch mode (nest start --watch, webpack)
pnpm --filter @dewasa-ayu/api build    # bundle to dist/main.js
pnpm --filter @dewasa-ayu/api start     # node dist/main.js  (default PORT 3001)
pnpm --filter @dewasa-ayu/api test      # e2e tests (Vitest + supertest)
```

- **OpenAPI / Swagger UI:** `http://localhost:3001/api/docs` (generated from the Zod DTOs).
- **Bruno collection:** open the `bruno/` folder in [Bruno](https://www.usebruno.com/); select the `Local` environment. Git-friendly `.bru` files — our committed API client.

## Endpoints (Slice 1 — read-only, engine-backed)

`GET /calendar/check · /calendar/month · /calendar/recommend · /calendar/range · /ceremonies · /dewasa · /health`

All dewasa verdicts carry `estimated: true` — they follow general Wariga guidance and are **not** a substitute for consulting a Sulinggih/Pemangku.

## How it's built (why webpack)

The `@dewasa-ayu/*` workspace packages ship raw TypeScript source (no prebuilt `dist`), and
NestJS needs `emitDecoratorMetadata` for DI. So the build uses the **NestJS webpack builder**
(`nest build`, config in `webpack.config.cjs`) with `ts-loader`, which both emits decorator
metadata and **bundles** the workspace packages into a single `dist/main.js` (rather than
`require()`-ing their `.ts` at runtime). E2E tests get decorator metadata via `unplugin-swc`.

## Deferred (later slices — need infrastructure)

Redis caching + tiered rate limits (Slice 2); API-key auth, `POST /feedback`, admin endpoints
(Slice 3 — need Prisma/DB, #14). Slice 1 has a basic in-memory throttle only.
