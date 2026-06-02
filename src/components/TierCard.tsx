'use client';

import { useState } from 'react';
import type { Technology, TierResult } from '@/lib/types';
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

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {TIER_LABELS[result.tier]}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums text-slate-800">
            {result.score.toFixed(0)}
          </span>
          <span className="text-sm text-slate-400">/100</span>
        </div>
      </div>

      {/* Factor list */}
      <div className="px-5">
        {visibleFactors.length === 0 ? (
          <p className="py-5 text-sm italic text-slate-400">
            No applicable risk factors for this technology at the {TIER_LABELS[result.tier].toLowerCase()} level.
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
      </div>
    </div>
  );
}
