/**
 * derive-siting.ts
 * --------------------------------------------------------------------------
 * Computes data-anchored LOCAL SITING severities for each state from the
 * Sabin Center Opposition Report datasets, and writes src/data/siting-severities.json.
 *
 * This is a BUILD-TIME script, not part of the running app. Re-run it whenever
 * the Sabin Center publishes a new dataset:
 *     pnpm tsx scripts/derive-siting.ts
 *
 * Why this exists: local-siting severities are not hand-keyed judgments — they
 * are DERIVED from public data by this disclosed rule, so every siting severity
 * is reproducible and traceable to a source. See METHODOLOGY.md.
 *
 * RUBRIC (locked):
 *   Per technology, score restriction-count and contested-project-count
 *   SEPARATELY into bands:  0 incidents -> 0,  1-3 -> 1,  4-10 -> 2,  11+ -> 3.
 *   severity = max(restrictionBand, contestedBand).
 *   - Restrictions (ordinances/setbacks) reflect STRUCTURAL/LEGAL barriers.
 *   - Contested projects reflect ACTIVE OPPOSITION intensity.
 *   Keeping them separate preserves the wind-vs-solar distinction (e.g. TX wind
 *   is restriction-heavy; VA solar is contested-heavy).
 *
 * OVERRIDES: where documented news post-dates the dataset, an explicit override
 * supersedes the computed value and is flagged transparently in the output.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'sabin');
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'siting-severities.json');

const STATES = ['TX', 'VA', 'CA', 'UT', 'MS', 'AZ', 'NV', 'IL'] as const;
type StateCode = (typeof STATES)[number];
type Tech = 'wind' | 'solar' | 'battery';

// Sabin "Type" values we map onto our three technologies.
const TECH_MAP: Record<string, Tech> = { Wind: 'wind', Solar: 'solar', Storage: 'battery' };

// Documented post-dataset overrides (news supersedes a stale dataset).
const OVERRIDES: Partial<
  Record<StateCode, { severities: Partial<Record<Tech, number>>; reason: string; source: string }>
> = {
  AZ: {
    severities: { wind: 1, solar: 3, battery: 2 },
    reason:
      'Sabin 2024 dataset shows low counts; superseded by documented 2025-26 county solar moratoria (Mohave, Chino Valley, Gila Bend).',
    source:
      'https://www.kjzz.org/the-show/2025-10-08/6-rural-arizona-towns-counties-have-limited-renewable-energy-projects-more-are-looking-into-it',
  },
};

/** Minimal RFC-4180 CSV parser (handles quoted fields, embedded commas/newlines). */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* ignore */ }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function loadCounts(file: string): Record<StateCode, Record<Tech, number>> {
  const text = readFileSync(join(DATA_DIR, file), 'utf-8').replace(/^\uFEFF/, '');
  const rows = parseCSV(text);
  const header = rows[0];
  const iState = header.indexOf('State');
  const iType = header.indexOf('Type');
  const counts = Object.fromEntries(
    STATES.map((s) => [s, { wind: 0, solar: 0, battery: 0 }])
  ) as Record<StateCode, Record<Tech, number>>;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length <= iType) continue;
    const st = row[iState]?.trim() as StateCode;
    if (!STATES.includes(st)) continue;
    for (const part of (row[iType] ?? '').split('|')) {
      const tech = TECH_MAP[part.trim()];
      if (tech) counts[st][tech]++;
    }
  }
  return counts;
}

function band(n: number): number {
  if (n === 0) return 0;
  if (n <= 3) return 1;
  if (n <= 10) return 2;
  return 3;
}

function main() {
  const restrictions = loadCounts('2025-Restrictions.csv');
  const contested = loadCounts('2025-Contested-Projects.csv');

  const out: any = {
    _meta: {
      dataset: 'Sabin Center Opposition Report 2025 (data through Dec 2024)',
      source: 'https://oppositionreport.org',
      rubric:
        'Per technology: score restriction-count and contested-count separately into bands (0=0, 1-3=1, 4-10=2, 11+=3); severity = max(restrictionBand, contestedBand). Restrictions reflect structural/legal barriers; contested projects reflect active opposition. Documented post-dataset news may override (see _override).',
      nationalContext:
        '~30% of utility-scale wind/solar projects were cancelled during siting 2018-2023 (Sabin Center).',
      generatedBy: 'scripts/derive-siting.ts',
    },
    states: {} as Record<string, any>,
  };

  for (const st of STATES) {
    out.states[st] = {};
    for (const tech of ['wind', 'solar', 'battery'] as Tech[]) {
      const rc = restrictions[st][tech];
      const cc = contested[st][tech];
      const computed = Math.max(band(rc), band(cc));
      const rec: any = {
        restrictions: rc,
        contested: cc,
        restrictionBand: band(rc),
        contestedBand: band(cc),
        severity: computed,
      };
      const ov = OVERRIDES[st];
      if (ov && ov.severities[tech] !== undefined) {
        rec.computedSeverity = computed;
        rec.severity = ov.severities[tech];
        rec._override = { reason: ov.reason, source: ov.source };
      }
      out.states[st][tech] = rec;
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${OUT_PATH}`);
  for (const st of STATES) {
    const s = out.states[st];
    console.log(`${st}: wind ${s.wind.severity}  solar ${s.solar.severity}  battery ${s.battery.severity}`);
  }
}

main();
