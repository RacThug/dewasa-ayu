import type { MetadataRoute } from 'next';

import { CEREMONIES } from '@/lib/api';
import { todayInBali } from '@/lib/display';
import { dayHref } from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';

/** Dated pages are generated on demand across 2003-2100, far too many to submit.
 *  Six months forward is the window people actually plan a ceremony in, and it
 *  keeps the sitemap around 1,100 URLs -- well inside the 50,000 limit. */
const DAYS_AHEAD = 183;

/** The window moves with the calendar, so regenerate daily. */
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const today = todayInBali();

  const staticRoutes = [
    { url: `${SITE_URL}/`, priority: 1, changeFrequency: 'daily' as const },
    { url: `${SITE_URL}/about`, priority: 0.6, changeFrequency: 'monthly' as const },
    ...CEREMONIES.map((c) => ({
      url: `${SITE_URL}/upacara/${c.id}`,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
  ];

  // Each dated page is a distinct verdict, and never changes once published.
  const dated: MetadataRoute.Sitemap = [];
  const cursor = new Date(
    Number(today.slice(0, 4)),
    Number(today.slice(5, 7)) - 1,
    Number(today.slice(8, 10)),
  );
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate(),
    ).padStart(2, '0')}`;
    for (const c of CEREMONIES) {
      dated.push({
        url: `${SITE_URL}${dayHref(c.id, iso)}`,
        priority: 0.5,
        changeFrequency: 'yearly',
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return [...staticRoutes, ...dated];
}
