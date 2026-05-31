import { defineConfig } from '@playwright/test';

import { createPreset } from './core/preset';

const WEB_URL = 'http://localhost:3000';
const API_HEALTH = 'http://localhost:3001/api/v1/health';

export default defineConfig({
  ...createPreset({ baseURL: WEB_URL }),
  webServer: [
    {
      command: 'pnpm --filter @dewasa-ayu/api start',
      url: API_HEALTH,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @dewasa-ayu/web start',
      url: WEB_URL,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
