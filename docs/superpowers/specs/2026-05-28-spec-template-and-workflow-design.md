# Spec Template & Workflow — Design

**Date:** 2026-05-28
**Author:** @RacThug (with Claude)
**Status:** Approved
**Topic:** Establishing a consistent template and workflow for engineering specs

---

## Summary

Dewasa Ayu needs 4 engineering specs (Engine, DB, API, Pages) on top of the existing PRD. This document defines a single flexible Markdown template and an AI-first workflow so all 4 specs (and any future ones) share the same structure, lifecycle, and cross-referencing conventions.

## Context

The PRD (`docs/PRD.md`) is comprehensive at the product layer but stops short of engineering-level contracts:

- API endpoints listed but not fully specified (no Zod schemas, error codes incomplete)
- Database tables enumerated with "key fields" only — no types, indexes, JSONB shapes
- Screens listed but components, state strategy, and wireframes are not broken down
- Engine types are referenced but never declared in a place other layers can depend on

Without engineering specs, the work in Phase 1 (engine), Phase 2 (API), and Phase 3 (frontend) would each have to re-derive types from the PRD, risking divergence between layers. This design establishes the spec framework before any code is written.

GitHub issues `#17` (Engine), `#18` (DB), `#19` (API), `#20` (Pages) track the actual spec authoring; this document defines the **template and process** all four will follow.

## Goals

- **Consistency:** All specs use the same section order, frontmatter schema, and lifecycle.
- **AI-friendly:** Structure is parseable by Claude with minimal context — single template to learn, predictable headings.
- **Low friction:** Solo dev can write a spec without filling 5 templates' worth of boilerplate.
- **Living docs:** Specs evolve with code; versioning + changelog + status make drift visible.
- **Decoupled from code:** Specs can be reviewed and changed without touching the codebase, but explicitly reference the issues / files that implement them.

## Non-Goals

- **RFC-style decision exploration.** Specs document decided designs, not alternatives. Trade-offs that mattered live in "Decisions & Rationale", but exhaustive exploration of rejected approaches is out of scope. (Use brainstorming sessions like this one for that.)
- **Auto-generated reference docs.** OpenAPI generation from NestJS decorators and Prisma ERD generation are useful but tracked separately; this design covers the human-written spec layer only.
- **Multi-language specs.** Specs are English-only despite the project's bahasa Indonesia primary rule. Rationale: technical terms, library references, and code identifiers are English; mixing prose languages hurts AI parseability.

## Detailed Specification

### File layout

```
docs/specs/
├── CLAUDE.md        # workflow guide, auto-loaded by Claude Code
├── _template.md     # starting template for new specs
├── engine.md        # ENG-001
├── db.md            # DB-001
├── api.md           # API-001
└── pages.md         # UI-001
```

No `README.md` in this folder — directory listing is self-documenting and `CLAUDE.md` covers the same human-readable purpose for any contributor opening the folder.

### Frontmatter schema (YAML, required on every spec)

```yaml
---
id: ENG-001                    # <PREFIX>-<NNN>, sequential per prefix
title: Engine Types & Contract
status: Draft                  # Draft | Active | Deprecated | Superseded
version: 0.1.0                 # semver
owners: [@RacThug]
created: 2026-05-28
updated: 2026-05-28
implements: [17]               # GitHub issue numbers this spec drives
supersedes: null               # spec ID being replaced, or null
related: [DB-001, API-001]     # cross-refs to sibling specs
prd_refs: ["§10", "§4.2"]      # PRD sections this spec elaborates
---
```

**ID prefixes:**

| Prefix | Domain                                                     |
| ------ | ---------------------------------------------------------- |
| `ENG`  | Wariga engine (`packages/wariga-engine`, `packages/types`) |
| `DB`   | Database schema (`prisma/`)                                |
| `API`  | REST API (`apps/api`)                                      |
| `UI`   | Frontend pages/components (`apps/web`)                     |

IDs are sequential per prefix. A future Phase 2 engine extension would be `ENG-002`, not `ENG-2`.

### Template sections (in order)

Every spec has these 9 sections in this order:

1. **Summary** — TL;DR, ≤3 sentences, "this spec covers X".
2. **Context** — background; why this spec exists; what it sits between.
3. **Goals** — bullet list of outcomes this spec must enable.
4. **Non-Goals** — explicit exclusions to prevent scope creep.
5. **Detailed Specification** — core content; structure varies by spec type (see per-type guidance below). Scaled to topic complexity.
6. **Decisions & Rationale** — significant design decisions with one-paragraph justification each. Minimum one entry.
7. **Open Questions** — unresolved items, or "None" if all decided.
8. **References** — PRD sections, external sources, sibling specs, source code (once it exists).
9. **Changelog** — `vX.Y.Z — YYYY-MM-DD — what changed` per line, newest first.

### Per-type "Detailed Specification" sub-structure

Defined in `docs/specs/CLAUDE.md`. Summary:

| Type    | Sub-sections (in order)                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------- |
| **ENG** | Constants → Types → Function signatures → Algorithms → Examples                                         |
| **DB**  | ERD → Tables (one sub-section per table) → Indexes → JSONB shapes → Migration strategy                  |
| **API** | Auth → Error envelope → Endpoints (one sub-section per endpoint: req/resp/errors/cache) → Examples      |
| **UI**  | Design tokens → Global components → Screens (one sub-section per screen: hierarchy/state/API/wireframe) |

