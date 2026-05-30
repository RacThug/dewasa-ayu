# Bali 2026 Printed Calendar — Reference Photos

Internal ground-truth reference used to validate the Wariga engine against a real,
published calendar — independent of the `balinese-date-js-lib` oracle.

## What this is

Twelve month photos (`jan.jpg` … `dec.jpg`) of a printed Balinese 2026 calendar that
Rac owns. Filenames use the calendar's own month abbreviations — note `agu` = Agustus
(August), `sep` = September, `oct` = Oktober, `nop` = Nopember (November), `dec` = Desember.

## What it validated (2026-05-30)

- **Pawukon / Wuku** — the Ingkel rows (derived from wuku) match the engine for the
  sampled months, and Galungan 2026 = **17 Jun** (Buda Kliwon Dungulan) lands exactly.
- **Sasih** — Purnama/Tilem dates, and Nyepi 2026 = **19 Mar** (Penanggal 1 Kadasa,
  beginning Saka 1948), confirmed by Rac against this calendar.

These anchors are locked in the engine test suite (`packages/wariga-engine`), so the
validation is reproducible without the photos; the photos remain here as the human-
auditable source and for future Sasih / dewasa cross-checks.

## ⚠️ Usage

- **Internal reference only.** These are photos of a copyrighted commercial calendar.
  Keep them in the **private** repository; do **not** redistribute or publish them, and
  do **not** include them if this repo is ever made public.
