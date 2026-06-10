'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { MoonIcon, SunIcon } from '@/lib/icons';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isPaper = mounted && resolvedTheme === 'light';
  return (
    <button
      type="button"
      className="tool theme"
      aria-label={isPaper ? 'Ganti ke tema malam' : 'Ganti ke tema siang'}
      onClick={() => setTheme(isPaper ? 'dark' : 'light')}
    >
      {isPaper ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
