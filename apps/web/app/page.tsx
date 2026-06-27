import type { Metadata } from 'next';
import Link from 'next/link';

import { AboutCard } from '@/components/about-card';
import { DateControls } from '@/components/date-controls';
import { Hero } from '@/components/hero';
import { CalLegend, CalNav, MiniCalendar } from '@/components/mini-calendar';
import { Padewasan } from '@/components/padewasan';
import { Reco } from '@/components/recommendations';
import { Rincian } from '@/components/rincian';
import { ScrollOnLoad } from '@/components/scroll-on-load';
import { ApiError, CEREMONIES, checkDate, getMonth, getRecommend } from '@/lib/api';
import { CeremonyIcon } from '@/lib/icons';
import { getValidatedSearchParams } from '@/lib/search-params';

export async function generateMetadata(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await props.searchParams;
  const { ceremony } = getValidatedSearchParams(params);
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;
  return {
    title: { absolute: `Cek hari baik ${cer.label} — Dewasa Ayu` },
    description: `Apakah hari baik untuk ${cer.forText}? Cek dewasa ayu berdasarkan pedoman Wariga umum — verdict, kalender bulanan, dan hari baik terdekat dalam satu halaman.`,
    alternates: { canonical: '/' },
  };
}

export default async function Home(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await props.searchParams;
  const { ceremony, date, rawView } = getValidatedSearchParams(params);
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;

  const [vy, vm] = rawView.split('-').map(Number);
  const viewY = vy!;
  const viewM = vm!;
  const view = `${viewY}-${String(viewM).padStart(2, '0')}`;

  const hrefFor = (id: string): string => `/?ceremony=${id}&date=${date}&view=${view}`;

  const [checkR, monthR, recoR] = await Promise.allSettled([
    checkDate(date, ceremony),
    getMonth(viewY, viewM, ceremony),
    getRecommend(date, 5, ceremony),
  ]);

  const errOf = (e: unknown): string =>
    e instanceof ApiError ? e.message : 'Terjadi kesalahan pada layanan.';

  return (
    <>
      <ScrollOnLoad />
      <DateControls ceremony={ceremony} date={date} />

      <nav className="chips anim d2" aria-label="Pilih jenis upacara">
        {CEREMONIES.map((c) => (
          <Link
            key={c.id}
            href={hrefFor(c.id)}
            className={`chip${c.id === ceremony ? ' is-active' : ''}`}
            aria-current={c.id === ceremony ? 'page' : undefined}
          >
            <CeremonyIcon id={c.id} className="chip-icon" />
            {c.label}
          </Link>
        ))}
      </nav>

      <div className="app-grid anim d3">
        <div className="app-col">
          {checkR.status === 'fulfilled' ? (
            <Hero result={checkR.value} cer={cer} date={date} />
          ) : (
            <section className="panel-card state-card">{errOf(checkR.reason)}</section>
          )}

          <div className="sub-grid">
            {checkR.status === 'fulfilled' ? (
              <>
                <Rincian result={checkR.value} date={date} />
                <Padewasan result={checkR.value} />
              </>
            ) : null}
          </div>
        </div>

        <div className="app-col">
          <section id="kalender" className="panel-card cal-card" aria-label="Kalender bulanan">
            <CalNav ceremony={ceremony} date={date} viewY={viewY} viewM={viewM} />
            {monthR.status === 'fulfilled' ? (
              <MiniCalendar month={monthR.value} ceremony={ceremony} selected={date} />
            ) : (
              <p className="state-card">{errOf(monthR.reason)}</p>
            )}
            <CalLegend />
          </section>

          <section id="rekomendasi" aria-labelledby="reco-h">
            <h2 className="card-title" id="reco-h">
              Hari baik terdekat{ceremony !== 'pawiwahan' ? ` · ${cer.label}` : ''}
            </h2>
            {recoR.status === 'fulfilled' ? (
              <Reco data={recoR.value} ceremony={ceremony} cer={cer} />
            ) : (
              <p className="state-card">{errOf(recoR.reason)}</p>
            )}
          </section>
        </div>
      </div>

      <AboutCard />
    </>
  );
}
