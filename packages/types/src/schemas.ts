/**
 * Zod schemas for the REST API (API-001), shared by the NestJS backend and the
 * frontend client. Kept in `@dewasa-ayu/types` (subpath `@dewasa-ayu/types/schemas`)
 * per the "Zod everywhere" decision. The engine itself imports ONLY the root type
 * entry (pure types), so it stays zero-runtime-dependency — Zod never reaches it.
 *
 * Enum members are duplicated from the string-literal unions in `./index` rather than
 * imported from `@dewasa-ayu/constants`, to avoid a types↔constants package cycle. The
 * `*_satisfies` checks at the bottom assert the duplicates stay in sync with the unions.
 *
 * Wire note: Dates serialise as ISO strings, so `gregorian` and `date` are `z.string()`
 * here; the API service converts engine `Date`s before responding.
 */
import { z } from 'zod';

import type { BalineseDate, CeremonyId, DewasaInfo, Evaluation, Rating, SasihInfo } from './index';

// --- Enums (mirror the unions in ./index) ---

export const WukuSchema = z.enum([
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
]);
export const SaptawaraSchema = z.enum([
  'redite',
  'soma',
  'anggara',
  'buda',
  'wraspati',
  'sukra',
  'saniscara',
]);
export const PancawaraSchema = z.enum(['umanis', 'paing', 'pon', 'wage', 'kliwon']);
export const TriwaraSchema = z.enum(['pasah', 'beteng', 'kajeng']);
export const SadwaraSchema = z.enum(['tungleh', 'aryang', 'urukung', 'paniron', 'was', 'maulu']);
export const DwiwaraSchema = z.enum(['menga', 'pepet']);
export const EkawaraSchema = z.enum(['luang']);
export const DasawaraSchema = z.enum([
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
]);
export const AstawaraSchema = z.enum([
  'sri',
  'indra',
  'guru',
  'yama',
  'ludra',
  'brahma',
  'kala',
  'uma',
]);
export const SangawaraSchema = z.enum([
  'dangu',
  'jangur',
  'gigis',
  'nohan',
  'ogan',
  'erangan',
  'urungan',
  'tulus',
  'dadi',
]);
export const CaturwaraSchema = z.enum(['sri', 'laba', 'jaya', 'menala']);
export const SasihSchema = z.enum([
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
]);
export const IngkelSchema = z.enum(['wong', 'sato', 'mina', 'manuk', 'taru', 'buku']);
export const JejepanSchema = z.enum(['mina', 'taru', 'sato', 'patra', 'wong', 'paksi']);
export const CeremonyIdSchema = z.enum([
  'pawiwahan',
  'manusa_yadnya',
  'dewa_yadnya',
  'pitra_yadnya',
  'pembangunan',
  'usaha',
]);
export const RatingSchema = z.enum(['ayu', 'caution', 'bad']);
export const DewasaPolaritySchema = z.enum(['ayu', 'ala']);
export const DewasaSeveritySchema = z.enum(['critical', 'minor']);

// --- Engine output shapes (wire form) ---

export const SasihInfoSchema = z.object({
  index: z.number().int(),
  name: SasihSchema,
  penanggal: z.number().int(),
  isPangelong: z.boolean(),
  isPurnama: z.boolean(),
  isTilem: z.boolean(),
  isNampih: z.boolean(),
  isMala: z.boolean(),
  isEstimated: z.boolean(),
  tahunSaka: z.number().int(),
});

export const BalineseDateSchema = z.object({
  gregorian: z.string(), // ISO 8601 (UTC midnight)
  pawukonDay: z.number().int(),
  wuku: WukuSchema,
  ekawara: EkawaraSchema.nullable(),
  dwiwara: DwiwaraSchema,
  triwara: TriwaraSchema,
  caturwara: CaturwaraSchema,
  pancawara: PancawaraSchema,
  sadwara: SadwaraSchema,
  saptawara: SaptawaraSchema,
  astawara: AstawaraSchema,
  sangawara: SangawaraSchema,
  dasawara: DasawaraSchema,
  sasih: SasihInfoSchema,
  ingkel: IngkelSchema,
  jejepan: JejepanSchema,
  totalUrip: z.number().int(),
});

export const DewasaInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: DewasaPolaritySchema,
  severity: DewasaSeveritySchema.optional(),
  note: z.string(),
  source: z.string(),
  estimated: z.boolean(),
});

export const CheckSchema = z.object({
  factor: z.string(),
  passed: z.boolean(),
  weight: z.number(),
  contribution: z.number(),
  note: z.string().optional(),
});

export const EvaluationSchema = z.object({
  ceremony: CeremonyIdSchema,
  rating: RatingSchema,
  score: z.number(),
  maxScore: z.number(),
  pct: z.number(),
  checks: z.array(CheckSchema),
  dewasaAyu: z.array(DewasaInfoSchema),
  dewasaAla: z.array(DewasaInfoSchema),
  estimated: z.boolean(),
});

