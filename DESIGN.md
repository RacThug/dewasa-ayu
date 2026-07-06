# DESIGN.md — Dewasa Ayu

> Aesthetic philosophy and signature patterns for the Dewasa Ayu platform. This file is the north star for visual decisions, complementing [UI-001](./docs/specs/pages.md) (technical token contract) and informing AI agents producing frontend code. Read this before writing or generating any user-facing surface.

**Status:** Active · **Version:** 0.3.0 · **Updated:** 2026-07-06

---

## Aesthetic philosophy

**Pananggalan — the Balinese wall calendar, reborn as software.**

The printed Balinese calendar (kalender Bali cetak) is the artefact this audience actually uses: it hangs in nearly every Balinese household, it is read daily by every generation, and it is the object Rac himself verifies the engine against. The platform inherits its visual language: **black ink and cinnabar red on bright paper**, dense-but-ordered tabular information, oversized date numerals that carry the hierarchy, and small notation marks that reward familiarity. The feeling to evoke: _"this reads like the calendar on my wall — but it answers my question."_

The platform is **not** a nostalgic replica and **not** a newspaper pastiche. What it borrows from the printed calendar is _functional density_ (a month at a glance), _honest notation_ (marks with a legend, not decoration), and _the authority of the familiar_ (elderly users already know how to read a calendar grid — zero learning curve). What it deliberately drops: the clutter of ads, the cramped spacing, and any claim of religious authority — red marks a _suggestion_, never a commandment.

Guardrails that keep this direction distinctive rather than generic:

- **Duotone discipline.** Ink and red on paper. Red is the only hue; the semantic greens/ambers of a typical status UI do not exist here (see Color). A page that needs a third hue is a page that needs editing.
- **The numeral is the hero.** Dates are typeset huge in a Clarendon-style slab serif — like the numerals dominating each cell of the printed calendar. Numbers feel _printed_, not _rendered_.
- **Notation, not decoration.** Every mark (●, ◐, ✕, PUR, TIL) appears in a legend and encodes data. There are no ornamental fields, no mandalas, no tropical imagery.
- **No claim to authority.** Visual gravitas belongs to the source (Wariga, Sulinggih), not the platform. Red highlights and stamps present _suggestions_ — the voice stays humble (see Voice & tone).

A reader should feel the platform was made by someone who grew up with the wall calendar — not by a tourism brand, and not by a template.

### Core principles

1. **Calendar-first.** The month grid is the home screen's centre of gravity; checking a single date is a tap on the grid, not a separate form. Utility beats narrative.
2. **Paper (light) is the default; Malam (dark) is the companion.** A wall calendar is paper — the light theme is canonical. The dark theme keeps the same print language on warm near-black (see Color). Respect OS `prefers-color-scheme`; both are first-class.
3. **Type carries the design.** The slab-serif numeral scale and the grotesque label system do the visual work; color is a single red accent.
4. **Notation is honest.** Every visual signal (mark, red numeral, stamp) is legend-explained and color is never the only channel (WCAG 1.4.1).
5. **Density with breathing room.** Print-calendar information density, web-era spacing. Rows and cells are generous enough for elderly thumbs (44 px minimum touch targets).

## Voice & tone

Indonesian primary (per project cultural rules). Voice is:

- **Humble.** Phrases like "berdasarkan pedoman Wariga umum", "estimasi" where applicable, "saran Sulinggih". Never absolute claims.
- **Scholarly, not academic.** Plain Indonesian with proper terminology. Italicise Sanskrit/Old-Javanese terms (Wariga, Pawukon, Sasih, Dewasa Ayu, Pangelong) but do not over-explain.
- **Encouraging, not commanding.** "Disarankan" / "dihindari" — never "dilarang" / "wajib".
- **Respectful of disagreement.** Where traditions vary, surface that fact rather than picking sides.
- **Calm rhythm.** The verdict is one clear sentence; detail unfolds below it in reading order.

### Microcopy patterns

