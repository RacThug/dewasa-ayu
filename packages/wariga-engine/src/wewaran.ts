import {
  DASAWARA_NAMES,
  PANCAWARA_NAMES,
  PANCAWARA_URIP,
  SADWARA_NAMES,
  SAPTAWARA_NAMES,
  SAPTAWARA_URIP,
  TRIWARA_NAMES,
} from '@dewasa-ayu/constants';
import type {
  Dasawara,
  Dwiwara,
  Ekawara,
  Pancawara,
  Sadwara,
  Saptawara,
  Triwara,
} from '@dewasa-ayu/types';

import { getPawukonDay } from './pawukon';

// Wewaran derived purely from the Pawukon day. All formulas are calibrated against
// the balinese-date-js-lib oracle (see wewaran.test.ts). The "anomaly" cycles
// (Astawara, Sangawara, Caturwara) are handled separately.
//
// Pancawara's canonical order starts at Umanis, but Pawukon day 0 (Redite Sinta) is
// Paing, so its index carries a +1 offset. Triwara/Sadwara/Saptawara start at offset 0.

/** Saptawara (7-day week). Redite = day 0. */
export function getSaptawara(date: Date): Saptawara {
  return SAPTAWARA_NAMES[getPawukonDay(date) % 7]!;
}

/** Pancawara (5-day week). */
export function getPancawara(date: Date): Pancawara {
  return PANCAWARA_NAMES[(getPawukonDay(date) + 1) % 5]!;
}

/** Triwara (3-day week). */
export function getTriwara(date: Date): Triwara {
  return TRIWARA_NAMES[getPawukonDay(date) % 3]!;
}

/** Sadwara (6-day week). */
export function getSadwara(date: Date): Sadwara {
  return SADWARA_NAMES[getPawukonDay(date) % 6]!;
}

/**
 * Total urip (neptu) of the day = Saptawara urip + Pancawara urip. Drives the
 * urip-derived cycles (Dwiwara, Ekawara, Dasawara) and ceremony scoring.
 */
export function getTotalUrip(date: Date): number {
  const pawukonDay = getPawukonDay(date);
  return SAPTAWARA_URIP[pawukonDay % 7]! + PANCAWARA_URIP[(pawukonDay + 1) % 5]!;
}

/** Dwiwara (2-day week): Menga when total urip is even, Pepet when odd. */
export function getDwiwara(date: Date): Dwiwara {
  return getTotalUrip(date) % 2 === 0 ? 'menga' : 'pepet';
}

/** Ekawara (1-day week): Luang exists only when total urip is odd; otherwise none. */
export function getEkawara(date: Date): Ekawara | null {
  return getTotalUrip(date) % 2 === 1 ? 'luang' : null;
}

/** Dasawara (10-day week), indexed by total urip mod 10. */
export function getDasawara(date: Date): Dasawara {
  return DASAWARA_NAMES[getTotalUrip(date) % 10]!;
}
