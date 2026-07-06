import { expect, type Locator, type Page } from '@playwright/test';

/** Page object for the consolidated Home page (Pananggalan). Selectors live here only. */
export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(params?: { ceremony?: string; date?: string }): Promise<void> {
    const qs = new URLSearchParams();
    if (params?.ceremony) qs.set('ceremony', params.ceremony);
    if (params?.date) qs.set('date', params.date);
    await this.page.goto(qs.toString() ? `/?${qs.toString()}` : '/');
  }

  /** The stamp verdict, e.g. "Ayu — disarankan" (rendered uppercase by CSS). */
  verdict(): Locator {
    return this.page.locator('.stamp');
  }

  /** The slab score fraction's integer part (e.g. 60 from "60/100"). */
  async scorePct(): Promise<number> {
    const text = await this.page.locator('.score-frac').first().innerText();
    return Number(/^\d+/.exec(text.trim())?.[0]);
  }

  /** The ✓/✗ badge of a factor row in "Rincian Wariga", by its label (e.g. "Wuku"). */
  factorBadge(label: string): Locator {
    return this.page
      .locator('.rule')
      .filter({ has: this.page.locator('.rule-name', { hasText: label }) })
      .locator('.rule-badge');
  }

  /** The always-visible Sulinggih disclaimer (site footer). */
  disclaimer(): Locator {
    return this.page.locator('.site-footer');
  }

  /** Open the date picker and choose a day-of-month in the currently shown month.
   *  Choosing a day navigates immediately (no separate submit since the Senja fold-in). */
  async pickDayOfMonth(day: number): Promise<void> {
    await this.page.locator('.dp-trigger').first().click();
    const panel = this.page.locator('.dp-panel');
    await expect(panel).toBeVisible();
    await panel
      .locator('button')
      .filter({ hasText: new RegExp(`^${day}$`) })
      .click();
  }

  /** Current text of the date-picker trigger (shows the chosen date). */
  pickerTrigger(): Locator {
    return this.page.locator('.dp-trigger').first();
  }
}
