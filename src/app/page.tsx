'use client';

import { useState } from 'react';
import { STATES } from '@/data/states';
import { assess } from '@/lib/scoring';
import type { RiskLevel, Technology } from '@/lib/types';
import { TierCard } from '@/components/TierCard';

const TECHNOLOGIES: { id: Technology; label: string }[] = [
  { id: 'wind', label: 'Wind' },
  { id: 'solar', label: 'Solar' },
  { id: 'battery', label: 'Battery Storage' },
];

const LEVEL_STYLES: Record<RiskLevel, { border: string; text: string; bg: string }> = {
  High:     { border: 'border-l-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
  Elevated: { border: 'border-l-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
  Moderate: { border: 'border-l-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50'  },
  Low:      { border: 'border-l-green-500',  text: 'text-green-700',  bg: 'bg-green-50'  },
};

export default function Home() {
  const [selectedStateCode, setSelectedStateCode] = useState<string>('TX');
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);

  const stateRecord = STATES.find((s) => s.code === selectedStateCode);
  const result = stateRecord && selectedTech ? assess(stateRecord, selectedTech) : null;
  const levelStyle = result ? LEVEL_STYLES[result.level] : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        {/* ── Header ── */}
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Project Finance Risk Tool
          </p>
          <h1 className="text-2xl font-bold text-slate-900">
            US Renewable Energy — Political &amp; Regulatory Risk
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Risk scores are deterministic — computed from verified structured data, not AI inference.
            Every factor carries a last-verified date and a confidence rating.
          </p>
        </header>

        {/* ── Controls ── */}
        <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-10">
          {/* State selector */}
          <div>
            <label
              htmlFor="state-select"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              State
            </label>
            <select
              id="state-select"
              value={selectedStateCode}
              onChange={(e) => {
                setSelectedStateCode(e.target.value);
                setSelectedTech(null);
              }}
              className="block rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              {STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Technology toggles */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Technology
            </p>
            <div className="flex gap-2">
              {TECHNOLOGIES.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTech(selectedTech === id ? null : id)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTech === id
                      ? 'border-slate-700 bg-slate-800 text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Results ── */}
        {result && levelStyle ? (
          <section>
            {/* Overall level banner */}
            <div
              className={`mb-6 rounded-lg border-l-4 ${levelStyle.border} ${levelStyle.bg} px-5 py-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {stateRecord?.name} &mdash;{' '}
                    {TECHNOLOGIES.find((t) => t.id === selectedTech)?.label}
                  </p>
                  <p className={`mt-0.5 text-3xl font-bold ${levelStyle.text}`}>
                    {result.level} Risk
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Score</p>
                  <p className={`text-4xl font-bold tabular-nums ${levelStyle.text}`}>
                    {result.overallScore.toFixed(0)}
                  </p>
                  <p className="text-xs text-slate-400">/ 100</p>
                </div>
              </div>
            </div>

            {/* Tier cards */}
            <div className="flex flex-col gap-4">
              {result.tiers.map((tier) => (
                <TierCard key={tier.tier} result={tier} tech={result.technology} />
              ))}
            </div>
          </section>
        ) : (
          /* Empty state */
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
            <p className="text-sm text-slate-400">
              Select a technology above to see the risk assessment
              {stateRecord ? ` for ${stateRecord.name}` : ''}.
            </p>
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-400">
          <p>
            Data sourced from public records only. Scores are deterministic; the AI narrative layer
            (Phase 2) writes explanatory prose only — it does not generate scores, laws, or dates.
          </p>
        </footer>

      </div>
    </main>
  );
}
