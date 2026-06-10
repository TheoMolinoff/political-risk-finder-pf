'use client';
import { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import contested from '@/data/contested-projects.json';
const COUNTY_GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';
type Tech = 'wind' | 'solar' | 'battery';
type Project = {
  title: string;
  counties: string[];
  fips: string[];
  status: string;
  cancelled: string;
  capacity: string;
  sourceUrl: string;
};
const STATE_VIEW: Record<string, { fips: string; center: [number, number]; zoom: number }> = {
  TX: { fips: '48', center: [-99.4, 31.3], zoom: 3.2 },
  VA: { fips: '51', center: [-78.7, 37.8], zoom: 4.6 },
  CA: { fips: '06', center: [-119.4, 37.2], zoom: 3.2 },
  UT: { fips: '49', center: [-111.6, 39.3], zoom: 4.0 },
  MS: { fips: '28', center: [-89.7, 32.7], zoom: 4.6 },
  AZ: { fips: '04', center: [-111.7, 34.2], zoom: 3.8 },
  NV: { fips: '32', center: [-116.6, 39.3], zoom: 3.6 },
  IL: { fips: '17', center: [-89.2, 40.0], zoom: 4.2 },
};
// Worst-outcome color for a county given its projects.
function countyColor(projects: Project[]): string {
  if (projects.length === 0) return '#e2e8f0'; // grey — no contested projects
  if (projects.some((p) => p.status === 'Canceled')) return '#b91c1c'; // dark red — a deal died here
  if (projects.some((p) => p.status === 'Pending')) return '#f59e0b'; // amber — active/unresolved
  return '#94a3b8'; // slate — operational/unknown (contested but resolved)
}
const STATUS_STYLE: Record<string, string> = {
  Canceled: 'text-red-700',
  Pending: 'text-amber-600',
  Operational: 'text-slate-500',
  Unknown: 'text-slate-400',
};

export function USCountyMap({ stateCode = 'TX', tech = 'solar' as Tech }: { stateCode?: string; tech?: Tech }) {
  const [activeFips, setActiveFips] = useState<string | null>(null);

  const view = STATE_VIEW[stateCode];
  const stateData = (contested as any).states[stateCode];
  const projects: Project[] = stateData?.projects?.[tech] ?? [];

  // Build a lookup: FIPS -> projects in that county (a project can appear in several).
  const projectsByFips = useMemo(() => {
    const map: Record<string, Project[]> = {};
    for (const p of projects) {
      for (const fp of p.fips) {
        (map[fp] ||= []).push(p);
      }
    }
    return map;
  }, [projects]);

  // County dropdown options: each FIPS that has >=1 contested project, with a label.
  // (A project can span multiple counties; we pair each fips with its matching county name.)
  const countyOptions = useMemo(() => {
    const opts: { fips: string; name: string }[] = [];
    const seen = new Set<string>();
    for (const p of projects) {
      p.fips.forEach((fp, idx) => {
        if (!seen.has(fp)) {
          seen.add(fp);
          opts.push({ fips: fp, name: p.counties[idx] ?? p.counties[0] ?? fp });
        }
      });
    }
    return opts.sort((a, b) => a.name.localeCompare(b.name));
  }, [projects]);

  // Reset the selected county when state/tech changes (so a stale county doesn't linger).
  const viewKey = `${stateCode}-${tech}`;
  const [lastViewKey, setLastViewKey] = useState(viewKey);
  if (viewKey !== lastViewKey) {
    setLastViewKey(viewKey);
    setActiveFips(null);
  }

  if (!view) return null;

  const isFiltered = activeFips !== null;
  const activeProjects = activeFips ? projectsByFips[activeFips] ?? [] : [];

  return (
    <div>
      <p className="mb-2 text-sm text-slate-600">
        {projects.length === 0
          ? `No contested ${tech} projects on record — consistent with low siting risk (Sabin Center, data through 2024)`
          : `${projects.length} contested ${tech} project${projects.length === 1 ? '' : 's'} on record (Sabin Center, data through 2024). Select or click a county to focus.`}
      </p>

      {/* County selector */}
      {projects.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500">County</label>
          <select
            value={activeFips ?? ''}
            onChange={(e) => setActiveFips(e.target.value || null)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
          >
            <option value="">All counties ({countyOptions.length})</option>
            {countyOptions.map((c) => (
              <option key={c.fips} value={c.fips}>
                {c.name}
              </option>
            ))}
          </select>
          {isFiltered && (
            <button
              onClick={() => setActiveFips(null)}
              className="text-xs text-slate-400 underline hover:text-slate-600"
            >
              clear
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: '#b91c1c' }} /> Canceled</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: '#f59e0b' }} /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: '#94a3b8' }} /> Operational / unknown</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <ComposableMap projection="geoAlbersUsa" width={800} height={500}>
            <ZoomableGroup center={view.center} zoom={view.zoom}>
              <Geographies geography={COUNTY_GEO_URL}>
                {({ geographies }) =>
                  geographies
                    .filter((geo) => String(geo.id).slice(0, 2) === view.fips)
                    .map((geo) => {
                      const fips = String(geo.id);
                      const countyProjects = projectsByFips[fips] ?? [];
                      const isActive = fips === activeFips;
                      // When a county is selected, dim all others.
                      const dimmed = isFiltered && !isActive;
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => countyProjects.length > 0 && setActiveFips(fips)}
                          fill={countyColor(countyProjects)}
                          stroke={isActive ? '#0f172a' : '#ffffff'}
                          strokeWidth={isActive ? 1.4 : 0.4}
                          style={{
                            default: { outline: 'none', opacity: dimmed ? 0.25 : 1 },
                            hover: {
                              outline: 'none',
                              cursor: countyProjects.length > 0 ? 'pointer' : 'default',
                              opacity: dimmed ? 0.4 : 0.8,
                            },
                            pressed: { outline: 'none' },
                          }}
                        />
                      );
                    })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* Detail panel */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          {activeProjects.length === 0 ? (
            <p className="text-slate-400">
              {projects.length === 0 ? 'No projects to display.' : 'Select a county above (or click one on the map) to see its contested projects.'}
            </p>
          ) : (
            <div>
              <h3 className="mb-2 font-semibold text-slate-700">
                {activeProjects[0].counties.join(', ')}
              </h3>
              <ul className="flex flex-col gap-3">
                {activeProjects.map((p, i) => (
                  <li key={i} className="border-b border-slate-200 pb-2 last:border-0">
                    {p.sourceUrl ? (
                      <a
                        href={p.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-700 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-700"
                      >
                        {p.title} ↗
                      </a>
                    ) : (
                      <p className="font-medium text-slate-800">{p.title}</p>
                    )}
                    <p className="mt-0.5 text-xs">
                      <span className={STATUS_STYLE[p.status] ?? 'text-slate-500'}>
                        {p.status}
                        {p.cancelled ? ` (${p.cancelled})` : ''}
                      </span>
                      {p.capacity ? <span className="text-slate-400"> · {p.capacity} MW</span> : null}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
