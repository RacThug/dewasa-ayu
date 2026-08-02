import { INGKEL_NAMES, JEJEPAN_NAMES } from '@dewasa-ayu/constants';
import type { Ingkel, Jejepan } from '@dewasa-ayu/types';

import { getPawukonDay } from './pawukon';

// Pawukon-derived cycles that are not Wewaran. Both calibrated against the
// balinese-date-js-lib oracle across a full 210-day Pawukon cycle (see
// pawukon-derived.test.ts).

/**
 * Ingkel — a 6-fold weekly category. It is constant within each wuku week, so it
 * is keyed by the wuku index (`floor(pawukonDay / 7) % 6`), not the day. The cycle
 * therefore repeats every 6 wuku (42 days), exactly 5 times per 210-day Pawukon.
 */
export function getIngkel(date: Date): Ingkel {
  const wukuIndex = Math.floor(getPawukonDay(date) / 7);
  return INGKEL_NAMES[wukuIndex % 6]!;
}

/**
 * Jejepan — a 6-day cycle on the Pawukon day (`pawukonDay % 6`). It runs parallel
 * to Sadwara (same index, different naming tradition).
 */
export function getJejepan(date: Date): Jejepan {
  return JEJEPAN_NAMES[getPawukonDay(date) % 6]!;
}
