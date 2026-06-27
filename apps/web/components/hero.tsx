import { ShareButton } from '@/components/share-button';
import { CEREMONIES, type CheckResult } from '@/lib/api';
import { cap, formatID, SENJA_VERDICT } from '@/lib/display';

export function summaryText(rating: string, forText: string): string {
  if (rating === 'ayu') return `Hari yang baik menurut pedoman Wariga umum untuk ${forText}.`;
  if (rating === 'caution')
    return `Cukup baik dengan catatan — pertimbangkan, dan bila perlu konsultasikan terlebih dahulu.`;
  return `Sebaiknya dihindari untuk ${forText}; pertimbangkan memilih tanggal lain.`;
}

export function Hero({
  result,
  cer,
  date,
}: {
  result: CheckResult;
  cer: (typeof CEREMONIES)[number];
  date: string;
}) {
  const { info, evaluation: ev } = result;
  const v = SENJA_VERDICT[ev.rating];
  const pct = Math.round(ev.pct);
  const wewaran: Array<[string, string]> = [
    ['Saptawara', cap(info.saptawara)],
    ['Pancawara', cap(info.pancawara)],
    ['Triwara', cap(info.triwara)],
    ['Wuku', cap(info.wuku)],
  ];

  return (
    <section className={`hero ${v.cls}`} aria-labelledby="verdict-h">
      <div className="hero-top">
        <div className="hero-when">
          <span className="hero-eyebrow">{formatID(date)}</span>
          <span className="hero-cernote">Dinilai untuk · {cer.label}</span>
        </div>
        <ShareButton
          message={`Dewasa Ayu — ${cer.label}, ${formatID(date)}: ${v.word} (${pct}/100)`}
        />
      </div>

      <div className="hero-scorerow">
        <div className="hero-score" aria-label={`Skor ${pct} dari 100`}>
          {pct}
          <sup>/100</sup>
        </div>
        <div className="hero-side">
          <div className="hero-verdict" id="verdict-h">
            {v.word}
          </div>
          <div className="hero-sub">{v.sub}</div>
          <div className="hero-bar" role="img" aria-label={`${pct} dari 100`}>
            <span className="hero-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <p className="hero-summary">{summaryText(ev.rating, cer.forText)}</p>

      <div className="wewaran">
        {wewaran.map(([t, val]) => (
          <span key={t} className="wchip">
            <span className="wchip-t">{t}</span>
            <b>{val}</b>
          </span>
        ))}
      </div>

      <p className="hero-tip">
        Skor adalah tingkat kecocokan menurut pedoman Wariga umum — bersifat <em>estimasi</em>,
        bukan ketentuan mutlak.
      </p>
    </section>
  );
}
