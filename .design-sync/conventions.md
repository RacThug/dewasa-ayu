# Dewasa Ayu — "Lontar manuscript revival" design system

A **CSS + design-token** system (no React component library). You build UI with plain
HTML/JSX and the named classes + CSS variables below. There is **no utility-class
system** (no Tailwind) — never invent `bg-*`/`p-*`/`flex` utilities; they will not
resolve. Style with the documented classes and `var(--*)` tokens only.

## Setup & theming (no JS provider needed)

Themes are pure attributes on the root element — set one and the whole tree re-themes:

- `data-theme="night"` — oil-lamp dark manuscript (**the canonical default**; applies even with no attribute).
- `data-theme="paper"` — aged palm-leaf, daytime light variant.
- `data-contrast="high"` — pure-ink high-contrast (overrides both themes; thicker borders, no texture). For WCAG AAA / `prefers-contrast: more`.
- `data-font-scale="large" | "xlarge"` — bumps the document base size (accessibility).

```html
<html data-theme="night">
  <body>
    <main class="wrap">…</main>
  </body>
</html>
```

`styles.css` styles `body` itself (background, grain texture, base type) — render inside it.

## The styling idiom: semantic tokens + named classes

**Colors** (`var(--…)`): `--bg`, `--bg-deep`, `--panel` (raised surfaces), `--edge` (borders),
`--text`, `--text-soft`, `--text-faint`; `--accent` (ochre/gold — the brand color),
`--accent-soft`, `--accent-deep`, `--accent-hover`. **Verdict colors**: `--ayu` (green = good /
"disarankan"), `--caution` (muted yellow), `--ala` (red = avoid / "dihindari").

**Spacing** scale (`var(--…)`): `--s1` 4px · `--s2` 8px · `--s3` 16px · `--s4` 24px ·
`--s5` 40px · `--s6` 64px · `--s7` 96px. **Borders**: `--bw`, `--bw-med`, `--bw-thick`, `--focus-w`.

**Fonts**: `--serif` = Cormorant Garamond (used _italic_ for display headings, verdicts, scores,
dates — the manuscript voice); `--sans` = DM Sans (body, labels, UI). Headings are almost always
`font-family: var(--serif); font-style: italic`.

## Class vocabulary (the real names — use these, don't invent)

- **Layout**: `.wrap` (max-width page column) · `.site-header` · `.brand` (`.name`, `.leaf-mark`) · `.tools`/`.tool` (header icon buttons) · `.page-nav` · `.ceremonies` (tab row, `a.active`) · `.divider` · `.site-footer`/`.foot`.
- **Ask / form**: `.ask` (`.eyebrow`, `h1` with `.pick` accent span) · `.field` (flex row) · `.periksa` (**primary button**) · `.dp-trigger` (date trigger, `.d`/`.edit`) · `.count-field`/`.count-label`.
- **Result panel**: `.inscription` (the hero verdict card — palm-leaf panel; add a `.hole` punch dot) · `.insc-top`/`.insc-glyph` · `.verdict` + state `.is-ayu` / `.is-caution` / `.is-bad` (wrap the keyword in `<b>`) · `.insc-sub` · `.scorewrap` · `.score` (huge numeral, `<sup>` for "/100") · `.score-side` · `.meter` + `.is-caution`/`.is-bad` (`.fill` width = % , `.pin`) · `.meter-scale`.
- **Breakdown**: `.breakdown` (2-col) · `.col-head` (`em` accent, `.n` count) · `.pawukon` (label/value rows: `.t`/`.v`, `.v.hl` highlight) · `.analysis` (numbered rule list: `.idx`, `.name`, `.why`, `.mark.pass`/`.mark.fail`) · `.tags`/`.tag` (+`.ayu`/`.ala`) · `.note`.
- **Calendar**: `.cal-nav`/`.cal-arrow`/`.cal-month` · `.cal-heads` · `.cal-grid` · `.cal-cell` (+ `.r-ayu`/`.r-caution`/`.r-bad` verdict, `.is-today`; `.cal-mark`/`.cal-num`) · `.cal-summary`.
- **Recommend**: `.reco-list` · `.reco-card` · `.reco-date` · `.reco-verdict` (+`.v-ayu`/`.v-caution`/`.v-bad`) · `.reco-score`.
- **About / prose**: `.about`/`.about-lead` (drop-cap) · `.about-section` · `.about-note`.

Read `styles.css`, `tokens/tokens.css`, and `_ds_bundle.css` for the full source of truth before styling. The preview cards under `components/` show real composed usage — imitate them.

## Idiomatic snippet

```html
<section class="inscription" data-theme="night">
  <span class="hole"></span>
  <p class="verdict is-ayu">Hari ini <b>Ayu</b> untuk Otonan</p>
  <div class="scorewrap">
    <div class="score">86<sup>/100</sup></div>
    <div class="score-side">
      <p class="label">Tingkat kecocokan</p>
      <div class="meter">
        <span class="fill" style="width:86%"></span><span class="pin" style="left:86%"></span>
      </div>
    </div>
  </div>
</section>
```

## Voice (cultural — non-negotiable)

Copy is **Bahasa Indonesia**. Use "disarankan / dihindari", never "dilarang / wajib". Frame as
"berdasarkan pedoman Wariga umum" — a reference, never religious authority or a substitute for
Sulinggih/Pemangku consultation. Verdict tone maps to color: `--ayu` good, `--caution` neutral,
`--ala` avoid.
