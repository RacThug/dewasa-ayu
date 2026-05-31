import Link from 'next/link';

import { CeremonyNav } from '@/components/ceremony-nav';
import { RecommendForm } from '@/components/recommend-form';
import { ApiError, CEREMONIES, getRecommend, isCeremonyId, type RecommendResult } from '@/lib/api';
import { formatID, todayISO, verdictText } from '@/lib/display';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

interface SearchParams {
  ceremony?: string;
  from?: string;
  count?: string;
}

export default async function Rekomendasi({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';
  const from = sp.from && ISO.test(sp.from) ? sp.from : todayISO();
  const count = Math.min(20, Math.max(1, Number(sp.count) || 5));
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;

  let data: RecommendResult | null = null;
  let errorMessage: string | null = null;
  try {
    data = await getRecommend(from, count, ceremony);
  } catch (e) {
    errorMessage = e instanceof ApiError ? e.message : 'Terjadi kesalahan saat mencari hari baik.';
  }

  const noneFound = data !== null && data.dates.length === 0;
  const partial = data !== null && data.capReached && data.dates.length > 0;

  return (
    <>
      <CeremonyNav
        active={ceremony}
        hrefFor={(id) => `/rekomendasi?ceremony=${id}&from=${from}&count=${count}`}
      />

      <section className="ask anim d3" aria-labelledby="reco-h">
        <p className="eyebrow">Berdasarkan pedoman Wariga umum</p>
        <h1 id="reco-h">
          Hari baik terdekat
          <br />
          untuk <span className="pick">{cer.forText}</span>
        </h1>
        <RecommendForm ceremony={ceremony} from={from} count={count} />
      </section>

      {errorMessage && <p className="state-note">{errorMessage}</p>}

      {noneFound && (
        <p className="state-note">
          Tidak ditemukan hari ayu dalam 365 hari ke depan untuk {cer.forText}.
        </p>
      )}

      {data && data.dates.length > 0 && (
        <>
          {partial && (
            <p className="note" style={{ marginBottom: 'var(--s4)' }}>
              Hanya ditemukan {data.dates.length} hari ayu dari {count} yang diminta dalam setahun
              ke depan.
            </p>
          )}
          <ol className="reco-list anim d4">
            {data.dates.map((d) => (
              <li key={d.date}>
                <Link
                  href={`/?ceremony=${ceremony}&date=${d.date.slice(0, 10)}`}
                  className="reco-card"
                >
                  <span className="reco-date">{formatID(d.date)}</span>
                  <span className={`reco-verdict v-${d.evaluation.rating}`}>
                    {verdictText(d.evaluation.rating)}
                  </span>
                  <span className="reco-score">
                    {Math.round(d.evaluation.pct)}
                    <sup>%</sup>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
}
