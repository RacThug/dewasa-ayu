import type { Check, Rating } from '@dewasa-ayu/types';

import type { WireInfo } from './api';

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Verdict presentation per rating. Humble wording (DESIGN.md voice & tone). */
export const VERDICT: Record<Rating, { lead: string; emph: string; sub: string; cls: string }> = {
  ayu: { lead: 'Dewasa', emph: 'ayu', sub: 'Disarankan untuk', cls: 'is-ayu' },
  caution: { lead: 'Kurang', emph: 'ideal', sub: 'Perlu pertimbangan untuk', cls: 'is-caution' },
  bad: { lead: 'Kurang', emph: 'baik', sub: 'Pertimbangkan tanggal lain untuk', cls: 'is-bad' },
};

/** Local today as YYYY-MM-DD (timezone-independent calendar day). */
export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** "Rabu, 15 Oktober 2026" from a YYYY-MM-DD string. */
export function formatID(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

/** "Oktober 2026" for a 1-based month. */
export function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

/** Short verdict, e.g. "Dewasa ayu" / "Kurang ideal" / "Kurang baik". */
export function verdictText(rating: Rating): string {
  return `${VERDICT[rating].lead} ${VERDICT[rating].emph}`;
}

/** One-character marker carried alongside colour (WCAG 1.4.1). */
export function ratingMark(rating: Rating): string {
  return rating === 'ayu' ? '✓' : rating === 'bad' ? '×' : '·';
}

/** Human-readable Sasih line for the Pawukon list. */
export function sasihLabel(info: WireInfo): string {
  const s = info.sasih;
  const half = s.isPangelong ? 'pangelong' : 'penanggal';
  const flag = s.isPurnama ? ' · purnama' : s.isTilem ? ' · tilem' : '';
  const nampih = s.isNampih ? ' (nampih)' : '';
  return `${cap(s.name)}${nampih} · ${half} ${s.penanggal}${flag}`;
}

const FACTOR_LABEL: Record<string, string> = {
  saptawara: 'Saptawara',
  wuku: 'Wuku',
  sasih: 'Sasih',
  penanggal: 'Penanggal',
  sangawara: 'Sangawara',
};

interface FactorRow {
  name: string;
  why: string;
  passed: boolean;
}

/** The five scored factor checks (dewasa checks are shown as tags, not here),
 *  each with a humble Indonesian explanation derived from the day's values. */
export function factorRows(checks: Check[], info: WireInfo): FactorRow[] {
  return checks
    .filter((c) => FACTOR_LABEL[c.factor] !== undefined)
    .map((c) => ({ name: FACTOR_LABEL[c.factor]!, passed: c.passed, why: factorWhy(c, info) }));
}

function factorWhy(c: Check, info: WireInfo): string {
  switch (c.factor) {
    case 'saptawara':
      return c.passed
        ? `Saptawara ${cap(info.saptawara)} termasuk hari yang disarankan.`
        : `Saptawara ${cap(info.saptawara)} kurang disarankan untuk upacara ini.`;
    case 'wuku':
      return c.passed
        ? `Wuku ${cap(info.wuku)} tidak termasuk wuku yang dihindari.`
        : `Wuku ${cap(info.wuku)} sebaiknya dihindari untuk upacara ini.`;
    case 'sasih':
      return c.passed
        ? `Sasih ${cap(info.sasih.name)} disarankan untuk upacara ini.`
        : `Sasih ${cap(info.sasih.name)} kurang sesuai untuk upacara ini.`;
    case 'penanggal':
      if (!c.passed) return 'Jatuh di paro gelap (pangelong).';
      return info.sasih.isPangelong
        ? `Pangelong, namun bukan syarat untuk upacara ini.`
        : `Paro terang — penanggal ${info.sasih.penanggal}.`;
    case 'sangawara':
      return c.passed
        ? `Sangawara ${cap(info.sangawara)} — pertanda lancar.`
        : `Sangawara ${cap(info.sangawara)} di luar Tulus/Dadi.`;
    default:
      return '';
  }
}
