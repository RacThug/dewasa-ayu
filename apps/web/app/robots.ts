import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site-url';

/** The calendar links every day, month and ceremony as a `/?ceremony=…&date=…&view=…`
 *  URL, so the crawlable space is combinatorially unbounded (6 ceremonies ×
 *  ~35,000 dates × ~1,170 months) while every one of those URLs is a dynamic,
 *  uncached server render. Left open, a single crawler walks it forever and burns
 *  the whole compute budget; `/` is the canonical for all of them anyway.
 *
 *  `Disallow: /*?` blocks any URL carrying a query string. The real pages -- `/`,
 *  `/about`, `/upacara/*`, `/sitemap.xml` -- have none, so they stay indexable. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/*?',
      // Ignored by Google, honoured by Bing/Yandex and most well-behaved bots.
      crawlDelay: 10,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
