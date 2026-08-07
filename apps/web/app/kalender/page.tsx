import { redirect } from 'next/navigation';

import { isCeremonyId } from '@/lib/api';
import { todayInBali } from '@/lib/display';
import { dayHref, firstDayOfClampedMonth, ISO_DATE } from '@/lib/routes';

interface SearchParams {
  ceremony?: string;
  year?: string;
  month?: string;
  date?: string;
}

// The calendar now lives on the consolidated verdict page. Preserve the chosen
// ceremony + month so existing links and bookmarks still land right.
export default async function KalenderRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';

  const y = Number(sp.year);
  const m = Number(sp.month);
  const date =
    sp.date && ISO_DATE.test(sp.date)
      ? sp.date
      : Number.isInteger(y) && Number.isInteger(m) && m >= 1 && m <= 12
        ? // Clamp into the supported range (restores the pre-consolidation #62 behaviour).
          firstDayOfClampedMonth(y, m)
        : todayInBali();

  redirect(`${dayHref(ceremony, date)}?scrollTo=kalender`);
}
