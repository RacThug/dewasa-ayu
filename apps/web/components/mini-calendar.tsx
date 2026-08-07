import Link from 'next/link';

import { type MonthResult } from '@/lib/api';
import { CAL_MAX, CAL_MIN, PREFETCH_DYNAMIC, PRINT_VERDICT, todayISO } from '@/lib/display';

// Gregorian + Balinese day-name pairs, Sunday-first like the printed calendar.
const HEADS: Array<[string, string]> = [
  ['Min', 'Redite'],
  ['Sen', 'Soma'],
  ['Sel', 'Anggara'],
  ['Rab', 'Buda'],
  ['Kam', 'Wraspati'],
  ['Jum', 'Sukra'],
  ['Sab', 'Saniscara'],
];

// Tika-style notation (DESIGN.md signature pattern #1) — always paired with
// the legend below the grid; color is never the only signal.
const MARK: Record<string, string> = { ayu: '●', caution: '◐', bad: '✕' };

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
    <div className="cal-nav">
      {atMin ? (
        <span className="cal-arrow is-end" aria-hidden="true">
          ‹
        </span>
      ) : (
        <Link
          className="cal-arrow"
          href={href(prev.y, prev.m)}
          prefetch={PREFETCH_DYNAMIC}
          aria-label="Bulan sebelumnya"
        >
          ‹
        </Link>
      )}
      {atMax ? (
        <span className="cal-arrow is-end" aria-hidden="true">
          ›
        </span>
      ) : (
        <Link
          className="cal-arrow"
          href={href(next.y, next.m)}
          prefetch={PREFETCH_DYNAMIC}
          aria-label="Bulan berikutnya"
        >
          ›
        </Link>
      )}
    </div>
  );
}

/** "2 hari ayu · 20 madya · 9 sebaiknya dihindari" — the month at a glance. */
export function MonthTally({ summary }: { summary: MonthResult['summary'] }) {
  return (
    <p className="tally">
      <b>
        {summary.ayuCount} hari <em>ayu</em>
      </b>{' '}
      · {summary.cautionCount} madya · {summary.badCount} sebaiknya dihindari
    </p>
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

  // Chunk lead blanks + days into table rows of 7.
  type Cell = (typeof days)[number] | null;
  const cells: Cell[] = [...Array.from({ length: lead }, () => null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <table className="cal">
      <thead>
        <tr>
          {HEADS.map(([greg, bali]) => (
            <th key={greg} scope="col">
              {greg}
              <em aria-hidden="true">{bali}</em>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((d, di) => {
              if (d === null) return <td key={`blank-${wi}-${di}`} className="blank" />;
              const iso = d.date.slice(0, 10);
              const dayNum = Number(iso.slice(8, 10));
              const rating = d.evaluation.rating;
              const sasih = d.info.sasih;
              const moon = sasih.isPurnama ? 'PUR' : sasih.isTilem ? 'TIL' : '';
              const isSel = iso === selected;
              const isToday = iso === today;
              const cls = [
                'day',
                `r-${rating}`,
                isSel ? 'is-selected' : '',
                isToday ? 'is-today' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <td key={iso}>
                  <Link
                    href={`/?ceremony=${ceremony}&date=${iso}&view=${view}`}
                    prefetch={PREFETCH_DYNAMIC}
                    className={cls}
                    aria-label={`${dayNum} — ${PRINT_VERDICT[rating].word}${moon ? `, ${moon === 'PUR' ? 'purnama' : 'tilem'}` : ''}`}
                    aria-current={isSel ? 'date' : undefined}
                  >
                    <span className="num">{dayNum}</span>
                    <span className="pw">{d.info.pancawara}</span>
                    {moon ? <span className="moon">{moon}</span> : null}
                    <span className="mark" aria-hidden="true">
                      {MARK[rating]}
                    </span>
                  </Link>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function CalLegend() {
  return (
    <div className="cal-legend" aria-hidden="true">
      <span className="l-ayu">
        <b>●</b>Ayu — disarankan
      </span>
      <span>
        <b>◐</b>Madya — dengan catatan
      </span>
      <span className="l-bad">
        <b>✕</b>Ala — sebaiknya dihindari
      </span>
      <span className="l-moon">
        <b>PUR·TIL</b>Purnama · Tilem
      </span>
    </div>
  );
}
