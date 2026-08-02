import type { CeremonyId } from '@dewasa-ayu/types';
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

import { CEREMONIES } from './api';
import { clampMonth, todayISO } from './display';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const VIEW = /^\d{4}-\d{2}$/;

// Provide default values and basic validation via custom parsing if needed.
// 'parseAsString' is a builder, we can add validation logic using fallback values.

export const searchParamsParsers = {
  ceremony: parseAsString.withDefault('pawiwahan').withOptions({ shallow: false }), // keep false if we want server re-render on navigation, though nuqs enables shallow by default.
  date: parseAsString.withDefault(''), // Will default to today dynamically inside component if empty
  view: parseAsString.withDefault(''),
};

export const searchParamsCache = createSearchParamsCache(searchParamsParsers);

export function getValidatedSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const sp = searchParamsCache.parse(searchParams);

  const ceremony = (
    CEREMONIES.some((c) => c.id === sp.ceremony) ? sp.ceremony : 'pawiwahan'
  ) as CeremonyId;
  const date = sp.date && ISO.test(sp.date) ? sp.date : todayISO();
  const requested = sp.view && VIEW.test(sp.view) ? sp.view : date.slice(0, 7);

  // Clamp the viewed month into the engine's supported Sasih range so an
  // out-of-range ?view= (old bookmarks, hand-edited URLs) degrades gracefully.
  const [vy, vm] = requested.split('-').map(Number);
  const clamped = clampMonth(vy!, vm!);
  const rawView = `${clamped.y}-${String(clamped.m).padStart(2, '0')}`;

  return { ceremony, date, rawView };
}
