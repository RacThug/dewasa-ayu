# Dewasa Ayu — Product Requirements Document

**Balinese Hindu Ceremony Day Finder Platform**
Version 2.1 | April 2026 | Multi-Yadnya Edition
Stack: Next.js + NestJS + PostgreSQL | Status: Draft

---

## 1. Executive Summary

Dewasa Ayu is a web platform for finding auspicious days (dewasa ayu) for Hindu Balinese ceremonies based on the traditional Wariga calendar system. The platform converts Gregorian dates to all Balinese calendar components — Pawukon, Wewaran (Ekawara through Dasawara), Sasih, Penanggal/Pangelong — then evaluates suitability for various ceremony types.

This version supports **6 ceremony categories** with ceremony-specific rules, scoring weights, and dewasa detection. The calculation engine is shared; only the evaluation rules differ per ceremony type.

### Supported Ceremony Types

| Category      | Ceremonies Included                                                                  | Panca Yadnya   |
| ------------- | ------------------------------------------------------------------------------------ | -------------- |
| Pawiwahan     | Pernikahan (Wedding ceremony)                                                        | Manusa Yadnya  |
| Manusa Yadnya | Metatah/Mepandes (Tooth filing), Otonan (Birthday), Potong Rambut, Upacara Kelahiran | Manusa Yadnya  |
| Dewa Yadnya   | Melaspas (Building consecration), Ngenteg Linggih, Piodalan, Persembahyangan         | Dewa Yadnya    |
| Pitra Yadnya  | Ngaben (Cremation), Nyekah, Atma Wedana, Ngasti, Memukur                             | Pitra Yadnya   |
| Pembangunan   | Membangun rumah/pura, Mengatapi, Renovasi                                            | Cross-category |
| Memulai Usaha | Membuka usaha, Berdagang, Mulai belajar/berlatih                                     | Cross-category |

### Key Deliverables

- Wariga Engine: shared TypeScript library for Gregorian-to-Balinese calendar conversion
- Ceremony Rule System: configurable per-ceremony evaluation rules and scoring
- Web App (Next.js): interactive calendar with ceremony selector, date checker, recommendations
- REST API (NestJS): public endpoints for third-party integration
- About/Education Page: comprehensive Wariga documentation in Bahasa Indonesia

---

## 2. Problem Statement & Opportunity

### 2.1 Problem

Determining auspicious days for Hindu Balinese ceremonies requires deep knowledge of Wariga involving 10+ variables. Different ceremony types have different rules — what's good for a wedding may be terrible for ngaben, and vice versa. Currently:

- Physical Bali calendars are static, cover only 1 year, and don't explain why a day is good/bad for a specific ceremony
- Consulting Sulinggih/Pemangku requires time and access (especially for diaspora)
- Existing apps are mostly single-ceremony (usually just pawiwahan) and don't provide educational context
- No single platform handles all 6 ceremony categories with transparent scoring

### 2.2 Opportunity

- 4+ million Hindu Balinese who actively use Wariga in daily life
- Growing Balinese diaspora across Indonesia and worldwide who lack physical calendar access
- Wedding & event industry in Bali needing digital date-finding tools
- Educational gap: younger generation losing Wariga knowledge, need accessible digital resources
- B2B SaaS potential for wedding planners, event organizers, digital invitation platforms

---

## 3. Product Vision & Goals

### 3.1 Vision

To become the most trusted and comprehensive digital platform for Balinese Hindu ceremony day-finding, honoring traditional Wariga wisdom while making it accessible to modern users.

### 3.2 Goals

| Goal                 | Metric                          | Target                                        |
| -------------------- | ------------------------------- | --------------------------------------------- |
| Calculation accuracy | Match rate vs official calendar | >99% for Pawukon, >95% for Sasih              |
| Ceremony coverage    | Supported ceremony types        | 6 categories                                  |
| User adoption        | Monthly Active Users            | 10,000 within 6 months                        |
| API performance      | Response latency p95            | <200ms                                        |
| Dewasa detection     | Rules per ceremony              | 15+ dewasa ayu/ala detected                   |
| Education            | About page completeness         | Full Wariga documentation in Bahasa Indonesia |

---

## 4. Ceremony Rules Matrix

This is the core differentiator of the multi-yadnya system. Each ceremony type has its own set of rules determining which days are auspicious (ayu) or inauspicious (ala). The calculation engine remains shared; only the evaluation configuration changes.

### 4.1 Sasih Rules per Ceremony

| Sasih   | Pawiwahan | Pitra Yadnya | Dewa Yadnya | Manusa Yadnya | Pembangunan | Usaha  |
| ------- | --------- | ------------ | ----------- | ------------- | ----------- | ------ |
| Kasa    | Buruk     | Baik         | Netral      | Buruk         | Netral      | Netral |
| Karo    | Buruk     | Baik         | Netral      | Buruk         | Netral      | Netral |
| Katiga  | Baik      | Netral       | Baik        | Baik          | Baik        | Baik   |
| Kapat   | Baik      | Netral       | Baik        | Baik          | Baik        | Baik   |
| Kalima  | Baik      | Netral       | Baik        | Baik          | Baik        | Baik   |
| Kanem   | Buruk     | Netral       | Netral      | Netral        | Netral      | Netral |
| Kapitu  | Baik      | Netral       | Baik        | Baik          | Baik        | Baik   |
| Kawolu  | Buruk     | Netral       | Netral      | Buruk         | Netral      | Netral |
| Kasanga | Buruk     | Netral       | Netral      | Buruk         | Netral      | Netral |
| Kadasa  | Baik      | Netral       | Baik        | Baik          | Baik        | Baik   |
| Destha  | Buruk     | Netral       | Netral      | Netral        | Netral      | Netral |
| Sadha   | Buruk     | Netral       | Baik        | Netral        | Netral      | Netral |

### 4.2 Dewasa Ayu per Ceremony Type

