import { expect, test } from '../app/test';

test('date picker: choosing a day checks that date immediately', async ({ home, page }) => {
  // September 2026 is shown because the starting date is mid-month.
  await home.goto({ ceremony: 'pawiwahan', date: '2026-09-15' });

  // Selecting a day navigates right away (no separate submit on the
  // consolidated home).
  await home.pickDayOfMonth(20);
  await expect(page).toHaveURL(/\/pawiwahan\/2026-09-20$/);
  await expect(home.pickerTrigger()).toContainText('20 September 2026');
  await expect(home.verdict()).toBeVisible();
});
