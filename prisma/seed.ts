// Dewasa Ayu — database seed (SKELETON, issue #14).
//
// No-op for now. Real seed data (the 6 ceremony_types, dewasa_rules, and any
// sasih_corrections) lands in Phase 2 (DB-001). Run via `pnpm db:seed`.
async function main(): Promise<void> {
  console.log('Seed: no-op (skeleton).');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