| Context                             | Example                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Result is favourable                | "Ayu — disarankan untuk pawiwahan" (not "Hari Baik!" or "Boleh menikah!")                                                            |
| Result is unfavourable              | "Kurang ideal — pertimbangkan tanggal lain" (not "Hari Jelek!" or "Jangan!")                                                         |
| Critical inauspicious sign          | "Terdapat pantangan kuat. Disarankan untuk berkonsultasi dengan Sulinggih."                                                          |
| Sasih estimated, no correction data | "Sasih perkiraan — dapat berbeda dengan kalender resmi tahun ini."                                                                   |
| Default disclaimer (always visible) | "Platform ini memberikan perhitungan referensi berdasarkan pedoman Wariga umum, bukan pengganti konsultasi Sulinggih atau Pemangku." |

## Color palette

The Pananggalan palette starts from printed ink on calendar paper. Two hues only: ink and cinnabar red. **Rating is encoded by notation + red/ink/faded treatment, not by green/amber/red traffic lights** — exactly like the printed calendar, where red marks the special days and everything else is ink.

### Paper theme (default — `light` in UI-001)

| Token       | Hex       | Role                                                                |
| ----------- | --------- | ------------------------------------------------------------------- |
| `paper`     | `#FCFBF7` | Page background — bright calendar paper (warmer than pure white)    |
| `paper-2`   | `#F3EFE5` | Recessed surfaces, out-of-month cells, hover washes                 |
| `rule`      | `#D9D2C2` | Grid lines, hairline dividers                                       |
| `ink`       | `#191613` | Primary text and strong borders — near-black ink                    |
| `ink-soft`  | `#5D564C` | Secondary text                                                      |
| `ink-faint` | `#847C6E` | Tertiary text, metadata, faded (avoided) day numerals (AA on paper) |
| `red`       | `#B23A26` | Cinnabar — ayu marks, active states, emphasis (AA as text on paper) |
| `red-deep`  | `#8E2B1B` | Red text at small sizes, hover on red                               |
| `red-wash`  | `#F6E9E4` | Selected-day background, red-tinted surfaces                        |

### Malam theme (companion — `dark` in UI-001)

The same print language at night: ink and paper swap, red brightens to stay legible.

| Token       | Hex       | Role                                 |
| ----------- | --------- | ------------------------------------ |
| `paper`     | `#171412` | Page background — warm near-black    |
| `paper-2`   | `#211D19` | Recessed surfaces                    |
| `rule`      | `#3B352C` | Grid lines                           |
| `ink`       | `#EDE7DA` | Primary text — paper-cream ink       |
| `ink-soft`  | `#B3AB9C` | Secondary text                       |
| `ink-faint` | `#8F877A` | Tertiary text (AA on the dark paper) |
| `red`       | `#E07A5F` | Cinnabar, brightened for AA on dark  |
| `red-deep`  | `#EDA18C` | Red hover/large accents on dark      |
| `red-wash`  | `#33221D` | Selected-day background              |

### Rating treatment (both themes — notation carries the signal)

| Rating    | Numeral color | Mark | Extra                                   |
| --------- | ------------- | ---- | --------------------------------------- |
| `ayu`     | `red`         | ●    | Like rerainan on the printed calendar   |
| `caution` | `ink`         | ◐    | The default, unremarkable day           |
| `bad`     | `ink-faint`   | ✕    | Faded, struck — present but discouraged |

Purnama/Tilem carry a small red `PUR`/`TIL` label in the cell. Marks always ship with the legend; color is never the only signal (WCAG 1.4.1).

### High-contrast variant

Pure black ink on pure white paper (and inverse on dark). Red is kept **only** for non-text marks and gains underline/weight reinforcement; border widths step up (1 px → 2 px). Activated by `prefers-contrast: more` or the explicit toggle, same mechanics as v0.2.x.

## Typography

Two faces with print-calendar discipline. Numbers do the talking.

| Use                                      | Family                                                             | Notes                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Date numerals, scores, month name, brand | **Besley** (Clarendon-style slab) 700/800                          | The signature voice — numerals at 40–96 px on the detail panel          |
| Section headings (h2)                    | Besley 800, 22–26 px                                               | Sparingly; most hierarchy is size + rules                               |
| Body, explanations                       | **Libre Franklin** 400                                             | 16 px base (never below); 1.55 line height                              |
| UI labels, tabs, buttons                 | Libre Franklin 600, 13–15 px                                       | Sentence case; letter-spacing only on uppercase eyebrows                |
| Metadata, captions, legend               | Libre Franklin 400/600, 12–13 px, `ink-soft`/`ink-faint`           | Uppercase eyebrows get 0.08–0.14 em tracking                            |
| Balinese terms (wewaran, sasih names)    | Libre Franklin, capitalised (e.g. "Soma Kliwon"); italics optional | The printed calendar does not italicise them — neither do we by default |

