# Spec Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish `docs/specs/_template.md` and `docs/specs/CLAUDE.md` so the four upcoming specs (engine, db, api, pages) have a consistent foundation aligned with the design in `docs/superpowers/specs/2026-05-28-spec-template-and-workflow-design.md`.

**Architecture:** Two Markdown files in `docs/specs/`. `_template.md` is a copy-and-fill starter with YAML frontmatter, 9 fixed sections, and inline HTML-comment guidance. `CLAUDE.md` is the workflow guide that Claude Code auto-loads when working in this folder; it covers lifecycle, ID conventions, frontmatter schema, cross-reference rules, and the per-type Detailed-Specification sub-structure. After this plan lands, issues #17–#20 author the actual specs against this framework.

**Tech Stack:** Markdown with YAML frontmatter. No build tooling. No runtime tests — verification is structural (frontmatter parses; required sections present; relative links resolve). GitHub CLI (`gh`) for the issue-checklist update.

---

## File Structure

Files this plan creates:

- `docs/specs/_template.md` — copy-template. YAML frontmatter (11 required keys) + 9 sections (Summary, Context, Goals, Non-Goals, Detailed Specification, Decisions & Rationale, Open Questions, References, Changelog). HTML comments give the author inline guidance without affecting rendered output.
- `docs/specs/CLAUDE.md` — workflow guide. Sections: What lives here · Lifecycle · Writing a new spec · Updating a spec · Deprecating / superseding · ID convention · Cross-reference convention · Frontmatter schema · Per-type Detailed-Specification sub-structure · Cultural sensitivity note.

Files this plan modifies:

- GitHub issue #1 (Phase 0 epic) — checklist body updated via `gh issue edit` to surface the new spec-framework dependency.

No source code is created. No tests in the traditional sense; verification is by-eye plus one YAML parse check.

---

## Task 1: Create `docs/specs/_template.md`

**Files:**
- Create: `docs/specs/_template.md`

- [ ] **Step 1: Create the file with full content**

Write the file exactly as below. The HTML comments (`<!-- ... -->`) provide guidance to the author without appearing in the rendered output. The YAML frontmatter uses placeholder values that the author replaces when copying the template.

````markdown
---
id: <PREFIX>-<NNN>             # ENG-001 / DB-001 / API-001 / UI-001
title: <Spec Title>
status: Draft                  # Draft | Active | Deprecated | Superseded
version: 0.1.0
owners: [@your-handle]
created: YYYY-MM-DD
updated: YYYY-MM-DD
implements: []                 # GitHub issue numbers, e.g. [17]
supersedes: null               # ID of spec being replaced, or null
related: []                    # sibling spec IDs, e.g. [DB-001]
prd_refs: []                   # PRD section refs, e.g. ["§4.2", "§10"]
---

# <Spec Title>

<!-- See docs/specs/CLAUDE.md for the full authoring guide. -->

## Summary

<!-- TL;DR, ≤3 sentences. What does this spec cover? -->

## Context

<!-- Why does this spec exist? What sits around it? Link to PRD sections and issues. -->

## Goals

<!-- Bullet list. What outcomes must this spec enable? -->

-
-

## Non-Goals

<!-- Explicit exclusions to prevent scope creep. Write "None" if nothing to exclude. -->

-

## Detailed Specification

<!--
Core content. Sub-structure depends on spec type — see docs/specs/CLAUDE.md
for the canonical per-type sub-section order:

- ENG: Constants → Types → Function signatures → Algorithms → Examples
- DB:  ERD → Tables → Indexes → JSONB shapes → Migration strategy
- API: Auth → Error envelope → Endpoints → Examples
- UI:  Design tokens → Global components → Screens

Scale content proportional to topic complexity.
-->

## Decisions & Rationale

<!--
Significant design decisions with one-paragraph justification each.
Minimum one entry. Format:

- **<Decision title>.** <Decision statement>. <Rationale>. <Trade-offs accepted>.
-->

