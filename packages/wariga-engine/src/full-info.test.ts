import { BalineseDate } from 'balinese-date-js-lib';
import { describe, expect, it } from 'vitest';

import { WarigaError } from './errors';
import { getFullInfo } from './full-info';

const RANGE_START = new Date(2015, 0, 1);
const RANGE_END = new Date(2034, 11, 31);

describe('getFullInfo — assembles the full decomposition matching the oracle (2015–2034)', () => {
  it('every field is wired to the correct cycle', () => {
    const mismatches: string[] = [];
    let cur = new Date(RANGE_START);
    while (cur <= RANGE_END) {
      const o = new BalineseDate(cur);
      const info = getFullInfo(cur);
      const iso = cur.toISOString().slice(0, 10);

      if (info.pawukonDay !== o.wuku.id * 7 + o.saptaWara.id) mismatches.push(`${iso} pawukonDay`);
      if (info.wuku !== o.wuku.name.toLowerCase()) mismatches.push(`${iso} wuku`);
      if (info.saptawara !== o.saptaWara.name.toLowerCase()) mismatches.push(`${iso} saptawara`);
      if (info.pancawara !== o.pancaWara.name.toLowerCase()) mismatches.push(`${iso} pancawara`);
      if (info.triwara !== o.triWara.name.toLowerCase()) mismatches.push(`${iso} triwara`);
      if (info.sadwara !== o.sadWara.name.toLowerCase()) mismatches.push(`${iso} sadwara`);
      if (info.dasawara !== o.dasaWara.name.toLowerCase()) mismatches.push(`${iso} dasawara`);
      if (info.dwiwara !== o.dwiWara.name.toLowerCase()) mismatches.push(`${iso} dwiwara`);
      if (info.astawara !== o.astaWara.name.toLowerCase()) mismatches.push(`${iso} astawara`);
      if (info.sangawara !== o.sangaWara.name.toLowerCase()) mismatches.push(`${iso} sangawara`);
      if (info.caturwara !== o.caturWara.name.toLowerCase()) mismatches.push(`${iso} caturwara`);
      if (info.ekawara !== (o.ekaWara.id === 1 ? 'luang' : null)) mismatches.push(`${iso} ekawara`);
      if (info.ingkel !== o.ingkel.name.toLowerCase()) mismatches.push(`${iso} ingkel`);
      if (info.jejepan !== o.jejepan.name.toLowerCase()) mismatches.push(`${iso} jejepan`);
      if (info.totalUrip !== o.saptaWara.urip + o.pancaWara.urip)
        mismatches.push(`${iso} totalUrip`);

      // Sasih is fully validated in sasih.test.ts; here we only confirm it is wired.
      const sasihName =
        (info.sasih.isNampih ? 'nampih ' : info.sasih.isMala ? 'mala ' : '') + info.sasih.name;
      if (sasihName !== o.sasih.name.toLowerCase()) mismatches.push(`${iso} sasih.name`);
      if (info.sasih.tahunSaka !== o.saka) mismatches.push(`${iso} sasih.tahunSaka`);

      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(mismatches).toEqual([]);
  });
});

describe('getFullInfo — normalisation and edge handling', () => {
  it('normalises gregorian to UTC midnight, dropping any time component', () => {
    const info = getFullInfo(new Date(2026, 0, 3, 15, 30, 45));
    expect(info.gregorian.getTime()).toBe(Date.UTC(2026, 0, 3));
  });

  it('throws INVALID_DATE on a NaN Date or a non-Date argument', () => {
    expect.assertions(2);
    try {
      getFullInfo(new Date(Number.NaN));
    } catch (err) {
      expect((err as WarigaError).code).toBe('INVALID_DATE');
    }
    try {
      getFullInfo('2026-01-01' as unknown as Date);
    } catch (err) {
      expect((err as WarigaError).code).toBe('INVALID_DATE');
    }
  });

  it('throws OUT_OF_RANGE outside the Sasih range (propagated from getSasihInfo)', () => {
    expect(() => getFullInfo(new Date(2002, 0, 1))).toThrowError(WarigaError);
    expect(() => getFullInfo(new Date(2101, 0, 1))).toThrowError(WarigaError);
  });
});
