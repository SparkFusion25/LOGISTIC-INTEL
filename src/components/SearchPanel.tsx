'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Search, Filter, Download, RefreshCw, AlertCircle, Globe, Loader2 } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<ShipmentRow | null>(null);
  const [source, setSource] = useState('unified_shipments');
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Transform ShipmentRow data to match InteractiveShipmentMap expected format
  const transformedShipments = useMemo(() => {
    return data.map(row => ({
      id: row.id,
      company: row.unified_company_name || 'Unknown Company',
      origin: row.port_of_loading || '—',
      destination: row.unified_destination || '—',
      type: row.mode as 'ocean' | 'air',
      date: row.unified_date || null,
      value: row.unified_value || undefined
    }));
  }, [data]);

  const pageSize = 100;

  const fetchPage = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    
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
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const json = await res.json();
      
      if (!json?.success) {
        throw new Error(json?.error || 'Search failed');
      }
      
      setData(reset ? json.items : [...data, ...json.items]);
      setHasMore(json.total > offset + pageSize);
      setSource(json.source || 'unified_shipments');
      setTotal(json.total || 0);
      setPage(reset ? 1 : page + 1);
      
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to fetch search results');
      setHasMore(false);
      if (reset) setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPage(true);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPage(true);
    }, 300);
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
      { header: 'Date', accessorFn: (r: ShipmentRow) => r.unified_date ? new Date(r.unified_date).toLocaleDateString() : '—' },
      { header: 'Progress', accessorFn: (r: ShipmentRow) => `${r.progress || 0}%` }
    ],
    []
  );

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Enhanced Search Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Trade Intelligence Search</h2>
              <p className="text-sm text-gray-600">Search through {total.toLocaleString()} trade records</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Search Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
            />
          </div>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
          />
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Origin port"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
          />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination"
            className="px-4 py-3 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
          />
          <div className="flex gap-2">
            {(['all', 'ocean', 'air'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  mode === m 
                    ? 'bg-sky-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {m === 'all' ? 'All' : m === 'ocean' ? 'Ocean' : 'Air'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              source === 'unified_shipments' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {source === 'unified_shipments' ? 'Unified Data' : 'Fallback Data'}
            </span>
            {total > 0 && (
              <span className="text-sm text-gray-600">
                {total.toLocaleString()} records found
              </span>
            )}
          </div>
          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="px-8 py-6 space-y-6">
        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
              <p className="text-gray-600">Searching trade records...</p>
            </div>
          </div>
        ) : data.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search parameters</p>
              <button 
                onClick={() => {
                  setQ('');
                  setCompany('');
                  setOrigin('');
                  setDestination('');
                  setMode('all');
                }}
                className="text-sky-600 hover:text-sky-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map and Selected Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Shipment Routes</h3>
                </div>
                <div className="h-96">
                  <InteractiveShipmentMap
                    shipments={transformedShipments}
                    filterType={mode}
                    searchQuery={company}
                    isLoading={loading}
                  />
                </div>
              </div>
              {selected && <PrimaryShipmentCard shipment={selected} />}
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Search Results</h3>
              </div>
              <div className="flex-1 h-[600px] overflow-hidden">
                <ResponsiveTable
                  columns={columns}
                  data={data}
                  loading={loading}
                  rowHeight={60}
                  onRowClick={(row: ShipmentRow) => setSelected(row)}
                />
              </div>
              {/* Pagination */}
              <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                <button
                  disabled={loading || page <= 1}
                  onClick={() => { setPage(Math.max(1, page - 1)); fetchPage(true); }}
                  className="px-4 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} {hasMore ? '(more available)' : ''}
                </span>
                <button
                  disabled={loading || !hasMore}
                  onClick={() => fetchPage(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
