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
