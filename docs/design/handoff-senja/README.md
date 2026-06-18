# Handoff: Dewasa Ayu — Redesign App (cek hari baik / Wariga)

## Overview

Aplikasi cek **dewasa ayu** (hari baik menurut pedoman Wariga umum). Pengguna memilih tanggal,
melihat **verdict** (Ayu / Madya / Ala) + **skor 0–100**, rincian wewaran, kalender bulanan berwarna,
dan rekomendasi hari baik terdekat. Redesign ini mengubah arah visual menjadi **editorial "Senja"**
(serif italik untuk angka/verdict, aksen emas), responsif **desktop + mobile**, dengan **mode Auto/Terang/Gelap**
dan **filter jenis upacara** yang memengaruhi skor, kalender, dan rekomendasi.

## About the Design Files

File `.dc.html` di bundle ini adalah **referensi desain berbasis HTML** — prototipe yang menunjukkan
tampilan & perilaku yang dimaksud, **bukan kode produksi untuk disalin mentah**. Tugasnya:
**bangun ulang desain ini di codebase nyata** (Next.js/React + design system "Dewasa Ayu — Lontar"
yang sudah Anda miliki), memakai token, kelas, dan komponen yang sudah ada — bukan menyalin inline-style
dari prototipe.

> Catatan runtime: file `.dc.html` hanya tampil di lingkungan "Design Component". Buka di editor untuk
> membaca markup & logika; jangan jalankan sebagai HTML biasa.

## Fidelity

**High-fidelity (hifi).** Warna, tipografi, spacing, dan interaksi sudah final. Bangun ulang pixel-perfect
memakai design system Anda. Karena prototipe sengaja memakai **nama token yang sama** dengan DS Anda,
pemetaannya hampir 1:1 (lihat Design Tokens).

## Pemetaan ke design system yang ada (PENTING — baca dulu)

Prototipe mendefinisikan palet via CSS variables inline. Di codebase, **jangan** buat variabel baru —
pakai token DS yang sudah ada (`tokens/tokens.css`) dan mekanisme tema yang sudah ada:

| Prototipe (mode)         | DS Anda (sudah ada)                                                 |
| ------------------------ | ------------------------------------------------------------------- |
| Mode **Gelap** ("Senja") | `data-theme="night"` (default)                                      |
| Mode **Terang**          | `data-theme="paper"`                                                |
| Mode **Auto**            | pilih night/paper dari `matchMedia('(prefers-color-scheme: dark)')` |
| `--accent` emas          | `--accent` / `--accent-soft` / `--accent-deep`                      |
| `--ayu/--caution/--ala`  | `--ayu` / `--caution` / `--ala` (sudah ada)                         |
| `--text/--soft/--faint`  | `--text` / `--text-soft` / `--text-faint`                           |
| `--panel/--edge`         | `--panel` / `--edge`                                                |
| spacing 18/22/30px dst.  | `--s3..--s7` (16/24/40/64/96)                                       |

Tema sudah re-cascade otomatis lewat atribut pada root (`<html data-theme>`). Toggle Auto/Terang/Gelap
hanya perlu mengeset atribut itu + menyimpan preferensi (localStorage). `data-contrast="high"` dan
`data-font-scale` yang sudah ada tetap berlaku — pertahankan.

Date picker memakai **react-day-picker** (`.rdp-root`, `.dp-panel` sudah ada di DS) — gunakan itu untuk
input tanggal manual & kalender bila memungkinkan.

## Screens / Views

### 1. Mobile (lebar ~390–430px, satu kolom)

**Purpose:** alur utama di HP. Scroll vertikal tunggal.
**Layout (urut atas→bawah):**

1. **Header sticky** — kiri: judul "Dewasa Ayu" (serif italic) + sub "Penanggalan hari baik"; kanan:
   tombol pill **mode tema** (ikon Auto/sun/moon + label "Auto/Terang/Gelap").
2. **Baris kontrol tanggal** — tombol bulat ‹ (hari sebelumnya), `<input type="date">` (lebar penuh,
   ikon kalender di kiri), tombol bulat › (hari berikutnya). Tap target ≥ 44px.
3. **Filter upacara** — baris chip horizontal scroll: Semua · Otonan · Pawiwahan · Mlaspas ·
   Ngenteg Linggih · Memungkah. Tiap chip: ikon kecil + label. Chip aktif: border + teks `--accent`,
   background tint aksen (`--sel-bg`).
