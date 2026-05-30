import { CeremonyNav } from '@/components/ceremony-nav';
import { DateField } from '@/components/date-field';
import { Share } from '@/components/share';
import { ApiError, CEREMONIES, checkDate, type CheckResult, isCeremonyId } from '@/lib/api';
import { factorRows, formatID, sasihLabel, todayISO, VERDICT } from '@/lib/display';
import { CheckIcon, CrossIcon, DividerOrnament, VerdictGlyph } from '@/lib/icons';

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

interface SearchParams {
  ceremony?: string;
  date?: string;
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';
  const date = sp.date && ISO.test(sp.date) ? sp.date : todayISO();
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;

  let result: CheckResult | null = null;
  let errorMessage: string | null = null;
  try {
    result = await checkDate(date, ceremony);
  } catch (e) {
    errorMessage = e instanceof ApiError ? e.message : 'Terjadi kesalahan saat memeriksa tanggal.';
  }

  return (
    <>
      <CeremonyNav active={ceremony} date={date} />

      <section className="ask anim d3" aria-labelledby="ask-h">
        <p className="eyebrow">Berdasarkan pedoman Wariga umum</p>
        <h1 id="ask-h">
          Apakah <span className="pick">hari baik</span>
          <br />
          untuk {cer.forText}?
        </h1>
        <DateField ceremony={ceremony} date={date} />
      </section>

      {errorMessage && <p className="state-note">{errorMessage}</p>}
      {result && <Verdict result={result} forText={cer.forText} />}

      <DividerOrnament />

      <Share
        message={
          result
            ? `Dewasa Ayu — ${cer.label}, ${formatID(date)}: ${VERDICT[result.evaluation.rating].lead} ${VERDICT[result.evaluation.rating].emph} (${result.evaluation.pct}%)`
            : `Dewasa Ayu — ${cer.label}, ${formatID(date)}`
        }
      />
    </>
  );
}

function Verdict({ result, forText }: { result: CheckResult; forText: string }) {
  const { info, evaluation: ev, date } = result;
  const v = VERDICT[ev.rating];
  const pct = Math.round(ev.pct);
  const meterClass =
    ev.rating === 'caution' ? 'meter is-caution' : ev.rating === 'bad' ? 'meter is-bad' : 'meter';

  const dewasa = [...ev.dewasaAyu, ...ev.dewasaAla];

  return (
    <>
      <section className="inscription anim d4" aria-labelledby="verdict-h">
        <span className="hole" aria-hidden="true" />
        <div className="insc-top">
          <VerdictGlyph className="insc-glyph" />
          <h2 className={`verdict ${v.cls}`} id="verdict-h">
            {v.lead} <b>{v.emph}</b>
          </h2>
        </div>
        <p className="insc-sub">
          {v.sub} <em>{forText}</em> &nbsp;·&nbsp; {formatID(date)}
        </p>

        <div className="scorewrap">
          <div className="score" aria-label={`Skor ${pct} persen`}>
            {pct}
            <sup>%</sup>
          </div>
          <div className="score-side">
            <p className="label">Skor berbobot</p>
            <div className={meterClass} role="img" aria-label={`${pct} dari 100`}>
              <span className="fill" style={{ width: `${pct}%` }} />
              <span className="pin" style={{ left: `${pct}%` }} />
            </div>
            <div className="meter-scale">
              <span>Kurang ideal</span>
              <span>Dewasa ayu</span>
            </div>
          </div>
        </div>
      </section>

      <div className="breakdown">
        <section className="anim d5" aria-labelledby="bali-h">
          <h3 className="col-head" id="bali-h">
            Tanggal <em>Bali</em> <span className="n">12 unsur</span>
          </h3>
          <dl className="pawukon">
            <Row t="Wuku" v={cap(info.wuku)} />
            <Row t="Saptawara" v={cap(info.saptawara)} />
            <Row t="Pancawara" v={cap(info.pancawara)} />
            <Row t="Triwara" v={cap(info.triwara)} />
            <Row t="Sadwara" v={cap(info.sadwara)} />
            <Row
              t="Sangawara"
              v={cap(info.sangawara)}
              hl={info.sangawara === 'tulus' || info.sangawara === 'dadi'}
            />
            <Row t="Astawara" v={cap(info.astawara)} />
            <Row t="Dasawara" v={cap(info.dasawara)} />
            <Row t="Sasih" v={sasihLabel(info)} />
            <Row t="Ingkel" v={cap(info.ingkel)} />
            <Row t="Jejepan" v={cap(info.jejepan)} />
            <Row t="Urip" v={String(info.totalUrip)} />
          </dl>
        </section>

        <section className="anim d5" aria-labelledby="an-h">
          <h3 className="col-head" id="an-h">
            Analisis <span className="n">{factorRows(ev.checks, info).length} faktor</span>
          </h3>
          <ol className="analysis">
            {factorRows(ev.checks, info).map((f) => (
              <li key={f.name}>
                <span className="idx" aria-hidden="true" />
                <span>
                  <span className="name">{f.name}</span>
                  <span className="why">{f.why}</span>
                </span>
                <span className={`mark ${f.passed ? 'pass' : 'fail'}`}>
                  {f.passed ? <CheckIcon /> : <CrossIcon />}
                  {f.passed ? 'Lulus' : 'Tidak'}
                </span>
              </li>
            ))}
          </ol>

          {dewasa.length > 0 && (
            <>
              <h3 className="col-head" id="dw-h" style={{ marginTop: 'var(--s5)' }}>
                Padewasan <em>aktif</em> <span className="n">{dewasa.length} terdeteksi</span>
              </h3>
              <div className="tags">
                {dewasa.map((d) => (
                  <span key={d.id} className={`tag ${d.type}`} title={d.note}>
                    {d.type === 'ayu' ? <CheckIcon /> : <CrossIcon />}
                    {d.name}
                  </span>
                ))}
              </div>
            </>
          )}

          <p className="note">
            {ev.dewasaAla.length === 0
              ? `Tidak ditemukan pantangan kuat untuk ${forText} pada tanggal ini.`
              : `Terdapat ${ev.dewasaAla.length} pantangan — hasil ini estimasi; pertimbangkan untuk berkonsultasi dengan Sulinggih.`}
          </p>
        </section>
      </div>
    </>
  );
}

function Row({ t, v, hl }: { t: string; v: string; hl?: boolean }) {
  return (
    <div>
      <dt className="t">{t}</dt>
      <dd className={hl ? 'v hl' : 'v'}>{v}</dd>
    </div>
  );
}
