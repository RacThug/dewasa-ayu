import { type Locator, type Page } from '@playwright/test';

/** Page object for the /kalender month grid. */
export class KalenderPage {
  constructor(private readonly page: Page) {}

  async goto(params: { ceremony?: string; year?: number; month?: number } = {}): Promise<void> {
    const qs = new URLSearchParams();
    if (params.ceremony) qs.set('ceremony', params.ceremony);
    if (params.year) qs.set('year', String(params.year));
    if (params.month) qs.set('month', String(params.month));
    await this.page.goto(`/kalender${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  grid(): Locator {
    return this.page.locator('.cal-grid');
  }

  monthLabel(): Locator {
    return this.page.locator('.cal-month');
  }

  summary(): Locator {
    return this.page.locator('.cal-summary');
  }

  /** A day cell by day-of-month (matched on its aria-label, e.g. "1 — Dewasa ayu"). */
  cell(day: number): Locator {
    return this.page.locator('.cal-grid').getByRole('listitem', { name: new RegExp(`^${day} `) });
  }

  nextMonth(): Locator {
    return this.page.getByRole('link', { name: 'Bulan berikutnya' });
  }

  prevMonth(): Locator {
    return this.page.getByRole('link', { name: 'Bulan sebelumnya' });
  }
}
