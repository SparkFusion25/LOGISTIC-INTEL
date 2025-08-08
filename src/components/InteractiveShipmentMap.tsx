import React from 'react';

interface ShipmentPoint {
  origin: { city?: string; country?: string; coords?: [number, number] }
  destination: { city?: string; country?: string; coords?: [number, number] }
  type?: string
}

interface Props {
  shipments: ShipmentPoint[]
  filterType: 'all'|'ocean'|'air'
  searchQuery: string
  onSelect?: (s: any)=>void
  isLoading?: boolean
}

// Equirectangular projection (SVG): lat/lng → x/y
function latLngToXY([lat, lng]: [number, number], width: number, height: number) {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

export default function InteractiveShipmentMap({ shipments, filterType, searchQuery, onSelect, isLoading }: Props) {
  const mapUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/BlankMap-World-noborders.png/1024px-BlankMap-World-noborders.png";
  const width = 900;
  const height = 400;

  return (
    <div className="w-full h-[420px] relative bg-white rounded-lg border shadow">
      <svg width={width} height={height} className="absolute inset-0">
        {/* World map image */}
        <image x="0" y="0" width={width} height={height} href={mapUrl} opacity="0.88" />

        {/* Draw shipment arcs */}
        {shipments.map((s, i) => {
          if (!s.origin.coords || !s.destination.coords) return null;
          const [x1, y1] = latLngToXY(s.origin.coords, width, height);
          const [x2, y2] = latLngToXY(s.destination.coords, width, height);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 60;

          return (
            <g key={i}>
              <path
                d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
                fill="none"
                stroke={s.type === 'air' ? '#0ea5e9' : '#3b82f6'}
                strokeWidth={2}
                opacity={0.7}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect?.(s)}
              />
              {/* Origin/Destination Markers */}
              <circle cx={x1} cy={y1} r={6} fill="#10b981" stroke="#fff" strokeWidth={1.5} />
              <circle cx={x2} cy={y2} r={6} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} />
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
