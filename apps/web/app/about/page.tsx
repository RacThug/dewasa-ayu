import type { Metadata } from 'next';
import Link from 'next/link';

import { DividerOrnament, SealIcon } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Tentang',
  description:
    'Apa itu Dewasa Ayu, cara kerjanya, dan posisinya sebagai rujukan berdasarkan pedoman Wariga umum — bukan pengganti konsultasi Sulinggih atau Pemangku.',
  // Every other page the sitemap submits declares one; without it Search Console
  // reports this URL as having no user-declared canonical.
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <>
      <section className="ask anim d2" aria-labelledby="about-h">
        <p className="eyebrow">Tentang Dewasa Ayu</p>
        <h1 id="about-h">
          Membaca <span className="pick">Wariga</span>,
          <br />
          tanpa harus menghitung sendiri.
        </h1>
      </section>

      <article className="about anim d3">
        <p className="about-lead">
          Dewasa Ayu membantu menemukan <em>hari baik</em> untuk enam jenis keperluan penting umat
          Hindu Bali — berdasarkan <strong>pedoman Wariga umum</strong>. Cukup masukkan tanggal
          Masehi; perhitungan kalender Bali yang rumit, biar aplikasi yang kerjakan.
        </p>

        <section className="about-section" aria-labelledby="apa-h">
          <h2 className="col-head" id="apa-h">
            Apa itu <em>dewasa ayu</em>?
          </h2>
          <p>
            Dalam tradisi Bali, <em>dewasa ayu</em> adalah hari yang dipandang baik untuk memulai
            hal penting — pernikahan, upacara, membangun rumah, hingga membuka usaha. Penentuannya
            membaca <em>Wariga</em>: susunan hari dalam penanggalan tradisional Bali (wuku, wewaran,
            sasih, dan lainnya).
          </p>
          <p>
            Aplikasi ini menyajikannya sebagai <strong>rujukan yang mudah dibaca</strong> — bukan
            penentu, dan bukan otoritas keagamaan.
          </p>
        </section>

        <DividerOrnament />

        <section className="about-section" aria-labelledby="cara-h">
          <h2 className="col-head" id="cara-h">
            Cara kerja <span className="n">3 langkah</span>
          </h2>
          <ol className="analysis about-steps">
            <li>
              <span className="idx" aria-hidden="true" />
              <span>
                <span className="name">Tanggal Masehi → tanggal Bali</span>
                <span className="why">
                  Dari satu tanggal, aplikasi menyusun unsur kalender Bali: Wuku, Saptawara,
                  Pancawara, Sasih, hingga Ingkel &amp; Jejepan.
                </span>
              </span>
            </li>
            <li>
              <span className="idx" aria-hidden="true" />
              <span>
                <span className="name">Menimbang per upacara</span>
                <span className="why">
                  Tiap jenis upacara punya faktor berbeda — wuku yang dihindari, sasih yang
                  disarankan, hari pasaran, dan padewasan terkait.
                </span>
              </span>
            </li>
            <li>
              <span className="idx" aria-hidden="true" />
              <span>
                <span className="name">Skor &amp; ringkasan</span>
                <span className="why">
                  Hasilnya berupa skor dan penjelasan tiap faktor — ditampilkan terbuka, supaya kamu
                  bisa menimbang sendiri.
                </span>
              </span>
            </li>
          </ol>
        </section>

        <section className="about-section" aria-labelledby="baca-h">
          <h2 className="col-head" id="baca-h">
            Cara membaca hasil
          </h2>
          <p>
            Hasil ditampilkan dalam tiga tingkat: <span className="v-ayu">Ayu</span> (disarankan),{' '}
            <span className="v-caution">Madya</span> (perlu pertimbangan), dan{' '}
            <span className="v-bad">Ala</span> (sebaiknya dihindari) — mengikuti penanda ●, ◐, dan ✕
            pada kalender.
          </p>
          <p>
            Angka skor hanyalah ringkasan dari faktor-faktor di bawahnya — yang selalu kami
            tampilkan terbuka, lengkap dengan padewasan yang terdeteksi. Karena perhitungan Sasih
            bersifat <strong>estimasi</strong>, anggap hasilnya titik awal, bukan kata akhir.
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
            Perhitungan ini <strong>berdasarkan pedoman Wariga umum</strong>, dan{' '}
            <strong>tidak menggantikan konsultasi Sulinggih atau Pemangku</strong> yang memahami
            konteks keluarga, desa, dan tradisi setempat.
          </p>
          <p>
            Tradisi Wariga punya banyak variasi regional; perhitungan Sasih bersifat estimasi dan
            dapat berbeda. Dewasa Ayu <strong>tidak berafiliasi dengan PHDI</strong> atau lembaga
            keagamaan mana pun. Kami memakai kata <em>disarankan</em> dan <em>dihindari</em> — bukan
            larangan. Keputusan tetap di tanganmu, idealnya bersama yang dituakan.
          </p>
        </section>

        <section className="about-section" aria-labelledby="sumber-h">
          <h2 className="col-head" id="sumber-h">
            Sumber &amp; catatan
          </h2>
          <p className="about-source">
            Perhitungan kalender mengacu pada kaidah Wariga yang umum dijumpai dalam kalender Bali
            cetak. Materi edukasi yang lebih dalam akan ditambahkan secara bertahap, dengan rujukan
            sumber dan — bila memungkinkan — tinjauan pihak yang berkompeten. Kami memilih untuk
            tidak mengarang.
          </p>
        </section>

        <div className="about-cta">
          <Link className="periksa" href="/">
            Cek Hari
          </Link>
        </div>
      </article>
    </>
  );
}
