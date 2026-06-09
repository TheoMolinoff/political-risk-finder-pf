/**
 * find-archives.ts
 * --------------------------------------------------------------------------
 * For each dead citation URL, ask the Wayback Machine for the closest archived
 * snapshot, so we can replace rotted links with stable archived versions.
 *
 * Run with:  node scripts/find-archives.ts
 *
 * Output: for each dead URL, prints either the archived replacement URL or
 * "NO SNAPSHOT" (meaning Wayback never captured it — that citation should be
 * marked unavailable rather than linked, since no honest source exists).
 *
 * This only READS from the Wayback API; it changes nothing. You then swap the
 * archived URLs into the project data by hand (or we script that next).
 */

// The 8 genuinely-dead citation URLs from the link checker (DEAD list).
const DEAD_URLS = [
  'https://www.thenewsprogress.com/news/article_a4ae1e12-2a37-11ec-96a0-ffb4878929ec.html',
  'https://martinsvillebulletin.com/news/local/govt-and-politics/board-of-zoning-appeals-denies-two-solar-farm-requests-in-axton/article_764ee4c0-4e31-11ec-a948-3fa623accb601.html',
  'https://www.thedinwiddiemonitor.com/news/dinwiddie-rejects-solar-project-agreement/article_d7409a8e-3825-11ec-8133-6fdf2e2bed7f.html',
  'https://www.emporiaindependentmessenger.com/news/article_63a5fd42-1413-11ed-949f-c79cf9166f59.html',
  'https://www.rappnews.com/news/landuse/fauquier-planners-reject-utility-scale-solar-project/article_a60554e2-b21e-541d-90c1-7fd87f99345e.html',
  'https://www.redding.com/story/news/local/2025/12/20/california-energy-commission-denies-shasta-county-fountain-wind-farm/87853324007/',
  'https://eplanning.blm.gov/eplanning-ui/project/2020804/510',
  'https://www.westernwaternotes.com/p/pyramid-lake-paiute-tribe-opposes',
];

async function findSnapshot(url: string): Promise<string | null> {
  const api = `http://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(15000) });
    const data: any = await res.json();
    const snap = data?.archived_snapshots?.closest;
    if (snap?.available && snap.url) {
      // Normalize to https
      return String(snap.url).replace(/^http:/, 'https:');
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`Looking up Wayback snapshots for ${DEAD_URLS.length} dead URLs...\n`);
  for (const url of DEAD_URLS) {
    const snap = await findSnapshot(url);
    console.log(`DEAD: ${url}`);
    if (snap) {
      console.log(`  ✓ ARCHIVED: ${snap}\n`);
    } else {
      console.log(`  ✗ NO SNAPSHOT — mark this citation unavailable (no honest source to link)\n`);
    }
  }
  console.log('Done. Swap the ARCHIVED urls into the citations; mark NO SNAPSHOT ones as unavailable.');
}

main();
