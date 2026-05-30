import { CEREMONY_IDS } from '@dewasa-ayu/ceremony-rules';
import type { CeremonyId, EvaluatedDate, FindGoodDatesResult, MonthData } from '@dewasa-ayu/types';

import { WarigaError } from './errors';
import { evaluate } from './evaluate';
import { getFullInfo } from './full-info';

const SCAN_CAP = 365;

/**
 * The nearest `count` "ayu" dates for a ceremony, scanning forward from `from` (inclusive)
 * up to a 365-day cap. Returns partial results with `capReached: true` if the cap is hit
 * first. Pure orchestration over `getFullInfo` + `evaluate`.
 *
 * Throws `INVALID_DATE` (bad `from`), `INVALID_PARAM` (`count <= 0`), `UNKNOWN_CEREMONY`,
 * and propagates `OUT_OF_RANGE` if the scan runs past the supported Sasih range (~2100).
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

  const dates: EvaluatedDate[] = [];
  for (let scanned = 0; dates.length < count && scanned < SCAN_CAP; scanned += 1) {
    const info = getFullInfo(
      new Date(from.getFullYear(), from.getMonth(), from.getDate() + scanned),
    );
    const evaluation = evaluate(info, ceremonyId);
    if (evaluation.rating === 'ayu') dates.push({ date: info.gregorian, info, evaluation });
  }
  return { dates, capReached: dates.length < count };
}

/**
 * Evaluate every day of a Gregorian month for a ceremony, with a rating summary and the
 * top ayu dates. `month` is 1-12 (human convention). Pure orchestration.
 *
 * Throws `INVALID_PARAM` (month outside 1-12), `UNKNOWN_CEREMONY`, and propagates
 * `OUT_OF_RANGE` for years outside the supported Sasih range.
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
