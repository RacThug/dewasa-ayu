import { CEREMONY_IDS, DEWASA_RULES } from '@dewasa-ayu/ceremony-rules';
import type { CeremonyId, DewasaDetection } from '@dewasa-ayu/types';
import { BalineseDate as OracleDate } from 'balinese-date-js-lib';
import { describe, expect, it } from 'vitest';

import { detectDewasa } from './detect-dewasa';
import { WarigaError } from './errors';
import { getFullInfo } from './full-info';

const START = new Date(2024, 0, 1);
const END = new Date(2026, 11, 31);

// Independent, oracle-derived expectations for each rule's CONDITION (not its cultural
// truth — that needs a human expert). The mechanics must match the oracle exactly.
const uripOf = (o: OracleDate): number => o.saptaWara.urip + o.pancaWara.urip;

const AYU_NULUS_PEN: Record<string, readonly number[]> = {
  redite: [6],
  soma: [3],
  anggara: [7],
  buda: [12, 13],
  saniscara: [5],
};
function isAyuNulus(o: OracleDate): boolean {
  const pangelong = o.sasihDayInfo.name === 'Pangelong' || o.sasihDayInfo.name === 'Tilem';
  if (pangelong) return false;
  const penanggal = o.sasihDay[0] ?? -1;
  return (AYU_NULUS_PEN[o.saptaWara.name.toLowerCase()] ?? []).includes(penanggal);
}

const LEBUR_AWU: Record<string, string> = {
  redite: 'indra',
  soma: 'uma',
  anggara: 'ludra',
  buda: 'brahma',
  wraspati: 'guru',
  sukra: 'sri',
  saniscara: 'yama',
};
const isLeburAwu = (o: OracleDate): boolean =>
  LEBUR_AWU[o.saptaWara.name.toLowerCase()] === o.astaWara.name.toLowerCase();

/** Does the wuku containing `date` have an Astawara 'Guru' on any of its 7 days? */
function wukuHasGuru(date: Date): boolean {
  const offset = new OracleDate(date).saptaWara.id; // 0..6 position within the wuku
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset + i);
    if (new OracleDate(d).astaWara.name.toLowerCase() === 'guru') return true;
  }
  return false;
}

const has = (det: DewasaDetection, id: string): boolean =>
  [...det.ayu, ...det.ala].some((d) => d.id === id);

describe('detectDewasa — rule conditions match the oracle for every day in 2024–2026', () => {
  it('the seven computable padewasan fire exactly when their condition holds', () => {
    const mismatches: string[] = [];
    const fires: Record<string, number> = {};
    let cur = new Date(START);
    while (cur <= END) {
      const o = new OracleDate(cur);
      const info = getFullInfo(cur);
      const iso = cur.toISOString().slice(0, 10);
      const urip = uripOf(o);

      const check = (id: string, ceremony: CeremonyId, expected: boolean): void => {
        const got = has(detectDewasa(info, ceremony), id);
        if (got !== expected) mismatches.push(`${iso} ${id} got=${got} want=${expected}`);
        if (got) fires[id] = (fires[id] ?? 0) + 1;
      };

      check('ingkel_wong', 'pawiwahan', o.ingkel.name.toLowerCase() === 'wong');
      check('semut_sadulur', 'pitra_yadnya', urip === 13);
      check('kala_gotongan', 'pitra_yadnya', urip === 14);
      check('lebur_awu', 'pembangunan', isLeburAwu(o));
      check('tanpa_guru', 'usaha', !wukuHasGuru(cur));
      check('ayu_nulus', 'dewa_yadnya', isAyuNulus(o));

      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(mismatches).toEqual([]);
    // Each rule must actually fire at least once in range (guards against a dead rule).
    for (const id of [
      'ingkel_wong',
      'semut_sadulur',
      'kala_gotongan',
      'lebur_awu',
      'tanpa_guru',
      'ayu_nulus',
    ]) {
      expect(fires[id] ?? 0).toBeGreaterThan(0);
    }
  });
});

describe('detectDewasa — effect resolution and posture', () => {
  it('is context-relative: Kala Gotongan is ala for ngaben but ayu for starting a business', () => {
    // Find a urip-14 day in range.
    let day: Date | null = null;
    let cur = new Date(START);
    while (cur <= END && !day) {
      if (getFullInfo(cur).totalUrip === 14) day = new Date(cur);
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    expect(day).not.toBeNull();
    const info = getFullInfo(day!);

    const pitra = detectDewasa(info, 'pitra_yadnya');
    expect(pitra.ala.some((d) => d.id === 'kala_gotongan')).toBe(true);
    expect(pitra.ayu.some((d) => d.id === 'kala_gotongan')).toBe(false);

    const usaha = detectDewasa(info, 'usaha');
    expect(usaha.ayu.some((d) => d.id === 'kala_gotongan')).toBe(true);
    expect(usaha.ala.some((d) => d.id === 'kala_gotongan')).toBe(false);
  });

  it('only surfaces a rule for ceremonies its source supports', () => {
    // A urip-13 day: Semut Sadulur applies to ngaben, but not to a wedding.
    let day: Date | null = null;
    let cur = new Date(START);
    while (cur <= END && !day) {
      if (getFullInfo(cur).totalUrip === 13) day = new Date(cur);
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    const info = getFullInfo(day!);
    expect(has(detectDewasa(info, 'pitra_yadnya'), 'semut_sadulur')).toBe(true);
    expect(has(detectDewasa(info, 'pawiwahan'), 'semut_sadulur')).toBe(false);
  });

  it('flags every detected padewasan as estimated (no seed rule is verified yet)', () => {
    let cur = new Date(START);
    while (cur <= END) {
      const info = getFullInfo(cur);
      for (const ceremony of CEREMONY_IDS) {
        const det = detectDewasa(info, ceremony);
        for (const d of [...det.ayu, ...det.ala]) {
          expect(d.estimated).toBe(true);
          expect(d.source.length).toBeGreaterThan(0);
        }
      }
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 14);
    }
  });

  it('throws UNKNOWN_CEREMONY for an unsupported ceremony id', () => {
    const info = getFullInfo(new Date(2026, 0, 1));
    expect.assertions(1);
    try {
      detectDewasa(info, 'nikah' as CeremonyId);
    } catch (err) {
      expect((err as WarigaError).code).toBe('UNKNOWN_CEREMONY');
    }
  });
});

describe('detectDewasa — Was Penganten (computable but mapped to no ceremony yet)', () => {
  it('its predicate detects two Was days in a wuku, yet it never surfaces for the six ceremonies', () => {
    const rule = DEWASA_RULES.find((r) => r.id === 'was_penganten')!;
    const info = getFullInfo(new Date(2026, 0, 1));
    expect(rule.match({ info, wukuAstawara: [], wukuWasCount: 2 })).toBe(true);
    expect(rule.match({ info, wukuAstawara: [], wukuWasCount: 1 })).toBe(false);
    for (const ceremony of CEREMONY_IDS) {
      expect(has(detectDewasa(info, ceremony), 'was_penganten')).toBe(false);
    }
  });
});
