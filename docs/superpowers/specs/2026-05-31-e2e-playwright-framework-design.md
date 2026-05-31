# E2E Testing Framework (Playwright) — Design

**Date:** 2026-05-31
**Author:** @RacThug (with Claude)
**Status:** Approved
**Topic:** A reusable, best-practice end-to-end testing framework for Dewasa Ayu (and future projects)

---

## Summary

Dewasa Ayu needs end-to-end (E2E) tests that drive a real browser through the live stack (Next.js web → NestJS API → Wariga engine), proving the product behaves correctly as a user actually experiences it. This document designs a Playwright-based E2E layer in a dedicated `e2e/` workspace package, with a clearly isolated **portable core** (`core/`) copyable into future projects, plus project-specific page objects and specs for the three live pages. Accessibility (WCAG 2.1 AA) checks are first-class; tests are deterministic via engine-sourced "known dates". Reuse strategy: build clean in-repo now, extract to a shared package only when a second project needs it.

## Context

- Existing tests are **Vitest** unit/integration suites scoped per package (engine oracle-locked tests; API e2e via supertest). They verify logic and HTTP contracts but never exercise the rendered UI or the full web→API→engine chain a visitor hits.
- The web app fetches the API at render time (`apps/web/lib/api.ts`: `API_URL ?? http://localhost:3001/api/v1`), so a faithful E2E run requires **both servers up**.
- The product's core value proposition is "the Wariga calculation is correct, end to end." A wiring regression (wrong ceremony passed through, date off-by-one, verdict mislabeled) would not be caught by per-package unit tests. E2E closes that gap.
- **WCAG 2.1 AA is mandatory** (multi-generational audience incl. elderly). Accessibility must be enforced, not aspirational.
- **CI (GitHub Actions) is deliberately parked** (billing on a private repo — issue #15). E2E must run locally today and be CI-shaped for later.
- **Reuse decision (Rac, 2026-05-31):** Option A — build a clean, best-practice setup in-repo with a portable `core/`, and promote to a shared package only when a second project exists. Avoids abstracting for hypothetical consumers (YAGNI).

## Goals

- Drive the **real stack** (built web + API) in a real browser and assert correct, deterministic outcomes.
- Cover the **live pages** (Home / Cek Hari, Kalender, Rekomendasi) — smoke + critical user paths.
- Enforce **WCAG 2.1 AA** via automated accessibility scans on every page, mobile + desktop.
- Be **stable** (no flaky tests): web-first auto-waiting assertions, engine-sourced data, no arbitrary waits.
- Be **portable**: the reusable core (config preset, a11y helper, fixtures) lives in one folder copyable to other projects.
- Be **debuggable**: traces, screenshots, video on failure; HTML report.
- Run **locally now**, **CI-ready** later.

## Non-Goals

- **Visual regression / pixel snapshots.** Deferred until a page's design is frozen: high maintenance while the design still moves, and it detects drift from an approved baseline rather than matching the mockup. On-ramp documented below.
- **Aesthetic / taste judgment.** Whether the UI is beautiful or faithfully "Lontar" is a human (Rac) call; no automated test judges it.
- **Full cross-browser matrix.** Start with Desktop Chromium + one mobile profile; add Firefox/WebKit only on real need.
- **CI wiring now.** Actions parked on billing; the config is CI-shaped so a workflow drops in later.
- **Surfaces that do not exist yet.** `/admin`, auth, DB persistence, API caching, feedback — none are built.
- **A standalone published npm package now.** Per the reuse decision, portability is achieved by an isolated folder, not premature packaging.

## Detailed Specification

### Placement & workspace wiring

A dedicated top-level package **`e2e/`** (package name `@dewasa-ayu/e2e`), added to `pnpm-workspace.yaml` (`- 'e2e'`).
Rationale: E2E exercises web **and** API — it is not a web-app concern — and isolation keeps the portable core extractable and keeps Playwright out of the fast `turbo run test` (Vitest) loop.

A new turbo task **`e2e`** (separate from `test`):

```jsonc
"e2e": { "dependsOn": ["^build"], "cache": false }
```

The `e2e` package declares `@dewasa-ayu/web` and `@dewasa-ayu/api` as workspace devDependencies, so `^build` builds both apps before tests run. `cache: false` because the result depends on running servers and browsers, not just file inputs.

### Directory layout

```
e2e/
  package.json            @dewasa-ayu/e2e; devDeps: @playwright/test, @axe-core/playwright, the two apps
  playwright.config.ts    project config: imports the preset, defines webServer (api+web), baseURL, projects
  tsconfig.json           extends ../../tsconfig.base.json
  CLAUDE.md               conventions + how to write a test + how to port core/ (replaces README)
  .gitignore              test-results/, playwright-report/, blob-report/

  core/                   ── PORTABLE CORE (copy this folder into a new project) ──
    preset.ts             createPreset(opts) -> shared PlaywrightTestConfig fragment
    a11y.ts               checkA11y(page, opts?) -> axe-core scan; fails on serious/critical WCAG 2a/2aa
    fixtures.ts           base test.extend providing the a11y helper + a slot for page objects
    (each file opens with a short header comment so it is self-explanatory once copied)

  app/                    ── PROJECT-SPECIFIC (Dewasa Ayu) ──
    pages/
      home.page.ts        HomePage page object
      kalender.page.ts    KalenderPage page object
      rekomendasi.page.ts RekomendasiPage page object
    data/
      known-dates.ts      deterministic fixtures (date + ceremony -> expected rating/score), engine-sourced
    test.ts               re-exports `test`/`expect` extended with the page objects above

  specs/
    smoke.spec.ts         every page loads; header, footer, Sulinggih disclaimer present; no console errors
    home.spec.ts          pick ceremony + date -> correct deterministic verdict; edit flow; share; error state
    kalender.spec.ts      month grid renders; markers on correct dates; month nav; cell -> Home
    rekomendasi.spec.ts   form -> list of good dates; count selector; empty state; card -> Home
    a11y.spec.ts          axe scan on each page (mobile + desktop); zero serious/critical violations
```

**Portable** = `core/`. **Project-specific** = `app/` + `specs/` + the `webServer` block in `playwright.config.ts`. The `CLAUDE.md` documents both the conventions and the copy-to-new-project steps.

### Components & interfaces

**`core/preset.ts` — `createPreset(opts)`**

- _Does:_ returns a reusable `PlaywrightTestConfig` fragment — HTML reporter (local) / blob + list (CI), `retries: CI ? 2 : 0`, `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, sensible timeouts, and the `projects` matrix (Desktop Chromium + Mobile).
- _Inputs:_ `{ baseURL, isCI? }`. The project supplies its own `webServer` and `testDir`.
- _Depends on:_ `@playwright/test` only. No project-specific knowledge — portable.

**`core/a11y.ts` — `checkA11y(page, opts?)`**

- _Does:_ runs `AxeBuilder` against the current page, filtered to WCAG 2.0/2.1 level A & AA tags; asserts zero violations of impact `serious`/`critical`; prints a readable violation summary on failure.
- _Inputs:_ a Playwright `page`, optional `{ include, exclude, disableRules }`.
- _Depends on:_ `@axe-core/playwright`. Portable.

**`core/fixtures.ts` — base `test`**

- _Does:_ `base.test.extend` that injects an `a11y` fixture (`{ check: () => checkA11y(page) }`) and establishes the extension pattern a project layers its page objects onto.
- _Depends on:_ `core/a11y.ts`. Portable (carries no Dewasa-Ayu page objects itself).

**`app/test.ts`**

- _Does:_ extends `core/fixtures.ts` with Dewasa-Ayu page-object fixtures (`home`, `kalender`, `rekomendasi`) so specs read `const { home } = ...`. Re-exports `test` + `expect`.
- _Depends on:_ `core/fixtures.ts`, `app/pages/*`. Project-specific.

**`app/pages/home.page.ts` — `HomePage`** (illustrative interface; exact selectors fixed in the implementation plan)

- `goto(params?: { ceremony?, date? })` — navigates to `/` (optionally with query).
- `selectCeremony(id)` — clicks the ceremony in `CeremonyNav` by accessible name.
- `pickDate(iso)` — opens the Lontar date picker and selects the date.
- `submit()` — clicks "Periksa Dewasa".
- getters: `verdictHeading()` (`#verdict-h`, e.g. "Kurang ideal"), `scorePct()` (`.score`, aria "Skor N persen"), `factor(name)` (analysis row pass/fail — "Lulus"/"Tidak"), `dewasaTags()`, `disclaimer()`.
- Selectors prefer roles/labels/text (`getByRole`, `getByLabel`, `getByText`) — brittle CSS only where no accessible handle exists. Kalender/Rekomendasi page objects are analogous.

**`app/data/known-dates.ts`**

- Typed fixtures: `{ iso: string; ceremony: CeremonyId; expectedRating: Rating; expectedPct: number; note: string }`.
- **Source of truth:** expected values are taken from the **engine's own output** (the engine + its oracle-locked tests), never hand-guessed. Consistent with the project rule never to invent Wariga conditions — here the verdicts are computed, but expectations are still derived from the engine, not imagination. A small guard test asserts these fixtures still match live engine output so they cannot silently rot.

**`playwright.config.ts`**

- Imports `createPreset`; sets `testDir: './specs'`, `baseURL: http://localhost:3000`.
- `webServer: [ { command: start API, url: http://localhost:3001/api/v1/health, reuseExistingServer: !CI }, { command: start web, url: http://localhost:3000, reuseExistingServer: !CI } ]`.
- Server start uses `pnpm --filter @dewasa-ayu/<app> start` (cross-platform; relies on the prior build from the turbo `e2e` task). Generous `timeout` for cold starts.

### Data flow of a run

`pnpm e2e` → `turbo run e2e` → `^build` builds api + web (+ their deps) → Playwright launches both servers (or reuses already-running dev servers locally) → waits for the health URLs → runs specs across projects (desktop + mobile) in parallel, each test in a fresh browser context → on failure captures trace/screenshot/video → emits an HTML report (`pnpm --filter @dewasa-ayu/e2e report` to open).

### Determinism strategy

- All flows pass **explicit dates**; no reliance on "today".
- For the one path that defaults to today (Home with no `date`), pin time with `page.clock.setFixedTime(...)` so it is reproducible.
- Expected verdicts come from **engine truth** (e.g., a date inside the Galungan→Kuningan window for _pawiwahan_ yields "Kurang ideal"/"Kurang baik" because the wuku is forbidden). The fixtures file cites the engine as its source and is guarded by an assertion against live engine output.
- The app is **read-only** (no DB writes yet) → tests are naturally isolated; no shared mutable state; safe to parallelize.

### Best-practice decisions (summary)

1. **Real production stack** via `webServer` (built web + API); `reuseExistingServer` in dev.
2. **User-facing locators** (role/label/text); `data-testid` only where no accessible handle exists. Doubles as an accessibility forcing-function.
3. **Web-first auto-waiting assertions**; zero arbitrary sleeps.
4. **Page Object Model** — selectors centralized; specs read as user stories.
5. **Deterministic, engine-sourced data**; clock pinned where "today" matters.
6. **Accessibility as a test** (`@axe-core/playwright`, WCAG 2a/2aa, fail on serious/critical), mobile + desktop.
7. **Lean device matrix** (Desktop Chromium + one mobile) — mobile-first product; expand only on need.
8. **Debuggability** — trace/screenshot/video on failure & first retry; HTML report.
9. **CI-shaped, local-first** — retries & reporters switch on `process.env.CI`.
10. **Test isolation** — fresh browser context per test (Playwright default).

### Commands & developer workflow

- `pnpm e2e` (root) → build + start servers + run all specs headless.
- `pnpm --filter @dewasa-ayu/e2e test:ui` → Playwright UI mode for authoring/debugging.
- `pnpm --filter @dewasa-ayu/e2e report` → open the last HTML report.
- One-time: `pnpm --filter @dewasa-ayu/e2e exec playwright install` (downloads browser binaries).
- Windows note: server commands use `pnpm --filter` scripts (cross-platform), not raw OS paths.

### Reusability & porting (Option A)

- **Portable unit:** the `core/` folder + the conventions documented in `e2e/CLAUDE.md`.
- **To start E2E in a new project:** copy `core/`, add `@playwright/test` + `@axe-core/playwright`, write a fresh `app/` (page objects + data) and `specs/`, and point `playwright.config.ts`'s `webServer` at that project's servers.
- **Promotion trigger:** when a second project genuinely needs it, extract `core/` into a shared package (e.g. `@rac/e2e-kit`) and depend on it from both. Not before.

## Decisions & Rationale

- **Dedicated `e2e/` package over tests inside `apps/web`.** E2E exercises web + API together and must not bloat the per-package Vitest loop; isolation also makes the portable core extractable. Trade-off: one more workspace member — minor.
- **Real-stack over stubbed API.** The product's value is correct end-to-end calculation; stubbing the API would test the UI in a vacuum and miss wiring regressions. Cost: slower, needs both servers — accepted and mitigated by `reuseExistingServer` + healthchecks.
- **`CLAUDE.md` over `README.md` (Rac, 2026-05-31).** AI-first solo project: the "how to write/port tests" guidance is consumed almost entirely by Claude; `CLAUDE.md` is auto-loaded where it is enforced and keeps the root `CLAUDE.md` lean. Portability for non-Claude consumers is handled by header comments inside `core/*` (they travel with the code and do not rot like a separate doc). Mirrors the existing `docs/specs/` "no README, use CLAUDE.md" decision (2026-05-28).
- **Visual regression deferred.** It detects drift from an approved screenshot baseline (not a match to the mockup), is environment-sensitive (font rendering differs Windows vs. Linux CI), and churns while the design moves. Revisit per-page once a design is frozen.
- **Lean browser matrix.** Running three engines × specs from day one trades real cost for little signal on a single-developer product; Chromium desktop + one mobile covers the mobile-first priority.
- **Determinism via engine-sourced fixtures.** Hard-coding hand-guessed verdicts would be brittle and risks encoding a wrong cultural claim; sourcing expectations from engine output (itself oracle-locked and flagged "estimasi") keeps E2E honest and self-checking.

## Open Questions

- **Exact mobile profile** (Pixel 7 vs. iPhone 14 viewport) — settle when writing the config; immaterial to the design.
- **Promote this to a `docs/specs/` living spec (e.g. `TEST-001`)** once implemented, following the engineering-spec template, so the test contract is a living doc like engine/api/pages. Recommendation: yes, after the suite lands. To confirm with Rac at implementation time.
- **Network-level control via `next/experimental/testmode`** (Next ships a Playwright testmode helper). Not needed for the real-stack approach; noted as a future option if selective network mocking is ever wanted.

## References

- `docs/PRD.md` — product requirements (WCAG 2.1 AA mandate; user base)
- `docs/specs/pages.md` (UI-001), `docs/specs/api.md` (API-001), `docs/specs/engine.md` (ENG-001)
- `apps/web/app/page.tsx`, `apps/web/lib/api.ts`, `apps/web/lib/display.ts` — the live UI surface the page objects target
- `mockups/home.html` — design reference for the Home verdict layout
- GitHub issue #15 — CI deliberately parked (billing)
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices)
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright)
- Prior design: `docs/superpowers/specs/2026-05-28-spec-template-and-workflow-design.md` (CLAUDE.md-over-README precedent)

## Changelog

- v1.0.0 — 2026-05-31 — Initial design approved (Option A: in-repo with portable core; real-stack; a11y first-class; CLAUDE.md over README).
