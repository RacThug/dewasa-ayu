'use client';

import { useState } from 'react';

import { ShareUpIcon } from '@/lib/icons';

/**
 * Share the current verdict. Uses the Web Share sheet when available, otherwise
 * copies the page URL + message to the clipboard and shows a brief toast.
 */
export function ShareButton({ message }: { message: string }) {
  const [toast, setToast] = useState('');

  const flash = (msg: string): void => {
    setToast(msg);
    setTimeout(() => setToast(''), 1900);
  };

  const onShare = (): void => {
    const text = `${message} — ${window.location.href}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      void navigator.share({ title: 'Dewasa Ayu', text }).catch(() => {});
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text).then(
        () => flash('Disalin ke clipboard'),
        () => flash('Tidak bisa menyalin'),
      );
      return;
    }
    flash('Tidak didukung di perangkat ini');
  };

  return (
    <>
      <button type="button" className="share-btn" aria-label="Bagikan hasil" onClick={onShare}>
        <ShareUpIcon />
        <span className="share-btn-label">Bagikan</span>
      </button>
      {toast && (
        <div className="app-toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
