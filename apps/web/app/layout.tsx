import './globals.css';
import 'react-day-picker/style.css';

import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { ContrastToggle } from '@/components/contrast-toggle';
import { FontToggle } from '@/components/font-toggle';
import { PageNav } from '@/components/page-nav';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { LeafMark, SealIcon } from '@/lib/icons';

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

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-dmsans',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
    <html lang="id" suppressHydrationWarning className={`${cormorant.variable} ${dmSans.variable}`}>
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
          <div className="wrap">
            <header className="site-header anim d1">
              <Link className="brand" href="/" aria-label="Dewasa Ayu — beranda">
                <LeafMark className="leaf-mark" />
                <span className="name">
                  Dewasa Ayu<small>Pencari Hari Wariga</small>
                </span>
              </Link>
              <PageNav />
              <div className="tools">
                <FontToggle />
                <ContrastToggle />
                <ThemeToggle />
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
