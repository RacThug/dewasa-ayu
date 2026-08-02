import { ENGINE_VERSION } from '@dewasa-ayu/wariga-engine';

import { expect, test } from '../core/fixtures';

// Probe: confirms the E2E package can import the workspace engine (raw TS) at
// Playwright runtime. If this fails to resolve/transform, the data layer must
// switch to a pre-generated fixture instead of importing the engine directly.
test('engine is importable from the E2E package', () => {
  expect(typeof ENGINE_VERSION).toBe('string');
});

test('home page loads with an H1 and the Sulinggih disclaimer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.site-footer')).toContainText('Sulinggih');
});
