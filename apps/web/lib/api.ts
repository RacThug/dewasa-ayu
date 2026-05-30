import type { BalineseDate, CeremonyId, Evaluation } from '@dewasa-ayu/types';

// The API serialises Dates as ISO strings; everything else matches the engine types.
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

const API_BASE = process.env.API_URL ?? 'http://localhost:3001/api/v1';

/** Server-side GET against the Wariga API. Throws `ApiError` on a non-2xx response. */
async function getJSON<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  } catch {
    throw new ApiError('UNREACHABLE', 'Tidak dapat menghubungi layanan. Pastikan API berjalan.');
  }
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const err =
      typeof body === 'object' && body !== null
        ? (body as { error?: { code?: string; message?: string } }).error
        : undefined;
    throw new ApiError(err?.code ?? 'INTERNAL_ERROR', err?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function checkDate(date: string, ceremony: CeremonyId): Promise<CheckResult> {
  return getJSON(`/calendar/check?date=${date}&ceremony=${ceremony}`);
}

export function getMonth(year: number, month: number, ceremony: CeremonyId): Promise<MonthResult> {
  return getJSON(`/calendar/month?year=${year}&month=${month}&ceremony=${ceremony}`);
}

export function getRecommend(
  from: string,
  count: number,
  ceremony: CeremonyId,
): Promise<RecommendResult> {
  return getJSON(`/calendar/recommend?from=${from}&count=${count}&ceremony=${ceremony}`);
}
