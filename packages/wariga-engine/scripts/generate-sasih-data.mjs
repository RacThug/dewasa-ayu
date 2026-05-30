// Generates packages/constants/src/sasih-data.ts — the Sasih lookup table.
//
// Run: `node packages/wariga-engine/scripts/generate-sasih-data.mjs`
//
// The Balinese lunar calendar (Sasih) cannot be reproduced by a simple mean-month
// approximation: it inserts intercalary "nampih" months and doubles a penanggal
// ("ngunalatri") on selected days, so month boundaries are irregular. We model it
// with a global "lunar unit" count and a precomputed table:
//
//   - Each solar day advances the penanggal by one unit; a ngunalatri day advances
//     it by two (one solar day carries two penanggal, including boundary days that
//     hold both Tilem-15 of the old month and Penanggal-1 of the new one).
//   - firstUnit(date)   = daysSinceEpoch + (ngunalatri days strictly before it)
//   - monthIndex        = floor(firstUnit / 30)
//   - unitInMonth       = firstUnit % 30  ->  penanggal 1-15 (15 = Purnama)
//                                             pangelong 1-15 (15 = Tilem)
//   - per-month arrays hold the base sasih id, kind (normal/nampih/mala), and saka.
//
// The table is generated from the balinese-date-js-lib oracle (a dev-only tool, never
// shipped) and SELF-VALIDATED here against that oracle for every day in range. The
// shipped data is plain calendar facts — clean-room, zero runtime dependency.
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BalineseDate } from 'balinese-date-js-lib';

const DAY = 86_400_000;
const info = (date) => new BalineseDate(date);
const utc = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

// Inclusive supported range. We walk a little past the end so the month containing
// the last day is complete in the table, but only mark days up to LAST_DATE valid.
// Start in the modern "nampih sasih" era (in force since 2003 per PHDI); earlier eras
// used different pengalantaka rules and the oracle is less reliable there (e.g. a
// double-Tilem on 2000-02-02). 2003-2100 covers every realistic ceremony date.
const FIRST_SCAN = new Date(2003, 0, 1);
const LAST_DATE = new Date(2100, 11, 31);
const WALK_END = new Date(2101, 5, 30);

// Epoch (lunar unit 0) = the first clean "Penanggal 1" on/after FIRST_SCAN.
let epochDate = new Date(FIRST_SCAN);
while (true) {
  const b = info(epochDate);
  if (b.sasihDayInfo.name === 'Penanggal' && b.sasihDay.length === 1 && b.sasihDay[0] === 1) break;
  epochDate = new Date(epochDate.getFullYear(), epochDate.getMonth(), epochDate.getDate() + 1);
}
const EPOCH = utc(epochDate);
const dayNumber = (date) => Math.floor((utc(date) - EPOCH) / DAY);

const SID = [];
const KIND = [];
const SAKA = [];
const NGUNALATRI = [];
let prevName = null;
for (
  let cur = new Date(epochDate);
  utc(cur) <= utc(WALK_END);
  cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1)
) {
  const b = info(cur);
  if (b.sasih.name !== prevName) {
    SID.push(b.sasih.refId);
    KIND.push(b.sasih.name.startsWith('Nampih') ? 1 : b.sasih.name.startsWith('Mala') ? 2 : 0);
    SAKA.push(b.saka);
    prevName = b.sasih.name;
  }
  if (b.sasihDay.length === 2) NGUNALATRI.push(dayNumber(cur));
}
const LAST_DAY = dayNumber(LAST_DATE);