4. **Kartu hero verdict** — radius 22px, `--panel`, border `--edge`, shadow halus. Isi:
   - baris tanggal kapital (uppercase, `--text-faint`, letter-spacing .14em) + (jika upacara dipilih)
     sub "Dinilai untuk · <Upacara>" warna `--accent`; tombol **Bagikan** (ikon share) di kanan atas.
   - **Skor**: angka serif italic ~3.7em warna verdict + "/100" kecil; di sampingnya **verdict word**
     serif italic ~1.7em + sub-label.
   - **Meter** tinggi 7px, track `--panel-2`, fill = lebar `skor%`, warna verdict, radius penuh.
   - paragraf ringkasan (`--text-soft`), lalu chip **wewaran** (Saptawara/Pancawara/Triwara/Wuku),
     lalu (opsional) baris tips kecil `--text-faint`.
5. **Rincian Wariga** — kartu list aturan; tiap baris: badge bulat ✓ (`--ayu` di `--ayu-bg`) atau ×
   (`--ala` di `--ala-bg`), nama aturan + alasan.
6. **Tag** — "Disarankan untuk" (chip hijau) / "Dihindari" (chip merah).
7. **Kalender bulanan** — header ‹ Bulan Tahun ›; heading hari (Min..Sab); grid 7 kolom; tiap sel:
   angka + titik kecil berwarna verdict; hari ini → angka `--accent` + bg `--panel-2`; terpilih →
   ring `inset 0 0 0 2px var(--accent)`. Legenda Ayu/Madya/Ala di bawah.
8. **Rekomendasi** — judul "Hari baik terdekat" / "Hari baik untuk <Upacara>"; list kartu (tanggal,
   weekday + wewaran, "Ayu · skor"). **Empty state** bila tak ada hari Ayu dalam ~70 hari.
9. **Tentang Wariga** — kartu dashed: penjelasan + disclaimer konsultasi Sulinggih/Pemangku.

### 2. Desktop (≥ ~1024px, dua kolom)

**Purpose:** versi lebar; konten yang sama, di-reflow.
**Layout:**

- **Top bar** full-width: kiri brand; tengah: stepper hari ‹ + date input + ›; kanan: tombol mode tema
  - tombol "Hari ini".
- **Baris filter upacara** full-width (chip wrap, tanpa scroll).
- **`<main>` grid 2 kolom ≈ 1.45fr / 1fr, gap 22px:**
  - **Kiri:** kartu hero (skor besar ~5.2em + verdict + meter horizontal + ringkasan + wewaran),
    lalu sub-grid 2 kolom: "Rincian Wariga" (list) | "Cocok / Hindari" (tag).
  - **Kanan:** kartu kalender (sel lebih besar) lalu daftar rekomendasi.
- **Footer** full-width: "Tentang Wariga" + "Catatan" (2 kolom).
- Dibingkai chrome browser (hanya untuk presentasi; tidak perlu diimplementasikan).

**Responsive:** satu komponen, gunakan breakpoint (mis. `min-width: 1024px`) untuk beralih dari satu
kolom (mobile) ke grid dua kolom (desktop). Semua state & data identik di kedua mode.

## Interactions & Behavior

- **Pilih tanggal:** tap sel kalender, gunakan date input, atau stepper ‹/› (geser ±1 hari; jika lewat
  batas bulan, bulan kalender ikut pindah). Semua memperbarui state `selected`.
- **Hari ini:** reset `selected` ke tanggal hari ini + pindah kalender ke bulannya.
- **Navigasi bulan:** ‹ › menggeser `viewMonth` saja (tidak mengubah `selected`).
- **Mode tema:** tombol meng-cycle Auto → Terang → Gelap. Auto mengikuti `prefers-color-scheme`
  secara realtime (listener `matchMedia`). Simpan pilihan di localStorage.
- **Filter upacara:** memilih chip mengubah `ceremony`; ini **mengubah skor & verdict** (bonus wewaran
  per upacara), **warna titik kalender**, dan **isi rekomendasi** (hanya hari Ayu untuk upacara itu).
- **Bagikan:** `navigator.share({title, text})` bila ada; fallback `navigator.clipboard.writeText` lalu
  tampilkan **toast** ~1.9 dtk ("Disalin ke clipboard").
