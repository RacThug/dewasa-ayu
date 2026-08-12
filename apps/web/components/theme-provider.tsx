'use client';

import { MotionConfig } from 'framer-motion';
import { ThemeProvider as NextThemes } from 'next-themes';
import type { ReactNode } from 'react';

// Night (lamplight) is the canonical dark theme; paper is the daytime variant.
// The initial theme follows the OS (prefers-color-scheme) until the user picks
// one explicitly via the header toggle (DESIGN.md core principle 2).
//
// `reducedMotion="user"` makes every Framer animation honour the visitor's OS
// "reduce motion" setting. Without it Framer's default is to ignore that
// preference outright, which the CSS entrance animations already respect --
// the audience skews elderly and WCAG 2.1 AA is mandatory, so the two need to
// agree. Movement (transform/layout) is suppressed; opacity and colour still
// animate, which is the accessible-by-default reading of the preference.
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
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemes>
  );
}
