# E2E Testing Framework (Playwright) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Project override:** Rac has a standing "no sub-agents" rule — execute inline in the main session (executing-plans), not via dispatched subagents.

**Goal:** Stand up a reusable, best-practice Playwright E2E layer that drives the real stack (Next.js web → NestJS API → Wariga engine) through the three live pages, with first-class WCAG 2.1 AA checks and deterministic, engine-sourced assertions.

**Architecture:** A dedicated `e2e/` workspace package with a portable `core/` (config preset, a11y helper, fixtures) plus project-specific page objects + specs. Tests run against built servers started by Playwright's `webServer`; expected verdicts are computed in-process from the engine (an independent source of truth) and asserted against what the UI renders over real HTTP.

**Tech Stack:** `@playwright/test`, `@axe-core/playwright`, pnpm workspaces, Turborepo, TypeScript (ESM).

**Design doc:** `docs/superpowers/specs/2026-05-31-e2e-playwright-framework-design.md`

---

## Discovered bug (handled by this plan)

While grounding the plan, two click-through paths were found broken: `calendar/month` and `calendar/recommend` serialize each day's `date` as a **full ISO timestamp** (`e.date.toISOString()` → `2026-09-23T00:00:00.000Z`, `calendar.service.ts:27,55`). The Kalender cell and Rekomendasi card embed that straight into `/?...&date=${d.date}` (`kalender/page.tsx:98`, `rekomendasi/page.tsx:74`), but Home only accepts a strict `YYYY-MM-DD` (`app/page.tsx:9,19`) and otherwise falls back to **today**. So clicking a recommended date or a calendar cell currently checks _today_, not the chosen date.

The Kalender and Rekomendasi specs (Tasks 4–5) assert the **correct** behavior, so they fail first and drive a minimal page-level fix: slice the date to `YYYY-MM-DD` in the two `href`s. This is the lowest-risk fix (no API contract or Zod-schema change; the API's existing tests assert `info.gregorian`, not the wire `date`, so they stay green).

---

## File Structure

**New package `e2e/` (portable `core/` + project-specific `app/` + `specs/`):**

| File                                | Responsibility                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `e2e/package.json`                  | Package manifest; devDeps (Playwright, axe, the two apps + engine + types); scripts (`e2e`, `e2e:ui`, `report`, `typecheck`). |
| `e2e/tsconfig.json`                 | Extends base; `noEmit`; includes `core`/`app`/`specs`/config.                                                                 |
| `e2e/playwright.config.ts`          | Project config: spreads the preset, defines the two `webServer`s + `baseURL`.                                                 |
| `e2e/.gitignore`                    | Ignores test artifacts.                                                                                                       |
| `e2e/CLAUDE.md`                     | Conventions + how to write a test + how to port `core/`.                                                                      |
| `e2e/core/preset.ts`                | **Portable.** `createPreset()` → reporters/retries/trace/projects matrix.                                                     |
| `e2e/core/a11y.ts`                  | **Portable.** `checkA11y()` → axe-core WCAG 2a/2aa scan, fail on serious/critical.                                            |
| `e2e/core/fixtures.ts`              | **Portable.** Base `test` extended with the `a11y` fixture.                                                                   |
| `e2e/app/test.ts`                   | Extends core `test` with project page-object fixtures; re-exports `test`/`expect`.                                            |
| `e2e/app/pages/home.page.ts`        | `HomePage` page object.                                                                                                       |
| `e2e/app/pages/kalender.page.ts`    | `KalenderPage` page object.                                                                                                   |
| `e2e/app/pages/rekomendasi.page.ts` | `RekomendasiPage` page object.                                                                                                |
| `e2e/app/data/known-dates.ts`       | Engine-sourced expected verdicts + date pickers (no hard-coded numbers).                                                      |
| `e2e/specs/smoke.spec.ts`           | Pages load; disclaimer present.                                                                                               |
| `e2e/specs/home.spec.ts`            | Verdict + score match the engine; failed-factor row; disclaimer.                                                              |
| `e2e/specs/date-picker.spec.ts`     | Lontar date picker drives a new date check.                                                                                   |
| `e2e/specs/kalender.spec.ts`        | Grid + engine-matched cell + month nav + cell→Home.                                                                           |
| `e2e/specs/rekomendasi.spec.ts`     | Engine-matched list + count change + card→Home.                                                                               |
| `e2e/specs/a11y.spec.ts`            | axe scan on each page (desktop + mobile).                                                                                     |

**Modified (root + apps):**

| File                                | Change                                                    |
| ----------------------------------- | --------------------------------------------------------- |
| `pnpm-workspace.yaml`               | Add `- 'e2e'`.                                            |
| `turbo.json`                        | Add `e2e` task (`dependsOn: ["^build"]`, `cache: false`). |
| `package.json` (root)               | Add `"e2e": "turbo run e2e"` script.                      |
| `apps/web/app/kalender/page.tsx`    | Bugfix: slice cell `href` date to `YYYY-MM-DD` (Task 4).  |
| `apps/web/app/rekomendasi/page.tsx` | Bugfix: slice card `href` date to `YYYY-MM-DD` (Task 5).  |

---

## Task 1: Scaffold the package, portable core, config, and a smoke test

**Files:**

- Modify: `pnpm-workspace.yaml`
- Modify: `turbo.json`
- Modify: `package.json` (root)
- Create: `e2e/package.json`
- Create: `e2e/tsconfig.json`
- Create: `e2e/.gitignore`
- Create: `e2e/core/preset.ts`
- Create: `e2e/core/a11y.ts`
- Create: `e2e/core/fixtures.ts`
- Create: `e2e/playwright.config.ts`
- Create: `e2e/specs/smoke.spec.ts`

- [ ] **Step 1: Register the package in the workspace**

Edit `pnpm-workspace.yaml` to:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'e2e'
```

- [ ] **Step 2: Add the `e2e` turbo task**

Edit `turbo.json`, add to `tasks` (after `test`):

```jsonc
    "e2e": {
      "dependsOn": ["^build"],
      "cache": false
    },
```

- [ ] **Step 3: Add the root `e2e` script**

Edit root `package.json` `scripts`, add after `"test": "turbo run test",`:

```jsonc
    "e2e": "turbo run e2e",
```

- [ ] **Step 4: Create `e2e/package.json`**

```json
{
  "name": "@dewasa-ayu/e2e",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "report": "playwright show-report",
    "typecheck": "tsc --noEmit -p tsconfig.json"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4",
    "@dewasa-ayu/api": "workspace:*",
    "@dewasa-ayu/types": "workspace:*",
    "@dewasa-ayu/wariga-engine": "workspace:*",
    "@dewasa-ayu/web": "workspace:*",
    "@playwright/test": "^1",
    "@types/node": "^24"
  }
}
```

- [ ] **Step 5: Create `e2e/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["core", "app", "specs", "playwright.config.ts"]
}
```

- [ ] **Step 6: Create `e2e/.gitignore`**

```gitignore
/test-results/
/playwright-report/
/blob-report/
/.last-run.json
```

- [ ] **Step 7: Create `e2e/core/preset.ts`** (portable — header comment explains how to reuse)

```ts
/**
 * PORTABLE E2E CORE — copy this folder into a new project as-is.
 * `createPreset` returns the project-agnostic half of a Playwright config
 * (reporters, retries, trace/screenshot/video, the browser+mobile matrix).
 * The consuming project supplies `webServer` + `baseURL` in playwright.config.ts.
 */