-

## Open Questions

<!--
Unresolved items requiring follow-up. Write "None" if all decided.
Format: `- [Q] <Question>. Owner: @handle. Target: <date or milestone>.`
-->

-

## References

<!-- PRD sections, external sources, sibling specs, source files. -->

-

## Changelog

<!-- Newest first. Format: `v<X.Y.Z> — YYYY-MM-DD — <what changed>`. -->

- v0.1.0 — YYYY-MM-DD — Initial draft.
````

- [ ] **Step 2: Verify the file exists and frontmatter is valid YAML**

Run:
```bash
test -f docs/specs/_template.md && echo "exists"
# Extract frontmatter block and pipe through a YAML parser
sed -n '/^---$/,/^---$/p' docs/specs/_template.md | sed '1d;$d' | python -c "import sys, yaml; yaml.safe_load(sys.stdin); print('YAML OK')"
```

Expected output:
```
exists
YAML OK
```

If `python -c "import yaml"` fails because PyYAML isn't installed, use Node instead:
```bash
node -e "const fs=require('fs'); const m=fs.readFileSync('docs/specs/_template.md','utf8').match(/^---\n([\s\S]*?)\n---/); console.log(m ? 'frontmatter block found' : 'NO FRONTMATTER'); console.log(m[1].split('\n').length, 'frontmatter lines');"
```

Expected: `frontmatter block found` and line count ≥ 11.

- [ ] **Step 3: Verify all 9 sections are present**

Run:
```bash
grep -c '^## ' docs/specs/_template.md
```

Expected: `9`

Then verify each section name:
```bash
grep '^## ' docs/specs/_template.md
```

Expected output (exact, in this order):
```
## Summary
## Context
## Goals
## Non-Goals
## Detailed Specification
## Decisions & Rationale
## Open Questions
## References
## Changelog
```

If any section is missing or out of order, edit `docs/specs/_template.md` to fix before continuing.

---

## Task 2: Create `docs/specs/CLAUDE.md`

**Files:**
- Create: `docs/specs/CLAUDE.md`

- [ ] **Step 1: Create the file with full content**

Write the file exactly as below.

````markdown
# Specs — Authoring Guide

This folder contains living engineering specs for Dewasa Ayu. This file is auto-loaded by Claude Code when working in or near `docs/specs/` and is the single source of truth for spec conventions.

## What lives here

| File | ID | Purpose |
|------|----|---------|
| `_template.md` | — | Starting template. Copy when creating a new spec. Do not edit. |
| `engine.md` | ENG-001 | Wariga calculation engine: types, function signatures, algorithms. |
| `db.md` | DB-001 | Database schema, indexes, JSONB shapes, migration strategy. |
| `api.md` | API-001 | REST API: endpoints, auth, error envelope, rate limits. |
| `pages.md` | UI-001 | Frontend pages: components, state strategy, wireframes. |

Specs are **living docs** — they must stay in sync with the code they describe. If implementation diverges from the spec, update the spec (with a Changelog entry); do not let code become a silent source of truth.

## Lifecycle

```
Draft ──(implementation lands)──▶ Active ──(replaced)──▶ Superseded
   │                                 │
   │                                 └──(feature removed)──▶ Deprecated
   └──(abandoned)──▶ (delete file)
```

| Status | Meaning |
|--------|---------|
| `Draft` | Design in progress; structure may still change. |
| `Active` | Implemented (or being implemented). Spec must reflect current code. |
| `Superseded` | Replaced by a newer spec. The replacement points back via `supersedes:`. |
| `Deprecated` | No longer current and not replaced. Kept for historical context. |

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

| Prefix | Domain |
|--------|--------|
| `ENG` | Wariga engine (`packages/wariga-engine`, `packages/types`) |
| `DB` | Database schema (`prisma/`) |
| `API` | REST API (`apps/api`) |
| `UI` | Frontend pages and components (`apps/web`) |

