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

  test('robots.txt fences the dated pages to the years the sitemap submits', async ({
    request,
  }) => {
    // `/{ceremony}/{date}` spans 2003-2100 and every page links to ~44 more of
    // them. Without this fence a crawler walks the whole space, rendering each
    // one cold. The fence must track the URL shape: when the verdict pages moved
    // from `?date=` to `/{ceremony}/{date}`, the old `Disallow: /*?` silently
    // stopped covering them.
    const body = await (await request.get('/robots.txt')).text();
    const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' })
      .format(new Date())
      .slice(0, 4);

    for (const ceremony of ['pawiwahan', 'usaha']) {
      expect(body).toContain(`Disallow: /${ceremony}/`);
      expect(body).toContain(`Allow: /${ceremony}/${year}-`);
      expect(body).toContain(`Allow: /${ceremony}/${Number(year) + 1}-`);
      // Out-of-window years are covered by the ceremony-wide Disallow, which
      // only holds while no broader Allow re-opens them.
      expect(body).not.toContain(`Allow: /${ceremony}/2050-`);
    }
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

  test('every static route the sitemap submits declares its own canonical', async ({
    page,
    request,
  }) => {
    // Search Console reports a submitted URL with no user-declared canonical as an
    // issue, and it is invisible until you look: the page renders perfectly.
    // /about shipped without one for exactly that reason.
    const xml = await (await request.get('/sitemap.xml')).text();
    const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((m) => new URL(m[1]!).pathname)
      .filter((p) => !/\/\d{4}-\d{2}-\d{2}$/.test(p)); // dated pages sampled separately

    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`${route.replace(/\/$/, '')}/?$`),
        { timeout: 5_000 },
      );
    }
  });

  test('a dated verdict page canonicalises to itself', async ({ page }) => {
    await page.goto('/pawiwahan/2026-09-15');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/pawiwahan\/2026-09-15$/,
    );
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