// Lookup logic (mirrors the engine's getSasihInfo) for self-validation.
const SASIH_NAMES = [
  'Kasa',
  'Karo',
  'Katiga',
  'Kapat',
  'Kalima',
  'Kanem',
  'Kapitu',
  'Kawolu',
  'Kasanga',
  'Kadasa',
  'Destha',
  'Sadha',
];
const ngunalatriBefore = (dn) => {
  let lo = 0;
  let hi = NGUNALATRI.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (NGUNALATRI[mid] < dn) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
const lookup = (dn) => {
  const idx = ngunalatriBefore(dn);
  const firstUnit = dn + idx;
  const monthIndex = Math.floor(firstUnit / 30);
  const u = firstUnit % 30;
  const isDoubled = NGUNALATRI[idx] === dn;
  const secondUnit = isDoubled ? (firstUnit + 1) % 30 : -1;
  const kind = KIND[monthIndex];
  return {
    name: (kind === 1 ? 'Nampih ' : kind === 2 ? 'Mala ' : '') + SASIH_NAMES[SID[monthIndex]],
    penLinear: u >= 15 ? 15 + (u - 14) : u + 1,
    saka: SAKA[monthIndex],
    isPangelong: u >= 15,
    isPurnama: u === 14 || secondUnit === 14,
    isTilem: u === 29 || secondUnit === 29,
  };
};

let mismatches = 0;
for (
  let cur = new Date(epochDate);
  dayNumber(cur) <= LAST_DAY;
  cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1)
) {
  const b = info(cur);
  const r = lookup(dayNumber(cur));
  const oPangelong = b.sasihDayInfo.name === 'Pangelong' || b.sasihDayInfo.name === 'Tilem';
  const oraclePen = oPangelong ? 15 + b.sasihDay[0] : b.sasihDay[0];
  if (
    r.name !== b.sasih.name ||
    r.penLinear !== oraclePen ||
    r.saka !== b.saka ||
    r.isPangelong !== oPangelong ||
    r.isPurnama !== (b.sasihDayInfo.name === 'Purnama') ||
    r.isTilem !== (b.sasihDayInfo.name === 'Tilem')
  ) {
    mismatches++;
  }
}
if (mismatches > 0) {
  throw new Error(
    `Self-validation FAILED: ${mismatches} mismatches vs the oracle. Refusing to write.`,
  );
}

const chunk = (arr) => {
  const lines = [];
  for (let i = 0; i < arr.length; i += 40) lines.push('  ' + arr.slice(i, i + 40).join(', ') + ',');
  return lines.join('\n');
};
const out = `// GENERATED by packages/wariga-engine/scripts/generate-sasih-data.mjs — DO NOT EDIT.
// Sasih lookup table, validated against balinese-date-js-lib for every day in range.
// Supported range: ${epochDate.toISOString().slice(0, 10)} .. ${LAST_DATE.toISOString().slice(0, 10)}.
// See the generator header for the lunar-unit model.

/** Lunar unit 0 (Penanggal 1 of the first month), as a UTC timestamp. */
export const SASIH_EPOCH = ${EPOCH};

/** Largest supported day-number (days since SASIH_EPOCH); beyond this is out of range. */
export const SASIH_LAST_DAY = ${LAST_DAY};

/** Sorted day-numbers on which a penanggal is doubled (ngunalatri). */
export const SASIH_NGUNALATRI_DAYS: number[] = [
${chunk(NGUNALATRI)}
];

/** Base sasih id (0 = Kasa .. 11 = Sadha) per month index. */
export const SASIH_MONTH_SID: number[] = [
${chunk(SID)}
];

/** Month kind per month index: 0 = normal, 1 = nampih (intercalary), 2 = mala. */
export const SASIH_MONTH_KIND: number[] = [
${chunk(KIND)}
];

/** Tahun Saka per month index. */
export const SASIH_MONTH_SAKA: number[] = [
${chunk(SAKA)}
];
`;

const outPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../constants/src/sasih-data.ts',
);
writeFileSync(outPath, out, 'utf8');
console.log(`Wrote ${outPath}`);
console.log(
  `  epoch=${epochDate.toISOString().slice(0, 10)} months=${SID.length} ngunalatri=${NGUNALATRI.length} lastDay=${LAST_DAY}`,
);
console.log(`  self-validation: 0 mismatches vs oracle across ${LAST_DAY + 1} days`);
