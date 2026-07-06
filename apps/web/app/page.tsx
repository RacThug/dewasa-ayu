import type { Metadata } from 'next';
import Link from 'next/link';

import { AboutCard } from '@/components/about-card';
import { DateControls } from '@/components/date-controls';
import { Hero } from '@/components/hero';
import { CalLegend, CalNav, MiniCalendar, MonthTally } from '@/components/mini-calendar';
import { Padewasan } from '@/components/padewasan';
import { Reco } from '@/components/recommendations';
import { Rincian } from '@/components/rincian';
import { ScrollOnLoad } from '@/components/scroll-on-load';
import { ApiError, CEREMONIES, checkDate, getMonth, getRecommend } from '@/lib/api';
import { monthLabel } from '@/lib/display';
import { getValidatedSearchParams } from '@/lib/search-params';

export async function generateMetadata(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await props.searchParams;
  const { ceremony } = getValidatedSearchParams(params);
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;
  return {
    title: { absolute: `Cek hari baik ${cer.label} — Dewasa Ayu` },
    description: `Apakah hari baik untuk ${cer.forText}? Cek dewasa ayu berdasarkan pedoman Wariga umum — kalender bulanan, penilaian tanggal, dan hari baik terdekat dalam satu halaman.`,
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

      <nav className="tabs anim d1" aria-label="Pilih jenis upacara">
        {CEREMONIES.map((c) => (
          <Link
            key={c.id}
            href={hrefFor(c.id)}
            className={`tab${c.id === ceremony ? ' is-active' : ''}`}
            aria-current={c.id === ceremony ? 'page' : undefined}
          >
            {c.label}
          </Link>
        ))}
      </nav>

      <section className="monthbar anim d2" aria-label="Bulan dan tanggal">
        <div className="monthbar-row">
          <h1 className="month-name">
            <small>Dinilai untuk {cer.label}</small>
            <span className="sr-only">Kalender hari baik — </span>
            <span className="mn">{monthLabel(viewY, viewM)}</span>
          </h1>
          <CalNav ceremony={ceremony} date={date} viewY={viewY} viewM={viewM} />
        </div>
        <div className="monthbar-sub">
          {monthR.status === 'fulfilled' ? <MonthTally summary={monthR.value.summary} /> : null}
          <DateControls ceremony={ceremony} date={date} />
        </div>
      </section>

      <section id="kalender" className="cal-sec anim d2" aria-label="Kalender bulanan">
        {monthR.status === 'fulfilled' ? (
          <MiniCalendar month={monthR.value} ceremony={ceremony} selected={date} />
        ) : (
          <p className="state-card">{errOf(monthR.reason)}</p>
        )}
        <CalLegend />
      </section>

      <section id="hasil" className="detail anim d3" aria-label="Hasil penilaian tanggal terpilih">
        {checkR.status === 'fulfilled' ? (
          <>
            <Hero result={checkR.value} cer={cer} date={date} />
            <div className="detail-grid">
              <Rincian result={checkR.value} date={date} />
              <Padewasan result={checkR.value} />
            </div>
            <p className="estnote">
              <sup aria-hidden="true">*</sup> Skor adalah tingkat kecocokan menurut pedoman Wariga
              umum — bersifat <em>estimasi</em>, bukan ketentuan mutlak.
            </p>
          </>
        ) : (
          <p className="state-card">{errOf(checkR.reason)}</p>
        )}
      </section>

      <section id="rekomendasi" className="rec-sec anim d3" aria-labelledby="reco-h">
        <h2 className="sec-title" id="reco-h">
          Hari baik terdekat{ceremony !== 'pawiwahan' ? ` · ${cer.label}` : ''}
        </h2>
        <p className="sec-sub">
          Lima tanggal berikutnya yang disarankan untuk {cer.forText}, dihitung dari tanggal
          terpilih.
        </p>
        {recoR.status === 'fulfilled' ? (
          <Reco data={recoR.value} ceremony={ceremony} cer={cer} />
        ) : (
          <p className="state-card">{errOf(recoR.reason)}</p>
        )}
      </section>

      <AboutCard />
    </>
  );
}
