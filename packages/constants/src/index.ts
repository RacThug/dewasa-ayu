/**
 * Static Wariga reference data (Wuku, Wewaran names, urip tables, epochs).
 * The engine imports these but does not own the data. See ENG-001 §Constants.
 *
 * Array order is the canonical order; the array index is the cycle position used
 * by the engine. Urip arrays are indexed in the same order as their name arrays.
 */
import type {
  Astawara,
  Caturwara,
  Dasawara,
  Ingkel,
  Jejepan,
  Pancawara,
  Sadwara,
  Sangawara,
  Saptawara,
  Sasih,
  SemVer,
  Triwara,
  Wuku,
} from '@dewasa-ayu/types';

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

/** Saptawara (7-day week) names, Redite = index 0. */
export const SAPTAWARA_NAMES = [
  'redite',
  'soma',
  'anggara',
  'buda',
  'wraspati',
  'sukra',
  'saniscara',
] as const satisfies readonly Saptawara[];

/** Saptawara urip (neptu), indexed Redite … Saniscara. */
export const SAPTAWARA_URIP = [5, 4, 3, 7, 8, 6, 9] as const;

/** Pancawara (5-day week) names, Umanis = index 0. */
export const PANCAWARA_NAMES = [
  'umanis',
  'paing',
  'pon',
  'wage',
  'kliwon',
] as const satisfies readonly Pancawara[];

/** Pancawara urip (neptu), indexed Umanis … Kliwon. */
export const PANCAWARA_URIP = [5, 9, 7, 4, 8] as const;

/** Triwara (3-day week) names. */
export const TRIWARA_NAMES = ['pasah', 'beteng', 'kajeng'] as const satisfies readonly Triwara[];

/** Sadwara (6-day week) names. */
export const SADWARA_NAMES = [
  'tungleh',
  'aryang',
  'urukung',
  'paniron',
  'was',
  'maulu',
] as const satisfies readonly Sadwara[];

/** Dasawara (10-day week) names, indexed by (total urip mod 10). */
export const DASAWARA_NAMES = [
  'pandita',
  'pati',
  'suka',
  'duka',
  'sri',
  'manuh',
  'manusa',
  'raja',
  'dewa',
  'raksasa',
] as const satisfies readonly Dasawara[];

/** Astawara (8-day week) names. */
export const ASTAWARA_NAMES = [
  'sri',
  'indra',
  'guru',
  'yama',
  'ludra',
  'brahma',
  'kala',
  'uma',
] as const satisfies readonly Astawara[];

/** Sangawara (9-day week) names. */
export const SANGAWARA_NAMES = [
  'dangu',
  'jangur',
  'gigis',
  'nohan',
  'ogan',
  'erangan',
  'urungan',
  'tulus',
  'dadi',
] as const satisfies readonly Sangawara[];

/** Caturwara (4-day week) names. */
export const CATURWARA_NAMES = [
  'sri',
  'laba',
  'jaya',
  'menala',
] as const satisfies readonly Caturwara[];

// --- Pawukon-derived cycles (not Wewaran) ---

/** Ingkel category names, indexed by `wukuIndex % 6` (Wong = 0 … Buku = 5). */
export const INGKEL_NAMES = [
  'wong',
  'sato',
  'mina',
  'manuk',
  'taru',
  'buku',
] as const satisfies readonly Ingkel[];

/** Jejepan names, indexed by `pawukonDay % 6` (Mina = 0 … Paksi = 5). */
export const JEJEPAN_NAMES = [
  'mina',
  'taru',
  'sato',
  'patra',
  'wong',
  'paksi',
] as const satisfies readonly Jejepan[];

/** The 12 sasih in canonical order; index = sasih id (Kasa = 0 … Sadha = 11). */
export const SASIH_NAMES = [
  'kasa',
  'karo',
  'katiga',
  'kapat',
  'kalima',
  'kanem',
  'kapitu',
  'kawolu',
  'kasanga',
  'kadasa',
  'destha',
  'sadha',
] as const satisfies readonly Sasih[];

// Generated Sasih lookup table (SASIH_EPOCH, SASIH_NGUNALATRI_DAYS, SASIH_MONTH_*).
export * from './sasih-data';
