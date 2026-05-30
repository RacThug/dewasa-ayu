'use client';

import { useState } from 'react';

import { LinkIcon, WhatsAppIcon } from '@/lib/icons';

export function Share({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  const openWhatsApp = (): void => {
    const text = `${message} — ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — silently ignore (the link is in the address bar).
    }
  };

  return (
    <div className="share anim d6">
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          openWhatsApp();
        }}
        aria-label="Bagikan ke WhatsApp"
      >
        <WhatsAppIcon /> Bagikan
      </a>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          void copyLink();
        }}
        aria-label="Salin tautan"
      >
        <LinkIcon /> {copied ? 'Tersalin' : 'Salin tautan'}
      </a>
    </div>
  );
}
