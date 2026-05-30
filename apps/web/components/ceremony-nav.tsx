import Link from 'next/link';

import { CEREMONIES } from '@/lib/api';

export function CeremonyNav({ active, date }: { active: string; date: string }) {
  return (
    <nav aria-label="Pilih jenis upacara" className="anim d2">
      <ul className="ceremonies">
        {CEREMONIES.map((c) => (
          <li key={c.id}>
            <Link
              href={`/?ceremony=${c.id}&date=${date}`}
              className={c.id === active ? 'active' : undefined}
              aria-current={c.id === active ? 'page' : undefined}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
