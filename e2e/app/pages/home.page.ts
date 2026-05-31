import { expect, type Locator, type Page } from '@playwright/test';

/** Page object for the Home "Cek Hari" page. Selectors live here only. */
export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(params?: { ceremony?: string; date?: string }): Promise<void> {
    const qs = new URLSearchParams();
    if (params?.ceremony) qs.set('ceremony', params.ceremony);
    if (params?.date) qs.set('date', params.date);
    await this.page.goto(qs.toString() ? `/?${qs.toString()}` : '/');
  }

  /** Verdict heading, e.g. "Dewasa ayu" / "Kurang ideal" / "Kurang baik". */
  verdict(): Locator {
    return this.page.locator('#verdict-h');
  }

  /** The big integer score percent. */
  async scorePct(): Promise<number> {
    const text = await this.page.locator('.score').first().innerText();
    return Number(text.replace(/[^0-9]/g, ''));
  }

  /** The pass/fail mark of an analysis factor row, by its label (e.g. "Wuku"). */
  factorMark(label: string): Locator {
    return this.page
      .locator('.analysis li')
      .filter({ has: this.page.locator('.name', { hasText: label }) })
      .locator('.mark');
  }

  /** The always-visible Sulinggih disclaimer (site footer). */
  disclaimer(): Locator {
    return this.page.locator('.site-footer');
  }

  /** Open the date picker and choose a day-of-month in the currently shown month. */
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

  /** Submit the Home date form. */
  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Periksa Dewasa' }).click();
  }
}
