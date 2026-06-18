'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { DatePicker } from '@/components/date-picker';
import { todayISO } from '@/lib/display';

// The engine's supported Sasih range (see wariga-engine getSupportedRange()).
const MIN = '2003-01-03';
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
 * Date stepper for the consolidated home view. Every change navigates (URL state):
 * `date` is the selected day and `view` follows it so the calendar tracks the day.
 */
export function DateControls({ ceremony, date }: { ceremony: string; date: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const go = (iso: string): void => {
    const clamped = clampISO(iso);
    const view = clamped.slice(0, 7); // YYYY-MM
    startTransition(() => {
      router.push(`/?ceremony=${ceremony}&date=${clamped}&view=${view}`);
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
