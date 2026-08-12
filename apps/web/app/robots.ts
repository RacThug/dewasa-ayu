import type { MetadataRoute } from 'next';

import { CEREMONIES } from '@/lib/api';
import { todayInBali } from '@/lib/display';
import { SITE_URL } from '@/lib/site-url';

/**
 * The crawl fence.
 *
 * `/{ceremony}/{date}` spans 2003-2100, and every verdict page links to ~44 more
 * of them (six ceremony tabs, two month arrows, the month grid, five
 * recommendations). That is a ~214,000-page space a crawler can walk one day at
 * a time, and because `dynamicParams` is on, each unvisited URL is rendered from
 * scratch on first request. Left open it cost roughly 2 GB of transfer and 23
 * CPU-minutes per crawl -- measured 2026-08-12, several times the Hobby
 * allowance.
 *
 * So dated pages are crawlable only for the years the sitemap actually submits.
 * Humans still reach every date: this restricts discovery, not access.
 *
 * The window is deliberately keyed to the same source as `sitemap.ts` -- the
 * current year plus the next one always contains today + `DAYS_AHEAD`. Never
 * disallow a URL the sitemap submits; Search Console reports that as an error.
 */
const CRAWLABLE_YEARS = 2;

/** The year window moves with the calendar, so regenerate daily -- as the sitemap does. */
export const revalidate = 86400;

export default function robots(): MetadataRoute.Robots {
  const thisYear = Number(todayInBali().slice(0, 4));
  const years = Array.from({ length: CRAWLABLE_YEARS }, (_, i) => thisYear + i);

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        // Longest match wins, so these override the ceremony-wide Disallow below.
        ...CEREMONIES.flatMap((c) => years.map((y) => `/${c.id}/${y}-`)),
      ],
      disallow: [
        // No page depends on a query string any more -- the survivors are
        // `?scrollTo=` and the legacy `/?ceremony=…` links, which redirect to the
        // canonical path. Blocking them keeps parameterised duplicates out of the
        // index. Note this does *not* fence the dated pages: they carry their
        // state in the path, which is exactly why the rule below is needed.
        '/*?',
        // `/{ceremony}` itself stays crawlable -- this pattern needs the slash.
        ...CEREMONIES.map((c) => `/${c.id}/`),
      ],
      // Ignored by Google, honoured by Bing/Yandex and most well-behaved bots.
      crawlDelay: 10,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
