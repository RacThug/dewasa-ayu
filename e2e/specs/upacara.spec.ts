import { expect, test } from '../app/test';

test.describe('Upacara (/upacara/[ceremony])', () => {
  test('renders a ceremony page with definition, disclaimer, and CTA', async ({ page }) => {
    await page.goto('/upacara/pawiwahan');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pawiwahan');
    await expect(page.locator('.about-note')).toContainText('Sulinggih');
    await expect(page.locator('.up-cta').getByRole('link', { name: 'Cek Hari' })).toBeVisible();
  });

  test('the CTA links to the check page for that ceremony', async ({ page }) => {
    await page.goto('/upacara/usaha');
    await page.locator('.up-cta').getByRole('link', { name: 'Cek Hari' }).click();
    // The CTA goes through `/`, which resolves today and redirects (#74).
    await expect(page).toHaveURL(/\/usaha\/\d{4}-\d{2}-\d{2}$/);
    await expect(page.locator('#verdict-h')).toBeVisible();
  });
});