- **Transisi:** warna verdict & meter `transition .3–.55s ease`; hover tombol mengubah background ke
  `--panel-2`; active `transform: scale(.99)`. Hormati `prefers-reduced-motion`.
- **Aksesibilitas:** `aria-label` pada semua tombol ikon; tap target ≥ 44px (mobile); fokus terlihat;
  kontras teks ≥ AA (token DS sudah dirancang AA; mode `paper` memakai aksen yang digelapkan).

## State Management

State minimum (mis. di store/komponen halaman):

- `selected: Date` — tanggal aktif.
- `viewYear, viewMonth` — bulan yang ditampilkan kalender.
- `mode: 'auto' | 'light' | 'dark'` — preferensi tema (persist di localStorage).
- `systemDark: boolean` — dari `matchMedia`, untuk resolusi mode `auto`.
- `ceremony: 'semua' | 'otonan' | 'pawiwahan' | 'mlaspas' | 'ngenteg' | 'memungkah'`.
- `toast: string` — pesan toast sementara.
  Tema efektif = `mode==='auto' ? (systemDark?'night':'paper') : (mode==='dark'?'night':'paper')`,
  diset sebagai `data-theme` pada root.

## Logika Wariga (PENTING — saat ini mock)

Prototipe memakai perhitungan **mock deterministik** (hash dari tanggal) agar tampilan stabil & bervariasi.
**Ganti dengan perhitungan Pawukon/Wariga sebenarnya** di backend/util. Bentuk yang diharapkan, per tanggal:

```
{
  saptawara, pancawara, triwara, wuku,   // wewaran
  baseScore,                              // 0..100 dasar
}
```

Lalu skor per-upacara = `baseScore` disesuaikan bonus bila wewaran cocok dengan daftar favorabel upacara
(prototipe: +9 sapta cocok, +9 panca, +7 triwara, +8 wuku, −7 baseline saat upacara dipilih), di-clamp 6..99.
Verdict: `>=72 Ayu`, `>=52 Madya`, selain itu `Ala`. Daftar favorabel per upacara ada di logika
`DewasaAyu.dc.html` (`this.CER`). **Validasi aturan ini dengan referensi/pemangku** sebelum produksi.

## Design Tokens (nilai final yang dipakai prototipe — gunakan token DS yang setara)

**Gelap (≈ data-theme="night"):** bg #15130F · panel #1E1B15 · panel-2 #272217 · edge #2F2818 ·
edge-2 #3A3120 · text #F0E7D4 · soft #B6A988 · faint #8C8169 · accent #D4AF5F · ayu #83B26B ·
caution #D2B24C · ala #D88A82 · sel-bg rgba(212,175,95,.18).
**Terang (≈ data-theme="paper"):** bg #F4ECDA · panel #FBF6EA · panel-2 #ECE1C9 · edge #E2D6BC ·
edge-2 #D2C3A0 · text #3A2E1F · soft #6B5B43 · faint #8A795C · accent #8A6A1E · ayu #3E7A4E ·
caution #8A7320 · ala #9A4A44 · sel-bg rgba(138,106,30,.14).
**Tipografi:** serif = Cormorant Garamond (italic) untuk angka skor, verdict word, label bulan, nomor
tanggal rekomendasi; sans = DM Sans untuk sisanya. **Radius:** kartu 18–22px, chip 999px (pill),
sel kalender 11–12px. **Spacing** mengikuti skala DS. **Shadow:** halus (`0 8–10px 26–30px` rgba gelap/coklat).

## Assets

Tidak ada gambar. Semua ikon adalah **inline SVG sederhana** (sun/moon/auto, kalender, share, dan ikon
upacara: tiga-titik, matahari, dua-cincin, wajik, segitiga, daun). Boleh diganti dengan ikon set yang
sudah dipakai codebase (mis. lucide) selama maknanya sama.

## Files (di bundle ini)

- `DewasaAyu.dc.html` — entry: semua **logika & state** (Wariga mock, ceremony, tema, handler) + canvas
  yang memuat frame desktop & mobile. **Baca file ini untuk logika.**
- `FrameSenja.dc.html` — markup layout **mobile**.
- `FrameDesktop.dc.html` — markup layout **desktop**.
- `ds-base.js` — loader stylesheet DS untuk preview (referensi).