import { devices, type PlaywrightTestConfig } from '@playwright/test';

export interface PresetOptions {
  /** Web app base URL, e.g. http://localhost:3000 */
  baseURL: string;
  /** Defaults to !!process.env.CI */
  isCI?: boolean;
}

export function createPreset(opts: PresetOptions): PlaywrightTestConfig {
  const isCI = opts.isCI ?? !!process.env.CI;
  return {
    testDir: './specs',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: isCI ? [['blob'], ['list']] : [['html', { open: 'never' }], ['list']],
    timeout: 30_000,
    expect: { timeout: 10_000 },
    use: {
      baseURL: opts.baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
    projects: [
      { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    ],
  };
}
```

- [ ] **Step 8: Create `e2e/core/a11y.ts`** (portable)

```ts
/**
 * PORTABLE E2E CORE — accessibility gate.
 * Runs axe-core filtered to WCAG 2.0/2.1 A & AA, fails the test on any
 * serious/critical violation, and prints a readable summary.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING = new Set(['serious', 'critical']);

export async function checkA11y(page: Page, opts?: { disableRules?: string[] }): Promise<void> {
  let builder = new AxeBuilder({ page }).withTags(WCAG_AA_TAGS);
  if (opts?.disableRules?.length) builder = builder.disableRules(opts.disableRules);
  const { violations } = await builder.analyze();
  const blocking = violations.filter((v) => BLOCKING.has(v.impact ?? ''));
  const summary = blocking
    .map(
      (v) => `  • [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n    ${v.helpUrl}`,
    )
    .join('\n');
  expect(blocking, `A11y violations (serious/critical):\n${summary}`).toEqual([]);
}
```

- [ ] **Step 9: Create `e2e/core/fixtures.ts`** (portable)

```ts
/**
 * PORTABLE E2E CORE — base test fixtures.
 * Provides the `a11y` fixture on top of Playwright's base test. A project
 * layers its page objects onto THIS test (see app/test.ts).
 */
import { test as base, expect } from '@playwright/test';

import { checkA11y } from './a11y';

export interface A11yFixture {
  a11y: { check: (opts?: { disableRules?: string[] }) => Promise<void> };
}

export const test = base.extend<A11yFixture>({
  a11y: async ({ page }, use) => {
    await use({ check: (opts) => checkA11y(page, opts) });
  },
});

export { expect };
```

- [ ] **Step 10: Create `e2e/playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

import { createPreset } from './core/preset';

const WEB_URL = 'http://localhost:3000';
const API_HEALTH = 'http://localhost:3001/api/v1/health';

export default defineConfig({
  ...createPreset({ baseURL: WEB_URL }),
  webServer: [
    {
      command: 'pnpm --filter @dewasa-ayu/api start',
      url: API_HEALTH,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @dewasa-ayu/web start',
      url: WEB_URL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

- [ ] **Step 11: Create `e2e/specs/smoke.spec.ts`** (the test that proves the harness)

```ts
import { expect, test } from '../core/fixtures';

test('home page loads with an H1 and the Sulinggih disclaimer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.site-footer')).toContainText('Sulinggih');
});
```

- [ ] **Step 12: Install dependencies + the Chromium browser**

Run:

```bash
pnpm install
pnpm --filter @dewasa-ayu/e2e exec playwright install chromium
```

Expected: pnpm links `@dewasa-ayu/e2e`; Playwright downloads the Chromium build (one-time, a few hundred MB).

- [ ] **Step 13: Run the smoke test (full path: build + start servers + run)**

Run:

```bash
pnpm e2e
```

Expected: turbo builds engine/types/api/web, Playwright starts both servers, then `2 passed` (1 test × desktop + mobile). If it fails because ports 3000/3001 are busy, stop stray servers first (`netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`).

- [ ] **Step 14: Commit**

```bash
git add pnpm-workspace.yaml turbo.json package.json e2e/package.json e2e/tsconfig.json e2e/.gitignore e2e/core/preset.ts e2e/core/a11y.ts e2e/core/fixtures.ts e2e/playwright.config.ts e2e/specs/smoke.spec.ts pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
test(e2e): scaffold Playwright harness + portable core + smoke test

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Home page object, engine-sourced data, and the verdict spec

**Files:**

- Create: `e2e/app/data/known-dates.ts`
- Create: `e2e/app/pages/home.page.ts`
- Create: `e2e/app/test.ts`
- Create: `e2e/specs/home.spec.ts`

- [ ] **Step 1: Create `e2e/app/data/known-dates.ts`** (independent source of truth — never hard-codes a verdict)

```ts
/**
 * Engine-sourced test data. The engine is a pure, zero-dep function, so we call
 * it in-process to compute what the UI MUST show end-to-end. No hand-guessed
 * numbers — every expected value comes from the engine itself.
 */
import type { CeremonyId, Rating } from '@dewasa-ayu/types';
import { evaluate, findGoodDates, getFullInfo } from '@dewasa-ayu/wariga-engine';

/** Mirror of apps/api/src/calendar.service.ts parseISODate (engine reads local Y/M/D). */
export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Calendar day (YYYY-MM-DD) from an engine `gregorian` Date (UTC midnight). */
export function utcToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Verdict labels — mirror apps/web/lib/display.ts VERDICT (user-facing copy). */
export const VERDICT_LABEL: Record<Rating, string> = {
  ayu: 'Dewasa ayu',
  caution: 'Kurang ideal',
  bad: 'Kurang baik',
};

export interface ExpectedVerdict {
  rating: Rating;
  label: string;
  pct: number;
}

/** What the engine says for (date, ceremony) — the UI must match this. */
export function expectedVerdict(iso: string, ceremony: CeremonyId): ExpectedVerdict {
  const ev = evaluate(getFullInfo(isoToDate(iso)), ceremony);
  return { rating: ev.rating, label: VERDICT_LABEL[ev.rating], pct: Math.round(ev.pct) };
}

/** First "ayu" date on/after `fromISO`, chosen by the engine. */
export function firstAyuDate(fromISO: string, ceremony: CeremonyId): string {
  const r = findGoodDates(isoToDate(fromISO), 1, ceremony);
  if (r.dates.length === 0) throw new Error(`no ayu date for ${ceremony} from ${fromISO}`);
  return utcToISO(r.dates[0]!.date);
}

/** First non-"ayu" date on/after `fromISO` (scans via the engine). */
export function firstNonAyuDate(fromISO: string, ceremony: CeremonyId): string {
  const start = isoToDate(fromISO);
  for (let i = 0; i < 366; i += 1) {
    const info = getFullInfo(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    if (evaluate(info, ceremony).rating !== 'ayu') return utcToISO(info.gregorian);
  }
  throw new Error(`no non-ayu date for ${ceremony} from ${fromISO}`);
}

/** First date whose Wuku factor FAILS (forbidden wuku) — exercises the analysis row. */
export function firstWukuFailDate(fromISO: string, ceremony: CeremonyId): string {
  const start = isoToDate(fromISO);
  for (let i = 0; i < 732; i += 1) {
    const info = getFullInfo(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    const ev = evaluate(info, ceremony);
    if (ev.checks.some((c) => c.factor === 'wuku' && !c.passed)) return utcToISO(info.gregorian);
  }
  throw new Error(`no wuku-fail date for ${ceremony} from ${fromISO}`);
}

export const CEREMONY: CeremonyId = 'pawiwahan';
```

- [ ] **Step 2: Create `e2e/app/pages/home.page.ts`**

```ts
import { expect, type Locator, type Page } from '@playwright/test';

/** Page object for the Home "Cek Hari" page. Selectors live here only. */
export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(params?: { ceremony?: string; date?: string }): Promise<void> {
    const qs = new URLSearchParams();
    if (params?.ceremony) qs.set('ceremony', params.ceremony);
    if (params?.date) qs.set('date', params.date);
    await this.page.goto(qs.toString() ? `/?${qs.toString()}` : '/');
  }

  /** Verdict heading, e.g. "Dewasa ayu" / "Kurang ideal" / "Kurang baik". */
  verdict(): Locator {
    return this.page.locator('#verdict-h');
  }

  /** The big integer score percent. */
  async scorePct(): Promise<number> {
    const text = await this.page.locator('.score').first().innerText();
    return Number(text.replace(/[^0-9]/g, ''));
  }

  /** The pass/fail mark of an analysis factor row, by its label (e.g. "Wuku"). */
  factorMark(label: string): Locator {
    return this.page
      .locator('.analysis li')
      .filter({ has: this.page.locator('.name', { hasText: label }) })
      .locator('.mark');
  }

  /** The always-visible Sulinggih disclaimer (site footer). */
  disclaimer(): Locator {
    return this.page.locator('.site-footer');
  }

  /** Open the date picker and choose a day-of-month in the currently shown month. */
  async pickDayOfMonth(day: number): Promise<void> {
    await this.page.locator('.dp-trigger').first().click();
    const panel = this.page.locator('.dp-panel');
    await expect(panel).toBeVisible();
    await panel
      .locator('button')
      .filter({ hasText: new RegExp(`^${day}$`) })
      .click();
  }

  /** Current text of the date-picker trigger (shows the chosen date). */
  pickerTrigger(): Locator {
    return this.page.locator('.dp-trigger').first();
  }

  /** Submit the Home date form. */
  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Periksa Dewasa' }).click();
  }
}
```

- [ ] **Step 3: Create `e2e/app/test.ts`** (extends the core test with the Home page object)

```ts
import { expect, test as base } from '../core/fixtures';

import { HomePage } from './pages/home.page';

export interface Pages {
  home: HomePage;
}

export const test = base.extend<Pages>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect };
```

- [ ] **Step 4: Create `e2e/specs/home.spec.ts`**

```ts
import {
  CEREMONY,
  expectedVerdict,
  firstAyuDate,
  firstNonAyuDate,
  firstWukuFailDate,
} from '../app/data/known-dates';
import { expect, test } from '../app/test';

const AYU = firstAyuDate('2026-01-01', CEREMONY);
const NON_AYU = firstNonAyuDate('2026-01-01', CEREMONY);
const WUKU_FAIL = firstWukuFailDate('2026-01-01', CEREMONY);

test.describe('Home — the rendered verdict matches the engine', () => {
  test(`ayu date ${AYU} shows the ayu verdict + matching score`, async ({ home }) => {
    const exp = expectedVerdict(AYU, CEREMONY);
    await home.goto({ ceremony: CEREMONY, date: AYU });
    await expect(home.verdict()).toHaveText(exp.label);
    expect(await home.scorePct()).toBe(exp.pct);
  });

  test(`non-ayu date ${NON_AYU} shows its verdict + matching score`, async ({ home }) => {
    const exp = expectedVerdict(NON_AYU, CEREMONY);
    await home.goto({ ceremony: CEREMONY, date: NON_AYU });
    await expect(home.verdict()).toHaveText(exp.label);
    expect(await home.scorePct()).toBe(exp.pct);
  });

  test(`forbidden-wuku date ${WUKU_FAIL} marks the Wuku factor as failed`, async ({ home }) => {
    await home.goto({ ceremony: CEREMONY, date: WUKU_FAIL });
    await expect(home.factorMark('Wuku')).toContainText('Tidak');
  });

  test('the Sulinggih disclaimer is present', async ({ home }) => {
    await home.goto({ ceremony: CEREMONY, date: AYU });
    await expect(home.disclaimer()).toContainText('Sulinggih');
  });
});
```

- [ ] **Step 5: Run the Home spec**

Run:

```bash
pnpm e2e
```

Expected: smoke + Home specs pass. `10 passed` (5 tests × 2 projects).

- [ ] **Step 6: Commit**

```bash
git add e2e/app/data/known-dates.ts e2e/app/pages/home.page.ts e2e/app/test.ts e2e/specs/home.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): Home verdict spec cross-checked against the engine

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Date-picker interaction spec

**Files:**

- Create: `e2e/specs/date-picker.spec.ts`

- [ ] **Step 1: Create `e2e/specs/date-picker.spec.ts`**

```ts
import { expect, test } from '../app/test';

test('date picker: choosing a day and submitting checks that date', async ({ home, page }) => {
  // September 2026 is shown because the starting date is mid-month.
  await home.goto({ ceremony: 'pawiwahan', date: '2026-09-15' });

  await home.pickDayOfMonth(20);
  await expect(home.pickerTrigger()).toContainText('20 September 2026');

  await home.submit();
  await expect(page).toHaveURL(/[?&]date=2026-09-20(&|$)/);
  await expect(home.verdict()).toBeVisible();
});
```

- [ ] **Step 2: Run the date-picker spec**

Run:

```bash
pnpm e2e
```

Expected: all prior + the picker spec pass. `12 passed` (6 tests × 2 projects).

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/date-picker.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): Lontar date-picker interaction spec

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Kalender page object + spec (drives the date-wiring bugfix)

**Files:**

- Create: `e2e/app/pages/kalender.page.ts`
- Modify: `e2e/app/test.ts`
- Create: `e2e/specs/kalender.spec.ts`
- Modify: `apps/web/app/kalender/page.tsx` (bugfix)

- [ ] **Step 1: Create `e2e/app/pages/kalender.page.ts`**

```ts
import { type Locator, type Page } from '@playwright/test';

/** Page object for the /kalender month grid. */
export class KalenderPage {
  constructor(private readonly page: Page) {}

  async goto(params: { ceremony?: string; year?: number; month?: number } = {}): Promise<void> {
    const qs = new URLSearchParams();
    if (params.ceremony) qs.set('ceremony', params.ceremony);
    if (params.year) qs.set('year', String(params.year));
    if (params.month) qs.set('month', String(params.month));
    await this.page.goto(`/kalender${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  grid(): Locator {
    return this.page.locator('.cal-grid');
  }

  monthLabel(): Locator {
    return this.page.locator('.cal-month');
  }

  summary(): Locator {
    return this.page.locator('.cal-summary');
  }

  /** A day cell by day-of-month (matched on its aria-label, e.g. "1 — Dewasa ayu"). */
  cell(day: number): Locator {
    return this.page.getByRole('listitem', { name: new RegExp(`^${day} —`) });
  }

  nextMonth(): Locator {
    return this.page.getByRole('link', { name: 'Bulan berikutnya' });
  }

  prevMonth(): Locator {
    return this.page.getByRole('link', { name: 'Bulan sebelumnya' });
  }
}
```

- [ ] **Step 2: Update `e2e/app/test.ts`** (add the kalender fixture — full file)

```ts
import { expect, test as base } from '../core/fixtures';

import { HomePage } from './pages/home.page';
import { KalenderPage } from './pages/kalender.page';

export interface Pages {
  home: HomePage;
  kalender: KalenderPage;
}

export const test = base.extend<Pages>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  kalender: async ({ page }, use) => {
    await use(new KalenderPage(page));
  },
});

export { expect };
```

- [ ] **Step 3: Create `e2e/specs/kalender.spec.ts`**

```ts
import { CEREMONY, expectedVerdict } from '../app/data/known-dates';
import { expect, test } from '../app/test';

const YEAR = 2026;
const MONTH = 9; // September

test.describe('Kalender', () => {
  test('renders the month grid with an engine-matched first day', async ({ kalender }) => {
    await kalender.goto({ ceremony: CEREMONY, year: YEAR, month: MONTH });
    await expect(kalender.grid()).toBeVisible();
    await expect(kalender.monthLabel()).toHaveText('September 2026');
    await expect(kalender.summary()).toBeVisible();
    const exp = expectedVerdict('2026-09-01', CEREMONY);
    await expect(kalender.cell(1)).toHaveAttribute('aria-label', `1 — ${exp.label}`);
  });

  test('month navigation moves forward', async ({ kalender, page }) => {
    await kalender.goto({ ceremony: CEREMONY, year: YEAR, month: MONTH });
    await kalender.nextMonth().click();
    await expect(page).toHaveURL(/month=10(&|$)/);
    await expect(kalender.monthLabel()).toHaveText('Oktober 2026');
  });

  test('a day cell links through to its Home verdict', async ({ kalender, page }) => {
    await kalender.goto({ ceremony: CEREMONY, year: YEAR, month: MONTH });
    await kalender.cell(1).click();
    await expect(page).toHaveURL(/[?&]date=2026-09-01(&|$)/);
    await expect(page.locator('#verdict-h')).toBeVisible();
  });
});
```

- [ ] **Step 4: Run — the "links through" test FAILS (the date-wiring bug)**

Run:

```bash
pnpm e2e
```

Expected: the first two Kalender tests pass; `a day cell links through to its Home verdict` FAILS — the URL is `...&date=2026-09-01T00:00:00.000Z` (full ISO) instead of `2026-09-01`, so Home shows today and the assertion on the URL fails. This is the discovered bug.

- [ ] **Step 5: Fix the cell href in `apps/web/app/kalender/page.tsx`**

Change line 98 (inside `CalendarGrid`):

```tsx
              href={`/?ceremony=${month.ceremony}&date=${d.date}`}
```

to:

```tsx
              href={`/?ceremony=${month.ceremony}&date=${d.date.slice(0, 10)}`}
```

- [ ] **Step 6: Re-run — all Kalender tests pass**

Run:

```bash
pnpm e2e
```

Expected: `18 passed` (9 tests × 2 projects). The cell now links to `?date=2026-09-01` and Home renders the verdict.

- [ ] **Step 7: Commit (spec + fix together)**

```bash
git add e2e/app/pages/kalender.page.ts e2e/app/test.ts e2e/specs/kalender.spec.ts apps/web/app/kalender/page.tsx
git commit -m "$(cat <<'EOF'
test(e2e): Kalender spec; fix calendar cell deep-link date format

The cell href embedded the API's full ISO timestamp; Home only accepts
YYYY-MM-DD and fell back to today. Slice to the calendar day so a cell
links to its own date. Caught by the new Kalender E2E spec.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Rekomendasi page object + spec (drives the same bugfix on cards)

**Files:**

- Create: `e2e/app/pages/rekomendasi.page.ts`
- Modify: `e2e/app/test.ts`
- Create: `e2e/specs/rekomendasi.spec.ts`
- Modify: `apps/web/app/rekomendasi/page.tsx` (bugfix)

- [ ] **Step 1: Create `e2e/app/pages/rekomendasi.page.ts`**

```ts
import { type Locator, type Page } from '@playwright/test';

/** Page object for the /rekomendasi page. */
export class RekomendasiPage {
  constructor(private readonly page: Page) {}

  async goto(params: { ceremony?: string; from?: string; count?: number } = {}): Promise<void> {
    const qs = new URLSearchParams();
    if (params.ceremony) qs.set('ceremony', params.ceremony);
    if (params.from) qs.set('from', params.from);
    if (params.count) qs.set('count', String(params.count));
    await this.page.goto(`/rekomendasi${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  cards(): Locator {
    return this.page.locator('.reco-card');
  }

  countSelect(): Locator {
    return this.page.getByLabel('Jumlah hari yang dicari');
  }

  submit(): Locator {
    return this.page.getByRole('button', { name: 'Cari Hari Baik' });
  }
}
```

- [ ] **Step 2: Update `e2e/app/test.ts`** (add the rekomendasi fixture — full file)

```ts
import { expect, test as base } from '../core/fixtures';

import { HomePage } from './pages/home.page';
import { KalenderPage } from './pages/kalender.page';
import { RekomendasiPage } from './pages/rekomendasi.page';

export interface Pages {
  home: HomePage;
  kalender: KalenderPage;
  rekomendasi: RekomendasiPage;
}

export const test = base.extend<Pages>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  kalender: async ({ page }, use) => {
    await use(new KalenderPage(page));
  },
  rekomendasi: async ({ page }, use) => {
    await use(new RekomendasiPage(page));
  },
});

