---
id: ENG-001
title: Wariga Engine — Types & Contract
status: Active
version: 0.7.0
owners: [@RacThug]
created: 2026-05-28
updated: 2026-08-25
implements: [17]
supersedes: null
related: [DB-001, API-001, UI-001]
prd_refs: ["§4", "§6", "§10", "§13"]
---

# Wariga Engine — Types & Contract

## Summary

Defines the public contract of `@dewasa-ayu/wariga-engine`: every type, constant, and function consumed by the API, frontend, and tests. The engine converts a Gregorian `Date` into a fully decomposed `BalineseDate` (Pawukon, all Wewaran, Sasih, Ingkel, Jejepan, Urip) and evaluates the date against a configurable ceremony's rules, returning a structured `Evaluation` with rating, score, checks, and dewasa lists. Pure TypeScript, zero runtime dependencies, browser- and Node-compatible.

## Context

The engine is the calculation core of the platform; every other layer (API, web, tests) depends on the types and signatures declared here. Without a stable contract, the API DTOs, the frontend client, and the test reference matrix would each derive their own incompatible mental model from the PRD. This spec freezes the contract before implementation begins so issues [#18](https://github.com/RacThug/dewasa-ayu/issues/18) (DB), [#19](https://github.com/RacThug/dewasa-ayu/issues/19) (API), and [#20](https://github.com/RacThug/dewasa-ayu/issues/20) (UI) can proceed in parallel against a fixed surface.

The engine consumes static reference data (Wuku names, Wewaran tables) from `@dewasa-ayu/constants` and reads ceremony evaluation rules from `@dewasa-ayu/ceremony-rules`. Public types are re-exported via `@dewasa-ayu/types` for cross-package consumption.

## Goals

- Define every public type, function signature, and constant the engine exposes — sufficient to begin implementation without re-reading the PRD.
- Cover MVP scope (6 ceremonies, 7 core calculation functions) **and** Phase 2 scope (Otonan, Mesakapan) so the contract is stable across roadmap phases.
- Document the algorithm shape for non-trivial calculations (Pawukon, Sasih, scoring) precisely enough for two engineers to produce equivalent implementations.
- Specify error handling and edge-case behaviour (Nampih Sasih, Mala Sasih, dates outside the supported range).
- Provide concrete reference examples so any implementation can self-verify against this spec.

## Non-Goals

- **Implementation details.** No internal function decomposition, no module file layout below the public-export level.
- **Performance tuning specifics.** The engine targets <50 ms per `evaluate()` call on Node 20, but micro-optimisation strategies are not prescribed here.
- **Banten / Upakara content.** Materials, offerings, and ritual specifics belong to a future content layer, not the calculation engine.
- **Sasih correction admin UI.** The engine reads correction data via the constants/rules packages; the admin interface is part of the UI spec (Phase 2).

## Detailed Specification

### Constants

All constants live in `@dewasa-ayu/constants`. The engine imports and re-uses them but does not own the data.

#### Epochs

| Constant         | Value                                   | Meaning                                                                                                                                                       |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PAWUKON_EPOCH`  | `Date.UTC(2012, 5, 17)` (17 June 2012)  | Pawukon day 0 = Redite Sinta. Calibrated + locked against the balinese-date-js-lib oracle (0 mismatches across 2000–2030) and the Galungan 2024-02-28 anchor. |
| `SASIH_EPOCH`    | `Date.UTC(2003, 0, 2)` (2 January 2003) | Lunar unit 0: the first clean Penanggal 1 at the start of the supported Sasih range. Generated (not hand-set) — see the Sasih algorithm below.                |
| `SASIH_LAST_DAY` | `35791` (≈ 31 December 2100)            | Largest supported day-number (days since `SASIH_EPOCH`); beyond it `getSasihInfo` throws `OUT_OF_RANGE`.                                                      |
| `PAWUKON_CYCLE`  | `210`                                   | Pawukon cycle length.                                                                                                                                         |

Sasih further depends on three generated lookup arrays — `SASIH_NGUNALATRI_DAYS`, `SASIH_MONTH_SID`, `SASIH_MONTH_KIND`, `SASIH_MONTH_SAKA` — documented in the Sasih algorithm section.

#### Lookup tables (names only — full data in `@dewasa-ayu/constants`)

| Table             | Length | Contents                                                                                                                                            |
| ----------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WUKU_NAMES`      | 30     | Sinta, Landep, …, Watugunung (PRD §13.2 has reference dates for verification).                                                                      |
| `SAPTAWARA_NAMES` | 7      | Redite, Soma, Anggara, Buda, Wraspati, Sukra, Saniscara.                                                                                            |
| `PANCAWARA_NAMES` | 5      | Umanis, Paing, Pon, Wage, Kliwon.                                                                                                                   |
| `TRIWARA_NAMES`   | 3      | Pasah, Beteng, Kajeng.                                                                                                                              |
| `SADWARA_NAMES`   | 6      | Tungleh, Aryang, Urukung, Paniron, Was, Maulu.                                                                                                      |
| `ASTAWARA_NAMES`  | 8      | Sri, Indra, Guru, Yama, Ludra, Brahma, Kala, Uma.                                                                                                   |
| `SANGAWARA_NAMES` | 9      | Dangu, Jangur, Gigis, Nohan, Ogan, Erangan, Urungan, Tulus, Dadi.                                                                                   |
| `DASAWARA_NAMES`  | 10     | Pandita, Pati, Suka, Duka, Sri, Manuh, Manusa, Raja, Dewa, Raksasa.                                                                                 |
| `SASIH_NAMES`     | 12     | Kasa, Karo, Katiga, Kapat, Kalima, Kanem, Kapitu, Kawolu, Kasanga, Kadasa, Destha, Sadha.                                                           |
| `INGKEL_NAMES`    | 6      | Wong, Sato, Mina, Manuk, Taru, Buku. Constant within each wuku week, keyed by `wukuIndex % 6` → cycles every 6 wuku (42 days), 5 times per Pawukon. |
| `JEJEPAN_NAMES`   | 6      | Mina, Taru, Sato, Patra, Wong, Paksi. Keyed by `pawukonDay % 6` (parallel to Sadwara).                                                              |
| `SAPTAWARA_URIP`  | 7      | `[5, 4, 3, 7, 8, 6, 9]` for Redite … Saniscara.                                                                                                     |
| `PANCAWARA_URIP`  | 5      | `[5, 9, 7, 4, 8]` for Umanis … Kliwon.                                                                                                              |

All indices are **0-based** unless explicitly stated.

### Types

All public types live in `@dewasa-ayu/types`. The engine imports and re-exports them.

#### Wewaran string-literal unions

```typescript
export type Saptawara = 'redite' | 'soma' | 'anggara' | 'buda' | 'wraspati' | 'sukra' | 'saniscara';
export type Pancawara = 'umanis' | 'paing' | 'pon' | 'wage' | 'kliwon';
export type Triwara = 'pasah' | 'beteng' | 'kajeng';
export type Sadwara = 'tungleh' | 'aryang' | 'urukung' | 'paniron' | 'was' | 'maulu';
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
export type Caturwara = 'sri' | 'laba' | 'jaya' | 'menala';
export type Dwiwara = 'menga' | 'pepet';
export type Ekawara = 'luang';
```

#### Wuku, Sasih, Ingkel, Jejepan

```typescript
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
  | 'dunggulan'
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

export type Ingkel = 'wong' | 'sato' | 'mina' | 'manuk' | 'taru' | 'buku';

export type Jejepan = 'mina' | 'taru' | 'sato' | 'patra' | 'wong' | 'paksi';
```

#### Ceremony identifiers

```typescript
export type CeremonyId =
  | 'pawiwahan'
  | 'manusa_yadnya'
  | 'dewa_yadnya'
  | 'pitra_yadnya'
  | 'pembangunan'
  | 'usaha';

export type PancaYadnyaCategory = 'manusa_yadnya' | 'dewa_yadnya' | 'pitra_yadnya' | 'cross'; // for pembangunan and usaha
```

#### Dewasa rules (data-driven — supersedes the v0.1.0 code unions)

Named padewasan are **data, not a fixed type union**. The earlier `DewasaAyuCode` /
`DewasaAlaCode` unions are dropped: the authoritative rule set lives in
`@dewasa-ayu/ceremony-rules` as a registry (`DEWASA_RULES`), each entry carrying its
`source` and a `verified` flag — the "rules as data" decision (reference §8). A padewasan's
effect is **context-relative**: it can be ayu for one ceremony and ala for another (e.g. Kala
Gotongan — ala for ngaben, ayu for starting a business), so a rule has no global polarity; it
maps each applicable ceremony to an effect.

```typescript
export type DewasaPolarity = 'ayu' | 'ala';
export type DewasaSeverity = 'critical' | 'minor';

export interface DewasaEffect {
  polarity: DewasaPolarity;
  severity?: DewasaSeverity; // only meaningful for ala
  note: string; // user-facing (Indonesian)
}

export interface DewasaRule {
  id: string;
  name: string; // Indonesian
  generalCategory: 'ayu' | 'ala' | 'contextual';
  basis: string[]; // wariga components the condition reads
  conditionText: string; // human-readable condition, for audit
  effects: Partial<Record<CeremonyId, DewasaEffect>>; // ceremony -> effect; absent = N/A
  source: string;
  verified: boolean; // false for every seed rule until expert-confirmed
}

// In @dewasa-ayu/ceremony-rules: a rule plus its pure condition predicate.
export interface DewasaContext {
  info: BalineseDate;
  wukuAstawara: readonly Astawara[]; // distinct Astawara across the wuku's 7 days
  wukuWasCount: number; // count of Sadwara 'was' days in the wuku
}
export interface DewasaRuleDef extends DewasaRule {
  match: (ctx: DewasaContext) => boolean;
}
```

**Status (Slice A).** Seven computable rules are seeded — `ayu_nulus`, `ingkel_wong`,
`semut_sadulur`, `kala_gotongan`, `lebur_awu`, `tanpa_guru`, `was_penganten` — all
`verified: false`. ~38 further padewasan are catalogued by name only (no known condition) and
stay inactive; conditions are **never fabricated**. `was_penganten` is computable but maps to
none of the six ceremonies yet (its sourced effect — sharp objects / walls / meetings — is
unrelated to them). All `ala` effects are seeded as `minor` so no unverified rule alone forces
a "bad" verdict; severity tuning and `verified: true` are expert-gated.

#### Rating and severity

```typescript
export type Rating = 'ayu' | 'caution' | 'bad';
export type Severity = 'critical' | 'minor';
```

#### `BalineseDate` — the full decomposition

```typescript
export interface BalineseDate {
  /** Original Gregorian input (normalised to UTC midnight). */
  gregorian: Date;

  /** Pawukon day 0-209 (mod 210 from PAWUKON_EPOCH). */
  pawukonDay: number;

  /** Wuku name (1 of 30). */
  wuku: Wuku;

  /** Wewaran cycle values. All derived from pawukonDay. */
  ekawara: Ekawara | null; // 'luang' only when dasawara urip is odd; null otherwise
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

  /** Wuku-derived 6-fold weekly category (`wukuIndex % 6`), constant within a wuku. */
  ingkel: Ingkel;

  /** 6-day cycle on the pawukon day (`pawukonDay % 6`), parallel to Sadwara. */
  jejepan: Jejepan;

  /** Sum of saptawara urip + pancawara urip for the day. */
  totalUrip: number;
}
```

#### `SasihInfo`

```typescript
export interface SasihInfo {
  /** 0-based index into SASIH_NAMES (0 = Kasa, …, 11 = Sadha). */
  index: number;

  /** Name string (canonical form). */
  name: Sasih;

  /** 1-15. Paro terang = penanggal; paro gelap = pangelong. */
  penanggal: number;

  /** True when in paro gelap (waning half). */
  isPangelong: boolean;

  /** Full moon flag (penanggal = 15, paro terang). */
  isPurnama: boolean;

  /** New moon flag (pangelong = 15, paro gelap). */
  isTilem: boolean;

  /** Intercalary month flag — set by admin correction data per Tahun Saka. */
  isNampih: boolean;

  /** Skipped/Mala Sasih flag — rare, set from external Tahun Saka correction data. */
  isMala: boolean;

  /** True when the value was estimated (no admin correction for the year). */
  isEstimated: boolean;

  /** Tahun Saka year corresponding to this sasih. */
  tahunSaka: number;
}
```

#### `CeremonyConfig` (one per ceremony in `@dewasa-ayu/ceremony-rules`)

Implemented in Slice B (`CEREMONY_CONFIGS`). Each list is sourced (PRD §4.1 sasih, §4.3
forbidden-wuku + Pangelong, §6.1 weights, reference §6 saptawara "umum") and unverified →
the verdict is `estimated`. Per-ceremony padewasan applicability is **not** listed here —
each rule in `DEWASA_RULES` declares which ceremonies it affects via its `effects` map.

```typescript
export interface CeremonyConfig {
  id: CeremonyId;
  name: string; // human-readable, Indonesian
  weights: ScoringWeights;
  sasihGood: number[]; // 0-based sasih indices favoured (PRD §4.1)
  sasihBad: number[]; // 0-based sasih indices forbidden (PRD §4.1)
  forbiddenWuku: Wuku[]; // inauspicious wuku (PRD §4.3)
  saptawaraGood: Saptawara[]; // generally good saptawara (reference §6, "umum")
  requirePenanggal: boolean; // when true, a pangelong day is penalised / can downgrade
}
// Display fields (category, description, icon) are deferred to the UI/content layer.

export interface ScoringWeights {
  saptawara: number;
  wuku: number;
  sasih: number;
  penanggal: number; // bonus for not being in pangelong (when the ceremony requires it)
  sangawara: number; // bonus for Tulus/Dadi
  dewasaAyuBonus: number; // per detected dewasa ayu
  /** Per critical ala (subtracted). Reserved: no padewasan is classified critical yet. */
  criticalAlaPenalty: number;
  minorAlaPenalty: number; // per minor ala (subtracted)
}
// Omitted vs the v0.1 draft: `penanggalNumber` and a standalone `ingkelJejepan` factor.
// No source defines their "good set", so they are not fabricated; ingkel is scored via
// the `ingkel_wong` padewasan instead.
```

#### `DewasaInfo`, `Check`, `Evaluation`

```typescript
// A padewasan detected as active on a date, resolved for one ceremony.
export interface DewasaInfo {
  id: string; // rule id from DEWASA_RULES
  name: string; // human-readable, Indonesian
  type: DewasaPolarity; // 'ayu' | 'ala' — the effect for the queried ceremony
  severity?: DewasaSeverity; // only for ala
  note: string; // 1-2 sentence explanation, Indonesian
  source: string;
  estimated: boolean; // true until the rule is expert-verified → UI shows "estimasi"
}

export interface DewasaDetection {
  ayu: DewasaInfo[];
  ala: DewasaInfo[];
}

export interface Check {
  /** Factor id: 'saptawara', 'wuku', 'sasih', 'penanggal', 'sangawara', or 'dewasa_ayu:<id>' / 'dewasa_ala:<id>'. */
  factor: string;
  passed: boolean;
  weight: number; // from ScoringWeights (0 for ala — penalties never raise the ceiling)
  /** Actual contribution to total score (>= 0 for factors/ayu, < 0 for ala). */
  contribution: number;
  /** Optional human-readable note (Indonesian). */
  note?: string;
}

export interface Evaluation {
  ceremony: CeremonyId;
  rating: Rating;
  score: number; // raw score (can be negative)
  maxScore: number; // achievable maximum (sum of positive weights)
  pct: number; // 0-100 (negative scores clamp to 0)
  checks: Check[];
  dewasaAyu: DewasaInfo[];
  dewasaAla: DewasaInfo[];
  /** True while the verdict relies on unverified rules/data — UI shows "estimasi". */
  estimated: boolean;
}
```

#### Search and month results

```typescript
export interface EvaluatedDate {
  date: Date;
  info: BalineseDate;
  evaluation: Evaluation;
}

export interface FindGoodDatesResult {
  dates: EvaluatedDate[];
  /** True when the internal 365-day scan cap was hit before `count` was satisfied. */
  capReached: boolean;
}

export interface MonthData {
  year: number;
  month: number; // 1-12 (Gregorian)
  ceremony: CeremonyId;
  /** Length matches days in month. Index 0 corresponds to day 1. */
  days: EvaluatedDate[];
  summary: {
    ayuCount: number;
    cautionCount: number;
    badCount: number;
    /** Up to 5 highest-scored ayu dates, sorted desc. */
    topDates: EvaluatedDate[];
  };
}
```

#### Otonan and Mesakapan (Phase 2)

```typescript
export interface OtonanInfo {
  /** Gregorian date of the otonan anniversary. */
  date: Date;
  /** Pawukon day matching the birth pawukon. */
  pawukonDay: number;
  wuku: Wuku;
  pancawara: Pancawara;
  /** Sequence number within the target year (1, 2, …). */
  occurrenceIndex: number;
}

export interface MesakapanResult {
  /** Sum of both partners' totalUrip. */
  totalUrip: number;
  /** Classification per Wariga compatibility rules. */
  classification: 'sangat_baik' | 'baik' | 'cukup' | 'kurang';
  detail: {
    person1: { saptawara: Saptawara; pancawara: Pancawara; urip: number };
    person2: { saptawara: Saptawara; pancawara: Pancawara; urip: number };
  };
  /** Free-form notes (Indonesian) about specific compatibility flags. */
  notes: string[];
}
```

#### Errors

```typescript
export class WarigaError extends Error {
  constructor(
    public code: WarigaErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'WarigaError';
  }
}

export type WarigaErrorCode =
  | 'INVALID_DATE' // non-Date input or NaN
  | 'UNKNOWN_CEREMONY' // CeremonyId not in registry
  | 'OUT_OF_RANGE' // date outside a function's supported range (e.g. Sasih 2003-2100)
  | 'INVALID_PARAM'; // negative count, bad month/year, etc.
```

### Function signatures

All functions exported from `@dewasa-ayu/wariga-engine` as the public surface.

| Function             | Signature                                                                                                                                                                                                  | Throws                                                                                               | Notes                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `getPawukonDay`      | `(date: Date) => number`                                                                                                                                                                                   | `INVALID_DATE`                                                                                       | Returns 0-209.                                                                                                        |
| `getWuku`            | `(date: Date) => Wuku`                                                                                                                                                                                     | `INVALID_DATE`                                                                                       | `floor(pawukonDay / 7)`.                                                                                              |
| Wewaran getters      | `(date: Date) => <Cycle>` — `getSaptawara`, `getPancawara`, `getTriwara`, `getSadwara`, `getAstawara`, `getSangawara`, `getCaturwara`, `getDasawara`, `getDwiwara`; `getEkawara` returns `Ekawara \| null` | `INVALID_DATE`                                                                                       | One per Wewaran cycle. See Algorithms.                                                                                |
| `getTotalUrip`       | `(date: Date) => number`                                                                                                                                                                                   | `INVALID_DATE`                                                                                       | Saptawara urip + Pancawara urip.                                                                                      |
| `getIngkel`          | `(date: Date) => Ingkel`                                                                                                                                                                                   | `INVALID_DATE`                                                                                       | `wukuIndex % 6`.                                                                                                      |
| `getJejepan`         | `(date: Date) => Jejepan`                                                                                                                                                                                  | `INVALID_DATE`                                                                                       | `pawukonDay % 6`.                                                                                                     |
| `getFullInfo`        | `(date: Date) => BalineseDate`                                                                                                                                                                             | `INVALID_DATE`, `OUT_OF_RANGE`                                                                       | Full decomposition. Range bounded by Sasih (~2003-2100).                                                              |
| `getSasihInfo`       | `(date: Date) => SasihInfo`                                                                                                                                                                                | `INVALID_DATE`, `OUT_OF_RANGE`                                                                       | Table-backed, range ~2003-2100; `isEstimated` always false (table is exact, not estimated).                           |
| `detectDewasa`       | `(info: BalineseDate, ceremonyId: CeremonyId) => DewasaDetection`                                                                                                                                          | `UNKNOWN_CEREMONY`                                                                                   | Implemented (Slice A). Pure derivation from `info`; reads the data-driven registry; every result `estimated: true`.   |
| `evaluate`           | `(info: BalineseDate, ceremonyId: CeremonyId) => Evaluation`                                                                                                                                               | `UNKNOWN_CEREMONY`                                                                                   | Implemented (Slice B). Composes sourced factors + `detectDewasa`; verdict `estimated: true`.                          |
| `findGoodDates`      | `(from: Date, count: number, ceremonyId: CeremonyId) => FindGoodDatesResult`                                                                                                                               | `INVALID_DATE`, `UNKNOWN_CEREMONY`, `INVALID_PARAM` (`count <= 0`), `OUT_OF_RANGE` (scan past ~2100) | Implemented (Slice C). Scans forward ≤365 days; partial results with `capReached: true` if cap hit.                   |
| `getMonthEvaluation` | `(year: number, month: number, ceremonyId: CeremonyId) => MonthData`                                                                                                                                       | `UNKNOWN_CEREMONY`, `INVALID_PARAM` (month outside 1-12), `OUT_OF_RANGE` (year outside ~2003-2100)   | Implemented (Slice C). `month` is 1-12 (human convention).                                                            |
| `calculateOtonan`    | `(birthdate: Date, targetYear: number) => OtonanInfo[]`                                                                                                                                                    | `INVALID_DATE`, `INVALID_PARAM` (year outside 1900-2100)                                             | **Not implemented** (Phase 2). Not exported by the engine — see Decisions. Returns all anniversaries in `targetYear`. |
| `calculateMesakapan` | `(person1Birthdate: Date, person2Birthdate: Date) => MesakapanResult`                                                                                                                                      | `INVALID_DATE`                                                                                       | **Not implemented** (Phase 2). Not exported by the engine — see Decisions. Pure derivation from birthdates.           |

### Algorithms

#### Pawukon day

```
function getPawukonDay(date):
  if not valid Date or isNaN(date.getTime()): throw WarigaError('INVALID_DATE')
  dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  diffDays = floor((dateUTC - PAWUKON_EPOCH) / 86_400_000)
  return ((diffDays % 210) + 210) % 210            # JS modulo of negative values
```

#### Wewaran from pawukon day

All ten Wewaran cycles derive from the Pawukon day. The offsets and anomaly positions
below are **calibrated and locked** against the balinese-date-js-lib oracle and
cross-checked against the printed Bali 2026 calendar — they are facts, not assumptions.

| Cycle     | Formula                                                                |
| --------- | ---------------------------------------------------------------------- |
| Wuku      | `floor(pawukonDay / 7)`                                                |
| Saptawara | `pawukonDay % 7` (Redite = 0)                                          |
| Pancawara | `(pawukonDay + 1) % 5` — day 0 (Redite Sinta) is **Paing**, not Umanis |
| Triwara   | `pawukonDay % 3`                                                       |
| Sadwara   | `pawukonDay % 6`                                                       |
| Dasawara  | `totalUrip % 10` (**no `+ 1`**)                                        |
| Dwiwara   | `menga` when `totalUrip` is even, `pepet` when odd                     |
| Ekawara   | `luang` only when `totalUrip` is **odd**; otherwise `null`             |
| Astawara  | `pawukonDay % 8`, with the **Kala Tiga** anomaly (below)               |
| Caturwara | `pawukonDay % 4`, with the **Jaya Tiga** anomaly (below)               |
| Sangawara | `(pawukonDay + 6) % 9`, with the **four-Dangu** opening (below)        |

where `totalUrip = SAPTAWARA_URIP[pawukonDay % 7] + PANCAWARA_URIP[(pawukonDay + 1) % 5]`.

**Anomalies (near the Sungsang/Dungulan boundary, pawukon days 70-72).** Three cycles
deviate from a plain modulus and are pinned by characterization tests:

- **Astawara — Kala Tiga.** Kala (index 6) lands on pawukon days 70, 71 and 72.
  `pd <= 70 → pd % 8`; `pd === 71 → 6`; else `(pd + 6) % 8`.
- **Caturwara — Jaya Tiga.** Jaya (index 2) repeats on pawukon day 71, shifting the tail.
  `pd <= 70 → pd % 4`; `pd === 71 → 2`; else `(pd + 2) % 4`.
- **Sangawara — four Dangu.** The cycle opens with four consecutive Dangu (index 0).
  `pd < 3 → 0`; else `(pd + 6) % 9`.

> **Reconciliation note (history).** An earlier draft (v0.2.0) proposed `Dasawara =
(urip + 1) mod 10` and a urip-based Caturwara, derived from the `bilanganHari` prose in
> [`wariga-engine-reference.md`](./wariga-engine-reference.md) §6. Empirical calibration against
> the oracle disproved both: Dasawara is `urip % 10` (**no `+ 1`**), and Caturwara is
> `pawukonDay`-based with the Jaya Tiga anomaly above. The formulas in this section are the
> implemented, oracle-locked truth and supersede the draft. Lesson on record: every offset is a
> calibration target verified against the oracle + printed calendar, never assumed from prose
> (the clean-room rule holds — the oracle is a dev-only dependency, never bundled).

#### Sasih (global lunar-unit model + precomputed table)

The Balinese lunar calendar cannot be reproduced by a mean-synodic-month approximation:
it inserts intercalary **nampih** months and doubles selected penanggal (**ngunalatri**), so
month boundaries are irregular. A naive `floor(daysSinceEpoch / 29.53)` model was implemented
first and measured **~90% wrong** against the oracle — abandoned. The engine instead uses a
**global "lunar unit" count over a precomputed table**:

- Each solar day advances the penanggal by one unit; a ngunalatri day advances it by two (one
  solar day carries two penanggal — e.g. Tilem-15 of the old month and Penanggal-1 of the new
  one share a date).
- `firstUnit = dayNumber + (count of SASIH_NGUNALATRI_DAYS strictly before dayNumber)`.
- `monthIndex = floor(firstUnit / 30)`; `unitInMonth = firstUnit % 30` → penanggal 1-15
  (15 = Purnama) for units 0-14, pangelong 1-15 (15 = Tilem) for units 15-29.
- Per-month arrays give the sasih id (`SASIH_MONTH_SID`), kind (`SASIH_MONTH_KIND`: 0 normal /
  1 nampih / 2 mala) and Saka year (`SASIH_MONTH_SAKA`), indexed by `monthIndex`.
- On a ngunalatri day, Purnama/Tilem are flagged if **either** carried unit is 14/29 (a
  `[14, 15]` day is still the Purnama).

```
function getSasihInfo(date):
  if not valid Date: throw WarigaError('INVALID_DATE')
  dayNumber = floor((Date.UTC(y, m, d) - SASIH_EPOCH) / 86_400_000)
  if dayNumber < 0 or dayNumber > SASIH_LAST_DAY: throw WarigaError('OUT_OF_RANGE')
  k           = countNgunalatriBefore(dayNumber)     # binary search in SASIH_NGUNALATRI_DAYS
  firstUnit   = dayNumber + k
  monthIndex  = floor(firstUnit / 30)
  unitInMonth = firstUnit % 30
  doubled     = SASIH_NGUNALATRI_DAYS[k] == dayNumber
  secondUnit  = doubled ? (firstUnit + 1) % 30 : -1
  isPangelong = unitInMonth >= 15
  kind        = SASIH_MONTH_KIND[monthIndex]
  return SasihInfo {
    index:       SASIH_MONTH_SID[monthIndex],
    name:        SASIH_NAMES[index],
    penanggal:   isPangelong ? unitInMonth - 14 : unitInMonth + 1,
    isPangelong,
    isPurnama:   unitInMonth == 14 or secondUnit == 14,
    isTilem:     unitInMonth == 29 or secondUnit == 29,
    isNampih:    kind == 1,
    isMala:      kind == 2,
    isEstimated: false,
    tahunSaka:   SASIH_MONTH_SAKA[monthIndex],
  }
```

**Table provenance.** `SASIH_EPOCH`, `SASIH_NGUNALATRI_DAYS`, and `SASIH_MONTH_SID/KIND/SAKA`
live in `@dewasa-ayu/constants` (`sasih-data.ts`), **generated** by
`packages/wariga-engine/scripts/generate-sasih-data.mjs`. The generator walks the oracle, emits
the table, and **self-validates every day in range** against the oracle (name incl. nampih,
penanggal/pangelong, Purnama/Tilem, Saka) — refusing to write on any mismatch. The shipped table
is therefore plain calendar facts (clean-room; the oracle is dev-only, never bundled). Supported
range **2003-01-02 … 2100-12-31** (the modern PHDI nampih era; pre-2003 used different
pengalantaka rules); outside it → `OUT_OF_RANGE`. There is **no** `isEstimated: true` path — the
table is exact; the flag exists only for forward compatibility (e.g. a future cyclic extrapolation
beyond 2100). Validation: 0 mismatches across the full range (~36,000 days), and confirmed against
the printed Bali 2026 calendar (Purnama/Tilem dates; Nyepi = Penanggal 1 Kadasa beginning Saka 1948).

> **Note (supersedes earlier drafts).** There is no runtime `sasih_corrections` lookup in the
> engine. The PRD §11 admin-correction concept is replaced by the generated, self-validating table
> above. The DB spec's `sasih_corrections` table, if retained, becomes an optional override layer —
> not a dependency of `getSasihInfo`.

#### Evaluation scoring (PRD §6)

Pseudocode showing the shape; actual weights come from the per-ceremony `ScoringWeights`:

```
function evaluate(info, ceremonyId):
  if ceremonyId not in CEREMONY_IDS: throw WarigaError('UNKNOWN_CEREMONY')
  config = CEREMONY_CONFIGS[ceremonyId]
  w = config.weights
  checks = []

  # --- Sourced factor checks (contribution = passed ? weight : 0) ---
  saptawaraPassed = config.saptawaraGood.includes(info.saptawara)
  pushFactor(checks, 'saptawara', saptawaraPassed, w.saptawara)

  wukuForbidden = config.forbiddenWuku.includes(info.wuku)
  pushFactor(checks, 'wuku', not wukuForbidden, w.wuku)

  sasihPassed = config.sasihGood.includes(info.sasih.index) and not config.sasihBad.includes(info.sasih.index)
  pushFactor(checks, 'sasih', sasihPassed, w.sasih)

  penanggalOK = not config.requirePenanggal or not info.sasih.isPangelong
  pushFactor(checks, 'penanggal', penanggalOK, w.penanggal)

  pushFactor(checks, 'sangawara', info.sangawara in ('tulus', 'dadi'), w.sangawara)

  # --- Padewasan (data-driven registry; ingkel is scored here via the ingkel_wong rule) ---
  dewasa = detectDewasa(info, ceremonyId)
  for ayu in dewasa.ayu:
    checks.push({ factor: `dewasa_ayu:${ayu.id}`, passed: true,  weight: w.dewasaAyuBonus, contribution: +w.dewasaAyuBonus, note: ayu.note })
  for ala in dewasa.ala:           # all seeded ala are 'minor'; critical handling deferred
    checks.push({ factor: `dewasa_ala:${ala.id}`, passed: false, weight: 0,                contribution: -w.minorAlaPenalty, note: ala.note })

  # --- Aggregate ---
  score    = sum(c.contribution for c in checks)
  maxScore = sum(c.weight for c in checks if c.weight > 0)
  pct      = toPct(score, maxScore)              # clamp 0-100; 0 if maxScore <= 0

  rating = computeRating(pct, info.sasih.isPangelong, config.requirePenanggal, saptawaraPassed, wukuForbidden)
  return Evaluation { ceremony, rating, score, maxScore, pct, checks, dewasaAyu, dewasaAla, estimated: true }
```

#### Rating decision (PRD §6.2)

```
function computeRating(pct, isPangelong, requirePenanggal, saptawaraPassed, wukuForbidden):
  # Critical-ala -> 'bad' (PRD §6.2) is deferred: no padewasan is classified critical yet,
  # so it cannot fire. Re-add when the first critical rule is expert-verified.
  if requirePenanggal and isPangelong and not saptawaraPassed:
    return 'bad'
  if pct >= 60 and saptawaraPassed and not wukuForbidden and (not requirePenanggal or not isPangelong):
    return 'ayu'
  return 'caution'
```

#### Find good dates

```
function findGoodDates(from, count, ceremonyId):
  if count <= 0: throw WarigaError('INVALID_PARAM')
  results = []
  scanned = 0
  cursor = clone(from)
  while results.length < count and scanned < 365:
    info = getFullInfo(cursor)
    evalResult = evaluate(info, ceremonyId)
    if evalResult.rating == 'ayu':
      results.push({ date: clone(cursor), info, evaluation: evalResult })
    cursor.setDate(cursor.getDate() + 1)
    scanned += 1
  return { dates: results, capReached: scanned >= 365 and results.length < count }
```

#### Otonan

Same Wuku + Pancawara combination as birth = same `pawukonDay`. Scan within the target Gregorian year:

```
function calculateOtonan(birthdate, targetYear):
  birthPawukon = getPawukonDay(birthdate)
  results = []
  for date in dateRange(YYYY-01-01, YYYY-12-31):
    if getPawukonDay(date) == birthPawukon:
      info = getFullInfo(date)
      results.push({ date, pawukonDay: birthPawukon, wuku: info.wuku, pancawara: info.pancawara, occurrenceIndex: results.length + 1 })
  return results
```

#### Mesakapan

```
function calculateMesakapan(p1Birth, p2Birth):
  i1 = getFullInfo(p1Birth)
  i2 = getFullInfo(p2Birth)
  totalUrip = i1.totalUrip + i2.totalUrip
  classification = classifyByUripSum(totalUrip)        # lookup table per Pokok-pokok Wariga
  notes = derivedCompatibilityNotes(i1, i2)            # e.g. same pancawara, complementary saptawara
  return MesakapanResult { totalUrip, classification, detail: { person1, person2 }, notes }
```

`classifyByUripSum` lookup table source: PRD §28 references, specifically _Pokok-pokok Wariga_ (Ardana). To be filled in during implementation against that source.

### Examples

Oracle-true values, cross-checked against the printed Bali 2026 calendar and real-world hari
raya (Nyepi, Galungan). The implementation matches these **exactly, Sasih included**.

| Gregorian  | Wuku     | Saptawara | Pancawara | Sasih · Penanggal     | Ingkel | Jejepan | Notes                                    |
| ---------- | -------- | --------- | --------- | --------------------- | ------ | ------- | ---------------------------------------- |
| 2024-01-01 | ukir     | soma      | paing     | Kapitu · pangelong 5  | mina   | patra   | —                                        |
| 2024-03-11 | langkir  | soma      | paing     | Kadasa · penanggal 1  | wong   | taru    | **Nyepi 2024** — begins Saka 1946        |
| 2024-04-09 | krulut   | anggara   | umanis    | Destha · penanggal 1  | taru   | mina    | —                                        |
| 2025-01-01 | bala     | buda      | pon       | Kapitu · penanggal 2  | wong   | patra   | —                                        |
| 2025-03-29 | wariga   | saniscara | kliwon    | Kadasa · penanggal 1  | wong   | mina    | **Nyepi 2025** — begins Saka 1947        |
| 2026-01-01 | krulut   | wraspati  | pon       | Kapitu · penanggal 13 | taru   | sato    | PRD reference date                       |
| 2026-03-19 | klawu    | wraspati  | kliwon    | Kadasa · penanggal 1  | manuk  | taru    | **Nyepi 2026** — begins Saka 1948        |
| 2026-06-17 | dungulan | buda      | kliwon    | Kasa · penanggal 3    | taru   | taru    | **Galungan 2026** — Buda Kliwon Dungulan |

> ⚠️ **These supersede the PRD §13.2 example dates.** The PRD values disagree with the oracle and
> the real calendar on Wuku/Pancawara/Sasih for most rows — e.g. the PRD placed Penanggal 1 Kadasa
> on 2024-04-09, but Nyepi 2024 (which _is_ Penanggal 1 Kadasa) fell on 2024-03-11. Treat the
> printed Rawi calendar + oracle as ground truth, not the PRD examples.

Canonical worked example for `evaluate`: `evaluate(getFullInfo(new Date('2026-04-06')), 'pawiwahan')`. Expected rating, score, and dewasa list are locked in the engine test suite alongside implementation (issue [#2](https://github.com/RacThug/dewasa-ayu/issues/2) deliverable).

### Verification status (Phase 1 exit — 2026-08-25)

What the correctness claim actually rests on, so the audit trail matches the evidence rather than
the original wording of epic [#2](https://github.com/RacThug/dewasa-ayu/issues/2):

| Layer                          | Golden source                                                            | Extent                                     | Result                  |
| ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------ | ----------------------- |
| Pawukon day, Wuku              | `balinese-date-js-lib` oracle + the Galungan 2024-02-28 anchor           | every day 2015–2034                        | 0 mismatches            |
| Wewaran (all 10) + urip        | oracle; anomaly regions derived empirically over a full 210-day cycle    | every day 2015–2034, re-checked 2010–2035  | 0 mismatches            |
| Ingkel, Jejepan, `getFullInfo` | oracle                                                                   | every day 2015–2034                        | 0 mismatches            |
| Sasih (`getSasihInfo`)         | oracle + the printed Bali 2026 calendar (Purnama/Tilem, Nyepi/Saka 1948) | every day 2015–2034; table spans 2003–2100 | 0 mismatches            |
| `detectDewasa`, `evaluate`     | **none — sourced but unverified**                                        | rule conditions oracle-checked 2024–2026   | ships `estimated: true` |

- **kalenderbali.org was not used as the comparison target**, despite epic #2 naming it. A day-by-day
  oracle plus the printed Rawi calendar replaced it: a site scrape cannot cover ~7,300 days per layer,
  and the printed calendar outranks any website as ground truth. The epic's ≥99 % (Pawukon) and ≥95 %
  (Sasih) bars are met at **100 %** across the tested range.
- **PRD §13.2 is not golden data** — see the warning under Examples.
- **Measured at Phase 1 exit**: 61 tests, 100 % statement/branch/function/line coverage, full-repo
  `turbo typecheck test` green; bundle **26.2 KB minified → 6.6 KB gzipped** (target < 30 KB); zero
  runtime dependencies.
- **The calculation layer is certified; the judgement layer is not.** Every padewasan rule and every
  per-ceremony weight is sourced but unverified by a wariga expert, so `evaluate` returns
  `estimated: true` and no rule is classified `critical`. This is a **launch gate, not an engine
  defect** — tracked as [#88](https://github.com/RacThug/dewasa-ayu/issues/88) in Phase 8
  (Validation & Launch), not in the Phase 1 engine epic.

#### Version constants

| Constant                 | Value   | Meaning                                                                                                                                                                                                    |
| ------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ENGINE_VERSION`         | `0.7.0` | Tracks the ENG-001 contract version it implements; bump both together. Surfaced by the API `/health` endpoint.                                                                                             |
| `CEREMONY_RULES_VERSION` | `0.1.0` | Version of the padewasan + ceremony-config data set. Bump on **any** rule change, so a verdict can be traced to the rules that produced it. Reaches `1.0.0` only when a wariga expert signs the rules off. |

## Decisions & Rationale

- **String-literal unions instead of TypeScript `enum`.** Smaller bundle, tree-shakeable, narrower types at boundaries. Trade-off: no runtime enum object; consumers wanting a list at runtime read from `@dewasa-ayu/constants`. Aligns with PRD §22.2 (engine <30 KB gzipped).

- **All indices 0-based; penanggal stays 1-based.** Matches PRD §10.1 (`getPawukonDay → 0-209`) and idiomatic TypeScript. Penanggal is exposed as 1-15 because that's how it's spoken about culturally — users see numbers, not array indices.

- **Throw `WarigaError` for invalid input and out-of-range dates; structured returns for valid edge cases.** Bad input (NaN Date, unknown ceremony) and dates outside a function's supported range are programmer/usage errors and should be visible at the call site (`INVALID_DATE`, `UNKNOWN_CEREMONY`, `OUT_OF_RANGE`). Valid domain edge cases (Nampih Sasih, Mala Sasih, partial `findGoodDates` results) return data with explicit flags (`isNampih`, `isMala`, `capReached`) so consumers react without try/catch. `Result<T, E>` was considered but rejected as too verbose for a calculation library where 99% of calls succeed.

- **Sasih via a generated, self-validating lookup table — not runtime estimation.** The mean-synodic-month approximation (PRD §10.2) was implemented and measured ~90% wrong (nampih + ngunalatri make month boundaries irregular), so it was rejected. Instead a table generated from the oracle and self-validated day-by-day ships as plain calendar facts (clean-room; oracle never bundled). `isEstimated` is therefore always `false`; the field is retained only for a possible future cyclic extrapolation beyond the table.

- **Public surface is types + functions + error class; constants live in a sibling package.** Lets the constants package change (new ceremony, expanded lookup tables) without touching engine code. Aligns with PRD §7.4 monorepo structure.

- **Otonan and Mesakapan included now despite Phase 2 timeline.** Spec is a contract; timeline is backlog. Locking Phase 2 types now prevents a future breaking change when those functions land. The functions are **absent from the public surface** — `@dewasa-ayu/wariga-engine` does not export them at all, so a premature call is a compile-time error rather than a runtime throw. Adding them later is purely additive and non-breaking. (v0.6.0 of this spec claimed they throw `NOT_IMPLEMENTED`; no such stub was ever shipped.)

- **Sasih bounds the full-decomposition range to 2003-2100.** Pawukon/Wewaran/Ingkel/Jejepan are cyclic and unbounded, but `getSasihInfo` (and therefore `getFullInfo`) throw `OUT_OF_RANGE` outside the table. 2003 is the start of the modern PHDI nampih era; pre-2003 pengalantaka rules differ and the oracle is unreliable there (e.g. a double-Tilem on 2000-02-02).

- **`findGoodDates` returns a `FindGoodDatesResult` envelope, not bare array.** Allows the function to surface partial results when the 365-day scan cap is hit without throwing. Resolves an open question from initial draft.

- **`tahunSaka` lives on `SasihInfo`, not on `BalineseDate` directly.** Saka is a lunar-calendar concept; bundling it inside `SasihInfo` keeps `BalineseDate` cohesive (each top-level field is one logical decomposition).

- **Bundle includes engine + constants + ceremony-rules together when used in browser.** Combined target <50 KB gzipped (PRD §22.2 allows engine 30 KB, ceremony-rules 10 KB, with constants distributed across both).

## Open Questions

- [Q] Should `calculateMesakapan` accept additional `weton`-style inputs (Java/Lombok variant) for cross-tradition users, or is Bali-Wariga-only enough for v1? Owner: @RacThug. Target: when Phase 2 (PRD §F-102) is scheduled.
- [✅ RESOLVED] **All Wewaran cycle offsets.** Calibrated against the oracle and the printed Bali
  2026 calendar, then locked by tests (0 mismatches over 2015–2034). Concrete results recorded in
  Algorithms §Wewaran: Pancawara offset `+1` (Redite Sinta = Paing); Dasawara `urip % 10` (no `+1`);
  Astawara Kala Tiga, Caturwara Jaya Tiga, and the four-Dangu Sangawara opening. The PRD §13.2
  reference dates were found unreliable and are **not** used as golden truth (see Examples).
- [✅ RESOLVED] **Dewasa code unions → data-driven rules.** The `DewasaAyuCode` / `DewasaAlaCode` unions are dropped. Padewasan are now a data registry (`DEWASA_RULES` in `@dewasa-ayu/ceremony-rules`), each rule carrying `source` + `verified` and a context-relative `effects` map (reference §8 "rules as data"). `detectDewasa` is implemented (Slice A) over the 7 computable rules; all `verified: false` → results surface as `estimasi`. Remaining: the **scoring layer** (`CeremonyConfig`, `ScoringWeights`, `Check`, `Evaluation`, `evaluate`, `findGoodDates`, `getMonthEvaluation`) is still provisional and reconciled in Slice B. Owner: @RacThug. Target: scoring step of Phase 1 (#2).
- [✅ RESOLVED] **`getFullInfo` range.** Bounded by the Sasih table (2003-2100): outside it,
  `getFullInfo` throws `OUT_OF_RANGE` (propagated from `getSasihInfo`). The Pawukon/Wewaran/Ingkel/
  Jejepan parts are purely cyclic and accurate for any date, but the full decomposition includes
  Sasih, which is table-bounded. Revisit only if a cyclic Sasih extrapolation beyond the table is
  added (the `isEstimated` flag is reserved for exactly that future path).
- [Q] Should `getMonthEvaluation` include a `weekStart` parameter for locales where the week begins on Sunday vs Monday, or is that purely a presentation concern for the UI layer? Owner: @RacThug. Target: design discussion during UI spec authoring ([UI-001](./pages.md)).

## References

- [PRD §4 — Ceremony Rules Matrix](../PRD.md)
- [PRD §6 — Scoring System](../PRD.md)
- [PRD §10 — Calculation Engine](../PRD.md)
- [PRD §13 — Validation & Testing](../PRD.md)
- [PRD §22.2 — Bundle Size Budget](../PRD.md)
- GitHub issue [#17](https://github.com/RacThug/dewasa-ayu/issues/17) — implementing task for this spec
- GitHub issue [#2](https://github.com/RacThug/dewasa-ayu/issues/2) — engine implementation epic
- Sibling specs: [DB-001](./db.md), [API-001](./api.md), [UI-001](./pages.md) (drafted in parallel)
- Lontar Wariga Catur Winasa Sari (primary traditional source — PRD §28)
- _Pokok-pokok Wariga_, I.B. Supartha Ardana (Mesakapan classification source)
- kalenderbali.org (Pawukon validation reference)
- Domain reference: [`docs/specs/wariga-engine-reference.md`](./wariga-engine-reference.md) — urip tables, `bilanganHari` formulas (§6), Alahing Sasih hierarchy (§7), accuracy strategy (§10)
- Bootstrap rule seed: [`docs/research/dewasa-rules.seed.json`](../research/dewasa-rules.seed.json) — UNVERIFIED; every entry carries `source` + `verified: false`
- `balinese-date-js-lib` (peradnya, Apache-2.0) — calculation **oracle** for test fixtures; dev-dependency only, never bundled

## Changelog

- v0.7.0 — 2026-08-25 — **Phase 1 exit.** Adds a _Verification status_ section recording the sources, extent, and measured results the engine's correctness claim rests on (oracle + printed Rawi calendar, not kalenderbali.org), plus the meaning of `ENGINE_VERSION` (now `0.7.0`, tracking this spec) and `CEREMONY_RULES_VERSION` (now `0.1.0`). Corrects the Otonan/Mesakapan contract: they are **absent from the public surface**, not `NOT_IMPLEMENTED` stubs. No behaviour change.

- v0.6.0 — 2026-05-30 — **Dewasa layer, Slice C** (`findGoodDates`, `getMonthEvaluation`) — the MVP engine is now feature-complete. `findGoodDates(from, count, ceremonyId)` scans forward ≤365 days for "ayu" days and returns a `FindGoodDatesResult` envelope (`capReached` when the cap is hit first). `getMonthEvaluation(year, month, ceremonyId)` evaluates every day of a Gregorian month into `MonthData` (per-day `EvaluatedDate[]` + a summary with ayu/caution/bad counts and up to 5 top ayu dates). Both are pure orchestration over `getFullInfo` + `evaluate`; they propagate `OUT_OF_RANGE` near the Sasih boundary. Added the `EvaluatedDate`, `FindGoodDatesResult`, `MonthData` types. 57 tests, 100% coverage. Only the Phase 2 functions (`calculateOtonan`, `calculateMesakapan`) remain unimplemented.
- v0.5.0 — 2026-05-30 — **Dewasa layer, Slice B** (`evaluate`). Implemented per-ceremony scoring (PRD §6) + rating (PRD §6.2) over 6 `CeremonyConfig` (`CEREMONY_CONFIGS` in `@dewasa-ayu/ceremony-rules`), all lists sourced (weights §6.1, sasih §4.1, forbidden-wuku + Pangelong §4.3, saptawara "umum" reference §6) and unverified → `estimated: true`. Reconciled the scoring types to the implementation: `CeremonyConfig` (flat `sasihGood`/`sasihBad`/`forbiddenWuku`/`saptawaraGood: Saptawara[]`/`weights`; display fields deferred); `ScoringWeights` dropped `penanggalNumber` + standalone `ingkelJejepan` (no source — never fabricated; ingkel scored via the `ingkel_wong` padewasan); `Check.notes → note`; `Evaluation` dropped `hasCriticalAla` and renamed `sasihEstimated → estimated`. Added the pure helper `toPct`. **Deferred:** the PRD §6.2 critical-ala → "bad" rule (no padewasan is classified critical yet — all seeded ala are `minor` by conservative design; `criticalAlaPenalty` reserved in config) and the penanggal-number factor (no source). Remaining: `findGoodDates`, `getMonthEvaluation` (Slice C). 51 tests, 100% coverage.
- v0.4.0 — 2026-05-30 — **Dewasa layer, Slice A** (`detectDewasa`). Replaced the provisional hardcoded `DewasaAyuCode`/`DewasaAlaCode` unions with a **data-driven rule registry** (`DEWASA_RULES` in `@dewasa-ayu/ceremony-rules`): each padewasan carries `source` + `verified` and a context-relative `effects` map (a rule can be ayu for one ceremony, ala for another). New types: `CeremonyId` is reused; added `DewasaPolarity`, `DewasaSeverity`, `DewasaEffect`, `DewasaRule`, `DewasaContext`, `DewasaRuleDef`, `DewasaDetection`; reshaped `DewasaInfo` (`code→id`, `description→note`, added `source`/`estimated`, dropped `applicableCeremonies`). Implemented `detectDewasa` over the 7 computable rules (`ayu_nulus`, `ingkel_wong`, `semut_sadulur`, `kala_gotongan`, `lebur_awu`, `tanpa_guru`, `was_penganten`), all `verified: false` → results flagged `estimated`. Rule conditions oracle-locked over 2024-2026. Resolved the dewasa-code-unions open question. The scoring layer (`CeremonyConfig`, `ScoringWeights`, `Check`, `Evaluation`, `evaluate`, `findGoodDates`, `getMonthEvaluation`) stays provisional pending Slice B.
- v0.3.0 — 2026-05-30 — Completed the calculation layer and **synced the spec to the implemented engine**. Added `getIngkel`, `getJejepan`, and `getFullInfo` (the full `BalineseDate` decomposition), plus the previously-undocumented `getWuku`/Wewaran getters/`getTotalUrip` to the signature table. Corrected draft errors found during oracle calibration: **Ingkel is 6 categories** keyed by `wukuIndex % 6` (removed the phantom 7th `kembang` and the wrong "35-day/5-wuku" rotation); Dasawara `eraja → raja` and formula `urip % 10` (removed the erroneous `+ 1`); Caturwara `manala → menala`; Pancawara offset `+1` (Redite Sinta = Paing, not Umanis). Replaced the naive mean-synodic-month Sasih pseudocode with the implemented global lunar-unit + precomputed-table model (range 2003-2100, `OUT_OF_RANGE` outside; `isEstimated` always false; no runtime `sasih_corrections` dependency). Replaced the unreliable PRD §13.2 example table with oracle-true, calendar-cross-checked rows (added Ingkel/Jejepan columns + Nyepi/Galungan anchors). Resolved two open questions (Wewaran offsets; `getFullInfo` range). Status `Draft → Active` (calculation layer done; scoring/dewasa layer pending). Note: dropping `kembang` and renaming `eraja`/`manala` are breaking type changes, acceptable pre-1.0 while the contract is still settling and these unions are not yet consumed.
- v0.2.1 — 2026-05-30 — Corrected `PAWUKON_EPOCH` to 17 June 2012 (the prior 11 June 2012 was 6 days early — it lands on Soma Watugunung, not Redite Sinta), calibrated and locked against the oracle (every day in 2000–2030) plus the Galungan 2024-02-28 anchor. Implemented the first engine slice — `getPawukonDay` and `getWuku` in `packages/wariga-engine` — with 100% test coverage.
- v0.2.0 — 2026-05-30 — Reconciled the algorithm layer with the new domain reference (`wariga-engine-reference.md` §6): adopted the `bilanganHari` basis, corrected Caturwara (`mod 4` + Dungulan Jaya Tiga anomaly) and Dasawara (`+ 1`), generalised offset calibration to all cycles, and documented the oracle + golden-test strategy. Flagged the Dewasa code unions as provisional pending reconciliation with `dewasa-rules.seed.json` (likely moving to data-driven ids with `source`/`verified`). No type or signature changes — additive/clarifying only, hence a minor bump.
- v0.1.0 — 2026-05-28 — Initial draft. Full public surface for Phase 1 (7 functions) and Phase 2 (Otonan, Mesakapan). Four open questions flagged (Mesakapan weton scope, Pancawara offset calibration, pre-1900 date handling, week-start parameter).
