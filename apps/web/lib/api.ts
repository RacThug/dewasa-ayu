import type { BalineseDate, CeremonyId, Evaluation } from '@dewasa-ayu/types';

// The API serialises Dates as ISO strings; everything else matches the engine types.
export type WireInfo = Omit<BalineseDate, 'gregorian'> & { gregorian: string };

export interface CheckResult {
  date: string;
  info: WireInfo;
  evaluation: Evaluation;
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

/** Server-side call to the Wariga API. Throws `ApiError` on a non-2xx response. */
export async function checkDate(date: string, ceremony: CeremonyId): Promise<CheckResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/calendar/check?date=${date}&ceremony=${ceremony}`, {
      cache: 'no-store',
    });
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
  return res.json() as Promise<CheckResult>;
}
