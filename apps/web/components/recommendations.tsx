import Link from 'next/link';

import { CEREMONIES, type RecommendResult } from '@/lib/api';
import { cap } from '@/lib/display';

const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const gregWeekday = (iso: string): string =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'UTC' }).format(new Date(iso));

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
    <ol className="reco2-list">
      {data.dates.map((d) => {
        const iso = d.date.slice(0, 10);
        const view = iso.slice(0, 7);
        return (
          <li key={iso}>
            <Link href={`/?ceremony=${ceremony}&date=${iso}&view=${view}`} className="reco2-card">
              <span className="reco2-badge">
                <b>{Number(iso.slice(8, 10))}</b>
                <span>{MS[Number(iso.slice(5, 7)) - 1]}</span>
              </span>
              <span className="reco2-meta">
                <span className="reco2-day">{gregWeekday(d.date)}</span>
                <span className="reco2-wew">
                  {cap(d.info.saptawara)} {cap(d.info.pancawara)}
                </span>
              </span>
              <span className="reco2-score">Ayu · {Math.round(d.evaluation.pct)}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
