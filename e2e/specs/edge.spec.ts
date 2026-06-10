import { expect, test } from '../app/test';

// Boundary & bad-input behaviour (the engine's Sasih table covers
// 2003-01-03 .. 2100-12-31). Errors must be Indonesian copy — never the raw
// English engine message.

test.describe('Edge cases & error copy', () => {
  test('a non-real calendar date is rejected with Indonesian copy, no verdict', async ({
    page,
  }) => {
    await page.goto('/?ceremony=pawiwahan&date=2026-02-31');
    await expect(page.locator('.state-note')).toContainText('periksa kembali tanggal');
    await expect(page.locator('.verdict')).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('getSasihInfo');
  });

  test('kalender clamps below the supported range and hides the dead arrow', async ({ page }) => {
    await page.goto('/kalender?ceremony=pawiwahan&year=2002&month=7');
    await expect(page.locator('.cal-month')).toHaveText('Februari 2003');
    await expect(page.getByRole('link', { name: 'Bulan sebelumnya' })).toHaveCount(0);
    await expect(page.locator('.cal-grid')).toBeVisible();
  });

  test('kalender renders the last supported month and hides the next arrow', async ({ page }) => {
    await page.goto('/kalender?ceremony=pawiwahan&year=2100&month=12');
    await expect(page.locator('.cal-month')).toHaveText('Desember 2100');
    await expect(page.getByRole('link', { name: 'Bulan berikutnya' })).toHaveCount(0);
    await expect(page.locator('.cal-grid')).toBeVisible();
  });

  test('rekomendasi near the end of the range returns partial results, not an error', async ({
    page,
  }) => {
    await page.goto('/rekomendasi?ceremony=pawiwahan&from=2100-12-01&count=20');
    await expect(page.locator('body')).not.toContainText('getSasihInfo');
    // Either some dates were found (partial note shown) or a graceful empty state.
    const cards = page.locator('.reco-card');
    const emptyNote = page.getByText('Tidak ditemukan hari ayu');
    await expect(cards.first().or(emptyNote)).toBeVisible();
  });

  test('out-of-range date shows the Indonesian range message', async ({ page }) => {
    await page.goto('/?ceremony=pawiwahan&date=2002-12-31');
    await expect(page.locator('.state-note')).toContainText('rentang yang didukung');
    await expect(page.locator('.verdict')).toHaveCount(0);
  });
});