| Dewasa Ayu       | Pawi. | Pitra | Dewa | Manu. | Pemb. | Usaha | Description                                |
| ---------------- | ----- | ----- | ---- | ----- | ----- | ----- | ------------------------------------------ |
| Subacara         | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Buda Kliwon — baik untuk segala upacara    |
| Kama Jaya        | Yes   | -     | -    | -     | -     | -     | Dewasa pernikahan, energi cinta            |
| Dina Jaya        | Yes   | -     | -    | Yes   | -     | Yes   | Hari kemenangan                            |
| Ayu Nulus        | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Baik untuk segala pekerjaan                |
| Ayu Dana         | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Baik Panca Yadnya, bercocok tanam, berdana |
| Dewa Stata       | -     | -     | Yes  | -     | Yes   | -     | Baik untuk Dewa Yadnya                     |
| Amerta Dewa      | -     | Yes   | Yes  | -     | Yes   | -     | Baik Dewa Yadnya, bangunan suci, lumbung   |
| Amerta Dewa Jaya | -     | Yes   | Yes  | -     | Yes   | -     | Unsur keunggulan                           |
| Siwa Sampurna    | -     | Yes   | Yes  | Yes   | Yes   | Yes   | Baik segala upacara, bangunan              |
| Dewasa Mentas    | -     | Yes   | -    | -     | -     | -     | Khusus Pitra Yadnya                        |
| Swarga Menge     | -     | Yes   | -    | -     | -     | -     | Khusus Pitra Yadnya                        |
| Catur Laba       | -     | Yes   | -    | Yes   | -     | Yes   | Baik Manusa/Pitra Yadnya, bepergian        |
| Derman Bagia     | Yes   | -     | -    | Yes   | Yes   | Yes   | Baik nikah, membangun, belajar             |
| Sangawara Tulus  | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Langsung berhasil                          |
| Sangawara Dadi   | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Terwujud                                   |
| Triwara Beteng   | Yes   | -     | -    | Yes   | -     | -     | Mempertemukan                              |

### 4.3 Dewasa Ala per Ceremony Type

| Dewasa Ala      | Pawi. | Pitra | Dewa | Manu. | Pemb. | Usaha | Condition                                                   |
| --------------- | ----- | ----- | ---- | ----- | ----- | ----- | ----------------------------------------------------------- |
| Rangda Tiga     | Yes   | -     | -    | Yes   | -     | -     | Wuku: Wariga, Warigadean, Pujut, Pahang, Menail, Prangbakat |
| Carik Walangati | Yes   | -     | Yes  | Yes   | Yes   | Yes   | Specific wuku overlap                                       |
| Uncal Balung    | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Wuku Dungulan & Kuningan                                    |
| Pati Paten      | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Sukra+Tilem or Sukra+Pngl 10                                |
| Semut Sadulur   | -     | Yes   | -    | -     | -     | -     | Total Urip=13, pantangan ngaben                             |
| Kala Gotongan   | -     | Yes   | -    | -     | -     | -     | Total Urip=14, pantangan ngaben                             |
| Ingkel Wong     | Yes   | -     | -    | Yes   | -     | -     | Ingkel=Wong, pantangan Manusa Yadnya                        |
| Kala Jengking   | Yes   | -     | -    | Yes   | -     | -     | Kajeng+Wage+Maulu                                           |
| Sampar Wangke   | Yes   | -     | -    | Yes   | -     | -     | Soma di wuku: Sinta,Wariga,Langkir,Tambir,Bala              |
| Kala Temah      | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Sangawara=Dangu or Urungan                                  |
| Kala Dangastra  | -     | -     | Yes  | -     | Yes   | Yes   | Not good for important work/upacara                         |
| Kala Suwung     | -     | -     | -    | -     | -     | Yes   | Not good for starting business                              |
| Kala Ngruda     | -     | -     | -    | -     | -     | Yes   | Not good for important affairs                              |
| Geni Rawana     | -     | -     | -    | -     | Yes   | -     | Not good for melaspas/mengatapi                             |
| Mrta Papageran  | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Saniscara+Purnama or Yama                                   |
| Kalebu Rau      | Yes   | Yes   | Yes  | Yes   | Yes   | Yes   | Soma+Tilem or Beteng                                        |
| Pangelong       | Yes   | -     | Yes  | Yes   | Yes   | -     | Paro gelap — kemunduran                                     |

---

## 5. Feature Requirements

### 5.1 MVP Features

| ID    | Feature           | P   | Description                                                                                             |
| ----- | ----------------- | --- | ------------------------------------------------------------------------------------------------------- |
| F-001 | Ceremony Selector | P0  | Dropdown/tabs to switch between 6 ceremony types. Affects all evaluations globally.                     |
| F-002 | Date Checker      | P0  | Input Gregorian date → full Pawukon info + ceremony-specific evaluation with score, checks, dewasa tags |
| F-003 | Monthly Calendar  | P0  | Visual calendar with color-coded days (green=ayu, red=ala, blue=neutral) based on selected ceremony     |
| F-004 | Recommendations   | P0  | Find N nearest good days for selected ceremony from a given start date                                  |
| F-005 | Dewasa Detail     | P0  | Show all active dewasa ayu & ala for a date with descriptions and severity                              |
| F-006 | Scoring System    | P0  | Weighted percentage score with ceremony-specific weights                                                |
| F-007 | About Page        | P0  | Full Wariga documentation in Bahasa Indonesia                                                           |
| F-008 | Responsive Design | P0  | Mobile-first responsive UI                                                                              |
| F-009 | REST API          | P1  | Endpoints: /check, /calendar, /recommend with ceremony type parameter                                   |
| F-010 | Share Result      | P1  | Share evaluation via link/WhatsApp                                                                      |
| F-011 | Multi-language    | P1  | UI in Bahasa Indonesia + English                                                                        |
| F-012 | PWA               | P2  | Offline-capable Progressive Web App                                                                     |

### 5.2 Phase 2 Features

| ID    | Feature                | P   | Description                                                |
| ----- | ---------------------- | --- | ---------------------------------------------------------- |
| F-101 | Otonan Calculator      | P0  | Calculate otonan (210-day birthday) from birthdate         |
| F-102 | Mesakapan/Jodoh        | P1  | Couple compatibility calculation based on urip and weton   |
| F-103 | Sasih Correction Admin | P1  | Admin panel to input official purnama/tilem dates per year |
| F-104 | Calendar Sync          | P2  | Export good days to Google Calendar / iCal                 |
| F-105 | User Accounts          | P2  | Save dates, set reminders, preferences                     |
| F-106 | API Tiers              | P1  | Free/Pro API access with rate limiting                     |

---

## 6. Scoring System

Each ceremony type uses the same 10-point scale but with different weights.

### 6.1 Scoring Weights per Ceremony

