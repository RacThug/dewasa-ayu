import { redirect } from 'next/navigation';

import { isCeremonyId } from '@/lib/api';
import { clampMonth } from '@/lib/display';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

interface SearchParams {
  ceremony?: string;
  year?: string;
  month?: string;
  date?: string;
}

// The calendar now lives on the consolidated home view. Preserve the chosen
// ceremony + month (as ?view=) so existing links and bookmarks still land right.
export default async function KalenderRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.ceremony && isCeremonyId(sp.ceremony)) params.set('ceremony', sp.ceremony);
  if (sp.date && ISO.test(sp.date)) params.set('date', sp.date);
  const y = Number(sp.year);
  const m = Number(sp.month);
  if (Number.isInteger(y) && Number.isInteger(m) && m >= 1 && m <= 12) {
    // Clamp into the supported range (restores the pre-consolidation #62 behaviour).
    const v = clampMonth(y, m);
    params.set('view', `${v.y}-${String(v.m).padStart(2, '0')}`);
  }
  params.set('scrollTo', 'kalender');
  redirect(`/?${params.toString()}`);
}
