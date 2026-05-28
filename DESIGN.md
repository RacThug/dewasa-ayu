# DESIGN.md — Dewasa Ayu

> Aesthetic philosophy and signature patterns for the Dewasa Ayu platform. This file is the north star for visual decisions, complementing [UI-001](./docs/specs/pages.md) (technical token contract) and informing AI agents producing frontend code. Read this before writing or generating any user-facing surface.

**Status:** Draft · **Version:** 0.1.0 · **Updated:** 2026-05-28

---

## Aesthetic philosophy

**Lontar manuscript revival — a quiet, scholarly platform with reverence for source.**

The lontar (palm-leaf manuscript) is the canonical physical artefact of Wariga knowledge in Bali. The platform inherits its visual mood: warm cream surfaces like aged palm leaf, sepia and ochre ink, deliberate hand-feel touches in the ornaments, generous breathing room between lines, and typography that signals "this content is to be read carefully, not skimmed."

The platform is **not** a temple replica. It does not lean on dark Black + Gold "luxury" aesthetics, nor on tropical-Bali stock photography, nor on overt mandala motifs. Those signals risk exotifying Wariga or reducing it to surface decoration. Instead the platform borrows what manuscripts give: *patience*, *reverence for the page*, *typographic hierarchy as the primary visual instrument*.

A reader should feel that the platform was made by someone who has spent time with the source — not by a tourism brand.

### Core principles

1. **Type carries the design.** Decisions about hierarchy, mood, and emphasis are typographic first; color and ornament are secondary.
2. **Cream is the default, dark is the variant.** The light "paper" theme is canonical. The dark theme exists for night reading, not as a stylistic default.
3. **Ornament is restrained and intentional.** A hand-drawn divider here, a small marginal glyph there — never decorative fields or background patterns.
4. **Color is the smallest channel.** Sepia for normal content, ochre/gold only for emphasis. Semantic colors (ayu green, ala red, neutral blue) are muted and never saturated.
5. **No claim to authority.** Visual gravitas is for the *source* (Wariga, Sulinggih), not the platform. Avoid imposing fonts, large headlines that "shout", or any tone that says "trust us."

## Voice & tone

Indonesian primary (per project cultural rules). Voice is:

- **Humble.** Phrases like "berdasarkan pedoman Wariga umum" (based on common Wariga guidance), "estimasi" (estimate) where applicable, "saran Sulinggih" (suggested by Sulinggih). Never absolute claims.
- **Scholarly, not academic.** Plain Indonesian with proper terminology. Italicise Sanskrit/Old-Javanese terms (Wariga, Pawukon, Sasih, Dewasa Ayu, Pangelong) but do not over-explain — the user is assumed to recognise the vocabulary or want to learn it.
- **Encouraging, not commanding.** "Disarankan" / "dihindari" — never "dilarang" / "wajib".
- **Respectful of disagreement.** Where traditions vary, surface that fact (e.g., "Sasih estimasi; berbeda dengan kalender daerah tertentu") rather than picking sides.
- **Calm rhythm.** Sentences run slightly longer than typical web copy. The page should feel like reading, not scanning.

### Microcopy patterns

| Context | Example |
|---------|---------|
| Result is favourable | "Dewasa Ayu — disarankan untuk pawiwahan" (not "Hari Baik!" or "Boleh menikah!") |
| Result is unfavourable | "Kurang ideal — pertimbangkan tanggal lain" (not "Hari Jelek!" or "Jangan!") |
| Critical inauspicious sign | "Terdapat pantangan kuat. Disarankan untuk berkonsultasi dengan Sulinggih." |
| Sasih estimated, no correction data | "Sasih perkiraan — dapat berbeda dengan kalender resmi tahun ini." |
| Default disclaimer (always visible) | "Platform ini memberikan perhitungan referensi berdasarkan pedoman Wariga umum, bukan pengganti konsultasi Sulinggih atau Pemangku." |

## Color palette

