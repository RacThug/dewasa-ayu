/**
 * PORTABLE E2E CORE — copy this folder into a new project as-is.
 * `createPreset` returns the project-agnostic half of a Playwright config
 * (reporters, retries, trace/screenshot/video, the browser+mobile matrix).
 * The consuming project supplies `webServer` + `baseURL` in playwright.config.ts.
 */
import { devices, type PlaywrightTestConfig } from '@playwright/test';

export interface PresetOptions {
  /** Web app base URL, e.g. http://localhost:3000 */
  baseURL: string;
  /** Defaults to !!process.env.CI */
  isCI?: boolean;
}

export function createPreset(opts: PresetOptions): PlaywrightTestConfig {
  const isCI = opts.isCI ?? !!process.env.CI;
  return {
    testDir: './specs',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    workers: isCI ? 1 : undefined,
    reporter: isCI ? [['blob'], ['list']] : [['html', { open: 'never' }], ['list']],
    timeout: 30_000,
    expect: { timeout: 10_000 },
    use: {
      baseURL: opts.baseURL,
      trace: 'on-first-retry',
      screenshot: 'only-on-failure',
      video: 'retain-on-failure',
    },
    projects: [
      { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    ],
  };
}
