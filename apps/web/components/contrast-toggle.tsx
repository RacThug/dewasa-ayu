'use client';

import { useEffect, useState } from 'react';

import { ContrastIcon } from '@/lib/icons';

/**
 * Toggles the high-contrast variant (pure ink on pure paper — DESIGN.md).
 * The initial state is applied before paint by the inline script in
 * layout.tsx: explicit choice from localStorage, else the OS's
 * `prefers-contrast: more`. This component only reflects and updates it.
 */
export function ContrastToggle() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOn(document.documentElement.getAttribute('data-contrast') === 'high');
  }, []);

  const toggle = (): void => {
    const next = !on;
    setOn(next);
    if (next) document.documentElement.setAttribute('data-contrast', 'high');
    else document.documentElement.removeAttribute('data-contrast');
    localStorage.setItem('contrast', next ? 'high' : 'off');
  };

  return (
    <button
      type="button"
      className="tool"
      aria-pressed={mounted ? on : undefined}
      aria-label="Kontras tinggi"
      onClick={toggle}
    >
      <ContrastIcon />
    </button>
  );
}
