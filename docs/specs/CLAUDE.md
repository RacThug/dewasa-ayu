# Specs — Authoring Guide

This folder contains living engineering specs for Dewasa Ayu. This file is auto-loaded by Claude Code when working in or near `docs/specs/` and is the single source of truth for spec conventions.

## What lives here

| File           | ID      | Purpose                                                            |
| -------------- | ------- | ------------------------------------------------------------------ |
| `_template.md` | —       | Starting template. Copy when creating a new spec. Do not edit.     |
| `engine.md`    | ENG-001 | Wariga calculation engine: types, function signatures, algorithms. |
| `db.md`        | DB-001  | Database schema, indexes, JSONB shapes, migration strategy.        |
| `api.md`       | API-001 | REST API: endpoints, auth, error envelope, rate limits.            |
| `pages.md`     | UI-001  | Frontend pages: components, state strategy, wireframes.            |

Specs are **living docs** — they must stay in sync with the code they describe. If implementation diverges from the spec, update the spec (with a Changelog entry); do not let code become a silent source of truth.

## Lifecycle

```
Draft ──(implementation lands)──▶ Active ──(replaced)──▶ Superseded
   │                                 │
   │                                 └──(feature removed)──▶ Deprecated
   └──(abandoned)──▶ (delete file)
```

| Status       | Meaning                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| `Draft`      | Design in progress; structure may still change.                          |
| `Active`     | Implemented (or being implemented). Spec must reflect current code.      |
| `Superseded` | Replaced by a newer spec. The replacement points back via `supersedes:`. |
| `Deprecated` | No longer current and not replaced. Kept for historical context.         |

## Writing a new spec

