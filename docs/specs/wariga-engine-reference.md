# Wariga & Dewasa Ayu — Engine Reference

> **Tujuan dokumen:** knowledge base terolah untuk dijadikan context Claude Code saat develop platform Dewasa Ayu. Bukan tutorial budaya — ini spesifikasi domain agar engine perhitungan akurat & framing kulturalnya benar.

---

## 0. Hierarki sumber kebenaran (BACA DULU — paling penting)

Ada **dua jenis "source of truth"**, dan **keduanya BUKAN library `balinese-date-js-lib`.** Library itu implementasi sekunder — README-nya sendiri menyebut sumbernya buku (_Pokok-Pokok Wariga_) + babadbali.com. Kalau lib dijadikan acuan, kamu cuma mereproduksi tafsir orang lain atas buku, lengkap dengan kemungkinan salahnya.

| Tingkat                             | Sumber                                                                                 | Perannya                                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **1. Ground truth output**          | **Kalender Bali cetak yang dipedomani PHDI** (Bangbang Gde Rawi / Marayana / Wikarman) | Jawaban benar yang WAJIB direproduksi engine. Dipakai sebagai fixture golden test.            |
| **2. Kebenaran algoritma & aturan** | **Buku otoritatif** (lihat §12)                                                        | Cara hitung (epoch, pengalantaka, nampih sasih) + kondisi padewasan dewasa ayu.               |
| **3. Cross-check / debugging**      | `balinese-date-js-lib`, babadbali.com, kalenderbali.org                                | "Pendapat kedua" saat porting buntu. Begitu beda dengan tingkat 1–2, yang menang tingkat 1–2. |

**Kenapa berjangkar ke PHDI/Rawi, bukan lontar lain?** Bukan karena lebih "benar" secara metafisik — lontar berbeda (Aji Swamandala, Catur Winasa Sari, BELOG) bisa beda tipis urip/kondisinya. Tapi karena **itu yang dipedomani komunitas penggunamu**. Benar-salahnya aplikasi ditentukan secara sosial: kalau output beda dari kalender yang nempel di tembok rumah user, kamu "salah" di mata mereka. **Kunci satu tradisi, konsisten, dokumentasikan pilihannya.** Rekomendasi: jangkar utama = **kalender Rawi**, Marayana & Wikarman untuk cross-check.

**Keputusan implementasi (opsi 3 — port/rewrite):** kalkulasi kalender ditulis sendiri (`packages/wariga-core`), pakai buku sebagai acuan algoritma & kalender cetak sebagai ground truth. Library lama dipakai sebagai _oracle_ untuk men-generate fixture & spot-check, **bukan** sebagai dependency produksi. Lihat §10.

**Framing UI:** hindari kesan "menghakimi" hari. Konsensus penyusun kalender: _tidak ada hari yang buruk, hanya ada waktu yang lebih/kurang tepat._ Output sebaiknya "selaras / kurang selaras / perlu pamarisuda", bukan "hari sial".

---

## 1. Konsep inti

- **Padewasan / Dewasa** = ilmu menentukan hari baik (hari pilihan).
- **Dewasa Ayu** = hari yang baik untuk melaksanakan suatu aktivitas tertentu. (`Ala` = buruk, `Ayu` = baik → `Ala Ayuning Dewasa` = baik-buruknya suatu hari.)
- Dasar perhitungan = **Wariga** (sistem astronomi-numerologi tradisional Bali). Setiap satuan waktu punya **urip** (neptu / nilai hidup, berupa angka) dan **dewata** penguasa.
- Penggunaan paling umum: kegiatan **Panca Yadnya** (Dewa, Pitra, Rsi, Manusa, Bhuta Yadnya), tapi meluas ke pertanian, membangun, usaha, dll.

**Catatan penting (escape hatch budaya):** Sejelek apa pun padewasan, selama tidak melanggar ketentuan baku sastra agama, ala-nya bisa di-_ruwat_ dengan banten **Pamarisuda Mala Dewasa** dan disaksikan **Sang Hyang Triodasa Saksi** (13 dewa saksi). Jadi "dewasa ala" bukan blokir mutlak — bisa jadi badge "perlu pamarisuda" di UI, bukan disable hard.

