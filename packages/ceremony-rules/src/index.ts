/**
 * Ceremony rules as DATA: the named-padewasan registry (`DEWASA_RULES`) and, later,
 * per-ceremony scoring configs. Auditable by a wariga expert; extended without engine
 * changes. All padewasan are UNVERIFIED until expert-confirmed — see ENG-001 / PRD §7.6.
 */
import type { SemVer } from '@dewasa-ayu/types';

/**
 * Version of the padewasan + ceremony-config data set. Bump on ANY rule change so a stored or
 * shared verdict can be traced back to the rules that produced it. Stays < 1.0.0 while the rules
 * are expert-unverified (ENG-001 §Verification status).
 */
export const CEREMONY_RULES_VERSION: SemVer = '0.1.0';

export { CEREMONY_CONFIGS } from './ceremony-configs';
export { CEREMONY_IDS, DEWASA_RULES } from './dewasa-rules';
