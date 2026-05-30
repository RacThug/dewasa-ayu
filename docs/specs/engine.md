---
id: ENG-001
title: Wariga Engine — Types & Contract
status: Draft
version: 0.2.1
owners: [@RacThug]
created: 2026-05-28
updated: 2026-05-30
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

| Constant           | Value                                  | Meaning                                                                                                                                                       |
| ------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PAWUKON_EPOCH`    | `Date.UTC(2012, 5, 17)` (17 June 2012) | Pawukon day 0 = Redite Sinta. Calibrated + locked against the balinese-date-js-lib oracle (0 mismatches across 2000–2030) and the Galungan 2024-02-28 anchor. |
| `SASIH_EPOCH`      | `Date.UTC(2024, 3, 9)` (9 April 2024)  | Reference: Penanggal 1, Sasih Kadasa.                                                                                                                         |
| `SASIH_LUNAR_DAYS` | `29.530588`                            | Mean synodic month in days.                                                                                                                                   |
| `PAWUKON_CYCLE`    | `210`                                  | Pawukon cycle length.                                                                                                                                         |

#### Lookup tables (names only — full data in `@dewasa-ayu/constants`)

| Table             | Length | Contents                                                                                                |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `WUKU_NAMES`      | 30     | Sinta, Landep, …, Watugunung (PRD §13.2 has reference dates for verification).                          |
| `SAPTAWARA_NAMES` | 7      | Redite, Soma, Anggara, Buda, Wraspati, Sukra, Saniscara.                                                |
| `PANCAWARA_NAMES` | 5      | Umanis, Paing, Pon, Wage, Kliwon.                                                                       |
| `TRIWARA_NAMES`   | 3      | Pasah, Beteng, Kajeng.                                                                                  |
| `SADWARA_NAMES`   | 6      | Tungleh, Aryang, Urukung, Paniron, Was, Maulu.                                                          |
| `ASTAWARA_NAMES`  | 8      | Sri, Indra, Guru, Yama, Ludra, Brahma, Kala, Uma.                                                       |
| `SANGAWARA_NAMES` | 9      | Dangu, Jangur, Gigis, Nohan, Ogan, Erangan, Urungan, Tulus, Dadi.                                       |
| `DASAWARA_NAMES`  | 10     | Pandita, Pati, Suka, Duka, Sri, Manuh, Manusa, Eraja, Dewa, Raksasa.                                    |
| `SASIH_NAMES`     | 12     | Kasa, Karo, Katiga, Kapat, Kalima, Kanem, Kapitu, Kawolu, Kasanga, Kadasa, Destha, Sadha.               |
| `INGKEL_NAMES`    | 7      | Wong, Sato, Mina, Manuk, Taru, Buku, Kembang (one per 5 consecutive wuku weeks → cycles every 35 days). |
| `JEJEPAN_NAMES`   | 6      | Mina, Taru, Sato, Patra, Wong, Paksi.                                                                   |
| `SAPTAWARA_URIP`  | 7      | `[5, 4, 3, 7, 8, 6, 9]` for Redite … Saniscara.                                                         |
| `PANCAWARA_URIP`  | 5      | `[5, 9, 7, 4, 8]` for Umanis … Kliwon.                                                                  |

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
  | 'eraja'
  | 'dewa'
  | 'raksasa';
export type Caturwara = 'sri' | 'laba' | 'jaya' | 'manala';
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

export type Ingkel = 'wong' | 'sato' | 'mina' | 'manuk' | 'taru' | 'buku' | 'kembang';

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

#### Dewasa codes (PRD §4.2, §4.3)

```typescript
export type DewasaAyuCode =
  | 'subacara'
  | 'kama_jaya'
  | 'dina_jaya'
  | 'ayu_nulus'
  | 'ayu_dana'
  | 'dewa_stata'
  | 'amerta_dewa'
  | 'amerta_dewa_jaya'
  | 'siwa_sampurna'
  | 'dewasa_mentas'
  | 'swarga_menge'
  | 'catur_laba'
  | 'derman_bagia'
  | 'sangawara_tulus'
  | 'sangawara_dadi'
  | 'triwara_beteng';

