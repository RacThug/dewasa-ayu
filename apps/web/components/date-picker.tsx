'use client';

import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { id } from 'react-day-picker/locale';

import { formatID } from '@/lib/display';
import { EditIcon } from '@/lib/icons';

// The engine's supported Sasih range (see wariga-engine getSupportedRange()).
// February 2003 is the first month the calendar grid can show in full, so it is
// also the first date offerable here — matches DateControls' clamp.
const MIN = new Date(2003, 1, 1);
const MAX = new Date(2100, 11, 31);

function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
}

function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  label = 'Pilih tanggal',
}: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="dp-trigger" aria-label={label}>
          <span className="d">{formatID(value)}</span>
          <span className="edit" aria-hidden="true">
            <EditIcon />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="dp-panel" align="start" sideOffset={8}>
          <DayPicker
            mode="single"
            required
            selected={selected}
            onSelect={(d) => {
              onChange(toISO(d));
              setOpen(false);
            }}
            locale={id}
            defaultMonth={selected}
            startMonth={MIN}
            endMonth={MAX}
            disabled={{ before: MIN, after: MAX }}
            showOutsideDays
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
