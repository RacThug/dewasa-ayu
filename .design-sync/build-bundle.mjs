#!/usr/bin/env node
// Off-script design-sync converter for Dewasa Ayu — a CSS/token design system
// ("Lontar manuscript revival"). The repo ships no React component library, so
// the standard component-centric converter doesn't apply; this emits the upload
// layout deterministically from apps/web/app/globals.css:
//   styles.css → @imports remote fonts + tokens/tokens.css + _ds_bundle.css
//   _ds_bundle.js → empty-but-valid IIFE (a CSS DS has no JS exports)
//   components/<group>/<Name>/<Name>.{html,prompt.md} → showcase cards built
//     ONLY from the real class vocabulary (never reimplemented components)
//   README.md → conventions header + card index ; _ds_sync.json → anchor
// Run from the repo root: node .design-sync/build-bundle.mjs
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'ds-bundle');
const NAMESPACE = 'DewasaAyuLontar';
const sha = (s) => createHash('sha256').update(s).digest('hex');
const sha12 = (s) => sha(s).slice(0, 12);
const write = (rel, body) => {
  const p = join(OUT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body);
};

// --- 1. Split globals.css into tokens (the :root custom-property blocks) and
// the component/element styles. The split point is the global reset that opens
// the styling section. Drop the Tailwind import (the DS uses zero utilities) and
// bind the two brand families to real names so the shipped @font-face resolves. ---
const SRC = join(ROOT, 'apps', 'web', 'app', 'globals.css');
let css = readFileSync(SRC, 'utf8')
  .replace(/@import 'tailwindcss';\n?/, '')
  .replace(
    /--serif:\s*var\(--font-cormorant\)[^;]*;/,
    "--serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;",
  )
  .replace(
    /--sans:\s*var\(--font-dmsans\)[^;]*;/,
    "--sans: 'DM Sans', system-ui, -apple-system, sans-serif;",
  );

const SPLIT = '* {\n  box-sizing: border-box;';
const at = css.indexOf(SPLIT);
if (at < 0) {
  console.error('✗ could not find the reset boundary in globals.css');
  process.exit(1);
}
const tokensCss =
  '/* Dewasa Ayu — design tokens (Lontar manuscript revival). Theme via\n' +
  ' * data-theme="night|paper", data-contrast="high", data-font-scale="large|xlarge". */\n' +
  css.slice(0, at).trim() +
  '\n';
const bundleCss =
  '/* Dewasa Ayu — component & layout styles. Consumes the tokens above. */\n' +
  css.slice(at).trim() +
  '\n';

const FONTS =
  "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400;1,9..40,500;1,9..40,600&display=swap');";
const stylesCss = `/* Dewasa Ayu — styles entry. Rendered designs receive this file's @import closure. */\n${FONTS}\n@import './tokens/tokens.css';\n@import './_ds_bundle.css';\n`;

const bundleJs =
  `/* @ds-bundle: {"namespace":"${NAMESPACE}","components":[],"sourceHashes":{},"inlinedExternals":[]} */\n` +
  `(function(){var g=(typeof window!=="undefined"?window:globalThis);g.${NAMESPACE}=g.${NAMESPACE}||{};})();\n`;

// --- 2. Showcase cards — composed ONLY from real classes, authentic Wariga
// content, night theme. A small reset neutralizes entrance animations so the
// static render is faithful (meter fill / pin forced to final state). ---
const SUN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2 2M17.4 17.4l2 2M19.4 4.6l-2 2M6.6 17.4l-2 2"/></svg>';
const CHECK =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 8.5l3.4 3.4L13 4.5"/></svg>';
const CROSS =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
const DOT =
  '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="3.6"/></svg>';

// Calendar cell generator (June 2026 starts on a Monday → 1 leading blank).
const VERDICTS = { ayu: 'ayu', caution: 'madya', bad: 'ala' };
const calDays = () => {
  const marks = {
    1: 'ayu',
    4: 'bad',
    7: 'caution',
    9: 'ayu',
    12: 'ayu',
    15: 'caution',
    18: 'bad',
    21: 'ayu',
    23: 'ayu',
    25: 'ayu',
    27: 'caution',
    30: 'ayu',
  };
  let cells = '<span class="cal-blank"></span>';
  for (let d = 1; d <= 30; d++) {
    const v = marks[d];
    const cls = ['cal-cell', v ? `r-${v}` : '', d === 18 ? 'is-today' : '']
      .filter(Boolean)
      .join(' ');
    const mark = v
      ? `<span class="cal-mark">${VERDICTS[v]}</span>`
      : '<span class="cal-mark">&nbsp;</span>';
    cells += `<a class="${cls}">${mark}<span class="cal-num">${d}</span></a>`;
  }
  return cells;
};

