import { BalineseDate } from 'balinese-date-js-lib';
import { describe, expect, it } from 'vitest';

import { WarigaError } from './errors';
import { getIngkel, getJejepan } from './pawukon-derived';
import { getSadwara } from './wewaran';

// The oracle (balinese-date-js-lib) is the provisional ground truth. Both cycles
// are checked against it for every day in 2015–2034.
const RANGE_START = new Date(2015, 0, 1);
const RANGE_END = new Date(2034, 11, 31);

function eachDay(visit: (date: Date, oracle: BalineseDate) => void): void {
  let cur = new Date(RANGE_START);
  while (cur <= RANGE_END) {
    visit(cur, new BalineseDate(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
}

describe('ingkel & jejepan — match the oracle for every day in 2015–2034', () => {
  it('ingkel and jejepan', () => {
    const mismatches: string[] = [];
    eachDay((date, o) => {
      const iso = date.toISOString().slice(0, 10);
      if (getIngkel(date) !== o.ingkel.name.toLowerCase()) mismatches.push(`${iso} ingkel`);
      if (getJejepan(date) !== o.jejepan.name.toLowerCase()) mismatches.push(`${iso} jejepan`);
    });
    expect(mismatches).toEqual([]);
  });
});

describe('ingkel — structure', () => {
  it('is constant within each wuku week (Redite–Saniscara)', () => {
    // Walk one full Pawukon cycle from the epoch; every 7-day wuku block is uniform.
    for (let week = 0; week < 30; week++) {
      const start = new Date(2012, 5, 17 + week * 7);
      const ingkel = getIngkel(start);
      for (let d = 1; d < 7; d++) {
        expect(getIngkel(new Date(2012, 5, 17 + week * 7 + d))).toBe(ingkel);
      }
    }
  });

  it('runs Wong→Buku starting at wuku Sinta and cycles every 6 wuku', () => {
    const order = ['wong', 'sato', 'mina', 'manuk', 'taru', 'buku'] as const;
    for (let week = 0; week < 30; week++) {
      const day = new Date(2012, 5, 17 + week * 7);
      expect(getIngkel(day)).toBe(order[week % 6]);
    }
  });
});

describe('jejepan — structure', () => {
  it('shares the Sadwara index (parallel 6-day cycle)', () => {
    const jejepanByIndex = ['mina', 'taru', 'sato', 'patra', 'wong', 'paksi'] as const;
    const sadwaraByIndex = ['tungleh', 'aryang', 'urukung', 'paniron', 'was', 'maulu'] as const;
    for (let pd = 0; pd < 12; pd++) {
      const day = new Date(2012, 5, 17 + pd);
      expect(jejepanByIndex.indexOf(getJejepan(day))).toBe(sadwaraByIndex.indexOf(getSadwara(day)));
    }
  });
});

describe('ingkel & jejepan — input handling', () => {
  it('throw INVALID_DATE on a NaN Date or a non-Date argument', () => {
    expect.assertions(4);
    for (const fn of [getIngkel, getJejepan]) {
      try {
        fn(new Date(Number.NaN));
      } catch (err) {
        expect((err as WarigaError).code).toBe('INVALID_DATE');
      }
      try {
        fn('2026-01-01' as unknown as Date);
      } catch (err) {
        expect((err as WarigaError).code).toBe('INVALID_DATE');
      }
    }
  });
});
