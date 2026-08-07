import { expect, test } from '../app/test';

test.describe('SEO infra', () => {
  test('home exposes title, description, OG image meta, and JSON-LD', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dewasa Ayu/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Wariga/);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toContain('WebApplication');
  });

  test('per-page titles differ (about vs home; /kalender redirects home)', async ({ page }) => {
    // /kalender folded into the consolidated home (PR #63) — old links redirect.
    await page.goto('/kalender?ceremony=pawiwahan&year=2026&month=9');
    await expect(page).toHaveURL(/\/pawiwahan\/2026-09-01/);
    await expect(page).toHaveTitle(/hari baik Pawiwahan/);
    await page.goto('/about');
    await expect(page).toHaveTitle(/^Tentang — Dewasa Ayu$/);
  });

  test('robots.txt serves rules + a sitemap reference', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body.toLowerCase()).toContain('user-agent');
    expect(body.toLowerCase()).toContain('sitemap:');
  });

  test('sitemap.xml lists the real pages (and not the folded-in redirects)', async ({
    request,
  }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const xml = await res.text();
    expect(xml).toContain('/about');
    expect(xml).toContain('/upacara/pawiwahan');
    expect(xml).not.toContain('/kalender');
    expect(xml).not.toContain('/rekomendasi');
  });

  test('the OG image route actually renders an image', async ({ page, request }) => {
    await page.goto('/');
    const ogUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogUrl).toBeTruthy();
    const res = await request.get(ogUrl!);
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('image');
  });
});