IDs are sequential per prefix: `ENG-001`, `ENG-002`, `ENG-003`. A new domain prefix may be added if a future area genuinely doesn't fit the existing four — document the addition here.

## Cross-reference convention

| Target | Form |
|--------|------|
| Sibling spec | `[ENG-001 §Types](./engine.md#types)` |
| PRD section | `[PRD §4.2](../PRD.md#42-dewasa-ayu-per-ceremony-type)` |
| GitHub issue | `#17` (GitHub auto-links) |
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

Specs themselves are written in English (technical layer). However, any user-facing copy *described inside a spec* (e.g., button labels, error messages, disclaimer text in UI specs) must follow the project's cultural rules:

- Bahasa Indonesia primary.
- Never claim religious authority — use "berdasarkan pedoman Wariga umum".
- Include the Sulinggih-consultation disclaimer where relevant.
- Use "disarankan" / "dihindari", not "dilarang" / "wajib".

See PRD §18.2 for the full guidance.
````

- [ ] **Step 2: Verify the file exists and has the expected sections**

Run:
```bash
test -f docs/specs/CLAUDE.md && echo "exists"
grep '^## ' docs/specs/CLAUDE.md
```

Expected output:
```
exists
## What lives here
## Lifecycle
## Writing a new spec
## Updating an existing spec
## Deprecating or superseding
## ID convention
## Cross-reference convention
## Frontmatter schema
## Detailed Specification — sub-structure per type
## Cultural sensitivity note
```

If any section is missing, edit `docs/specs/CLAUDE.md` to add it before continuing.

- [ ] **Step 3: Verify all four per-type sub-sections are present**

Run:
```bash
grep '^### ' docs/specs/CLAUDE.md
```

Expected output includes (order matters):
```
### Engine specs (ENG)
### Database specs (DB)
### API specs (API)
### Pages/UI specs (UI)
```

---

## Task 3: Sanity-check both files together

**Files:**
- Read-only: `docs/specs/_template.md`, `docs/specs/CLAUDE.md`

- [ ] **Step 1: Verify the relative link from `_template.md` to `CLAUDE.md` resolves**

Both files live in the same directory, so the template's reference `docs/specs/CLAUDE.md` is just an informational pointer in HTML comments — not a clickable link. No action needed.

Confirm the comment exists in the template:
```bash
grep -c 'docs/specs/CLAUDE.md' docs/specs/_template.md
```

Expected: `≥ 1`

- [ ] **Step 2: Confirm the per-type sub-structure table in `CLAUDE.md` matches the comment in `_template.md`**

Run:
```bash
grep -A 4 'ENG: Constants' docs/specs/_template.md
grep -A 4 'Engine specs (ENG)' docs/specs/CLAUDE.md
```

Manually verify: the sub-section order in the template's HTML comment (`Constants → Types → Function signatures → Algorithms → Examples`) matches the numbered list under "Engine specs (ENG)" in `CLAUDE.md`. Repeat eyeball-check for DB, API, UI.

If there's a mismatch, fix the file that's wrong (canonical source is `CLAUDE.md`).

- [ ] **Step 3: Render check**

Open both files in your editor with Markdown preview (or use `gh` to view on GitHub after commit). Verify:

- Tables render correctly (column counts match header).
- The lifecycle ASCII diagram in `CLAUDE.md` renders inside a code fence (no broken layout).
- HTML comments in `_template.md` don't appear in the rendered output.

If anything renders broken, fix it in the source file before committing.

---

## Task 4: Commit both files

**Files:**
- Stage: `docs/specs/_template.md`, `docs/specs/CLAUDE.md`

- [ ] **Step 1: Verify only the intended files are staged**

Run:
```bash
git status
```

Expected: `docs/specs/_template.md` and `docs/specs/CLAUDE.md` shown as untracked. `README.md` and any other in-progress files should be unstaged. Do **not** use `git add -A` or `git add .` — explicitly add only the two new files.

