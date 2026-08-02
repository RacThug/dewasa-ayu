'use client';

import { motion } from 'framer-motion';

import { ShareButton } from '@/components/share-button';
import { CEREMONIES, type CheckResult } from '@/lib/api';
import { cap, formatID, monthLabel, PRINT_VERDICT, sasihLabel } from '@/lib/display';

export function summaryText(rating: string, forText: string): string {
  if (rating === 'ayu') return `Hari yang baik menurut pedoman Wariga umum untuk ${forText}.`;
  if (rating === 'caution')
    return `Cukup baik dengan catatan — pertimbangkan, dan bila perlu konsultasikan terlebih dahulu.`;
  return `Sebaiknya dihindari untuk ${forText}; pertimbangkan memilih tanggal lain.`;
}

/**
 * The "turned page" head of the detail panel: oversized date numeral,
 * wewaran headline, stamp verdict + slab score fraction (DESIGN.md
 * signature patterns #2 and #3).
 */
export function Hero({
  result,
  cer,
  date,
}: {
  result: CheckResult;
  cer: (typeof CEREMONIES)[number];
  date: string;
}) {
  const { info, evaluation: ev } = result;
  const v = PRINT_VERDICT[ev.rating];
  const pct = Math.round(ev.pct);
  const dayNum = Number(date.slice(8, 10));

  return (
    <motion.div
      key={date + cer.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`verdict ${v.cls}`}
      aria-labelledby="verdict-h"
    >
      <div className="verdict-top">
        <div className="verdict-when">
          <span className="verdict-eyebrow">{formatID(date)}</span>
          <span className="verdict-cernote">Dinilai untuk · {cer.label}</span>
        </div>
        <ShareButton
          message={`Dewasa Ayu — ${cer.label}, ${formatID(date)}: ${v.word} (${pct}/100)`}
        />
      </div>

      <div className="verdict-head">
        <p className="bignum">
          {dayNum}
          <small>{monthLabel(Number(date.slice(0, 4)), Number(date.slice(5, 7)))}</small>
        </p>
        <div className="verdict-who">
          <p className="wewaran-line" id="verdict-h">
            {cap(info.saptawara)} {cap(info.pancawara)}, wuku {cap(info.wuku)}
          </p>
          <p className="sasih-line">
            Sasih {sasihLabel(info)} · Saka {info.sasih.tahunSaka} · ingkel {cap(info.ingkel)} ·
            urip {info.totalUrip}
            <sup aria-hidden="true">*</sup>
          </p>
        </div>
      </div>

      <div className="stamp-row">
        <motion.span
          className="stamp"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut', delay: 0.08 }}
        >
          {v.stamp}
        </motion.span>
        <span className="score-frac" aria-label={`Skor ${pct} dari 100`}>
          {pct}
          <sub aria-hidden="true">/100</sub>
        </span>
      </div>

      <p className="verdict-summary">{summaryText(ev.rating, cer.forText)}</p>
    </motion.div>
  );
}
