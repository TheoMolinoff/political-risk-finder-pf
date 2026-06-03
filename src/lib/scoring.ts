import type {
  AssessmentResult,
  LevelThresholds,
  Mitigant,
  RiskFactor,
  RiskLevel,
  StateRecord,
  Technology,
  Tier,
  ThresholdConfig,
  TierResult,
} from './types';

// Weights must sum to 1.0 per technology. Tune here — this is the only place.
const TIER_WEIGHTS: Record<Technology, Record<Tier, number>> = {
  wind:    { federal: 0.45, state: 0.25, local: 0.30 }, // local setbacks/moratoria are a primary wind risk
  solar:   { federal: 0.45, state: 0.30, local: 0.25 }, // ITC/permitting-driven; siting friction is secondary
  battery: { federal: 0.25, state: 0.35, local: 0.40 }, // interconnection + local fire-code ordinances dominate
};

const DEFAULT_THRESHOLDS: LevelThresholds = {
  high: 70,
  elevated: 50,
  moderate: 30,
};

const DEFAULT_CONFIG: ThresholdConfig = {
  default: DEFAULT_THRESHOLDS,
};

const TIERS: Tier[] = ['federal', 'state', 'local'];

function resolveThresholds(tech: Technology, config: ThresholdConfig): LevelThresholds {
  const overrides = config.perTech?.[tech] ?? {};
  return { ...config.default, ...overrides };
}

function scoreToLevel(score: number, thresholds: LevelThresholds): RiskLevel {
  if (score >= thresholds.high) return 'High';
  if (score >= thresholds.elevated) return 'Elevated';
  if (score >= thresholds.moderate) return 'Moderate';
  return 'Low';
}

function scoreTier(factors: RiskFactor[], tech: Technology): number {
  const bindingCount = factors.filter((f) => f.severity[tech] > 0).length;

  // Denominator uses only binding factors (severity > 0). A resolved/non-binding
  // factor (severity 0) contributes nothing to the numerator, so including it in
  // the denominator would dilute the score — making a tier look safer simply
  // because a resolved risk was documented. Documenting resolved risks must be
  // costless to the score. This is a targeted fix; the broader sensitivity to
  // total factor count (a sparsely-documented state can still outscore a
  // well-documented one) remains a known limitation flagged for Phase 2.
  if (bindingCount === 0) return 0;

  const sum = factors.reduce((acc, f) => acc + f.severity[tech], 0);
  const maxPossible = bindingCount * 3;

  return (sum / maxPossible) * 100;
}

/**
 * Deterministic assessment of a state for a given technology.
 * No LLM involvement — this function is a pure computation over structured data.
 * Every output score is traceable to the factors and weights in this file.
 */
export function assess(
  state: StateRecord,
  tech: Technology,
  config: ThresholdConfig = DEFAULT_CONFIG
): AssessmentResult {
  const thresholds = resolveThresholds(tech, config);

  const tiers: TierResult[] = TIERS.map((tier) => {
    const factors = state.factors.filter(
      (f) => f.tier === tier && f.technologies.includes(tech)
    );
    const rawRiskScore = scoreTier(factors, tech);

    // Mitigants are tier-scoped: a state policy (e.g. a renewable mandate) reduces
    // only the state tier score — it cannot offset federal or local risks. Reductions
    // are summed and the final score is floored at 0; a strong mitigant cannot produce
    // a negative score.
    const applicableMitigants: Mitigant[] = (state.mitigants ?? []).filter(
      (m) => m.tier === tier && m.technologies.includes(tech)
    );
    const totalReduction = applicableMitigants.reduce(
      (acc, m) => acc + (m.reduction[tech] ?? 0),
      0
    );
    const score = Math.max(0, rawRiskScore - totalReduction);

    return { tier, rawRiskScore, score, factors, mitigants: applicableMitigants };
  });

  const overallScore = tiers.reduce(
    (acc, { tier, score }) => acc + score * TIER_WEIGHTS[tech][tier],
    0
  );

  return {
    technology: tech,
    overallScore: Math.round(overallScore * 10) / 10,
    level: scoreToLevel(overallScore, thresholds),
    tiers,
  };
}
