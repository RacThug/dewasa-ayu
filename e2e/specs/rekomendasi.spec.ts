import { findGoodDates } from '@dewasa-ayu/wariga-engine';

import { CEREMONY, isoToDate, utcToISO } from '../app/data/known-dates';
import { expect, test } from '../app/test';

const FROM = '2026-01-01';

test.describe('Rekomendasi', () => {
  test('lists exactly the engine-recommended dates', async ({ rekomendasi }) => {
    const expected = findGoodDates(isoToDate(FROM), 5, CEREMONY);
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM });
    await expect(rekomendasi.cards()).toHaveCount(expected.dates.length);
  });

  test('a legacy ?count= link still lands on the list (param is dropped)', async ({
    rekomendasi,
    page,
  }) => {
    // The count control was folded away with the consolidated home (PR #63);
    // old bookmarks with ?count= must degrade gracefully to the fixed list.
    const expected = findGoodDates(isoToDate(FROM), 5, CEREMONY);
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM, count: 10 });
    await expect(page).not.toHaveURL(/count=/);
    await expect(rekomendasi.cards()).toHaveCount(expected.dates.length);
  });

  test('a recommendation links through to its Home verdict', async ({ rekomendasi, page }) => {
    const expected = findGoodDates(isoToDate(FROM), 5, CEREMONY);
    const firstISO = utcToISO(expected.dates[0]!.date);
    await rekomendasi.goto({ ceremony: CEREMONY, from: FROM });
    await rekomendasi.cards().first().click();
    await expect(page).toHaveURL(new RegExp(`[?&]date=${firstISO}(&|$)`));
    await expect(page.locator('#verdict-h')).toBeVisible();
  });
});
