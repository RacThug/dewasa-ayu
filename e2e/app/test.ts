import { expect, test as base } from '../core/fixtures';
import { HomePage } from './pages/home.page';
import { KalenderPage } from './pages/kalender.page';
import { RekomendasiPage } from './pages/rekomendasi.page';

export interface Pages {
  home: HomePage;
  kalender: KalenderPage;
  rekomendasi: RekomendasiPage;
}

export const test = base.extend<Pages>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  kalender: async ({ page }, use) => {
    await use(new KalenderPage(page));
  },
  rekomendasi: async ({ page }, use) => {
    await use(new RekomendasiPage(page));
  },
});

export { expect };