| Factor                    | Pawiwahan | Pitra Yadnya | Dewa Yadnya | Manusa Yadnya | Pembangunan | Usaha   |
| ------------------------- | --------- | ------------ | ----------- | ------------- | ----------- | ------- |
| Saptawara (good day)      | 2.0       | 1.5          | 1.5         | 2.0           | 1.5         | 1.5     |
| Wuku (not forbidden)      | 1.5       | 1.5          | 1.5         | 1.5           | 1.5         | 1.5     |
| Sasih (ceremony-specific) | 2.0       | 2.0          | 2.0         | 2.0           | 1.5         | 1.0     |
| Penanggal (not Pangelong) | 1.0       | 0.5          | 1.0         | 1.0           | 1.0         | 0.5     |
| Penanggal number          | 0.5       | 0.5          | 0.5         | 0.5           | 0.5         | 0.5     |
| Ingkel/Jejepan OK         | 0.5       | 0.5          | 0.5         | 0.5           | 0.5         | 0.5     |
| Sangawara (Tulus/Dadi)    | 1.0       | 1.0          | 1.0         | 1.0           | 1.0         | 1.0     |
| Dewasa Ayu Inti bonus     | 1.5       | 2.0          | 2.0         | 1.5           | 2.0         | 3.0     |
| Critical Ala penalty      | -1.0/ea   | -1.0/ea      | -1.0/ea     | -1.0/ea       | -1.0/ea     | -1.0/ea |
| Minor Ala penalty         | -0.3/ea   | -0.3/ea      | -0.3/ea     | -0.3/ea       | -0.3/ea     | -0.3/ea |

### 6.2 Rating Thresholds

- **Dewasa Ayu (Good):** Score ≥ 60% AND saptawara OK AND wuku not forbidden AND (penanggal for ceremony types that require it) AND no critical ala.
- **Tidak Baik (Bad):** Any critical ala present, OR (saptawara bad AND pangelong for ceremonies that require penanggal).
- **Kurang Ideal (Caution):** Everything else.

---

## 7. System Architecture & Tech Stack

### 7.1 Core Stack

| Layer    | Technology                            | Justification                                                         |
| -------- | ------------------------------------- | --------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router, Turbopack)    | SSR/SSG for SEO, React 19 Server Components, TypeScript native        |
| Backend  | NestJS 11                             | Modular architecture, TypeScript, DI, guards/pipes, Swagger auto-docs |
| Database | PostgreSQL                            | Relational, JSONB for flexible ceremony rules                         |
| ORM      | Prisma                                | Type-safe queries, migrations, seeding, zero-cost abstractions        |
| Cache    | Redis                                 | Calculation result cache, session store                               |
| Deploy   | Docker + Vercel (web) + Railway (api) | Containerized, auto-scaling, free tier available                      |
| Monorepo | Turborepo + pnpm                      | Build caching, parallel tasks, efficient disk usage                   |
| Testing  | Vitest + Playwright                   | Fast unit tests (Vitest), E2E browser tests (Playwright)              |
| CI/CD    | GitHub Actions                        | Automated testing, linting, deployment                                |

### 7.2 Frontend Libraries (Next.js)

Selected for accessibility across ALL age groups (young to elderly), performance, and modern DX.

#### 7.2.1 UI Component Library

| Library      | Purpose                              | Why This Choice                                                                                                       |
| ------------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| shadcn/ui    | Primary component library            | Copy-paste model (full code ownership), built on Radix UI, Tailwind CSS, WCAG accessible, zero lock-in                |
| Radix UI     | Accessible primitives (under shadcn) | Keyboard navigation, screen reader support, focus management, ARIA roles — all automatic. Critical for elderly users. |
| Tailwind CSS | Utility-first styling                | Easy responsive font sizes, high-contrast modes, spacing. rem-based units for font scaling.                           |

#### 7.2.2 Frontend Dependencies

| Library               | Purpose                  | Justification                                                                    |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------- |
| framer-motion         | Animations & transitions | Smooth transitions for young users. Supports prefers-reduced-motion for elderly. |
| next-themes           | Dark/Light mode toggle   | Young users prefer dark; elderly prefer light with high contrast.                |
| next-intl             | Internationalization     | Bahasa Indonesia (primary) + English. SSR-compatible.                            |
| react-day-picker      | Date picker component    | Fully accessible, keyboard navigable, large touch targets for elderly.           |
| @tanstack/react-query | Server state management  | Cache API responses, background revalidation, optimistic updates.                |
| nuqs                  | URL search params state  | Type-safe URL state for shareable links.                                         |
| sonner                | Toast notifications      | Lightweight, accessible notifications.                                           |
| recharts              | Score visualization      | Simple, accessible charts for score bars.                                        |
| lucide-react          | Icon library             | Clean, consistent, 1000+ icons. Tree-shakeable.                                  |
| next-seo              | SEO meta tags            | OG images for WhatsApp sharing.                                                  |
| @vercel/analytics     | Usage analytics          | Understand which ceremonies are most searched.                                   |

### 7.3 Backend Libraries (NestJS)

| Library                   | Purpose              | Justification                                 |
| ------------------------- | -------------------- | --------------------------------------------- |
| @nestjs/swagger           | API documentation    | Auto-generate OpenAPI docs from decorators.   |
| @nestjs/throttler         | Rate limiting        | Protect API from abuse. Tiered limits.        |
| @nestjs/cache-manager     | Caching layer        | Redis-backed cache for calendar computations. |
| cache-manager-redis-store | Redis adapter        | Production-grade Redis cache store.           |
| @nestjs/config            | Environment config   | Type-safe .env management.                    |
| class-validator           | DTO validation       | Decorator-based input validation.             |
| class-transformer         | DTO transformation   | Auto-transform request payloads.              |
| helmet                    | Security headers     | OWASP-recommended HTTP security.              |
| compression               | Response compression | Gzip API responses.                           |
| @nestjs/terminus          | Health checks        | /health endpoint for monitoring.              |
| nestjs-pino               | Structured logging   | JSON logs for production.                     |
| @nestjs/schedule          | Cron jobs            | Scheduled cache warming.                      |

### 7.4 Shared Packages (Monorepo)

| Package                    | Location                | Description                                                                         |
| -------------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| @dewasa-ayu/wariga-engine  | packages/wariga-engine  | Pure TypeScript calculation library. Zero external deps. Runs in browser + Node.js. |
| @dewasa-ayu/ceremony-rules | packages/ceremony-rules | Per-ceremony evaluation config objects.                                             |
| @dewasa-ayu/types          | packages/types          | Shared TypeScript interfaces.                                                       |
| @dewasa-ayu/constants      | packages/constants      | Static reference data: Wuku, Wewaran, Sasih tables.                                 |

### 7.5 Monorepo Structure

- `apps/web` — Next.js frontend (App Router, Tailwind CSS, shadcn/ui, Framer Motion)
- `apps/api` — NestJS backend (modules: calendar, ceremony, auth, admin)
- `packages/wariga-engine` — shared calculation library
- `packages/ceremony-rules` — per-ceremony evaluation configs
- `packages/types` — shared TypeScript interfaces
- `packages/constants` — static reference data
- `prisma/` — database schema, migrations, seed scripts
- `docker/` — Docker Compose for local dev (PostgreSQL + Redis)
- `turbo.json` — Turborepo pipeline configuration

