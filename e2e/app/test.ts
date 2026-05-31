import { expect, test as base } from '../core/fixtures';
import { HomePage } from './pages/home.page';

export interface Pages {
  home: HomePage;
}

export const test = base.extend<Pages>({
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect };
