import { type Locator, type Page } from '@playwright/test';

/** Page object for the /rekomendasi page. */
export class RekomendasiPage {
  constructor(private readonly page: Page) {}

  async goto(params: { ceremony?: string; from?: string; count?: number } = {}): Promise<void> {
    const qs = new URLSearchParams();
    if (params.ceremony) qs.set('ceremony', params.ceremony);
    if (params.from) qs.set('from', params.from);
    if (params.count) qs.set('count', String(params.count));
    await this.page.goto(`/rekomendasi${qs.toString() ? `?${qs.toString()}` : ''}`);
  }

  cards(): Locator {
    return this.page.locator('.reco-card');
  }

  countSelect(): Locator {
    return this.page.getByLabel('Jumlah hari yang dicari');
  }

  submit(): Locator {
    return this.page.getByRole('button', { name: 'Cari Hari Baik' });
  }
}