---

## 2. Tiga sistem kalender yang digabung

| Sistem                 | Basis                                    | Siklus                          | Peran di engine                                                      |
| ---------------------- | ---------------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| **Gregorian (Masehi)** | Solar                                    | 365/366 hari                    | Input user & display                                                 |
| **Pawukon**            | Numerik (asli Nusantara, non-astronomis) | **210 hari** = 30 wuku × 7 hari | Sumber wewaran & wuku → mayoritas rule dewasa                        |
| **Saka Bali**          | Lunisolar                                | ~354–355 hari, 12 sasih         | Sumber sasih & penanggal/panglong; menentukan sasih ayu (mis. nikah) |

Kalender Bali cetak = gabungan ketiganya.

---

## 3. Wewaran (siklus hari berlapis)

Wewaran = siklus hari paralel dengan panjang 1–10. Tiap anggota punya **urip**. Yang paling sering dipakai untuk dewasa: **Saptawara, Pancawara, Sadwara, Triwara**, plus kombinasi Pancawara+Saptawara (untuk dewasa ala seperti Semut Sadulur / Kala Gotongan).

> ⚠️ **Akurasi urip:** beberapa lontar/tradisi memberi urip & dewata yang sedikit berbeda. Tabel di bawah = versi paling umum dipakai kalender cetak (untuk orientasi awal). **Nilai final WAJIB diverifikasi terhadap buku acuan (Pokok-Pokok Wariga) + kalender cetak Rawi**, baru hardcode. Lib lama boleh jadi cross-check ketiga, bukan penentu.

### 3.1 Eka Wara (1)

| Anggota | Urip | Aturan                                                                           |
| ------- | ---- | -------------------------------------------------------------------------------- |
| Luang   | 1    | Ada bila (urip Pancawara + urip Saptawara) = **ganjil**. Bila genap → tidak ada. |

### 3.2 Dwi Wara (2)

| Anggota | Urip | Makna                         |
| ------- | ---- | ----------------------------- |
| Menga   | 5    | terbuka (jumlah urip genap)   |
| Pepet   | 4    | tertutup (jumlah urip ganjil) |

### 3.3 Tri Wara (3)

| Anggota           | Urip | Makna             |
| ----------------- | ---- | ----------------- |
| Pasah (Dora)      | 9    | memisahkan        |
| Beteng (Waya)     | 4    | mempertemukan     |
| Kajeng (Biantara) | 7    | kekuatan / wasiat |

### 3.4 Catur Wara (4)

| Anggota | Urip | Makna             |
| ------- | ---- | ----------------- |
| Sri     | 6    | makmur            |
| Laba    | 5    | pemberian/imbalan |
| Jaya    | 1    | unggul            |
| Menala  | 8    | sekitar daerah    |

### 3.5 Panca Wara (5) — _sangat dipakai_

| Anggota        | Urip | Makna            |
| -------------- | ---- | ---------------- |
| Umanis         | 5    | penggerak        |
| Pahing (Paing) | 9    | pencipta         |
| Pon            | 7    | penguasa         |
| Wage           | 4    | pemelihara       |
| Kliwon         | 8    | pelebur/pemusnah |

### 3.6 Sad Wara (6)

| Anggota | Urip | Makna     |
| ------- | ---- | --------- |
| Tungleh | 7    | tak kekal |
| Aryang  | 6    | kurus     |
| Urukung | 5    | punah     |
| Paniron | 8    | gemuk     |
| Was     | 9    | kuat      |
| Maulu   | 3    | membiak   |

### 3.7 Sapta Wara (7) — _sangat dipakai_

| Anggota   | Hari   | Urip | Bilangan |
| --------- | ------ | ---- | -------- |
| Redite    | Minggu | 5    | 0        |
| Soma      | Senin  | 4    | 1        |
| Anggara   | Selasa | 3    | 2        |
| Budha     | Rabu   | 7    | 3        |
| Wraspati  | Kamis  | 8    | 4        |
| Sukra     | Jumat  | 6    | 5        |
| Saniscara | Sabtu  | 9    | 6        |

