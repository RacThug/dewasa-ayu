'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';

import { DatePicker } from '@/components/date-picker';

export function DateField({ ceremony, date }: { ceremony: string; date: string }) {
  const router = useRouter();
  const [value, setValue] = useState(date);
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    startTransition(() => {
      router.push(`/?ceremony=${ceremony}&date=${value}`);
    });
  };

  return (
    <form className="field" onSubmit={submit}>
      <DatePicker value={value} onChange={setValue} />
      <button className="periksa" type="submit" aria-busy={pending || undefined}>
        {pending ? 'Memeriksa…' : 'Periksa Dewasa'}
      </button>
    </form>
  );
}
