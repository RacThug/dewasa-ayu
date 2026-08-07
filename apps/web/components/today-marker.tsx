'use client';

import { useEffect } from 'react';

import { todayISO } from '@/lib/display';

/**
 * Marks today's cell in the calendar grid, in the browser.
 *
 * The verdict pages are cached permanently, so "today" cannot be rendered into
 * the HTML -- it would freeze on whatever day the page was first generated.
 * Doing it here also means each visitor sees *their* today rather than the
 * server's. Purely decorative (`.day.is-today .num`), so nothing is lost when it
 * runs a frame late, and the selected day keeps carrying `aria-current`.
 */
export function TodayMarker() {
  useEffect(() => {
    const cell = document.querySelector(`.cal [data-date="${todayISO()}"]`);
    cell?.classList.add('is-today');
  }, []);

  return null;
}
