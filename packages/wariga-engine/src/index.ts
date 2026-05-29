/**
 * Wariga calculation engine — pure TypeScript, ZERO external runtime dependencies.
 * Placeholder only; the real Pawukon / Wewaran / Sasih / scoring logic lands with
 * ENG-001. The only dependency is the workspace `@dewasa-ayu/types` (type-only).
 */
import type { SemVer } from '@dewasa-ayu/types';

export const ENGINE_VERSION: SemVer = '0.0.0';

/** Liveness placeholder used by the web skeleton to prove cross-package wiring. */
export function ping(): string {
  return 'wariga-engine ok';
}
