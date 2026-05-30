import type { CeremonyId } from '@dewasa-ayu/types';
import { describe, expect, it } from 'vitest';

import { WarigaError } from './errors';
import { evaluate } from './evaluate';
import { getFullInfo } from './full-info';
import { findGoodDates, getMonthEvaluation } from './search';

describe('findGoodDates', () => {
  it('returns ascending ayu dates, each genuinely ayu, without mutating `from`', () => {
    const from = new Date(2026, 0, 1);
    const fromTime = from.getTime();
    const res = findGoodDates(from, 3, 'usaha');

    expect(from.getTime()).toBe(fromTime); // not mutated
    expect(res.dates.length).toBe(3);
    expect(res.capReached).toBe(false);
    for (let i = 0; i < res.dates.length; i += 1) {
      const ev = res.dates[i]!;
      expect(ev.evaluation.rating).toBe('ayu');
      // re-evaluating the returned date reproduces the verdict
      expect(evaluate(getFullInfo(ev.date), 'usaha').rating).toBe('ayu');
      if (i > 0) expect(ev.date.getTime()).toBeGreaterThan(res.dates[i - 1]!.date.getTime());
    }
  });

  it('sets capReached when the 365-day cap is hit before count is satisfied', () => {
    const res = findGoodDates(new Date(2026, 0, 1), 400, 'pawiwahan');
    expect(res.capReached).toBe(true);
    expect(res.dates.length).toBeLessThan(400);
    expect(res.dates.every((d) => d.evaluation.rating === 'ayu')).toBe(true);
  });

  it('validates its inputs', () => {
    expect(() => findGoodDates(new Date(Number.NaN), 5, 'usaha')).toThrowError(WarigaError);
    expect(() => findGoodDates(new Date(2026, 0, 1), 0, 'usaha')).toThrowError(WarigaError);
    expect(() => findGoodDates(new Date(2026, 0, 1), -1, 'usaha')).toThrowError(WarigaError);
    try {
      findGoodDates(new Date(2026, 0, 1), 5, 'nikah' as CeremonyId);
    } catch (err) {
      expect((err as WarigaError).code).toBe('UNKNOWN_CEREMONY');
    }
  });
});

describe('getMonthEvaluation', () => {
  it('covers every day of the month, with counts and top dates consistent', () => {
    const jan = getMonthEvaluation(2026, 1, 'dewa_yadnya');
    expect(jan.days.length).toBe(31);
    expect(jan.days[0]!.date.getTime()).toBe(Date.UTC(2026, 0, 1));
    expect(jan.days[30]!.date.getTime()).toBe(Date.UTC(2026, 0, 31));
    expect(getMonthEvaluation(2026, 2, 'dewa_yadnya').days.length).toBe(28); // 2026 not leap

    const { ayuCount, cautionCount, badCount, topDates } = jan.summary;
    expect(ayuCount + cautionCount + badCount).toBe(31);
    expect(ayuCount).toBe(jan.days.filter((d) => d.evaluation.rating === 'ayu').length);
    expect(badCount).toBe(jan.days.filter((d) => d.evaluation.rating === 'bad').length);

    // topDates: up to 5 ayu dates, sorted by score descending.
    expect(topDates.length).toBe(Math.min(5, ayuCount));
    expect(topDates.every((d) => d.evaluation.rating === 'ayu')).toBe(true);
    for (let i = 1; i < topDates.length; i += 1) {
      expect(topDates[i - 1]!.evaluation.score).toBeGreaterThanOrEqual(
        topDates[i]!.evaluation.score,
      );
    }
  });

  it('each day reproduces its own evaluation', () => {
    const m = getMonthEvaluation(2026, 6, 'pawiwahan');
    for (const d of m.days) {
      expect(evaluate(getFullInfo(d.date), 'pawiwahan').rating).toBe(d.evaluation.rating);
    }
  });

  it('validates month and ceremony', () => {
    expect(() => getMonthEvaluation(2026, 0, 'usaha')).toThrowError(WarigaError);
    expect(() => getMonthEvaluation(2026, 13, 'usaha')).toThrowError(WarigaError);
    try {
      getMonthEvaluation(2026, 6, 'nikah' as CeremonyId);
    } catch (err) {
      expect((err as WarigaError).code).toBe('UNKNOWN_CEREMONY');
    }
  });
});
