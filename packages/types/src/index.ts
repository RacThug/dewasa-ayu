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
