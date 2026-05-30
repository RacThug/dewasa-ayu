'use client';

import { ThemeProvider as NextThemes } from 'next-themes';
import type { ReactNode } from 'react';

// Night (lamplight) is the canonical default; paper is the daytime variant.
// (OS prefers-color-scheme auto-detect is a small follow-up — enableSystem.)
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="night"
      themes={['night', 'paper']}
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
