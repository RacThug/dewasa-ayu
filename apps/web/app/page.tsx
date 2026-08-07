import type { Metadata } from 'next';

import { VerdictView } from '@/components/verdict-view';
import { todayInBali } from '@/lib/display';

/**
 * The site entrance: today's verdict, for the default ceremony.
 *
 * This is a cached page rather than a redirect to `/{ceremony}/{today}`. A
 * redirect looked tidier but cost more than the page it pointed at -- Next sends
 * a full HTML document alongside the 307, so a cold visit paid 13 KB for the
 * redirect plus 10 KB for the destination. `/` takes the overwhelming majority
 * of this site's traffic, so it has to be the cheapest route, not the priciest.
 *
 * Revalidating rather than permanent, because "today" moves. Five minutes bounds
 * how long the page can lag midnight in Bali while costing ~290 renders a day.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function Home() {
  return <VerdictView ceremony="pawiwahan" date={todayInBali()} />;
}
