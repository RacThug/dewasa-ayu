'use client';

import { useEffect } from 'react';

/**
 * Smoothly scrolls to a section when arriving with `?scrollTo=<id>` — used by the
 * /kalender and /rekomendasi redirects and the ceremony-page CTAs. A query param
 * (not a `#hash`) is used on purpose: the browser hard-jumps to a hash before any
 * JS runs, which kills the animation. We scroll after paint, then drop the param so
 * a refresh or back-navigation doesn't scroll again. Honors prefers-reduced-motion.
 */
export function ScrollOnLoad() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('scrollTo');
    if (!id) return;

    const el = document.getElementById(id);
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }

    params.delete('scrollTo');
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, []);

  return null;
}
