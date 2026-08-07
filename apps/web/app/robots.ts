import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site-url';

/** Content lives at `/{ceremony}/{date}` now, and no real page depends on a query
 *  string -- the only ones left are `?scrollTo=` and the legacy `/?ceremony=…`
 *  links, which redirect to the canonical path. So `Disallow: /*?` costs nothing
 *  and keeps duplicate, parameterised copies out of the index.
 *
 *  The crawl delay stays: dated pages outside the prerendered window are built on
 *  first request, so an unthrottled crawler walking the 2003-2100 range would pay
 *  for each of them once. They are cached permanently afterwards. */
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
