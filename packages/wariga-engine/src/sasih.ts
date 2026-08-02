import {
  SASIH_EPOCH,
  SASIH_LAST_DAY,
  SASIH_MONTH_KIND,
  SASIH_MONTH_SAKA,
  SASIH_MONTH_SID,
  SASIH_NAMES,
  SASIH_NGUNALATRI_DAYS,
} from '@dewasa-ayu/constants';
import type { SasihInfo } from '@dewasa-ayu/types';

import { WarigaError } from './errors';

const MS_PER_DAY = 86_400_000;

/**
 * The inclusive date range the Sasih table covers (2003-01-03 .. 2100-12-31),
 * as local-component dates (the engine reads local Y/M/D everywhere).
 * Dates outside this range make `getSasihInfo` (and everything built on it)
 * throw `OUT_OF_RANGE`.
 */
export function getSupportedRange(): { min: Date; max: Date } {
  const epoch = new Date(SASIH_EPOCH);
  const last = new Date(SASIH_EPOCH + SASIH_LAST_DAY * MS_PER_DAY);
  return {
    min: new Date(epoch.getUTCFullYear(), epoch.getUTCMonth(), epoch.getUTCDate()),
    max: new Date(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate()),
  };
}

/** Count of ngunalatri (doubled-penanggal) days strictly before `dayNumber`. */
function ngunalatriBefore(dayNumber: number): number {
  let lo = 0;
  let hi = SASIH_NGUNALATRI_DAYS.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (SASIH_NGUNALATRI_DAYS[mid]! < dayNumber) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Lunar decomposition (sasih, penanggal/pangelong, purnama/tilem, saka) for a date.
 *
 * Backed by a precomputed table (`@dewasa-ayu/constants`) validated day-by-day against
 * the calendar reckoning. The global "lunar unit" model: each solar day is one
 * penanggal unit, a ngunalatri day is two; `firstUnit = daysSinceEpoch + ngunalatri
 * days before it`; month = `floor(firstUnit / 30)`, position = `firstUnit % 30`.
 *
 * Throws `INVALID_DATE` for bad input and `OUT_OF_RANGE` outside the supported range
 * (~2003-2100). Unlike the Pawukon cycle, Sasih cannot be cheaply extrapolated.
 */
export function getSasihInfo(date: Date): SasihInfo {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new WarigaError('INVALID_DATE', 'getSasihInfo: expected a valid Date');
  }
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = Math.floor((utc - SASIH_EPOCH) / MS_PER_DAY);
  if (dayNumber < 0 || dayNumber > SASIH_LAST_DAY) {
    throw new WarigaError(
      'OUT_OF_RANGE',
      'getSasihInfo: date outside the supported Sasih range (2003-2100)',
    );
  }

  const ngunalatriIndex = ngunalatriBefore(dayNumber);
  const firstUnit = dayNumber + ngunalatriIndex;
  const monthIndex = Math.floor(firstUnit / 30);
  const unitInMonth = firstUnit % 30;

  // A ngunalatri day carries two penanggal. Purnama (unit 14) / Tilem (unit 29) land
  // on it even as the second value — e.g. a [14, 15] day is still the Purnama.
  const isDoubled = SASIH_NGUNALATRI_DAYS[ngunalatriIndex] === dayNumber;
  const secondUnit = isDoubled ? (firstUnit + 1) % 30 : -1;

  const index = SASIH_MONTH_SID[monthIndex]!;
  const kind = SASIH_MONTH_KIND[monthIndex]!;
  const isPangelong = unitInMonth >= 15;

  return {
    index,
    name: SASIH_NAMES[index]!,
    penanggal: isPangelong ? unitInMonth - 14 : unitInMonth + 1,
    isPangelong,
    isPurnama: unitInMonth === 14 || secondUnit === 14,
    isTilem: unitInMonth === 29 || secondUnit === 29,
    isNampih: kind === 1,
    isMala: kind === 2,
    isEstimated: false,
    tahunSaka: SASIH_MONTH_SAKA[monthIndex]!,
  };
}
