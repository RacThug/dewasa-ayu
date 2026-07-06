import Link from 'next/link';

export function AboutCard() {
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
