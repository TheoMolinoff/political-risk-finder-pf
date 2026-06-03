import type { Mitigant, StateRecord } from '@/lib/types';

// ─── Shared mitigant objects ───────────────────────────────────────────────
// Defined separately so they can be referenced or reused without duplication.

const va_vcea: Mitigant = {
  id: 'va-vcea-mandate',
  tier: 'state',
  technologies: ['wind', 'solar', 'battery'],
  // VCEA mandates 100% carbon-free electricity for Dominion Energy by 2045 and
  // Appalachian Power by 2050, with binding interim RPS targets. The mandatory
  // offtake obligation materially reduces merchant revenue risk for wind and solar
  // (utilities must procure; price floor via REC compliance costs). Battery
  // procurement targets (3,100 MW by 2035 for Dominion) provide similar support
  // but are less mature and face rate-case uncertainty — reduction is lower.
  reduction: { wind: 25, solar: 25, battery: 15 },
  label: 'Virginia Clean Economy Act (VCEA)',
  status:
    'VCEA mandates 100% carbon-free electricity by 2045 (Dominion) / 2050 (APCo) with binding interim RPS targets and 3,100 MW battery procurement mandate. Mandatory utility offtake obligations reduce merchant revenue risk for wind and solar; battery procurement targets provide more limited but real support.',
  sourceUrl: 'https://law.lis.virginia.gov/vacode/title56/chapter23/section56-585.1/',
  lastVerified: '2026-06-03',
  confidence: 'verified',
};
/**
 * The single source of truth for all state risk data.
 * Texas: five factors across federal/state/local tiers, every severity
 * sourced from public reporting (see per-factor citations). All factors
 * carry a lastVerified date and a confidence flag — honesty about data
 * currency is a feature, not a disclaimer to hide.
 */