Rules:

- **Numbers are slab, always.** A score of 60 is Besley 800 at 44 px with a small `/100`; a date is Besley 800. Numbers are never medium-weight sans.
- **`font-variant-numeric: tabular-nums`** wherever digits align (grid, tables, scores).
- **No italics for emphasis in UI copy** — use Libre Franklin 600 or red. Italics are reserved for the disclaimer's _Catatan_ voice and Latin-script Sanskrit terms in long-form prose.
- **Font-scale system stays**: `--font-base` driven by the header toggle (16 → 18 → 20 px), persisted, applied pre-paint.

## Layout DNA

- **Calendar-first home.** Order: ceremony tabs → month bar (huge month name + tally + nav) → month grid → detail panel for the selected date → nearest good days → about. One page, reading order = usage order.
- **The grid is a table.** Real bordered cells (1 px `rule`), weekday header row with Indonesian + Balinese day names (Min/Redite … Sab/Saniscara). Cells: numeral + pancawara abbreviation + notation mark; 44 px+ touch targets.
- **The detail panel is "the turned page."** A 1.5 px ink-bordered panel: oversized date numeral (red when ayu), wewaran headline, stamp verdict, score fraction, five-factor table with dotted leaders, padewasan tags, estimasi footnote.
- **Red band at the very top of every page** (6 px) — the calendar's binding strip; instant brand recognition.
- **Masthead like a calendar header**: wordmark left (Besley, "Ayu" in red), Saka year/sasih note right, 2 px ink rule beneath.
- **Generous margins**: mobile 20 px gutters; content column max 760 px, centred. Long-form pages (About, upacara) stay at 640 px reading width.
- **Vertical rhythm in 8 px units**; spacing scale 4/8/16/24/40/64.
- **Radius is minimal**: 0–3 px. Print doesn't round corners; the stamp badge (3 px) is the exception that proves it.
- **Mobile first.** Readable at 360 px; the grid drops pancawara abbreviations below 560 px rather than shrinking touch targets.

## Signature patterns

Five touches that make the platform recognisable. **Always present**; everything else can vary.

### 1. The tika notation system

Every calendar cell carries one mark — ● (ayu, red), ◐ (caution, ink), ✕ (avoided, faded) — echoing the tika's woven symbols. Marks come with a visible legend directly under the grid. `PUR`/`TIL` label Purnama/Tilem in small red caps.

### 2. The stamp verdict

The verdict is a rubber-stamp-style badge: 2.5 px red border, uppercase Libre Franklin 600 with wide tracking, rotated −2°, slightly imperfect edge (mask). Reads "AYU — DISARANKAN" / "CUKUP — DENGAN CATATAN" / "KURANG IDEAL". It is the one theatrical element on the page; everything around it stays quiet.

### 3. Number-as-print

The selected date is an oversized Besley numeral (72–92 px, red when ayu) with a small uppercase month label beneath — exactly like tearing a page off a daily calendar. Scores render as slab fractions: **60**/100.

### 4. The red band + masthead rule

6 px red band at the viewport top, wordmark masthead, 2 px ink rule. Every page of the product opens like the calendar's header board.

### 5. Quiet disclaimer footer (always visible)

The Sulinggih disclaimer sits at the bottom of every page in Libre Franklin 12.5 px `ink-soft` above a 2 px ink rule. Never collapsed, never hidden behind an icon. The platform admits its limits openly — that admission is part of the design.

## Imagery and iconography

- **No stock photography of Bali.** No photography of Sulinggih or ceremonies.
- **Icons:** custom line-drawn, 1.5 px stroke, monochrome `currentColor`. The existing custom ceremony glyphs stay.
- **No emoji in product UI.**
- **OG share images:** paper background, red band top, huge Besley date numeral, stamp-style verdict text, ceremony label. Generated via `next/og`.

## Motion

Print is still; motion is functional and brief.

