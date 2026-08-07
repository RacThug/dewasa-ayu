import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AboutCard } from '@/components/about-card';
import { DateControls } from '@/components/date-controls';
import { Hero } from '@/components/hero';
import { CalLegend, CalNav, MiniCalendar, MonthTally } from '@/components/mini-calendar';
import { Padewasan } from '@/components/padewasan';
import { Reco } from '@/components/recommendations';
import { Rincian } from '@/components/rincian';
import { ScrollOnLoad } from '@/components/scroll-on-load';
import { TodayMarker } from '@/components/today-marker';
import { ApiError, CEREMONIES, checkDate, getMonth, getRecommend, isCeremonyId } from '@/lib/api';
import { formatID, monthLabel, todayInBali } from '@/lib/display';
import { dayHref, ISO_DATE, PREFETCH_LINKS } from '@/lib/routes';

/**
 * A day's verdict is a pure function of (ceremony, date) and the Wariga for a
 * given day never changes, so every one of these pages is generated once and
 * cached forever. Repeat views cost no server compute at all.
 *
 * Two things must stay true for that to hold:
 *   - the page reads no request state (no `searchParams`, no cookies, no
 *     `new Date()`); `?scrollTo=` is read in the browser by `ScrollOnLoad`
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

  const cer = CEREMONIES.find((c) => c.id === ceremony)!;
  const viewY = Number(date.slice(0, 4));
  const viewM = Number(date.slice(5, 7));

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
      <TodayMarker />

      <nav className="tabs anim d1" aria-label="Pilih jenis upacara">
        {CEREMONIES.map((c) => (
          <Link
            key={c.id}
            href={dayHref(c.id, date)}
            prefetch={PREFETCH_LINKS}
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
          <CalNav ceremony={ceremony} date={date} />
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
