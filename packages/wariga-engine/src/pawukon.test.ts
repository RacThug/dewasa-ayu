import { BalineseDate } from 'balinese-date-js-lib';
import { describe, expect, it } from 'vitest';

import { WarigaError } from './errors';
import { getPawukonDay, getWuku } from './pawukon';

// The oracle (balinese-date-js-lib) is the PROVISIONAL ground truth for Pawukon until
// the printed Rawi calendar is digitised. wuku.id (Sinta=0) and saptaWara.id (Redite=0)
// are 0-based, so the oracle's pawukon-day = wuku.id * 7 + saptaWara.id.
function oraclePawukonDay(date: Date): number {
  const bd = new BalineseDate(date);
  return bd.wuku.id * 7 + bd.saptaWara.id;
}

const RANGE_START = new Date(2015, 0, 1);
const RANGE_END = new Date(2034, 11, 31);

describe('getPawukonDay', () => {
  it('places the epoch (2012-06-17, Redite Sinta) at day 0', () => {
    expect(getPawukonDay(new Date(2012, 5, 17))).toBe(0);
  });

  it('always returns a value in [0, 209] across a full cycle and beyond', () => {
    for (let i = 0; i < 420; i++) {
      const pd = getPawukonDay(new Date(2024, 0, 1 + i));
      expect(pd).toBeGreaterThanOrEqual(0);
      expect(pd).toBeLessThan(210);
    }
  });

  it('is cyclic with a period of 210 days', () => {
    expect(getPawukonDay(new Date(2024, 0, 1 + 210))).toBe(getPawukonDay(new Date(2024, 0, 1)));
  });

  it('matches the oracle for every day in 2015–2034', () => {
    const mismatches: string[] = [];
    let cur = new Date(RANGE_START);
    while (cur <= RANGE_END) {
      if (getPawukonDay(cur) !== oraclePawukonDay(cur)) {
        mismatches.push(cur.toISOString().slice(0, 10));
      }
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(mismatches).toEqual([]);
  });

  it('throws WarigaError(INVALID_DATE) on an invalid Date', () => {
    expect.assertions(2);
    try {
      getPawukonDay(new Date(Number.NaN));
    } catch (err) {
      expect(err).toBeInstanceOf(WarigaError);
      expect((err as WarigaError).code).toBe('INVALID_DATE');
    }
  });

  it('throws WarigaError(INVALID_DATE) on a non-Date argument', () => {
    expect.assertions(1);
    try {
      getPawukonDay('2024-01-01' as unknown as Date);
    } catch (err) {
      expect((err as WarigaError).code).toBe('INVALID_DATE');
    }
  });
});

describe('getWuku', () => {
  it('returns Sinta at the epoch and Dungulan on Galungan (2024-02-28)', () => {
    expect(getWuku(new Date(2012, 5, 17))).toBe('sinta');
    expect(getWuku(new Date(2024, 1, 28))).toBe('dungulan');
  });

  it('matches the oracle wuku for every day in 2015–2034', () => {
    const mismatches: string[] = [];
    let cur = new Date(RANGE_START);
    while (cur <= RANGE_END) {
      const expected = new BalineseDate(cur).wuku.name.toLowerCase();
      if (getWuku(cur) !== expected) {
        mismatches.push(`${cur.toISOString().slice(0, 10)}: ${getWuku(cur)} != ${expected}`);
      }
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(mismatches).toEqual([]);
  });
});
