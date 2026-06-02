/**
 * Phase 0 checkpoint script — run with:
 *   npx tsx src/lib/_checkpoint.ts
 *
 * Verifies that assess() produces wind > solar > battery for Texas
 * and that every tier score is traceable to the factor table.
 * Delete this file after the checkpoint is confirmed.
 */
import { assess } from './scoring';
import { getState } from '../data/states';
import type { Technology } from './types';

const tx = getState('TX');
if (!tx) throw new Error('Texas not found in state data');

const techs: Technology[] = ['wind', 'solar', 'battery'];

for (const tech of techs) {
  const result = assess(tx, tech);
  console.log(`\n=== ${tech.toUpperCase()} ===`);
  console.log(`Overall: ${result.overallScore} → ${result.level}`);
  for (const t of result.tiers) {
    const bindingFactors = t.factors.filter((f) => f.severity[tech] > 0);
    console.log(
      `  ${t.tier.padEnd(8)} score=${t.score.toFixed(1).padStart(5)}  ` +
        `factors(binding=${bindingFactors.length}, total=${t.factors.length}): ` +
        t.factors.map((f) => `${f.id.replace('tx-', '')}[${f.severity[tech]}]`).join(', ')
    );
  }
}