> Sifat saptawara untuk dewasa (umum): Soma, Budha, Sukra dianggap relatif baik; Redite (panas/amarah), Anggara (percekcokan), Saniscara (kegagalan) dianggap kurang baik untuk sebagian aktivitas. **Selalu kalah oleh lapisan di atasnya (lihat §7).**

### 3.8 Asta Wara (8), Sanga Wara (9), Dasa Wara (10)

Anggota (verifikasi urip & dewata dari buku acuan; jangan kunci angka dari lib):

- **Asta Wara:** Sri, Indra, Guru, Yama, Ludra, Brahma, Kala, Uma.
- **Sanga Wara:** Dangu, Jangur, Gigis, Nohan, Ogan, Erangan, Urungan, Tulus, Dadi. _(Tulus & Dadi dianggap paling baik.)_
- **Dasa Wara:** Pandita, Pati, Suka, Duka, Sri, Manuh, Manusa, Raja, Dewa, Raksasa.

---

## 4. Wuku (30 minggu Pawukon)

Siklus 30 wuku × 7 hari = 210 hari. Tiap wuku mulai **Redite (Minggu)** s/d **Saniscara (Sabtu)**. Tiap wuku punya **urip**.

| #   | Wuku        | Urip | #   | Wuku         | Urip |
| --- | ----------- | ---- | --- | ------------ | ---- |
| 1   | Sinta       | 7    | 16  | Pahang       | 3    |
| 2   | Landep      | 1    | 17  | Krulut       | 7    |
| 3   | Ukir        | 4    | 18  | Merakih      | 1    |
| 4   | Kulantir    | 6    | 19  | Tambir       | 4    |
| 5   | Tolu        | 5    | 20  | Medangkungan | 6    |
| 6   | Gumbreg     | 8    | 21  | Matal        | 5    |
| 7   | Wariga      | 9    | 22  | Uye          | 8    |
| 8   | Warigadean  | 3    | 23  | Menail       | 9    |
| 9   | Julungwangi | 7    | 24  | Prangbakat   | 3    |
| 10  | Sungsang    | 1    | 25  | Bala         | 7    |
| 11  | Dungulan    | 4    | 26  | Ugu          | 1    |
| 12  | Kuningan    | 6    | 27  | Wayang       | 4    |
| 13  | Langkir     | 5    | 28  | Kelawu       | 6    |
| 14  | Medangsia   | 8    | 29  | Dukut        | 5    |
| 15  | Pujut       | 9    | 30  | Watugunung   | 8    |

Hari raya yang ditentukan dari wuku (validasi cross-check): **Galungan** = Budha Kliwon Dungulan; **Kuningan** = Saniscara Kliwon Kuningan; **Saraswati** = Saniscara Umanis Watugunung.

---

## 5. Pananggal / Panglong & Sasih (sisi Saka)

- **Penanggal** = paroh terang, 15 hari **setelah Tilem** (bulan mati) menuju Purnama. Bernomor 1–15.
- **Panglong** = paroh gelap, 15 hari **setelah Purnama** menuju Tilem. Bernomor 1–15. (Panglong umumnya dianggap kurang baik karena bulan menyusut.)
- **Sasih** = 12 bulan Saka: Kasa, Karo, Katiga, Kapat, Kalima, Kanem, Kapitu, Kawalu, Kasanga, Kadasa, Jyestha (Destha), Sadha.
  - Sasih dianggap baik untuk **menikah**: **Kapat, Kalima, Kadasa**.
- **Pengalantaka** = sistem penyesuaian agar penanggalan candra tetap sinkron; umur sasih bisa 30 atau 29 hari. Penyesuaian tiap 9 wuku (63 hari) pada wuku Sungsang, Tambir, Kulawu, Wariga, Pahang, Bala.

### Patokan epoch & era (institusional PHDI — wajib akurat saat port)

