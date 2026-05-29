import { ENGINE_VERSION, ping } from '@dewasa-ayu/wariga-engine';

export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, padding: '3rem' }}>
      <h1>Dewasa Ayu</h1>
      <p>
        Monorepo skeleton aktif. Engine v{ENGINE_VERSION} — {ping()}.
      </p>
      <p>
        Halaman ini hanya placeholder Phase 0. UI sebenarnya (tema Pelita / lamplight) menyusul di
        Phase 3.
      </p>
    </main>
  );
}