- [ ] **Step 2: Stage only the two new files**

Run:
```bash
git add docs/specs/_template.md docs/specs/CLAUDE.md
git status
```

Expected: both files appear under "Changes to be committed:" and nothing else.

- [ ] **Step 3: Create the commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
docs: add spec framework (_template.md + CLAUDE.md)

Implements the spec template & workflow approved in
docs/superpowers/specs/2026-05-28-spec-template-and-workflow-design.md.

- _template.md: starter template with YAML frontmatter, 9 sections, inline guidance.
- CLAUDE.md: authoring guide covering lifecycle, IDs, frontmatter schema,
  cross-reference convention, and per-type Detailed-Specification sub-structure.

Unblocks the four spec issues (#17 ENG, #18 DB, #19 API, #20 UI) in Phase 0.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 4: Verify the commit landed**

Run:
```bash
git log --oneline -3
```

Expected: the new commit appears at the top with the message above.

---

## Task 5: Update Phase 0 epic (#1) checklist on GitHub

**Files:**
- No local files modified. Update is via `gh issue edit` to GitHub issue #1.

- [ ] **Step 1: Fetch the current issue body**

Run:
```bash
gh issue view 1 -R RacThug/dewasa-ayu --json body --jq '.body' > /tmp/issue-1-body.md
cat /tmp/issue-1-body.md
```

Expected: the current body of issue #1 (the Phase 0 epic). The current checklist mentions setup tasks but does not mention the spec framework.

- [ ] **Step 2: Add a "Spec framework" line to the Cakupan checklist**

Edit `/tmp/issue-1-body.md` and add this line at the top of the existing `## Cakupan` checklist (the first checklist item):

```markdown
- [x] Spec framework: `docs/specs/_template.md` + `docs/specs/CLAUDE.md` (this PR / commit)
```

So the section becomes:

```markdown
## Cakupan
- [x] Spec framework: `docs/specs/_template.md` + `docs/specs/CLAUDE.md` (this PR / commit)
- [ ] Bootstrap pnpm workspace + Turborepo + root `tsconfig.base.json`
- [ ] Shared config: ESLint + Prettier + EditorConfig + `.gitignore`
- [ ] Skeleton package: `apps/web`, `apps/api`, `packages/{wariga-engine,ceremony-rules,types,constants}`
- [ ] Docker Compose dev: PostgreSQL + Redis di `docker/docker-compose.yml`
- [ ] Prisma init: schema kosong + `.env.example`
- [ ] GitHub Actions CI: lint + typecheck + test pada setiap push/PR
- [ ] `CLAUDE.md` konvensi project + decision log singkat
```

Note: the new item is checked (`[x]`) because by the time this step runs, the commit from Task 4 has already landed.

- [ ] **Step 3: Push the updated body to GitHub**

Run:
```bash
gh issue edit 1 -R RacThug/dewasa-ayu --body-file /tmp/issue-1-body.md
```

Expected: `https://github.com/RacThug/dewasa-ayu/issues/1` printed to stdout.

- [ ] **Step 4: Verify the update**

Run:
```bash
gh issue view 1 -R RacThug/dewasa-ayu --json body --jq '.body' | grep -A 1 'Spec framework'
```

Expected: the new line appears as the first checkbox item under Cakupan, marked `[x]`.

---

## Done criteria

All five tasks complete when:

- `docs/specs/_template.md` exists with valid YAML frontmatter and all 9 required sections (`grep '^## '` returns exactly the 9 expected headings in order).
- `docs/specs/CLAUDE.md` exists with all 10 top-level sections and the 4 per-type sub-sections.
- Both files are committed on `main` in one commit; `README.md` modifications remain unstaged (not lost, not committed).
- Issue #1 body on GitHub shows the spec-framework line as a checked item at the top of the Cakupan list.
- Issues #17–#20 are now unblocked and can begin spec authoring against the framework.
