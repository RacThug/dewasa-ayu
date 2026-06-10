import type { Metadata } from 'next';
import Link from 'next/link';

import { CeremonyNav } from '@/components/ceremony-nav';
import { ApiError, CEREMONIES, getMonth, isCeremonyId, type MonthResult } from '@/lib/api';
import { monthLabel, ratingMark, todayISO, verdictText } from '@/lib/display';
import { DividerOrnament } from '@/lib/icons';

const HEADS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

interface SearchParams {
  ceremony?: string;
  year?: string;
  month?: string;
}

const clampYear = (y: number): number => Math.min(2100, Math.max(2003, y));

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const now = new Date();
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';
  const year = clampYear(Number(sp.year) || now.getFullYear());
  const month = Math.min(12, Math.max(1, Number(sp.month) || now.getMonth() + 1));
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;
  return {
    title: `Kalender ${cer.label} — ${monthLabel(year, month)}`,
    description: `Kalender dewasa ayu ${cer.forText} untuk ${monthLabel(year, month)} — hari baik & kurang baik berdasarkan pedoman Wariga umum.`,
    alternates: { canonical: '/kalender' },
  };
}

export default async function Kalender({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const now = new Date();
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';
  const year = clampYear(Number(sp.year) || now.getFullYear());
  const monthRaw = Number(sp.month) || now.getMonth() + 1;
  const month = Math.min(12, Math.max(1, monthRaw));
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;

  let data: MonthResult | null = null;
  let errorMessage: string | null = null;
  try {
    data = await getMonth(year, month, ceremony);
  } catch (e) {
    errorMessage = e instanceof ApiError ? e.message : 'Terjadi kesalahan saat memuat kalender.';
  }

  const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const navHref = (y: number, m: number): string =>
    `/kalender?ceremony=${ceremony}&year=${y}&month=${m}`;

  return (
    <>
      <CeremonyNav
        active={ceremony}
        hrefFor={(id) => `/kalender?ceremony=${id}&year=${year}&month=${month}`}
      />

      <section className="ask anim d3" style={{ paddingBottom: 'var(--s4)' }}>
        <p className="eyebrow">Berdasarkan pedoman Wariga umum</p>
        <h1>
          Kalender <span className="pick">{cer.label}</span>
        </h1>
      </section>

      <nav className="cal-nav anim d4" aria-label="Navigasi bulan">
        <Link href={navHref(prev.y, prev.m)} aria-label="Bulan sebelumnya" className="cal-arrow">
          ‹
        </Link>
        <span className="cal-month">{monthLabel(year, month)}</span>
        <Link href={navHref(next.y, next.m)} aria-label="Bulan berikutnya" className="cal-arrow">
          ›
        </Link>
      </nav>

      {errorMessage && <p className="state-note">{errorMessage}</p>}
      {data && <CalendarGrid month={data} />}
      {data && (
        <p className="cal-summary anim d5">
          Hari ayu bulan ini: <b>{data.summary.ayuCount}</b> &nbsp;·&nbsp; kurang ideal:{' '}
          {data.summary.cautionCount} &nbsp;·&nbsp; kurang baik: {data.summary.badCount}
        </p>
      )}

      <DividerOrnament />
    </>
  );
}

function CalendarGrid({ month }: { month: MonthResult }) {
  const days = month.days;
  if (days.length === 0) return null;
  const lead = new Date(days[0]!.date).getUTCDay();
  const today = todayISO();

  return (
    <div className="calendar anim d4">
      <div className="cal-heads" aria-hidden="true">
        {HEADS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      <div className="cal-grid" role="list">
        {Array.from({ length: lead }).map((_, i) => (
          <span key={`blank-${i}`} className="cal-blank" aria-hidden="true" />
        ))}
        {days.map((d) => {
          const dayNum = Number(d.date.slice(8, 10));
          const rating = d.evaluation.rating;
          return (
            <Link
              key={d.date}
              href={`/?ceremony=${month.ceremony}&date=${d.date.slice(0, 10)}`}
              className={`cal-cell r-${rating}${d.date === today ? ' is-today' : ''}`}
              role="listitem"
              aria-label={`${dayNum} — ${verdictText(rating)}`}
            >
              <span className="cal-mark" aria-hidden="true">
                {ratingMark(rating)}
              </span>
              <span className="cal-num">{dayNum}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
