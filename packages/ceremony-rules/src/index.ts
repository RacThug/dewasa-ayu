/**
 * Ceremony rules as DATA: the named-padewasan registry (`DEWASA_RULES`) and, later,
 * per-ceremony scoring configs. Auditable by a wariga expert; extended without engine
 * changes. All padewasan are UNVERIFIED until expert-confirmed — see ENG-001 / PRD §7.6.
 */
import type { SemVer } from '@dewasa-ayu/types';

export const CEREMONY_RULES_VERSION: SemVer = '0.0.0';

export { CEREMONY_IDS, DEWASA_RULES } from './dewasa-rules';
