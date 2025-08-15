'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Search } from 'lucide-react';

import InteractiveShipmentMap from './InteractiveShipmentMap';
import PrimaryShipmentCard from './PrimaryShipmentCard';
import ResponsiveTable from './ui/ResponsiveTable';


type Mode = 'all' | 'ocean' | 'air';

export interface ShipmentRow {
  id: string;
  unified_company_name: string;
  unified_destination?: string | null;
  unified_value?: number | null;
  unified_weight?: number | null;
  unified_date?: string | null;
  unified_carrier?: string | null;
  hs_code?: string | null;
  mode: 'ocean' | 'air';
  progress: number;
  company_id: string;
  bol_number?: string | null;
  vessel_name?: string | null;
  shipper_name?: string | null;
  port_of_loading?: string | null;
  port_of_discharge?: string | null;
  gross_weight_kg?: number | null;
}

export default function SearchPanel() {
  const [q, setQ] = useState('');
  const [company, setCompany] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<Mode>('all');
  const [data, setData] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<ShipmentRow | null>(null);
  const [source, setSource] = useState('unified_shipments');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Transform ShipmentRow data to match InteractiveShipmentMap expected format
  const transformedShipments = useMemo(() => {
    return data.map(row => ({
      id: row.id,
      company: row.unified_company_name || 'Unknown Company',
      origin: row.port_of_loading || '—',
      destination: row.unified_destination || '—',
      type: row.mode as 'ocean' | 'air',
      date: row.unified_date || null, // optional, if your map shows dates
      value: row.unified_value || undefined
    }));
  }, [data]);

  const pageSize = 100;

  const fetchPage = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const offset = reset ? 0 : page * pageSize;
    const qs = new URLSearchParams({
      mode,
      q,
      company,
      origin,
      destination,
      limit: String(pageSize),
      offset: String(offset)
    });
    try {
      const res = await fetch(`/api/search?${qs.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json?.success) {
        setHasMore(false);
        if (reset) setData([]);
        return;
      }
      setData(reset ? json.items : [...data, ...json.items]);
      setHasMore(json.total > offset + pageSize);
      setSource(json.source || 'unified_shipments');
      setPage(reset ? 1 : page + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPage(true);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, company, origin, destination, mode]);

  const columns = useMemo(
    () => [
      { header: 'Company', accessorKey: 'unified_company_name' },
      { header: 'Route', accessorFn: (r: ShipmentRow) => `${r.unified_destination || '—'}` },
      { header: 'Mode', accessorKey: 'mode' },
      { header: 'Progress', accessorFn: (r: ShipmentRow) => `${r.progress || 0}%` }
    ],
    []
  );

  return (
    <div className="px-8 py-6 max-w-screen-xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow px-6 py-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            aria-label="Search"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-200 outline-none"
          />
        </div>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          aria-label="Company"
          className="w-40 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-200 outline-none"
        />
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Origin"
          aria-label="Origin"
          className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-200 outline-none"
        />
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination"
          aria-label="Destination"
          className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-200 outline-none"
        />
        <div className="flex gap-2">
          {(['all', 'ocean', 'air'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg font-medium ${
                mode === m ? 'bg-black text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {m === 'all' ? 'All Modes' : m === 'ocean' ? 'Ocean' : 'Air'}
            </button>
          ))}
        </div>
        <span className={`ml-4 px-2 py-1 rounded text-xs font-semibold ${source === 'unified_shipments' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{source === 'unified_shipments' ? 'Unified' : 'Fallback'}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 space-y-4">
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <InteractiveShipmentMap
              shipments={transformedShipments}
              filterType={mode}
              searchQuery={company}
              isLoading={loading}
            />
          </div>
          {selected && <PrimaryShipmentCard shipment={selected} />}
        </div>

        <div className="lg:w-1/3 h-[600px] rounded-lg border border-gray-200 overflow-hidden flex flex-col">
          <ResponsiveTable
            columns={columns}
            data={data}
            loading={loading}
            rowHeight={60}
            onRowClick={(row: ShipmentRow) => setSelected(row)}
          />
          <div className="flex justify-between items-center p-2 border-t bg-gray-50">
            <button
              disabled={loading || page === 1}
              onClick={() => { setPage(page - 1); fetchPage(true); }}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >Prev</button>
            <button
              disabled={loading || !hasMore}
              onClick={() => fetchPage(false)}
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