### Status lifecycle

```
       (new spec)
           │
           ▼
        Draft ────(abandon)────▶ (delete file)
           │
   (impl lands or
    spec stabilises)
           │
           ▼
        Active ────(replaced by new spec)────▶ Superseded
           │
   (feature removed
    without replacement)
           │
           ▼
      Deprecated
```

**Rules:**

- A spec stays in `Draft` until either the implementation issue is closed, or the team explicitly marks it `Active` because the design has stabilised even before code lands.
- An `Active` spec must be kept in sync with code; if implementation diverges, update the spec (with a changelog entry) — do not let code be the silent source of truth.
- `Superseded` specs stay in the repo for historical context; the replacing spec's `supersedes:` field points back.
- `Deprecated` means "no longer relevant" without a replacement. Keep for historical context.

### Update protocol (for `Active` specs)

1. Edit the spec.
2. Bump `version:` (semver: patch = clarification/typo, minor = additive change, major = breaking change to contract).
3. Update `updated:` to today.
4. Add a Changelog entry at the top: `v0.2.0 — 2026-06-01 — Added Otonan calculator types`.
5. Commit message format: `spec(ENG-001): <one-line summary>`.
6. If the change is breaking and affects sibling specs (e.g., changing an engine type changes API response shape), bump the version on dependent specs too with a changelog note referencing the source change.

### Cross-reference convention

| Target                    | Form                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Sibling spec              | `[ENG-001 §Types](./engine.md#types)`                                              |
| PRD section               | `[PRD §4.2](../PRD.md#42-dewasa-ayu-per-ceremony-type)`                            |
| GitHub issue              | `#17` (renders as link on GitHub)                                                  |
| Source file (once exists) | `[packages/wariga-engine/src/types.ts](../../packages/wariga-engine/src/types.ts)` |
| Specific symbol in code   | Reference by name in prose; link to file. Avoid line-number links (brittle).       |

### Drift prevention

- Every `Active` spec must reference its implementing issue in `implements:` frontmatter. Closing the issue without updating the spec is a process bug.
- CI check (separate Phase 0 task, not part of this design): validate that `_template.md` is unchanged from baseline (no accidental edits to template), and that all spec files have parseable frontmatter with valid `status:`.
- Quarterly review (cron-style reminder, not enforced): walk through all `Active` specs and verify they still match code reality.

## Decisions & Rationale

- **Single flexible template (Approach A) over per-type templates.** Lower maintenance, single structure for AI to learn. The "Detailed Specification" section absorbs per-type variance via guidance in `CLAUDE.md` rather than separate template files. Trade-off accepted: author must know what goes in their type's Detailed Specification; mitigated by per-type sub-section list in `CLAUDE.md`.

- **`CLAUDE.md` over `README.md` for workflow guide.** This is an AI-first project where Claude is a primary author of specs. `CLAUDE.md` is auto-context for Claude when working in or near `docs/specs/`. `README.md` would optimise for GitHub browsing — a lower-priority audience here. If repo goes public later, a `README.md` index can be added without conflict.

- **Living docs, not frozen design records.** Specs must reflect current state because they're the cross-layer contract (engine → API → frontend). Frozen specs would force readers to fall back to code, which defeats the purpose for a multi-layer project. Maintenance burden accepted; mitigation: small spec set (4), single owner currently, changelog enforces visibility of drift.

- **English-only despite bahasa Indonesia project rule.** Technical specs are mostly identifiers, types, and library references — all English already. Mixing prose languages would hurt AI parseability and complicate copy-paste to code/issues. Cultural sensitivity rules (no authority claims, disclaimer Sulinggih) still apply to any user-facing copy described in the Pages spec.

- **Semver for spec versions.** Maps cleanly to "did this change break consumers?" — the same question contract versioning answers in code. Alternative considered: date-based versioning (`2026.05.28`); rejected because it doesn't signal breaking-ness.

- **`ENG/DB/API/UI` prefixes over generic `SPEC-NNN`.** Domain prefix makes cross-references readable without lookup ("ENG-001 §Types" is self-explanatory; "SPEC-003 §Types" is not). Trade-off: adding a new domain requires picking a new prefix, but this is rare.

## Open Questions

- **Wireframes in Pages spec.** ASCII art is parseable but ugly; image attachments are visual but break AI parsing. Recommendation: ASCII for layout, link to Figma file (when created) for fidelity. To be settled when authoring `pages.md`.
- **API spec relationship to NestJS DTOs.** Should the spec be the source of truth that DTOs are generated from, or vice versa? Likely spec-first for the design phase, then keep in sync. To be settled when authoring `api.md` and starting Phase 2.

## References

- `docs/PRD.md` — product requirements document
- `README.md` — project overview
- GitHub issues: #17 (ENG), #18 (DB), #19 (API), #20 (UI) — spec authoring tasks
- GitHub issue #1 — Phase 0 epic that contains the spec work
- [Semantic Versioning](https://semver.org/)
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) — inspiration for "Decisions & Rationale" section

## Changelog

- v1.0.0 — 2026-05-28 — Initial design approved, ready for implementation.
