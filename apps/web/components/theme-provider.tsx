'use client';

import { ThemeProvider as NextThemes } from 'next-themes';
import type { ReactNode } from 'react';

// Night (lamplight) is the canonical dark theme; paper is the daytime variant.
// The initial theme follows the OS (prefers-color-scheme) until the user picks
// one explicitly via the header toggle (DESIGN.md core principle 2).
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={['dark', 'light']}
      value={{ dark: 'night', light: 'paper' }}
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
