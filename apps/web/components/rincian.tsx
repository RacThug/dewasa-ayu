import { type CheckResult } from '@/lib/api';
import { factorRows } from '@/lib/display';
import { CheckIcon, CrossIcon } from '@/lib/icons';

export function Rincian({ result }: { result: CheckResult }) {
  const rows = factorRows(result.evaluation.checks, result.info);
  return (
    <div className="panel-card rules-card">
      <h2 className="card-title">Rincian Wariga</h2>
      <ul className="rules">
        {rows.map((r) => (
          <li key={r.name} className="rule">
            <span className={`rule-badge ${r.passed ? 'pass' : 'fail'}`} aria-hidden="true">
              {r.passed ? <CheckIcon /> : <CrossIcon />}
            </span>
            <span className="rule-text">
              <span className="rule-name">{r.name}</span>
              <span className="rule-why">{r.why}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
