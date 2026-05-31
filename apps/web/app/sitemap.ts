import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Static routes that are real, crawlable pages (query-param variants are not listed). */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', priority: 1 },
    { path: '/kalender', priority: 0.8 },
    { path: '/rekomendasi', priority: 0.8 },
    { path: '/about', priority: 0.6 },
  ];
  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: 'monthly',
    priority: r.priority,
  }));
}