export const STATES: StateRecord[] = [
  {
    code: "TX",
    name: "Texas",
    factors: [
      // ─── FEDERAL ───
      {
        id: "tx-obbba-cliff",
        tier: "federal",
        technologies: ["wind", "solar", "battery"],
        // OBBBA phasing out clean-energy tax credits by mid-2026 with narrow
        // safe-harbor windows (Pexapark, Nov 2025). Battery exposure is real but
        // secondary — ITC access limited for some battery developers, mainly
        // later in the decade (Modo Energy, Feb 2026).
        severity: { wind: 2, solar: 2, battery: 1 },
        capitalImpact: "tax_equity",
        status:
          "OBBBA phases out ITC/PTC by mid-2026 with narrow safe-harbor windows; wind/solar materially exposed, battery secondarily.",
        sourceUrl:
          "https://pexapark.com/blog/battery-storage-values-reach-record-highs-in-ercot-defying-policy-impacts-on-wind-and-solar-deals-pexapark/",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },
  
      // ─── STATE ───
      {
        id: "tx-sb13-antiesg",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // SB 13 (anti-ESG lending blacklist) declared unconstitutional and
        // enjoined Feb 4 2026 (W.D. Tex.). Currently NON-BINDING — scored 0 —
        // but kept in the model: ruling is likely to be appealed, so the risk
        // category remains relevant for lender diligence. Surfaces under the
        // "show resolved/non-binding factors" toggle.
        severity: { wind: 0, solar: 0, battery: 0 },
        capitalImpact: "debt_sizing",
        status:
          "SB 13 anti-ESG lending law struck down and enjoined Feb 2026; currently non-binding but appeal likely.",
        sourceUrl:
          "https://www.texastribune.org/2026/02/04/texas-investment-divest-boycott-fossil-fuels-lawsuit-ruling-esg/",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },
      {
        id: "tx-sb819-siting",
        tier: "state",
        technologies: ["wind", "solar"],
        // SB 819 (statewide PUC permitting + setbacks + fees for wind/solar 10MW+)
        // passed the TX Senate 22-9 but died in the House this session
        // (Pexapark, May 2025). Scored 1 for wind/solar as a recurring legislative
        // threat likely to return. Did NOT cover battery storage.
        severity: { wind: 1, solar: 1, battery: 0 },
        capitalImpact: "construction",
        status:
          "SB 819 statewide siting/permitting bill defeated in House this session but a recurring threat; targeted wind/solar 10MW+, not battery.",
        sourceUrl:
          "https://pexapark.com/blog/texas-decides-against-breaking-up-with-renewables/",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },
      {
        id: "tx-ercot-merchant",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // ERCOT energy-only merchant market: capture prices ~$17/MWh for wind &
        // solar in 2025, at bottom of LCOE (Modo Energy, Oct 2025); battery
        // merchant revenue collapsed ~90% from $149 to ~$17/kWh 2023→2025
        // (Enverus / ess-news, Nov 2025). Material for all three technologies.
        severity: { wind: 2, solar: 2, battery: 2 },
        capitalImpact: "offtake_merchant",
        status:
          "ERCOT energy-only market: depressed capture prices and battery revenue collapse make merchant exposure material across all technologies.",
        sourceUrl:
          "https://www.ess-news.com/2025/11/25/battery-energy-storage-revenues-for-ancillary-services-fall-nearly-90-in-ercot/",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },
  
      // ─── LOCAL ───
      {
        id: "tx-county-siting",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // County-level setback/moratoria. NREL: most restrictive setbacks cut
        // potential WIND capacity 87% vs SOLAR 38% (R Street / NREL 2023) —
        // basis for wind=3 vs solar=1. Blanket "green energy" moratoria (e.g.
        // Van Zandt County, WRI Mar 2026) can also sweep in battery → battery=1.
        severity: { wind: 3, solar: 1, battery: 1 },
        capitalImpact: "construction",
        status:
          "County setback ordinances and moratoria; severe for wind (NREL: 87% potential capacity reduction), modest for solar, latent for battery via blanket green-energy moratoria.",
        sourceUrl:
          "https://www.wri.org/insights/clean-energy-restrictive-siting-laws",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },
    ],
  },

  // ─── VIRGINIA ────────────────────────────────────────────────────────────
  {
    code: "VA",
    name: "Virginia",
    factors: [
      // ─── FEDERAL ───
      {
        id: "va-obbba-cliff",
        tier: "federal",
        technologies: ["wind", "solar", "battery"],
        severity: { wind: 2, solar: 2, battery: 1 },
        capitalImpact: "tax_equity",
        status:
          "OBBBA phases out ITC/PTC by mid-2026 with narrow safe-harbor windows; wind/solar materially exposed, battery secondarily.",
        sourceUrl:
          "https://pexapark.com/blog/battery-storage-values-reach-record-highs-in-ercot-defying-policy-impacts-on-wind-and-solar-deals-pexapark/",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },

      // ─── STATE ───
      {
        id: "va-rggi-uncertainty",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        severity: { wind: 1, solar: 1, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "RGGI membership unresolved after unlawful withdrawal; ongoing regulatory/carbon-market uncertainty pending resolution.",
        sourceUrl:
          "https://virginiamercury.com/2025/07/02/energy-demands-regulations-and-federal-funding-challenge-virginia-clean-economy-act/",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },
      {
        id: "va-pjm-capacity",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        severity: { wind: 2, solar: 2, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "PJM capacity market cushions merchant exposure vs an energy-only market; wind/solar earn little capacity credit while battery captures strong capacity value.",
        sourceUrl:
          "https://www.utilitydive.com/news/pjm-interconnection-capacity-auction-data-center/808264/",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },

      // ─── LOCAL ───
      {
        id: "va-local-siting",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        severity: { wind: 1, solar: 2, battery: 2 },
        capitalImpact: "construction",
        status:
          "Local solar/storage siting friction; counties rejected more solar than approved in 2024. New 2026 law blocks outright bans but localities retain final approval. Onshore wind largely not affected (VA wind is offshore).",
        sourceUrl:
          "https://www.canarymedia.com/articles/solar/virginia-blocks-counties-from-banning-solar",
        lastVerified: "2026-06-03",
        confidence: "verified",
      },
    ],

    // VCEA reduces the state-tier score for wind, solar, and battery.
    // It is modeled as a mitigant — not a severity-0 factor — because it is
    // a protective force in its own right, not a resolved risk.
    mitigants: [va_vcea],
  },
];