export type DewasaAlaCode =
  | 'rangda_tiga'
  | 'carik_walangati'
  | 'uncal_balung'
  | 'pati_paten'
  | 'semut_sadulur'
  | 'kala_gotongan'
  | 'ingkel_wong'
  | 'kala_jengking'
  | 'sampar_wangke'
  | 'kala_temah'
  | 'kala_dangastra'
  | 'kala_suwung'
  | 'kala_ngruda'
  | 'geni_rawana'
  | 'mrta_papageran'
  | 'kalebu_rau'
  | 'pangelong';

export type DewasaCode = DewasaAyuCode | DewasaAlaCode;
```

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

  /** Wuku-derived 7-cycle (5 wuku per ingkel → 35-day rotation). */
  ingkel: Ingkel;

  /** 6-day cycle on top of pawukon. */
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

```typescript
export interface CeremonyConfig {
  id: CeremonyId;
  name: string; // human-readable, Indonesian
  category: PancaYadnyaCategory;
  description: string;
  icon: string; // emoji or icon ref
  sasihRules: {
    /** 0-based sasih indices where this ceremony is favoured. */
    good: number[];
    /** 0-based sasih indices where this ceremony is forbidden. */
    bad: number[];
  };
  dewasaAyu: DewasaAyuCode[]; // codes that apply to this ceremony
  dewasaAla: DewasaAlaCode[];
  scoringWeights: ScoringWeights;
  saptawaraGood: number[]; // 0-based saptawara indices considered good
  requirePenanggal: boolean; // if true, evaluation downgrades when in pangelong
}

export interface ScoringWeights {
  saptawara: number;
  wuku: number;
  sasih: number;
  penanggal: number; // bonus for not being in pangelong
  penanggalNumber: number; // bonus based on penanggal number
  ingkelJejepan: number;
  sangawara: number;
  dewasaAyuBonus: number;
  /** Stored as positive numbers; engine subtracts. Per critical/minor ala occurrence. */
  criticalAlaPenalty: number;
  minorAlaPenalty: number;
}
```

#### `DewasaInfo`, `Check`, `Evaluation`

```typescript
export interface DewasaInfo {
  code: DewasaCode;
  name: string; // human-readable, Indonesian
  type: 'ayu' | 'ala';
  /** Required for ala; undefined for ayu. */
  severity?: Severity;
  description: string; // 1-2 sentence explanation, Indonesian
  applicableCeremonies: CeremonyId[];
}

export interface Check {
  /** Identifier of the factor: 'saptawara', 'wuku', 'sasih', or 'dewasa_ayu:<code>' / 'dewasa_ala:<code>'. */
  factor: string;
  passed: boolean;
  weight: number; // from ScoringWeights
  /** Actual contribution to total score (positive for ayu, negative for ala). */
  contribution: number;
  /** Optional human-readable note (Indonesian). */
  notes?: string;
}

