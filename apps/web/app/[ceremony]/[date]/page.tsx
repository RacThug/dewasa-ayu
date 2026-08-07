import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { VerdictView } from '@/components/verdict-view';
import { CEREMONIES, isCeremonyId } from '@/lib/api';
import { formatID, todayInBali } from '@/lib/display';
import { dayHref, ISO_DATE } from '@/lib/routes';

/**
 * A day's verdict is a pure function of (ceremony, date), and the Wariga for a
 * given day never changes, so every one of these pages is generated once and
 * cached forever. Repeat views cost no server compute at all.
 *
 * Two things must stay true for that to hold:
 *   - nothing here reads request state (no `searchParams`, cookies or headers)
 *     and nothing reads the clock; `?scrollTo=` is handled in the browser
 *   - "today" is decided client-side by `TodayMarker`, never baked into the HTML
 */
export const revalidate = false;
export const dynamicParams = true;

/** Prerender the window people actually land on; everything else in the engine's
 *  2003-2100 range is generated on first request and then cached permanently. */
export function generateStaticParams(): Array<{ ceremony: string; date: string }> {
  const params: Array<{ ceremony: string; date: string }> = [];
  const start = todayInBali();
  const cursor = new Date(Number(start.slice(0, 4)), Number(start.slice(5, 7)) - 1, 1);

  for (let i = 0; i < 92; i++) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
      cursor.getDate(),
    ).padStart(2, '0')}`;
    for (const c of CEREMONIES) params.push({ ceremony: c.id, date: iso });
    cursor.setDate(cursor.getDate() + 1);
  }
  return params;
}

interface RouteParams {
  params: Promise<{ ceremony: string; date: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { ceremony, date } = await params;
  if (!isCeremonyId(ceremony) || !ISO_DATE.test(date)) return {};
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;

  const human = formatID(date);
  return {
    title: { absolute: `${human} — hari baik ${cer.label}? — Dewasa Ayu` },
    description: `Apakah ${human} hari baik untuk ${cer.forText}? Lihat penilaian dewasa ayu berdasarkan pedoman Wariga umum — wewaran, wuku, sasih, dan hari baik terdekat.`,
    alternates: { canonical: dayHref(ceremony, date) },
  };
}

export default async function DayPage({ params }: RouteParams) {
  const { ceremony, date } = await params;
  // The date's *shape* is checked here; a well-formed but unreal date such as
  // 2026-02-31 is left to the engine so the user gets the Indonesian error copy.
  if (!isCeremonyId(ceremony) || !ISO_DATE.test(date)) notFound();

  return <VerdictView ceremony={ceremony} date={date} />;
}
