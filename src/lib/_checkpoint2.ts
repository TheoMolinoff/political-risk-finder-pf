/**
 * Post-mitigant checkpoint — run with: npx tsx src/lib/_checkpoint2.ts
 * Confirms:
 *   1. Texas scores are unchanged from Phase 0 checkpoint (no mitigants).
 *   2. Virginia state-tier score is visibly reduced by the VCEA.
 *   3. Virginia federal/local scores are NOT affected by the VCEA.
 */
import { assess } from './scoring';
import { STATES } from '../data/states';
import type { Technology } from './types';

const techs: Technology[] = ['wind', 'solar', 'battery'];

for (const state of STATES) {
  console.log(`\n${'═'.repeat(52)}`);
  console.log(`  ${state.name} (${state.code})`);
  console.log('═'.repeat(52));
  for (const tech of techs) {
    const r = assess(state, tech);
    console.log(`\n  ${tech.toUpperCase()}  overall=${r.overallScore.toFixed(1)} → ${r.level}`);
    for (const t of r.tiers) {
      const mitigated = t.score < t.rawRiskScore;
      const scoreStr = mitigated
        ? `raw=${t.rawRiskScore.toFixed(1)} → mitigated=${t.score.toFixed(1)}`
        : `score=${t.score.toFixed(1)}`;
      const mitigantIds = t.mitigants.map((m) => m.id).join(', ') || '—';
      console.log(`    ${t.tier.padEnd(8)} ${scoreStr.padEnd(36)} mitigants=[${mitigantIds}]`);
    }
  }
}