- **Epoch pengalantaka:** sejak tahun 2000 memakai **Eka Sungsang ke Paing** (sebelumnya Pon). Ditetapkan **Paruman Sulinggih PHDI Besakih, 25 Juli 1998**.
- **Nampih/Penampih Sasih:** berlaku via Mahasabha PHDI Pusat 1991, lalu **dinyatakan tidak berlaku via Sabha Pandita PHDI Bali, 18 September 2001**. Aturan berbeda per era → implementasikan bercabang: malamasa (<1993), kesinambungan (1993–2002), nampih sasih (≥2003).
- **Diagram pengalantaka I Gede Marayana** = Warisan Budaya Takbenda (2019), berlaku s/d 2079. Artefak komputasi pengalantaka paling otoritatif.

> Ini bagian paling rawan saat menulis sendiri (opsi 3). Kerjakan **per-era**, test **per-era**. Lihat strategi di §10.

---

## 6. Rumus perhitungan wewaran (modulus) — basis implementasi

Karena kalkulasi ditulis sendiri, rumus ini = **dasar implementasimu**, bukan sekadar referensi. Validasi pakai oracle + golden test (§10).

```
bilanganHari = (bilanganWuku × 7) + bilanganSaptawara
   bilanganWuku: Sinta=1 … Watugunung=30
   bilanganSaptawara: Redite=0 … Saniscara=6

TriWara   = bilanganHari mod 3   → 1=Pasah, 2=Beteng, 0=Kajeng
CaturWara = bilanganHari mod 4   → 1=Sri, 2=Laba, 3=Jaya, 0=Menala
PancaWara = bilanganHari mod 5   → 1=Umanis, 2=Pahing, 3=Pon, 4=Wage, 0=Kliwon
SadWara   = bilanganHari mod 6   → 1=Tungleh, 2=Aryang, 3=Urukung, 4=Paniron, 5=Was, 0=Maulu
AstaWara  = bilanganHari mod 8
SangaWara = bilanganHari mod 9
EkaWara   = (uripPanca + uripSapta) ganjil → Luang
DwiWara   = (uripPanca + uripSapta) ganjil → Pepet, genap → Menga
DasaWara  = (uripSapta + uripPanca + 1) mod 10
```

> ⚠️ **Anomali Catur Wara:** dari Redite Sinta s/d Redite Dungulan tambahkan +2 sebelum dibagi; Soma Dungulan +1. Ini karena fenomena _Jaya Tiga_ di wuku Dungulan. **Kasus seperti ini persis kenapa wajib characterization test** — gampang kelewat saat porting.

---

## 7. Hierarki konflik — **Alahing Sasih** (logika resolusi)

Inilah otak engine saat banyak faktor bertabrakan. Aksioma:

```
wewaran  alah dening  wuku
wuku     alah dening  pananggal/panglong
panggal  alah dening  sasih
sasih    alah dening  dauh
dauh     alah dening  Sang Hyang Triodasa Saksi
```

`alah dening` = "dikalahkan oleh". Prioritas (lemah → kuat):

```
wewaran < wuku < penanggal/panglong < sasih < dauh < Triodasa Saksi
```

**Implikasi implementasi:** kalau wewaran bilang "baik" tapi sasih bilang "buruk", **sasih menang**. Jadikan ini _weighting / override order_ di scoring engine, bukan penjumlahan flat:

1. Hitung skor tiap lapisan independen.
2. Terapkan override hierarkis: lapisan lebih tinggi bisa membatalkan/menurunkan verdict lapisan bawah.
3. **Dauh** (pembagian waktu dalam sehari) = lapisan halus untuk rekomendasi jam, opsional di MVP.

---

## 8. Rule layer — padewasan bernama (CORE LOGIC)

**Sumber otoritatif untuk bagian ini = buku _Ala Ayuning Dewasa_ (Ariana & Budayoga, 2016).** Media (Tribun Bali) terbukti mengutip kondisi presisi langsung dari buku ini, jadi kondisi rumusnya bisa diverifikasi hitam-di-atas-putih.

