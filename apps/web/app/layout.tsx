import './globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Dewasa Ayu',
  description:
    'Pencari hari baik (dewasa ayu) untuk upacara Hindu Bali berdasarkan kalender Wariga.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
