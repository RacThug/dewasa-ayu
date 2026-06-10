import { CEREMONY, firstAyuDate } from '../app/data/known-dates';
import { test } from '../app/test';

const ROUTES: { name: string; path: string }[] = [
  { name: 'Home', path: `/?ceremony=${CEREMONY}&date=${firstAyuDate('2026-01-01', CEREMONY)}` },
  { name: 'Kalender', path: `/kalender?ceremony=${CEREMONY}&year=2026&month=9` },
  { name: 'Rekomendasi', path: `/rekomendasi?ceremony=${CEREMONY}&from=2026-01-01&count=5` },
  { name: 'About', path: '/about' },
  { name: 'Upacara', path: '/upacara/pawiwahan' },
];

// Every appearance variant must pass — night, paper, and high-contrast.
// Keys mirror what the app persists: next-themes' `theme` and our `contrast`.
const VARIANTS: { name: string; storage: [string, string][] }[] = [
  { name: 'night', storage: [['theme', 'dark']] },
  { name: 'paper', storage: [['theme', 'light']] },
  { name: 'high contrast', storage: [['contrast', 'high']] },
];

for (const variant of VARIANTS) {
  for (const route of ROUTES) {
    test(`${route.name} [${variant.name}] has no serious/critical WCAG violations`, async ({
      page,
      a11y,
    }) => {
      await page.addInitScript((entries) => {
        for (const [key, value] of entries) localStorage.setItem(key, value);
      }, variant.storage);
      await page.goto(route.path);
      await a11y.check();
    });
  }
}
