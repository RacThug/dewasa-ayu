import { CEREMONY_IDS, DEWASA_RULES } from '@dewasa-ayu/ceremony-rules';
import type {
  Astawara,
  BalineseDate,
  CeremonyId,
  DewasaContext,
  DewasaDetection,
  DewasaInfo,
} from '@dewasa-ayu/types';

import { WarigaError } from './errors';
import { astawaraAt, sadwaraAt } from './wewaran';

/** Build the wuku-level facts a rule condition may need from a single day's info. */
function buildContext(info: BalineseDate): DewasaContext {
  const wukuStart = Math.floor(info.pawukonDay / 7) * 7;
  const wukuAstawara: Astawara[] = [];
  let wukuWasCount = 0;
  for (let i = 0; i < 7; i += 1) {
    const pd = wukuStart + i;
    const a = astawaraAt(pd);
    if (!wukuAstawara.includes(a)) wukuAstawara.push(a);
    if (sadwaraAt(pd) === 'was') wukuWasCount += 1;
  }
  return { info, wukuAstawara, wukuWasCount };
}

/**
 * Named padewasan active on a date, resolved for one ceremony. Pure derivation from
 * `info` (produced by `getFullInfo`); reads the rule registry from
 * `@dewasa-ayu/ceremony-rules`. A rule contributes only when it both applies to the
 * ceremony and its condition matches the day; its effect direction is taken from the
 * (context-relative) rule data. Every returned padewasan carries `estimated: true`
 * until its rule is expert-verified — callers MUST surface that as "estimasi".
 *
 * Throws `UNKNOWN_CEREMONY` if `ceremonyId` is not one of the six supported ceremonies.
 */
export function detectDewasa(info: BalineseDate, ceremonyId: CeremonyId): DewasaDetection {
  if (!CEREMONY_IDS.includes(ceremonyId)) {
    throw new WarigaError('UNKNOWN_CEREMONY', `detectDewasa: unknown ceremony "${ceremonyId}"`);
  }
  const ctx = buildContext(info);
  const ayu: DewasaInfo[] = [];
  const ala: DewasaInfo[] = [];
  for (const rule of DEWASA_RULES) {
    const effect = rule.effects[ceremonyId];
    if (!effect || !rule.match(ctx)) continue;
    const detected: DewasaInfo = {
      id: rule.id,
      name: rule.name,
      type: effect.polarity,
      note: effect.note,
      source: rule.source,
      estimated: !rule.verified,
    };
    if (effect.severity) detected.severity = effect.severity;
    (effect.polarity === 'ayu' ? ayu : ala).push(detected);
  }
  return { ayu, ala };
}
