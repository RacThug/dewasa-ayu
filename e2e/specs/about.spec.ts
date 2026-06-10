import { expect, test } from '../app/test';

test.describe('Tentang (/about)', () => {
  test('renders the preface with heading and the Sulinggih disclaimer', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.about-note')).toContainText('Sulinggih');
  });

  test('the CTA links back to Cek Hari (home)', async ({ page }) => {
    await page.goto('/about');
    await page.locator('.about-cta').getByRole('link', { name: 'Cek Hari' }).click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await expect(page.locator('#verdict-h')).toBeVisible();
  });
});
