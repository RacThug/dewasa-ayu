import type { CeremonyConfig, CeremonyId, Saptawara, Wuku } from '@dewasa-ayu/types';

// Sourced inputs (all UNVERIFIED-level — the verdict is "estimasi"):
//  - weights:        PRD §6.1
//  - sasihGood/Bad:  PRD §4.1 (Baik / Buruk; Netral = neither)
//  - forbiddenWuku:  PRD §4.3 (Rangda Tiga, Uncal Balung)
//  - saptawaraGood:  wariga-engine-reference.md §6 (general "umum": Soma/Buda/Sukra)
//  - requirePenanggal: PRD §4.3 (the Pangelong row)
//
// Factors PRD §6.1 weights but no source defines a "good set" for (penanggal-number,
// a standalone ingkel/jejepan factor) are deliberately omitted — never fabricated.
// Ingkel is scored via the `ingkel_wong` padewasan (see DEWASA_RULES), not here.

const RANGDA_TIGA_WUKU: Wuku[] = [
  'wariga',
  'warigadean',
  'pujut',
  'pahang',
  'menail',
  'prangbakat',
];
const UNCAL_BALUNG_WUKU: Wuku[] = ['dungulan', 'kuningan'];
const SAPTAWARA_GOOD: Saptawara[] = ['soma', 'buda', 'sukra'];

export const CEREMONY_CONFIGS: Record<CeremonyId, CeremonyConfig> = {
  pawiwahan: {
    id: 'pawiwahan',
    name: 'Pawiwahan (Pernikahan)',
    weights: {
      saptawara: 2.0,
      wuku: 1.5,
      sasih: 2.0,
      penanggal: 1.0,
      sangawara: 1.0,
      dewasaAyuBonus: 1.5,
      criticalAlaPenalty: 1.0,
      minorAlaPenalty: 0.3,
    },
    sasihGood: [2, 3, 4, 6, 9],
    sasihBad: [0, 1, 5, 7, 8, 10, 11],
    forbiddenWuku: [...RANGDA_TIGA_WUKU, ...UNCAL_BALUNG_WUKU],
    saptawaraGood: SAPTAWARA_GOOD,
    requirePenanggal: true,
  },
  manusa_yadnya: {
    id: 'manusa_yadnya',
    name: 'Manusa Yadnya',
    weights: {
      saptawara: 2.0,
      wuku: 1.5,
      sasih: 2.0,
      penanggal: 1.0,
      sangawara: 1.0,
      dewasaAyuBonus: 1.5,
      criticalAlaPenalty: 1.0,
      minorAlaPenalty: 0.3,
    },
    sasihGood: [2, 3, 4, 6, 9],
    sasihBad: [0, 1, 7, 8],
    forbiddenWuku: [...RANGDA_TIGA_WUKU, ...UNCAL_BALUNG_WUKU],
    saptawaraGood: SAPTAWARA_GOOD,
    requirePenanggal: true,
  },
  dewa_yadnya: {
    id: 'dewa_yadnya',
    name: 'Dewa Yadnya',
    weights: {
      saptawara: 1.5,
      wuku: 1.5,
      sasih: 2.0,
      penanggal: 1.0,
      sangawara: 1.0,
      dewasaAyuBonus: 2.0,
      criticalAlaPenalty: 1.0,
      minorAlaPenalty: 0.3,
    },
    sasihGood: [2, 3, 4, 6, 9, 11],
    sasihBad: [],
    forbiddenWuku: [...UNCAL_BALUNG_WUKU],
    saptawaraGood: SAPTAWARA_GOOD,
    requirePenanggal: true,
  },
  pitra_yadnya: {
    id: 'pitra_yadnya',
    name: 'Pitra Yadnya',
    weights: {
      saptawara: 1.5,
      wuku: 1.5,
      sasih: 2.0,
      penanggal: 0.5,
      sangawara: 1.0,
      dewasaAyuBonus: 2.0,
      criticalAlaPenalty: 1.0,
      minorAlaPenalty: 0.3,
    },
    sasihGood: [0, 1],
    sasihBad: [],
    forbiddenWuku: [...UNCAL_BALUNG_WUKU],
    saptawaraGood: SAPTAWARA_GOOD,
    requirePenanggal: false,
  },
  pembangunan: {
    id: 'pembangunan',
    name: 'Pembangunan',
    weights: {
      saptawara: 1.5,
      wuku: 1.5,
      sasih: 1.5,
      penanggal: 1.0,
      sangawara: 1.0,
      dewasaAyuBonus: 2.0,
      criticalAlaPenalty: 1.0,
      minorAlaPenalty: 0.3,
    },
    sasihGood: [2, 3, 4, 6, 9],
    sasihBad: [],
    forbiddenWuku: [...UNCAL_BALUNG_WUKU],
    saptawaraGood: SAPTAWARA_GOOD,
    requirePenanggal: true,
  },
  usaha: {
    id: 'usaha',
    name: 'Memulai Usaha',
    weights: {
      saptawara: 1.5,
      wuku: 1.5,
      sasih: 1.0,
      penanggal: 0.5,
      sangawara: 1.0,
      dewasaAyuBonus: 3.0,
      criticalAlaPenalty: 1.0,
      minorAlaPenalty: 0.3,
    },
    sasihGood: [2, 3, 4, 6, 9],
    sasihBad: [],
    forbiddenWuku: [...UNCAL_BALUNG_WUKU],
    saptawaraGood: SAPTAWARA_GOOD,
    requirePenanggal: false,
  },
};