**Catatan tentang library:** `balinese-date-js-lib` TERNYATA menghitung sebagian _primitives_ padewasan — Eka Jala Rsi, Panca Suda, Pararasan, Pawatekan (madya & alit), Lintang, Rakam, Ingkel, bahkan fitur `Dewasa` (v0.5.0). Jadi koreksi dari versi awal dok ini: lib **bukan** "tidak menghitung apa-apa". Tapi yang lib hitung = komponen mentah; yang lib **tidak** hitung = pemetaan "kombinasi → baik/buruk untuk upacara X" + UX + kurasi kultural. Itu tetap kamu yang bangun, dan kondisinya tetap diambil dari **buku**, bukan dari output lib.

**Struktur:** simpan rules sebagai **data** (JSON/DB seed): `{ nama, kondisi, efek, jenis_upacara, sumber: "buku, hal. X", verified: bool }`.

### 8.1 Dewasa Ayu (positif) — daftar nama

`Ayu Nulus`, `Dauh Ayu`, `Ayu Badra`, `Mertha Yoga`, `Mertha Masa`, `Mertha Dewa`, `Mertha Danta`, `Sedana Yoga`, `Subacara`, `Dewa Ngelayang`, `Dewa Ngelampar`.

**Contoh kondisi yang sudah pasti — `Ayu Nulus`** (baik untuk pekerjaan & upacara Panca Yadnya), berbasis Saptawara + Penanggal:

- Redite penanggal 6 · Soma penanggal 3 · Anggara penanggal 7 · Budha penanggal 12 & 13 · Saniscara penanggal 5

> Kondisi presisi Mertha Yoga, Sedana Yoga, dll. → isi dari buku _Ala Ayuning Dewasa_ (2016). Sampai ketemu sumbernya, set `verified: false`. **Jangan mengarang kondisi.**

### 8.2 Dewasa Ala (negatif / pantangan) — yang kondisinya sudah jelas

| Nama                     | Kondisi                                                                                                             | Pantangan                                   | Justru baik untuk                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| **Semut Sadulur**        | (urip Panca + urip Sapta) = **13**, berturut 3×                                                                     | atiwa-tiwa / ngaben                         | membentuk organisasi                                 |
| **Kala / Saat Gotongan** | (urip Panca + urip Sapta) = **14**, berturut 3×                                                                     | atiwa-tiwa / ngaben                         | memulai usaha                                        |
| **Tanpa Guru**           | dalam satu wuku tidak ada "Guru" (Asta Wara)                                                                        | memulai belajar/usaha                       | —                                                    |
| **Was Penganten**        | dalam satu wuku ada dua "Was" (Sad Wara)                                                                            | —                                           | benda tajam (keris/tombak), tembok, pagar, pertemuan |
| **Lebur Awu**            | Saptawara + Astawara: Redite Indra, Soma Uma, Anggara Rudra, Budha Brahma, Wrespati Guru, Sukra Sri, Saniscara Yama | buruk untuk membuat rumah & pemakuhan       | membuat terusan baru sungai                          |
| **Ingkel**               | `bilanganWuku mod 6` → kategori                                                                                     | larangan terhadap kategori terkait (7 hari) | —                                                    |

**Ingkel (kategori pantangan mingguan):** Wong (manusia), Sato (hewan), Mina (ikan), Manuk (burung/unggas), Taru (tumbuhan berkayu), Buku (tumbuhan beruas). Berlaku Redite–Saniscara.

Padewasan ala lain yang ada di buku & perlu didata: `Kala Beser`, `Titi Buwuk`, `Tali Wangke`, `Rangda Tiga`, `Dina Carik`, `Sampar Wangke`, dll.

---

## 9. Pemetaan ke jenis upacara

> Prototipe mendukung 6 jenis upacara — **konfirmasi 6 jenis itu** untuk melengkapi rule per jenis (kondisi diambil dari buku _Ala Ayuning Dewasa_ 2016). Sementara, kerangka umum berbasis Panca Yadnya:

