// components/search/InteractiveShipmentMap.tsx
'use client';
import React from 'react';

interface ShipmentPoint {
  origin: { city?: string; country?: string; coords?: [number, number] };
  destination: { city?: string; country?: string; coords?: [number, number] };
  type?: string; // 'air' | 'ocean'
}

interface Props {
  shipments: ShipmentPoint[];
  filterType: 'all' | 'ocean' | 'air';
  searchQuery: string;
  onSelect?: (s: any) => void;
  isLoading?: boolean;
}

const PORT_COORDINATES: Record<string, [number, number]> = {
  'Shanghai': [121.4737, 31.2304],
  'Singapore': [103.8198, 1.3521],
  'Los Angeles': [-118.1892, 33.7676],
  'Long Beach': [-118.1892, 33.7676],
  'New York': [-74.0060, 40.7128],
  'Hamburg': [9.9937, 53.5511],
  'Rotterdam': [4.4792, 51.9225],
  // Add more as needed
  'default': [0, 0],
};

function getCoords(city: string | undefined): [number, number] {
  if (!city) return PORT_COORDINATES.default;
  return PORT_COORDINATES[city] || PORT_COORDINATES.default;
}

export default function InteractiveShipmentMap({ shipments, filterType, searchQuery, onSelect, isLoading }: Props) {
  // SVG dimensions
  const w = 900, h = 400, padding = 40;

  // Project coords onto SVG (for demo)
  function project([lng, lat]: [number, number]) {
    const x = ((lng + 180) / 360) * (w - 2 * padding) + padding;
    const y = ((90 - lat) / 180) * (h - 2 * padding) + padding;
    return [x, y];
  }

  return (
    <div className="relative bg-white rounded-lg shadow p-4" style={{ minHeight: 420 }}>
      <svg width={w} height={h} className="block rounded-lg border border-gray-200 bg-slate-900 w-full h-[400px]">
        {/* Map routes */}
        {shipments.map((s, i) => {
          const [x1, y1] = project(getCoords(s.origin.city));
          const [x2, y2] = project(getCoords(s.destination.city));
          const mx = (x1 + x2) / 2;
          const my = Math.min(y1, y2) - 60 + Math.abs(i % 50 - 25) * 1.5; // Arc spread for visibility

          return (
            <g key={i}>
              <path
                d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                fill="none"
                stroke={s.type === 'air' ? '#0ea5e9' : '#3b82f6'}
                strokeWidth={2}
                opacity={0.8}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect?.(s)}
              />
              {/* Animated origin/destination markers */}
              <circle cx={x1} cy={y1} r={7} fill="#10b981" stroke="#fff" strokeWidth={2} />
              <circle cx={x2} cy={y2} r={7} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      {/* Overlay legend and filters */}
      <div className="absolute left-4 top-4 bg-white/80 px-4 py-2 rounded shadow text-xs">
        {isLoading ? 'Loading…' : `${shipments.length} results`} • Filter: {filterType} • Query: {searchQuery || '—'}
        <div className="flex gap-2 mt-2">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Origin</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />Destination</div>
        </div>
      </div>
    </div>
  );
}
