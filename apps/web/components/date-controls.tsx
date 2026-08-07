'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { DatePicker } from '@/components/date-picker';
import { todayISO } from '@/lib/display';
import { dayHref } from '@/lib/routes';

// The engine's supported Sasih range (see wariga-engine getSupportedRange()).
// February 2003 is the first month the grid can show in full.
const MIN = '2003-02-01';
const MAX = '2100-12-31';

function clampISO(iso: string): string {
  if (iso < MIN) return MIN;
  if (iso > MAX) return MAX;
  return iso;
}

function shift(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d! + days);
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

/**
 * Date stepper for the consolidated home view. Navigates to the target date's
 * own URL, which is a permanently cached page -- so stepping through days is a
 * CDN hit, not a server render.
 */
export function DateControls({ ceremony, date }: { ceremony: string; date: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const go = (iso: string): void => {
    startTransition(() => {
      router.push(dayHref(ceremony, clampISO(iso)));
    });
  };

  return (
    <div className="app-controls" aria-busy={pending || undefined}>
      <button
        type="button"
        className="step"
        aria-label="Hari sebelumnya"
        onClick={() => go(shift(date, -1))}
      >
        ‹
      </button>
      <div className="app-date">
        <DatePicker value={date} onChange={go} />
      </div>
      <button
        type="button"
        className="step"
        aria-label="Hari berikutnya"
        onClick={() => go(shift(date, 1))}
      >
        ›
      </button>
      <button type="button" className="today-btn" onClick={() => go(todayISO())}>
        Hari ini
      </button>
    </div>
  );
}
