'use client';

import { useEffect } from 'react';

/** Query keys that only ever meant something to the pre-#74 URL scheme. Config
 *  redirects carry them through to the destination, so tidy them out of the address
 *  bar — otherwise a legacy visit leaves the user with a URL they might share. */
const LEGACY_KEYS = ['ceremony', 'date', 'view', 'from', 'count', 'year', 'month'];

/**
 * Scrolls to a section on arrival with `?scrollTo=<id>` — used by the ceremony-page
 * CTAs and the /kalender and /rekomendasi redirects. A query param (not a `#hash`)
 * is used on purpose: the browser hard-jumps to a hash before any JS runs, which
 * kills the animation. We scroll after paint, then drop the param so a refresh or
 * back-navigation doesn't scroll again. Honors prefers-reduced-motion.
 *
 * Reading the query here rather than on the server is also what lets these pages
 * stay cached — the HTML is identical whatever the query string says.
 */
export function ScrollOnLoad() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('scrollTo');

    if (id) {
      const el = document.getElementById(id);
      if (el) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }

    params.delete('scrollTo');
    for (const key of LEGACY_KEYS) params.delete(key);

    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    if (next !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, '', next);
    }
  }, []);

  return null;
}
