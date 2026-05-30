'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

export function RecommendForm({
  ceremony,
  from,
  count,
}: {
  ceremony: string;
  from: string;
  count: number;
}) {
  const router = useRouter();
  const [fromValue, setFromValue] = useState(from);
  const [countValue, setCountValue] = useState(count);

  const submit = (e: FormEvent): void => {
    e.preventDefault();
    router.push(`/rekomendasi?ceremony=${ceremony}&from=${fromValue}&count=${countValue}`);
  };

  return (
    <form className="field reco-form" onSubmit={submit}>
      <span className="date-field">
        <input
          className="native"
          type="date"
          min="2003-01-01"
          max="2100-12-31"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          aria-label="Mulai dari tanggal"
        />
      </span>
      <label className="count-field">
        <span className="count-label">Jumlah</span>
        <select
          value={countValue}
          onChange={(e) => setCountValue(Number(e.target.value))}
          aria-label="Jumlah hari yang dicari"
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n} hari
            </option>
          ))}
        </select>
      </label>
      <button className="periksa" type="submit">
        Cari Hari Baik
      </button>
    </form>
  );
}
