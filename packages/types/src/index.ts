/**
 * Shared types for Dewasa Ayu.
 *
 * The full engine contract (ENG-001) and persisted shapes (DB-001) land
 * incrementally. Types are added as each engine slice is implemented.
 */
export type SemVer = `${number}.${number}.${number}`;

export const TYPES_PACKAGE = '@dewasa-ayu/types' as const;

/**
 * The 30 Pawukon weeks (wuku) in canonical order: Sinta = index 0 …
 * Watugunung = index 29. See ENG-001 and docs/specs/wariga-engine-reference.md §4.
 */
export type Wuku =
  | 'sinta'
  | 'landep'
  | 'ukir'
  | 'kulantir'
  | 'tolu'
  | 'gumbreg'
  | 'wariga'
  | 'warigadean'
  | 'julungwangi'
  | 'sungsang'
  | 'dungulan'
  | 'kuningan'
  | 'langkir'
  | 'medangsia'
  | 'pujut'
  | 'pahang'
  | 'krulut'
  | 'merakih'
  | 'tambir'
  | 'medangkungan'
  | 'matal'
  | 'uye'
  | 'menail'
  | 'prangbakat'
  | 'bala'
  | 'ugu'
  | 'wayang'
  | 'klawu'
  | 'dukut'
  | 'watugunung';

// --- Wewaran (parallel day cycles) ---

export type Saptawara = 'redite' | 'soma' | 'anggara' | 'buda' | 'wraspati' | 'sukra' | 'saniscara';

export type Pancawara = 'umanis' | 'paing' | 'pon' | 'wage' | 'kliwon';

export type Triwara = 'pasah' | 'beteng' | 'kajeng';

export type Sadwara = 'tungleh' | 'aryang' | 'urukung' | 'paniron' | 'was' | 'maulu';

export type Dwiwara = 'menga' | 'pepet';

export type Ekawara = 'luang';

export type Dasawara =
  | 'pandita'
  | 'pati'
  | 'suka'
  | 'duka'
  | 'sri'
  | 'manuh'
  | 'manusa'
  | 'raja'
  | 'dewa'
  | 'raksasa';

export type Astawara = 'sri' | 'indra' | 'guru' | 'yama' | 'ludra' | 'brahma' | 'kala' | 'uma';

export type Sangawara =
  | 'dangu'
  | 'jangur'
  | 'gigis'
  | 'nohan'
  | 'ogan'
  | 'erangan'
  | 'urungan'
  | 'tulus'
  | 'dadi';

export type Caturwara = 'sri' | 'laba' | 'jaya' | 'menala';

export type Sasih =
  | 'kasa'
  | 'karo'
  | 'katiga'
  | 'kapat'
  | 'kalima'
  | 'kanem'
  | 'kapitu'
  | 'kawolu'
  | 'kasanga'
  | 'kadasa'
  | 'destha'
  | 'sadha';

// --- Pawukon-derived cycles (not Wewaran) ---

/**
 * Ingkel — a 6-fold weekly category that is constant within each wuku
 * (`wukuIndex % 6`), cycling every 6 wuku (42 days). See ENG-001.
 */
export type Ingkel = 'wong' | 'sato' | 'mina' | 'manuk' | 'taru' | 'buku';

/** Jejepan — a 6-day cycle on the Pawukon day (`pawukonDay % 6`). See ENG-001. */
export type Jejepan = 'mina' | 'taru' | 'sato' | 'patra' | 'wong' | 'paksi';

/** Lunar decomposition of a date (penanggal/pangelong + sasih). See ENG-001. */
export interface SasihInfo {
  /** 0-based index into the 12 sasih (0 = Kasa … 11 = Sadha). */
  index: number;
  /** Canonical sasih name. */
  name: Sasih;
  /** 1-15. Paro terang = penanggal; paro gelap = pangelong. */
  penanggal: number;
  /** True in the waning half (pangelong). */
  isPangelong: boolean;
  /** Full moon: penanggal 15 of the waxing half. */
  isPurnama: boolean;
  /** New moon: pangelong 15 of the waning half. */
  isTilem: boolean;
  /** Intercalary (nampih) month. */
  isNampih: boolean;
  /** Skipped (mala) month. */
  isMala: boolean;
  /** True when the value is approximate (always false for table-backed dates). */
  isEstimated: boolean;
  /** Tahun Saka for this sasih. */
  tahunSaka: number;
}

/**
 * Full Balinese-calendar decomposition of a Gregorian date: Pawukon, every
 * Wewaran, the Pawukon-derived cycles (Ingkel, Jejepan), Sasih, and total urip.
 * Produced by `getFullInfo` and consumed by the dewasa/scoring layer. See ENG-001.
 */
export interface BalineseDate {
  /** Original Gregorian input, normalised to UTC midnight. */
  gregorian: Date;
  /** Pawukon day 0-209 (mod 210 from the Pawukon epoch). */
  pawukonDay: number;
  /** Wuku (1 of 30). */
  wuku: Wuku;
  /** Ekawara: 'luang' only when total urip is odd; null otherwise. */
  ekawara: Ekawara | null;
  dwiwara: Dwiwara;
  triwara: Triwara;
  caturwara: Caturwara;
  pancawara: Pancawara;
  sadwara: Sadwara;
  saptawara: Saptawara;
  astawara: Astawara;
  sangawara: Sangawara;
  dasawara: Dasawara;
  /** Lunar decomposition. */
  sasih: SasihInfo;
  /** Wuku-derived 6-fold weekly category. */
  ingkel: Ingkel;
  /** 6-day cycle on the Pawukon day. */
  jejepan: Jejepan;
  /** Saptawara urip + Pancawara urip for the day. */
  totalUrip: number;
}
