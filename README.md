# Dewasa Ayu

**Platform pencari hari baik (dewasa ayu) untuk upacara Hindu Bali berdasarkan sistem kalender Wariga.**

Dewasa Ayu mengubah tanggal Masehi menjadi seluruh komponen kalender Bali — Pawukon, Wewaran (Ekawara s.d. Dasawara), Sasih, dan Penanggal/Pangelong — lalu mengevaluasi kecocokannya untuk berbagai jenis upacara. Mesin perhitungan bersifat bersama (shared); yang berbeda hanya aturan evaluasi tiap jenis upacara.

> Versi 2.1 — Multi-Yadnya Edition · Status: Draft
> Stack: Next.js + NestJS + PostgreSQL

---

## Jenis Upacara yang Didukung

| Kategori | Termasuk | Panca Yadnya |
|---|---|---|
| Pawiwahan | Pernikahan | Manusa Yadnya |
| Manusa Yadnya | Metatah/Mepandes, Otonan, Potong Rambut, Upacara Kelahiran | Manusa Yadnya |
| Dewa Yadnya | Melaspas, Ngenteg Linggih, Piodalan, Persembahyangan | Dewa Yadnya |
| Pitra Yadnya | Ngaben, Nyekah, Atma Wedana, Ngasti, Memukur | Pitra Yadnya |
| Pembangunan | Membangun rumah/pura, Mengatapi, Renovasi | Lintas kategori |
| Memulai Usaha | Membuka usaha, Berdagang, Mulai belajar/berlatih | Lintas kategori |

## Fitur Utama (MVP)

- **Ceremony Selector** — beralih antar 6 jenis upacara; memengaruhi semua evaluasi secara global.
- **Date Checker** — masukkan tanggal Masehi → info Pawukon lengkap + evaluasi spesifik upacara (skor, daftar cek, tag dewasa).
- **Kalender Bulanan** — kalender visual dengan kode warna (hijau = ayu, merah = ala, biru = netral) sesuai upacara terpilih.
- **Rekomendasi** — temukan N hari baik terdekat untuk upacara terpilih dari tanggal mulai tertentu.
- **Detail Dewasa** — tampilkan seluruh dewasa ayu & ala aktif beserta deskripsi dan tingkat keparahan.
- **Sistem Skor** — skor persentase berbobot dengan pembobotan khusus per upacara.
- **Halaman Edukasi (About)** — dokumentasi Wariga lengkap dalam Bahasa Indonesia.
- **Desain Responsif** — mobile-first, aksesibel untuk segala usia (WCAG 2.1 AA).
- **REST API** *(P1)* — endpoint `/check`, `/calendar`, `/recommend` dengan parameter jenis upacara.

Fitur lanjutan (Phase 2): Kalkulator Otonan, Mesakapan/Jodoh, panel admin koreksi Sasih, sinkronisasi kalender, akun pengguna, dan tier API.

## Arsitektur & Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14+ (App Router), Tailwind CSS, shadcn/ui, Radix UI, Framer Motion |
| Backend | NestJS (Swagger, Throttler, cache-manager) |
| Database | PostgreSQL + Prisma |
| Cache | Redis |
| Monorepo | Turborepo + pnpm |
| Testing | Vitest (unit) + Playwright (E2E) |
| Deploy | Docker, Vercel (web), Railway (api), Neon (PG), Upstash (Redis) |
| CI/CD | GitHub Actions |

## Struktur Monorepo

```
apps/
  web/                 # Frontend Next.js (App Router)
  api/                 # Backend NestJS (calendar, ceremony, auth, admin)
packages/
  wariga-engine/       # Pustaka perhitungan TypeScript murni, tanpa dependensi eksternal
  ceremony-rules/      # Konfigurasi evaluasi per upacara
  types/               # Interface TypeScript bersama
  constants/           # Data referensi statis (Wuku, Wewaran, Sasih)
prisma/                # Skema database, migrasi, seed
docker/                # Docker Compose untuk dev lokal (PostgreSQL + Redis)
docs/                  # Dokumentasi, termasuk PRD.md
turbo.json             # Konfigurasi pipeline Turborepo
```

### Pola Konfigurasi Upacara

Setiap upacara adalah objek konfigurasi TypeScript. Menambah upacara baru cukup menambahkan satu file konfigurasi — tanpa mengubah mesin perhitungan:

```typescript
{
  id, name, category,
  sasih_rules: { good: number[], bad: number[] },
  dewasa_ayu: string[],
  dewasa_ala: string[],
  scoring_weights: { /* ... */ },
  saptawara_good: number[],
  require_penanggal: boolean
}
```

