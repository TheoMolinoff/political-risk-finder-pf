# political-risk-finder-PF — Methodology

_Last updated: 2026-06-05_

This document is the authoritative record of **how the tool scores risk** and **why each
severity is what it is**. It doubles as the context-reload anchor: if you return after a
break, read this first.

---

## 1. What the tool does

For a US state × technology (wind / solar / battery), it produces a **political &
regulatory risk** assessment across three tiers — **federal, state, local** — plus
**mitigants** (protective policies that reduce risk). Scores are **deterministic**:
computed by a transparent function over structured data. The LLM (if used) writes prose
only; it never invents a score, number, or source.

Scope note: this measures **political/regulatory risk only** — not merchant price risk in
full, technical risk, or construction cost. "High" means high *policy* risk, not a total
project-risk verdict.

---

## 2. Scoring model

**Severity scale (per factor, per technology):** 0 = no/resolved risk · 1 = minor/latent ·
2 = material · 3 = severe/deal-threatening.

**Tier score:** `sum(severities of binding factors) / (count of binding factors × 3) × 100`.
Only factors with severity > 0 count toward the denominator (a resolved factor must not
dilute the tier).

**Overall score:** weighted sum of tier scores, with per-technology weights:

| Tech | Federal | State | Local | Rationale |
|------|---------|-------|-------|-----------|
| wind | 0.45 | 0.25 | 0.30 | Federal credit cliff existential; heavy local setback/moratoria exposure |
| solar | 0.45 | 0.30 | 0.25 | Same federal cliff; moderate state + local |
| battery | 0.25 | 0.35 | 0.40 | Less OBBBA-exposed; local fire-code + interconnection dominate |

**Levels:** High ≥ 70 · Elevated ≥ 50 · Moderate ≥ 30 · Low < 30 (shared across techs;
type designed to allow per-tech overrides later).

**Mitigants:** tier-scoped point reductions applied after the raw tier score, floored at 0.
A state-tier mitigant (e.g. an RPS) reduces only the state tier. Reductions are summed.

---

## 3. Locked rubrics (data → severity mappings)

Each severity should trace to a documented quantity through one of these disclosed rules.
Every factor carries three fields: `metric` (the documented basis), `rubric` (the rule
applied), and `basis` (`data-anchored` or `qualitative`).

### Local siting — DATA-ANCHORED (Sabin Center Opposition Report)
Per technology, score **restriction-count and contested-project-count SEPARATELY** into
bands, then take the **max** of the two band scores:

| Count of incidents | Band |
|--------------------|------|
| 0 | 0 |
| 1–3 | 1 |
| 4–10 | 2 |
| 11+ | 3 |

`severity = max(restrictionBand, contestedBand)`.

**Why separate, not summed (changed 2026-06-05):** restrictions (ordinances/setbacks)
reflect STRUCTURAL/LEGAL barriers — the wind signal (cf. NREL: restrictive setbacks cut
wind potential ~87% vs solar ~38%). Contested projects reflect ACTIVE OPPOSITION — the
solar signal (e.g. farmland fights). Summing them flattened the wind-vs-solar distinction
(both collapsed to 3 in several states); scoring separately and taking the max preserves
it. Example: TX wind is restriction-heavy (21→band 3) so wind=3; TX solar is contested-
heavy but moderate (6→band 2) so solar=2 — the gap survives. VA inverts: solar 27 restr +
36 contested → 3, wind only 6 combined → 1.

The automatic "active moratorium → 3" escalation was REMOVED (the keyword heuristic kept
mis-firing on non-moratorium restrictions); high counts already capture severity, and true
post-dataset moratoria are handled via the documented news-override below.

**News override:** where documented events post-date the dataset (ends Dec 2024), recent
news supersedes the computed value, flagged explicitly with `computedSeverity` + `_override`
(reason + source) in `siting-severities.json` and surfaced in `metric`.

### Merchant / offtake-price — DATA-ANCHORED (ISO/EIA capture prices)
Capture price above LCOE / strong capacity revenue → 1 · near LCOE → 2 · at/below LCOE or
energy-only market with no capacity floor → 3.

### Procurement / offtake-availability (regulated markets) — DATA-ANCHORED (utility IRP)
Utility actively procuring from independents → 1 · discretionary/voluntary → 2 · IRP plans
little/no new renewable procurement → 3.

