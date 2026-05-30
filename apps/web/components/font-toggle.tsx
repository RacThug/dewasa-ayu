'use client';

import { useEffect, useState } from 'react';

const SCALES = ['normal', 'large', 'xlarge'] as const;
type Scale = (typeof SCALES)[number];

function apply(scale: Scale): void {
  const root = document.documentElement;
  if (scale === 'normal') root.removeAttribute('data-font-scale');
  else root.setAttribute('data-font-scale', scale);
}

export function FontToggle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('font-scale') as Scale | null;
    const i = saved ? SCALES.indexOf(saved) : 0;
    if (i > 0) {
      setIndex(i);
      apply(SCALES[i]!);
    }
  }, []);

  const cycle = (): void => {
    const next = (index + 1) % SCALES.length;
    setIndex(next);
    apply(SCALES[next]!);
    localStorage.setItem('font-scale', SCALES[next]!);
  };

  return (
    <button type="button" className="tool type" onClick={cycle} aria-label="Ubah ukuran teks">
      <span className="a1">A</span>
      <span className="a2">A</span>
    </button>
  );
}