export interface Evaluation {
  ceremony: CeremonyId;
  rating: Rating;
  score: number; // raw score (can be negative)
  maxScore: number; // theoretical maximum for this ceremony (sum of positive weights)
  pct: number; // 0-100 (negative scores clamp to 0)
  checks: Check[];
  dewasaAyu: DewasaInfo[];
  dewasaAla: DewasaInfo[];
  /** True when any critical ala is present (overrides score in rating decision). */
  hasCriticalAla: boolean;
  /** Mirrors info.sasih.isEstimated — surfaced here for clients that hide the lunar info. */
  sasihEstimated: boolean;
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
  | 'OUT_OF_RANGE' // date before 1900 or after 2100
  | 'INVALID_PARAM'; // negative count, bad month/year, etc.
```

### Function signatures

All functions exported from `@dewasa-ayu/wariga-engine` as the public surface.

| Function             | Signature                                                                                  | Throws                                                             | Notes                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `getPawukonDay`      | `(date: Date) => number`                                                                   | `INVALID_DATE`                                                     | Returns 0-209.                                                                              |
| `getFullInfo`        | `(date: Date) => BalineseDate`                                                             | `INVALID_DATE`, `OUT_OF_RANGE` (post-2100 with non-cyclic sasih)   | Full decomposition.                                                                         |
| `getSasihInfo`       | `(date: Date) => SasihInfo`                                                                | `INVALID_DATE`                                                     | `isEstimated: true` when no correction data; never throws for valid dates inside 1900-2100. |
| `detectDewasa`       | `(info: BalineseDate, ceremonyId: CeremonyId) => { ayu: DewasaInfo[]; ala: DewasaInfo[] }` | `UNKNOWN_CEREMONY`                                                 | Pure derivation from `info`.                                                                |
| `evaluate`           | `(info: BalineseDate, ceremonyId: CeremonyId) => Evaluation`                               | `UNKNOWN_CEREMONY`                                                 | Composes dewasa detection + scoring.                                                        |
| `findGoodDates`      | `(from: Date, count: number, ceremonyId: CeremonyId) => FindGoodDatesResult`               | `INVALID_DATE`, `UNKNOWN_CEREMONY`, `INVALID_PARAM` (`count <= 0`) | Scans forward up to 365 days. Returns partial results with `capReached: true` if cap hit.   |
| `getMonthEvaluation` | `(year: number, month: number, ceremonyId: CeremonyId) => MonthData`                       | `UNKNOWN_CEREMONY`, `INVALID_PARAM` (month outside 1-12)           | `month` is 1-12 (human convention).                                                         |
| `calculateOtonan`    | `(birthdate: Date, targetYear: number) => OtonanInfo[]`                                    | `INVALID_DATE`, `INVALID_PARAM` (year outside 1900-2100)           | Returns all anniversaries in `targetYear` (typically 1-2 per year).                         |
| `calculateMesakapan` | `(person1Birthdate: Date, person2Birthdate: Date) => MesakapanResult`                      | `INVALID_DATE`                                                     | Pure derivation from birthdates.                                                            |

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

Index into lookup tables (mostly modulo) with a few derived from urip sums:

| Cycle               | Source               | Formula                                                                                                                                                   |
| ------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saptawara           | direct               | `pawukonDay % 7`                                                                                                                                          |
| Pancawara           | direct (with offset) | `(pawukonDay + PANCAWARA_OFFSET) % 5` — `PANCAWARA_OFFSET` MUST be calibrated so day 0 (Redite Sinta) → Umanis. Verify against PRD §13.2 reference dates. |
| Triwara             | direct               | `pawukonDay % 3`                                                                                                                                          |
| Sadwara             | direct               | `pawukonDay % 6`                                                                                                                                          |
| Astawara, Sangawara | composed             | Per traditional table (see `@dewasa-ayu/constants/wewaran-tables.ts`) — based on saptawara + pancawara combination                                        |
| Caturwara, Dwiwara  | derived              | Caturwara from `(SAPTAWARA_URIP[s] + PANCAWARA_URIP[p]) % 4`. Dwiwara split on `pawukonDay % 2`.                                                          |
| Dasawara            | derived              | `(SAPTAWARA_URIP[s] + PANCAWARA_URIP[p]) % 10`                                                                                                            |
| Wuku                | direct               | `floor(pawukonDay / 7)`                                                                                                                                   |

**Ekawara** (`luang`) applies only when the urip sum (`PANCAWARA_URIP[p] + SAPTAWARA_URIP[s]`) is **odd**; otherwise `ekawara: null`.

> **v0.2.0 reconciliation with [`wariga-engine-reference.md`](./wariga-engine-reference.md) §6.**
> The authoritative algorithm basis is now the `bilanganHari` method from the domain
> reference: `bilanganHari = bilanganWuku × 7 + bilanganSaptawara` (Sinta=1…Watugunung=30,
> Redite=0…Saniscara=6), i.e. `bilanganHari = pawukonDay + 7`. Two rows in the v0.1.0 table
> above are draft estimates and are **superseded** by §6:
>
> - **Caturwara** = `bilanganHari mod 4` **with the Jaya Tiga anomaly** in wuku Dungulan
>   (+2 from Redite Sinta through Redite Dungulan; +1 on Soma Dungulan) — _not_ a plain urip
>   sum. This anomaly is a classic silent-rewrite bug and gets a dedicated characterization test.
> - **Dasawara** = `(SAPTAWARA_URIP[s] + PANCAWARA_URIP[p] + 1) mod 10` — note the **`+ 1`**.
>
> Critically, **every cycle offset (Pancawara, Caturwara, Astawara, Sangawara, …) is a
> calibration target, not an assumption.** None are hardcoded from prose; each is locked by
> tests against (a) the `balinese-date-js-lib` oracle (Apache-2.0, dev-dependency only — never
> bundled, so the clean-room rule holds) and (b) a golden set digitised from a printed Rawi/PHDI
> calendar. Port order follows reference §10: Pawukon → wewaran → pawukon derivatives → Sasih
> (last, per-era).

#### Sasih (lunar approximation with correction lookup)

```
function getSasihInfo(date):
  if correction exists for date.year in sasih_corrections table:
    use correction record   # exact tilem/purnama dates and nampih/mala flags
    isEstimated = false
  else:
    dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    daysSinceEpoch = (dateUTC - SASIH_EPOCH) / 86_400_000
    cyclePosition = mod(daysSinceEpoch, SASIH_LUNAR_DAYS)   # 0 to ~29.5
    sasihIndexOffset = floor(daysSinceEpoch / SASIH_LUNAR_DAYS) % 12
    sasihIndex = (KADASA_INDEX + sasihIndexOffset) % 12      # KADASA_INDEX = 9
    rawPenanggal = round(cyclePosition) + 1                  # 1..30
    if rawPenanggal > 15:
      penanggal = rawPenanggal - 15
      isPangelong = true
    else:
      penanggal = rawPenanggal
      isPangelong = false
    isEstimated = true
    isNampih = false
    isMala = false

