import { PAWUKON_CYCLE, PAWUKON_EPOCH, WUKU_NAMES } from '@dewasa-ayu/constants';
import type { Wuku } from '@dewasa-ayu/types';

import { WarigaError } from './errors';

const MS_PER_DAY = 86_400_000;

/**
 * Pawukon day number (0–209) for a Gregorian date. Day 0 = Redite Sinta.
 *
 * The date's local year/month/day is read and treated as UTC midnight, so the
 * result is independent of the host timezone. Throws `WarigaError('INVALID_DATE')`
 * for a non-Date argument or an invalid (NaN) Date.
 */
export function getPawukonDay(date: Date): number {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new WarigaError('INVALID_DATE', 'getPawukonDay: expected a valid Date');
  }
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((utc - PAWUKON_EPOCH) / MS_PER_DAY);
  // JS `%` keeps the sign of the dividend; normalise into [0, PAWUKON_CYCLE).
  return ((diffDays % PAWUKON_CYCLE) + PAWUKON_CYCLE) % PAWUKON_CYCLE;
}

/**
 * Wuku (1 of 30) for a Gregorian date. Each wuku spans 7 days (Redite–Saniscara),
 * so the week number is `floor(pawukonDay / 7)`.
 */
export function getWuku(date: Date): Wuku {
  const wukuIndex = Math.floor(getPawukonDay(date) / 7);
  // wukuIndex is 0–29 because getPawukonDay returns 0–209: always in range.
  return WUKU_NAMES[wukuIndex]!;
}