- **Selection swap** (tapping a day): detail panel fades/translates 6 px, 200–250 ms ease-out.
- **Stamp impression**: on first render of a verdict, the stamp scales 1.06 → 1 with a quick opacity snap (~180 ms) — a press, not a bounce. Once per selection.
- **Grid/tabs hover**: background wash only, no transforms.
- No ambient/looping animation anywhere. All motion respects `prefers-reduced-motion: reduce` (instant state changes).

## Layout / component map

| Component (UI-001)    | Pananggalan treatment                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `<RootLayout>`        | Red band → masthead (wordmark + Saka note) → 2 px ink rule; quiet disclaimer footer.                                   |
| `<CeremonySelector>`  | Print tabs: Libre Franklin 600, 3 px red underline on the active tab, horizontal scroll on mobile. No pills.           |
| `<CalendarGrid>`      | Bordered table cells; Besley numerals (red = ayu, faded = avoided); pancawara abbreviation; tika mark; PUR/TIL labels. |
| `<DatePicker>`        | Paper surface, ink text, red for today/selected; trigger styled as a print field inside the month bar.                 |
| `<ScoreBar>`          | Replaced by the slab fraction (**60**/100) beside the stamp; no meter bar.                                             |
| `<ResultCard>`        | The detail panel: big numeral + wewaran headline + stamp + factor table with dotted leaders.                           |
| `<AnalysisChecklist>` | Table rows: ✓/✗ (red/ink-faint), factor name 600, value, right-aligned "bobot n" metadata.                             |
| `<DewasaTagList>`     | Small bordered tags, red border for mendukung, faded for perlu diperhatikan. No filled pills.                          |
| `<PawukonGrid>`       | Dotted-leader definition rows inside the detail panel (term left, value right).                                        |
| `<DisclaimerBanner>`  | Libre Franklin 12.5 px `ink-soft`, 2 px ink rule top.                                                                  |

## Reconciliations with existing tokens

v0.3.0 replaces the Lontar palette and faces wholesale:

- **Default theme flips to light (paper).** Malam becomes the companion. `next-themes` mapping (`data-theme='night'|'paper'`) can keep its attribute values to avoid breaking stored preferences, but the _default_ and the palettes behind the tokens change.
- **Token names change:** `ochre/gold → red`, `ember → ink` (dark values move under the same semantic names). Semantic trio (`ayu/caution/ala`) collapses into the **rating treatment** (red / ink / faded + marks) — the green is retired.
- **Fonts:** Cormorant Garamond → **Besley**; DM Sans → **Libre Franklin**.
- UI-001's token section needs a minor-version bump + migration table (separate docs PR after the rebuild lands).

## When to invoke `frontend-design`

This file informs every visual decision. When generating HTML, JSX, or CSS for the project, invoke the `frontend-design` skill **and pass this file as context**. Do not invoke `frontend-design` to make decisions for this file — this file is the decision; `frontend-design` is the implementation.

## Open questions

- **Aksara Bali.** If dewasa names in Balinese script land, we need Noto Sans Balinese or similar. Defer until a real use case.
- **Wuku strip.** The printed calendar shows the running wuku above each week row. Worth adding to the grid once the month API exposes per-week wuku conveniently — strong authenticity win, small density cost.
- **OG image font.** Verify Besley subsets work in `next/og`; fall back to a system slab if not.
- **Print stylesheet.** A calendar UI begs to be printed; a `@media print` pass is cheap and very on-brand. Backlog.

## Changelog

- v0.3.0 — 2026-07-06 — **Total redesign: "Pananggalan" (printed Balinese wall-calendar language) replaces "Lontar manuscript revival."** Decision made after Rac rejected the Lontar/Senja UI on all axes (generic, flow, direction, flatness) and picked Pananggalan from three exploration mockups (vs "Tenun" endek-weave and "Embun" dawn-field). New: duotone ink+cinnabar palette (paper default, Malam companion), Besley + Libre Franklin, calendar-first layout DNA, five new signature patterns (tika notation, stamp verdict, number-as-print, red band, quiet disclaimer — the last carried over). Voice & tone and cultural guardrails unchanged.
- v0.2.1 — 2026-06-10 — WCAG AA pass + high-contrast variant implemented (Lontar era).
- v0.2.0 — 2026-05-29 — Night (lamplight) theme promoted to default (Lontar era).
- v0.1.0 — 2026-05-28 — Initial DESIGN.md; Lontar manuscript revival direction chosen.
