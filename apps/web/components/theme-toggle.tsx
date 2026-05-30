'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { MoonIcon, SunIcon } from '@/lib/icons';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isPaper = mounted && theme === 'paper';
  return (
    <button
      type="button"
      className="tool"
      aria-label={isPaper ? 'Ganti ke tema malam' : 'Ganti ke tema siang'}
      onClick={() => setTheme(isPaper ? 'night' : 'paper')}
    >
      {isPaper ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
