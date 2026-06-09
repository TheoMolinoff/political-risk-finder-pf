import type { RiskFactor, Technology } from '@/lib/types';
import { ConfidenceBadge } from './ConfidenceBadge';

const CAPITAL_IMPACT_LABELS: Record<string, string> = {
  tax_equity: 'Tax Equity',
  debt_sizing: 'Debt Sizing',
  construction: 'Construction',
  offtake_merchant: 'Offtake / Merchant',
};

const BASIS_LABELS: Record<string, string> = {
  'data-anchored': 'Data-anchored',
  qualitative: 'Qualitative judgment',
};

interface FactorRowProps {
  factor: RiskFactor;
  tech: Technology;
}

export function FactorRow({ factor, tech }: FactorRowProps) {
  const severity = factor.severity[tech];
  const isResolved = severity === 0;
  const hasBasis = factor.metric || factor.rubric || factor.basis;

  return (
    <div className={`py-3.5 ${isResolved ? 'opacity-55' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="flex-1 text-sm leading-snug text-slate-700">{factor.status}</p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {CAPITAL_IMPACT_LABELS[factor.capitalImpact]}
          </span>
          <ConfidenceBadge confidence={factor.confidence} />
        </div>
      </div>

      {hasBasis && (
        <div className="mt-2 rounded-md border-l-2 border-slate-300 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
          {factor.basis && (
            <span
              className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                factor.basis === 'data-anchored'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {BASIS_LABELS[factor.basis]}
            </span>
          )}
          {factor.metric && (
            <p className="mt-0.5">
              <span className="font-semibold text-slate-700">Metric: </span>
              {factor.metric}
            </p>
          )}
          {factor.rubric && (
            <p className="mt-1">
              <span className="font-semibold text-slate-700">Rubric: </span>
              {factor.rubric}
            </p>
          )}
        </div>
      )}

      <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
        <span>Last verified {factor.lastVerified}</span>
        {factor.sourceUrl && (
          <a 
            href={factor.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-slate-600"
          >
            Source ↗
          </a>
        )}
        {isResolved && (
          <span className="font-medium text-green-600">Resolved / non-binding</span>
        )}
      </div>
    </div>
  );
}