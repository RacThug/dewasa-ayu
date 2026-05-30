import { BalineseDate } from 'balinese-date-js-lib';
import { describe, expect, it } from 'vitest';

import { WarigaError } from './errors';
import { getSasihInfo } from './sasih';

const RANGE_START = new Date(2015, 0, 1);
const RANGE_END = new Date(2034, 11, 31);

describe('getSasihInfo — matches the oracle for every day in 2015–2034', () => {
  it('sasih (incl. nampih), penanggal/pangelong, purnama/tilem, and saka', () => {
    const mismatches: string[] = [];
    let cur = new Date(RANGE_START);
    while (cur <= RANGE_END) {
      const o = new BalineseDate(cur);
      const s = getSasihInfo(cur);
      const iso = cur.toISOString().slice(0, 10);

      const name = (s.isNampih ? 'nampih ' : s.isMala ? 'mala ' : '') + s.name;
      if (name !== o.sasih.name.toLowerCase())
        mismatches.push(`${iso} sasih ${name}!=${o.sasih.name}`);

      const oPangelong = o.sasihDayInfo.name === 'Pangelong' || o.sasihDayInfo.name === 'Tilem';
      const oLinear = oPangelong ? 15 + o.sasihDay[0]! : o.sasihDay[0]!;
      const myLinear = s.isPangelong ? 15 + s.penanggal : s.penanggal;
      if (myLinear !== oLinear) mismatches.push(`${iso} penanggal ${myLinear}!=${oLinear}`);
      if (s.isPangelong !== oPangelong) mismatches.push(`${iso} pangelong`);
      if (s.isPurnama !== (o.sasihDayInfo.name === 'Purnama')) mismatches.push(`${iso} purnama`);
      if (s.isTilem !== (o.sasihDayInfo.name === 'Tilem')) mismatches.push(`${iso} tilem`);
      if (s.tahunSaka !== o.saka) mismatches.push(`${iso} saka ${s.tahunSaka}!=${o.saka}`);

      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(mismatches).toEqual([]);
  });

  it('flags at least one nampih (intercalary) month in range', () => {
    let nampihDays = 0;
    let cur = new Date(RANGE_START);
    while (cur <= RANGE_END) {
      if (getSasihInfo(cur).isNampih) nampihDays++;
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(nampihDays).toBeGreaterThan(0);
  });
});

describe('getSasihInfo — anchors verified against the printed Bali 2026 calendar', () => {
  it('Purnama Kapitu on 2026-01-03 and Tilem Kapitu on 2026-01-18', () => {
    const purnama = getSasihInfo(new Date(2026, 0, 3));
    expect(purnama.name).toBe('kapitu');
    expect(purnama.isPurnama).toBe(true);
    expect(purnama.penanggal).toBe(15);

    const tilem = getSasihInfo(new Date(2026, 0, 18));
    expect(tilem.name).toBe('kapitu');
    expect(tilem.isTilem).toBe(true);
    expect(tilem.isPangelong).toBe(true);
    expect(tilem.penanggal).toBe(15);
  });

  it('Nyepi: Penanggal 1 Kadasa on 2026-03-19 begins Saka 1948', () => {
    const nyepi = getSasihInfo(new Date(2026, 2, 19));
    expect(nyepi.name).toBe('kadasa');
    expect(nyepi.penanggal).toBe(1);
    expect(nyepi.isPangelong).toBe(false);
    expect(nyepi.tahunSaka).toBe(1948);

    // The day before Nyepi is Tilem Kasanga, still in the old Saka year.
    const tilemKasanga = getSasihInfo(new Date(2026, 2, 18));
    expect(tilemKasanga.name).toBe('kasanga');
    expect(tilemKasanga.isTilem).toBe(true);
    expect(tilemKasanga.tahunSaka).toBe(1947);
  });
});

describe('getSasihInfo — input and range handling', () => {
  it('throws INVALID_DATE on a NaN Date or a non-Date argument', () => {
    expect.assertions(2);
    try {
      getSasihInfo(new Date(Number.NaN));
    } catch (err) {
      expect((err as WarigaError).code).toBe('INVALID_DATE');
    }
    try {
      getSasihInfo('2026-01-01' as unknown as Date);
    } catch (err) {
      expect((err as WarigaError).code).toBe('INVALID_DATE');
    }
  });

  it('throws OUT_OF_RANGE before 2000 and after 2100', () => {
    expect(() => getSasihInfo(new Date(1999, 0, 1))).toThrowError(WarigaError);
    expect(() => getSasihInfo(new Date(2101, 0, 1))).toThrowError(WarigaError);
  });
});
