import { type Locator, type Page } from '@playwright/test';

/** Page object for the nearest-good-days list (lives on Home; /rekomendasi redirects there). */
export class RekomendasiPage {
  constructor(private readonly page: Page) {}

  async goto(params: { ceremony?: string; from?: string; count?: number } = {}): Promise<void> {
    const qs = new URLSearchParams();
    if (params.ceremony) qs.set('ceremony', params.ceremony);
    if (params.from) qs.set('from', params.from);
    if (params.count) qs.set('count', String(params.count));
    await this.page.goto(`/rekomendasi${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  /** Recommendation rows ("Hari baik terdekat"). */
  cards(): Locator {
    return this.page.locator('.rec');
  }
}
