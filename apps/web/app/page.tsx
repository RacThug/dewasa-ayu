import type { Metadata } from 'next';
import Link from 'next/link';

import { DateControls } from '@/components/date-controls';
import { ScrollOnLoad } from '@/components/scroll-on-load';
import { ShareButton } from '@/components/share-button';
import {
  ApiError,
  CEREMONIES,
  checkDate,
  type CheckResult,
  getMonth,
  getRecommend,
  isCeremonyId,
  type MonthResult,
  type RecommendResult,
} from '@/lib/api';
import { cap, factorRows, formatID, monthLabel, SENJA_VERDICT, todayISO } from '@/lib/display';
import { CeremonyIcon, CheckIcon, CrossIcon } from '@/lib/icons';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const VIEW = /^\d{4}-\d{2}$/;
const HEADS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// Full months the engine's Sasih table covers (Jan 2003 is partial → start Feb).
const CAL_MIN = { y: 2003, m: 2 };
const CAL_MAX = { y: 2100, m: 12 };

const clampMonth = (y: number, m: number): { y: number; m: number } => {
  if (y < CAL_MIN.y || (y === CAL_MIN.y && m < CAL_MIN.m)) return { ...CAL_MIN };
  if (y > CAL_MAX.y || (y === CAL_MAX.y && m > CAL_MAX.m)) return { ...CAL_MAX };
  return { y, m };
};

const gregWeekday = (iso: string): string =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone: 'UTC' }).format(new Date(iso));

interface SearchParams {
  ceremony?: string;
  date?: string;
  view?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;
  return {
    title: { absolute: `Cek hari baik ${cer.label} — Dewasa Ayu` },
    description: `Apakah hari baik untuk ${cer.forText}? Cek dewasa ayu berdasarkan pedoman Wariga umum — verdict, kalender bulanan, dan hari baik terdekat dalam satu halaman.`,
    alternates: { canonical: '/' },
  };
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const ceremony = sp.ceremony && isCeremonyId(sp.ceremony) ? sp.ceremony : 'pawiwahan';
  const date = sp.date && ISO.test(sp.date) ? sp.date : todayISO();
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;

  // Calendar view: explicit `view`, else the selected date's month, clamped to range.
  const rawView = sp.view && VIEW.test(sp.view) ? sp.view : date.slice(0, 7);
  const [vy, vm] = rawView.split('-').map(Number);
  const { y: viewY, m: viewM } = clampMonth(vy!, vm!);
  const view = `${viewY}-${String(viewM).padStart(2, '0')}`;

  const hrefFor = (id: string): string => `/?ceremony=${id}&date=${date}&view=${view}`;

  const [checkR, monthR, recoR] = await Promise.allSettled([
    checkDate(date, ceremony),
    getMonth(viewY, viewM, ceremony),
    getRecommend(date, 5, ceremony),
  ]);

  const errOf = (e: unknown): string =>
    e instanceof ApiError ? e.message : 'Terjadi kesalahan pada layanan.';

  return (
    <>
      <ScrollOnLoad />
      <DateControls ceremony={ceremony} date={date} />

      <nav className="chips anim d2" aria-label="Pilih jenis upacara">
        {CEREMONIES.map((c) => (
          <Link
            key={c.id}
            href={hrefFor(c.id)}
            className={`chip${c.id === ceremony ? ' is-active' : ''}`}
            aria-current={c.id === ceremony ? 'page' : undefined}
          >
            <CeremonyIcon id={c.id} className="chip-icon" />
            {c.label}
          </Link>
        ))}
      </nav>

      <div className="app-grid anim d3">
        <div className="app-col">
          {checkR.status === 'fulfilled' ? (
            <Hero result={checkR.value} cer={cer} date={date} />
          ) : (
            <section className="panel-card state-card">{errOf(checkR.reason)}</section>
          )}

          <div className="sub-grid">
            {checkR.status === 'fulfilled' ? (
              <>
                <Rincian result={checkR.value} />
                <Padewasan result={checkR.value} />
              </>
            ) : null}
          </div>
        </div>

        <div className="app-col">
          <section id="kalender" className="panel-card cal-card" aria-label="Kalender bulanan">
            <CalNav ceremony={ceremony} date={date} viewY={viewY} viewM={viewM} />
            {monthR.status === 'fulfilled' ? (
              <MiniCalendar month={monthR.value} ceremony={ceremony} selected={date} />
            ) : (
              <p className="state-card">{errOf(monthR.reason)}</p>
            )}
            <CalLegend />
          </section>

          <section id="rekomendasi" aria-labelledby="reco-h">
            <h2 className="card-title" id="reco-h">
              Hari baik terdekat{ceremony !== 'pawiwahan' ? ` · ${cer.label}` : ''}
            </h2>
            {recoR.status === 'fulfilled' ? (
              <Reco data={recoR.value} ceremony={ceremony} cer={cer} />
            ) : (
              <p className="state-card">{errOf(recoR.reason)}</p>
            )}
          </section>
        </div>
      </div>

      <AboutCard />
    </>
  );
}

function summaryText(rating: string, forText: string): string {
  if (rating === 'ayu') return `Hari yang baik menurut pedoman Wariga umum untuk ${forText}.`;
  if (rating === 'caution')
    return `Cukup baik dengan catatan — pertimbangkan, dan bila perlu konsultasikan terlebih dahulu.`;
  return `Sebaiknya dihindari untuk ${forText}; pertimbangkan memilih tanggal lain.`;
}

function Hero({
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

function Rincian({ result }: { result: CheckResult }) {
  const rows = factorRows(result.evaluation.checks, result.info);
  return (
    <div className="panel-card rules-card">
      <h2 className="card-title">Rincian Wariga</h2>
      <ul className="rules">
        {rows.map((r) => (
          <li key={r.name} className="rule">
            <span className={`rule-badge ${r.passed ? 'pass' : 'fail'}`} aria-hidden="true">
              {r.passed ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span className="rule-text">
              <span className="rule-name">{r.name}</span>
              <span className="rule-why">{r.why}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Padewasan({ result }: { result: CheckResult }) {
  const { dewasaAyu, dewasaAla } = result.evaluation;
  const none = dewasaAyu.length === 0 && dewasaAla.length === 0;

  return (
    <div className="panel-card tags-card">
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

function CalNav({
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

function MiniCalendar({
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

function CalLegend() {
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

function Reco({
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

function AboutCard() {
  return (
    <section className="about-card" aria-labelledby="about-card-h">
      <div className="about-card-col">
        <h2 className="card-title" id="about-card-h">
          Tentang Wariga
        </h2>
        <p>
          Perhitungan berdasarkan pedoman <b>Wariga umum</b> — gabungan Saptawara, Pancawara,
          Triwara, dan Wuku, disesuaikan dengan jenis upacara yang dipilih. Hasil bersifat rujukan,
          bukan ketentuan mutlak.
        </p>
      </div>
      <div className="about-card-col">
        <h2 className="card-title">Catatan</h2>
        <p>
          Untuk upacara penting, tetap disarankan berkonsultasi dengan <em>Sulinggih</em> atau{' '}
          <em>Pemangku</em> setempat. Perhitungan <em>Sasih</em> bersifat estimasi dan dapat berbeda
          dengan variasi tradisi regional. <Link href="/about">Selengkapnya →</Link>
        </p>
      </div>
    </section>
  );
}