const CARDS = [
  {
    name: 'Button',
    group: 'Actions',
    summary:
      'Primary action button (.periksa) — the "Periksa" / submit control, plus its busy state.',
    inner: `<div class="field" style="align-items:center;gap:var(--s4)">
    <button class="periksa">Periksa Dewasa</button>
    <button class="periksa" aria-busy="true">Memeriksa…</button>
  </div>`,
  },
  {
    name: 'VerdictPanel',
    group: 'Result',
    summary:
      'The hero result panel (.inscription) — verdict, score, and suitability meter for a checked date.',
    inner: `<section class="inscription">
    <span class="hole"></span>
    <div class="insc-top">
      <span class="insc-glyph">${SUN}</span>
      <p class="verdict is-ayu">Hari ini <b>Ayu</b></p>
    </div>
    <p class="insc-sub">Saniscara Umanis <em>Watugunung</em> — disarankan untuk upacara <em>Otonan</em>.</p>
    <div class="scorewrap">
      <div class="score">86<sup>/100</sup></div>
      <div class="score-side">
        <p class="label">Tingkat kecocokan</p>
        <div class="meter"><span class="fill" style="width:86%"></span><span class="pin" style="left:86%"></span></div>
        <div class="meter-scale"><span>Ala</span><span>Madya</span><span>Ayu</span></div>
      </div>
    </div>
  </section>`,
  },
  {
    name: 'Breakdown',
    group: 'Result',
    summary:
      'Two-column Wariga breakdown — wewaran values (.pawukon) and the rule analysis list (.analysis) with pass/fail marks.',
    inner: `<div class="breakdown">
    <div>
      <h3 class="col-head"><em>Wewaran</em> <span class="n">Komponen kalender</span></h3>
      <div class="pawukon">
        <div><span class="t">Sapta Wara</span><span class="v">Saniscara</span></div>
        <div><span class="t">Panca Wara</span><span class="v hl">Umanis</span></div>
        <div><span class="t">Wuku</span><span class="v">Watugunung</span></div>
        <div><span class="t">Sasih</span><span class="v">Sada</span></div>
        <div><span class="t">Penanggal</span><span class="v">Penanggal 10</span></div>
      </div>
    </div>
    <div>
      <h3 class="col-head"><em>Analisa</em> <span class="n">3 aturan</span></h3>
      <ul class="analysis">
        <li><span class="idx"></span><span><span class="name">Subha Dina</span><span class="why">Pertemuan Saniscara &amp; Umanis tergolong baik.</span></span><span class="mark pass">${CHECK} Cocok</span></li>
        <li><span class="idx"></span><span><span class="name">Dauh Ayu</span><span class="why">Berada pada rentang waktu yang disarankan.</span></span><span class="mark pass">${CHECK} Cocok</span></li>
        <li><span class="idx"></span><span><span class="name">Ingkel</span><span class="why">Ingkel Wong — sebagian sumber menyarankan dihindari.</span></span><span class="mark fail">${CROSS} Perhatikan</span></li>
      </ul>
    </div>
  </div>`,
  },
  {
    name: 'Tags',
    group: 'Result',
    summary: 'Verdict tags (.tag) — recommended (.ayu) and to-be-avoided (.ala) wewaran markers.',
    inner: `<div class="tags">
    <span class="tag ayu">${DOT} Dewasa Ayu</span>
    <span class="tag ayu">${DOT} Subha Dina</span>
    <span class="tag ala">${DOT} Ingkel Wong</span>
    <span class="tag">Dauh Ayu</span>
  </div>
  <p class="note">Tag menandai pertemuan wewaran yang disarankan atau dihindari menurut pedoman Wariga umum — bukan ketentuan mutlak.</p>`,
  },
  {
    name: 'CalendarGrid',
    group: 'Calendar',
    summary:
      'Monthly calendar (.cal-grid / .cal-cell) with per-day verdict coloring (r-ayu / r-caution / r-bad) and today marker.',
    inner: `<div class="cal-nav"><span class="cal-arrow">‹</span><span class="cal-month">Juni 2026</span><span class="cal-arrow">›</span></div>
  <div class="cal-heads"><span>Red</span><span>Som</span><span>Ang</span><span>Bud</span><span>Wre</span><span>Suk</span><span>San</span></div>
  <div class="cal-grid">${calDays()}</div>
  <p class="cal-summary"><b>8</b> hari disarankan untuk Otonan bulan ini</p>`,
  },
  {
    name: 'RecommendationList',
    group: 'Recommend',
    summary:
      'Nearest recommended days (.reco-list / .reco-card) — date, verdict, and score per row.',
    inner: `<div class="ask" style="padding:0 0 var(--s4)"><p class="eyebrow">Hari baik terdekat · Otonan</p></div>
  <ul class="reco-list">
    <li><a class="reco-card"><span class="reco-date">Wraspati, 25 Juni 2026</span><span class="reco-verdict v-ayu">Ayu</span><span class="reco-score">92<sup>/100</sup></span></a></li>
    <li><a class="reco-card"><span class="reco-date">Saniscara, 4 Juli 2026</span><span class="reco-verdict v-ayu">Ayu</span><span class="reco-score">88<sup>/100</sup></span></a></li>
    <li><a class="reco-card"><span class="reco-date">Buda, 15 Juli 2026</span><span class="reco-verdict v-caution">Madya</span><span class="reco-score">74<sup>/100</sup></span></a></li>
    <li><a class="reco-card"><span class="reco-date">Redite, 26 Juli 2026</span><span class="reco-verdict v-ayu">Ayu</span><span class="reco-score">85<sup>/100</sup></span></a></li>
  </ul>`,
  },
];

