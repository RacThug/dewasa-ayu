import Link from 'next/link';

import { CEREMONIES, type RecommendResult } from '@/lib/api';
import { cap } from '@/lib/display';

const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const gregWeekday = (iso: string): string =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'UTC' }).format(new Date(iso));

/** Nearest good days as print footnote rows (red date numeral · detail · slab score). */
export function Reco({
  data,
  ceremony,
  cer,
}: {
  data: RecommendResult;
  ceremony: string;
  cer: (typeof CEREMONIES)[number];
}) {
  if (data.dates.length === 0) {
    return (
      <div className="reco-empty">
        Belum ada hari <b>Ayu</b> untuk <b>{cer.label}</b> dalam setahun ke depan. Coba jenis
        upacara lain.
      </div>
    );
  }
  return (
    <ol className="rec-list">
      {data.dates.map((d) => {
        const iso = d.date.slice(0, 10);
        const view = iso.slice(0, 7);
        const sasih = d.info.sasih;
        const half = sasih.isPangelong ? 'pangelong' : 'penanggal';
        const badge = sasih.isPurnama ? 'Purnama' : sasih.isTilem ? 'Tilem' : '';
        return (
          <li key={iso}>
            <Link href={`/?ceremony=${ceremony}&date=${iso}&view=${view}`} className="rec">
              <span className="rec-date">
                <b>{Number(iso.slice(8, 10))}</b> {MS[Number(iso.slice(5, 7)) - 1]}
              </span>
              <span className="rec-info">
                <b>{gregWeekday(d.date)}</b>
                {cap(d.info.saptawara)} {cap(d.info.pancawara)} · wuku {cap(d.info.wuku)} ·{' '}
                {cap(sasih.name)}, {half} {sasih.penanggal}
              </span>
              {badge ? <span className="rec-badge">{badge}</span> : null}
              <span className="rec-score" aria-label={`Skor ${Math.round(d.evaluation.pct)}`}>
                {Math.round(d.evaluation.pct)}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