The Lontar palette starts from aged-palm-leaf and ink, not from a brand-color picker. Hex values below; CSS-variable names in [UI-001](./docs/specs/pages.md) need updating to align (see [Reconciliations](#reconciliations-with-existing-tokens)).

### Paper theme (default — `light` in UI-001)

| Token | Hex | Role |
|-------|-----|------|
| `paper` | `#F4ECDA` | Page background — aged palm-leaf cream |
| `paper-deep` | `#EADFC4` | Recessed surfaces, card backgrounds |
| `paper-edge` | `#D7C8A4` | Borders, dividers, deckle-edge feel |
| `ink` | `#3A2E1F` | Primary text — dark sepia, never pure black |
| `ink-soft` | `#5C4C36` | Secondary text |
| `ink-faint` | `#8A7960` | Tertiary text, hints, metadata |
| `ochre` | `#A87A2A` | Emphasis, headings, ornaments — burnished gold-brown |
| `ochre-soft` | `#C8A055` | Hover states, soft highlights |

### Night theme (variant — `dark` in UI-001)

| Token | Hex | Role |
|-------|-----|------|
| `night` | `#181410` | Page background — like reading under oil lamp |
| `night-deep` | `#221C16` | Recessed surfaces |
| `night-edge` | `#3A2F23` | Borders |
| `ember` | `#E8D9B5` | Primary text — warm off-white like firelight on page |
| `ember-soft` | `#B8A988` | Secondary text |
| `ember-faint` | `#7A6C53` | Tertiary text |
| `gold` | `#C4A265` | Emphasis (kept from UI-001 for continuity) |
| `gold-soft` | `#D8BC8B` | Hover states |

### Semantic colors (both themes — muted, never saturated)

| Token | Paper hex | Night hex | Role |
|-------|-----------|-----------|------|
| `ayu` | `#5C7A4F` | `#7DA46B` | Auspicious (sage green, not vivid) |
| `caution` | `#6B6A4A` | `#A09B6E` | Caution (muted olive-gold) |
| `ala` | `#8A4B47` | `#B36A66` | Inauspicious (brick, not red-alert) |

Semantic colors are accompanied by an icon and text — color is never the only signal (WCAG 1.4.1).

### High-contrast variant

Pure black ink on pure white paper. No ochre. Borders thicker (1.5 px → 2 px). Used only when the OS reports `prefers-contrast: more` or the user explicitly toggles it.

## Typography

The platform leans on type more than any other channel. Two faces, used together with manuscript-style discipline.

| Use | Family | Size scale (paper theme) |
|-----|--------|-------------------------|
| Headings (h1, h2) | **Cormorant Garamond** (serif) — variable weight 400–600, italic for emphasis | 32 / 28 / 24 |
| Subheads (h3, h4) | **Cormorant Garamond** at smaller sizes, sometimes italic | 20 / 18 |
| Body | **DM Sans** — regular 400, medium 500 for emphasis | 16 (base — never below; 18 in Large scale; 20 in Extra Large) |
| Metadata, captions | DM Sans, 13 px, ink-faint | 13 |
| Numeric data (scores, Pawukon day, Sasih number) | **Cormorant Garamond** at larger sizes — numbers carry weight | 24–48 |
| UI labels (buttons, form fields) | DM Sans medium | 14–15 |
| Sanskrit / Old-Javanese terms (Wariga, Sasih names, dewasa codes) | DM Sans italic OR Cormorant Italic | inherits |

Line height 1.55–1.65 for body (longer than web default). Letter-spacing slightly tightened on Cormorant headings (`tracking-tight`) to compensate for the wide default of serif fonts at large sizes.

### Type rules

- **No heavy weights for emphasis.** Use italic Cormorant or medium DM Sans, not bold display.
- **Drop caps for major sections in long-form pages (About, ceremony landing).** A Cormorant ochre drop cap for the first letter of each major section is the signature touch.
- **Sanskrit/Old-Javanese terms italicised** on first appearance in a paragraph: *Wariga*, *Sasih*, *Pawukon*. Not on every recurrence — that's noise.
- **Numbers stay serif at scale.** A score of 77 should be Cormorant 48 px, not DM Sans bold. Numbers feel inscribed, not declared.

## Layout DNA

- **Generous margins.** Mobile 24 px gutters; desktop 80 px outer, 56 px inner. Pages breathe.
- **Centred content column for reading; left-aligned for utility.** About / ceremony landing → centred narrow column (max-width 640 px). Date check / calendar → left-aligned, wider.
- **Vertical rhythm in 8-px units.** Spacing scale: 4 / 8 / 16 / 24 / 40 / 64 / 96. Never one-off values.
- **Section breaks via ornamental divider, not heavy rules.** A short hand-drawn line, sometimes with a small glyph centred — never a 1-px full-width separator.
- **Cards have soft, deckle-feel edges.** Border radius 4–6 px (not 16 px); border colour `paper-edge` (1 px solid). Subtle inner shadow on bottom-right to suggest physical depth.
- **Mobile first.** Designed to be readable on 360 px width with both thumbs free. Desktop is a graceful expansion, not a different design.

## Signature patterns

Five small touches that make the platform recognisable across screens. These are **always present**; everything else can vary.

### 1. Ornamental section divider

A single thin hand-drawn line (4–6 px tall when rendered as SVG, with subtle variation in stroke weight), centred horizontally, optionally with a small glyph in the middle. Used between major sections, never decoratively within a section. Glyphs vary: a circle for major sections, three dots for sub-sections.

```
       ·  ·  ·
   ─────────────────
              ⬭
```

Implementation: inline SVG with `currentColor` so it inherits theme. Stroke width ~1.25 px to feel hand-drawn at higher resolutions.

### 2. Marginal Wariga glyph

When a screen shows a result, a small (24 × 24 px) glyph sits in the left margin opposite the rating headline. The glyph maps to the dominant dewasa for the day — a custom-drawn marker, not an emoji. The same glyph appears as a favicon-scale element in WhatsApp share previews.

For v1 these glyphs can be simple monogram-like marks (one per ceremony) rather than per-dewasa. Per-dewasa glyphs land in v1.1.

### 3. Cormorant drop cap on major sections

The first letter of the opening paragraph of any About / ceremony landing / SEO page section is a Cormorant Garamond ochre drop cap (3 lines tall). On utility screens (date check, calendar) drop caps are not used — they would feel inappropriate.

### 4. Number-as-inscription

Score percentages, Pawukon day, Sasih number — all rendered in Cormorant Garamond at 1.5–3× the body size. Number is **not** bolded; weight comes from size, italic, and ochre colour. Beside each number, a small DM Sans label (e.g., "skor", "Pawukon", "penanggal") in `ink-faint`. This is the visual hierarchy that distinguishes the platform from generic data-app aesthetics.

### 5. Quiet disclaimer footer (always visible)

The Sulinggih disclaimer sits at the bottom of every page in DM Sans 13 px, `ink-faint`, with a hairline border-top in `paper-edge`. Never collapsed. Never hidden behind a "?" icon. The platform admits its limits openly — that admission is itself part of the design.

## Imagery and iconography

- **No stock photography of Bali.** Risks reducing the platform to tourism aesthetic.
- **No photography of Sulinggih or ceremonies.** Privacy and respect.
- **Acceptable photography (sparingly):** abstract textures (palm leaf close-up, ink on paper, stone surface — neutral, not "Bali") for landing/About hero only. Even these are optional.
- **Icons:** custom line-drawn at 1.5 px stroke weight, monochrome (currentColor). No filled icons. shadcn/Radix defaults overridden where they feel "generic web app".
- **Ceremony emojis from PRD §9.3 (💍 🔥 🙏 👶 🏠 💼):** acceptable as placeholders during scaffolding, but **must be replaced** with custom-drawn ceremony glyphs before launch (Phase 4 / Phase 5).
- **OG share images:** auto-generated via `@vercel/og`. Background = `paper` colour, large Cormorant date number, small dewasa glyph, ceremony label. No decorative imagery.

## Motion

- Transitions are **gentle and brief**: 180–220 ms ease-out. Never bouncy, never long.
- Page entrances: fade + 4 px upward translate. Not slide-in, not zoom.
- Score bar fill: 600 ms ease-out. The single longer animation on the platform.
- All motion respects `prefers-reduced-motion: reduce`: replaced with instant state changes.

## Layout / component map

How signature patterns appear across the components from UI-001:

| Component (UI-001) | Lontar treatment |
|--------------------|------------------|
| `<RootLayout>` | `paper` background; centered header band; quiet disclaimer footer always visible. |
| `<CeremonySelector>` | Horizontal text labels with Cormorant italic; underline accent in `ochre` on the active item (no pill backgrounds). |
| `<DatePicker>` | Cream surface, ink text, `ochre` to mark today and the selected date. |
| `<ScoreBar>` | The `pct` number is the hero (Cormorant 48 px, ochre); the bar itself is a thin 4 px line in `paper-edge` filled to the percentage in semantic colour. |
| `<PawukonGrid>` | Definition-list style (term : value), Cormorant italic for terms, DM Sans for values. No card boxes. |
| `<DewasaTagList>` | Inline italic Cormorant chips with a hairline border, never filled pills. |
| `<AnalysisChecklist>` | Numbered list, Cormorant italic for the factor name, DM Sans for the pass/fail explanation. |
| `<CalendarGrid>` | Days as numbers in Cormorant; small semantic-color underline beneath the number (NOT background fill of the cell). The cell stays cream; the underline carries the signal + a one-character marker (✓ · ×) above the number. |
| `<ResultCard>` | Drop-cap-style opening of the rating sentence; ornamental divider between summary and detail. |
| `<FeedbackWidget>` | Question in Cormorant italic; three text buttons in DM Sans medium with `ochre` underline. No coloured backgrounds on the buttons. |
| `<DisclaimerBanner>` | DM Sans 13 px ink-faint, hairline top border. |

## Reconciliations with existing tokens

UI-001 v0.1.0 captures earlier tokens (Gold `#C4A265` on Dark `#0D0B08`, Dark default). DESIGN.md v0.1.0 implies:

- **Paper theme becomes default** (was Dark in UI-001).
- **Token names change:** `bg-light → paper`, `bg-dark → night`, `gold → ochre` (paper) or `gold` (night), `text-on-light → ink`, `text-on-dark → ember`.
- **Semantic colours desaturated** vs UI-001's `#3F8F4B / #3A5FA8 / #B14250`.
- **New tokens for ornament:** `paper-edge`, `ink-faint`, etc.

These changes require a **minor version bump on UI-001** with full token migration. To be tracked as a separate PR after DESIGN.md is approved (writes to `docs/specs/pages.md` Changelog and updates the Design tokens section).

## When to invoke `frontend-design`

This file informs every visual decision. When generating HTML, JSX, or Tailwind configurations for the project (mockups, the Next.js app, OG images, README badges), invoke the `frontend-design` skill **and pass this file as context**. The skill is calibrated to "avoid generic AI aesthetics" — feeding it the Lontar direction here prevents the default gold-on-black template that AI-generated UI tends to produce.

Do not invoke `frontend-design` to make decisions for this file. This file is the decision; `frontend-design` is the implementation.

## Open questions

- **Custom typeface for Sanskrit terms?** Cormorant Italic handles roman script gracefully but does not contain Balinese script glyphs. If/when Aksara Bali becomes part of the design (e.g., dewasa names in Aksara), we need a typeface that supports it — candidates: Noto Sans Balinese, or a custom face. Defer until a real Aksara use case lands.
- **Drop cap behavior at narrow viewports.** On <360 px, drop caps can break layout. Decide: shrink or omit. Recommend omit on phones below 360 px.
- **Texture in paper background.** A very subtle paper-grain texture (SVG noise overlay at 4 % opacity) makes `paper` feel organic. Risk: hurts file size and contrast. Prototype before locking in.
- **OG image typography.** Variable fonts in `@vercel/og` are constrained — Cormorant might not work out of the box. Need to verify and possibly subset.
- **Ceremony glyph design.** Six custom glyphs replacing the PRD emojis. Out of scope for the initial DESIGN.md write but tracked as a Phase 4 design task.

## Changelog

- v0.1.0 — 2026-05-28 — Initial DESIGN.md drafted from brainstorm. Lontar manuscript revival direction chosen. Defines aesthetic philosophy, voice, full color palette (paper + night + high-contrast), typography rules, layout DNA, five signature patterns, imagery rules, motion, component map, and reconciliations needed against UI-001 tokens.
