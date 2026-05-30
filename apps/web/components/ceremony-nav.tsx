import type { CeremonyId } from '@dewasa-ayu/types';
import Link from 'next/link';

import { CEREMONIES } from '@/lib/api';

export function CeremonyNav({
  active,
  hrefFor,
}: {
  active: string;
  hrefFor: (id: CeremonyId) => string;
}) {
  return (
    <nav aria-label="Pilih jenis upacara" className="anim d2">
      <ul className="ceremonies">
        {CEREMONIES.map((c) => (
          <li key={c.id}>
            <Link
              href={hrefFor(c.id)}
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
