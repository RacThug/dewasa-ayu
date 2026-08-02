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

// --- Dewasa (auspiciousness) layer ---

/** The six supported ceremony types. See ENG-001 and PRD §4. */
export type CeremonyId =
  | 'pawiwahan'
  | 'manusa_yadnya'
  | 'dewa_yadnya'
  | 'pitra_yadnya'
  | 'pembangunan'
  | 'usaha';

/** Effect direction of a padewasan in a given context. */
export type DewasaPolarity = 'ayu' | 'ala';

/** Ala severity: 'critical' can force a 'bad' verdict; 'minor' only deducts points. */
export type DewasaSeverity = 'critical' | 'minor';

/** A padewasan's resolved effect for one ceremony. */
export interface DewasaEffect {
  polarity: DewasaPolarity;
  /** Only meaningful when polarity is 'ala'. */
  severity?: DewasaSeverity;
  /** Short user-facing explanation (Indonesian). */
  note: string;
}

/**
 * A named padewasan, stored as DATA so a wariga expert can audit it and it can be
 * extended without touching engine code. The condition computes a mechanical fact;
 * the effect is context-relative (a rule can be ayu for one ceremony, ala for
 * another — see Kala Gotongan). Every seed rule is UNVERIFIED (`verified: false`)
 * until an expert / authoritative book confirms it; consumers MUST surface that as
 * "estimasi". Never fabricate a condition — leave a rule out until its source is known.
 */
export interface DewasaRule {
  id: string;
  /** Padewasan name (Indonesian). */
  name: string;
  /** General tendency only; the real effect is per-ceremony in `effects`. */
  generalCategory: 'ayu' | 'ala' | 'contextual';
  /** Wariga components the condition reads (documentation). */
  basis: string[];
  /** Human-readable condition, for audit/display (Indonesian). */
  conditionText: string;
  /** Effect per ceremony. A ceremony absent here = rule not applicable to it. */
  effects: Partial<Record<CeremonyId, DewasaEffect>>;
  source: string;
  verified: boolean;
}

/** Precomputed facts a rule condition may need, built by the engine from a date. */
export interface DewasaContext {
  info: BalineseDate;
  /** Distinct Astawara names across the current wuku's 7 days (for 'tanpa_guru'). */
  wukuAstawara: readonly Astawara[];
  /** Count of the current wuku's 7 days that are Sadwara 'was' (for 'was_penganten'). */
  wukuWasCount: number;
}

/** A rule plus its condition predicate. Lives in `@dewasa-ayu/ceremony-rules`. */
export interface DewasaRuleDef extends DewasaRule {
  /** Pure predicate: true when the padewasan is active for the context's date. */
  match: (ctx: DewasaContext) => boolean;
}

/** A padewasan detected as active on a date, resolved for one ceremony. */
export interface DewasaInfo {
  id: string;
  name: string;
  type: DewasaPolarity;
  severity?: DewasaSeverity;
  /** Why it applies (Indonesian, user-facing). */
  note: string;
  source: string;
  /** True until expert-verified — UI must show an "estimasi" tag. */
  estimated: boolean;
}

/** Active padewasan on a date, split by direction and resolved for a ceremony. */
export interface DewasaDetection {
  ayu: DewasaInfo[];
  ala: DewasaInfo[];
}

// --- Scoring / evaluation (PRD §6) ---

/** Overall verdict for a date + ceremony. */
export type Rating = 'ayu' | 'caution' | 'bad';

/**
 * Per-ceremony scoring weights (PRD §6.1). Penalties are stored positive and
 * subtracted. Factors the sources don't define yet (penanggal-number, a standalone
 * ingkel/jejepan factor) are intentionally omitted rather than fabricated.
 */
export interface ScoringWeights {
  saptawara: number;
  wuku: number;
  sasih: number;
  penanggal: number; // bonus for not being in pangelong (when the ceremony requires it)
  sangawara: number; // bonus for Tulus/Dadi
  dewasaAyuBonus: number; // per detected dewasa ayu
  /** Per critical ala. Reserved: no padewasan is classified critical yet (all minor). */
  criticalAlaPenalty: number;
  minorAlaPenalty: number; // per minor ala (subtracted)
}

/** One ceremony's evaluation config. Data lives in `@dewasa-ayu/ceremony-rules`. */
export interface CeremonyConfig {
  id: CeremonyId;
  name: string; // Indonesian, user-facing
  weights: ScoringWeights;
  /** 0-based sasih indices favoured / forbidden for this ceremony (PRD §4.1). */
  sasihGood: number[];
  sasihBad: number[];
  /** Wuku that are inauspicious for this ceremony (PRD §4.3). */
  forbiddenWuku: Wuku[];
  /** Saptawara considered generally good (reference §6 — "umum"). */
  saptawaraGood: Saptawara[];
  /** When true, a pangelong (waning) day is penalised / can downgrade the rating. */
  requirePenanggal: boolean;
}

/** One scored factor in an evaluation. */
export interface Check {
  factor: string;
  passed: boolean;
  weight: number;
  /** Actual contribution to the score (>= 0 for factors/ayu, < 0 for ala). */
  contribution: number;
  note?: string;
}

/** Full evaluation of a date for a ceremony (PRD §6). */
export interface Evaluation {
  ceremony: CeremonyId;
  rating: Rating;
  score: number;
  maxScore: number;
  /** 0-100; negative scores clamp to 0. */
  pct: number;
  checks: Check[];
  dewasaAyu: DewasaInfo[];
  dewasaAla: DewasaInfo[];
  /** True while the verdict relies on unverified rules/data — UI shows "estimasi". */
  estimated: boolean;
}

/** A date paired with its full decomposition and evaluation (search/month results). */
export interface EvaluatedDate {
  date: Date;
  info: BalineseDate;
  evaluation: Evaluation;
}

/** Result of `findGoodDates`. */
export interface FindGoodDatesResult {
  dates: EvaluatedDate[];
  /** True when the 365-day scan cap was hit before `count` ayu dates were found. */
  capReached: boolean;
}

/** Result of `getMonthEvaluation` — one Gregorian month evaluated for a ceremony. */
export interface MonthData {
  year: number;
  month: number; // 1-12 (Gregorian)
  ceremony: CeremonyId;
  /** One entry per day, index 0 = day 1. */
  days: EvaluatedDate[];
  summary: {
    ayuCount: number;
    cautionCount: number;
    badCount: number;
    /** Up to 5 highest-scored ayu dates, sorted descending by score. */
    topDates: EvaluatedDate[];
  };
}