1. Pick the next free ID for the domain (`ENG-002`, `DB-002`, etc. — see [ID convention](#id-convention)).
2. Copy `_template.md` to `<topic>.md` (kebab-case filename, no prefix in filename).
3. Fill in the frontmatter. `created` and `updated` are today (YYYY-MM-DD).
4. Set `status: Draft`. Set `implements:` to the GitHub issue number(s) driving the spec.
5. Fill the 9 sections in order. Scale content to topic complexity — short is fine if the topic is short.
6. When the spec moves to `Active`, add a row to the "What lives here" table above.
7. Commit: `spec(<ID>): initial draft of <topic>`.

## Updating an existing spec

1. Edit the spec.
2. Bump `version:` per semver:
   - **patch** (`0.1.0 → 0.1.1`): clarification, typo, formatting.
   - **minor** (`0.1.0 → 0.2.0`): additive change (new section, new field, new endpoint).
   - **major** (`0.1.0 → 1.0.0`): breaking contract change (removed field, renamed type, changed signature).
3. Update `updated:` to today.
4. Add a Changelog entry at the top of that section: `v0.2.0 — YYYY-MM-DD — <what changed>`.
5. If the change is breaking and affects sibling specs (e.g., an engine type change ripples to the API response shape), bump versions on the dependent specs too and note the cross-spec impact in their Changelogs.
6. Commit: `spec(<ID>): <one-line summary>`.

## Deprecating or superseding

**Superseded** (replacing a spec):

1. Write the replacement spec as a new file with a new ID.
2. On the new spec, set `supersedes: <OLD-ID>` in the frontmatter.
3. On the old spec, set `status: Superseded` and add a Changelog entry pointing to the replacement.
4. Both files stay in the repo.

**Deprecated** (no replacement):

1. On the spec, set `status: Deprecated`.
2. Add a Changelog entry explaining why deprecated.
3. File stays in the repo for historical context.

## ID convention

| Prefix | Domain                                                     |
| ------ | ---------------------------------------------------------- |
| `ENG`  | Wariga engine (`packages/wariga-engine`, `packages/types`) |
| `DB`   | Database schema (`prisma/`)                                |
| `API`  | REST API (`apps/api`)                                      |
| `UI`   | Frontend pages and components (`apps/web`)                 |

IDs are sequential per prefix: `ENG-001`, `ENG-002`, `ENG-003`. A new domain prefix may be added if a future area genuinely doesn't fit the existing four — document the addition here.

## Cross-reference convention

| Target                       | Form                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Sibling spec                 | `[ENG-001 §Types](./engine.md#types)`                                              |
| PRD section                  | `[PRD §4.2](../PRD.md#42-dewasa-ayu-per-ceremony-type)`                            |
| GitHub issue                 | `#17` (GitHub auto-links)                                                          |
| Source file (once it exists) | `[packages/wariga-engine/src/types.ts](../../packages/wariga-engine/src/types.ts)` |

Avoid line-number anchors in source links — they break on refactor. Reference symbols by name in prose and let the link point to the file.

## Frontmatter schema

```yaml
---
id: ENG-001                    # required, <PREFIX>-<NNN>
title: Engine Types & Contract # required
status: Draft                  # required: Draft | Active | Deprecated | Superseded
version: 0.1.0                 # required, semver
owners: [@your-handle]         # required, list of GitHub handles
created: 2026-05-28            # required, YYYY-MM-DD
updated: 2026-05-28            # required, YYYY-MM-DD
implements: [17]               # GitHub issue numbers; [] if none yet
supersedes: null               # ID of spec being replaced, or null
related: [DB-001, API-001]     # IDs of sibling specs; [] if none
prd_refs: ["§10", "§4.2"]      # PRD section refs; [] if none
---
```

All eleven keys are required on every spec. Use `null` (not an empty string) for `supersedes` when not applicable. Use `[]` for empty lists.

## Detailed Specification — sub-structure per type

The `## Detailed Specification` section in `_template.md` is intentionally flexible. Use the following sub-section order, with `### ` headings, based on the spec's domain.

### Engine specs (ENG)

1. **Constants** — epoch dates, calendar reference points, fixed lookup tables.
2. **Types** — TypeScript interfaces and type aliases that form the engine's public contract.
3. **Function signatures** — public API: name, parameters (typed), return type, brief semantics.
4. **Algorithms** — how key calculations work (Pawukon, Sasih, scoring). Pseudocode is acceptable.
5. **Examples** — concrete input/output pairs for representative cases (e.g., reference dates from PRD §13.2).

### Database specs (DB)

1. **ERD** — entity-relationship diagram. Mermaid (`erDiagram`) is preferred; ASCII is acceptable.
2. **Tables** — one `### ` sub-section per table. Within each: columns (name, type, nullability, default), brief description, indexing notes.
3. **Indexes** — non-trivial indexes (composite, partial, JSONB GIN). Trivial primary-key indexes don't need calling out.
4. **JSONB shapes** — for each JSONB column, the Zod schema (or TypeScript type) it must conform to.
5. **Migration strategy** — order of migrations, seed-data sources, idempotency expectations.

### API specs (API)

1. **Auth** — public vs API-key endpoints, header conventions, where keys come from.
2. **Error envelope** — standard error response shape, the canonical error-code list.
3. **Endpoints** — one `### ` sub-section per endpoint:
   - HTTP method and path
   - Query/path parameters (Zod schema)
   - Response shape (Zod schema)
   - Status codes that may be returned (200, 4xx, 5xx)
   - Cache TTL
   - Rate-limit tier
4. **Examples** — `curl` invocation plus JSON request/response per endpoint.

### Pages/UI specs (UI)

1. **Design tokens** — colors, typography, spacing — in a form ready to drop into Tailwind config.
2. **Global components** — header, footer, theme provider, reusable widgets (CeremonySelector, ScoreBar, etc.).
3. **Screens** — one `### ` sub-section per screen:
   - Path and dynamic params
   - Component hierarchy (composition)
   - URL state (via `nuqs`) and local state
   - API endpoints called and cache strategy
   - Loading / error / empty states
   - Mobile vs desktop variants
   - Wireframe — ASCII for layout, or a Figma link if one exists

## Cultural sensitivity note

Specs themselves are written in English (technical layer). However, any user-facing copy _described inside a spec_ (e.g., button labels, error messages, disclaimer text in UI specs) must follow the project's cultural rules:

- Bahasa Indonesia primary.
- Never claim religious authority — use "berdasarkan pedoman Wariga umum".
- Include the Sulinggih-consultation disclaimer where relevant.
- Use "disarankan" / "dihindari", not "dilarang" / "wajib".

See PRD §18.2 for the full guidance.
