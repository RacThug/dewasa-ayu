import type { CeremonyId } from '@dewasa-ayu/types';
import Link from 'next/link';

import { AboutCard } from '@/components/about-card';
import { DateControls } from '@/components/date-controls';
import { Hero } from '@/components/hero';
import { CalLegend, CalNav, MiniCalendar, MonthTally } from '@/components/mini-calendar';
import { Padewasan } from '@/components/padewasan';
import { Reco } from '@/components/recommendations';
import { Rincian } from '@/components/rincian';
import { ScrollOnLoad } from '@/components/scroll-on-load';
import { TodayMarker } from '@/components/today-marker';
import { ApiError, CEREMONIES, checkDate, getMonth, getRecommend } from '@/lib/api';
import { monthLabel } from '@/lib/display';
import { dayHref, PREFETCH_LINKS } from '@/lib/routes';

/**
 * The whole verdict screen: ceremony tabs, month grid, the day's judgement and
 * the nearest good days.
 *
 * Rendered by three cached routes -- `/` and `/{ceremony}` (today, revalidating)
 * and `/{ceremony}/{date}` (a fixed day, cached forever). It takes its state as
 * props and reads nothing from the request, which is what lets all three cache.
 */
export async function VerdictView({ ceremony, date }: { ceremony: CeremonyId; date: string }) {
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
