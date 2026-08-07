import Link from 'next/link';

import { type MonthResult } from '@/lib/api';
import { PRINT_VERDICT } from '@/lib/display';
import { dayHref, PREFETCH_LINKS, shiftMonth } from '@/lib/routes';

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

/** Month arrows. Flipping the month carries the selected day with it (same day
 *  number, clamped to the shorter month), so the grid and the verdict below it
 *  always describe the same date -- and each arrow is a plain cached URL. */
export function CalNav({ ceremony, date }: { ceremony: string; date: string }) {
  const prev = shiftMonth(date, -1);
  const next = shiftMonth(date, 1);

  return (
    <div className="cal-nav">
      {prev === null ? (
        <span className="cal-arrow is-end" aria-hidden="true">
          ‹
        </span>
      ) : (
        <Link
          className="cal-arrow"
          href={dayHref(ceremony, prev)}
          prefetch={PREFETCH_LINKS}
          aria-label="Bulan sebelumnya"
        >
          ‹
        </Link>
      )}
      {next === null ? (
        <span className="cal-arrow is-end" aria-hidden="true">
          ›
        </span>
      ) : (
        <Link
          className="cal-arrow"
          href={dayHref(ceremony, next)}
          prefetch={PREFETCH_LINKS}
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
              const cls = ['day', `r-${rating}`, isSel ? 'is-selected' : '']
                .filter(Boolean)
                .join(' ');
              return (
                <td key={iso}>
                  {/* `data-date` is how TodayMarker finds today in the browser —
                      it cannot be rendered here, these pages are cached forever. */}
                  <Link
                    href={dayHref(ceremony, iso)}
                    prefetch={PREFETCH_LINKS}
                    data-date={iso}
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
