---
id: DB-001
title: Database Schema — PostgreSQL via Prisma
status: Draft
version: 0.1.0
owners: [@RacThug]
created: 2026-05-28
updated: 2026-05-28
implements: [18]
supersedes: null
related: [ENG-001, API-001]
prd_refs: ["§7", "§11", "§17.2", "§24"]
---

# Database Schema — PostgreSQL via Prisma

## Summary

Defines the PostgreSQL schema for Dewasa Ayu: seven tables covering ceremony definitions, dewasa detection rules, Sasih corrections, anonymous feedback, optional user accounts, and API key management. Schema is managed through Prisma Migrate. JSONB columns carry structured rule data validated by Zod schemas that match the engine types declared in [ENG-001](./engine.md).

## Context

The platform stores three classes of data:

1. **Reference data** (ceremony types, dewasa rules, Sasih corrections) — content-managed, evolves with cultural feedback, queried on every evaluation.
2. **Telemetry / feedback** — anonymous accuracy feedback (PRD §17.2) to validate engine output against user expectation.
3. **Phase 2 user data** (accounts, saved dates) — deferred behind a feature flag; tables exist from the start so migrations are stable.

API key data lives here too so rate limiting can hit the database when Redis is cold. The engine itself reads only ceremony rules + Sasih corrections via the cache layer; everything else is API/admin domain.

