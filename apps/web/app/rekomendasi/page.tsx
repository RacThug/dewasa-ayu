import { redirect } from 'next/navigation';

import { isCeremonyId } from '@/lib/api';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

interface SearchParams {
  ceremony?: string;
  from?: string;
}

// Recommendations now live on the consolidated home view (nearest good days are
// derived from the selected date). Preserve ceremony + start date for old links.
export default async function RekomendasiRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.ceremony && isCeremonyId(sp.ceremony)) params.set('ceremony', sp.ceremony);
  if (sp.from && ISO.test(sp.from)) params.set('date', sp.from);
  params.set('scrollTo', 'rekomendasi');
  redirect(`/?${params.toString()}`);
}