  isPurnama = (penanggal == 15 and not isPangelong)
  isTilem = (penanggal == 15 and isPangelong)
  tahunSaka = computeSaka(date)             # Gregorian → Saka year mapping per kalenderbali.org
  return SasihInfo { index, name, penanggal, isPangelong, isPurnama, isTilem, isNampih, isMala, isEstimated, tahunSaka }
```

Nampih (intercalary) and Mala (skipped) detection relies on the Tahun Saka cycle (every 19 years certain sasih are doubled or skipped). Pre-correction-data, the engine returns `isNampih: false, isMala: false`. Admin correction records (PRD §11 `sasih_corrections`) override estimation per year.

#### Evaluation scoring (PRD §6)

Pseudocode showing the shape; actual weights come from the per-ceremony `ScoringWeights`:

```
function evaluate(info, ceremonyId):
  config = lookupCeremonyConfig(ceremonyId)        # throws UNKNOWN_CEREMONY
  checks = []
  score = 0

  # --- Factor checks ---
  saptawaraIdx = SAPTAWARA_NAMES.indexOf(info.saptawara)
  saptawaraPassed = config.saptawaraGood.includes(saptawaraIdx)
  pushCheck(checks, 'saptawara', saptawaraPassed, config.scoringWeights.saptawara)

  wukuForbidden = isForbiddenWuku(info.wuku, ceremonyId)        # from rules data
  pushCheck(checks, 'wuku', !wukuForbidden, config.scoringWeights.wuku)

  sasihGood = config.sasihRules.good.includes(info.sasih.index)
  sasihBad  = config.sasihRules.bad.includes(info.sasih.index)
  pushCheck(checks, 'sasih', sasihGood && !sasihBad, config.scoringWeights.sasih)

  penanggalOK = !info.sasih.isPangelong || !config.requirePenanggal
  pushCheck(checks, 'penanggal', penanggalOK, config.scoringWeights.penanggal)

  penanggalNumberGood = config.requirePenanggal ? info.sasih.penanggal in goodNumbers(ceremonyId) : true
  pushCheck(checks, 'penanggal_number', penanggalNumberGood, config.scoringWeights.penanggalNumber)

  ingkelOK = info.ingkel != 'wong' || ceremonyId in IGNORES_INGKEL_WONG
  pushCheck(checks, 'ingkel_jejepan', ingkelOK, config.scoringWeights.ingkelJejepan)

  sangawaraGood = info.sangawara in ('tulus', 'dadi')
  pushCheck(checks, 'sangawara', sangawaraGood, config.scoringWeights.sangawara)

  # --- Dewasa detection ---
  dewasa = detectDewasa(info, ceremonyId)         # throws UNKNOWN_CEREMONY
  for ayu in dewasa.ayu:
    pushCheck(checks, `dewasa_ayu:${ayu.code}`, true, config.scoringWeights.dewasaAyuBonus)

