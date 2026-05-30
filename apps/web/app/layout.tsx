import './globals.css';

import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { FontToggle } from '@/components/font-toggle';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { LeafMark, SealIcon } from '@/lib/icons';

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

export const metadata: Metadata = {
  title: 'Dewasa Ayu — Cek Hari Baik Upacara',
  description:
    'Cek hari baik (dewasa ayu) untuk upacara Hindu Bali berdasarkan pedoman Wariga umum. Perhitungan referensi, bukan pengganti konsultasi Sulinggih.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <ThemeProvider>
          <div className="wrap">
            <header className="site-header anim d1">
              <Link className="brand" href="/" aria-label="Dewasa Ayu — beranda">
                <LeafMark className="leaf-mark" />
                <span className="name">
                  Dewasa Ayu<small>Pencari Hari Wariga</small>
                </span>
              </Link>
              <div className="tools">
                <FontToggle />
                <ThemeToggle />
              </div>
            </header>
            {children}
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
