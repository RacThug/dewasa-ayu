'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Cek Hari' },
  { href: '/kalender', label: 'Kalender' },
  { href: '/rekomendasi', label: 'Rekomendasi' },
];

export function PageNav() {
  const path = usePathname();
  return (
    <nav className="page-nav" aria-label="Navigasi halaman">
      {LINKS.map((l) => {
        const active = path === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? 'active' : undefined}
            aria-current={active ? 'page' : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
