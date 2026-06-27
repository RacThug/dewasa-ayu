import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CeremonyNav } from '@/components/ceremony-nav';
import { CEREMONIES, isCeremonyId } from '@/lib/api';
import { DividerOrnament, SealIcon } from '@/lib/icons';

/** Short, general, sourceable definitions (approved copy) — no specific Wariga rules. */
const INFO: Record<string, { lead: string; body: string }> = {
  pawiwahan: {
    lead: 'Upacara pernikahan.',
    body: 'Dalam tradisi Bali, memilih hari yang baik untuk pawiwahan dipandang penting bagi perjalanan rumah tangga.',
  },
  manusa_yadnya: {
    lead: 'Upacara daur hidup manusia.',
    body: 'Rangkaian upacara sepanjang kehidupan — misalnya kelahiran hingga mepandes (potong gigi). Bagian dari Panca Yadnya.',
  },
  dewa_yadnya: {
    lead: 'Persembahan kepada Ida Sang Hyang Widhi.',
    body: 'Upacara persembahan kepada Tuhan dan para dewa — misalnya piodalan di pura. Bagian dari Panca Yadnya.',
  },
  pitra_yadnya: {
    lead: 'Upacara untuk leluhur.',
    body: 'Upacara bagi para leluhur, termasuk ngaben. Bagian dari Panca Yadnya.',
  },
  pembangunan: {
    lead: 'Memulai membangun.',
    body: 'Awal membangun — misalnya rumah — kerap mempertimbangkan hari yang baik dalam tradisi.',
  },
  usaha: {
    lead: 'Memulai usaha.',
    body: 'Memulai usaha atau berdagang; hari yang baik dipandang sebagai awal yang baik.',
  },
};

export const dynamicParams = false;

export function generateStaticParams(): { ceremony: string }[] {
  return CEREMONIES.map((c) => ({ ceremony: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ceremony: string }>;
}): Promise<Metadata> {
  const { ceremony } = await params;
  const cer = CEREMONIES.find((c) => c.id === ceremony);
  if (!cer) return {};
  const info = INFO[cer.id]!;
  return {
    title: `Hari baik untuk ${cer.label}`,
    description: `${info.lead} ${info.body} Cek hari baik (dewasa ayu) berdasarkan pedoman Wariga umum.`,
    alternates: { canonical: `/upacara/${cer.id}` },
  };
}

export default async function Upacara({ params }: { params: Promise<{ ceremony: string }> }) {
  const { ceremony } = await params;
  if (!isCeremonyId(ceremony)) notFound();
  const cer = CEREMONIES.find((c) => c.id === ceremony)!;
  const info = INFO[ceremony]!;

  return (
    <>
      <CeremonyNav active={ceremony} hrefFor={(id) => `/upacara/${id}`} />

      <section className="ask anim d2" aria-labelledby="up-h">
        <p className="eyebrow">Upacara</p>
        <h1 id="up-h">
          Hari baik untuk <span className="pick">{cer.label}</span>
        </h1>
      </section>

      <article className="about anim d3">
        <p className="about-lead drop-cap">
          {info.lead} {info.body}
        </p>

        <section className="about-section" aria-labelledby="cara-h">
          <h2 className="col-head" id="cara-h">
            Cara aplikasi menilainya
          </h2>
          <p>
            Untuk {cer.forText}, aplikasi menimbang unsur kalender Bali — <em>wuku</em>, hari
            pasaran (<em>Saptawara</em>/<em>Pancawara</em>), <em>Sasih</em>, serta padewasan yang
            relevan — dengan bobot yang berbeda tiap upacara, lalu menyajikan skor + penjelasan tiap
            faktor.
          </p>
          <p>
            Hasil ini bersifat <strong>estimasi berdasarkan pedoman Wariga umum</strong>. Rincian
            untuk tanggal tertentu muncul saat kamu mengeceknya langsung — bukan klaim tetap di
            halaman ini.
          </p>
        </section>

        <DividerOrnament />

        <section className="inscription about-note" aria-labelledby="penting-h">
          <span className="hole" aria-hidden="true" />
          <div className="insc-top">
            <SealIcon className="insc-glyph" />
            <h2 className="about-note-head" id="penting-h">
              Rujukan, bukan pengganti
            </h2>
          </div>
          <p>
            Perhitungan ini <strong>berdasarkan pedoman Wariga umum</strong> dan{' '}
            <strong>tidak menggantikan konsultasi Sulinggih atau Pemangku</strong>. Tradisi memiliki
            variasi regional; keputusan tetap di tanganmu, idealnya bersama yang dituakan.
          </p>
        </section>

        <div className="up-cta">
          <Link className="periksa" href={`/?ceremony=${cer.id}`}>
            Cek Hari
          </Link>
          <Link className="up-link" href={`/?ceremony=${cer.id}&scrollTo=kalender`}>
            Lihat kalender
          </Link>
          <Link className="up-link" href={`/?ceremony=${cer.id}&scrollTo=rekomendasi`}>
            Cari hari baik
          </Link>
        </div>
      </article>
    </>
  );
}