export { expect };
```

- [ ] **Step 3: Create `e2e/specs/rekomendasi.spec.ts`**

```ts
import { findGoodDates } from '@dewasa-ayu/wariga-engine';

import { CEREMONY, isoToDate, utcToISO } from '../app/data/known-dates';
import { expect, test } from '../app/test';

const FROM = '2026-01-01';

test.describe('Rekomendasi', () => {
  test('lists exactly the engine-recommended dates', async ({ rekomendasi }) => {
    const expected = findGoodDates(isoToDate(FROM), 5, CEREMONY);
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM, count: 5 });
    await expect(rekomendasi.cards()).toHaveCount(expected.dates.length);
  });

  test('changing the count re-queries', async ({ rekomendasi, page }) => {
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM, count: 5 });
    await rekomendasi.countSelect().selectOption('10');
    await rekomendasi.submit().click();
    await expect(page).toHaveURL(/count=10(&|$)/);
    const expected = findGoodDates(isoToDate(FROM), 10, CEREMONY);
    await expect(rekomendasi.cards()).toHaveCount(expected.dates.length);
  });

  test('a recommendation links through to its Home verdict', async ({ rekomendasi, page }) => {
    const expected = findGoodDates(isoToDate(FROM), 5, CEREMONY);
    const firstISO = utcToISO(expected.dates[0]!.date);
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM, count: 5 });
    await rekomendasi.cards().first().click();
    await expect(page).toHaveURL(new RegExp(`[?&]date=${firstISO}(&|$)`));
    await expect(page.locator('#verdict-h')).toBeVisible();
  });
});
```

- [ ] **Step 4: Run — the "links through" test FAILS (same bug on cards)**

Run:

```bash
pnpm e2e
```

Expected: the first two Rekomendasi tests pass; `a recommendation links through to its Home verdict` FAILS — the card href is the full ISO timestamp, so the URL `date` doesn't match `firstISO` (YYYY-MM-DD).

- [ ] **Step 5: Fix the card href in `apps/web/app/rekomendasi/page.tsx`**

Change line 74:

```tsx
                <Link href={`/?ceremony=${ceremony}&date=${d.date}`} className="reco-card">
