export type Technology = 'wind' | 'solar' | 'battery';
export type Tier = 'federal' | 'state' | 'local';
export type CapitalImpact = 'tax_equity' | 'debt_sizing' | 'construction' | 'offtake_merchant';
export type Confidence = 'verified' | 'auto' | 'stale';
export type RiskLevel = 'Low' | 'Moderate' | 'Elevated' | 'High';

/**
 * A single political or regulatory risk factor for a state.
 * Severity is keyed per technology — a factor can apply to multiple techs
 * at different intensities. Severity 0 means the factor was evaluated and
 * is currently non-binding or resolved; it is included in scoring so that
 * re-activation changes the score predictably, but suppressed in the UI
 * by default.
 */
export interface RiskFactor {
  id: string;
  tier: Tier;
  /** Technologies this factor is relevant to. */
  technologies: Technology[];
  /** Per-technology severity: 0 = resolved/non-binding, 1 = low, 2 = moderate, 3 = high. */
  severity: Record<Technology, 0 | 1 | 2 | 3>;
  capitalImpact: CapitalImpact;
  /** Human-readable current status, e.g. "IRA safe harbour expires Dec 2026." */
  status: string;
  sourceUrl?: string;
  /** ISO date string "YYYY-MM-DD" indicating when this factor was last reviewed. */
  lastVerified: string;
  confidence: Confidence;
}

/**
 * A protective factor that reduces a tier's risk score.
 * Mitigants are NOT negative severity values — they are a separate concept.
 * A state-tier mitigant (e.g. a renewable mandate) reduces the state score only;
 * it does not affect federal or local scores.
 */
export interface Mitigant {
  id: string;
  tier: Tier;
  /** Technologies this mitigant is relevant to. */
  technologies: Technology[];
  /**
   * Score-point reduction to apply to this tier's risk score, keyed by technology.
   * Floored at 0 — a mitigant cannot push a tier below zero.
   * Use Partial<> because a mitigant may not apply equally to all technologies.
   */
  reduction: Partial<Record<Technology, number>>;
  /** Short display label, e.g. "Virginia Clean Economy Act (VCEA)". */
  label: string;
  /** Human-readable description of what makes this a protective factor. */
  status: string;
  sourceUrl?: string;
  /** ISO date string "YYYY-MM-DD". */
  lastVerified: string;
  confidence: Confidence;
}

export interface StateRecord {
  /** Two-letter USPS abbreviation. */
  code: string;
  name: string;
  factors: RiskFactor[];
  /** Protective factors that reduce tier scores. Optional — omit for states with none. */
  mitigants?: Mitigant[];
}

/**
 * Level thresholds applied to the 0–100 overall score.
 * Stored in a config struct so per-technology overrides can be added
 * later (e.g. battery Elevated kicks in at 45 instead of 50) without
 * changing assess()'s signature or algorithm.
 */
export interface LevelThresholds {
  high: number;
  elevated: number;
  moderate: number;
}

export interface ThresholdConfig {
  default: LevelThresholds;
  /** Optional per-tech overrides; missing keys fall back to default. */
  perTech?: Partial<Record<Technology, Partial<LevelThresholds>>>;
}

/** Per-tier breakdown returned alongside every overall score. */
export interface TierResult {
  tier: Tier;
  /** Raw risk score before any mitigant reductions are applied (0–100). */
  rawRiskScore: number;
  /** Final score after mitigants, floored at 0. Equal to rawRiskScore when no mitigants apply. */
  score: number;
  /** All applicable factors for this tier, including severity-0 ones. */
  factors: RiskFactor[];
  /** Mitigants applied to this tier for the assessed technology. */
  mitigants: Mitigant[];
}

/** Full result returned by assess(). Every number is traceable to factors + weights. */
export interface AssessmentResult {
  technology: Technology;
  /** Weighted overall score, 0–100. */
  overallScore: number;
  level: RiskLevel;
  tiers: TierResult[];
}
