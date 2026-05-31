/**
 * PORTABLE E2E CORE — base test fixtures.
 * Provides the `a11y` fixture on top of Playwright's base test. A project
 * layers its page objects onto THIS test (see app/test.ts).
 */
import { expect, test as base } from '@playwright/test';

import { checkA11y } from './a11y';

export interface A11yFixture {
  a11y: { check: (opts?: { disableRules?: string[] }) => Promise<void> };
}

export const test = base.extend<A11yFixture>({
  a11y: async ({ page }, use) => {
    await use({ check: (opts) => checkA11y(page, opts) });
  },
});

export { expect };
