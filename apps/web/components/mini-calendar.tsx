import Link from 'next/link';

import { type MonthResult } from '@/lib/api';
import { monthLabel, SENJA_VERDICT, todayISO } from '@/lib/display';

// Full months the engine's Sasih table covers
export const CAL_MIN = { y: 2003, m: 2 };
export const CAL_MAX = { y: 2100, m: 12 };

export const clampMonth = (y: number, m: number): { y: number; m: number } => {
  if (y < CAL_MIN.y || (y === CAL_MIN.y && m < CAL_MIN.m)) return { ...CAL_MIN };
  if (y > CAL_MAX.y || (y === CAL_MAX.y && m > CAL_MAX.m)) return { ...CAL_MAX };
  return { y, m };
};

const HEADS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function CalNav({
  ceremony,
  date,
  viewY,
  viewM,
}: {
  ceremony: string;
  date: string;
  viewY: number;
  viewM: number;
}) {
  const atMin = viewY === CAL_MIN.y && viewM === CAL_MIN.m;
  const atMax = viewY === CAL_MAX.y && viewM === CAL_MAX.m;
  const prev = viewM === 1 ? { y: viewY - 1, m: 12 } : { y: viewY, m: viewM - 1 };
  const next = viewM === 12 ? { y: viewY + 1, m: 1 } : { y: viewY, m: viewM + 1 };
  const href = (y: number, m: number): string =>
    `/?ceremony=${ceremony}&date=${date}&view=${y}-${String(m).padStart(2, '0')}`;

  return (
    <div className="cal-head">
      {atMin ? (
        <span className="cal-arrow is-end" aria-hidden="true">
          ‹
        </span>
      ) : (
        <Link className="cal-arrow" href={href(prev.y, prev.m)} aria-label="Bulan sebelumnya">
          ‹
        </Link>
      )}
      <span className="cal-title">{monthLabel(viewY, viewM)}</span>
      {atMax ? (
        <span className="cal-arrow is-end" aria-hidden="true">
          ›
        </span>
      ) : (
        <Link className="cal-arrow" href={href(next.y, next.m)} aria-label="Bulan berikutnya">
          ›
        </Link>
      )}
    </div>
  );
}

export function MiniCalendar({
  month,
  ceremony,
  selected,
}: {
  month: MonthResult;
  ceremony: string;
  selected: string;
}) {
  const days = month.days;
  if (days.length === 0) return null;
  const lead = new Date(days[0]!.date).getUTCDay();
  const today = todayISO();
  const view = `${month.year}-${String(month.month).padStart(2, '0')}`;

  return (
    <>
      <div className="mcal-heads" aria-hidden="true">
        {HEADS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      <div className="mcal-grid" role="list">
        {Array.from({ length: lead }).map((_, i) => (
          <span key={`blank-${i}`} aria-hidden="true" />
        ))}
        {days.map((d) => {
          const iso = d.date.slice(0, 10);
          const dayNum = Number(iso.slice(8, 10));
          const rating = d.evaluation.rating;
          const isSel = iso === selected;
          const isToday = iso === today;
          const cls = [
            'mcal-cell',
            `r-${rating}`,
            isSel ? 'is-selected' : '',
            isToday ? 'is-today' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <Link
              key={iso}
              href={`/?ceremony=${ceremony}&date=${iso}&view=${view}`}
              className={cls}
              role="listitem"
              aria-label={`${dayNum} — ${SENJA_VERDICT[rating].word}`}
              aria-current={isSel ? 'date' : undefined}
            >
              <span className="mcal-num">{dayNum}</span>
              <span className="mcal-dot" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function CalLegend() {
  return (
    <div className="mcal-legend" aria-hidden="true">
      <span>
        <i className="dot-ayu" />
        Ayu
      </span>
      <span>
        <i className="dot-caution" />
        Madya
      </span>
      <span>
        <i className="dot-ala" />
        Ala
      </span>
    </div>
  );
}