```

to:

```tsx
                <Link href={`/?ceremony=${ceremony}&date=${d.date.slice(0, 10)}`} className="reco-card">
```

- [ ] **Step 6: Re-run — all Rekomendasi tests pass**

Run:

```bash
pnpm e2e
```

Expected: `24 passed` (12 tests × 2 projects).

- [ ] **Step 7: Commit (spec + fix together)**

```bash
git add e2e/app/pages/rekomendasi.page.ts e2e/app/test.ts e2e/specs/rekomendasi.spec.ts apps/web/app/rekomendasi/page.tsx
git commit -m "$(cat <<'EOF'
test(e2e): Rekomendasi spec; fix recommendation card deep-link date

Same date-format fix as the calendar cell: slice the API's full ISO to
the calendar day so a recommendation card links to its own date.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Accessibility spec (axe on each page, desktop + mobile)

**Files:**

- Create: `e2e/specs/a11y.spec.ts`

- [ ] **Step 1: Create `e2e/specs/a11y.spec.ts`**

```ts
import { CEREMONY, firstAyuDate } from '../app/data/known-dates';
import { test } from '../app/test';

const ROUTES: { name: string; path: string }[] = [
  { name: 'Home', path: `/?ceremony=${CEREMONY}&date=${firstAyuDate('2026-01-01', CEREMONY)}` },
  { name: 'Kalender', path: `/kalender?ceremony=${CEREMONY}&year=2026&month=9` },
  { name: 'Rekomendasi', path: `/rekomendasi?ceremony=${CEREMONY}&from=2026-01-01&count=5` },
];

for (const route of ROUTES) {
  test(`${route.name} has no serious/critical WCAG violations`, async ({ page, a11y }) => {
    await page.goto(route.path);
    await a11y.check();
  });
}
```

