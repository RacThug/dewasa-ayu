/**
 * Shared types for Dewasa Ayu.
 *
 * Placeholder only — the real Zod schemas and TypeScript contracts land with
 * ENG-001 (engine types) and DB-001 (persisted shapes). Kept tiny so the package
 * resolves and type-checks across the monorepo.
 */
export type SemVer = `${number}.${number}.${number}`;

export const TYPES_PACKAGE = '@dewasa-ayu/types' as const;