### Federal (OBBBA) — DATA-ANCHORED (policy-defined, uniform)
Technology subject to ITC/PTC phase-out → 2 · secondarily exposed (battery) → 1.

### Mitigant size — DATA-ANCHORED (DSIRE + statute)
Binding RPS + enforceable penalty + ambitious target (≥50%/100%) → 20–25 pt · binding but
modest → 10–15 pt · voluntary goal / non-binding → no mitigant.

### Qualitative factors — JUDGMENT (labeled honestly)
Forward-looking risks with no clean dataset (e.g. enjoined-but-appealable laws, defeated-
but-recurring bills, single-buyer/monopsony risk) are marked `basis: "qualitative"`. We do
**not** invent a metric for these — honest labeling beats false precision.

---

## 4. Verified Sabin data (2025 edition, through Dec 2024)

Source: Sabin Center Opposition Report, oppositionreport.org. Files committed in
`data/sabin/`. Counts derived by `scripts/derive-siting.ts`.

| State | Restrictions (wind / solar) | Contested (cancelled) | Severity wind / solar / battery (max of bands) |
|-------|------------------------------|------------------------|------------------------------------------------|
| TX | 21 (21 / 2) | 14 (5) | 3 / 2 / 1 |
| VA | 29 (3 / 27) | 39 (27) | 1 / 3 / 1 |
| CA | 5 (3 / 3) | 33 (10) | 3 / 3 / 2 |
| UT | 1 (0 / 1) | 0 (0) | 0 / 1 / 0 |
| MS | 0 | 2 (0) | 0 / 1 / 1 |
| AZ | 2 (0 / 2) | 3 (2) | OVERRIDE → 1 / 3 / 2 (computed 0 / 1 / 1; see below) |
| NV | 1 (1 / 1) | 18 (8) | 2 / 2 / 1 |
| IL | 9 (9 / 3) | 18 (7) | 2 / 2 / 1 |

Severities computed by `scripts/derive-siting.ts`, output committed to
`src/data/siting-severities.json`. Re-run `pnpm tsx scripts/derive-siting.ts` after any
new Sabin dataset.

National context: ~30% of utility-scale wind/solar cancelled during siting 2018–2023
(Sabin). This validates that local siting risk is materially deal-relevant.

**Arizona override:** the dataset (ends Dec 2024) shows AZ low, but 2025–26 county moratoria
(Mohave 240-day moratorium + new 120-day proposal Feb 2026; Chino Valley, Gila Bend, Apache)
supersede it. Local siting set to wind 2 / solar 3 / battery 2, flagged in `metric`.

---

## 5. Known limitations / open decisions (deferred, revisit deliberately)

1. **Normalization sensitivity.** Tier score = mean of binding severities, so a tier's
   score depends on factor count, and with 1–2 factors scores land on coarse values
   (33/50/67/100). Overall (weighted) scores are smoother. Revisit with density-aware or
   mean+highest-severity blend. Don't tune against a small sample.
2. **Merchant vs. procurement risk share one field.** `offtake_merchant` means "volatile
   price" in merchant states but "will the utility procure at all" in regulated states
   (Utah). Consider splitting in a later pass.
3. **California siting gap.** CA has substantial wind/solar siting opposition (33 contested
   projects) that the current model does NOT capture — its local factor is BESS fire-safety
   only. Decision pending: add a CA siting factor alongside fire-safety, or leave it.
4. **UT/MS go to 0 on siting.** The Sabin rubric drops these below current hand-scores.
   "0, well-sourced" is defensible but decide whether a floor is wanted.
5. **Confidence ranges (planned).** Replace point scores with ranges; tighter for
   data-anchored factors, wider for qualitative ones, so the range communicates how much of
   the score rests on hard data vs. judgment.
6. **Dollar layer (planned).** Dollarize only channels with hard inputs (lost ITC value as
   % of capex, capture-price deltas, capacity payments); keep the rest qualitative.

---

## 6. The eight states (market-structure spread)

TX (ERCOT energy-only) · VA (PJM capacity) · CA (CAISO curtailment) · UT (regulated,
hostile utility) · MS (regulated SE, discretionary procurement) · AZ (regulated, favorable
procurement, active siting fights) · NV (regulated, binding RPS) · IL (restructured MISO/PJM,
strong mandate but execution gap).
