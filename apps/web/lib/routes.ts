import { CAL_MAX, CAL_MIN } from './display';

const pad = (n: number): string => String(n).padStart(2, '0');

/** Shape check only. `2026-02-31` passes here on purpose: the engine rejects it
 *  further down, which is what renders the Indonesian "periksa kembali tanggal"
 *  copy. Anything that fails this is not a date at all and 404s. */
export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Router prefetch for the calendar's in-page links (day cells, month arrows,
 * ceremony tabs, recommendations).
 *
 * Off, and not because of server cost -- these pages are CDN-cached, so a click
 * already resolves without a server render. It is the bandwidth: one screen holds
 * ~39 of these links, and Next fetches several segments per link, so eager
 * prefetch pulled a measured 1 MB on top of a 1 MB page view. The audience is
 * mobile-first and often on metered data; doubling the page weight to shave a few
 * milliseconds off a cache hit is a bad trade.
 */
export const PREFETCH_LINKS = false;

/** Canonical URL of a verdict page, e.g. `/pawiwahan/2026-08-12`.
 *
 *  Every internal link goes through this. The page it points at is deterministic
 *  -- the Wariga for a given day never changes -- so it is cached permanently at
 *  the CDN and computed at most once, ever. That is only true while the URL
 *  carries the full state; do not reintroduce query params that alter content. */
export const dayHref = (ceremony: string, date: string): string => `/${ceremony}/${date}`;

/**
 * The same day-of-month one month away, clamped to that month's length so
 * 31 March steps back to 28 February rather than overflowing into March.
 *
 * Returns `null` when the target month falls outside the calendar's range, which
 * is how the nav arrows know to render as dead ends instead of links.
 */
export function shiftMonth(date: string, delta: -1 | 1): string | null {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7));
  const d = Number(date.slice(8, 10));

  const raw = m + delta;
  const year = y + (raw === 0 ? -1 : raw === 13 ? 1 : 0);
  const month = raw === 0 ? 12 : raw === 13 ? 1 : raw;

  if (year < CAL_MIN.y || (year === CAL_MIN.y && month < CAL_MIN.m)) return null;
  if (year > CAL_MAX.y || (year === CAL_MAX.y && month > CAL_MAX.m)) return null;

  const lastDay = new Date(year, month, 0).getDate(); // day 0 of the next month
  return `${year}-${pad(month)}-${pad(Math.min(d, lastDay))}`;
}

/** Clamp a month onto the first day of the nearest browsable month. Used by the
 *  legacy `/kalender?year=&month=` redirect, which accepted out-of-range months. */
export function firstDayOfClampedMonth(year: number, month: number): string {
  if (year < CAL_MIN.y || (year === CAL_MIN.y && month < CAL_MIN.m))
    return `${CAL_MIN.y}-${pad(CAL_MIN.m)}-01`;
  if (year > CAL_MAX.y || (year === CAL_MAX.y && month > CAL_MAX.m))
    return `${CAL_MAX.y}-${pad(CAL_MAX.m)}-01`;
  return `${year}-${pad(month)}-01`;
}
