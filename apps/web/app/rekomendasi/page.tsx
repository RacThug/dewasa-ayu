import { redirect } from 'next/navigation';

import { isCeremonyId } from '@/lib/api';
import { todayInBali } from '@/lib/display';
import { dayHref, ISO_DATE } from '@/lib/routes';

interface SearchParams {
  ceremony?: string;
  from?: string;
}

// Recommendations now live on the consolidated verdict page (nearest good days
// are derived from the selected date). Preserve ceremony + start date for old links.
export default async function RekomendasiRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';
  const date = sp.from && ISO_DATE.test(sp.from) ? sp.from : todayInBali();

  redirect(`${dayHref(ceremony, date)}?scrollTo=rekomendasi`);
}