- [ ] **Step 2: Run the a11y spec**

Run:

```bash
pnpm e2e
```

Expected: `30 passed` (15 tests × 2 projects) **OR** one or more a11y tests fail with a printed list of serious/critical WCAG violations. **If violations are reported, that is a real finding** — record each (rule id + page + viewport) and triage with Rac (fix now vs. follow-up issue). Do not weaken `checkA11y` to force a pass; the contrast-heavy lamplight theme on mobile is the most likely place to surface a genuine issue.

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/a11y.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): accessibility spec (axe WCAG 2.1 AA, desktop + mobile)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Conventions doc (`e2e/CLAUDE.md`) + final verification

**Files:**

- Create: `e2e/CLAUDE.md`

- [ ] **Step 1: Create `e2e/CLAUDE.md`**

```markdown
# CLAUDE.md — E2E (Playwright)

Auto-loaded when working in `e2e/`. Conventions for writing/running E2E tests here, and how to reuse the portable core in another project.

## Layout

- `core/` — **portable**. `preset.ts` (config fragment), `a11y.ts` (`checkA11y`), `fixtures.ts` (base `test` + `a11y` fixture). Copy this folder to a new project verbatim.
- `app/` — **project-specific**. `pages/*` (page objects), `data/known-dates.ts` (engine-sourced expectations), `test.ts` (core `test` extended with this project's page objects).
- `specs/` — the tests.

## Running

- `pnpm e2e` (repo root) — builds web + API, starts them, runs every spec on desktop + mobile. The canonical command.
- `pnpm --filter @dewasa-ayu/e2e e2e:ui` — Playwright UI mode for authoring/debugging. Run `pnpm build` first, or have `pnpm dev` running (the config reuses already-running servers locally).
- `pnpm --filter @dewasa-ayu/e2e report` — open the last HTML report.
- One-time: `pnpm --filter @dewasa-ayu/e2e exec playwright install chromium`.

## Rules

1. **User-facing locators only.** `getByRole` / `getByLabel` / `getByText`. Use a class/`.dp-panel`-scoped selector only where there is no accessible handle. If you cannot find a control by its accessible name, that is an a11y gap — fix the app, not the test.
2. **Web-first assertions.** `await expect(locator).toBeVisible()` etc. Never `waitForTimeout`.
3. **Determinism.** Navigate by URL with explicit `?date=YYYY-MM-DD`. Never assert against "today". Expected verdicts come from the engine via `app/data/known-dates.ts` — never hard-code a score or rating.
4. **Page objects own selectors.** Specs read as user stories; a DOM change is fixed in one page object.
5. **Real stack.** Tests hit the running web + API. To add a new page: write a page object in `app/pages/`, add its fixture to `app/test.ts`, write a spec in `specs/`.

## Porting `core/` to a new project

1. Copy `e2e/core/` into the new repo's `e2e/`.
2. `pnpm add -D @playwright/test @axe-core/playwright`.
3. Write `app/` (page objects + data) and `specs/` for that project.
4. In `playwright.config.ts`, spread `createPreset({ baseURL })` and point `webServer` at that project's servers.

When a second project actually needs the core, extract it to a shared package (e.g. `@rac/e2e-kit`) and depend on it from both — not before.
```

- [ ] **Step 2: Typecheck the package**

Run:

```bash
pnpm --filter @dewasa-ayu/e2e typecheck
```

Expected: no errors.

- [ ] **Step 3: Final full run**

Run:

```bash
pnpm e2e
```

Expected: the whole suite passes (modulo any real a11y findings from Task 6).

- [ ] **Step 4: Commit**

```bash
git add e2e/CLAUDE.md
git commit -m "$(cat <<'EOF'
docs(e2e): conventions + porting guide (e2e/CLAUDE.md)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Open the PR** (gitflow: base `develop`; code PR → draft, then ready after the suite is green). Follow the `safe-git-workflow` skill.

---

## Self-Review

**1. Spec coverage** (design doc → tasks):

- Dedicated `e2e/` package + workspace + turbo task → Task 1 (Steps 1–4).
- Portable `core/` (preset, a11y, fixtures) with header comments → Task 1 (Steps 7–9).
- Real-stack `webServer` (api + web, reuse in dev) → Task 1 (Step 10).
- Smoke (pages load, disclaimer) → Task 1 (Step 11).
- Home critical path, deterministic engine-sourced verdict → Task 2; date picker → Task 3.
- Kalender (grid, markers, nav, cell→Home) → Task 4; Rekomendasi (list, count, card→Home) → Task 5.
- a11y on every page, desktop + mobile → Task 6.
- `CLAUDE.md` over README (conventions + porting) → Task 7.
- User-facing locators / web-first / determinism best practices → encoded in page objects + `CLAUDE.md`.
- Determinism = engine-sourced, no hard-coded numbers → `known-dates.ts` (Task 2).
- Bug surfaced + fixed → Tasks 4–5.

No gaps.

**2. Placeholder scan:** No "TBD"/"handle edge cases"/"similar to Task N". Every code step shows full content; files modified more than once (`app/test.ts`) are shown in full each time.

**3. Type consistency:** `createPreset(opts: PresetOptions)` (Task 1) used in `playwright.config.ts` (Task 1). `checkA11y(page, opts?)` (Task 1) wired in `fixtures.ts` as `a11y.check` (Task 1) and used in `a11y.spec.ts` (Task 6). `isoToDate`/`utcToISO`/`expectedVerdict`/`firstAyuDate`/`firstNonAyuDate`/`firstWukuFailDate`/`VERDICT_LABEL`/`CEREMONY` declared in `known-dates.ts` (Task 2), imported by `home.spec.ts` (Task 2), `kalender.spec.ts` (Task 4), `rekomendasi.spec.ts` (Task 5), `a11y.spec.ts` (Task 6). `HomePage`/`KalenderPage`/`RekomendasiPage` methods used by specs match their definitions. `Pages` fixture interface grows consistently across Tasks 2/4/5 (full file shown each time). Engine API used (`evaluate`, `getFullInfo`, `findGoodDates(from, count, ceremony)`) matches `packages/wariga-engine/src/index.ts` + `search.ts`.

Consistent.
