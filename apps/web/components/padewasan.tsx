import { type CheckResult } from '@/lib/api';

export function Padewasan({ result }: { result: CheckResult }) {
  const { dewasaAyu, dewasaAla } = result.evaluation;
  const none = dewasaAyu.length === 0 && dewasaAla.length === 0;

  return (
    <div className="padew">
      <h2 className="card-title">Padewasan</h2>
      {none && (
        <p className="tags-empty">Tidak ada padewasan khusus terdeteksi pada tanggal ini.</p>
      )}
      {dewasaAyu.length > 0 && (
        <div className="tag-group">
          <span className="tag-head">Mendukung</span>
          <div className="taglist">
            {dewasaAyu.map((d) => (
              <span key={d.id} className="pill-tag ayu" title={d.note}>
                {d.name}
              </span>
            ))}
          </div>
        </div>
      )}
      {dewasaAla.length > 0 && (
        <div className="tag-group">
          <span className="tag-head">Perlu diperhatikan</span>
          <div className="taglist">
            {dewasaAla.map((d) => (
              <span key={d.id} className="pill-tag ala" title={d.note}>
                {d.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
