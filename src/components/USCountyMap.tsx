'use client';

import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import contested from '@/data/contested-projects.json';

const COUNTY_GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

type Tech = 'wind' | 'solar' | 'battery';

// center [lng, lat] + zoom for each of the 8 states (first estimates; easy to tune)
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

export function USCountyMap({ stateCode = 'TX', tech = 'solar' as Tech }: { stateCode?: string; tech?: Tech }) {
  const view = STATE_VIEW[stateCode];
  const stateData = (contested as any).states[stateCode];
  const highlightFips: string[] = stateData?.fipsByTech?.[tech] ?? [];
  const highlightSet = new Set(highlightFips);
  const projects = stateData?.projects?.[tech] ?? [];

  if (!view) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 text-center text-sm text-slate-600">
        {projects.length === 0
          ? `No contested ${tech} projects on record — consistent with low siting risk (Sabin Center)`
          : `${projects.length} contested ${tech} project${projects.length === 1 ? '' : 's'} across ${highlightFips.length} county/counties in ${stateCode} (Sabin Center)`}
      </p>
      <ComposableMap projection="geoAlbersUsa" width={800} height={500}>
        <ZoomableGroup center={view.center} zoom={view.zoom}>
          <Geographies geography={COUNTY_GEO_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) => String(geo.id).slice(0, 2) === view.fips)
                .map((geo) => {
                  const isHighlight = highlightSet.has(String(geo.id));
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isHighlight ? '#dc2626' : '#e2e8f0'}
                      stroke="#ffffff"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: isHighlight ? '#b91c1c' : '#cbd5e1', outline: 'none' },
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
  );
}
