import type {
  Astawara,
  CeremonyId,
  DewasaEffect,
  DewasaRuleDef,
  Saptawara,
} from '@dewasa-ayu/types';

/** The six supported ceremonies, in canonical order. Single source for the set. */
export const CEREMONY_IDS: readonly CeremonyId[] = [
  'pawiwahan',
  'manusa_yadnya',
  'dewa_yadnya',
  'pitra_yadnya',
  'pembangunan',
  'usaha',
];

// Source tags, kept verbatim so the audit trail is explicit.
const SRC_BOOK_VIA_MEDIA = 'Ala Ayuning Dewasa (Ariana & Budayoga 2016) via Tribun Bali';
const SRC_SECONDARY = 'sumber sekunder wariga';
const SRC_COMMON = 'pengetahuan wariga umum';

// Ayu Nulus: saptawara -> favourable penanggal (paro terang). Wraspati & Sukra are
// not listed in the source — may be genuinely absent or truncated (unverified).
const AYU_NULUS_PENANGGAL: Partial<Record<Saptawara, readonly number[]>> = {
  redite: [6],
  soma: [3],
  anggara: [7],
  buda: [12, 13],
  saniscara: [5],
};

// Lebur Awu: the saptawara × astawara pairs that trigger it.
const LEBUR_AWU_PAIR: Record<Saptawara, Astawara> = {
  redite: 'indra',
  soma: 'uma',
  anggara: 'ludra', // "Rudra" in the source
  buda: 'brahma',
  wraspati: 'guru',
  sukra: 'sri',
  saniscara: 'yama',
};

const ayu = (note: string): DewasaEffect => ({ polarity: 'ayu', note });
const alaMinor = (note: string): DewasaEffect => ({ polarity: 'ala', severity: 'minor', note });

// Ayu Nulus applies broadly (umum + Panca Yadnya), so the same effect for all six.
const ayuNulusEffects = Object.fromEntries(
  CEREMONY_IDS.map((c) => [
    c,
    ayu('Tergolong Ayu Nulus (saptawara × penanggal) — disarankan untuk pekerjaan & upacara.'),
  ]),
) as Record<CeremonyId, DewasaEffect>;

/**
 * Padewasan whose conditions are precise enough to compute today. This is an
 * UNVERIFIED bootstrap — every entry is `verified: false` — drawn from
 * docs/research/dewasa-rules.seed.json and wariga-engine-reference.md §8. Effects are
 * deliberately conservative: all ala are 'minor' (an unverified rule must not force a
 * definitive "bad" verdict), and each is mapped only to ceremonies its source actually
 * supports. NEVER add a rule with a fabricated condition — leave it out until the
 * authoritative book / a wariga expert supplies it. Flipping `verified` true (per rule)
 * and tuning severity is a separate, expert-gated step.
 */
export const DEWASA_RULES: readonly DewasaRuleDef[] = [
  {
    id: 'ayu_nulus',
    name: 'Ayu Nulus',
    generalCategory: 'ayu',
    basis: ['saptawara', 'penanggal'],
    conditionText:
      'Redite penanggal 6 · Soma 3 · Anggara 7 · Buda 12/13 · Saniscara 5 (paro terang). Wraspati & Sukra belum diketahui.',
    effects: ayuNulusEffects,
    source: SRC_BOOK_VIA_MEDIA,
    verified: false,
    match: ({ info }) =>
      !info.sasih.isPangelong &&
      (AYU_NULUS_PENANGGAL[info.saptawara] ?? []).includes(info.sasih.penanggal),
  },
  {
    id: 'ingkel_wong',
    name: 'Ingkel Wong',
    generalCategory: 'ala',
    basis: ['wuku', 'ingkel'],
    conditionText: "Ingkel hari ini = 'wong' (pantangan terkait manusia); berlaku sepanjang wuku.",
    effects: {
      pawiwahan: alaMinor(
        'Ingkel Wong — pantangan terkait manusia; sebaiknya dihindari untuk pawiwahan.',
      ),
      manusa_yadnya: alaMinor(
        'Ingkel Wong — pantangan terkait manusia; sebaiknya dihindari untuk upacara manusa yadnya.',
      ),
    },
    source: SRC_COMMON,
    verified: false,
    match: ({ info }) => info.ingkel === 'wong',
  },
  {
    id: 'semut_sadulur',
    name: 'Semut Sadulur',
    generalCategory: 'contextual',
    basis: ['urip_saptawara', 'urip_pancawara'],
    conditionText:
      'Jumlah urip Saptawara + Pancawara = 13. Sumber menyebut pola berturut 3× — belum diverifikasi; di sini dideteksi per hari.',
    effects: {
      pitra_yadnya: alaMinor('Semut Sadulur (urip 13) — kurang baik untuk atiwa-tiwa/ngaben.'),
    },
    source: SRC_SECONDARY,
    verified: false,
    match: ({ info }) => info.totalUrip === 13,
  },
  {
    id: 'kala_gotongan',
    name: 'Kala Gotongan',
    generalCategory: 'contextual',
    basis: ['urip_saptawara', 'urip_pancawara'],
    conditionText:
      'Jumlah urip Saptawara + Pancawara = 14. Sumber menyebut pola berturut 3× — belum diverifikasi; di sini dideteksi per hari.',
    effects: {
      pitra_yadnya: alaMinor('Kala Gotongan (urip 14) — kurang baik untuk atiwa-tiwa/ngaben.'),
      usaha: ayu('Kala Gotongan — justru disarankan untuk memulai usaha.'),
    },
    source: SRC_SECONDARY,
    verified: false,
    match: ({ info }) => info.totalUrip === 14,
  },
  {
    id: 'lebur_awu',
    name: 'Lebur Awu',
    generalCategory: 'ala',
    basis: ['saptawara', 'astawara'],
    conditionText: 'Pasangan Saptawara × Astawara tertentu (mis. Wraspati–Guru, Saniscara–Yama).',
    effects: {
      pembangunan: alaMinor('Lebur Awu — kurang baik untuk mendirikan rumah & pemakuhan.'),
    },
    source: SRC_BOOK_VIA_MEDIA,
    verified: false,
    match: ({ info }) => LEBUR_AWU_PAIR[info.saptawara] === info.astawara,
  },
  {
    id: 'tanpa_guru',
    name: 'Tanpa Guru',
    generalCategory: 'ala',
    basis: ['wuku', 'astawara'],
    conditionText: "Tidak ada Astawara 'Guru' sepanjang wuku berjalan.",
    effects: {
      usaha: alaMinor('Tanpa Guru — kurang baik untuk memulai usaha atau menuntut ilmu.'),
    },
    source: SRC_SECONDARY,
    verified: false,
    match: ({ wukuAstawara }) => !wukuAstawara.includes('guru'),
  },
  {
    id: 'was_penganten',
    name: 'Was Penganten',
    generalCategory: 'contextual',
    basis: ['wuku', 'sadwara'],
    conditionText: "Dua hari ber-Sadwara 'Was' dalam satu wuku.",
    // The source ties its effect to making sharp objects / walls / meetings — none of
    // the six ceremonies — so it is catalogued and computable but maps to no ceremony.
    effects: {},
    source: SRC_SECONDARY,
    verified: false,
    match: ({ wukuWasCount }) => wukuWasCount === 2,
  },
];