This spec freezes the schema before [#14](https://github.com/RacThug/dewasa-ayu/issues/14) (Prisma init) lands. Any change post-implementation goes through a versioned update on this spec plus a Prisma migration.

## Goals

- Cover every persistent entity needed for MVP + Phase 2 user features (table exists, column shape stable, FK direction decided).
- Define JSONB shape via Zod schemas that mirror engine types ([ENG-001](./engine.md)) so the API layer can serialise/deserialise without translation.
- Specify non-trivial indexes — composite, partial, GIN — for the queries the API actually issues.
- Document idempotent seed-data sources for ceremony types, dewasa rules, and Sasih corrections.
- Capture the migration order so a fresh checkout can `pnpm prisma migrate dev` and reach a working schema in one command.

## Non-Goals

- **Query optimisation beyond index choice.** Materialised views, query plan tuning, and partitioning are deferred until measured load demands them.
- **Multi-tenant isolation.** Single-tenant schema; if a B2B variant emerges later it gets its own spec.
- **Event sourcing / audit log.** PRD does not require full history; `created_at`/`updated_at` timestamps are sufficient for v1.
- **Read replicas, sharding, partitioning.** Single primary on Neon (per PRD §23.1). Revisit if traffic exceeds Neon free tier.

## Detailed Specification

### ERD

```mermaid
erDiagram
    ceremony_types ||--o{ saved_dates : "referenced by (Phase 2)"
    users ||--o{ saved_dates : owns
    ceremony_types {
        uuid id PK
        varchar slug UK
        varchar name
        varchar category
        text description
        varchar icon
        jsonb rules
        int sort_order
        timestamptz created_at
        timestamptz updated_at
    }
    dewasa_rules {
        uuid id PK
        varchar code UK
        varchar name
        dewasa_type type
        severity severity NULL
        jsonb condition
        text description
        varchar applicable_ceremonies "array"
        timestamptz created_at
        timestamptz updated_at
    }
    sasih_corrections {
        uuid id PK
        int tahun_saka
        smallint sasih_index
        varchar sasih_name
        date tilem_date
        date purnama_date
        bool is_nampih
        bool is_mala
        varchar source
        timestamptz created_at
        timestamptz updated_at
    }
    feedback {
        uuid id PK
        date target_date
        varchar ceremony_slug
        rating_match rating_match
        text notes NULL
        text user_agent NULL
        varchar ip_hash NULL
        timestamptz created_at
    }
    users {
        uuid id PK
        varchar email UK
        varchar name NULL
        varchar locale
        timestamptz created_at
        timestamptz updated_at
    }
    saved_dates {
        uuid id PK
        uuid user_id FK
        date date
        uuid ceremony_type_id FK
        text notes NULL
        timestamptz created_at
        timestamptz updated_at
    }
    api_keys {
        uuid id PK
        varchar key_hash UK
        api_tier tier
        int rate_limit
        varchar owner_email NULL
        text description NULL
        timestamptz expires_at NULL
        timestamptz revoked_at NULL
        timestamptz last_used_at NULL
        timestamptz created_at
    }
```

`saved_dates` is the only FK-bearing table. All other relationships are looser (`applicable_ceremonies` is a string array of `ceremony_types.slug` values; `feedback.ceremony_slug` likewise) to keep the reference-data tables independently editable without cascading lock contention.

### Tables

#### `ceremony_types`

Master list of supported ceremonies. Each row is one ceremony slot the UI's ceremony selector can show. The `rules` JSONB column holds the full `CeremonyConfig` rule data minus the redundant id/name/category fields (those are columns).

| Column        | Type           | Null     | Default             | Notes                                                              |
| ------------- | -------------- | -------- | ------------------- | ------------------------------------------------------------------ |
| `id`          | `UUID`         | NOT NULL | `gen_random_uuid()` | PK                                                                 |
| `slug`        | `VARCHAR(50)`  | NOT NULL | —                   | UNIQUE. Matches engine `CeremonyId` (e.g. `'pawiwahan'`).          |
| `name`        | `VARCHAR(200)` | NOT NULL | —                   | Indonesian display name.                                           |
| `category`    | `VARCHAR(50)`  | NOT NULL | —                   | One of `manusa_yadnya`, `dewa_yadnya`, `pitra_yadnya`, `cross`.    |
| `description` | `TEXT`         | NOT NULL | —                   | 1-2 paragraph Indonesian description.                              |
| `icon`        | `VARCHAR(50)`  | NOT NULL | —                   | Emoji or icon ref (e.g. `'💍'`).                                   |
| `rules`       | `JSONB`        | NOT NULL | —                   | See [JSONB shapes › `ceremony_types.rules`](#ceremony_typesrules). |
| `sort_order`  | `INTEGER`      | NOT NULL | `0`                 | Controls display order in the ceremony selector.                   |
| `created_at`  | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             |                                                                    |
| `updated_at`  | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             | Updated via Prisma `@updatedAt`.                                   |

#### `dewasa_rules`

All 33 dewasa rules (16 ayu + 17 ala from PRD §4.2-§4.3). Each row describes a single dewasa code with a JSONB condition tree that the engine evaluates against a `BalineseDate`.

| Column                  | Type            | Null     | Default             | Notes                                                                                                                          |
| ----------------------- | --------------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`                    | `UUID`          | NOT NULL | `gen_random_uuid()` | PK                                                                                                                             |
| `code`                  | `VARCHAR(50)`   | NOT NULL | —                   | UNIQUE. Matches engine `DewasaCode` (e.g. `'subacara'`).                                                                       |
| `name`                  | `VARCHAR(200)`  | NOT NULL | —                   | Indonesian display name.                                                                                                       |
| `type`                  | `dewasa_type`   | NOT NULL | —                   | Enum `'ayu'` \| `'ala'`.                                                                                                       |
| `severity`              | `severity`      | NULL     | `NULL`              | Enum `'critical'` \| `'minor'`. Required when `type = 'ala'`; must be NULL when `type = 'ayu'` (enforced by CHECK constraint). |
| `condition`             | `JSONB`         | NOT NULL | —                   | See [JSONB shapes › `dewasa_rules.condition`](#dewasa_rulescondition).                                                         |
| `description`           | `TEXT`          | NOT NULL | —                   | 1-2 sentence Indonesian explanation, surfaced in UI tooltips.                                                                  |
| `applicable_ceremonies` | `VARCHAR(50)[]` | NOT NULL | `'{}'`              | PostgreSQL array of ceremony slugs. Empty array means "applies to all".                                                        |
| `created_at`            | `TIMESTAMPTZ`   | NOT NULL | `NOW()`             |                                                                                                                                |
| `updated_at`            | `TIMESTAMPTZ`   | NOT NULL | `NOW()`             |                                                                                                                                |

CHECK constraint: `(type = 'ala' AND severity IS NOT NULL) OR (type = 'ayu' AND severity IS NULL)`.

#### `sasih_corrections`

Year-by-year override for Sasih estimation. Filled from published Kalender Bali sources (PRD §24.1). Each row pins a specific `tahun_saka × sasih_index` combination's tilem/purnama dates and intercalary flags.

| Column         | Type           | Null     | Default             | Notes                                                                                   |
| -------------- | -------------- | -------- | ------------------- | --------------------------------------------------------------------------------------- |
| `id`           | `UUID`         | NOT NULL | `gen_random_uuid()` | PK                                                                                      |
| `tahun_saka`   | `INTEGER`      | NOT NULL | —                   | Saka year (e.g. `1948`).                                                                |
| `sasih_index`  | `SMALLINT`     | NOT NULL | —                   | 0-11 matching engine `SasihInfo.index`. CHECK `0 <= sasih_index AND sasih_index <= 11`. |
| `sasih_name`   | `VARCHAR(20)`  | NOT NULL | —                   | Denormalised name for human inspection (e.g. `'kadasa'`).                               |
| `tilem_date`   | `DATE`         | NOT NULL | —                   | Gregorian date of Tilem (new moon, Pangelong 15).                                       |
| `purnama_date` | `DATE`         | NOT NULL | —                   | Gregorian date of Purnama (full moon, Penanggal 15).                                    |
| `is_nampih`    | `BOOLEAN`      | NOT NULL | `FALSE`             | Intercalary month flag.                                                                 |
| `is_mala`      | `BOOLEAN`      | NOT NULL | `FALSE`             | Skipped month flag (rare).                                                              |
| `source`       | `VARCHAR(200)` | NOT NULL | —                   | Citation (e.g. `'kalenderbali.org/2026'`).                                              |
| `created_at`   | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             |                                                                                         |
| `updated_at`   | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             |                                                                                         |

UNIQUE: `(tahun_saka, sasih_index)`.

#### `feedback`

Anonymous accuracy-feedback storage for the widget defined in PRD §17.2 ("Apakah hasil ini sesuai dengan saran Sulinggih/Pemangku Anda?").

| Column          | Type           | Null     | Default             | Notes                                                                     |
| --------------- | -------------- | -------- | ------------------- | ------------------------------------------------------------------------- |
| `id`            | `UUID`         | NOT NULL | `gen_random_uuid()` | PK                                                                        |
| `target_date`   | `DATE`         | NOT NULL | —                   | The Gregorian date the user was evaluating.                               |
| `ceremony_slug` | `VARCHAR(50)`  | NOT NULL | —                   | The ceremony selected at submission time.                                 |
| `rating_match`  | `rating_match` | NOT NULL | —                   | Enum `'yes'` \| `'no'` \| `'unknown'`.                                    |
| `notes`         | `TEXT`         | NULL     | —                   | Free-form reply (Indonesian expected).                                    |
| `user_agent`    | `TEXT`         | NULL     | —                   | Browser UA for bot filtering during analysis.                             |
| `ip_hash`       | `VARCHAR(64)`  | NULL     | —                   | SHA-256 of `(ip + daily_salt)` for de-duplication without storing the IP. |
| `created_at`    | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             |                                                                           |

No `updated_at` — feedback rows are immutable after submission.

#### `users` (Phase 2)

Optional user accounts for saved dates and preferences. Table exists from v1 so migrations are stable; actually populated only when Phase 2 auth ships.

| Column       | Type           | Null     | Default             | Notes                                                                             |
| ------------ | -------------- | -------- | ------------------- | --------------------------------------------------------------------------------- |
| `id`         | `UUID`         | NOT NULL | `gen_random_uuid()` | PK                                                                                |
| `email`      | `VARCHAR(255)` | NOT NULL | —                   | UNIQUE. Case-insensitive lookup via lowercased copy stored as the canonical form. |
| `name`       | `VARCHAR(200)` | NULL     | —                   | Display name, optional.                                                           |
| `locale`     | `VARCHAR(10)`  | NOT NULL | `'id-ID'`           | BCP-47 (`'id-ID'` or `'en'`).                                                     |
| `created_at` | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             |                                                                                   |
| `updated_at` | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             |                                                                                   |

#### `saved_dates` (Phase 2)

Per-user date bookmarks. FK to `users` and `ceremony_types`. Cascading delete: dropping a user wipes their bookmarks; renaming a ceremony slug breaks nothing because `ceremony_type_id` is a UUID FK, not a slug.

| Column             | Type          | Null     | Default             | Notes                                        |
| ------------------ | ------------- | -------- | ------------------- | -------------------------------------------- |
| `id`               | `UUID`        | NOT NULL | `gen_random_uuid()` | PK                                           |
| `user_id`          | `UUID`        | NOT NULL | —                   | FK → `users(id)` ON DELETE CASCADE.          |
| `date`             | `DATE`        | NOT NULL | —                   | Gregorian date saved.                        |
| `ceremony_type_id` | `UUID`        | NOT NULL | —                   | FK → `ceremony_types(id)` ON DELETE CASCADE. |
| `notes`            | `TEXT`        | NULL     | —                   | User's free-form note.                       |
| `created_at`       | `TIMESTAMPTZ` | NOT NULL | `NOW()`             |                                              |
| `updated_at`       | `TIMESTAMPTZ` | NOT NULL | `NOW()`             |                                              |

UNIQUE: `(user_id, date, ceremony_type_id)` — a user shouldn't save the same date for the same ceremony twice.

#### `api_keys`

API key registry for the public REST API rate-limiting and tier enforcement.

| Column         | Type           | Null     | Default             | Notes                                                                                             |
| -------------- | -------------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------- |
| `id`           | `UUID`         | NOT NULL | `gen_random_uuid()` | PK                                                                                                |
| `key_hash`     | `VARCHAR(64)`  | NOT NULL | —                   | UNIQUE. SHA-256 of the issued key. The raw key is shown to the operator once and never persisted. |
| `tier`         | `api_tier`     | NOT NULL | `'free'`            | Enum `'free'` \| `'pro'` \| `'enterprise'`.                                                       |
| `rate_limit`   | `INTEGER`      | NOT NULL | `60`                | Requests per minute.                                                                              |
| `owner_email`  | `VARCHAR(255)` | NULL     | —                   | Optional contact for the key's owner.                                                             |
| `description`  | `TEXT`         | NULL     | —                   | Operator note (e.g. `'wedding-planner-app'`).                                                     |
| `expires_at`   | `TIMESTAMPTZ`  | NULL     | —                   | Optional expiry.                                                                                  |
| `revoked_at`   | `TIMESTAMPTZ`  | NULL     | —                   | When the key was manually revoked.                                                                |
| `last_used_at` | `TIMESTAMPTZ`  | NULL     | —                   | Updated by the API on each accepted request.                                                      |
| `created_at`   | `TIMESTAMPTZ`  | NOT NULL | `NOW()`             |                                                                                                   |

A key is valid when `revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())`.

#### PostgreSQL enums

```sql
CREATE TYPE dewasa_type AS ENUM ('ayu', 'ala');
CREATE TYPE severity AS ENUM ('critical', 'minor');
CREATE TYPE rating_match AS ENUM ('yes', 'no', 'unknown');
CREATE TYPE api_tier AS ENUM ('free', 'pro', 'enterprise');
```

### Indexes

Beyond the primary keys and `UNIQUE` constraints (which Postgres indexes automatically), the schema declares:

| Index                             | Table               | Columns                            | Type                                | Purpose                                                                                              |
| --------------------------------- | ------------------- | ---------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `idx_dewasa_rules_applicable_gin` | `dewasa_rules`      | `applicable_ceremonies`            | GIN                                 | `WHERE applicable_ceremonies && ARRAY['pawiwahan']` to fetch the dewasa active for a given ceremony. |
| `idx_dewasa_rules_type_severity`  | `dewasa_rules`      | `(type, severity)`                 | B-tree                              | Bulk filtering during evaluation (e.g. all critical ala).                                            |
| `idx_sasih_corrections_year`      | `sasih_corrections` | `(tahun_saka)`                     | B-tree                              | Per-year correction lookup (one row read per evaluation when correction exists).                     |
| `idx_feedback_target_date`        | `feedback`          | `(target_date)`                    | B-tree                              | Analytics queries: "how does the engine score this specific date vs user reports?"                   |
| `idx_feedback_ceremony_created`   | `feedback`          | `(ceremony_slug, created_at DESC)` | B-tree                              | Dashboard query: "most recent feedback for ceremony X".                                              |
| `idx_feedback_partial_negative`   | `feedback`          | `(created_at DESC)`                | B-tree, WHERE `rating_match = 'no'` | Cheap monthly-review query for cases where users disagreed with the engine.                          |
| `idx_saved_dates_user_date`       | `saved_dates`       | `(user_id, date)`                  | B-tree                              | "Show this user's saved dates, soonest first."                                                       |
| `idx_api_keys_valid`              | `api_keys`          | `(key_hash)`                       | B-tree, WHERE `revoked_at IS NULL`  | Lookup on valid keys only; revoked keys never match.                                                 |

### JSONB shapes

Both JSONB columns are validated by Zod schemas at the API boundary. Schemas live in `@dewasa-ayu/types` (alongside the engine types) and are re-exported for use by the API DTOs and admin tooling.

#### `ceremony_types.rules`

```typescript
// From @dewasa-ayu/types, matches ENG-001 ScoringWeights + CeremonyConfig
const CeremonyRulesSchema = z.object({
  sasihRules: z.object({
    good: z.array(z.number().int().min(0).max(11)),
    bad: z.array(z.number().int().min(0).max(11)),
  }),
  dewasaAyu: z.array(
    z.enum([
      /* all DewasaAyuCode values */
    ]),
  ),
  dewasaAla: z.array(
    z.enum([
      /* all DewasaAlaCode values */
    ]),
  ),
  scoringWeights: z.object({
    saptawara: z.number(),
    wuku: z.number(),
    sasih: z.number(),
    penanggal: z.number(),
    penanggalNumber: z.number(),
    ingkelJejepan: z.number(),
    sangawara: z.number(),
    dewasaAyuBonus: z.number(),
    criticalAlaPenalty: z.number().nonnegative(),
    minorAlaPenalty: z.number().nonnegative(),
  }),
  saptawaraGood: z.array(z.number().int().min(0).max(6)),
  requirePenanggal: z.boolean(),
});
```

`ceremony_types.rules` MUST validate against `CeremonyRulesSchema` on every insert/update. Prisma's `Json` field type is unchecked; validation is done at the API + seed layer.

#### `dewasa_rules.condition`

A small declarative DSL for expressing detection conditions. Engine evaluates it against a `BalineseDate`. The DSL is intentionally narrow — no arbitrary code, no formulas — so seed data can be edited safely by content authors.

```typescript
const FactCondition = z.discriminatedUnion('fact', [
  // Wewaran membership
  z.object({ fact: z.literal('saptawara'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('pancawara'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('triwara'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('sadwara'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('astawara'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('sangawara'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('dasawara'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('wuku'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('sasih'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('ingkel'), in: z.array(z.string()) }),
  z.object({ fact: z.literal('jejepan'), in: z.array(z.string()) }),
  // Numeric facts
  z.object({ fact: z.literal('totalUrip'), equals: z.number().int() }),
  z.object({
    fact: z.literal('totalUrip'),
    gte: z.number().int(),
    lte: z.number().int().optional(),
  }),
  z.object({ fact: z.literal('penanggal'), equals: z.number().int().min(1).max(15) }),
  // Boolean flags
  z.object({ fact: z.literal('isPangelong'), equals: z.boolean() }),
  z.object({ fact: z.literal('isPurnama'), equals: z.boolean() }),
  z.object({ fact: z.literal('isTilem'), equals: z.boolean() }),
]);

const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(ConditionSchema) }), // AND
    z.object({ any: z.array(ConditionSchema) }), // OR
    z.object({ not: ConditionSchema }), // NOT
    FactCondition,
  ]),
);

type Condition =
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | z.infer<typeof FactCondition>;
```

**Worked examples:**

`pati_paten` (Sukra + Tilem OR Sukra + Pangelong 10):

```json
{
  "any": [
    {
      "all": [
        { "fact": "saptawara", "in": ["sukra"] },
        { "fact": "isTilem", "equals": true }
      ]
    },
    {
      "all": [
        { "fact": "saptawara", "in": ["sukra"] },
        { "fact": "isPangelong", "equals": true },
        { "fact": "penanggal", "equals": 10 }
      ]
    }
  ]
}
```

`semut_sadulur` (Total Urip = 13):

```json
{ "fact": "totalUrip", "equals": 13 }
```

`rangda_tiga` (specific wuku set):

```json
{ "fact": "wuku", "in": ["wariga", "warigadean", "pujut", "pahang", "menail", "prangbakat"] }
```

### Migration strategy

Migrations are produced by `pnpm prisma migrate dev` and committed under `prisma/migrations/`. Order matters because of FKs.

1. **`0001_init`** — enums, `ceremony_types`, `dewasa_rules`, `sasih_corrections`, `feedback`, `api_keys`, plus their indexes.
2. **`0002_phase2_user_accounts`** — `users`, `saved_dates`, dependent FKs and indexes. Held back behind a feature flag in the API layer until Phase 2 ships.
3. **Future**: each schema change is a new migration file. No squash; no `migrate reset` against the deployed database.

#### Seed sources

Seeding runs after migration and is idempotent (every row uses Prisma `upsert` keyed by the table's natural unique column — `slug`, `code`, or `(tahun_saka, sasih_index)`).

| Table               | Source                                           | Format                        | Notes                                                                                                              |
| ------------------- | ------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `ceremony_types`    | `packages/ceremony-rules/src/*.ts`               | TypeScript → JSONB via Prisma | One file per ceremony. Adding a ceremony = one new file + one seed run.                                            |
| `dewasa_rules`      | `prisma/seed-data/dewasa-rules.json`             | JSON                          | Manually curated from PRD §4.2-§4.3, reviewed by Sulinggih (PRD §18.3).                                            |
| `sasih_corrections` | `prisma/seed-data/sasih-corrections-<year>.json` | JSON per year                 | One file per Gregorian year, sourced from kalenderbali.org. Pre-publish 6 months ahead per PRD §14.4.              |
| `api_keys`          | manual via admin script                          | —                             | Not seeded automatically. Operators provision keys via `pnpm api keys:issue --tier=pro --owner=alice@example.com`. |

#### Local dev workflow

```bash
# Start postgres
docker compose -f docker/docker-compose.yml up -d

# Apply migrations + regenerate Prisma client
pnpm prisma migrate dev

# Load seed data
pnpm prisma db seed

# Inspect via studio
pnpm prisma studio
```

A fresh checkout reaches a fully seeded local database in <60 seconds.

## Decisions & Rationale

- **JSONB for rules and conditions, not normalised tables.** The shape of `CeremonyConfig.rules` and the dewasa condition DSL is genuinely tree-shaped (nested AND/OR/NOT); flattening would require either many empty FK relationships or a polymorphic table that's harder to read. Validation moves to the Zod layer at write time, which gives the same safety with much less schema overhead. Trade-off: cannot index inside the JSON without explicit GIN expression indexes; we don't query inside `rules` (always fetched whole), so the trade-off is favourable.

- **Slug-based loose references between `dewasa_rules.applicable_ceremonies` and `ceremony_types.slug`, not FK.** The dewasa rules are authored by content people (potentially Sulinggih reviewers) who think in slugs, not UUIDs. Loose coupling lets either table be re-seeded independently. The trade-off (a typo could leave an orphan slug) is mitigated by a CI script that validates every slug in `applicable_ceremonies` against the seeded `ceremony_types`.

- **Sasih corrections loaded per-year, not per-month.** PRD's §11 example uses a `(tahun_saka, sasih_index)` key. Storing a row per sasih per year keeps the table small (~12 rows × N years) and queryable: the engine pulls the year's full set in one query for caching.

- **`ip_hash` instead of raw IP in `feedback`.** Privacy-by-default (PRD §17 says "anonymous, opt-out tersedia"). A daily salt rotated by the API server gives us de-duplication within a day without persistent linkability. Trade-off: we lose cross-day spam detection; the rate limiter handles that instead.

- **`saved_dates` cascading on both `users` and `ceremony_types`.** Deleting a user must remove their data (GDPR-style compliance). Deleting a ceremony type before product retires it is unusual but if it ever happens, the user's bookmark for that ceremony is meaningless. Both deletes are operator-initiated, so cascade is acceptable.

- **API keys table from v1, not deferred to "when we need it".** The API will need a way to enforce tiered limits the moment a non-dewasaayu.com consumer hits it. Adding the table preemptively avoids a "free API turns into chaos" panic migration later.

- **No `updated_at` on `feedback`.** Feedback is immutable user submission; allowing updates would let an attacker reshape historical accuracy data.

- **PostgreSQL enums for low-cardinality string columns.** `dewasa_type`, `severity`, `rating_match`, `api_tier` are bounded sets. Enums give cheap storage and a CHECK-equivalent constraint without writing one. Adding a value is a migration (`ALTER TYPE … ADD VALUE`), which is acceptable for the rate of change expected here.

- **UUID `v4` primary keys via `gen_random_uuid()`.** Avoids exposing row counts in URLs; safe for sharing PR-style endpoints. Trade-off: 16 bytes vs 8 for bigint. Acceptable for a database this size.

## Open Questions

- [Q] Should `ceremony_types.rules` be split into one column per scoring-weight field for easier admin UI editing? Decision pending the admin UI design ([UI-001](./pages.md)). Owner: @RacThug. Target: before [#14](https://github.com/RacThug/dewasa-ayu/issues/14) (Prisma init) is implemented.
- [Q] How long to retain raw `feedback.notes` text? PRD §17 doesn't specify. Default proposal: 12 months, then aggregate-and-purge. Owner: @RacThug. Target: pre-launch (Phase 8).
- [Q] Should we add a `request_log` table for API analytics, or rely on Vercel/Railway built-in logs? Built-in is cheaper but harder to join against `api_keys` for per-tier reports. Owner: @RacThug. Target: when API has paying customers.
- [Q] `feedback.ceremony_slug` as `VARCHAR` vs FK to `ceremony_types.id`. Currently slug (loose, anonymous-friendly). FK would prevent orphaned feedback if a ceremony is renamed, but that operation is rare and an admin can backfill. Recommend leaving as slug for v1. Owner: @RacThug. Target: not pressing.

## References

- [PRD §7 — System Architecture & Tech Stack](../PRD.md)
- [PRD §11 — Database Schema](../PRD.md)
- [PRD §17.2 — Accuracy Feedback Widget](../PRD.md)
- [PRD §24 — Data Seeding & Migration](../PRD.md)
- Sibling specs: [ENG-001](./engine.md) (type sources for JSONB shapes), [API-001](./api.md) (DTOs that serialise these tables)
- GitHub issue [#18](https://github.com/RacThug/dewasa-ayu/issues/18) — implementing task for this spec
- GitHub issue [#14](https://github.com/RacThug/dewasa-ayu/issues/14) — Phase 0 Prisma init task that consumes this spec
- [Prisma Migrate docs](https://www.prisma.io/docs/orm/prisma-migrate) — migration tooling reference
- [PostgreSQL JSONB indexing](https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING) — GIN reference

## Changelog

- v0.1.0 — 2026-05-28 — Initial draft. Seven tables (`ceremony_types`, `dewasa_rules`, `sasih_corrections`, `feedback`, `users`, `saved_dates`, `api_keys`), four PostgreSQL enums, GIN + composite + partial indexes, two JSONB Zod schemas with worked examples. Four open questions flagged (rules split for admin UI, feedback retention, request log table, feedback FK vs slug).
