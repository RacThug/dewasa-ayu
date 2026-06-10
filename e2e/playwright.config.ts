import { defineConfig } from '@playwright/test';

import { createPreset } from './core/preset';

// Default ports match local dev. Override (E2E_WEB_PORT / E2E_API_PORT) when
// 3000/3001 are taken on your machine — e.g. by another project's containers.
const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 3000);
const API_PORT = Number(process.env.E2E_API_PORT ?? 3001);
const WEB_URL = `http://localhost:${WEB_PORT}`;
const API_URL = `http://localhost:${API_PORT}/api/v1`;

export default defineConfig({
  ...createPreset({ baseURL: WEB_URL }),
  webServer: [
    {
      command: 'pnpm --filter @dewasa-ayu/api start',
      url: `${API_URL}/health`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      env: { PORT: String(API_PORT) },
    },
    {
      command: 'pnpm --filter @dewasa-ayu/web start',
      url: WEB_URL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
      // NEXT_PUBLIC_SITE_URL keeps absolute URLs (og:image) on the test port.
      env: { PORT: String(WEB_PORT), API_URL, NEXT_PUBLIC_SITE_URL: WEB_URL },
    },
  ],
});