  hasCriticalAla = false
  for ala in dewasa.ala:
    penalty = ala.severity == 'critical' ? config.scoringWeights.criticalAlaPenalty
                                          : config.scoringWeights.minorAlaPenalty
    if ala.severity == 'critical': hasCriticalAla = true
    pushCheck(checks, `dewasa_ala:${ala.code}`, false, -penalty)

  # --- Aggregate ---
  score = sum(c.contribution for c in checks)
  maxScore = sum(c.weight for c in checks if c.weight > 0)
  pct = clamp(0, 100, (score / maxScore) * 100)

  rating = computeRating(score, pct, hasCriticalAla, info.sasih.isPangelong,
                         config.requirePenanggal, saptawaraPassed, wukuForbidden)

  return Evaluation { ceremony, rating, score, maxScore, pct, checks, dewasaAyu, dewasaAla, hasCriticalAla, sasihEstimated: info.sasih.isEstimated }
```

#### Rating decision (PRD §6.2)

```
function computeRating(score, pct, hasCriticalAla, isPangelong, requirePenanggal, saptawaraPassed, wukuForbidden):
  if hasCriticalAla:
    return 'bad'
  if requirePenanggal and isPangelong and not saptawaraPassed:
    return 'bad'
  if pct >= 60
     and saptawaraPassed
     and not wukuForbidden
     and (not requirePenanggal or not isPangelong)
     and not hasCriticalAla:
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

Reference dates from PRD §13.2 (subset). Implementation MUST match these exactly for Pawukon-derived values; Sasih values may differ by ±1 day until correction data lands and `isEstimated` flips false.

| Gregorian  | Wuku       | Saptawara | Pancawara | Sasih (est.) | Notes                                                                |
| ---------- | ---------- | --------- | --------- | ------------ | -------------------------------------------------------------------- |
| 2024-01-01 | krulut     | soma      | pon       | kapitu       | PRD reference                                                        |
| 2024-03-11 | watugunung | soma      | umanis    | kasanga      | End of Pawukon cycle                                                 |
| 2024-04-09 | ukir       | anggara   | kliwon    | kadasa       | **Sasih reference date**, Penanggal 1 exactly (`isEstimated: false`) |
| 2025-01-01 | prangbakat | buda      | wage      | kapitu       | PRD reference                                                        |
| 2025-03-29 | watugunung | saniscara | umanis    | kasanga      | End-cycle Saniscara Umanis                                           |
| 2026-01-01 | krulut     | wraspati  | pon       | kapitu       | PRD reference                                                        |

Canonical worked example for `evaluate`: `evaluate(getFullInfo(new Date('2026-04-06')), 'pawiwahan')`. Expected rating, score, and dewasa list are locked in the engine test suite alongside implementation (issue [#2](https://github.com/RacThug/dewasa-ayu/issues/2) deliverable).

## Decisions & Rationale

- **String-literal unions instead of TypeScript `enum`.** Smaller bundle, tree-shakeable, narrower types at boundaries. Trade-off: no runtime enum object; consumers wanting a list at runtime read from `@dewasa-ayu/constants`. Aligns with PRD §22.2 (engine <30 KB gzipped).

- **All indices 0-based; penanggal stays 1-based.** Matches PRD §10.1 (`getPawukonDay → 0-209`) and idiomatic TypeScript. Penanggal is exposed as 1-15 because that's how it's spoken about culturally — users see numbers, not array indices.

- **Throw `WarigaError` for invalid input; structured returns for valid edge cases.** Bad input (NaN Date, unknown ceremony) is a programmer error and should be visible at the call site. Domain edge cases (Nampih Sasih, estimated Sasih, dates outside 1900-2100) return data with explicit flags (`isEstimated`, `isNampih`, `isMala`, `capReached`) so consumers react without try/catch. `Result<T, E>` was considered but rejected as too verbose for a calculation library where 99% of calls succeed.

- **`isEstimated: true` on Sasih when no correction data exists.** Makes drift between estimation and reality visible to the API and frontend, which can render a "Sasih estimated" tag (PRD §17.2 feedback widget depends on this signal).

- **Public surface is types + functions + error class; constants live in a sibling package.** Lets the constants package change (new ceremony, expanded lookup tables) without touching engine code. Aligns with PRD §7.4 monorepo structure.

- **Otonan and Mesakapan included now despite Phase 2 timeline.** Spec is a contract; timeline is backlog. Locking Phase 2 types now prevents a future breaking change when those functions land. Functions remain unimplemented (throw `WarigaError('INVALID_PARAM', 'NOT_IMPLEMENTED')` from the engine package until their epics are scheduled).

- **Sasih estimation in-engine, not just lookup.** PRD §10.2 mandates lunar approximation 29.530588 d. Admin corrections (PRD §11 `sasih_corrections`) override estimation per year. Engine prefers correction when present.

- **`findGoodDates` returns a `FindGoodDatesResult` envelope, not bare array.** Allows the function to surface partial results when the 365-day scan cap is hit without throwing. Resolves an open question from initial draft.

- **`tahunSaka` lives on `SasihInfo`, not on `BalineseDate` directly.** Saka is a lunar-calendar concept; bundling it inside `SasihInfo` keeps `BalineseDate` cohesive (each top-level field is one logical decomposition).

- **Bundle includes engine + constants + ceremony-rules together when used in browser.** Combined target <50 KB gzipped (PRD §22.2 allows engine 30 KB, ceremony-rules 10 KB, with constants distributed across both).

## Open Questions

- [Q] Should `calculateMesakapan` accept additional `weton`-style inputs (Java/Lombok variant) for cross-tradition users, or is Bali-Wariga-only enough for v1? Owner: @RacThug. Target: when Phase 2 (PRD §F-102) is scheduled.
- [Q] **All Wewaran cycle offsets** (Pancawara, Caturwara, Astawara, Sangawara, …) must be empirically calibrated against PRD §13.2 reference dates **and a printed Rawi/PHDI calendar**, then locked by tests — not assumed from prose. The `bilanganHari` basis ([`wariga-engine-reference.md`](./wariga-engine-reference.md) §6) is the starting hypothesis; the oracle + golden set decide the final constants. Owner: @RacThug. Target: during Phase 1 implementation (#2). Resolution records the concrete offsets here.
- [Q] **Dewasa code unions are provisional.** `DewasaAyuCode` / `DewasaAlaCode` above were drafted from the PRD and do **not** yet match the names/conditions in [`dewasa-rules.seed.json`](../research/dewasa-rules.seed.json). They will be reconciled — and likely replaced by **data-driven ids** (each rule carrying `source` + `verified`, per the reference §8 "rules as data" decision) — when `detectDewasa` is implemented. Until then no rule is treated as final; unverified rules surface as `estimasi`. Owner: @RacThug. Target: dewasa-detection step of Phase 1 (#2).
- [Q] How should `getFullInfo` behave for dates before 1900? Currently spec says "throws `OUT_OF_RANGE`", but Pawukon is purely cyclic and would still be accurate; only Sasih estimation would be unreliable. Alternative: return data with `sasih.isEstimated = true` and emit a console warning, never throw. Owner: @RacThug. Target: before lock to v1.0.0.
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

- v0.2.1 — 2026-05-30 — Corrected `PAWUKON_EPOCH` to 17 June 2012 (the prior 11 June 2012 was 6 days early — it lands on Soma Watugunung, not Redite Sinta), calibrated and locked against the oracle (every day in 2000–2030) plus the Galungan 2024-02-28 anchor. Implemented the first engine slice — `getPawukonDay` and `getWuku` in `packages/wariga-engine` — with 100% test coverage.
- v0.2.0 — 2026-05-30 — Reconciled the algorithm layer with the new domain reference (`wariga-engine-reference.md` §6): adopted the `bilanganHari` basis, corrected Caturwara (`mod 4` + Dungulan Jaya Tiga anomaly) and Dasawara (`+ 1`), generalised offset calibration to all cycles, and documented the oracle + golden-test strategy. Flagged the Dewasa code unions as provisional pending reconciliation with `dewasa-rules.seed.json` (likely moving to data-driven ids with `source`/`verified`). No type or signature changes — additive/clarifying only, hence a minor bump.
- v0.1.0 — 2026-05-28 — Initial draft. Full public surface for Phase 1 (7 functions) and Phase 2 (Otonan, Mesakapan). Four open questions flagged (Mesakapan weton scope, Pancawara offset calibration, pre-1900 date handling, week-start parameter).
