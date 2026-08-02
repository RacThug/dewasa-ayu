import { CEREMONY_IDS } from '@dewasa-ayu/ceremony-rules';
import type { CeremonyId, EvaluatedDate, FindGoodDatesResult, MonthData } from '@dewasa-ayu/types';

import { WarigaError } from './errors';
import { evaluate } from './evaluate';
import { getFullInfo } from './full-info';
import { getSupportedRange } from './sasih';

const SCAN_CAP = 365;

/**
 * The nearest `count` "ayu" dates for a ceremony, scanning forward from `from` (inclusive)
 * up to a 365-day cap. The scan also stops at the end of the supported Sasih range
 * (2100-12-31) instead of throwing. Either way, partial results come back with
 * `capReached: true`. Pure orchestration over `getFullInfo` + `evaluate`.
 *
 * Throws `INVALID_DATE` (bad `from`), `INVALID_PARAM` (`count <= 0`), `UNKNOWN_CEREMONY`,
 * and `OUT_OF_RANGE` when `from` itself is outside the supported range.
 */
export function findGoodDates(
  from: Date,
  count: number,
  ceremonyId: CeremonyId,
): FindGoodDatesResult {
  if (!(from instanceof Date) || Number.isNaN(from.getTime())) {
    throw new WarigaError('INVALID_DATE', 'findGoodDates: expected a valid Date');
  }
  if (count <= 0) {
    throw new WarigaError('INVALID_PARAM', 'findGoodDates: count must be positive');
  }
  if (!CEREMONY_IDS.includes(ceremonyId)) {
    throw new WarigaError('UNKNOWN_CEREMONY', `findGoodDates: unknown ceremony "${ceremonyId}"`);
  }
  const range = getSupportedRange();
  if (from < range.min || from > range.max) {
    throw new WarigaError(
      'OUT_OF_RANGE',
      'findGoodDates: `from` outside the supported range (2003-01-03..2100-12-31)',
    );
  }

  const dates: EvaluatedDate[] = [];
  for (let scanned = 0; dates.length < count && scanned < SCAN_CAP; scanned += 1) {
    const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate() + scanned);
    if (cur > range.max) break; // end of supported data — return what we found
    const info = getFullInfo(cur);
    const evaluation = evaluate(info, ceremonyId);
    if (evaluation.rating === 'ayu') dates.push({ date: info.gregorian, info, evaluation });
  }
  return { dates, capReached: dates.length < count };
}

/**
 * Evaluate every day of a Gregorian month for a ceremony, with a rating summary and the
 * top ayu dates. `month` is 1-12 (human convention). Pure orchestration.
 *
 * Throws `INVALID_PARAM` (month outside 1-12), `UNKNOWN_CEREMONY`, and `OUT_OF_RANGE`
 * when any day of the month falls outside the supported Sasih range — January 2003
 * (starts before 2003-01-03) is the only partially-covered month.
 */
export function getMonthEvaluation(year: number, month: number, ceremonyId: CeremonyId): MonthData {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new WarigaError('INVALID_PARAM', 'getMonthEvaluation: month must be 1-12');
  }
  if (!CEREMONY_IDS.includes(ceremonyId)) {
    throw new WarigaError(
      'UNKNOWN_CEREMONY',
      `getMonthEvaluation: unknown ceremony "${ceremonyId}"`,
    );
  }

  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-12: day 0 of next month
  const range = getSupportedRange();
  if (
    new Date(year, month - 1, 1) < range.min ||
    new Date(year, month - 1, daysInMonth) > range.max
  ) {
    throw new WarigaError(
      'OUT_OF_RANGE',
      'getMonthEvaluation: month extends outside the supported range (2003-01-03..2100-12-31)',
    );
  }

  const days: EvaluatedDate[] = [];
  let ayuCount = 0;
  let cautionCount = 0;
  let badCount = 0;
  for (let d = 1; d <= daysInMonth; d += 1) {
    const info = getFullInfo(new Date(year, month - 1, d));
    const evaluation = evaluate(info, ceremonyId);
    days.push({ date: info.gregorian, info, evaluation });
    if (evaluation.rating === 'ayu') ayuCount += 1;
    else if (evaluation.rating === 'caution') cautionCount += 1;
    else badCount += 1;
  }

  const topDates = days
    .filter((d) => d.evaluation.rating === 'ayu')
    .sort((a, b) => b.evaluation.score - a.evaluation.score)
    .slice(0, 5);

  return {
    year,
    month,
    ceremony: ceremonyId,
    days,
    summary: { ayuCount, cautionCount, badCount, topDates },
  };
}