| Yadnya             | Contoh upacara                                              | Faktor dominan                                                                  |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Manusa Yadnya**  | Pawiwahan (nikah), otonan, potong gigi (mepandes)           | Sasih (Kapat/Kalima/Kadasa untuk nikah), penanggal, dewasa ayu khusus pengantin |
| **Pitra Yadnya**   | Ngaben, atiwa-tiwa                                          | **Hindari** Semut Sadulur & Kala Gotongan; sasih & dewasa khusus                |
| **Dewa Yadnya**    | Melaspas, ngenteg linggih, odalan                           | Wuku, penanggal, sasih ayu                                                      |
| **Rsi Yadnya**     | Mediksa / penobatan sulinggih                               | Dewasa khusus                                                                   |
| **Bhuta Yadnya**   | Mecaru, tawur                                               | Wewaran (Kajeng Kliwon, dll.)                                                   |
| **Umum / sekuler** | Mendirikan rumah, mulai usaha, bercocok tanam, pindah rumah | Dewasa ayu pekerjaan + ingkel + sasih (perhatikan Lebur Awu untuk rumah)        |

---

## 10. Arsitektur engine + strategi akurasi (keputusan: implementasi sendiri)

```
[Input: tanggal Gregorian + jenis upacara]
        │
        ▼
[packages/wariga-core]  ← IMPLEMENTASI SENDIRI (port dari buku)
        konversi: saptawara, pancawara, …, wuku,
        penanggal/panglong, sasih, pengalantaka
        diekspos lewat interface WarigaService
        │
        ▼
[packages/dewasa-rules]  ← Rule Engine
        - padewasan bernama (§8) dari data/seed (sumber: buku)
        - hierarki Alahing Sasih (§7) → override order
        - filter per jenis upacara (§9)
        │
        ▼
[Output] verdict per hari:
        score / label (selaras · kurang selaras · perlu pamarisuda)
        + daftar padewasan aktif (ayu & ala) + penjelasan + sumber
```

### Strategi de-risk (wajib — kalkulasi kalender = tempat rewrite diam-diam rusak)

1. **Oracle fixture.** Sebelum coding, generate tabel referensi pakai lib lama (`balinese-date-js-lib`) untuk rentang luas (mis. 1950–2100) → semua komponen per tanggal → dump JSON. Lib hanya jadi oracle CI, **tidak masuk bundle produksi** (clean secara lisensi). Rewrite wajib mereproduksi tabel ini.
2. **Golden test vs kalender cetak PHDI/Rawi.** Oracle saja tidak cukup (lib bisa ikut salah). Digitalkan sampel tanggal dari **kalender cetak Rawi** (hari raya, tiap pergantian sasih, tanggal kunci) → jadi acuan kebenaran final. Spot-check beberapa puluh tanggal; kalau oracle cocok dengan cetak, percaya sisanya.
3. **Urutan port (deterministik → ganas):**
   1. **Pawukon (wuku)** — `(JDN − epoch) mod 210`. Kunci = anchor date pasti (verifikasi: Galungan = Budha Kliwon Dungulan).
   2. **Wewaran** — modulus dari wuku + saptawara (§6); Eka/Dwi dari jumlah urip.
   3. **Turunan pawukon** (ingkel, jejepan, watek, pancasuda) — deterministik.
   4. **Sasih + penanggal/panglong + pengalantaka** — TERAKHIR, paling hati-hati; kerjakan **per-era** (§5).
4. **Wrap di balik `WarigaService`** — alasannya kini batas domain bersih + gampang di-mock saat test rule engine (bukan lagi soal ganti vendor).

**Saran teknis:** rules sebagai data (bukan `if-else`) biar bisa diaudit pakar wariga & ditambah tanpa deploy; tiap rule punya field `sumber` (buku + halaman); `verified` flag untuk yang belum ketemu sumber presisinya.

---

## 11. Caveat akurasi & sensitivitas kultural

1. **Kunci satu tradisi.** Pilih acuan utama (Rawi/PHDI) dan konsisten; dokumentasikan. Jangan campur lontar berbeda tanpa sadar.
2. **Jangan mengarang kondisi rule.** Belum ketemu sumber presisinya → placeholder + `verified: false`. Salah hitung dewasa = isu kepercayaan, bukan sekadar bug.
3. **Validasi ke pakar.** Khusus rule dewasa ayu, idealnya dicek ke pakar wariga / sulinggih sebelum produksi — bukan cuma dari teks.
4. **Disclaimer wajib di UI:** aplikasi = alat bantu/edukasi; untuk upacara penting tetap disarankan konsultasi sulinggih/pemangku.
5. **Framing non-judgmental** + **pamarisuda sebagai jalan keluar** (badge, bukan hard-block).