export const EvaluatedDateSchema = z.object({
  date: z.string(), // ISO 8601
  info: BalineseDateSchema,
  evaluation: EvaluationSchema,
});

// --- Request query schemas ---

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Strict `YYYY-MM-DD` that is also a REAL calendar date — rejects 2026-02-31
 *  and friends, which `new Date()` would otherwise silently roll over into the
 *  next month (the response would then claim a date it never evaluated). */
export const IsoDateSchema = z
  .string()
  .regex(ISO_DATE)
  .refine(
    (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      const date = new Date(y!, m! - 1, d!);
      return date.getFullYear() === y && date.getMonth() === m! - 1 && date.getDate() === d;
    },
    { message: 'Not a real calendar date' },
  );

export const CheckQuerySchema = z.object({
  date: IsoDateSchema,
  ceremony: CeremonyIdSchema,
});

export const MonthQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  month: z.coerce.number().int().min(1).max(12),
  ceremony: CeremonyIdSchema,
});

export const RecommendQuerySchema = z.object({
  from: IsoDateSchema,
  count: z.coerce.number().int().min(1).max(20),
  ceremony: CeremonyIdSchema,
});

export const RangeQuerySchema = z
  .object({
    from: IsoDateSchema,
    to: IsoDateSchema,
    ceremony: CeremonyIdSchema,
  })
  .refine(({ from, to }) => new Date(to).getTime() - new Date(from).getTime() <= 90 * 86_400_000, {
    message: 'Range must be ≤ 90 days',
    path: ['to'],
  })
  .refine(({ from, to }) => new Date(to).getTime() >= new Date(from).getTime(), {
    message: '`to` must be on or after `from`',
    path: ['to'],
  });

export const DewasaQuerySchema = z.object({
  ceremony: z
    .union([CeremonyIdSchema, z.literal('all')])
    .optional()
    .default('all'),
  type: DewasaPolaritySchema.optional(),
});

// --- Response schemas ---

export const CheckResponseSchema = z.object({
  date: z.string(),
  info: BalineseDateSchema,
  evaluation: EvaluationSchema,
});

export const MonthResponseSchema = z.object({
  year: z.number().int(),
  month: z.number().int(),
  ceremony: CeremonyIdSchema,
  days: z.array(EvaluatedDateSchema),
  summary: z.object({
    ayuCount: z.number().int(),
    cautionCount: z.number().int(),
    badCount: z.number().int(),
    topDates: z.array(EvaluatedDateSchema),
  }),
});

export const RecommendResponseSchema = z.object({
  from: z.string(),
  count: z.number().int(),
  dates: z.array(EvaluatedDateSchema),
  capReached: z.boolean(),
});

export const RangeResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  ceremony: CeremonyIdSchema,
  dates: z.array(EvaluatedDateSchema),
});

export const CeremoniesResponseSchema = z.object({
  ceremonies: z.array(
    z.object({
      id: CeremonyIdSchema,
      name: z.string(),
    }),
  ),
});

export const DewasaRuleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  generalCategory: z.enum(['ayu', 'ala', 'contextual']),
  conditionText: z.string(),
  source: z.string(),
  verified: z.boolean(),
  appliesTo: z.array(CeremonyIdSchema),
});

export const DewasaResponseSchema = z.object({
  ceremony: z.union([CeremonyIdSchema, z.literal('all')]),
  rules: z.array(DewasaRuleSummarySchema),
});

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  engineVersion: z.string(),
  uptime: z.number(),
});

export const ErrorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum([
      'INVALID_DATE',
      'UNKNOWN_CEREMONY',
      'INVALID_PARAM',
      'OUT_OF_RANGE',
      'RATE_LIMITED',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'INTERNAL_ERROR',
    ]),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
});

// --- Drift guards: the wire schemas must stay assignable to the engine types ---
// (Dates differ — engine uses `Date`, wire uses ISO `string` — so only the non-date
// fields are checked here via Omit.)
type WireExtras = 'gregorian' | 'date';
const _sasih = {} as z.infer<typeof SasihInfoSchema> satisfies SasihInfo;
const _info = {} as Omit<z.infer<typeof BalineseDateSchema>, WireExtras> satisfies Omit<
  BalineseDate,
  WireExtras
>;
const _dewasa = {} as z.infer<typeof DewasaInfoSchema> satisfies DewasaInfo;
const _evaln = {} as z.infer<typeof EvaluationSchema> satisfies Evaluation;
const _rating = 'ayu' as z.infer<typeof RatingSchema> satisfies Rating;
const _ceremony = 'usaha' as z.infer<typeof CeremonyIdSchema> satisfies CeremonyId;
void [_sasih, _info, _dewasa, _evaln, _rating, _ceremony];