### 7.6 Ceremony Rule Config Pattern

Each ceremony is a TypeScript config object:

```typescript
{ id, name, category, sasih_rules: { good: number[], bad: number[] }, dewasa_ayu: string[], dewasa_ala: string[], scoring_weights: {...}, saptawara_good: number[], require_penanggal: boolean }
```

Adding a new ceremony type requires only adding a new config file — no engine changes needed.

---

## 8. API Specification

### 8.1 Endpoints

| Method | Endpoint                                                               | Description                                   |
| ------ | ---------------------------------------------------------------------- | --------------------------------------------- |
| GET    | /api/v1/calendar/check?date=2026-04-06&ceremony=pawiwahan              | Full date info + ceremony-specific evaluation |
| GET    | /api/v1/calendar/month?year=2026&month=4&ceremony=pawiwahan            | Month view with per-day evaluation            |
| GET    | /api/v1/calendar/recommend?from=2026-04-06&count=10&ceremony=pawiwahan | Find N good days                              |
| GET    | /api/v1/calendar/range?from=...&to=...&ceremony=pawiwahan              | Evaluate date range                           |
| GET    | /api/v1/ceremonies                                                     | List all supported ceremony types             |
| GET    | /api/v1/dewasa?ceremony=pawiwahan                                      | List dewasa rules for a ceremony              |
| GET    | /api/v1/otonan?birthdate=1995-03-15&year=2026                          | Calculate otonan dates (Phase 2)              |

### 8.2 Response: /calendar/check

```json
{ "pawukon": {"wuku", "saptawara", "pancawara", "triwara", "sadwara", "astawara", "sangawara", "dasawara"}, "sasih": {"index", "name", "penanggal", "is_pangelong", "is_purnama", "is_tilem"}, "ingkel", "jejepan", "total_urip", "evaluation": {"ceremony", "rating", "score", "max_score", "pct", "checks[]", "dewasa_ayu[]", "dewasa_ala[]"} }
```

---

## 9. UI/UX Requirements

### 9.1 Design Direction

