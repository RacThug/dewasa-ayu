import type { Ekawara } from '@dewasa-ayu/types';
import { BalineseDate } from 'balinese-date-js-lib';
import { describe, expect, it } from 'vitest';

import {
  getAstawara,
  getCaturwara,
  getDasawara,
  getDwiwara,
  getEkawara,
  getPancawara,
  getSadwara,
  getSangawara,
  getSaptawara,
  getTotalUrip,
  getTriwara,
} from './wewaran';

// The oracle (balinese-date-js-lib) is the provisional ground truth. Each wewaran
// function is checked against it for every day in 2015–2034.
const RANGE_START = new Date(2015, 0, 1);
const RANGE_END = new Date(2034, 11, 31);

function eachDay(visit: (date: Date, oracle: BalineseDate) => void): void {
  let cur = new Date(RANGE_START);
  while (cur <= RANGE_END) {
    visit(cur, new BalineseDate(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
  }
}

describe('wewaran — matches the oracle for every day in 2015–2034', () => {
  it('every cycle except ekawara', () => {
    const mismatches: string[] = [];
    eachDay((date, o) => {
      const iso = date.toISOString().slice(0, 10);
      if (getSaptawara(date) !== o.saptaWara.name.toLowerCase())
        mismatches.push(`${iso} saptawara`);
      if (getPancawara(date) !== o.pancaWara.name.toLowerCase())
        mismatches.push(`${iso} pancawara`);
      if (getTriwara(date) !== o.triWara.name.toLowerCase()) mismatches.push(`${iso} triwara`);
      if (getSadwara(date) !== o.sadWara.name.toLowerCase()) mismatches.push(`${iso} sadwara`);
      if (getDasawara(date) !== o.dasaWara.name.toLowerCase()) mismatches.push(`${iso} dasawara`);
      if (getDwiwara(date) !== o.dwiWara.name.toLowerCase()) mismatches.push(`${iso} dwiwara`);
      if (getAstawara(date) !== o.astaWara.name.toLowerCase()) mismatches.push(`${iso} astawara`);
      if (getSangawara(date) !== o.sangaWara.name.toLowerCase())
        mismatches.push(`${iso} sangawara`);
      if (getCaturwara(date) !== o.caturWara.name.toLowerCase())
        mismatches.push(`${iso} caturwara`);
    });
    expect(mismatches).toEqual([]);
  });

  it('ekawara (luang only when total urip is odd)', () => {
    const mismatches: string[] = [];
    eachDay((date, o) => {
      const expected = o.ekaWara.id === 1 ? 'luang' : null;
      if (getEkawara(date) !== expected) mismatches.push(date.toISOString().slice(0, 10));
    });
    expect(mismatches).toEqual([]);
  });

  it('total urip equals the oracle saptawara + pancawara urip', () => {
    const mismatches: string[] = [];
    eachDay((date, o) => {
      if (getTotalUrip(date) !== o.saptaWara.urip + o.pancaWara.urip) {
        mismatches.push(date.toISOString().slice(0, 10));
      }
    });
    expect(mismatches).toEqual([]);
  });
});

describe('wewaran — anchors and shape', () => {
  it('decomposes the epoch 2012-06-17 (Redite Paing)', () => {
    const epoch = new Date(2012, 5, 17);
    expect(getSaptawara(epoch)).toBe('redite');
    expect(getPancawara(epoch)).toBe('paing');
  });

  it('produces both luang and null for ekawara across a cycle', () => {
    const values = new Set<Ekawara | null>();
    for (let i = 0; i < 30; i++) values.add(getEkawara(new Date(2024, 0, 1 + i)));
    expect(values.has('luang')).toBe(true);
    expect(values.has(null)).toBe(true);
  });

  it('Astawara repeats Kala three times (Kala Tiga: pawukon days 70, 71, 72)', () => {
    expect(getAstawara(new Date(2012, 5, 17 + 70))).toBe('kala');
    expect(getAstawara(new Date(2012, 5, 17 + 71))).toBe('kala');
    expect(getAstawara(new Date(2012, 5, 17 + 72))).toBe('kala');
  });

  it('Caturwara repeats Jaya around pawukon day 71 (Jaya Tiga)', () => {
    expect(getCaturwara(new Date(2012, 5, 17 + 70))).toBe('jaya');
    expect(getCaturwara(new Date(2012, 5, 17 + 71))).toBe('jaya');
  });

  it('Sangawara opens with four consecutive Dangu', () => {
    for (let pd = 0; pd < 4; pd++) {
      expect(getSangawara(new Date(2012, 5, 17 + pd))).toBe('dangu');
    }
  });
});
