/**
 * check-links.ts
 * --------------------------------------------------------------------------
 * Fact-checking hygiene: verifies that every source URL in the project still
 * resolves. Reads both the factor `sourceUrl`s in src/data/states.ts and the
 * per-project citation URLs in src/data/contested-projects.json, pings each
 * unique URL, and writes a report to link-check-report.json.
 *
 * Run with:  node scripts/check-links.ts
 *
 * IMPORTANT — how to read the output:
 *   OK         = responded 200-399. Good.
 *   DEAD       = 404/410 or no response (DNS/connection failure). Fix these.
 *   SUSPICIOUS = 403/401/429/5xx or timeout. MAY be a live page that just
 *                blocks automated requests — open it in a browser to confirm
 *                before assuming it's broken. Not necessarily a real problem.
 *
 * This is a *flagging* tool, not a verdict: it tells you what to re-check by
 * hand, it does not prove a page's contents are correct.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATES_PATH = join(__dirname, '..', 'src', 'data', 'states.ts');
const CONTESTED_PATH = join(__dirname, '..', 'src', 'data', 'contested-projects.json');
const REPORT_PATH = join(__dirname, '..', 'link-check-report.json');

const TIMEOUT_MS = 12000;
const CONCURRENCY = 8;

type Category = 'ok' | 'dead' | 'suspicious';
type Result = { url: string; status: number | null; category: Category; usedBy: string[] };

/** Collect URLs -> list of "where it came from" labels, so the report is actionable. */
function collectUrls(): Map<string, string[]> {
  const urls = new Map<string, string[]>();
  const add = (url: string, source: string) => {
    if (!url) return;
    const list = urls.get(url) ?? [];
    list.push(source);
    urls.set(url, list);
  };

  // 1) Factor + mitigant sourceUrls from states.ts (read as text; regex the values).
  const statesText = readFileSync(STATES_PATH, 'utf-8');
  // Capture each `id: "..."` so we can label which factor a URL belongs to.
  // Simple approach: walk line by line, remember the most recent id.
  let currentId = '(unknown)';
  for (const rawLine of statesText.split('\n')) {
    const idMatch = rawLine.match(/id:\s*["']([^"']+)["']/);
    if (idMatch) currentId = idMatch[1];
    const urlMatch = rawLine.match(/sourceUrl:\s*["']([^"']+)["']/);
    if (urlMatch) add(urlMatch[1], `states.ts:${currentId}`);
  }
  // Catch sourceUrls that sit on their own line (value on line after `sourceUrl:`).
  const multiline = statesText.match(/sourceUrl:\s*\n\s*["']([^"']+)["']/g);
  if (multiline) {
    for (const m of multiline) {
      const u = m.match(/["']([^"']+)["']/);
      if (u) add(u[1], 'states.ts:(factor)');
    }
  }

  // 2) Citation URLs from contested-projects.json.
  const contested = JSON.parse(readFileSync(CONTESTED_PATH, 'utf-8'));
  for (const [stateCode, sdata] of Object.entries<any>(contested.states ?? {})) {
    for (const tech of ['wind', 'solar', 'battery']) {
      for (const p of sdata.projects?.[tech] ?? []) {
        if (p.sourceUrl) add(p.sourceUrl, `contested:${stateCode}/${tech}/${p.title}`);
      }
    }
  }

  return urls;
}

async function checkUrl(url: string): Promise<{ status: number | null; category: Category }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const headers = {
    // Browser-like UA reduces false 403s from sites that block obvious bots.
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  };
  try {
    // Try HEAD first (cheap); some servers reject it, so fall back to GET.
    let res = await fetch(url, { method: 'HEAD', headers, signal: controller.signal, redirect: 'follow' });
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, { method: 'GET', headers, signal: controller.signal, redirect: 'follow' });
    }
    clearTimeout(timer);
    const s = res.status;
    if (s >= 200 && s < 400) return { status: s, category: 'ok' };
    if (s === 404 || s === 410) return { status: s, category: 'dead' };
    return { status: s, category: 'suspicious' }; // 401/403/429/5xx etc.
  } catch (err: any) {
    clearTimeout(timer);
    // Timeout/abort -> suspicious (page may be slow/blocking). DNS/refused -> dead.
    if (err?.name === 'AbortError') return { status: null, category: 'suspicious' };
    return { status: null, category: 'dead' };
  }
}

async function main() {
  const urlMap = collectUrls();
  const urls = [...urlMap.keys()];
  console.log(`Checking ${urls.length} unique URLs...\n`);

  const results: Result[] = [];
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const checked = await Promise.all(
      batch.map(async (url) => {
        const { status, category } = await checkUrl(url);
        return { url, status, category, usedBy: urlMap.get(url) ?? [] } as Result;
      })
    );
    results.push(...checked);
    process.stdout.write(`  checked ${Math.min(i + CONCURRENCY, urls.length)}/${urls.length}\r`);
  }
  console.log('\n');

  const ok = results.filter((r) => r.category === 'ok');
  const dead = results.filter((r) => r.category === 'dead');
  const suspicious = results.filter((r) => r.category === 'suspicious');

  console.log(`Summary:  OK ${ok.length}   DEAD ${dead.length}   SUSPICIOUS ${suspicious.length}\n`);

  if (dead.length) {
    console.log('DEAD (fix these — 404/410/no response):');
    for (const r of dead) {
      console.log(`  [${r.status ?? 'no-response'}] ${r.url}`);
      console.log(`       used by: ${r.usedBy.slice(0, 3).join(', ')}${r.usedBy.length > 3 ? ` (+${r.usedBy.length - 3} more)` : ''}`);
    }
    console.log('');
  }
  if (suspicious.length) {
    console.log('SUSPICIOUS (verify by hand — may just block bots):');
    for (const r of suspicious) {
      console.log(`  [${r.status ?? 'timeout'}] ${r.url}`);
    }
    console.log('');
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: { total: results.length, ok: ok.length, dead: dead.length, suspicious: suspicious.length },
    results: results.sort((a, b) => a.category.localeCompare(b.category)),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n');
  console.log(`Report written to ${REPORT_PATH}`);
}

main();
