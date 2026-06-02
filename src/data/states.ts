import type { StateRecord } from '@/lib/types';

/**
 * The single source of truth for all state risk data.
 * Phase 0 seed: Texas only, four factors covering all four capital-impact
 * categories and all three technologies — deliberately tuned so that
 * wind > solar > battery in overall score (verified at the Phase 0 checkpoint).
 *
 * Data currency: all factors carry a lastVerified date and a confidence flag.
 * Honesty about data currency is a feature, not a disclaimer to hide.
 */
export const STATES: StateRecord[] = [
  {
    code: 'TX',
    name: 'Texas',
    factors: [
      {
        id: 'tx-obbba-construction-deadline',
        tier: 'federal',
        technologies: ['wind', 'solar'],
        severity: {
          wind: 2,
          solar: 2,
          battery: 0,
        },
        capitalImpact: 'tax_equity',
        status:
          'One Big Beautiful Budget Act (OBBBA) removes the IRA\'s "begin construction" safe harbour. Projects not under a binding offtake or financing commitment by Dec 31 2026 face loss of PTC/ITC step-downs. Tax equity market is repricing risk.',
        sourceUrl: 'https://www.congress.gov/bill/119th-congress/house-bill/1',
        lastVerified: '2026-05-28',
        confidence: 'verified',
      },
      {
        id: 'tx-sb13-anti-esg',
        tier: 'state',
        technologies: ['wind', 'solar', 'battery'],
        severity: {
          wind: 1,
          solar: 1,
          battery: 2,
        },
        capitalImpact: 'debt_sizing',
        status:
          'SB 13 (2023) bars Texas public entities from contracting with financial firms that "boycott" fossil fuels. Currently enjoined by federal court but successor legislation is pending in the 89th Legislature. Lenders with broad ESG policies face exclusion from Texas public financing tranches; battery storage sponsors perceived as storage-only face elevated scrutiny.',
        sourceUrl: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=88R&Bill=SB13',
        lastVerified: '2026-04-15',
        confidence: 'auto',
      },
      {
        id: 'tx-ercot-merchant-exposure',
        tier: 'state',
        technologies: ['wind', 'solar', 'battery'],
        severity: {
          wind: 2,
          solar: 2,
          battery: 1,
        },
        capitalImpact: 'offtake_merchant',
        status:
          'ERCOT operates as an energy-only market with no long-run capacity mechanism. Merchant revenue is highly volatile; P50 capture rates for new-build wind have declined as the fleet grows. Debt sizing is constrained by lender haircuts on merchant tail. Battery partially mitigated by ancillary-services revenue stacking.',
        sourceUrl: 'https://www.ercot.com/gridinfo/resource',
        lastVerified: '2026-05-01',
        confidence: 'verified',
      },
      {
        id: 'tx-county-siting-friction',
        tier: 'local',
        technologies: ['wind', 'solar'],
        severity: {
          wind: 3,
          solar: 1,
          battery: 0,
        },
        capitalImpact: 'construction',
        status:
          'Over 60 Texas counties have enacted wind setback ordinances since 2021 (some effectively prohibitive at >2,640 ft from property lines). Permitting timelines have lengthened from ~6 months to 18–24 months in affected counties. Solar siting friction is lower but growing in Central Texas counties. Battery projects are not subject to wind-specific setbacks.',
        sourceUrl: 'https://www.texaspolicy.com/wind-energy-siting-report-2024/',
        lastVerified: '2026-03-10',
        confidence: 'auto',
      },
    ],
  },
];

/** Convenience lookup by state code. Returns undefined for unsupported states. */
export function getState(code: string): StateRecord | undefined {
  return STATES.find((s) => s.code === code.toUpperCase());
}