Dark, warm, sacred theme inspired by Balinese temple aesthetics. Gold (#C4A265) on dark (#0D0B08). Serif for headings (Cormorant Garamond), sans-serif for body (DM Sans). Ceremony selector is the primary navigation element.

### 9.2 Screens

| Screen            | Path                         | Key Components                                                                                            |
| ----------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Home / Check Date | /                            | Ceremony selector, date picker, result card with score bar, pawukon grid, dewasa tags, analysis checklist |
| Calendar          | /kalender                    | Ceremony selector, month calendar grid, color-coded days, click-for-detail                                |
| Recommendations   | /rekomendasi                 | Ceremony selector, date range + count input, sorted result list                                           |
| Date Detail       | /tanggal/[date]?ceremony=... | Full page shareable detail                                                                                |
| About Wariga      | /about                       | Full educational page                                                                                     |
| API Docs          | /api-docs                    | Swagger/OpenAPI documentation                                                                             |

### 9.3 Ceremony Selector UX

- Always visible at the top of every functional page
- Horizontal tabs on desktop, dropdown on mobile
- When changed, immediately re-evaluates all visible data
- Default: Pawiwahan
- Each shows icon + label: 💍 Pawiwahan, 🔥 Ngaben, 🙏 Dewa Yadnya, 👶 Manusa Yadnya, 🏠 Pembangunan, 💼 Usaha

### 9.4 Accessibility & Multi-Generational UX

#### 9.4.1 WCAG 2.1 AA Compliance

- All interactive elements: minimum 44x44px touch target
- Color contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text
- Calendar color coding: never rely on color alone
- Keyboard navigation: all features fully operable via keyboard
- Screen reader support: proper ARIA labels, live regions
- Focus indicators: visible, high-contrast focus rings

#### 9.4.2 Font & Readability

- Base font size: 16px minimum
- Use rem units — respects browser font-size preferences
- Font scaling toggle: Normal (16px), Large (18px), Extra Large (20px)
- Line height: minimum 1.5 for body, 1.3 for headings

#### 9.4.3 Theme Support

| Theme          | Target User              | Characteristics                              |
| -------------- | ------------------------ | -------------------------------------------- |
| Dark (default) | Young users, night usage | Gold on dark (#C4A265 on #0D0B08)            |
| Light          | Elderly users, outdoor   | Dark text on warm white (#1A1610 on #FDF8F0) |
| High Contrast  | Vision impaired          | Black on white, no decorative backgrounds    |

#### 9.4.4 Motion & Animations

- Framer Motion for page transitions
- MUST respect prefers-reduced-motion
- Loading states: skeleton screens (not spinners)

#### 9.4.5 Mobile UX (Elderly-Friendly)

- Bottom navigation bar on mobile
- Large ceremony selector buttons with icon + text (never icon-only)
- WhatsApp share button: prominent, one-tap
- Pull-to-refresh on calendar view

#### 9.4.6 Progressive Disclosure

Default: simplified result (rating + score + top 3 checks). "Lihat Detail Lengkap" expands to full data.

---

## 10. Calculation Engine

### 10.1 Package: @dewasa-ayu/wariga-engine

Pure TypeScript, zero external dependencies, runs in browser and Node.js.

| Function                                    | Input                  | Output                                     |
| ------------------------------------------- | ---------------------- | ------------------------------------------ |
| getPawukonDay(date)                         | Date                   | number (0-209)                             |
| getFullInfo(date)                           | Date                   | BalineseDate (all calendar components)     |
| getSasihInfo(date)                          | Date                   | SasihInfo                                  |
| detectDewasa(info, ceremonyId)              | BalineseDate, string   | { ayuList, alaList }                       |
| evaluate(info, ceremonyId)                  | BalineseDate, string   | Evaluation (rating, score, checks, dewasa) |
| findGoodDates(from, count, ceremonyId)      | Date, number, string   | EvaluatedDate[]                            |
| getMonthEvaluation(year, month, ceremonyId) | number, number, string | MonthData                                  |

### 10.2 Epoch & References

- Pawukon Epoch: June 11, 2012 (Gregorian) = Redite Sinta, day 1
- Derived from: January 6, 2013 = Saniscara Watugunung (day 210)
- All calculations = daysDiff(epoch, date) mod 210
- Sasih: Lunar approximation (29.53 days) from reference April 9, 2024 = Penanggal 1 Kadasa

### 10.3 Hierarchy of Padewasan

Wewaran < Wuku < Pangelong < Sasih < Dauh < Ning. Reflected in scoring weights.

---

## 11. Database Schema

| Table             | Purpose                             | Key Fields                                                                                  |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| ceremony_types    | Ceremony definitions + rules config | id, name, slug, category, description, rules (JSONB), icon                                  |
| dewasa_rules      | All dewasa ayu/ala definitions      | id, name, type (ayu/ala), condition (JSONB), description, severity, applicable_ceremonies[] |
| sasih_corrections | Official purnama/tilem dates        | id, tahun_saka, sasih_index, tilem_date, purnama_date, is_nampih                            |
| users             | User accounts (Phase 2)             | id, email, name, locale                                                                     |
| saved_dates       | User-saved dates                    | id, user_id, date, ceremony_type_id, notes                                                  |
| api_keys          | API key management                  | id, key_hash, tier, rate_limit                                                              |

---

## 12. Non-Functional Requirements

| Requirement     | Target                                          |
| --------------- | ----------------------------------------------- |
| Performance     | API p95 < 200ms, calendar render < 500ms        |
| Availability    | > 99.5% uptime                                  |
| Scalability     | 10K concurrent users, Redis caching             |
| SEO             | SSR/SSG, Core Web Vitals pass                   |
| Accessibility   | WCAG 2.1 AA                                     |
| Accuracy        | >99% Pawukon match vs kalenderbali.org          |
| Browser Support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Mobile          | Responsive from 320px, mobile-first             |
| i18n            | Bahasa Indonesia (primary), English (secondary) |

---

## 13. Validation & Testing Strategy

### 13.1 Reference Date Verification Matrix

| Field                    | Source of Truth                     | Tolerance                              |
| ------------------------ | ----------------------------------- | -------------------------------------- |
| Wuku name & number       | kalenderbali.org                    | Must be 100% exact match               |
| Saptawara                | kalenderbali.org                    | Must be 100% exact match               |
| Pancawara                | kalenderbali.org                    | Must be 100% exact match               |
| Triwara through Dasawara | kalenderbali.org / SakaCalendar lib | Must be 100% exact match               |
| Sasih name               | kalenderbali.org                    | 95% match (lunar estimation may drift) |
| Penanggal/Pangelong      | kalenderbali.org                    | 95% match                              |
| Ingkel                   | Calculated from Wuku                | Must be 100%                           |

### 13.2 Reference Dates (Test Suite Seed)

| Gregorian Date | Expected Wuku | Saptawara | Pancawara | Source               |
| -------------- | ------------- | --------- | --------- | -------------------- |
| 2024-01-01     | Krulut        | Soma      | Pon       | kalenderbali.org     |
| 2024-03-11     | Watugunung    | Soma      | Umanis    | kalenderbali.org     |
| 2024-04-09     | Ukir          | Anggara   | Kliwon    | kalenderbali.org     |
| 2025-01-01     | Prangbakat    | Buda      | Wage      | kalenderbali.org     |
| 2025-03-29     | Watugunung    | Saniscara | Umanis    | kalenderbali.org     |
| 2026-01-01     | Krulut        | Wraspati  | Pon       | kalenderbali.org     |
| ... (22+ more) | ...           | ...       | ...       | Expand before launch |

### 13.3 Test Categories

| Category               | Tool               | Coverage    | Description                                           |
| ---------------------- | ------------------ | ----------- | ----------------------------------------------------- |
| Unit: Pawukon          | Vitest             | 100%        | All wariga-engine functions against reference dates   |
| Unit: Sasih            | Vitest             | >95%        | Sasih estimation accuracy against known purnama/tilem |
| Unit: Dewasa Detection | Vitest             | 100%        | Every dewasa rule with known trigger conditions       |
| Unit: Scoring          | Vitest             | 100%        | Scoring per ceremony type, edge cases                 |
| Integration: API       | Vitest + Supertest | >90%        | All endpoints, response format, error handling        |
| E2E: UI                | Playwright         | >80%        | Critical user flows                                   |
| Cross-validation       | Custom script      | 30+ dates   | Engine output vs kalenderbali.org                     |
| Performance            | k6                 | p95 < 200ms | Load test under 100-1000 concurrent                   |

### 13.4 Continuous Validation

- CI pipeline runs full test suite on every PR
- Monthly cron: cross-validate next 30 days against kalenderbali.org
- User feedback widget: "Apakah hasil ini sesuai?" on every result

---

## 14. SEO & Content Strategy

### 14.1 Auto-Generated SEO Pages

| Page Pattern         | URL                                   | Content                                               |
| -------------------- | ------------------------------------- | ----------------------------------------------------- |
| Monthly per ceremony | /dewasa-ayu/[ceremony]/[year]/[month] | SSG calendar, top good/bad days, ceremony explanation |
| Yearly overview      | /dewasa-ayu/[ceremony]/[year]         | 12-month summary, best months                         |
| Daily detail         | /tanggal/[date]                       | Full Pawukon info + all ceremony evaluations          |
| Ceremony landing     | /upacara/[ceremony]                   | Evergreen educational page                            |

### 14.2 Structured Data (JSON-LD)

- FAQPage schema on About & ceremony landing pages
- Event schema on daily detail pages
- BreadcrumbList schema on all pages
- WebApplication schema on homepage

### 14.3 OG Image Generation

Auto-generate for social sharing (critical for WhatsApp). Show: date + Balinese info + ceremony icon + rating badge + score. Implementation: @vercel/og or Satori.

### 14.4 Content Calendar

- Auto-publish monthly SEO pages 6 months in advance
- SSG for monthly pages — rebuild nightly
- ISR for daily detail pages — revalidate every 24 hours

---

## 15. Offline & Low-Connectivity Support

### 15.1 PWA Architecture

| Feature             | Implementation                        | Priority |
| ------------------- | ------------------------------------- | -------- |
| Service Worker      | next-pwa or @serwist/next             | P0       |
| Offline calculation | wariga-engine bundled in client       | P0       |
| Offline calendar    | Cache current month + next 3 months   | P1       |
| App manifest        | Install as home screen app            | P0       |
| Background sync     | Queue actions when offline            | P2       |
| Cache strategy      | Network-first API, Cache-first static | P1       |

### 15.2 Offline Data Budget

- wariga-engine + ceremony-rules + constants: ~50KB gzipped
- Pre-computed cache (3 months, 6 ceremonies): ~200KB JSON
- Total offline footprint: <500KB

---

## 16. Error Handling & Edge Cases

### 16.1 Date Range Handling

| Scenario           | Behavior                                                           |
| ------------------ | ------------------------------------------------------------------ |
| Date before 1900   | Warning: accuracy not guaranteed. Engine still calculates.         |
| Date after 2100    | Warning: sasih may be inaccurate. Pawukon still accurate (cyclic). |
| Invalid date input | Validation error, prevent API call                                 |
| February 29        | Handle correctly (JavaScript Date native)                          |

### 16.2 Sasih Edge Cases

| Edge Case               | Handling                                                                  |
| ----------------------- | ------------------------------------------------------------------------- |
| Nampih/Mala Sasih       | Phase 1: detect via Tahun Saka mod 19, flag in UI. Phase 2: full support. |
| Sasih boundary          | Show note: "Tanggal ini di batas transisi sasih."                         |
| Pengalantaka            | Phase 1: not implemented. Phase 2: lookup table.                          |
| Tilem/Purnama exact day | Phase 1: estimated. Phase 2: admin inputs official dates.                 |

### 16.3 Calculation Conflicts

Days can have both Dewasa Ayu AND Ala simultaneously (e.g., Buda Kliwon = Subacara + Purwanin Dina). Show BOTH tags. Scoring applies bonuses and penalties independently.

### 16.4 API Error Responses

| HTTP Code | Scenario            | Response                                                                           |
| --------- | ------------------- | ---------------------------------------------------------------------------------- |
| 400       | Invalid date/params | `{ success: false, error: { code: "INVALID_DATE" } }`                              |
| 400       | Unknown ceremony    | `{ success: false, error: { code: "UNKNOWN_CEREMONY", valid_ceremonies: [...] } }` |
| 429       | Rate limited        | `{ success: false, error: { code: "RATE_LIMITED", retry_after: 3600 } }`           |
| 500       | Internal error      | `{ success: false, error: { code: "INTERNAL_ERROR" } }`                            |

---

## 17. Analytics & Feedback Loop

### 17.1 Event Tracking

| Event                    | Properties                       | Purpose                         |
| ------------------------ | -------------------------------- | ------------------------------- |
| ceremony_selected        | ceremony_id, source              | Most popular ceremonies         |
| date_checked             | date, ceremony_id, rating, score | Usage patterns                  |
| calendar_viewed          | year, month, ceremony_id         | Popular months                  |
| recommendation_requested | from_date, count, ceremony_id    | Recommendation usage            |
| result_shared            | date, ceremony_id, share_target  | Sharing behavior                |
| detail_expanded          | date, ceremony_id                | Progressive disclosure adoption |
| theme_changed            | from_theme, to_theme             | Theme usage across age groups   |
| font_size_changed        | from_size, to_size               | Accessibility feature usage     |

### 17.2 Accuracy Feedback Widget

On every result: "Apakah hasil ini sesuai dengan saran Sulinggih/Pemangku Anda?" — Yes / No / Belum Konsultasi. If "No": optional text field. Store in DB. Monthly review for consistently wrong rules.

---

## 18. Legal & Cultural Sensitivity

### 18.1 Terms of Use

- Platform provides REFERENCE calculations
- NOT a substitute for Sulinggih consultation
- Based on general Wariga rules, may not match regional variations
- Sasih calculations are estimations
- No guarantee of accuracy
- Not affiliated with PHDI or official religious organizations
- Limitation of liability

### 18.2 Cultural Sensitivity Guidelines

| Guideline                           | Implementation                              |
| ----------------------------------- | ------------------------------------------- |
| Never claim authority               | Always "berdasarkan pedoman Wariga umum"    |
| Respect tradition hierarchy         | Always recommend consulting Sulinggih       |
| Attribution                         | Credit all sources clearly                  |
| No monetization of sacred knowledge | Core features always free                   |
| Community validation                | Sulinggih review before launch              |
| Inclusive language                  | "disarankan/dihindari" not "dilarang/wajib" |
| Handling controversy                | Document both views, don't pick sides       |

### 18.3 Pre-Launch Validation Checklist

- [ ] Consult minimum 1 Sulinggih for Pawiwahan rules
- [ ] Consult minimum 1 Sulinggih for Pitra Yadnya rules
- [ ] Review all dewasa descriptions for cultural accuracy
- [ ] Verify all attributions
- [ ] Test with 5+ elderly Balinese users
- [ ] Legal review of Terms of Use
- [ ] SakaCalendar license compliance (LGPL-2.1)

---

## 19. User Flows

### 19.1 Flow A: Check Specific Date

**Scenario:** Calon pengantin checks if Oct 15, 2026 is good for wedding.

| Step | User Action                    | System Response                  | UI State                                                            |
| ---- | ------------------------------ | -------------------------------- | ------------------------------------------------------------------- |
| 1    | Opens dewasaayu.com            | Load homepage, default Pawiwahan | Ceremony selector active, date picker shows today                   |
| 2    | Selects Oct 15 2026            | Waits for submit                 | Date picker updated, Cek Hari button enabled                        |
| 3    | Taps "Cek Hari"                | Engine calculates (<50ms)        | Loading skeleton → Result card with rating, score bar, top 3 checks |
| 4    | Reads result: "Dewasa Ayu" 78% | Static display                   | Green badge, score bar at 78%                                       |
| 5    | Taps "Lihat Detail Lengkap"    | Expand animation                 | Full Pawukon grid, all dewasa tags, complete checklist              |
| 6    | Taps "Bagikan via WhatsApp"    | Generate share text + URL        | WhatsApp opens with pre-filled message                              |

### 19.2 Flow B: Find Good Dates

**Scenario:** Orang tua mencari hari baik ngaben dalam 2 bulan.

| Step | User Action                            | System Response                | UI State                            |
| ---- | -------------------------------------- | ------------------------------ | ----------------------------------- |
| 1    | Taps Pitra Yadnya button               | Re-initialize with Pitra rules | Ceremony highlighted, labels update |
| 2    | Taps "Rekomendasi" tab                 | Switch panel                   | Recommendation form visible         |
| 3    | Sets start date, count 10, taps "Cari" | Find 10 good days              | Loading → sorted list with scores   |
| 4    | Taps a date card                       | Expand detail                  | Full evaluation below card          |
| 5    | Wants to remember                      | Copy/share                     | Share options shown                 |

### 19.3 Flow C: Browse Calendar

**Scenario:** Wedding planner overviews October for slots.

| Step | User Action                  | System Response             | UI State                  |
| ---- | ---------------------------- | --------------------------- | ------------------------- |
| 1    | Taps "Kalender" tab          | Render current month        | Calendar grid with colors |
| 2    | Navigate to October 2026     | Re-compute 31 days          | Calendar updates          |
| 3    | Taps green day (Oct 8)       | Show detail below           | Detail card slides in     |
| 4    | Switches ceremony to "Usaha" | Re-evaluate entire calendar | Colors change             |

### 19.4 Flow D: First-Time Elderly User

**Scenario:** Kakek 65 tahun opens WhatsApp link from grandchild.

| Step | User Action                 | System Response                             | UI State                                |
| ---- | --------------------------- | ------------------------------------------- | --------------------------------------- |
| 1    | Taps WhatsApp link          | Open /tanggal/2026-10-15?ceremony=pawiwahan | Result immediately visible              |
| 2    | Reads (small text)          | Detect: no preference saved                 | If daytime: Light theme default         |
| 3    | Struggles with text         | N/A                                         | Font size toggle (Aa) visible in header |
| 4    | Wants to check another date | N/A                                         | "Cek Tanggal Lain" button at bottom     |

---

## 20. State Management Strategy

### 20.1 State Categories

| State            | Storage               | Persistence                | Shareable | Examples                                |
| ---------------- | --------------------- | -------------------------- | --------- | --------------------------------------- |
| URL State        | URL params (nuqs)     | Survives refresh + sharing | Yes       | ?date=2026-10-15&ceremony=pawiwahan     |
| UI State         | React useState        | Lost on refresh            | No        | Expanded/collapsed, loading, animation  |
| User Preferences | localStorage          | Survives sessions          | No        | Theme, font size, last ceremony, locale |
| Server Cache     | @tanstack/react-query | TTL-based                  | No        | API responses                           |
| Offline Cache    | Service Worker        | Survives offline           | No        | Static assets, pre-computed data        |

### 20.2 URL State Specification

| Param    | Type        | Default       | Used In                 |
| -------- | ----------- | ------------- | ----------------------- |
| ceremony | enum string | pawiwahan     | All pages               |
| date     | YYYY-MM-DD  | today         | Check date, date detail |
| month    | 1-12        | current month | Calendar                |
| year     | number      | current year  | Calendar                |
| from     | YYYY-MM-DD  | today         | Recommendations         |
| count    | 5\|10\|20   | 10            | Recommendations         |

### 20.3 Behavior on State Change

| Trigger              | Behavior                                                                   |
| -------------------- | -------------------------------------------------------------------------- |
| Ceremony changed     | Update URL. Re-evaluate all visible data. Preserve date/month.             |
| Page refresh         | Restore from URL params. UI state resets.                                  |
| Browser back/forward | Restore previous URL state. Smooth transition.                             |
| Theme/font change    | Save to localStorage. Apply immediately. No URL change.                    |
| Share link opened    | Load ceremony + date from URL. Apply receiver's own theme/font.            |
| First visit          | Default: pawiwahan, theme=auto (dark if night, light if day), font=normal. |

---

## 21. Competitive Analysis

| Platform                           | Type    | Strengths                                | Weaknesses                                                       | Our Differentiator                                                     |
| ---------------------------------- | ------- | ---------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| kalenderbali.org                   | Web     | Most trusted, comprehensive dewasa data  | UI dated, not mobile-friendly, no ceremony filtering, no scoring | Modern UX, ceremony-specific evaluation, scoring, recommendations, PWA |
| kalenderyadnya.com                 | Web     | Multi-yadnya, upakara banten info, RAB   | Newer, complex UI                                                | Simpler focused UX, better accessibility                               |
| Kalender Bali Lengkap (Play Store) | Android | Offline, otonan, mesakapan, good reviews | Android only, subscription, no API                               | Web-first, free core, public API, SEO                                  |
| Physical Kalender Bali             | Print   | Trusted, tactile                         | Static, no search/filter                                         | Dynamic, searchable, accessible worldwide                              |
| Consulting Sulinggih               | Human   | Authoritative, personal                  | Time, cost, access                                               | Complement: pre-filter then consult                                    |

---

## 22. Performance Budget

### 22.1 Core Web Vitals

| Metric    | Target  | Enforcement                      |
| --------- | ------- | -------------------------------- |
| LCP       | < 2.5s  | Lighthouse CI in GitHub Actions  |
| FID / INP | < 100ms | Lighthouse CI + Vercel Analytics |
| CLS       | < 0.1   | Skeleton screens prevent CLS     |
| TTFB      | < 200ms | Vercel Edge + Redis cache        |

### 22.2 Bundle Size Budget

| Asset             | Max (gzipped) | Action if Exceeded              |
| ----------------- | ------------- | ------------------------------- |
| Initial JS bundle | < 150KB       | Code splitting, dynamic imports |
| wariga-engine     | < 30KB        | No external deps policy         |
| ceremony-rules    | < 10KB        | JSON configs only               |
| Tailwind CSS      | < 30KB        | Ensure purge config             |
| Framer Motion     | < 25KB        | Only import used features       |
| Total first load  | < 250KB       | CI bundle-analyzer check        |
| Fonts             | < 60KB        | Subset to Latin + Extended      |

### 22.3 API Performance Budget

| Endpoint            | p50    | p95    | p99     |
| ------------------- | ------ | ------ | ------- |
| /calendar/check     | <30ms  | <100ms | <200ms  |
| /calendar/month     | <100ms | <300ms | <500ms  |
| /calendar/recommend | <200ms | <500ms | <1000ms |
| /ceremonies         | <10ms  | <30ms  | <50ms   |

---

## 23. Deployment & Environment

### 23.1 Environments

| Environment | URL                   | Infrastructure                                    |
| ----------- | --------------------- | ------------------------------------------------- |
| Development | localhost:3000/3001   | Docker Compose (PG + Redis)                       |
| Staging     | staging.dewasaayu.com | Vercel Preview + Railway staging + Neon + Upstash |
| Production  | dewasaayu.com         | Vercel Production + Railway prod + Neon + Upstash |

### 23.2 Infrastructure Cost

| Component  | Service                        | Estimated Cost |
| ---------- | ------------------------------ | -------------- |
| Frontend   | Vercel                         | Free for MVP   |
| Backend    | Railway                        | $5-20/mo       |
| PostgreSQL | Neon                           | Free for MVP   |
| Redis      | Upstash                        | Free for MVP   |
| Domain     | Namecheap/Cloudflare           | ~$10/year      |
| SSL/CDN    | Vercel/Cloudflare              | Free           |
| Monitoring | Vercel Analytics + UptimeRobot | Free           |
| Errors     | Sentry                         | Free for MVP   |

**Total MVP: $5-25/month**

### 23.3 CI/CD Pipeline

| Stage             | Trigger            | Actions                                |
| ----------------- | ------------------ | -------------------------------------- |
| Lint & Type Check | Every push         | ESLint + TypeScript strict + Prettier  |
| Unit Tests        | Every push         | Vitest across all packages             |
| Bundle Analysis   | Every PR           | next/bundle-analyzer, fail if exceeded |
| Lighthouse CI     | PR to main         | Core Web Vitals check                  |
| E2E Tests         | PR to main         | Playwright critical flows              |
| Deploy Staging    | Merge to main      | Auto-deploy, cross-validation          |
| Deploy Production | Manual trigger/tag | Deploy after staging verification      |

---

## 24. Data Seeding & Migration

### 24.1 Seed Data

| Table             | Source                      | Format                                               |
| ----------------- | --------------------------- | ---------------------------------------------------- |
| ceremony_types    | ceremony-rules package      | TypeScript → Prisma upsert                           |
| dewasa_rules      | Curated from Wariga sources | JSON: prisma/seed-data/dewasa-rules.json             |
| sasih_corrections | Published Kalender Bali     | JSON: prisma/seed-data/sasih-corrections-[year].json |

### 24.2 Sasih Correction Format

```json
{
  "tahun_saka": 1948,
  "tahun_masehi_start": 2026,
  "sasih_index": 3,
  "sasih_name": "Kapat",
  "tilem_date": "2026-10-21",
  "purnama_date": "2026-10-07",
  "is_nampih": false,
  "source": "kalenderbali.org"
}
```

### 24.3 Migration Strategy

- Prisma Migrate for schema changes
- Seed script is idempotent (uses upsert)
- Data-only updates: commit new JSON, run seed

---

## 25. Versioning & Changelog

### 25.1 API Versioning

- URL-based: /api/v1/..., /api/v2/...
- Breaking changes: new major version, old maintained 6 months
- Non-breaking: additive fields, same version
- Response includes X-API-Version and X-Engine-Version headers

### 25.2 Engine Versioning (Semver)

| Change                  | Bump  | Backward Compatible? |
| ----------------------- | ----- | -------------------- |
| New dewasa rule         | Minor | Yes                  |
| Scoring weight adjusted | Patch | Yes                  |
| New ceremony type       | Minor | Yes                  |
| Algorithm changed       | Major | No                   |
| Bug fix (wrong calc)    | Patch | Treated as bug fix   |

### 25.3 Feature Flags

- Env vars as simple flags: NEXT_PUBLIC_FF_NAMPIH_SASIH=true
- Beta ceremonies: `{ id: 'rsiYadnya', beta: true }` — shown with "Beta" badge

---

## 26. Roadmap

| Phase                  | Timeline   | Deliverables                                                              |
| ---------------------- | ---------- | ------------------------------------------------------------------------- |
| 0: Setup               | Week 1-2   | Monorepo, CI/CD, Docker, Prisma, seed data, linting                       |
| 1: Engine              | Week 3-5   | wariga-engine + 6 ceremony configs + 30-date test suite                   |
| 2: API                 | Week 5-7   | NestJS endpoints, Swagger, Redis, rate limiting, error handling           |
| 3: Frontend Core       | Week 7-10  | All screens, ceremony selector, dark/light, responsive, URL state         |
| 4: Content & SEO       | Week 10-12 | About page, SEO pages, OG images, structured data, sitemap                |
| 5: Accessibility       | Week 12-13 | Font scaling, high contrast, keyboard nav, screen reader, elderly testing |
| 6: PWA & Offline       | Week 13-14 | Service worker, offline calc, app manifest                                |
| 7: Analytics           | Week 14-15 | Event tracking, feedback widget, dashboard                                |
| 8: Validation & Launch | Week 15-17 | Sulinggih consultation, cross-validation, Terms of Use, soft launch       |
| 9: Phase 2             | Week 18+   | Otonan, Mesakapan, user accounts, admin UI, calendar sync                 |

---

## 27. Risks & Mitigations

| Risk                               | Impact | Likelihood | Mitigation                                              |
| ---------------------------------- | ------ | ---------- | ------------------------------------------------------- |
| Sasih inaccuracy                   | High   | Medium     | sasih_corrections table, monthly cross-validation       |
| Wariga interpretation differences  | Medium | High       | Consult Sulinggih, configurable rules, disclaimer       |
| Users replacing Sulinggih with app | Medium | Medium     | Clear disclaimer, educational framing                   |
| Regional rule variations           | Medium | High       | Start general, future regional config                   |
| Cultural backlash                  | High   | Low        | Core free, proper attribution, Sulinggih endorsement    |
| Performance over budget            | Medium | Low        | CI enforcement, Redis, SSG                              |
| Low elderly adoption               | Medium | Medium     | Light theme, WhatsApp, PWA, large fonts                 |
| Nampih Sasih errors                | Medium | Medium     | Phase 1: flag. Phase 2: lookup table.                   |
| State sync issues                  | Low    | Medium     | Defined strategy, E2E tests                             |
| Competitor launches similar        | Low    | Low        | Differentiators: open-source engine, API, accessibility |

---

## 28. References

| Source                                                 | Type                                        |
| ------------------------------------------------------ | ------------------------------------------- |
| Lontar Wariga Catur Winasa Sari                        | Primary traditional source                  |
| Dasar Wariga & Tenung Wariga — I.B. Putra Manik Aryana | Reference books                             |
| Pokok-pokok Wariga — I.B. Supartha Ardana              | Reference book                              |
| SakaCalendar (github.com/edysantosa/sakacalendar)      | Open source library (LGPL-2.1)              |
| kalenderbali.org / kalenderbali.info                   | Digital Balinese calendar — validation      |
| babadbali.com                                          | Wewaran calculation reference               |
| sastrabali.com                                         | Dewasa Ayu dalam Veda, Wariga formulas      |
| cakepane.blogspot.com                                  | Detailed Pawiwahan dewasa rules             |
| payanadewa.com                                         | Dewasa Ayu Nganten guidelines               |
| einvite.id                                             | Dewasa Ayu Pernikahan & Manusa Yadnya lists |
| kalenderyadnya.com                                     | Multi-yadnya dewasa reference               |
| Wikipedia — Pawukon Calendar                           | Cycle math & JDN correspondence             |
| Lontar Komputer Vol.5 (UNUD)                           | Fuzzy logic wedding day determination       |
| Dr. I Gede Sutarya (UHN Sugriwa)                       | Expert source on Wariga & dewasa ayu        |
