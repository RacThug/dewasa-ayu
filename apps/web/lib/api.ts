import type { BalineseDate, CeremonyId, EvaluatedDate, Evaluation } from '@dewasa-ayu/types';
import { IsoDateSchema } from '@dewasa-ayu/types/schemas';
import {
  evaluate,
  findGoodDates,
  getFullInfo,
  getMonthEvaluation,
  WarigaError,
} from '@dewasa-ayu/wariga-engine';

// Dates cross the server/client boundary as ISO strings; everything else matches
// the engine types. (Kept identical to the REST wire format so the API remains a
// drop-in alternative for third-party consumers — see `apps/api`.)
export type WireInfo = Omit<BalineseDate, 'gregorian'> & { gregorian: string };

export interface WireEvaluatedDate {
  date: string;
  info: WireInfo;
  evaluation: Evaluation;
}

export type CheckResult = WireEvaluatedDate;

export interface MonthResult {
  year: number;
  month: number;
  ceremony: CeremonyId;
  days: WireEvaluatedDate[];
  summary: {
    ayuCount: number;
    cautionCount: number;
    badCount: number;
    topDates: WireEvaluatedDate[];
  };
}

export interface RecommendResult {
  from: string;
  count: number;
  dates: WireEvaluatedDate[];
  capReached: boolean;
}

/** The six ceremonies (stable presentation data for the nav + headings). */
export const CEREMONIES = [
  { id: 'pawiwahan', label: 'Pawiwahan', forText: 'pawiwahan' },
  { id: 'manusa_yadnya', label: 'Manusa Yadnya', forText: 'upacara manusa yadnya' },
  { id: 'dewa_yadnya', label: 'Dewa Yadnya', forText: 'upacara dewa yadnya' },
  { id: 'pitra_yadnya', label: 'Pitra Yadnya', forText: 'upacara pitra yadnya' },
  { id: 'pembangunan', label: 'Pembangunan', forText: 'pembangunan' },
  { id: 'usaha', label: 'Usaha', forText: 'memulai usaha' },
] as const satisfies ReadonlyArray<{ id: CeremonyId; label: string; forText: string }>;

export function isCeremonyId(value: string): value is CeremonyId {
  return CEREMONIES.some((c) => c.id === value);
}

export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** User-facing copy per error code (Bahasa Indonesia — never show the raw
 *  English engine message to users; the code is the stable contract). */
const ERROR_COPY: Record<string, string> = {
  OUT_OF_RANGE: 'Tanggal di luar rentang yang didukung (3 Januari 2003 – 31 Desember 2100).',
  INVALID_DATE: 'Tanggal tidak valid — periksa kembali tanggal yang dimasukkan.',
  INVALID_PARAM: 'Permintaan tidak valid — periksa kembali tanggal yang dimasukkan.',
  UNKNOWN_CEREMONY: 'Jenis upacara tidak dikenali.',
};
const ERROR_FALLBACK = 'Terjadi kesalahan pada layanan. Silakan coba lagi.';

/** Parse a strict `YYYY-MM-DD` string into a local Date whose Y/M/D components are
 *  exactly those digits — timezone-independent (the engine reads local components).
 *
 *  Validates against the shared schema first: `new Date()` silently rolls
 *  2026-02-31 over into March, so an unvalidated string would yield a verdict
 *  for a date the user never asked about. Same rule the REST API enforces. */
function parseISODate(iso: string): Date {
  if (!IsoDateSchema.safeParse(iso).success) {
    throw new ApiError('INVALID_DATE', ERROR_COPY.INVALID_DATE ?? ERROR_FALLBACK);
  }
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

function wireInfo(info: BalineseDate): WireInfo {
  return { ...info, gregorian: info.gregorian.toISOString() };
}

function wireEvaluated(e: EvaluatedDate): WireEvaluatedDate {
  return { date: e.date.toISOString(), info: wireInfo(e.info), evaluation: e.evaluation };
}

/** Engine errors carry the same stable codes the UI already maps to Indonesian
 *  copy; anything else is an unexpected fault and gets the generic fallback. */
function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  const code = err instanceof WarigaError ? err.code : 'INTERNAL_ERROR';
  return new ApiError(code, ERROR_COPY[code] ?? ERROR_FALLBACK);
}

/** The engine is a zero-dependency pure function bundled into this app, so these
 *  run in-process — no network hop, no second service to keep alive. They stay
 *  async because callers await them (and `Promise.allSettled` them) per section. */
export async function checkDate(date: string, ceremony: CeremonyId): Promise<CheckResult> {
  try {
    const info = getFullInfo(parseISODate(date));
    return { date, info: wireInfo(info), evaluation: evaluate(info, ceremony) };
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getMonth(
  year: number,
  month: number,
  ceremony: CeremonyId,
): Promise<MonthResult> {
  try {
    const m = getMonthEvaluation(year, month, ceremony);
    return {
      year: m.year,
      month: m.month,
      ceremony: m.ceremony,
      days: m.days.map(wireEvaluated),
      summary: {
        ayuCount: m.summary.ayuCount,
        cautionCount: m.summary.cautionCount,
        badCount: m.summary.badCount,
        topDates: m.summary.topDates.map(wireEvaluated),
      },
    };
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getRecommend(
  from: string,
  count: number,
  ceremony: CeremonyId,
): Promise<RecommendResult> {
  try {
    const r = findGoodDates(parseISODate(from), count, ceremony);
    return { from, count, dates: r.dates.map(wireEvaluated), capReached: r.capReached };
  } catch (err) {
    throw toApiError(err);
  }
}
