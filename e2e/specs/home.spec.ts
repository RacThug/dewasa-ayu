import {
  CEREMONY,
  expectedVerdict,
  firstAyuDate,
  firstNonAyuDate,
  firstWukuFailDate,
} from '../app/data/known-dates';
import { expect, test } from '../app/test';

const AYU = firstAyuDate('2026-01-01', CEREMONY);
const NON_AYU = firstNonAyuDate('2026-01-01', CEREMONY);
const WUKU_FAIL = firstWukuFailDate('2026-01-01', CEREMONY);

test.describe('Home — the rendered verdict matches the engine', () => {
  test(`ayu date ${AYU} shows the ayu stamp + matching score`, async ({ home }) => {
    const exp = expectedVerdict(AYU, CEREMONY);
    await home.goto({ ceremony: CEREMONY, date: AYU });
    await expect(home.verdict()).toHaveText(exp.stamp);
    expect(await home.scorePct()).toBe(exp.pct);
  });

  test(`non-ayu date ${NON_AYU} shows its stamp + matching score`, async ({ home }) => {
    const exp = expectedVerdict(NON_AYU, CEREMONY);
    await home.goto({ ceremony: CEREMONY, date: NON_AYU });
    await expect(home.verdict()).toHaveText(exp.stamp);
    expect(await home.scorePct()).toBe(exp.pct);
  });

  test(`forbidden-wuku date ${WUKU_FAIL} marks the Wuku factor as failed`, async ({ home }) => {
    await home.goto({ ceremony: CEREMONY, date: WUKU_FAIL });
    await expect(home.factorBadge('Wuku')).toHaveClass(/fail/);
  });

  test('the Sulinggih disclaimer is present', async ({ home }) => {
    await home.goto({ ceremony: CEREMONY, date: AYU });
    await expect(home.disclaimer()).toContainText('Sulinggih');
  });
});
