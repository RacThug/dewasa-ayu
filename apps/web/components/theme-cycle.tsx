'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { AutoThemeIcon, MoonIcon, SunIcon } from '@/lib/icons';

// Auto (follow system) → Terang (paper) → Gelap (night) → Auto …
// Maps onto next-themes: 'system' | 'light' | 'dark'.
const ORDER = ['system', 'light', 'dark'] as const;
type Mode = (typeof ORDER)[number];

const META: Record<Mode, { label: string; Icon: typeof SunIcon }> = {
  system: { label: 'Auto', Icon: AutoThemeIcon },
  light: { label: 'Terang', Icon: SunIcon },
  dark: { label: 'Gelap', Icon: MoonIcon },
};

export function ThemeCycle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before hydration the saved choice is unknown; show the neutral "Auto" face.
  const mode: Mode =
    mounted && (ORDER as readonly string[]).includes(theme ?? '') ? (theme as Mode) : 'system';
  const { label, Icon } = META[mode];

  const next = (): void => {
    const i = ORDER.indexOf(mode);
    setTheme(ORDER[(i + 1) % ORDER.length]!);
  };

  return (
    <button
      type="button"
      className="theme-pill"
      onClick={next}
      aria-label={`Mode tampilan: ${label}. Ketuk untuk mengganti.`}
    >
      <Icon className="theme-pill-icon" />
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
