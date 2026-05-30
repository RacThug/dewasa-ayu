/**
 * Static Wariga reference data (Wuku, Wewaran, Sasih names, epochs, urip tables).
 * The engine imports these but does not own the data. See ENG-001 §Constants.
 */
import type { SemVer, Wuku } from '@dewasa-ayu/types';

export const CONSTANTS_VERSION: SemVer = '0.0.0';

/** Length of the Pawukon cycle in days (30 wuku × 7 days). */
export const PAWUKON_CYCLE = 210;

/**
 * Pawukon day 0 (Redite Sinta) as a UTC timestamp: 17 June 2012 (a Sunday = Redite).
 *
 * Calibrated against the balinese-date-js-lib oracle: this epoch reproduces the
 * oracle's pawukon day for every date in 2000–2030 (0 mismatches) and the real-world
 * anchor Galungan 2024-02-28 = Buda Kliwon Dungulan. NOTE: this corrects the original
 * ENG-001 draft value (11 June 2012), which was 6 days early and actually lands on
 * Soma Watugunung, not Redite Sinta.
 */
export const PAWUKON_EPOCH = Date.UTC(2012, 5, 17);

/** The 30 wuku in canonical order; array index = Pawukon week number (Sinta = 0). */
export const WUKU_NAMES = [
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
] as const satisfies readonly Wuku[];
