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

export interface StateRecord {
  /** Two-letter USPS abbreviation. */
  code: string;
  name: string;
  factors: RiskFactor[];
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
  /** Normalized 0–100 score for this tier. */
  score: number;
  /** All applicable factors for this tier, including severity-0 ones. */
  factors: RiskFactor[];
}

/** Full result returned by assess(). Every number is traceable to factors + weights. */
export interface AssessmentResult {
  technology: Technology;
  /** Weighted overall score, 0–100. */
  overallScore: number;
  level: RiskLevel;
  tiers: TierResult[];
}
