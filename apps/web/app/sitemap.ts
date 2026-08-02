import type { MetadataRoute } from 'next';

import { CEREMONIES } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Static routes that are real, crawlable pages (query-param variants are not listed). */
export default function sitemap(): MetadataRoute.Sitemap {
  // The calendar + recommendations now live on the home view; /kalender and
  // /rekomendasi only redirect there, so they are not listed as crawlable pages.
  const routes = [
    { path: '', priority: 1 },
    { path: '/about', priority: 0.6 },
    ...CEREMONIES.map((c) => ({ path: `/upacara/${c.id}`, priority: 0.5 })),
  ];
  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: 'monthly',
    priority: r.priority,
  }));
}
