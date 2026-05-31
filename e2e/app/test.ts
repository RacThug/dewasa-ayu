import { expect, test as base } from '../core/fixtures';
import { HomePage } from './pages/home.page';
import { KalenderPage } from './pages/kalender.page';

export interface Pages {
  home: HomePage;
  kalender: KalenderPage;
}

export const test = base.extend<Pages>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  kalender: async ({ page }, use) => {
    await use(new KalenderPage(page));
  },
});

export { expect };
