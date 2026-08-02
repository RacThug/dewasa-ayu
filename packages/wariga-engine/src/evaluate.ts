import { CEREMONY_CONFIGS, CEREMONY_IDS } from '@dewasa-ayu/ceremony-rules';
import type { BalineseDate, CeremonyId, Check, Evaluation, Rating } from '@dewasa-ayu/types';

import { detectDewasa } from './detect-dewasa';
import { WarigaError } from './errors';

const GOOD_SANGAWARA = new Set(['tulus', 'dadi']);
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Score as a 0-100 percentage of the achievable maximum; guards a zero ceiling. */
export function toPct(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

function pushFactor(checks: Check[], factor: string, passed: boolean, weight: number): void {
  checks.push({ factor, passed, weight, contribution: passed ? weight : 0 });
}

export function computeRating(args: {
  pct: number;
  isPangelong: boolean;
  requirePenanggal: boolean;
  saptawaraPassed: boolean;
  wukuForbidden: boolean;
}): Rating {
  const { pct, isPangelong, requirePenanggal, saptawaraPassed, wukuForbidden } = args;
  // PRD §6.2. The "critical ala -> bad" rule is deferred: no padewasan is classified
  // critical yet (all seeded ala are 'minor' by conservative design), so it cannot fire.
  if (requirePenanggal && isPangelong && !saptawaraPassed) return 'bad';
  if (pct >= 60 && saptawaraPassed && !wukuForbidden && (!requirePenanggal || !isPangelong)) {
    return 'ayu';
  }
  return 'caution';
}

/**
 * Score a date for a ceremony and return a structured verdict (PRD §6). Composes the
 * sourced factor checks (saptawara, wuku, sasih, penanggal, sangawara) with the
 * padewasan from `detectDewasa`. The whole verdict is `estimated: true` — its inputs
 * (per-ceremony sasih/wuku lists, the saptawara "umum" set, and every padewasan rule)
 * are unverified; the UI must present it as "estimasi · konsultasi Sulinggih".
 *
 * Throws `UNKNOWN_CEREMONY` for an unsupported ceremony id.
 */
export function evaluate(info: BalineseDate, ceremonyId: CeremonyId): Evaluation {
  if (!CEREMONY_IDS.includes(ceremonyId)) {
    throw new WarigaError('UNKNOWN_CEREMONY', `evaluate: unknown ceremony "${ceremonyId}"`);
  }
  const config = CEREMONY_CONFIGS[ceremonyId];
  const w = config.weights;
  const checks: Check[] = [];

  // Positive factor checks (each contributes its weight only when it passes).
  const saptawaraPassed = config.saptawaraGood.includes(info.saptawara);
  pushFactor(checks, 'saptawara', saptawaraPassed, w.saptawara);

  const wukuForbidden = config.forbiddenWuku.includes(info.wuku);
  pushFactor(checks, 'wuku', !wukuForbidden, w.wuku);

  const sasihPassed =
    config.sasihGood.includes(info.sasih.index) && !config.sasihBad.includes(info.sasih.index);
  pushFactor(checks, 'sasih', sasihPassed, w.sasih);

  const penanggalOK = !config.requirePenanggal || !info.sasih.isPangelong;
  pushFactor(checks, 'penanggal', penanggalOK, w.penanggal);

  pushFactor(checks, 'sangawara', GOOD_SANGAWARA.has(info.sangawara), w.sangawara);

  // Padewasan (from the data-driven registry; ingkel is scored here via ingkel_wong).
  const dewasa = detectDewasa(info, ceremonyId);
  for (const ayu of dewasa.ayu) {
    checks.push({
      factor: `dewasa_ayu:${ayu.id}`,
      passed: true,
      weight: w.dewasaAyuBonus,
      contribution: w.dewasaAyuBonus,
      note: ayu.note,
    });
  }
  // All seeded ala are 'minor' (conservative — no unverified rule alone forces a "bad"
  // verdict). Critical-ala penalties + the §6.2 critical->bad rule are deferred until a
  // padewasan is expert-classified critical; `criticalAlaPenalty` is reserved in config.
  for (const ala of dewasa.ala) {
    checks.push({
      factor: `dewasa_ala:${ala.id}`,
      passed: false,
      weight: 0, // penalties never raise the ceiling
      contribution: -w.minorAlaPenalty,
      note: ala.note,
    });
  }

  const score = checks.reduce((sum, c) => sum + c.contribution, 0);
  const maxScore = checks.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0);
  const pct = toPct(score, maxScore);

  const rating = computeRating({
    pct,
    isPangelong: info.sasih.isPangelong,
    requirePenanggal: config.requirePenanggal,
    saptawaraPassed,
    wukuForbidden,
  });

  return {
    ceremony: ceremonyId,
    rating,
    score: round2(score),
    maxScore: round2(maxScore),
    pct: round2(pct),
    checks,
    dewasaAyu: dewasa.ayu,
    dewasaAla: dewasa.ala,
    estimated: true,
  };
}
