---
id: UI-001
title: Pages & Components — Next.js Frontend
status: Draft
version: 0.2.1
owners: [@RacThug]
created: 2026-05-28
updated: 2026-05-29
implements: [20]
supersedes: null
related: [ENG-001, DB-001, API-001]
prd_refs: ["§9", "§14", "§17.2", "§20", "§22.1"]
external_refs: ["DESIGN.md"]
---

# Pages & Components — Next.js Frontend

## Summary

Defines the frontend of Dewasa Ayu hosted at `apps/web` (Next.js 16, App Router): design tokens, global components, and every screen with its component hierarchy, state strategy, API calls, and layout. Screens consume the contract declared in [API-001](./api.md); presentational state mirrors engine types from [ENG-001](./engine.md). Wireframes are ASCII for portability; a Figma file may be added later under `design/`.

## Context

The web app is the primary surface — 99% of users will reach the platform here. Without a frozen screen catalogue, component composition, state placement (URL vs local vs server cache vs localStorage), and breakpoint behaviour would be re-derived per page during implementation. This spec freezes them so [#4](https://github.com/RacThug/dewasa-ayu/issues/4) (Phase 3 Frontend Core), [#5](https://github.com/RacThug/dewasa-ayu/issues/5) (SEO content), and [#6](https://github.com/RacThug/dewasa-ayu/issues/6) (Accessibility) can proceed against a stable target.

This spec covers MVP screens plus the SEO pages (PRD §14) and Phase 2 admin surface. Accessibility-specific behaviour (font scaling, high-contrast theme) is referenced here but detailed in [ACS-001](./accessibility.md) when that spec is authored (Phase 5 trigger). The cultural rules from PRD §18.2 apply to every copy fragment described below: bahasa Indonesia primary; no authority claims; "disarankan/dihindari" not "dilarang/wajib".

## Goals

- Catalogue every screen + dynamic route the v1 frontend will serve, with composition tree and state placement.
- Specify which URL state lives in [`nuqs`](https://nuqs.47ng.com/), which UI state lives in `useState`, and what gets persisted in `localStorage`.
- Identify the reusable components shared across screens so they can be implemented once and consumed everywhere.
- Define design tokens (colors, typography, spacing) as a drop-in for `tailwind.config.ts`.
- Document loading / error / empty states for each screen so the Phase 5 a11y review can verify them.
- Reserve URL space for SEO pages (`/dewasa-ayu/...`, `/upacara/...`) and admin pages so future additions don't require structural moves.

## Non-Goals

- **Pixel-perfect mockups.** Wireframes are layout sketches, not visual designs. A Figma file lives alongside the project if a designer joins later; for now ASCII captures structure.
- **Microcopy translation strings.** Indonesian strings shown in wireframes are illustrative; the i18n string catalogue is a separate artifact (`apps/web/messages/id.json`).
- **Phase 5 accessibility implementation details.** This spec marks WCAG-relevant touchpoints (focus, contrast, keyboard) but the full a11y rule set is owned by the accessibility spec.
- **Email templates / marketing pages.** Out of v1 scope.
- **CMS-driven content.** Static About / SEO pages live in `apps/web/content/`; CMS integration is a future decision.

## Detailed Specification

### Design tokens

**Source of truth: [`/DESIGN.md`](../../DESIGN.md).** That file owns the full palette (paper / night / high-contrast), typography pairings, semantic colors, and rationale. UI-001 implements those decisions as a Tailwind config; it does not re-declare them.

Implementation expectations the Tailwind config must satisfy:

- **Theme default: `paper`** (cream + sepia ink), not `night`. Dark variant remains available; high-contrast available via `prefers-contrast: more` and the user toggle.
- **Token names follow DESIGN.md naming:** `paper`, `paper-deep`, `paper-edge`, `ink`, `ink-soft`, `ink-faint`, `ochre`, `ochre-soft` for the paper theme; `night`, `ember`, `gold`, etc. for the night theme. Do NOT keep the older `bg-light` / `bg-dark` naming from v0.1.0 — DESIGN.md is the source of truth.
- **Semantic colors:** `ayu`, `caution`, `ala` — desaturated values from DESIGN.md (sage, olive-gold, brick), distinct per theme. Three channels (color + icon + text) per PRD §9.4.1.
- **Typography:** Cormorant Garamond serif + DM Sans pair, with the numeric-as-inscription pattern from DESIGN.md (Cormorant ochre at 1.5–3× body for scores and Pawukon day).
- **Font scaling:** Normal (16 px) / Large (18 px) / Extra Large (20 px) bound to CSS variables; applied on `<html>`; persisted to `localStorage`.
- **Spacing:** 8-px unit rhythm per DESIGN.md (4 / 8 / 16 / 24 / 40 / 64 / 96). Minimum touch target 44 px via `spacing.touch`.

The concrete `tailwind.config.ts` lives at `apps/web/tailwind.config.ts` once implementation lands (Phase 3, issue #4). It is not duplicated here.

### Global components

Component library lives under `apps/web/components/`. Each item has one job; composition is shallow.

| Component               | Path                                 | Purpose                                                                                                                 |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `<RootLayout>`          | `app/layout.tsx`                     | Theme provider, font scaling, query client, top header + bottom nav (mobile) shell.                                     |
| `<CeremonySelector>`    | `components/ceremony-selector.tsx`   | Tabs (desktop) / dropdown (mobile) for the 6 ceremonies. Always visible at top.                                         |
| `<ThemeToggle>`         | `components/theme-toggle.tsx`        | Dark / Light / High Contrast switch. Persists to `localStorage` via `next-themes`.                                      |
| `<FontScalingToggle>`   | `components/font-scaling-toggle.tsx` | Aa button cycling Normal → Large → Extra Large.                                                                         |
| `<DatePicker>`          | `components/date-picker.tsx`         | Wraps `react-day-picker`; 44px+ touch targets; locale-aware.                                                            |
| `<ScoreBar>`            | `components/score-bar.tsx`           | Horizontal bar with percentage label + rating badge (ayu/caution/bad). Color + icon + text (never color-only per WCAG). |
| `<PawukonGrid>`         | `components/pawukon-grid.tsx`        | Card grid showing Wuku, Wewaran rows, Sasih, totalUrip for a `BalineseDate`.                                            |
| `<DewasaTagList>`       | `components/dewasa-tag-list.tsx`     | Pills for active dewasa ayu/ala with tooltips containing the Indonesian `description`.                                  |
| `<AnalysisChecklist>`   | `components/analysis-checklist.tsx`  | Ordered list of `Check[]` entries; pass/fail icon + factor name + contribution.                                         |
| `<CalendarGrid>`        | `components/calendar-grid.tsx`       | 7-column month grid; day cells render colored background + icon overlay for color-blind users.                          |
| `<ResultCard>`          | `components/result-card.tsx`         | Compose of ScoreBar + DewasaTagList + collapsed AnalysisChecklist; "Lihat detail lengkap" expand.                       |
| `<FeedbackWidget>`      | `components/feedback-widget.tsx`     | "Apakah hasil ini sesuai…" 3-button + optional notes; submits `POST /feedback` (API-001).                               |
| `<WhatsAppShareButton>` | `components/whatsapp-share.tsx`      | Generates share text + URL with current `?ceremony=&date=` URL state; opens `https://wa.me/?text=…`.                    |
| `<DisclaimerBanner>`    | `components/disclaimer-banner.tsx`   | Bottom-of-page strip with the Sulinggih disclaimer (PRD §18.1). Always visible.                                         |

All components are typed against `@dewasa-ayu/types` (shared with engine + API). Server-Action-friendly where possible — interactivity defaults to client components (`'use client'`) only when needed for `useState` / event handlers.

#### State strategy (universal)

Per PRD §20:

| State class      | Mechanism                                                                 | Survives refresh? | Shareable? | Examples                                              |
| ---------------- | ------------------------------------------------------------------------- | ----------------- | ---------- | ----------------------------------------------------- |
| URL state        | `nuqs`                                                                    | yes               | yes        | `ceremony`, `date`, `month`, `year`, `from`, `count`  |
| UI state         | `useState`                                                                | no                | no         | expand/collapse, modal open/closed, in-flight loading |
| User preferences | `localStorage` (via `next-themes` for theme, custom hook for font/locale) | yes               | no         | theme, font size, last ceremony, locale               |
| Server cache     | `@tanstack/react-query`                                                   | TTL-based         | no         | `/calendar/check`, `/calendar/month`, `/ceremonies`   |
| Offline cache    | Service Worker (Phase 6)                                                  | yes (offline)     | no         | pre-computed 3-month evaluations                      |

### Screens

Path conventions: kebab-case slugs in URLs; Indonesian segment names (`/kalender`, `/rekomendasi`, `/tanggal`, `/upacara`) for the consumer surface; English for technical paths (`/api-docs`, `/admin`).

#### `/` — Home / Check Date

The primary screen. Date picker + ceremony selector → instant evaluation.

**Component hierarchy:**

```
<RootLayout>
  <main>
    <CeremonySelector />
    <section.hero>
      <h1>Cek Hari Baik</h1>
      <DatePicker />
      <CekHariButton />
    </section>
    {result && <ResultCard result={result} />}
    {result?.expanded && (
      <>
        <PawukonGrid info={result.info} />
        <AnalysisChecklist checks={result.evaluation.checks} />
        <DewasaTagList ayu={result.evaluation.dewasaAyu} ala={result.evaluation.dewasaAla} />
        <FeedbackWidget date={result.date} ceremony={result.ceremony} />
      </>
    )}
    <WhatsAppShareButton />
    <DisclaimerBanner />
  </main>
</RootLayout>
```

**State:**

- URL: `?ceremony=<id>&date=YYYY-MM-DD`
- UI: `expanded: boolean` (Lihat Detail Lengkap toggle), `submitting: boolean`
- Server cache: `useQuery(['check', date, ceremony], () => api.check(date, ceremony))`
- localStorage: theme, font size, last-used ceremony (restored on next visit)

**API calls:**

- `GET /calendar/check?date=…&ceremony=…` on form submit
- `POST /feedback` from FeedbackWidget submit

**States:**

- Loading: skeleton ScoreBar + skeleton PawukonGrid (no spinner)
- Error 400: inline "Tanggal tidak valid" with hint
- Error 429: toast "Mohon tunggu sebentar — terlalu banyak permintaan"
- Empty (initial visit): hero copy + DatePicker default = today

**Wireframe (mobile, ~360px):**

```
┌────────────────────────────────┐
│ ☰ Dewasa Ayu          Aa  🌗  │
├────────────────────────────────┤
│ [💍][🔥][🙏][👶][🏠][💼]      │ ← horizontal scroll ceremony selector
├────────────────────────────────┤
│                                │
│   Cek Hari Baik                │
│                                │
│   ┌──────────────────────────┐ │
│   │ 15 Oktober 2026  ▼       │ │ ← date picker
│   └──────────────────────────┘ │
│                                │
│   [    Cek Hari   →    ]       │
│                                │
├────────────────────────────────┤
│ ✓ Dewasa Ayu          77%      │ ← ResultCard
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░               │
│                                │
│ 🏷 Sangawara Tulus              │
│ 🏷 Subacara                     │
│                                │
│ ┌──────────────────────────┐   │
│ │ Lihat Detail Lengkap   ▼ │   │
│ └──────────────────────────┘   │
├────────────────────────────────┤
│ 📲 Bagikan via WhatsApp         │
├────────────────────────────────┤
│ ⓘ Hasil ini perhitungan ref…   │ ← Disclaimer
└────────────────────────────────┘
```

**Desktop:** ceremony selector becomes a horizontal tab bar; ResultCard sits beside the date picker in a two-column layout above ~1024px.

#### `/kalender` — Monthly Calendar

Visual month grid with color-coded days per ceremony.

**Component hierarchy:**

```
<RootLayout>
  <CeremonySelector />
  <header.calendar>
    <MonthNavigator /* ‹ October 2026 › */ />
  </header>
  <CalendarGrid days={data.days} onDayClick={…} />
  {selectedDate && <ResultCard result={selectedDate} />}
</RootLayout>
```

**State:**

- URL: `?ceremony=<id>&year=YYYY&month=MM`
- UI: `selectedDay: string | null`
- Server cache: `useQuery(['month', year, month, ceremony], () => api.month(year, month, ceremony))`

**API calls:**

- `GET /calendar/month?year=…&month=…&ceremony=…` on URL change

**States:**

- Loading: grid of skeleton cells
- Error: full-row notice with retry button
- Empty: not possible (months always have days)

**Wireframe (mobile):**

```
┌────────────────────────────────┐
│ ☰ Dewasa Ayu          Aa  🌗  │
├────────────────────────────────┤
│ [💍 Pawiwahan ▼]                │
├────────────────────────────────┤
│ ‹     Oktober 2026          ›  │
├────────────────────────────────┤
│  M  S  S  R  K  J  S            │
│ ──────────────────────────────  │
│  ··  ··  ··  ·1  ·2  ·3· ·4·    │ ← · = neutral
│ ·5· ·6  ·7· ·8· *9  10  11      │ ← * = ayu (green), bg-color
│ 12  13  14  15  16  17· 18      │
│ 19  20  21  22  23  24  25      │
│ 26  27  28  29  30  31  ··      │
├────────────────────────────────┤
│ Hari ayu bulan ini: 9           │
│ Hari hati-hati: 18, kurang: 4   │
└────────────────────────────────┘
```

Days carry a color background AND a one-character marker (✓ for ayu, · for neutral, × for bad) so color-blind users get the same info.

**Desktop:** same grid layout, larger cells; click-detail panel slides in from the right.

#### `/rekomendasi` — Recommendations

Find N nearest good dates from a start date.

**Component hierarchy:**

```
<RootLayout>
  <CeremonySelector />
  <RecommendationForm from={from} count={count} />
  <RecommendationList dates={data.dates} />
</RootLayout>
```

**State:**

- URL: `?ceremony=<id>&from=YYYY-MM-DD&count=<5|10|20>`
- UI: none significant
- Server cache: `useQuery(['recommend', from, count, ceremony], …)`

**API calls:**

- `GET /calendar/recommend?from=…&count=…&ceremony=…`

**States:**

- Loading: 3 skeleton cards (matches default count fallback)
- Error: inline with retry
- Empty: "Tidak ada hari ayu dalam 365 hari ke depan" when `capReached: true && dates.length === 0`
- Partial: "Hanya ditemukan N hari dari pencarian X yang diminta" when `capReached: true && dates.length < count`

#### `/tanggal/[date]` — Date Detail (shareable)

Server-rendered (ISR, 24h revalidate per PRD §14.4) so WhatsApp link previews work and search engines index.

**Dynamic params:** `date` matches `YYYY-MM-DD`.

**Component hierarchy:** same composition as the `/` expanded view, but server-side rendered with the date locked in.

**State:**

- URL params (server-side): `date` (path), `ceremony` (query, default `pawiwahan`)
- Server: ISR via `generateStaticParams` for the next 90 days + on-demand for historic queries

**API calls:** server-side `GET /calendar/check` on first load; client-side react-query rehydration for follow-up nav.

**SEO:** OG image generated via `@vercel/og` showing the date, rating, and ceremony icon. Structured data `Event` schema with `startDate: date` and `name: "Dewasa Ayu Pawiwahan, 15 Oktober 2026"`.

#### `/about` — About Wariga

Comprehensive Wariga documentation in bahasa Indonesia. Static MDX content under `apps/web/content/about/`.

**Component hierarchy:**

```
<RootLayout>
  <main.prose>
    <MDXRemote source={aboutContent} />
  </main>
  <DisclaimerBanner />
</RootLayout>
```

**Content sections (from PRD §3.1, §14):**

1. Pengantar Wariga
2. Pawukon (Wuku, Wewaran)
3. Sasih (Penanggal, Pangelong)
4. Sistem Skoring
5. Tradisi & Regional Variation
6. Sumber & Referensi
7. Disclaimer Sulinggih

`area:cultural-review` label applies — Sulinggih consultation required before this page goes live (PRD §18.3).

#### `/upacara/[ceremony]` — Ceremony landing (SEO)

Per-ceremony evergreen educational page with the dewasa rules table, scoring weights, and worked examples.

**Dynamic params:** `ceremony` matches `CeremonyIdSchema`.

**Static generation:** `generateStaticParams` produces all 6 routes at build time. Rebuild nightly.

**Component hierarchy:**

```
<RootLayout>
  <main.prose>
    <CeremonyHeader name="Pawiwahan" icon="💍" />
    <SasihRulesTable rules={ceremonyConfig.sasihRules} />
    <DewasaApplicableTable dewasa={dewasa} />
    <ScoringWeightsTable weights={ceremonyConfig.scoringWeights} />
    <WorkedExamples />
    <CeremonyCTA path="/?ceremony={id}" />
  </main>
</RootLayout>
```

**Structured data:** FAQPage schema with "Apa itu dewasa ayu untuk pawiwahan?" Q/A pairs sourced from the page content.

#### `/dewasa-ayu/[ceremony]/[year]/[month]` — Monthly SEO

Calendar pre-rendered for a specific ceremony × year × month. SSG, rebuild nightly (per PRD §14.1, §14.4).

**Static generation:** 6 ceremonies × 12 months × 2 years (current + next) = 144 routes at build. Future months expand via revalidation cron.

**Component hierarchy:** identical to `/kalender` but pre-rendered and with SEO meta + structured data added.

**SEO:** `BreadcrumbList` schema (`Home > Dewasa Ayu > Pawiwahan > 2026 > Oktober`) and `WebPage` schema with `inLanguage: "id-ID"`.

#### `/dewasa-ayu/[ceremony]/[year]` — Yearly overview (SEO)

12-month summary for a ceremony × year.

**Component hierarchy:**

```
<RootLayout>
  <YearHeader />
  <YearMonthSummaryGrid />            {/* 12 mini-calendars or 12 month-cards with ayu count */}
  <YearTopDates />                    {/* top 10 ayu dates across the year */}
  <CeremonyCTA path="/?ceremony={id}" />
</RootLayout>
```

#### `/api-docs` — Swagger / OpenAPI

Auto-rendered Swagger UI consuming `apps/api/openapi.json` (generated by `@nestjs/swagger`). Embedded as a Next.js route via `swagger-ui-react`.

**Auth:** public (the API itself enforces auth on the calls).

#### `/admin` (Phase 2)

Admin landing with three sub-routes:

- `/admin/sasih-corrections` — list + create/edit rows in `sasih_corrections` table (per DB-001)
- `/admin/api-keys` — issue / revoke / list keys
- `/admin/feedback` — paginated browse with `rating_match` filter and notes preview

Auth: `next-auth` session OR API key + `X-Admin-Token` (same model as API-001 admin endpoints).

**URL space reserved in v1 even though screens land in Phase 2.**

#### Cross-cutting behaviour

**Ceremony selector change:**

- Updates URL params
- Triggers react-query refetch for visible data (calendar grid, recommendations, check result)
- Saves chosen ceremony to `localStorage` so next visit defaults to it
- Page does not navigate; data updates in place with skeleton placeholders

**Theme switch:**

- Saves to `localStorage` via `next-themes`
- Applied immediately to `<html>` class
- No URL change; received share-links don't override receiver's theme

**Font scaling switch:**

- Toggles `data-font-scale` attribute on `<html>`
- CSS variables drive `rem` values
- Persisted to `localStorage`

**WhatsApp share:**

- Generates message template: "Cek dewasa ayu untuk _{ceremony}_ tanggal _{date}_ — {url}"
- URL contains current `?ceremony=&date=`
- Opens `https://wa.me/?text={encoded}`

**Animations:**

- All transitions via `framer-motion`
- Respect `prefers-reduced-motion: reduce` — animations replaced with instant state change
- Default ease: `[0.4, 0, 0.2, 1]`, duration 200ms

## Decisions & Rationale

- **App Router (Next.js 16, Turbopack default), not Pages Router.** Recorded architecture decision. RSC by default lets us serialise smaller bundles to the client; cuts initial JS budget toward the <150KB target (PRD §22.2). Note: `params`/`searchParams`/`cookies` are async-only in Next 16 — write screens with the `await params` pattern from the start.

- **URL state via `nuqs`, not custom hooks.** Type-safe, SSR-friendly, fewer surprises around hydration. Trade-off: extra dependency (~3KB). Worth it for sharability of links — primary acquisition vector per PRD §19.

- **`react-query` for server cache, not RSC fetch alone.** Date checks and month evaluations are hit repeatedly during a session (user changes ceremony, navigates back); a client cache avoids re-hitting the API. Stale-while-revalidate semantics fit perfectly.

- **Theme + font scaling persisted, NOT in URL.** PRD §20 explicitly says these are user preferences and should not follow shared links. Receiver of a `/tanggal/[date]?ceremony=…` link sees their own theme, not the sender's.

- **Color + icon + text (never color-only) for evaluation badges.** WCAG 1.4.1 and PRD §9.4.1. Calendar cells, score bars, and rating chips all carry at least two channels.

- **One-character markers in `CalendarGrid` cells (✓ · ×) alongside background color.** Same WCAG reason; smallest typographic load that conveys the signal.

- **`DisclaimerBanner` is always visible**, not collapsed behind a hover. PRD §18 cultural sensitivity is non-negotiable; the disclaimer can't be missed.

- **Phase 2 admin URL space reserved in v1.** Same rationale as API-001 — prevents bikeshedding under launch pressure.

- **ASCII wireframes in this spec, no Figma link yet.** Solo team, no designer onboarded. ASCII captures layout structurally and survives merge conflicts cleanly. When a designer joins, add `design/figma.url` and reference here in the next minor version.

- **SEO content (`/upacara/...`, `/dewasa-ayu/...`) authored in the same Next.js app**, not a separate static site. Shares components, design tokens, ceremony rule data; one deploy pipeline.

- **`FeedbackWidget` is always reachable from result screens**, not buried in a settings menu. PRD §17.2 needs the highest possible reply rate; the widget is one tap below the result card.

## Open Questions

- [Q] Should ceremony selector live in a sticky top bar on mobile (always visible) or behind a "hamburger" once the user has chosen one? Sticky takes screen real estate; hidden risks users forgetting they can re-select. Recommend sticky for first session, collapsing to a chip after first selection. Owner: @RacThug. Target: usability testing during Phase 5.
- [Q] Should `/tanggal/[date]` default ceremony when none is in the URL? Currently `pawiwahan` per PRD §20.3. Alternative: show a "Pilih upacara dulu" empty state and force a selection. Latter is more honest for shared links but adds friction. Owner: @RacThug. Target: pre-launch.
- [Q] Calendar grid: week starts Monday (ISO) or Sunday (Bali common usage)? PRD doesn't specify. Recommend Monday default with a `?weekStart=sun` URL override. Owner: @RacThug. Target: usability testing.
- [Q] `localStorage` quota — we plan to cache 3 months × 6 ceremonies (~200 KB) for offline (PRD §15.2). Should we feature-detect quota and degrade gracefully on older browsers? Recommend yes — emit a one-time toast if `localStorage` is full or unavailable. Owner: @RacThug. Target: Phase 6 (PWA epic).
- [Q] Where does the OG image generation live — built into `apps/web` via `@vercel/og`, or a separate microservice? `@vercel/og` is simpler but constrains us to Vercel runtime. Recommend `@vercel/og` for v1; revisit if we leave Vercel. Owner: @RacThug. Target: Phase 4 (Content & SEO).
- [Q] Should `/admin/feedback` show notes inline or behind a click-to-reveal (privacy / scanability trade-off)? Notes may contain personal commentary even though anonymously submitted. Recommend click-to-reveal with the rest of the row visible. Owner: @RacThug. Target: Phase 2 admin design.

## References

- [PRD §3.1 — Vision](../PRD.md)
- [PRD §9 — UI/UX Requirements](../PRD.md)
- [PRD §14 — SEO & Content Strategy](../PRD.md)
- [PRD §17.2 — Accuracy Feedback Widget](../PRD.md)
- [PRD §18 — Legal & Cultural Sensitivity](../PRD.md)
- [PRD §20 — State Management Strategy](../PRD.md)
- [PRD §22.1 — Core Web Vitals](../PRD.md)
- Sibling specs: [ENG-001](./engine.md) (display types), [DB-001](./db.md) (admin tables), [API-001](./api.md) (data source for every screen)
- GitHub issue [#20](https://github.com/RacThug/dewasa-ayu/issues/20) — implementing task for this spec
- GitHub issue [#4](https://github.com/RacThug/dewasa-ayu/issues/4) — Phase 3 Frontend Core epic (primary consumer)
- GitHub issue [#5](https://github.com/RacThug/dewasa-ayu/issues/5) — Phase 4 Content & SEO epic
- [Next.js 16 App Router docs](https://nextjs.org/docs/app)
- [nuqs — type-safe URL state](https://nuqs.47ng.com/)
- [shadcn/ui](https://ui.shadcn.com/) — component primitives
- [TanStack Query](https://tanstack.com/query) — server cache

## Changelog

- v0.2.1 — 2026-05-29 — Corrected Next.js version references (14 → **16**, current stable) and noted Turbopack-default + async `params`/`searchParams`/`cookies`. Factual correction only; no screen or component contract changed.
- v0.2.0 — 2026-05-28 — Design tokens deferred to `/DESIGN.md` (Lontar manuscript revival direction, paper theme default). UI-001 retains only the implementation expectations the Tailwind config must satisfy; concrete token literals and palette rationale moved to DESIGN.md to avoid two sources of truth. No screen or component contracts changed.
- v0.1.0 — 2026-05-28 — Initial draft. Design tokens with three themes + font scaling. 14 global components. 9 screens documented (Home, Calendar, Recommendations, Date Detail, About, Ceremony landing, Monthly SEO, Yearly SEO, API Docs) plus 3 Phase 2 admin sub-routes. ASCII wireframes for the two most interactive screens. Cross-cutting behaviour for ceremony switch, theme switch, font scaling, share, animations. Six open questions flagged.