## Mesin Perhitungan (`@dewasa-ayu/wariga-engine`)

TypeScript murni, tanpa dependensi eksternal, berjalan di browser maupun Node.js.

| Fungsi | Input | Output |
|---|---|---|
| `getPawukonDay(date)` | Date | number (0–209) |
| `getFullInfo(date)` | Date | BalineseDate (semua komponen) |
| `getSasihInfo(date)` | Date | SasihInfo |
| `detectDewasa(info, ceremonyId)` | BalineseDate, string | `{ ayuList, alaList }` |
| `evaluate(info, ceremonyId)` | BalineseDate, string | Evaluation (rating, score, checks, dewasa) |
| `findGoodDates(from, count, ceremonyId)` | Date, number, string | EvaluatedDate[] |
| `getMonthEvaluation(year, month, ceremonyId)` | number, number, string | MonthData |

**Epoch & referensi:** Pawukon epoch = 11 Juni 2012 (Redite Sinta, hari 1); semua perhitungan = `daysDiff(epoch, date) mod 210`. Sasih = aproksimasi lunar (29,53 hari) dari referensi 9 April 2024 = Penanggal 1 Kadasa.

## Ringkasan API

Base path: `/api/v1`

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/calendar/check?date=YYYY-MM-DD&ceremony=...` | Info tanggal lengkap + evaluasi spesifik upacara |
| GET | `/calendar/month?year=...&month=...&ceremony=...` | Tampilan bulan dengan evaluasi per hari |
| GET | `/calendar/recommend?from=...&count=...&ceremony=...` | Temukan N hari baik |
| GET | `/calendar/range?from=...&to=...&ceremony=...` | Evaluasi rentang tanggal |
| GET | `/ceremonies` | Daftar semua jenis upacara |
| GET | `/dewasa?ceremony=...` | Daftar aturan dewasa untuk suatu upacara |

## Memulai (Getting Started)

> Catatan: struktur kode mungkin masih dalam tahap penyiapan. Langkah di bawah mengikuti tech stack yang ditetapkan di PRD.

```bash
# 1. Install dependencies (pnpm + Turborepo)
pnpm install

# 2. Jalankan layanan lokal (PostgreSQL + Redis)
docker compose -f docker/docker-compose.yml up -d

# 3. Siapkan database
pnpm prisma migrate dev
pnpm prisma db seed

# 4. Jalankan dev server (web + api)
pnpm dev
```

Web: `http://localhost:3000` · API: `http://localhost:3001`

## Roadmap (ringkas)

| Fase | Fokus |
|---|---|
| 0 | Setup monorepo, CI/CD, Docker, Prisma, seed |
| 1 | `wariga-engine` + 6 konfigurasi upacara + test suite 30 tanggal |
| 2 | API NestJS, Swagger, Redis, rate limiting |
| 3 | Frontend inti (semua layar, selector, tema, responsif, URL state) |
| 4 | Konten & SEO (About, halaman SEO, OG image, structured data) |
| 5 | Aksesibilitas (font scaling, high contrast, keyboard, screen reader) |
| 6 | PWA & offline |
| 7 | Analytics & feedback widget |
| 8 | Validasi (konsultasi Sulinggih), cross-validation, soft launch |
| 9+ | Phase 2 (Otonan, Mesakapan, akun, admin, sinkronisasi kalender) |

## Disclaimer & Sensitivitas Budaya

Platform ini menyediakan **perhitungan referensi** berdasarkan pedoman Wariga umum dan **bukan pengganti konsultasi Sulinggih/Pemangku**. Perhitungan Sasih bersifat estimasi dan dapat berbeda dengan variasi tradisi regional. Fitur inti selalu gratis; tidak ada monetisasi atas pengetahuan sakral. Tidak berafiliasi dengan PHDI atau organisasi keagamaan resmi.

## Referensi Utama

Lontar Wariga Catur Winasa Sari; *Dasar Wariga & Tenung Wariga* (I.B. Putra Manik Aryana); *Pokok-pokok Wariga* (I.B. Supartha Ardana); [SakaCalendar](https://github.com/edysantosa/sakacalendar) (LGPL-2.1); kalenderbali.org; babadbali.com; dan sumber lain (lihat `docs/PRD.md` bagian 28).

---

Dokumen kebutuhan produk lengkap tersedia di [`docs/PRD.md`](docs/PRD.md).
