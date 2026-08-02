'use client';

import { motion } from 'framer-motion';

import { type CheckResult } from '@/lib/api';
import { factorRows } from '@/lib/display';
import { CheckIcon, CrossIcon } from '@/lib/icons';

export function Rincian({ result, date }: { result: CheckResult; date: string }) {
  const rows = factorRows(result.evaluation.checks, result.info);
  return (
    <motion.div
      key={date}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut', delay: 0.05 }}
      className="factors"
    >
      <h2 className="card-title">Rincian Wariga</h2>
      <ul className="rules">
        {rows.map((r, i) => (
          <motion.li
            key={r.name}
            className="rule"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
          >
            <span className={`rule-badge ${r.passed ? 'pass' : 'fail'}`} aria-hidden="true">
              {r.passed ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span className="rule-text">
              <span className="rule-name">{r.name}</span>
              <span className="rule-why">{r.why}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
