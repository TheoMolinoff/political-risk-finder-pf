/**
 * derive-contested.ts
 * --------------------------------------------------------------------------
 * Extracts contested renewable-energy projects from the Sabin Center dataset
 * and writes src/data/contested-projects.json — the data behind the per-state
 * project map/list. Mirrors scripts/derive-siting.ts.
 *
 * Run with:  node scripts/derive-contested.ts
 *
 * Output shape:
 *   states[ST].projects[tech] = [ { title, counties[], fips[], status, cancelled, capacity } ]
 *   states[ST].fipsByTech[tech] = [ FIPS codes with >=1 contested project ]  // for map shading
 *
 * Multi-county projects (County field like "Apache County|Navajo County",
 * County ID like "04001|04017") are credited to EACH county.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = join(__dirname, '..', 'data', 'sabin', '2025-Contested-Projects.csv');
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'contested-projects.json');

const STATES = ['TX', 'VA', 'CA', 'UT', 'MS', 'AZ', 'NV', 'IL'] as const;
type StateCode = (typeof STATES)[number];
type Tech = 'wind' | 'solar' | 'battery';
const TECH_MAP: Record<string, Tech> = { Wind: 'wind', Solar: 'solar', Storage: 'battery' };

// Dead citation links (found by check-links.ts), resolved transparently:
// archived via Wayback where a snapshot exists, else '' to mark unavailable.
const CITATION_OVERRIDES: Record<string, string> = {
  'https://www.thenewsprogress.com/news/article_a4ae1e12-2a37-11ec-96a0-ffb4878929ec.html':
    'https://web.archive.org/web/20211105220616/https://www.thenewsprogress.com/news/article_a4ae1e12-2a37-11ec-96a0-ffb4878929ec.html',
  'https://www.thedinwiddiemonitor.com/news/dinwiddie-rejects-solar-project-agreement/article_d7409a8e-3825-11ec-8133-6fdf2e2bed7f.html':
    'https://web.archive.org/web/20240207204121/https://www.thedinwiddiemonitor.com/news/dinwiddie-rejects-solar-project-agreement/article_d7409a8e-3825-11ec-8133-6fdf2e2bed7f.html',
  'https://www.rappnews.com/news/landuse/fauquier-planners-reject-utility-scale-solar-project/article_a60554e2-b21e-541d-90c1-7fd87f99345e.html':
    'https://web.archive.org/web/20250410001935/https://www.rappnews.com/news/landuse/fauquier-planners-reject-utility-scale-solar-project/article_a60554e2-b21e-541d-90c1-7fd87f99345e.html',
  // No Wayback snapshot — mark unavailable (no honest source to link):
  'https://martinsvillebulletin.com/news/local/govt-and-politics/board-of-zoning-appeals-denies-two-solar-farm-requests-in-axton/article_764ee4c0-4e31-11ec-a948-3fa623accb601.html': '',
  'https://www.emporiaindependentmessenger.com/news/article_63a5fd42-1413-11ed-949f-c79cf9166f59.html': '',
  'https://www.redding.com/story/news/local/2025/12/20/california-energy-commission-denies-shasta-county-fountain-wind-farm/87853324007/': '',
  'https://eplanning.blm.gov/eplanning-ui/project/2020804/510': '',
  'https://www.westernwaternotes.com/p/pyramid-lake-paiute-tribe-opposes': '',
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

type Project = {
  title: string;
  counties: string[];
  fips: string[];
  status: string;
  cancelled: string;
  capacity: string;
  sourceUrl: string;
};

function main() {
  const text = readFileSync(CSV_PATH, 'utf-8').replace(/^\uFEFF/, '');
  const rows = parseCSV(text);
  const header = rows[0];
  const col = (name: string) => header.indexOf(name);
  const iState = col('State');
  const iTitle = col('Title');
  const iStatus = col('Status');
  const iCancelled = col('Year Cancelled');
  const iCounty = col('County');
  const iFips = col('County ID');
  const iType = col('Type');
  const iCapacity = col('Capacity');
  const iCitations = col('Citations');

  const data: Record<StateCode, Record<Tech, Project[]>> = Object.fromEntries(
    STATES.map((s) => [s, { wind: [], solar: [], battery: [] }])
  ) as any;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length <= iType) continue;
    const st = row[iState]?.trim() as StateCode;
    if (!STATES.includes(st)) continue;
    const techs = (row[iType] ?? '')
      .split('|')
      .map((t) => TECH_MAP[t.trim()])
      .filter(Boolean) as Tech[];
    if (techs.length === 0) continue;

    const project: Project = {
      title: row[iTitle].trim(),
      counties: (row[iCounty] ?? '').split('|').map((c) => c.trim()).filter(Boolean),
      fips: (row[iFips] ?? '').split('|').map((c) => c.trim()).filter(Boolean),
      status: row[iStatus].trim(),
      cancelled: (row[iCancelled] ?? '').trim(),
      capacity: (row[iCapacity] ?? '').trim(),
      sourceUrl: (() => {
        const m = (row[iCitations] ?? '').match(/https?:\/\/[^\s;,<>"']+/);
        if (!m) return '';
        const raw = m[0].replace(/[.,;]+$/, '');
        // Apply known dead-link overrides (archived replacement or '' if unavailable):
        return raw in CITATION_OVERRIDES ? CITATION_OVERRIDES[raw] : raw;
      })(),
    };
    for (const tech of techs) data[st][tech].push(project);
  }

  const out: any = {
    _meta: {
      dataset: 'Sabin Center Opposition Report 2025 — Contested Projects (through Dec 2024)',
      source: 'https://oppositionreport.org',
      generatedBy: 'scripts/derive-contested.ts',
      note: 'Projects grouped by state and technology. fipsByTech lists county FIPS codes with >=1 contested project, for map shading. Multi-county projects credited to each county.',
    },
    states: {} as Record<string, any>,
  };

  for (const st of STATES) {
    out.states[st] = { projects: data[st], fipsByTech: {} as Record<Tech, string[]> };
    for (const tech of ['wind', 'solar', 'battery'] as Tech[]) {
      const fset = new Set<string>();
      for (const p of data[st][tech]) for (const fp of p.fips) fset.add(fp);
      out.states[st].fipsByTech[tech] = [...fset].sort();
    }
  }

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${OUT_PATH}`);
  for (const st of STATES) {
    const s = out.states[st];
    console.log(
      `${st}: wind ${s.projects.wind.length}  solar ${s.projects.solar.length}  battery ${s.projects.battery.length}`
    );
  }
}

main();
