import { findGoodDates } from '@dewasa-ayu/wariga-engine';

import { CEREMONY, isoToDate, utcToISO } from '../app/data/known-dates';
import { expect, test } from '../app/test';

const FROM = '2026-01-01';

test.describe('Rekomendasi', () => {
  test('lists exactly the engine-recommended dates', async ({ rekomendasi }) => {
    const expected = findGoodDates(isoToDate(FROM), 5, CEREMONY);
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM, count: 5 });
    await expect(rekomendasi.cards()).toHaveCount(expected.dates.length);
  });

  test('changing the count re-queries', async ({ rekomendasi, page }) => {
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM, count: 5 });
    await rekomendasi.countSelect().selectOption('10');
    await rekomendasi.submit().click();
    await expect(page).toHaveURL(/count=10(&|$)/);
    const expected = findGoodDates(isoToDate(FROM), 10, CEREMONY);
    await expect(rekomendasi.cards()).toHaveCount(expected.dates.length);
  });

  test('a recommendation links through to its Home verdict', async ({ rekomendasi, page }) => {
    const expected = findGoodDates(isoToDate(FROM), 5, CEREMONY);
    const firstISO = utcToISO(expected.dates[0]!.date);
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM, count: 5 });
    await rekomendasi.cards().first().click();
    await expect(page).toHaveURL(new RegExp(`[?&]date=${firstISO}(&|$)`));
    await expect(page.locator('#verdict-h')).toBeVisible();
  });
});
