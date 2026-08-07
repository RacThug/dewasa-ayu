import { redirect } from 'next/navigation';

import { isCeremonyId } from '@/lib/api';
import { todayInBali } from '@/lib/display';
import { dayHref, firstDayOfClampedMonth, ISO_DATE } from '@/lib/routes';

const VIEW = /^(\d{4})-(\d{2})$/;

const one = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/**
 * The site entrance, and the compatibility layer for every pre-#74 link.
 *
 * Verdicts now live at `/{ceremony}/{date}`, which is cached permanently. This
 * route stays dynamic on purpose: it resolves "today" and old query strings, but
 * it runs no engine code, so it costs a redirect and nothing more.
 */
export default async function Home(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;

  const rawCeremony = one(sp.ceremony);
  const ceremony = rawCeremony && isCeremonyId(rawCeremony) ? rawCeremony : 'pawiwahan';

  const rawDate = one(sp.date);
  const rawView = one(sp.view);
  const viewMatch = rawView ? VIEW.exec(rawView) : null;

  const date =
    rawDate && ISO_DATE.test(rawDate)
      ? rawDate
      : viewMatch
        ? // A bare ?view= (month, no day) lands on that month's first day.
          firstDayOfClampedMonth(Number(viewMatch[1]), Number(viewMatch[2]))
        : todayInBali();

  const scrollTo = one(sp.scrollTo);
  redirect(`${dayHref(ceremony, date)}${scrollTo ? `?scrollTo=${scrollTo}` : ''}`);
}
