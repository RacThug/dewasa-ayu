import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { VerdictView } from '@/components/verdict-view';
import { CEREMONIES, isCeremonyId } from '@/lib/api';
import { todayInBali } from '@/lib/display';

/** "Today, for this ceremony" — six cached pages, same deal as `/`. Also where
 *  the ceremony-page CTAs point, since a static page cannot bake in today's date. */
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams(): Array<{ ceremony: string }> {
  return CEREMONIES.map((c) => ({ ceremony: c.id }));
}

interface RouteParams {
  params: Promise<{ ceremony: string }>;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { ceremony } = await params;
  const cer = CEREMONIES.find((c) => c.id === ceremony);
  if (!cer) return {};
  return {
    title: { absolute: `Hari baik ${cer.label} hari ini — Dewasa Ayu` },
    description: `Apakah hari ini baik untuk ${cer.forText}? Penilaian dewasa ayu berdasarkan pedoman Wariga umum, plus kalender bulan ini dan hari baik terdekat.`,
    alternates: { canonical: `/${cer.id}` },
  };
}

export default async function CeremonyToday({ params }: RouteParams) {
  const { ceremony } = await params;
  if (!isCeremonyId(ceremony)) notFound();
  return <VerdictView ceremony={ceremony} date={todayInBali()} />;
}
