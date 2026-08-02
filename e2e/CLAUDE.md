# CLAUDE.md — E2E (Playwright)

Auto-loaded when working in `e2e/`. Conventions for writing/running E2E tests here, and how to reuse the portable core in another project.

## Layout

- `core/` — **portable**. `preset.ts` (config fragment: reporters, retries, trace, browser+mobile projects), `a11y.ts` (`checkA11y` — settles the page, then axe WCAG 2a/2aa, fails on serious/critical), `fixtures.ts` (base `test` + the `a11y` fixture). Copy this folder into a new project verbatim.
- `app/` — **project-specific**. `pages/*` (page objects), `data/known-dates.ts` (engine-sourced expectations), `test.ts` (core `test` extended with this project's page objects).
- `specs/` — the tests.

## Running

- `pnpm e2e` (repo root) — builds web + API, starts them, runs every spec on desktop + mobile. The canonical command.
- Ports 3000/3001 taken (e.g. another project's containers)? Override: `$env:E2E_WEB_PORT='3100'; $env:E2E_API_PORT='3101'; pnpm e2e`.
- `pnpm --filter @dewasa-ayu/e2e e2e:ui` — Playwright UI mode for authoring/debugging. Run `pnpm build` first, or have `pnpm dev` running (the config reuses already-running servers locally).
- `pnpm --filter @dewasa-ayu/e2e report` — open the last HTML report.
- One-time: `pnpm --filter @dewasa-ayu/e2e exec playwright install chromium`.

## Rules

1. **User-facing locators only.** `getByRole` / `getByLabel` / `getByText`. Use a class/`.dp-panel`-scoped selector only where there is no accessible handle. If you cannot find a control by its accessible name, that is an a11y gap — fix the app, not the test.
2. **Web-first assertions.** `await expect(locator).toBeVisible()` etc. Never `waitForTimeout`.
3. **Determinism.** Navigate by URL with explicit `?date=YYYY-MM-DD`. Never assert against "today". Expected verdicts come from the engine via `app/data/known-dates.ts` — never hard-code a score or rating.
4. **Page objects own selectors.** Specs read as user stories; a DOM change is fixed in one page object.
5. **Real stack.** Tests hit the running web + API. To add a new page: write a page object in `app/pages/`, add its fixture to `app/test.ts`, write a spec in `specs/`.
6. **Accessibility.** Use the `a11y` fixture (`await a11y.check()`) after navigating. It settles the page first (disables animations, waits for network idle + fonts + a paint) so axe reads the resting, fully-styled state — keep that behaviour if you touch `core/a11y.ts`.

## Porting `core/` to a new project

1. Copy `e2e/core/` into the new repo's `e2e/`.
2. `pnpm add -D @playwright/test @axe-core/playwright` (+ `@types/node`).
3. Write `app/` (page objects + data) and `specs/` for that project.
4. In `playwright.config.ts`, spread `createPreset({ baseURL })` and point `webServer` at that project's servers.

When a second project actually needs the core, extract it to a shared package (e.g. `@rac/e2e-kit`) and depend on it from both — not before.
