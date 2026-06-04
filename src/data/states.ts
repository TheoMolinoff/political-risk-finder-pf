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

  // ─── MISSISSIPPI ─────────────────────────────────────────────────────────
  {
    code: "MS",
    name: "Mississippi",
    factors: [
      // ─── FEDERAL ───
      {
        id: "ms-obbba-cliff",
        tier: "federal",
        technologies: ["wind", "solar", "battery"],
        // OBBBA is federal — identical exposure to all states. (Note: MS is a
        // negligible-wind-resource state, so wind is largely academic here.)
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
        id: "ms-discretionary-procurement",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // REGULATED MARKET: Entergy Mississippi is a monopoly utility actively
        // expanding renewables (EDGE initiative: +500 MW by 2025, +500 MW by
        // 2027; renewables to ~1/3 of generation by 2027 — Utility Dive). But
        // growth is DISCRETIONARY utility policy, not an RPS mandate, and much
        // is utility-OWNED rather than independent-developer PPAs. Independent
        // projects depend on the utility continuing to choose to procure.
        // (Encoded offtake_merchant = procurement-availability, not price.)
        severity: { wind: 2, solar: 2, battery: 2 },
        capitalImpact: "offtake_merchant",
        status:
          "Entergy Mississippi is expanding renewables (EDGE initiative) but procurement is discretionary, not RPS-mandated, and much is utility-owned — independent projects depend on continued utility procurement appetite.",
        sourceUrl:
          "https://www.utilitydive.com/news/entergy-mississippi-readies-big-push-into-renewable-power-with-plans-to-add/609868/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
      {
        id: "ms-single-buyer",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // Monopsony offtake: one dominant utility buyer, no competitive
        // wholesale market and no RPS-driven demand. Concentrates offtake risk
        // for independent developers. Solar lower (1) because Entergy is
        // demonstrably procuring solar (e.g. Sunflower Solar Station).
        severity: { wind: 2, solar: 1, battery: 2 },
        capitalImpact: "offtake_merchant",
        status:
          "Single dominant utility offtaker with no competitive wholesale market or RPS demand concentrates offtake risk; solar somewhat de-risked by demonstrated utility procurement.",
        sourceUrl:
          "https://www.entergy.com/blog/entergys-news-solar-station-wildlife-mississippi",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },

      // ─── LOCAL ───
      {
        id: "ms-solar-siting",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // Documented local opposition to large solar farms on farmland: Soul
        // City and Hinds Solar projects near Bolton/Raymond drew litigation
        // (circuit court, Feb 2025) and legislative pushback; opponents seek
        // state siting guidelines that currently DON'T EXIST, so no framework
        // provides predictability (Mississippi Independent, Oct 2024). Solar=2
        // (real, contested, farmland conflict, but not a statewide ban). Wind
        // negligible market (1); battery not the opposition focus (1).
        severity: { wind: 1, solar: 2, battery: 1 },
        capitalImpact: "construction",
        status:
          "Active local opposition and litigation against large solar farms on farmland (Soul City, Hinds Solar); no state siting framework provides predictability. Concentrated on solar.",
        sourceUrl:
          "https://msindy.org/p/opponents-of-mississippis-largest",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],
    // No mitigant: Mississippi has no state RPS. Renewable growth is
    // discretionary utility policy (EDGE/Bright Future), not a binding mandate —
    // so there is no legal floor under demand to encode as a protective factor.
  },

  // ─── ARIZONA ─────────────────────────────────────────────────────────────
  {
    code: "AZ",
    name: "Arizona",
    factors: [
      // ─── FEDERAL ───
      {
        id: "az-obbba-cliff",
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
        id: "az-utility-procurement",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // REGULATED MARKET, but FAVORABLE: APS and SRP are aggressively
        // procuring solar+storage from independent developers — e.g. SRP/NextEra
        // 3,000 MW solar + 1,000 MW storage through 2027 (pv magazine, May 2026),
        // plus Invenergy and Aypa deals. Strong utility procurement appetite means
        // low offtake/procurement risk — the opposite of Utah's hostile utility.
        severity: { wind: 1, solar: 1, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "APS/SRP are aggressively procuring solar and storage from independent developers (e.g. SRP/NextEra 3 GW solar + 1 GW storage); strong utility offtake appetite keeps procurement risk low.",
        sourceUrl:
          "https://pv-magazine-usa.com/2026/05/01/srp-and-nextera-energy-resources-partner-on-massive-solar-and-storage-expansion/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },

      // ─── LOCAL ───
      {
        id: "az-county-moratoria",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // ARIZONA'S DEFINING RISK: active, spreading county-level moratoria and
        // restrictions on utility-scale solar. Mohave County imposed a 240-day
        // moratorium (Oct 2023), partially lifted (Jun 2024) to allow solar only
        // on "Light Industrial" land; a new 120-day moratorium was considered
        // Feb 2026 (Mohave Daily News). Chino Valley, Gila Bend, Surprise, Apache
        // County and others are restricting or considering bans (KJZZ, Oct 2025).
        // Concentrated on land-hungry utility-scale solar (3); battery/wind swept
        // into "renewable" moratoria (2).
        severity: { wind: 2, solar: 3, battery: 2 },
        capitalImpact: "construction",
        status:
          "Active, spreading county moratoria and restrictions on utility-scale solar (Mohave, Chino Valley, Gila Bend, Apache, Surprise); severe and ongoing local siting risk concentrated on solar.",
        sourceUrl:
          "https://www.kjzz.org/the-show/2025-10-08/6-rural-arizona-towns-counties-have-limited-renewable-energy-projects-more-are-looking-into-it",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],
    // No mitigant: Arizona's utilities procure renewables voluntarily/economically
    // rather than under a binding modern RPS mandate, so there is no protective
    // law to encode. (Arizona's older 15%-by-2025 RPS is weak and effectively
    // satisfied; it provides no forward procurement floor.)
  },

  // ─── NEVADA ──────────────────────────────────────────────────────────────
  {
    code: "NV",
    name: "Nevada",
    factors: [
      // ─── FEDERAL ───
      {
        id: "nv-obbba-cliff",
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
        id: "nv-single-utility",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // REGULATED MARKET: NV Energy (Berkshire Hathaway subsidiary) is the
        // monopoly offtaker, so offtake is concentrated in one buyer. But it is
        // actively procuring to meet a binding RPS — IRP Preferred Plan requests
        // 1,000+ MW of paired solar+storage (PUCN IRP, 2024). Low procurement
        // risk; the RPS mitigant below offsets most of the single-buyer concern.
        severity: { wind: 1, solar: 1, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "NV Energy is the monopoly offtaker but is actively procuring 1,000+ MW of solar+storage to meet a binding RPS; concentrated-buyer risk is low.",
        sourceUrl:
          "https://www.nvenergy.com/publish/content/dam/nvenergy/brochures_arch/about-nvenergy/rates-regulatory/recent-regulatory-filings/irp/IRP-Volume-5.pdf",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },

      // ─── LOCAL ───
      {
        id: "nv-blm-permitting",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // Much Nevada utility-scale solar is sited on federal BLM land, adding
        // NEPA/federal permitting timeline risk distinct from county moratoria
        // (CNEE Nevada State Brief, 2025). Concentrated on land-hungry solar (2);
        // wind/battery lower. Nevada has comparatively little organized county-
        // level renewable opposition relative to Arizona.
        severity: { wind: 1, solar: 2, battery: 1 },
        capitalImpact: "construction",
        status:
          "Much utility-scale solar sits on federal BLM land, adding NEPA/federal permitting timeline risk; less organized county-level opposition than neighboring states.",
        sourceUrl:
          "https://cnee.colostate.edu/wp-content/uploads/2025/07/NV-State-Brief_2025_Final.pdf",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],

    mitigants: [
      {
        id: "nv-rps-mitigant",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // Nevada RPS (NRS 704.7801): binding 50%-by-2030 standard, ramping 34%
        // (2024-26) / 42% (2027-29) / 50% (2030+); energy-efficiency credits
        // eliminated from 2025, tightening the real renewable requirement. The
        // 50%-by-2030 target is also constitutionally enshrined (ballot Question
        // 6), making it unusually durable (PUCN; Utility Dive). A real demand
        // floor that de-risks offtake. Battery reduction slightly lower — the RPS
        // targets renewable generation more directly than storage.
        reduction: { wind: 20, solar: 20, battery: 15 },
        label: "Nevada RPS (50% by 2030)",
        status:
          "Binding RPS requires 50% renewables by 2030 (constitutionally enshrined via ballot Question 6); energy-efficiency credits eliminated from 2025 — a durable demand floor that de-risks offtake.",
        sourceUrl:
          "https://puc.nv.gov/Renewable_Energy/Portfolio_Standard",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],
  },

  // ─── ILLINOIS ─────────────────────────────────────────────────────────────
  {
    code: "IL",
    name: "Illinois",
    factors: [
      // ─── FEDERAL ───
      {
        id: "il-obbba-cliff",
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
        id: "il-execution-gap",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // ILLINOIS' DEFINING RISK: the largest mandate-to-deployment gap in any
        // US market. Illinois + Michigan mandate 5,500 MW of storage by 2030 but
        // only 119 MW operates, with untested permitting paths and interconnection-
        // queue risk (Modo Energy, Feb 2026). The mandate is strong but DELIVERY
        // is the bottleneck. Worst for storage (battery=3 — huge gap); wind/solar
        // face queue congestion but more mature deployment (2).
        severity: { wind: 2, solar: 2, battery: 3 },
        capitalImpact: "construction",
        status:
          "Largest mandate-to-deployment gap in any US market (5,500 MW storage mandated by 2030, ~119 MW built); untested permitting and interconnection-queue risk, most acute for storage.",
        sourceUrl:
          "https://modoenergy.com/research/en/miso-bess-build-locations",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
      {
        id: "il-merchant-capacity",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // Restructured/retail-choice market spanning MISO (downstate/Ameren) and
        // PJM (Chicago/ComEd); projects carry merchant price + capacity-auction
        // exposure. MISO summer capacity prices spiked from $30 to $666/MW-day
        // (2024→2025), and capacity revenue still covers <15% of a 4-hr BESS
        // requirement (Modo Energy, 2026). Battery lower (1) — capacity markets
        // reward dispatchable storage.
        severity: { wind: 2, solar: 2, battery: 1 },
        capitalImpact: "offtake_merchant",
        status:
          "Restructured MISO/PJM market with merchant price and capacity-auction exposure; volatile capacity prices and thin capacity revenue for storage create revenue uncertainty.",
        sourceUrl:
          "https://modoenergy.com/research/en/miso-bess-build-locations",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],

    mitigants: [
      {
        id: "il-ceja-crga-mitigant",
        tier: "state",
        technologies: ["wind", "solar", "battery"],
        // CEJA (2021): 100% clean by 2050, 40% by 2030 / 50% by 2040, more than
        // doubled RPS funding. Strengthened by CRGA (SB 25, signed Jan 2026, eff.
        // Jun 1 2026), which added storage programs and expanded community solar
        // (K&L Gates; PV Tech; UCS, 2026). SEIA forecasts 14.6 GW new solar over
        // 5 years (4th-most in US). A strong demand floor de-risking offtake.
        reduction: { wind: 20, solar: 20, battery: 20 },
        label: "CEJA + CRGA clean-energy mandate",
        status:
          "CEJA mandates 100% clean by 2050 (40% by 2030) with doubled RPS funding; CRGA (2026) adds storage programs — among the strongest demand floors in the US, de-risking offtake.",
        sourceUrl:
          "https://www.pv-tech.org/illinois-signs-clean-energy-bill-will-drive-investments-for-solar-pv-battery-storage-and-vpps/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
      {
        id: "il-hb4412-siting-mitigant",
        tier: "local",
        technologies: ["wind", "solar", "battery"],
        // HB 4412 (P.A. 102-1123, eff. Jan 2023): statewide preemption of local
        // siting restrictions for utility-scale wind/solar — requires uniform
        // state setback standards and precludes stricter local rules (K&L Gates;
        // IL Environmental Council). CRGA (2026) added a state-level siting
        // dispute-resolution process. Broad, non-opt-in (unlike CA's AB 205) —
        // strongly reduces local siting risk. Battery slightly lower (15): the
        // law centers on wind/solar siting.
        reduction: { wind: 20, solar: 20, battery: 15 },
        label: "HB 4412 statewide siting preemption",
        status:
          "HB 4412 preempts local siting restrictions for utility-scale wind/solar with uniform statewide standards; broad and non-opt-in, strongly reducing local siting risk.",
        sourceUrl:
          "https://ilenviro.org/gov-pritzker-signs-legislation-protecting-clean-energy-projects/",
        lastVerified: "2026-06-04",
        confidence: "verified",
      },
    ],
  },
];