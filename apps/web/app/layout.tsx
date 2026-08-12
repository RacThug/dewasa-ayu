import './globals.css';
import 'react-day-picker/style.css';

import type { Metadata } from 'next';
import { Besley, Libre_Franklin } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { ContrastToggle } from '@/components/contrast-toggle';
import { FontToggle } from '@/components/font-toggle';
import { ThemeCycle } from '@/components/theme-cycle';
import { ThemeProvider } from '@/components/theme-provider';
import { SealIcon } from '@/lib/icons';
import { PREFETCH_LINKS } from '@/lib/routes';
import { SITE_URL } from '@/lib/site-url';

// Runs before paint so saved (or OS-preferred) contrast and font-scale apply
// without a flash. next-themes does the same for the color theme.
const PREFS_SCRIPT = `(function () {
  try {
    var d = document.documentElement;
    var c = localStorage.getItem('contrast');
    if (c === 'high' || (c === null && window.matchMedia('(prefers-contrast: more)').matches))
      d.setAttribute('data-contrast', 'high');
    var f = localStorage.getItem('font-scale');
    if (f === 'large' || f === 'xlarge') d.setAttribute('data-font-scale', f);
  } catch (e) {}
})();`;

const besley = Besley({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-besley',
  display: 'swap',
});

const franklin = Libre_Franklin({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-franklin',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dewasa Ayu — Cek Hari Baik Upacara Hindu Bali',
    template: '%s — Dewasa Ayu',
  },
  description:
    'Cek hari baik (dewasa ayu) untuk upacara Hindu Bali berdasarkan pedoman Wariga umum. Perhitungan referensi, bukan pengganti konsultasi Sulinggih.',
  applicationName: 'Dewasa Ayu',
  openGraph: {
    type: 'website',
    siteName: 'Dewasa Ayu',
    locale: 'id_ID',
    title: 'Dewasa Ayu — Cek Hari Baik Upacara Hindu Bali',
    description:
      'Cek hari baik (dewasa ayu) untuk upacara Hindu Bali berdasarkan pedoman Wariga umum.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  // Proves site ownership to Google Search Console. Public by design (Google
  // reads it from the served HTML), not a secret. Removing it un-verifies the
  // property, so it stays even after verification succeeds.
  verification: { google: 'hA5NepM4UWDg24aThASkDmhnhqlzEFHvAqEz7NAz4H4' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Dewasa Ayu',
  url: SITE_URL,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  inLanguage: 'id-ID',
  isAccessibleForFree: true,
  description:
    'Pencari hari baik (dewasa ayu) untuk upacara Hindu Bali berdasarkan pedoman Wariga umum.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${besley.variable} ${franklin.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <a className="skip-link" href="#konten">
            Lewati ke konten
          </a>
          {/* The calendar's binding strip — signature pattern #4. */}
          <div className="redband" aria-hidden="true" />
          <div className="wrap">
            <header className="masthead anim d1">
              <Link
                className="brand"
                href="/"
                prefetch={PREFETCH_LINKS}
                aria-label="Dewasa Ayu — beranda"
              >
                <span className="name">
                  Dewasa <em>Ayu</em>
                  <small>Pencari Hari Wariga</small>
                </span>
              </Link>
              <div className="tools">
                <FontToggle />
                <ContrastToggle />
                <ThemeCycle />
              </div>
            </header>
            <main id="konten" tabIndex={-1}>
              {children}
            </main>
          </div>

          <footer className="site-footer">
            <div className="foot">
              <SealIcon className="seal" />
              <p>
                <em>Catatan.</em> Platform ini menyediakan perhitungan referensi berdasarkan pedoman{' '}
                <em>Wariga</em> umum, bukan pengganti konsultasi <em>Sulinggih</em> atau{' '}
                <em>Pemangku</em>. Perhitungan Sasih bersifat estimasi dan dapat berbeda dengan
                variasi tradisi regional.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
