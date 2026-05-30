/**
 * Wariga calculation engine — pure TypeScript, ZERO external runtime dependencies.
 * The public surface grows one ENG-001 slice at a time. Workspace type-only
 * dependency: `@dewasa-ayu/types`; static data: `@dewasa-ayu/constants`.
 */
import type { SemVer } from '@dewasa-ayu/types';

export { detectDewasa } from './detect-dewasa';
export { WarigaError, type WarigaErrorCode } from './errors';
export { getFullInfo } from './full-info';
export { getPawukonDay, getWuku } from './pawukon';
export { getIngkel, getJejepan } from './pawukon-derived';
export { getSasihInfo } from './sasih';
export {
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

export const ENGINE_VERSION: SemVer = '0.0.0';

/** Liveness placeholder used by the web skeleton to prove cross-package wiring. */
export function ping(): string {
  return 'wariga-engine ok';
}
