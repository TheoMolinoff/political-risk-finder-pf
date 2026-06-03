'use client';

import { useState } from 'react';
import type { Technology, TierResult } from '@/lib/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { FactorRow } from './FactorRow';

const TIER_LABELS: Record<string, string> = {
  federal: 'Federal',
  state: 'State',
  local: 'Local',
};

interface TierCardProps {
  result: TierResult;
  tech: Technology;
}

export function TierCard({ result, tech }: TierCardProps) {
  const [showResolved, setShowResolved] = useState(false);

  const bindingFactors = result.factors.filter((f) => f.severity[tech] > 0);
  const resolvedFactors = result.factors.filter((f) => f.severity[tech] === 0);
  const visibleFactors = showResolved ? result.factors : bindingFactors;
  const hasMitigants = result.mitigants.length > 0;
  const isMitigated = hasMitigants && result.score < result.rawRiskScore;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {TIER_LABELS[result.tier]}
        </h3>
        <div className="flex items-baseline gap-1.5">
          {isMitigated && (
            <>
              <span className="text-base tabular-nums text-slate-400 line-through">
                {result.rawRiskScore.toFixed(0)}
              </span>
              <span className="text-xs text-slate-400">→</span>
            </>
          )}
          <span className="text-2xl font-bold tabular-nums text-slate-800">
            {result.score.toFixed(0)}
          </span>
          <span className="text-sm text-slate-400">/100</span>
        </div>
      </div>

      <div className="px-5">
        {/* Risk factors */}
        {visibleFactors.length === 0 ? (
          <p className="py-5 text-sm italic text-slate-400">
            No applicable risk factors for this technology at the{' '}
            {TIER_LABELS[result.tier].toLowerCase()} level.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleFactors.map((factor) => (
              <FactorRow key={factor.id} factor={factor} tech={tech} />
            ))}
          </div>
        )}

        {resolvedFactors.length > 0 && (
          <div className="border-t border-slate-100 py-3">
            <button
              onClick={() => setShowResolved((v) => !v)}
              className="text-xs text-slate-400 transition-colors hover:text-slate-600"
            >
              {showResolved
                ? `Hide resolved / non-binding factors (${resolvedFactors.length})`
                : `Show resolved / non-binding factors (${resolvedFactors.length})`}
            </button>
          </div>
        )}

        {/* Mitigants section */}
        {hasMitigants && (
          <div className="mt-1 border-t border-green-100 bg-green-50 -mx-5 px-5 py-4 rounded-b-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-green-700">
              Mitigants
              {isMitigated && (
                <span className="ml-2 font-normal normal-case tracking-normal text-green-600">
                  — score reduced {result.rawRiskScore.toFixed(0)} → {result.score.toFixed(0)} after mitigants
                </span>
              )}
            </p>
            <div className="flex flex-col gap-3">
              {result.mitigants.map((m) => (
                <div key={m.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">{m.label}</p>
                      <p className="mt-0.5 text-sm leading-snug text-green-700">{m.status}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {m.reduction[tech] !== undefined && (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          −{m.reduction[tech]} pts
                        </span>
                      )}
                      <ConfidenceBadge confidence={m.confidence} />
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-green-600/70">
                    <span>Last verified {m.lastVerified}</span>
                    {m.sourceUrl && (
                      <a
                        href={m.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline transition-colors hover:text-green-800"
                      >
                        Source ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
