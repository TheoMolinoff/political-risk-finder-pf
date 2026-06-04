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

  // ─── CALIFORNIA ──────────────────────────────────────────────────────────
  {
    code: "CA",
    name: "California",
    factors: [
      // ─── FEDERAL ───
      {
        id: "ca-obbba-cliff",
        tier: "federal",
        technologies: ["wind", "solar", "battery"],
        // OBBBA is federal — identical exposure to all states. ITC/PTC phase-out
        // by mid-2026 with narrow safe-harbor windows; wind/solar materially
        // exposed, battery secondarily.
        severity: { wind: 2, solar: 2, battery: 1 },
        capitalImpact: "tax_equity",
        status:
          "OBBBA phases out ITC/PTC by mid-2026 with narrow safe-harbor windows; wind/solar materially exposed, battery secondarily.",
        sourceUrl:
          "https://pexapark.com/blog/battery-storage-values-reach-record-highs-in-ercot-defying-policy-impacts-on-wind-and-solar-deals-pexapark/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },

      // ─── STATE ───
      {
        id: "ca-caiso-curtailment",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // CAISO duck curve: midday solar oversupply forces structural
        // curtailment — >2M MWh of wind/solar curtailed annually, 738k+ MWh in
        // just Jan-Apr 2025 (Yes Energy / EIA, 2025). Crushes solar capture
        // prices (severe for solar=3); wind less exposed (1); battery BENEFITS
        // by absorbing midday surplus, so low (1).
        severity: { wind: 1, solar: 3, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "CAISO duck-curve curtailment exceeds 2M MWh/yr; structural midday solar oversupply severely depresses solar capture prices. Battery benefits by absorbing surplus.",
        sourceUrl:
          "https://www.yesenergy.com/blog/the-duck-curve-explained-impacts-renewable-energy-curtailments",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
      {
        id: "ca-resource-adequacy",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // CAISO Resource Adequacy "Slice of Day" framework requires LSEs to show
        // capacity across all 24 hours (CPUC, 2025). Rewards resources that
        // perform at peak — favorable to battery, weaker capacity value for
        // intermittent solar. Distinct from curtailment: this is a capacity-
        // revenue structure, not a spot-price risk.
        severity: { wind: 1, solar: 2, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "CAISO 'Slice of Day' Resource Adequacy rewards 24-hour capacity performance; intermittent solar earns weaker RA value while dispatchable battery is well-positioned.",
        sourceUrl:
          "https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/energy-division/documents/resource-adequacy-homepage/resource-adequacy-compliance-materials/guides-and-resources/2026-ra-slice-of-day-filing-guide.pdf",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },

      // ─── LOCAL ───
      {
        id: "ca-bess-fire-safety",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // Post-Moss Landing (Jan 2025 catastrophic BESS fire) regulation: SB 283
        // (eff. Jan 1 2026) and AB 1285 impose NFPA 855 compliance and local
        // fire-authority consultation on battery projects; AB 303 (failed) would
        // have banned BESS within 3,200 ft of sensitive receptors (Energy Law
        // Blog, Nov 2025). Battery-specific construction/permitting friction (2);
        // not a ban. Does not affect wind/solar.
        severity: { wind: 0, solar: 0, battery: 2 },
        capitalImpact: "construction",
        status:
          "Post-Moss Landing BESS fire-safety rules (SB 283, AB 1285) add NFPA 855 compliance and fire-authority consultation; battery-specific permitting friction, not a ban.",
        sourceUrl:
          "https://www.energylawinfo.com/2025/11/california-battery-energy-storage-systems-legislation-update-safety-requirements-and-ab-205-opt-in-procedures-amended/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],

    mitigants: [
      {
        id: "ca-sb100-mitigant",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // SB 100: 100% clean electricity by 2045, 60% renewables by 2030,
        // enforced with $50/REC shortfall penalties. SB 350 requires 65% of RPS
        // procurement via long-term (10yr+) contracts — mandated long-term PPAs
        // directly de-risk offtake/bankability. Battery reduction highest: CA's
        // storage procurement mandate is the nation's largest.
        reduction: { wind: 20, solar: 20, battery: 25 },
        label: "SB 100 Renewables Portfolio Standard",
        status:
          "SB 100 mandates 100% clean electricity by 2045 with enforceable RPS penalties; SB 350 requires 65% of procurement via 10yr+ contracts — a strong offtake/bankability tailwind, strongest for storage.",
        sourceUrl:
          "https://legalclarity.org/californias-sb-100-renewable-energy-goals-and-compliance/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
      {
        id: "ca-ab205-siting-mitigant",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // AB 205 (2022): developers can opt into a streamlined CEC permitting
        // process that SUPERSEDES local zoning for solar/wind 50MW+ and storage
        // 200MWh+ (Cox Castle / Columbia Law, 2022). A state-level escape hatch
        // from local opposition. Partial: opt-in, sunsets 2029, excludes CPUC-
        // jurisdiction utility projects. Battery reduction slightly lower (10)
        // because new fire-safety rules partly offset the permitting relief.
        reduction: { wind: 15, solar: 15, battery: 10 },
        label: "AB 205 state siting preemption",
        status:
          "AB 205 lets qualifying projects opt into CEC permitting that supersedes local zoning — a state-level path around local opposition. Partial: opt-in, sunsets 2029, excludes CPUC-jurisdiction utility projects.",
        sourceUrl:
          "https://blogs.law.columbia.edu/climatechange/2022/08/09/new-california-law-allows-state-to-bypass-local-restrictions-in-siting-large-scale-renewables",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],
  },
  
  // ─── UTAH ──────────────────────────────────────────────────────────
  {
    code: "UT",
    name: "Utah",
    factors: [
      // ─── FEDERAL ───
      {
        id: "ut-obbba-cliff",
        tier: "federal",
        technologies: ["wind", "solar", "battery"],
        // OBBBA is federal — identical exposure to all states.
        severity: { wind: 2, solar: 2, battery: 1 },
        capitalImpact: "tax_equity",
        status:
          "OBBBA phases out ITC/PTC by mid-2026 with narrow safe-harbor windows; wind/solar materially exposed, battery secondarily.",
        sourceUrl:
          "https://pexapark.com/blog/battery-storage-values-reach-record-highs-in-ercot-defying-policy-impacts-on-wind-and-solar-deals-pexapark/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },

      // ─── STATE ───
      {
        id: "ut-irp-procurement",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // REGULATED MARKET: PacifiCorp/Rocky Mountain Power is the monopoly
        // offtaker. Its final 2025 IRP plans ZERO new wind/solar/geothermal and
        // only limited battery for Utah over 20 years; only new generation is gas
        // (mid-2030s) + a nuclear demo (Utah Clean Energy / Sierra Club, Mar-Apr
        // 2026). The PSC declined to compel renewable procurement (Utah News
        // Dispatch, Jun 2026). For a regulated market the central risk is whether
        // the utility procures renewables at all — here it plans not to. NOTE:
        // encoded as offtake_merchant but this is PROCUREMENT-AVAILABILITY risk,
        // not price volatility (see pass-two: split merchant vs procurement risk).
        severity: { wind: 3, solar: 3, battery: 2 },
        capitalImpact: "offtake_merchant",
        status:
          "PacifiCorp's 2025 IRP plans zero new wind/solar and only limited battery for Utah over 20 years; PSC declined to compel procurement. As the monopoly offtaker, the utility is planning away from new renewables — severe procurement risk.",
        sourceUrl:
          "https://utahcleanenergy.org/why-rocky-mountain-powers-new-energy-plan-could-cost-utah-families-billions-more/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
      {
        id: "ut-market-access",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // With RMP not procuring, Utah projects increasingly depend on out-of-
        // state market purchases / offtake, which the IRP itself flags as
        // raising reliance on "volatile market purchases" (Utah Clean Energy,
        // Mar 2026). Weaker, less-certain fallback offtake than an in-state PPA.
        severity: { wind: 2, solar: 2, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "With the in-state utility not procuring, projects must rely on weaker out-of-state/market offtake; IRP increases dependence on volatile market purchases.",
        sourceUrl:
          "https://utahcleanenergy.org/press-release/rocky-mountain-power-releases-draft-update-to-its-20-year-energy-plan/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },

      // ─── LOCAL ───
      {
        id: "ut-local-siting",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // Local siting is genuinely easy in Utah: the Sabin Center Opposition
        // Report (updated Mar 2026) affirmatively finds NO restrictive local
        // ordinances, NO contested projects, and NO restrictive state laws in
        // Utah — vs 459+ jurisdictions with restrictions nationally. Real
        // projects (e.g. Iron County solar+storage) move through routine
        // permitting. Low across all technologies.
        severity: { wind: 1, solar: 1, battery: 1 },
        capitalImpact: "construction",
        status:
          "Sabin Center Opposition Report finds no restrictive local ordinances or contested projects in Utah; abundant land and low siting friction across technologies.",
        sourceUrl:
          "https://oppositionreport.org/reports/current/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],
    // No mitigant: Utah's RPS is a non-binding goal ("20% by 2025 only if
    // cost-effective"), providing no procurement support — unlike CA (SB 100)
    // or VA (VCEA). This absence is itself the story: high state risk, nothing
    // to offset it.
  },

];