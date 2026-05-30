import {
  ASTAWARA_NAMES,
  CATURWARA_NAMES,
  DASAWARA_NAMES,
  PANCAWARA_NAMES,
  PANCAWARA_URIP,
  SADWARA_NAMES,
  SANGAWARA_NAMES,
  SAPTAWARA_NAMES,
  SAPTAWARA_URIP,
  TRIWARA_NAMES,
} from '@dewasa-ayu/constants';
import type {
  Astawara,
  Caturwara,
  Dasawara,
  Dwiwara,
  Ekawara,
  Pancawara,
  Sadwara,
  Sangawara,
  Saptawara,
  Triwara,
} from '@dewasa-ayu/types';

import { getPawukonDay } from './pawukon';

// Wewaran derived from the Pawukon day, all calibrated against the
// balinese-date-js-lib oracle (see wewaran.test.ts).
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

// --- Anomaly cycles ---
// Three cycles deviate from a plain modulus near the Sungsang/Dungulan boundary
// (calibrated against the oracle):
//  - Sangawara holds at Dangu (index 0) for pd 0–2; pd 3 is also Dangu, so the cycle
//    opens with four consecutive Dangu.
//  - Astawara: Kala (index 6) lands on pd 70, 71 and 72 — "Kala Tiga".
//  - Caturwara: Jaya (index 2) repeats on pd 71 — "Jaya Tiga" — shifting the tail by +2.

function caturwaraIndex(pawukonDay: number): number {
  if (pawukonDay <= 70) return pawukonDay % 4;
  if (pawukonDay === 71) return 2;
  return (pawukonDay + 2) % 4;
}

function astawaraIndex(pawukonDay: number): number {
  if (pawukonDay <= 70) return pawukonDay % 8;
  if (pawukonDay === 71) return 6;
  return (pawukonDay + 6) % 8;
}

function sangawaraIndex(pawukonDay: number): number {
  return pawukonDay < 3 ? 0 : (pawukonDay + 6) % 9;
}

/** Caturwara (4-day week), with the Jaya Tiga anomaly in wuku Dungulan. */
export function getCaturwara(date: Date): Caturwara {
  return CATURWARA_NAMES[caturwaraIndex(getPawukonDay(date))]!;
}

/** Astawara (8-day week), with the Kala Tiga anomaly in wuku Dungulan. */
export function getAstawara(date: Date): Astawara {
  return ASTAWARA_NAMES[astawaraIndex(getPawukonDay(date))]!;
}

/** Sangawara (9-day week); opens with four Dangu at the start of the cycle. */
export function getSangawara(date: Date): Sangawara {
  return SANGAWARA_NAMES[sangawaraIndex(getPawukonDay(date))]!;
}
