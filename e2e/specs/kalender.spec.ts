import { CEREMONY, expectedVerdict } from '../app/data/known-dates';
import { expect, test } from '../app/test';

const YEAR = 2026;
const MONTH = 9; // September

test.describe('Kalender', () => {
  test('renders the month grid with an engine-matched first day', async ({ kalender }) => {
    await kalender.goto({ ceremony: CEREMONY, year: YEAR, month: MONTH });
    await expect(kalender.grid()).toBeVisible();
    await expect(kalender.monthLabel()).toHaveText('September 2026');
    await expect(kalender.summary()).toBeVisible();
    const exp = expectedVerdict('2026-09-01', CEREMONY);
    await expect(kalender.cell(1)).toHaveAttribute('aria-label', new RegExp(`— ${exp.word}`));
  });

  test('month navigation moves forward', async ({ kalender, page }) => {
    await kalender.goto({ ceremony: CEREMONY, year: YEAR, month: MONTH });
    await kalender.nextMonth().click();
    // The arrow carries the selected day into the next month (#74).
    await expect(page).toHaveURL(/\/pawiwahan\/2026-10-01$/);
    await expect(kalender.monthLabel()).toHaveText('Oktober 2026');
  });

  test('a day cell links through to its Home verdict', async ({ kalender, page }) => {
    // Landing on this month selects the 1st, so pick a different day — otherwise
    // the click is a no-op and proves nothing.
    await kalender.goto({ ceremony: CEREMONY, year: YEAR, month: MONTH });
    await kalender.cell(15).click();
    await expect(page).toHaveURL(/\/pawiwahan\/2026-09-15$/);
    await expect(page.locator('#verdict-h')).toBeVisible();
  });
});
