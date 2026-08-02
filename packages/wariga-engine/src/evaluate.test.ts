import { CEREMONY_CONFIGS, CEREMONY_IDS } from '@dewasa-ayu/ceremony-rules';
import type { CeremonyId, Evaluation } from '@dewasa-ayu/types';
import { describe, expect, it } from 'vitest';

import { detectDewasa } from './detect-dewasa';
import { WarigaError } from './errors';
import { computeRating, evaluate, toPct } from './evaluate';
import { getFullInfo } from './full-info';

const START = new Date(2025, 0, 1);
const END = new Date(2026, 11, 31);
const round2 = (n: number): number => Math.round(n * 100) / 100;
const factor = (e: Evaluation, name: string) => e.checks.find((c) => c.factor === name);

describe('evaluate — arithmetic and factor logic re-derived independently (2025–2026)', () => {
  it('factor passes, contributions, aggregate score/maxScore/pct, and rating all check out', () => {
    const mismatches: string[] = [];
    const ratingsSeen = new Set<string>();
    let cur = new Date(START);
    while (cur <= END) {
      const info = getFullInfo(cur);
      const iso = cur.toISOString().slice(0, 10);
      for (const ceremony of CEREMONY_IDS) {
        const cfg = CEREMONY_CONFIGS[ceremony];
        const e = evaluate(info, ceremony);
        const tag = `${iso} ${ceremony}`;

        // Independently expected factor outcomes (getFullInfo fields are already certified).
        const saptawaraPassed = cfg.saptawaraGood.includes(info.saptawara);
        const wukuForbidden = cfg.forbiddenWuku.includes(info.wuku);
        const sasihPassed =
          cfg.sasihGood.includes(info.sasih.index) && !cfg.sasihBad.includes(info.sasih.index);
        const penanggalOK = !cfg.requirePenanggal || !info.sasih.isPangelong;
        const sangawaraPassed = info.sangawara === 'tulus' || info.sangawara === 'dadi';

        const expectFactor = (name: string, passed: boolean, weight: number): void => {
          const c = factor(e, name);
          if (!c) {
            mismatches.push(`${tag} missing ${name}`);
            return;
          }
          if (c.passed !== passed) mismatches.push(`${tag} ${name}.passed ${c.passed}!=${passed}`);
          if (c.contribution !== (passed ? weight : 0))
            mismatches.push(`${tag} ${name}.contribution`);
        };
        expectFactor('saptawara', saptawaraPassed, cfg.weights.saptawara);
        expectFactor('wuku', !wukuForbidden, cfg.weights.wuku);
        expectFactor('sasih', sasihPassed, cfg.weights.sasih);
        expectFactor('penanggal', penanggalOK, cfg.weights.penanggal);
        expectFactor('sangawara', sangawaraPassed, cfg.weights.sangawara);

        // Dewasa lists mirror detectDewasa, and become weighted checks.
        const det = detectDewasa(info, ceremony);
        if (e.dewasaAyu.length !== det.ayu.length || e.dewasaAla.length !== det.ala.length)
          mismatches.push(`${tag} dewasa counts`);
        for (const d of e.dewasaAyu) if (!d.estimated) mismatches.push(`${tag} ayu not estimated`);

        // Aggregate must equal the sum of its own checks.
        const score = round2(e.checks.reduce((s, c) => s + c.contribution, 0));
        const maxScore = round2(e.checks.reduce((s, c) => s + (c.weight > 0 ? c.weight : 0), 0));
        const pct = round2(toPct(score, maxScore));
        if (e.score !== score) mismatches.push(`${tag} score ${e.score}!=${score}`);
        if (e.maxScore !== maxScore) mismatches.push(`${tag} maxScore`);
        if (e.pct !== pct) mismatches.push(`${tag} pct`);
        if (e.score > e.maxScore + 1e-9) mismatches.push(`${tag} score>maxScore`);

        const rating = computeRating({
          pct,
          isPangelong: info.sasih.isPangelong,
          requirePenanggal: cfg.requirePenanggal,
          saptawaraPassed,
          wukuForbidden,
        });
        if (e.rating !== rating) mismatches.push(`${tag} rating ${e.rating}!=${rating}`);
        if (!e.estimated) mismatches.push(`${tag} not estimated`);
        ratingsSeen.add(e.rating);
      }
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(mismatches).toEqual([]);
    // All three verdicts must be reachable across the range.
    expect([...ratingsSeen].sort()).toEqual(['ayu', 'bad', 'caution']);
  });
});

describe('computeRating — every branch (PRD §6.2)', () => {
  const base = {
    pct: 80,
    isPangelong: false,
    requirePenanggal: true,
    saptawaraPassed: true,
    wukuForbidden: false,
  };
  it("'bad' when a required-penanggal ceremony lands on pangelong with a weak saptawara", () => {
    expect(computeRating({ ...base, isPangelong: true, saptawaraPassed: false })).toBe('bad');
  });
  it("'ayu' when score >= 60%, saptawara ok, wuku allowed, penanggal ok", () => {
    expect(computeRating(base)).toBe('ayu');
  });
  it("'caution' when pct < 60 even if everything else passes", () => {
    expect(computeRating({ ...base, pct: 59.9 })).toBe('caution');
  });
  it("'caution' when wuku is forbidden", () => {
    expect(computeRating({ ...base, wukuForbidden: true })).toBe('caution');
  });
  it("'caution' (not 'bad') on pangelong when saptawara is good", () => {
    expect(computeRating({ ...base, isPangelong: true })).toBe('caution');
  });
  it("'caution' when saptawara weak but ceremony does not require penanggal", () => {
    expect(computeRating({ ...base, requirePenanggal: false, saptawaraPassed: false })).toBe(
      'caution',
    );
  });
});

describe('toPct — clamps to 0-100 and guards a zero ceiling', () => {
  it('scales, clamps both ends, and returns 0 for a non-positive max', () => {
    expect(toPct(5, 10)).toBe(50);
    expect(toPct(-3, 10)).toBe(0); // negative score clamps up to 0
    expect(toPct(12, 10)).toBe(100); // over-max clamps down to 100
    expect(toPct(5, 0)).toBe(0); // zero ceiling guarded (no division by zero)
  });
});

describe('evaluate — shape and errors', () => {
  it('throws UNKNOWN_CEREMONY for an unsupported ceremony id', () => {
    const info = getFullInfo(new Date(2026, 0, 1));
    expect.assertions(1);
    try {
      evaluate(info, 'nikah' as CeremonyId);
    } catch (err) {
      expect((err as WarigaError).code).toBe('UNKNOWN_CEREMONY');
    }
  });

  it('always includes the five factor checks and a positive maxScore', () => {
    const info = getFullInfo(new Date(2026, 0, 1));
    const e = evaluate(info, 'pawiwahan');
    for (const name of ['saptawara', 'wuku', 'sasih', 'penanggal', 'sangawara']) {
      expect(factor(e, name)).toBeDefined();
    }
    expect(e.maxScore).toBeGreaterThan(0);
    expect(e.pct).toBeGreaterThanOrEqual(0);
    expect(e.pct).toBeLessThanOrEqual(100);
  });
});
