/**
 * Engine-sourced test data. The engine is a pure, zero-dep function, so we call
 * it in-process to compute what the UI MUST show end-to-end. No hand-guessed
 * numbers — every expected value comes from the engine itself.
 */
import type { CeremonyId, Rating } from '@dewasa-ayu/types';
import { evaluate, findGoodDates, getFullInfo } from '@dewasa-ayu/wariga-engine';

/** Mirror of apps/api/src/calendar.service.ts parseISODate (engine reads local Y/M/D). */
export function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Calendar day (YYYY-MM-DD) from an engine `gregorian` Date (UTC midnight). */
export function utcToISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Verdict labels — mirror apps/web/lib/display.ts VERDICT (user-facing copy). */
export const VERDICT_LABEL: Record<Rating, string> = {
  ayu: 'Dewasa ayu',
  caution: 'Kurang ideal',
  bad: 'Kurang baik',
};

export interface ExpectedVerdict {
  rating: Rating;
  label: string;
  pct: number;
}

/** What the engine says for (date, ceremony) — the UI must match this. */
export function expectedVerdict(iso: string, ceremony: CeremonyId): ExpectedVerdict {
  const ev = evaluate(getFullInfo(isoToDate(iso)), ceremony);
  return { rating: ev.rating, label: VERDICT_LABEL[ev.rating], pct: Math.round(ev.pct) };
}

/** First "ayu" date on/after `fromISO`, chosen by the engine. */
export function firstAyuDate(fromISO: string, ceremony: CeremonyId): string {
  const r = findGoodDates(isoToDate(fromISO), 1, ceremony);
  if (r.dates.length === 0) throw new Error(`no ayu date for ${ceremony} from ${fromISO}`);
  return utcToISO(r.dates[0]!.date);
}

/** First non-"ayu" date on/after `fromISO` (scans via the engine). */
export function firstNonAyuDate(fromISO: string, ceremony: CeremonyId): string {
  const start = isoToDate(fromISO);
  for (let i = 0; i < 366; i += 1) {
    const info = getFullInfo(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    if (evaluate(info, ceremony).rating !== 'ayu') return utcToISO(info.gregorian);
  }
  throw new Error(`no non-ayu date for ${ceremony} from ${fromISO}`);
}

/** First date whose Wuku factor FAILS (forbidden wuku) — exercises the analysis row. */
export function firstWukuFailDate(fromISO: string, ceremony: CeremonyId): string {
  const start = isoToDate(fromISO);
  for (let i = 0; i < 732; i += 1) {
    const info = getFullInfo(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    const ev = evaluate(info, ceremony);
    if (ev.checks.some((c) => c.factor === 'wuku' && !c.passed)) return utcToISO(info.gregorian);
  }
  throw new Error(`no wuku-fail date for ${ceremony} from ${fromISO}`);
}

export const CEREMONY: CeremonyId = 'pawiwahan';
