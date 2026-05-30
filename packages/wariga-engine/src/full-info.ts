import type { BalineseDate } from '@dewasa-ayu/types';

import { WarigaError } from './errors';
import { getPawukonDay, getWuku } from './pawukon';
import { getIngkel, getJejepan } from './pawukon-derived';
import { getSasihInfo } from './sasih';
import {
  getAstawara,
  getCaturwara,
  getDasawara,
  getDwiwara,
  getEkawara,
  getPancawara,
  getSadwara,
  getSangawara,
  getSaptawara,
  getTotalUrip,
  getTriwara,
} from './wewaran';

/**
 * Full Balinese-calendar decomposition for a Gregorian date: Pawukon, every
 * Wewaran, the Pawukon-derived cycles (Ingkel, Jejepan), Sasih, and total urip.
 *
 * The Pawukon and Wewaran parts are purely cyclic and valid for any date, but the
 * Sasih part is table-backed, so the supported range is that of `getSasihInfo`
 * (~2003-2100). Throws `INVALID_DATE` for bad input and `OUT_OF_RANGE` outside the
 * Sasih range (propagated from `getSasihInfo`).
 */
export function getFullInfo(date: Date): BalineseDate {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new WarigaError('INVALID_DATE', 'getFullInfo: expected a valid Date');
  }
  return {
    gregorian: new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
    pawukonDay: getPawukonDay(date),
    wuku: getWuku(date),
    ekawara: getEkawara(date),
    dwiwara: getDwiwara(date),
    triwara: getTriwara(date),
    caturwara: getCaturwara(date),
    pancawara: getPancawara(date),
    sadwara: getSadwara(date),
    saptawara: getSaptawara(date),
    astawara: getAstawara(date),
    sangawara: getSangawara(date),
    dasawara: getDasawara(date),
    sasih: getSasihInfo(date),
    ingkel: getIngkel(date),
    jejepan: getJejepan(date),
    totalUrip: getTotalUrip(date),
  };
}
