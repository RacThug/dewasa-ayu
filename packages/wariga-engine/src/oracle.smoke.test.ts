import { BalineseDate } from 'balinese-date-js-lib';
import { describe, expect, it } from 'vitest';

// Smoke test for the calculation oracle (balinese-date-js-lib). It only proves the
// oracle is importable and returns sane, internally-consistent Wariga data — it is
// NOT the engine, and it is NOT the source of truth.
//
// IMPORTANT FINDING (2026-05-30): the oracle disagrees with the engine spec's
// "Examples" table (engine.md, claimed from PRD §13.2) on Wuku and Pancawara for 5 of
// 6 reference dates, with non-systematic offsets — while Saptawara matches everywhere.
// So the PRD example matrix is NOT trustworthy as golden data. The tiebreaker is the
// printed Rawi/PHDI calendar (digitised in the Pawukon step). This test therefore
// asserts only (a) the objective Gregorian weekday -> Saptawara mapping and
// (b) structural sanity — never agreement with the unverified example table.

const WUKU = [
  'sinta',
  'landep',
  'ukir',
  'kulantir',
  'tolu',
  'gumbreg',
  'wariga',
  'warigadean',
  'julungwangi',
  'sungsang',
  'dungulan',
  'kuningan',
  'langkir',
  'medangsia',
  'pujut',
  'pahang',
  'krulut',
  'merakih',
  'tambir',
  'medangkungan',
  'matal',
  'uye',
  'menail',
  'prangbakat',
  'bala',
  'ugu',
  'wayang',
  'klawu',
  'dukut',
  'watugunung',
];
const PANCAWARA = ['umanis', 'paing', 'pon', 'wage', 'kliwon'];

describe('oracle: balinese-date-js-lib wiring', () => {
  it('aligns Saptawara to the Gregorian weekday (2024-01-01 = Monday = Soma)', () => {
    const date = new Date(2024, 0, 1);
    const bd = new BalineseDate(date);

    expect(date.getDay()).toBe(1); // Monday
    expect(bd.saptaWara.name.toLowerCase()).toBe('soma');
  });

  it('returns valid, sane Wariga components', () => {
    const bd = new BalineseDate(new Date(2024, 0, 1));

    expect(WUKU).toContain(bd.wuku.name.toLowerCase());
    expect(PANCAWARA).toContain(bd.pancaWara.name.toLowerCase());
    expect(bd.saptaWara.urip).toBeGreaterThan(0);
    expect(bd.pancaWara.urip).toBeGreaterThan(0);
  });
});