const cardHtml = (c) => `<!-- @dsCard group="${c.group}" -->
<!doctype html>
<html lang="id" data-theme="night">
<head>
<meta charset="utf-8">
<title>${c.name}</title>
<link rel="stylesheet" href="../../../styles.css">
<style>
  html,body{min-height:auto}
  body{padding:40px 32px;max-width:720px;margin:0 auto}
  *,*::before,*::after{animation:none!important}
  .anim,.meter .fill,.meter .pin{opacity:1!important;transform:none!important}
</style>
</head>
<body>
<div id="root">
  ${c.inner}
</div>
</body>
</html>
`;

// --- 3. Emit ---
rmSync(OUT, { recursive: true, force: true });
write('tokens/tokens.css', tokensCss);
write('_ds_bundle.css', bundleCss);
write('styles.css', stylesCss);
write('_ds_bundle.js', bundleJs);
write('_ds_needs_recompile', JSON.stringify({ by: 'design-sync-cli' }));

const renderHashes = {};
for (const c of CARDS) {
  const html = cardHtml(c);
  write(`components/${c.group}/${c.name}/${c.name}.html`, html);
  write(
    `components/${c.group}/${c.name}/${c.name}.prompt.md`,
    `${c.summary}\n\nBuild with the Lontar class vocabulary (see README). Night theme by default; copy in Bahasa Indonesia, tone "disarankan/dihindari".\n`,
  );
  renderHashes[c.name] = sha12(html);
}

write(
  '.ds-build-meta.json',
  JSON.stringify(
    {
      componentCount: CARDS.length,
      shape: 'package',
      generator: 'dewasa-ayu off-script tokens-first',
    },
    null,
    2,
  ),
);

const conventions = readFileSync(join(ROOT, '.design-sync', 'conventions.md'), 'utf8');
const index = CARDS.map((c) => `- **${c.name}** (${c.group}) — ${c.summary}`).join('\n');
write('README.md', `${conventions}\n\n---\n\n## Showcase cards in this sync\n\n${index}\n`);

write(
  '_ds_sync.json',
  JSON.stringify(
    {
      shape: 'package',
      styleSha: sha(stylesCss),
      bundleSha12: sha12(bundleJs),
      renderHashes,
      sourceHashes: {},
      auxSha: sha12(tokensCss + bundleCss),
    },
    null,
    2,
  ),
);

console.error(`✓ built ${OUT}: ${CARDS.length} cards, tokens+styles+bundle, anchor written`);
