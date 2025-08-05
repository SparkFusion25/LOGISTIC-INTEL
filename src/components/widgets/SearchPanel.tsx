'use client';

import { useState } from 'react';
import { Search, Plus, ExternalLink, Building2, Globe, Truck } from 'lucide-react';

interface TradeResult {
  company_name: string;
  origin_country: string;
  destination_country: string;
  port_of_loading: string;
  port_of_discharge: string;
  hs_code: string;
  commodity_description: string;
  shipment_count: number;
  total_weight_kg: number;
  total_value_usd: number;
  last_shipment_date: string;
  primary_contact?: {
    name: string;
    email: string;
    title: string;
    linkedin_url?: string;
  };
}

interface SearchPanelProps {
  compact?: boolean;
}

export default function SearchPanel({ compact = false }: SearchPanelProps) {
  const [filters, setFilters] = useState({
    company: '',
    origin: '',
    destination: '',
    commodity: '',
    port: '',
  });

  const [results, setResults] = useState<TradeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const search = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/search-tradelane?${query}`);
      const data = await res.json();
      setResults(data.results);
      setTotalCount(data.total_count);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToCRM = async (company: TradeResult) => {
    try {
      await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.company_name,
          name: company.primary_contact?.name || '',
          email: company.primary_contact?.email || '',
          phone: '',
          commodity: company.commodity_description,
          city: company.port_of_loading,
          notes: `Trade data: ${company.shipment_count} shipments, $${company.total_value_usd.toLocaleString()} value`
        }),
      });
      alert('Lead saved to CRM successfully!');
    } catch (error) {
      console.error('Failed to save to CRM:', error);
      alert('Failed to save lead to CRM');
    }
  };

  if (compact) {
    return (
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <input 
            placeholder="Company" 
            value={filters.company}
            onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
          <input 
            placeholder="Commodity" 
            value={filters.commodity}
            onChange={(e) => setFilters({ ...filters, commodity: e.target.value })}
            className="border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        <button 
          onClick={search} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {loading ? 'Searching...' : 'Quick Search'}
        </button>
        {results.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-2">Found {totalCount} results</p>
            {results.slice(0, 3).map((entry, index) => (
              <div key={index} className="text-xs border-b py-1">
                <strong>{entry.company_name}</strong> - {entry.commodity_description} ({entry.origin_country})
              </div>
            ))}
            {results.length > 3 && (
              <p className="text-xs text-blue-600 mt-1">+{results.length - 3} more results</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6" />
          <div>
            <h2 className="text-2xl font-bold">🔍 TradeLane Intelligence Search</h2>
            <p className="text-slate-300 text-sm mt-1">Search global trade data and shipment records</p>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid md:grid-cols-5 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              Company
            </label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              placeholder="e.g. Apple, Tesla"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="w-4 h-4 inline mr-1" />
              Origin Country
            </label>
            <input
              type="text"
              value={filters.origin}
              onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
              placeholder="e.g. China, Vietnam"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="w-4 h-4 inline mr-1" />
              Destination Country
            </label>
            <input
              type="text"
              value={filters.destination}
              onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              placeholder="e.g. United States"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Truck className="w-4 h-4 inline mr-1" />
              Commodity
            </label>
            <input
              type="text"
              value={filters.commodity}
              onChange={(e) => setFilters({ ...filters, commodity: e.target.value })}
              placeholder="e.g. Electronics"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
            <input
              type="text"
              value={filters.port}
              onChange={(e) => setFilters({ ...filters, port: e.target.value })}
              placeholder="e.g. Shanghai, Los Angeles"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <button 
            onClick={search} 
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-semibold flex items-center gap-2 transition-colors"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Searching Trade Data...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching global trade databases...</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({totalCount} companies found)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Commodity</th>
                  <th className="px-4 py-3 font-semibold">Origin</th>
                  <th className="px-4 py-3 font-semibold">Destination</th>
                  <th className="px-4 py-3 font-semibold">Ports</th>
                  <th className="px-4 py-3 font-semibold">Shipments</th>
                  <th className="px-4 py-3 font-semibold">Weight (kg)</th>
                  <th className="px-4 py-3 font-semibold">Value (USD)</th>
                  <th className="px-4 py-3 font-semibold">Last Shipment</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900">{result.company_name}</div>
                        {result.primary_contact && (
                          <div className="text-xs text-gray-600 mt-1">
                            {result.primary_contact.name} - {result.primary_contact.title}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-gray-900">{result.commodity_description}</div>
                        <div className="text-xs text-gray-500 mt-1">HS: {result.hs_code}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{result.origin_country}</td>
                    <td className="px-4 py-3 text-gray-900">{result.destination_country}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        <div>📍 {result.port_of_loading}</div>
                        <div>📍 {result.port_of_discharge}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {result.shipment_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{result.total_weight_kg.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      ${result.total_value_usd.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{result.last_shipment_date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => saveToCRM(result)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Save
                        </button>
                        {result.primary_contact?.linkedin_url && (
                          <a
                            href={result.primary_contact.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && (filters.company || filters.origin || filters.destination || filters.commodity || filters.port) && (
        <div className="p-8 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No trade data found</p>
          <p className="text-sm">Try adjusting your search filters or use broader terms</p>
        </div>
      )}

      {/* Initial State */}
      {!loading && results.length === 0 && !filters.company && !filters.origin && !filters.destination && !filters.commodity && !filters.port && (
        <div className="p-8 text-center text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">🌍 Search Global Trade Intelligence</p>
          <p className="text-sm">Enter search criteria above to find trade data, shipment records, and company insights</p>
        </div>
      )}
    </div>
  );
}