---

## 12. Sumber ter-vetting (lihat hierarki di §0)

> Konvergensi yang menguatkan: daftar pustaka resmi **kalenderbali.org** dan referensi **balinese-date-js-lib** sama-sama menunjuk _Pokok-Pokok Wariga_ + kalender cetak Rawi/Marayana. Ini sumber inti — bukan lib-nya.

### A. Ground truth output — kalender cetak (untuk fixture golden test)

- **Kalender Bali — I Ketut Bangbang Gde Rawi** (dilanjutkan keturunan: Bangbang Gde Wisma → Sparsadnyana). De facto standar; jangkar utama. Mudah didapat & murah di Denpasar.
- **Kalender Saka Bali — I Gede Marayana.** Otoritas pengalantaka (WBTB 2019).
- **Kalender Bali — I Nyoman Singgin Wikarman.** Cross-check.

### B. Algoritma & aturan — buku (untuk dibaca saat coding)

- **★ Ala Ayuning Dewasa – Riwayat Ketut Bangbang Gde Rawi** — Ida Bagus Putra Manik Ariana & Ida Bagus Budayoga, 2016 (~217 hal). **Sumber kondisi padewasan §8.** Tersedia di Tokopedia.
- **Pokok-Pokok Wariga** — Ida Bagus Suparta Arhana, 2006, Penerbit Paramita Surabaya. Dasar perhitungan & pengalantaka (sumber yang sama dengan lib).
- **Wariga Dewasa** — Sri Reshi Ananda Kusuma, 1979, Morodadi Denpasar; **Prembon Bali Agung**, 1998, Kayumas Agung. Rujukan klasik.
- **Pelajaran Dewasa (Wariga)** — W. Simpen AB, Toko Buku Muria, Denpasar. **Penuntun Indik Padewasan/Wariga** — I Wayan Tusan, 1972. **Sarining Wariga** — I Ketut Guweng. Teks ajar.

### C. Cross-check / debugging only (BUKAN otoritas)

- `balinese-date-js-lib` (peradnya) — Apache-2.0, TS. Oracle untuk generate fixture. https://github.com/peradnya/balinese-date-js-lib
- babadbali.com (Yayasan Bali Galang) — algoritma pewarigaan, gratis. http://www.babadbali.com/pewarigaan/
- kalenderbali.org (kalkulasi + daftar pustaka) & kalenderbali.info (riset fuzzy, dewasa pawiwahan, I Ketut Suwintana).

### D. Patokan institusional PHDI (untuk akurasi epoch/era — §5)

- Parisada Hindu Bali: kalender resmi pertama 1959, disempurnakan 1963/1971/1979.
- Paruman Sulinggih PHDI Besakih, 25 Juli 1998: Pengalantaka Eka Sungsang → Paing.
- Penampih Sasih: berlaku 1991 (Mahasabha PHDI Pusat), dicabut 18 September 2001 (Sabha Pandita PHDI Bali).

### Jurnal pendukung (validasi metodologi)

- Penentuan Hari Baik Perkawinan Berbasis Logika Fuzzy — Jurnal Lontar, OJS Unud.
- Pengembangan Aplikasi "Kalender Saka Bali" — Jurnal Merpati, Udayana (rincian keputusan PHDI & pengalantaka).

---

_Catatan: tabel urip & sebagian kondisi padewasan di dok ini dihimpun dari sumber sekunder untuk orientasi awal dan WAJIB diverifikasi terhadap buku (§12-B) + kalender cetak (§12-A) sebelum produksi. §8 (kondisi Mertha Yoga dkk.) dan §9 (rule per 6 jenis upacara) masih perlu dilengkapi dari Ala Ayuning Dewasa (2016)._
