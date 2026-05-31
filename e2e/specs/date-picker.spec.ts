import { expect, test } from '../app/test';

test('date picker: choosing a day and submitting checks that date', async ({ home, page }) => {
  // September 2026 is shown because the starting date is mid-month.
  await home.goto({ ceremony: 'pawiwahan', date: '2026-09-15' });

  await home.pickDayOfMonth(20);
  await expect(home.pickerTrigger()).toContainText('20 September 2026');

  await home.submit();
  await expect(page).toHaveURL(/[?&]date=2026-09-20(&|$)/);
  await expect(home.verdict()).toBeVisible();
});
