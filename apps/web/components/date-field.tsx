'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

export function DateField({ ceremony, date }: { ceremony: string; date: string }) {
  const router = useRouter();
  const [value, setValue] = useState(date);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    router.push(`/?ceremony=${ceremony}&date=${value}`);
  };

  return (
    <form className="field" onSubmit={submit}>
      <span className="date-field">
        <input
          className="native"
          type="date"
          min="2003-01-01"
          max="2100-12-31"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Pilih tanggal"
        />
      </span>
      <button className="periksa" type="submit">
        Periksa Dewasa
      </button>
    </form>
  );
}
