---
id: API-001
title: REST API — Endpoints, Schemas, Errors
status: Active
version: 0.2.0
owners: [@RacThug]
created: 2026-05-28
updated: 2026-05-30
implements: [19]
supersedes: null
related: [ENG-001, DB-001, UI-001]
prd_refs: ["§8", "§16.4", "§17", "§22.3", "§25"]
---

# REST API — Endpoints, Schemas, Errors

## Summary

Defines the public REST API hosted at `apps/api` (NestJS). Specifies authentication, the standard error envelope, every endpoint with Zod request/response schemas, cache TTLs, and rate-limit tiers. Response shapes mirror engine types from [ENG-001](./engine.md) so the API is a thin transport over the engine; persistence shapes match [DB-001](./db.md).

> **Implementation status (2026-05-30, Slice 1).** Live in `apps/api`: the engine-backed
> read endpoints — `GET /calendar/check`, `/calendar/month`, `/calendar/recommend`,
> `/calendar/range`, `/ceremonies`, `/dewasa`, `/health` — with Zod validation, the error
> envelope, OpenAPI at `/api/docs`, a committed Bruno collection (`apps/api/bruno/`), and a
> basic in-memory throttle. **Deferred** (need infrastructure): Redis caching + tiered
> rate limits (Slice 2); API-key auth, `POST /feedback`, `/admin/*`, and full DB/Redis
> health checks (Slice 3 — need Prisma/DB #14). `OUT_OF_RANGE` currently means the Sasih
> range (~2003-2100). A bad `ceremony` value is rejected by Zod as `INVALID_PARAM` (the
> envelope lists the valid options) rather than `UNKNOWN_CEREMONY`, since validation runs
> before the engine. The `/dewasa` response is data-driven (rule id + `verified` flag), not
> the old `DewasaCode` shape — see ENG-001 v0.4.0.

## Context

The API is the sole contract for two consumers: the Dewasa Ayu frontend (`apps/web`) and third-party integrators (wedding planners, digital invitation platforms, calendar apps per PRD §2.2). Without a frozen contract, the frontend would either reach inside the engine package (breaking the apps/packages boundary) or invent its own DTO shapes. Third parties have no engine access at all — only the API.

This spec covers the **v1** surface. Versioning is URL-based (`/api/v1`); breaking changes get `/v2`. The spec describes both Phase 1 endpoints (calendar evaluation, ceremony list) and Phase 2 endpoints (otonan, feedback submission, API key management) so the route table is stable from the start.

## Goals

- Define every endpoint the frontend and third parties will call — method, path, params, response, errors, cache, rate limit — sufficient to begin NestJS module wiring without re-reading the PRD.
- Co-locate Zod schemas for requests and responses so the NestJS controllers and the frontend client can share validation logic via `@dewasa-ayu/types`.
- Specify the error envelope so all 4xx/5xx responses look identical to clients (PRD §16.4).
- Document cache TTLs and rate limits per endpoint so Redis policy and Throttler config can be derived directly.
- Cover Phase 2 endpoints (otonan, feedback, API key admin) so future additions don't reshape v1.

## Non-Goals

- **Authentication beyond API keys.** No OAuth, no JWT user sessions; user auth lands when Phase 2 user accounts ship and gets its own spec increment.
- **WebSocket / streaming.** All endpoints are request-response. Streaming month evaluation isn't worth the protocol cost at MVP scale.
- **Server-Sent Events for feedback dashboards.** Pull-based dashboards are sufficient for v1.
- **GraphQL.** REST-only per the project's recorded architecture decision; reaffirmed here.
- **Webhook delivery.** No outbound events. Add a separate spec if/when needed.

## Detailed Specification

### Auth

Two access modes:

| Mode        | Used by                                                     | Header             | Source                                                                                                     |
| ----------- | ----------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Public**  | dewasaayu.com frontend, anonymous third parties (free tier) | none               | open access; subject to IP-based rate limit                                                                |
| **API key** | Registered third parties (free, pro, enterprise tiers)      | `X-API-Key: <key>` | issued by operator via `pnpm api keys:issue` (writes to `api_keys` table — see [DB-001](./db.md#api_keys)) |

Rules:

- All GET endpoints are reachable in **public** mode. API key, when present, upgrades the requester's rate-limit tier.
- POST/PUT/DELETE endpoints (feedback submission, admin operations) require an **API key**. Public POST is limited to `/api/v1/feedback` for the accuracy widget (rate-limited heavily by IP-hash).
- Keys are validated via SHA-256 hash lookup against `api_keys.key_hash`. Hits update `last_used_at`. Revoked keys (`revoked_at IS NOT NULL`) and expired keys (`expires_at < NOW()`) are rejected with `401 UNAUTHORIZED`.

CORS: `Access-Control-Allow-Origin: https://dewasaayu.com` for the production web app; staging origin added in staging env. Wildcard CORS is **never** used (an open API key needs explicit `Origin` enforcement to prevent leak).

### Error envelope

Every 4xx/5xx response uses this exact shape (PRD §16.4):

```typescript
const ErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum([
      'INVALID_DATE',
      'UNKNOWN_CEREMONY',
      'INVALID_PARAM',
      'OUT_OF_RANGE',
      'RATE_LIMITED',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'INTERNAL_ERROR',
    ]),
    message: z.string(), // human-readable, English
    details: z.record(z.unknown()).optional(), // optional structured info (retry_after, field paths, etc.)
  }),
});
```

Mapping to HTTP status:

| Code               | Status | Meaning                                                                             |
| ------------------ | ------ | ----------------------------------------------------------------------------------- |
| `INVALID_DATE`     | 400    | Bad date param (non-ISO, NaN, malformed).                                           |
| `UNKNOWN_CEREMONY` | 400    | `ceremony` param not in registry. `details.valid_ceremonies` lists accepted values. |
| `INVALID_PARAM`    | 400    | Other invalid params (negative count, bad month/year, malformed body).              |
| `OUT_OF_RANGE`     | 400    | Date outside the supported 1900-2100 range.                                         |
| `UNAUTHORIZED`     | 401    | API key missing where required, or key invalid/expired/revoked.                     |
| `FORBIDDEN`        | 403    | API key present but lacks the tier required (e.g. enterprise-only endpoint).        |
| `NOT_FOUND`        | 404    | Resource (ceremony, dewasa code) not found.                                         |
| `RATE_LIMITED`     | 429    | Tier quota exhausted. `details.retry_after` (seconds) and `details.tier` populated. |
| `INTERNAL_ERROR`   | 500    | Unhandled engine error or DB failure. `details.trace_id` populated for correlation. |

Successful responses do NOT wrap in an envelope — they return the raw data. This avoids double-nesting in the common case (PRD §16.4 example).

Successful response shape:

```typescript
// Returned directly, not wrapped. Each endpoint specifies its own response schema below.
```

### Endpoints

Base path: `/api/v1`. All examples assume `https://api.dewasaayu.com/api/v1/...`.

#### `GET /calendar/check`

Full date info + ceremony-specific evaluation for a single Gregorian date.

**Query params:**

```typescript
const CheckQuery = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO 8601 date
  ceremony: CeremonyIdSchema, // see ENG-001
});
```

**Response:**

```typescript
const CheckResponse = z.object({
  date: z.string(), // echo of input
  info: BalineseDateSchema, // matches ENG-001 BalineseDate
  evaluation: EvaluationSchema, // matches ENG-001 Evaluation
});
```

**Status codes:** 200 (success), 400 (`INVALID_DATE`, `UNKNOWN_CEREMONY`, `OUT_OF_RANGE`), 429, 500.

**Cache TTL:** 24 hours (date is canonical; rules change rarely). Cache key: `check:{date}:{ceremony}`.

**Rate limit:** free 60/min, pro 600/min, enterprise unlimited (per-account quota in DB).

#### `GET /calendar/month`

Calendar view for an entire Gregorian month with per-day evaluation.

**Query params:**

```typescript
const MonthQuery = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  ceremony: CeremonyIdSchema,
});
```

**Response:**

```typescript
const MonthResponse = z.object({
  year: z.number(),
  month: z.number(),
  ceremony: CeremonyIdSchema,
  days: z.array(EvaluatedDateSchema), // matches ENG-001 EvaluatedDate; length = days in month
  summary: z.object({
    ayuCount: z.number(),
    cautionCount: z.number(),
    badCount: z.number(),
    topDates: z.array(EvaluatedDateSchema), // up to 5
  }),
});
```

**Status codes:** 200, 400 (`INVALID_PARAM`, `UNKNOWN_CEREMONY`, `OUT_OF_RANGE`), 429, 500.

**Cache TTL:** 24 hours. Cache key: `month:{year}:{month}:{ceremony}`.

**Rate limit:** free 30/min (heavier query), pro 300/min, enterprise unlimited.

#### `GET /calendar/recommend`

Find N nearest good (`ayu`) dates from a starting date.

**Query params:**

```typescript
const RecommendQuery = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.coerce.number().int().min(1).max(20), // hard cap 20
  ceremony: CeremonyIdSchema,
});
```

**Response:**

```typescript
const RecommendResponse = z.object({
  from: z.string(),
  count: z.number(), // requested
  dates: z.array(EvaluatedDateSchema), // actual results (≤ count)
  capReached: z.boolean(), // true if engine's 365-day scan cap was hit
});
```

**Status codes:** 200, 400 (`INVALID_DATE`, `INVALID_PARAM`, `UNKNOWN_CEREMONY`), 429, 500.

**Cache TTL:** 1 hour (results stable, but Sasih corrections may update mid-period for high-traffic dates). Cache key: `recommend:{from}:{count}:{ceremony}`.

**Rate limit:** free 20/min (most expensive), pro 200/min, enterprise unlimited.

#### `GET /calendar/range`

Evaluate every date in a closed range.

**Query params:**

```typescript
const RangeQuery = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ceremony: CeremonyIdSchema,
  })
  .refine(({ from, to }) => new Date(to).getTime() - new Date(from).getTime() <= 90 * 86400000, {
    message: 'Range must be ≤ 90 days',
    path: ['to'],
  });
```

**Response:**

```typescript
const RangeResponse = z.object({
  from: z.string(),
  to: z.string(),
  ceremony: CeremonyIdSchema,
  dates: z.array(EvaluatedDateSchema),
});
```

**Status codes:** 200, 400 (`INVALID_DATE`, `INVALID_PARAM`, `UNKNOWN_CEREMONY`), 429, 500.

**Cache TTL:** 24 hours. Cache key: `range:{from}:{to}:{ceremony}`.

**Rate limit:** free 10/min, pro 100/min, enterprise unlimited. 90-day cap enforced at validation.

#### `GET /ceremonies`

List all supported ceremony types.

**Query params:** none.

**Response:**

```typescript
const CeremoniesResponse = z.object({
  ceremonies: z.array(
    z.object({
      id: CeremonyIdSchema, // engine slug
      name: z.string(), // Indonesian display
      category: z.enum(['manusa_yadnya', 'dewa_yadnya', 'pitra_yadnya', 'cross']),
      description: z.string(), // 1-2 paragraph
      icon: z.string(), // emoji
    }),
  ),
});
```

**Status codes:** 200, 500.

**Cache TTL:** 1 hour (effectively static; rebuilds when ceremony rules change). Cache key: `ceremonies:list`.

**Rate limit:** free 120/min, pro 1200/min, enterprise unlimited.

#### `GET /dewasa`

List dewasa rules applicable to a ceremony (or all rules with `ceremony=all`).

**Query params:**

```typescript
const DewasaQuery = z.object({
  ceremony: z
    .union([CeremonyIdSchema, z.literal('all')])
    .optional()
    .default('all'),
  type: z.enum(['ayu', 'ala']).optional(), // filter by type
});
```

**Response:**

```typescript
const DewasaResponse = z.object({
  ceremony: z.union([CeremonyIdSchema, z.literal('all')]),
  rules: z.array(
    z.object({
      code: z.string(), // matches engine DewasaCode
      name: z.string(), // Indonesian
      type: z.enum(['ayu', 'ala']),
      severity: z.enum(['critical', 'minor']).nullable(),
      description: z.string(), // Indonesian
      applicableCeremonies: z.array(CeremonyIdSchema),
    }),
  ),
});
```

**Status codes:** 200, 400 (`UNKNOWN_CEREMONY`), 500.

**Cache TTL:** 1 hour. Cache key: `dewasa:{ceremony}:{type|all}`.

**Rate limit:** free 120/min, pro 1200/min, enterprise unlimited.

#### `GET /otonan` (Phase 2)

Calculate otonan anniversaries for a birthdate within a target year.

**Query params:**

```typescript
const OtonanQuery = z.object({
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  year: z.coerce.number().int().min(1900).max(2100),
});
```

**Response:**

```typescript
const OtonanResponse = z.object({
  birthdate: z.string(),
  year: z.number(),
  occurrences: z.array(OtonanInfoSchema), // matches ENG-001 OtonanInfo
});
```

**Status codes:** 200, 400 (`INVALID_DATE`, `INVALID_PARAM`), 429, 500.

**Cache TTL:** 7 days (otonan dates don't change for a given birthdate). Cache key: `otonan:{birthdate}:{year}`.

**Rate limit:** free 30/min, pro 300/min, enterprise unlimited.

#### `POST /feedback`

Submit accuracy feedback (PRD §17.2 widget). Public endpoint with heavy IP-based rate limiting.

**Body:**

```typescript
const FeedbackBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ceremony: CeremonyIdSchema,
  ratingMatch: z.enum(['yes', 'no', 'unknown']),
  notes: z.string().max(2000).optional(),
});
```

**Response:**

```typescript
const FeedbackResponse = z.object({
  id: z.string().uuid(), // newly created feedback row
  receivedAt: z.string().datetime(),
});
```

**Status codes:** 201 (created), 400 (`INVALID_DATE`, `INVALID_PARAM`, `UNKNOWN_CEREMONY`), 429, 500.

**Cache:** never cached (write endpoint).

**Rate limit:** **3 submissions per IP-hash per hour** (anti-spam). Tier-irrelevant — even paid keys are rate-limited here to prevent flooding.

#### `GET /health`

Operational health check (PRD §7.3 mentioned `@nestjs/terminus`).

**Response:**

```typescript
const HealthResponse = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  checks: z.object({
    database: z.enum(['ok', 'down']),
    redis: z.enum(['ok', 'down']),
    engineVersion: z.string(), // semver of @dewasa-ayu/wariga-engine
    uptime: z.number(), // seconds
  }),
});
```

**Status codes:** 200 (status `ok` or `degraded`), 503 (status `down`).

**Cache:** never cached.

**Rate limit:** uncapped (used by uptime monitoring; capping it would defeat the purpose).

#### Admin endpoints (Phase 2 / enterprise tier)

```
POST   /admin/api-keys           — issue new API key (returns plain key once; only enterprise+operator)
DELETE /admin/api-keys/:id       — revoke key
GET    /admin/api-keys           — list keys (no raw secrets)
POST   /admin/sasih-corrections  — insert/update correction row
GET    /admin/feedback           — paginated feedback browse, with rating_match filter
```

Auth: requires `X-API-Key` with `tier = 'enterprise'` AND an additional `X-Admin-Token` header matching the deployment's `ADMIN_TOKEN` env. Full schemas to be added in this spec when the admin UI is designed; reserve the URL space here so it's stable.

### Examples

#### Universal response headers

Every successful response (regardless of endpoint) carries:

| Header                  | Value                                               | Purpose                                                           |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| `X-API-Version`         | `1` (matching `/v1`)                                | Lets clients log which version they targeted.                     |
| `X-Engine-Version`      | semver of `@dewasa-ayu/wariga-engine` at build time | Lets clients tie evaluation results to a specific engine release. |
| `X-RateLimit-Remaining` | integer                                             | Calls left in current window for the tier in use.                 |
| `X-RateLimit-Reset`     | unix epoch seconds                                  | When the current rate-limit window resets.                        |

#### Worked requests

#### `GET /calendar/check`

```bash
curl 'https://api.dewasaayu.com/api/v1/calendar/check?date=2026-10-15&ceremony=pawiwahan'
```

Success (200):

```json
{
  "date": "2026-10-15",
  "info": {
    "gregorian": "2026-10-15T00:00:00.000Z",
    "pawukonDay": 87,
    "wuku": "krulut",
    "saptawara": "wraspati",
    "pancawara": "pon",
    "triwara": "kajeng",
    "sadwara": "tungleh",
    "astawara": "indra",
    "sangawara": "tulus",
    "dasawara": "dewa",
    "caturwara": "sri",
    "dwiwara": "menga",
    "ekawara": null,
    "sasih": {
      "index": 2,
      "name": "katiga",
      "penanggal": 5,
      "isPangelong": false,
      "isPurnama": false,
      "isTilem": false,
      "isNampih": false,
      "isMala": false,
      "isEstimated": true,
      "tahunSaka": 1948
    },
    "ingkel": "manuk",
    "jejepan": "sato",
    "totalUrip": 15
  },
  "evaluation": {
    "ceremony": "pawiwahan",
    "rating": "ayu",
    "score": 8.5,
    "maxScore": 11.0,
    "pct": 77,
    "checks": [
      { "factor": "saptawara", "passed": true, "weight": 2.0, "contribution": 2.0 },
      { "factor": "wuku", "passed": true, "weight": 1.5, "contribution": 1.5 },
      { "factor": "sasih", "passed": true, "weight": 2.0, "contribution": 2.0 },
      { "factor": "dewasa_ayu:sangawara_tulus", "passed": true, "weight": 1.5, "contribution": 1.5 }
    ],
    "dewasaAyu": [
      {
        "code": "sangawara_tulus",
        "name": "Sangawara Tulus",
        "type": "ayu",
        "description": "Langsung berhasil",
        "applicableCeremonies": [
          "pawiwahan",
          "manusa_yadnya",
          "dewa_yadnya",
          "pitra_yadnya",
          "pembangunan",
          "usaha"
        ]
      }
    ],
    "dewasaAla": [],
    "hasCriticalAla": false,
    "sasihEstimated": true
  }
}
```

Error (400 — unknown ceremony):

```json
{
  "success": false,
  "error": {
    "code": "UNKNOWN_CEREMONY",
    "message": "Ceremony 'wedding' is not recognised",
    "details": {
      "valid_ceremonies": [
        "pawiwahan",
        "manusa_yadnya",
        "dewa_yadnya",
        "pitra_yadnya",
        "pembangunan",
        "usaha"
      ]
    }
  }
}
```

#### `POST /feedback`

```bash
curl -X POST 'https://api.dewasaayu.com/api/v1/feedback' \
  -H 'Content-Type: application/json' \
  -d '{
    "date": "2026-10-15",
    "ceremony": "pawiwahan",
    "ratingMatch": "yes",
    "notes": "Sesuai dengan saran Sulinggih kami."
  }'
```

Success (201):

```json
{ "id": "0193abcd-1234-7e89-9abc-def012345678", "receivedAt": "2026-05-28T10:23:45.678Z" }
```

Rate-limited (429):

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many feedback submissions from this IP. Try again later.",
    "details": { "retry_after": 1234, "tier": "public" }
  }
}
```

## Decisions & Rationale

- **REST-only (reaffirmed).** Project's recorded architecture decision. GraphQL's query flexibility is wasted on a small endpoint surface where each route maps cleanly to one engine function. Trade-off: GraphQL would let clients shape responses; we accept that and ship slimmer DTOs as needed.

- **Successful responses are NOT wrapped in `{ success: true, data: … }`.** Error envelope is fine because errors are rare and need machine-readable codes. Success responses are read by code paths that already know what shape to expect; wrapping doubles the JSON size and reduces ergonomics. Errors follow PRD §16.4 verbatim.

- **Zod schemas live in `@dewasa-ayu/types` and are imported by NestJS controllers AND the frontend client.** Single source of truth, no DTO drift. NestJS uses Zod via `nestjs-zod`; the frontend uses the same schemas in react-query mutations.

- **Schemas sit behind the `@dewasa-ayu/types/schemas` subpath (not the root entry).** The root `@dewasa-ayu/types` stays pure types so the zero-dependency engine — which type-imports only the root — never pulls in Zod. The API/web import the `/schemas` subpath; `@dewasa-ayu/types` gains a `zod` dependency that the engine's bundle never includes. Enum members are duplicated from the unions (not imported from `@dewasa-ayu/constants`) to avoid a types↔constants cycle, with `satisfies` drift-guards keeping them in sync.

- **`nestjs-zod` v5 + Zod 4 + `createZodDto`; OpenAPI via `cleanupOpenApiDoc`.** Global `ZodValidationPipe` validates query DTOs; the global exception filter maps every error to the envelope (engine `WarigaError` → its own code; Zod validation failure → `INVALID_PARAM` with the issues; `ThrottlerException` → `RATE_LIMITED`). v5 (not v4) is required for `@nestjs/swagger` 11 compatibility.

- **`apps/api` is built with the NestJS webpack builder, bundling the `@dewasa-ayu/*` source.** The workspace packages ship raw `.ts` (no prebuilt dist) and NestJS needs `emitDecoratorMetadata`, so `ts-loader` compiles + bundles them into one `dist/main.js`. E2E tests get metadata via `unplugin-swc`.

- **Bruno is the committed API client; OpenAPI/Swagger remains the contract + docs.** They are complementary, not substitutes: OpenAPI (`/api/docs`, generated from Zod) is the machine-readable contract for the FE and third parties; the git-friendly `apps/api/bruno/` collection is the interactive dev/test client (replacing Postman). Refines the 2026-05-25 "REST + Swagger" decision.

- **Per-endpoint cache TTL > universal TTL.** Different endpoints have different staleness tolerance (`/health` is never cached, `/calendar/month` for 24h, `/feedback` never). Specifying per-endpoint avoids a tempting "just cache everything" rule that breaks the feedback widget.

- **Cache key includes ceremony.** Adding ceremony to every cache key matters because the same date evaluates differently per ceremony. Easy to forget; calling it out here as a hard rule.

- **`/calendar/range` capped at 90 days.** Beyond 90 days, clients should compose `/calendar/month` calls (cacheable per-month) to avoid one giant uncached response. Validation enforces the cap before the engine runs.

- **`POST /feedback` is public (no API key).** The accuracy widget needs to be one-tap for users. IP-hash rate limit (3/hour) and the optional CAPTCHA hook (Phase 2) handle spam. PRD §17.2 explicitly anchors this widget as a public surface.

- **API key in a header, not a query param.** Query-param keys leak to access logs and referer headers. `X-API-Key` is the boring correct choice.

- **Two-layer auth for admin: API key (tier=enterprise) + `X-Admin-Token`.** API key alone is what third-party enterprise integrators have; admin operations also require an operator-only token from the deployment env. Belt-and-braces because admin ops can modify Sasih corrections and rate limits.

- **Versioning headers (`X-API-Version`, `X-Engine-Version`) returned with every success.** Clients can log "I got this result from API v1, engine 1.4.2" and diagnose drift if rules change. Matches PRD §25.1.

- **Phase 2 endpoints get URL space reserved now.** `/otonan`, `/admin/*`, and `/feedback` paths are committed in v1 even if Phase 2 endpoints throw `INTERNAL_ERROR` (or 501 NOT_IMPLEMENTED in a transitional release). Prevents future URL bikeshedding under launch pressure.

## Open Questions

- [Q] Should `/calendar/check` accept multiple `ceremony` values in one call (e.g. `ceremony=pawiwahan,ngaben`) for the dashboard view that shows all-ceremony evaluations side by side? Trade-off: response size grows linearly; cache key becomes order-sensitive. Owner: @RacThug. Target: when UI dashboard requirements are written in [UI-001](./pages.md).
- [Q] Status code for "Phase 2 endpoint exists but not yet implemented" — 501 Not Implemented (semantically right) vs 503 Service Unavailable (suggests transient). Recommend 501 with body `{ code: 'NOT_IMPLEMENTED', message: 'Endpoint scheduled for Phase 2' }`. Owner: @RacThug. Target: when the first Phase 2 endpoint ships behind a flag.
- [Q] Should `/feedback` accept anonymous notes longer than 2000 chars? The 2000 cap is a guess based on typical free-text feedback length. Longer notes risk DB bloat; shorter risks losing nuance. Owner: @RacThug. Target: after first month of real feedback data.
- [Q] Tier definition: should `pro` get unlimited `/health`? Currently uncapped for everyone (it's used by monitoring). Could turn into an abuse vector. Recommend leaving uncapped and adding IP-based rate limit at the load-balancer layer if abuse appears. Owner: @RacThug. Target: post-launch monitoring.
- [Q] Should we expose `Retry-After` header alongside the `details.retry_after` JSON field on 429? Header is HTTP-standard; some clients (curl, axios) parse it automatically. Recommend yes — emit both. Owner: @RacThug. Target: during NestJS module wiring.

## References

- [PRD §8 — API Specification](../PRD.md)
- [PRD §16.4 — API Error Responses](../PRD.md)
- [PRD §17 — Analytics & Feedback Loop](../PRD.md)
- [PRD §22.3 — API Performance Budget](../PRD.md)
- [PRD §25 — Versioning & Changelog](../PRD.md)
- Sibling specs: [ENG-001](./engine.md) (Zod schemas mirror engine types), [DB-001](./db.md) (`api_keys`, `feedback` tables), [UI-001](./pages.md) (consumer of these endpoints)
- GitHub issue [#19](https://github.com/RacThug/dewasa-ayu/issues/19) — implementing task for this spec
- GitHub issue [#3](https://github.com/RacThug/dewasa-ayu/issues/3) — Phase 2 NestJS API epic
- [NestJS docs — Swagger module](https://docs.nestjs.com/openapi/introduction) — auto-generate OpenAPI from controllers
- [nestjs-zod](https://github.com/risen228/nestjs-zod) — Zod-NestJS integration option

## Changelog

- v0.2.0 — 2026-05-30 — **Slice 1 implemented** (`apps/api`, NestJS 11). Shipped the seven engine-backed read endpoints with Zod validation (`nestjs-zod` v5 + Zod 4), the error envelope via a global exception filter, OpenAPI at `/api/docs`, a committed Bruno collection, and a basic in-memory throttle. Schemas live at the `@dewasa-ayu/types/schemas` subpath (keeps the engine zero-dep). Built with the NestJS webpack builder (bundles the workspace source); e2e tests via Vitest + supertest + `unplugin-swc` (11 tests). Status `Draft → Active` (partial). Deferred to later slices: Redis caching, tiered rate limits, API-key auth, `POST /feedback`, `/admin/*` (need Prisma/DB + Redis). Recorded the schema-subpath, nestjs-zod-v5, webpack-build, and Bruno decisions.
- v0.1.0 — 2026-05-28 — Initial draft. Eight Phase 1 endpoints (`/calendar/check`, `/calendar/month`, `/calendar/recommend`, `/calendar/range`, `/ceremonies`, `/dewasa`, `/health`, `POST /feedback`) and Phase 2 placeholders (`/otonan`, `/admin/*`). Error envelope per PRD §16.4. Per-endpoint cache TTLs and rate-limit tiers documented. Auth: public for GETs, API key for POST/PUT/DELETE, two-layer for admin. Five open questions flagged.
