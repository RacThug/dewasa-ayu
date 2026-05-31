import { CEREMONY, firstAyuDate } from '../app/data/known-dates';
import { test } from '../app/test';

const ROUTES: { name: string; path: string }[] = [
  { name: 'Home', path: `/?ceremony=${CEREMONY}&date=${firstAyuDate('2026-01-01', CEREMONY)}` },
  { name: 'Kalender', path: `/kalender?ceremony=${CEREMONY}&year=2026&month=9` },
  { name: 'Rekomendasi', path: `/rekomendasi?ceremony=${CEREMONY}&from=2026-01-01&count=5` },
  { name: 'About', path: '/about' },
];

for (const route of ROUTES) {
  test(`${route.name} has no serious/critical WCAG violations`, async ({ page, a11y }) => {
    await page.goto(route.path);
    await a11y.check();
  });
}
