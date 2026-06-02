import type { Confidence } from '@/lib/types';

const STYLES: Record<Confidence, { label: string; className: string }> = {
  verified: {
    label: 'Verified',
    className: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  },
  auto: {
    label: 'Auto',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  },
  stale: {
    label: 'Stale',
    className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  },
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { label, className } = STYLES[confidence];
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
