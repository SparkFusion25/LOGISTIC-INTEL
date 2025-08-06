'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, ExternalLink, Building2, Ship, Package, MapPin, Calendar, TrendingUp, Globe, Eye, AlertCircle } from 'lucide-react';

interface TradeIntelligenceRecord {
  id: string;
  companyName: string;
  commodity: string;
  hsCode: string;
  commodityDescription: string;
  originCountry: string;
  originCity: string;
  originPort: string;
  destinationCountry: string;
  destinationCity: string;
  destinationPort: string;
  containerSize: string;
  containerCount: number;
  weightKg: number;
  volumeCbm: number;
  valueUsd: number;
  shipmentFrequency: string;
  carrier: string;
  vessel: string;
  billOfLading: string;
  consignee: string;
  shipper: string;
  lastImportDate: string;
  totalShipmentsYtd: number;
  avgMonthlyVolume: number;
  marketShare: number;
  tradeRelationship: string;
  riskScore: number;
  complianceStatus: string;
}

interface SearchFilters {
  company: string;
  commodity: string;
  origin_country: string;
  destination_country: string;
  destination_port: string;
  destination_city: string;
  destination_state: string;
  destination_zip: string;
  hs_code: string;
  carrier: string;
  date_from: string;
  date_to: string;
}

interface SearchSummary {
  total_records: number;
  displayed_records: number;
  total_value_usd: number;
  total_containers: number;
  unique_companies: number;
  unique_carriers: number;
}

export default function SearchPanel() {
  const [results, setResults] = useState<TradeIntelligenceRecord[]>([]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    company: '',
    commodity: '',
    origin_country: '',
    destination_country: '',
    destination_port: '',
    destination_city: '',
    destination_state: '',
    destination_zip: '',
    hs_code: '',
    carrier: '',
    date_from: '',
    date_to: ''
  });

  const searchTradeIntelligence = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      
      const response = await fetch(`/api/trade/intelligence?${searchParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        setSummary(data.summary);
      } else {
        setError(data.message || 'Search failed');
        setResults([]);
        setSummary(null);
      }
    } catch (err) {
      setError('Trade intelligence system unavailable');
      setResults([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatWeight = (kg: number) => {
    if (kg >= 1000000) return `${(kg / 1000000).toFixed(1)}M kg`;
    if (kg >= 1000) return `${(kg / 1000).toFixed(0)}K kg`;
    return `${kg} kg`;
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors: { [key: string]: string } = {
      'Daily': 'bg-green-100 text-green-800',
      'Weekly': 'bg-blue-100 text-blue-800',
      'Monthly': 'bg-purple-100 text-purple-800',
      'Quarterly': 'bg-orange-100 text-orange-800',
      'Irregular': 'bg-gray-100 text-gray-800'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Clean': return 'text-green-600';
      case 'Under Review': return 'text-yellow-600';
      case 'Flagged': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const csvHeaders = [
      'Company Name', 'Commodity', 'HS Code', 'Origin', 'Destination', 
      'Container Size', 'Container Count', 'Value (USD)', 'Carrier', 
      'Last Import Date', 'Shipment Frequency', 'Compliance Status'
    ];
    
    const csvData = results.map(record => [
      record.companyName,
      record.commodity,
      record.hsCode,
      `${record.originCity}, ${record.originCountry}`,
      `${record.destinationCity}, ${record.destinationCountry}`,
      record.containerSize,
      record.containerCount,
      record.valueUsd,
      record.carrier,
      record.lastImportDate,
      record.shipmentFrequency,
      record.complianceStatus
    ]);
    
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_intelligence_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const addToCRM = async (record: TradeIntelligenceRecord) => {
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: record.consignee || record.companyName,
          title: 'Trade Contact',
          company: record.companyName,
          email: `contact@${record.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          stage: 'Prospect',
          source: 'Search',
          notes: `${record.commodity} importer. Last shipment: ${record.lastImportDate}. ${record.containerCount} containers YTD.`
        })
      });
      
      if (response.ok) {
        alert(`✅ ${record.companyName} added to CRM`);
      }
    } catch (error) {
      console.error('Failed to add to CRM:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6" />
          <div>
            <h2 className="text-2xl font-bold">🔍 Global Trade Intelligence</h2>
            <p className="text-slate-300 text-sm mt-1">Enterprise-grade import/export data and analytics</p>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        {/* Primary Search Fields */}
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              Company Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Apple, Tesla, Amazon..."
              value={filters.company}
              onChange={(e) => setFilters({...filters, company: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Package className="w-4 h-4 inline mr-1" />
              Commodity
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Electronics, textiles, machinery..."
              value={filters.commodity}
              onChange={(e) => setFilters({...filters, commodity: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Origin Country
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="China, Vietnam, Taiwan..."
              value={filters.origin_country}
              onChange={(e) => setFilters({...filters, origin_country: e.target.value})}
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            <Filter className="w-4 h-4" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={searchTradeIntelligence}
              disabled={loading}
              className="bg-indigo-700 hover:bg-indigo-800 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching...' : 'Search Intelligence'}
            </button>
            
            {results.length > 0 && (
              <button
                onClick={exportResults}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
            {/* General Filters */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                General Filters
              </h4>
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Destination Country</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="United States..."
                    value={filters.destination_country}
                    onChange={(e) => setFilters({...filters, destination_country: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">HS Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="851712..."
                    value={filters.hs_code}
                    onChange={(e) => setFilters({...filters, hs_code: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Carrier</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Maersk, COSCO..."
                    value={filters.carrier}
                    onChange={(e) => setFilters({...filters, carrier: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date From</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    value={filters.date_from}
                    onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date To</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    value={filters.date_to}
                    onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Destination Location Filters */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Refine by Destination Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Destination Port</label>
                  <input
                    type="text"
                    name="destinationPort"
                    placeholder="Port of Los Angeles, Savannah"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    value={filters.destination_port}
                    onChange={(e) => setFilters({...filters, destination_port: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Destination City</label>
                  <input
                    type="text"
                    name="destinationCity"
                    placeholder="Los Angeles, New York"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    value={filters.destination_city}
                    onChange={(e) => setFilters({...filters, destination_city: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Destination State</label>
                  <input
                    type="text"
                    name="destinationState"
                    placeholder="CA, NY, TX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    value={filters.destination_state}
                    onChange={(e) => setFilters({...filters, destination_state: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Destination Zip Code</label>
                  <input
                    type="text"
                    name="destinationZip"
                    placeholder="90210, 10001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    value={filters.destination_zip}
                    onChange={(e) => setFilters({...filters, destination_zip: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500 bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                <strong>💡 Pro Tip:</strong> Use destination filters to identify import patterns by specific regions, ports, or zip codes. Perfect for territory analysis and market penetration strategies.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="p-6 border-b border-gray-200 bg-indigo-50">
          <div className="grid md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-700">{summary.total_records}</div>
              <div className="text-xs text-gray-600">Total Records</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-700">{formatCurrency(summary.total_value_usd)}</div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-700">{summary.total_containers.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Containers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-700">{summary.unique_companies}</div>
              <div className="text-xs text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-700">{summary.unique_carriers}</div>
              <div className="text-xs text-gray-600">Carriers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-700">{summary.displayed_records}</div>
              <div className="text-xs text-gray-600">Displayed</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Analyzing global trade intelligence...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={searchTradeIntelligence}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && !loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Company & Trade Details</th>
                <th className="px-4 py-3 text-left font-semibold">Route & Logistics</th>
                <th className="px-4 py-3 text-left font-semibold">Volume & Value</th>
                <th className="px-4 py-3 text-left font-semibold">Frequency & Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((record) => (
                <tr key={record.id} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{record.companyName}</div>
                      <div className="text-sm text-gray-600">{record.commodity}</div>
                      <div className="text-xs text-gray-500">HS: {record.hsCode}</div>
                      <div className="text-xs text-gray-500">Consignee: {record.consignee}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {record.originCity}, {record.originCountry} → {record.destinationCity}, {record.destinationCountry}
                      </div>
                      <div className="text-xs text-gray-600">
                        <Ship className="w-3 h-3 inline mr-1" />
                        {record.carrier}
                      </div>
                      <div className="text-xs text-gray-500">Port: {record.originPort} → {record.destinationPort}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{record.containerCount} × {record.containerSize}</div>
                      <div className="text-sm text-gray-600">{formatCurrency(record.valueUsd)}</div>
                      <div className="text-xs text-gray-500">{formatWeight(record.weightKg)}</div>
                      <div className="text-xs text-gray-500">{record.volumeCbm.toLocaleString()} CBM</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getFrequencyBadge(record.shipmentFrequency)}`}>
                        {record.shipmentFrequency}
                      </span>
                      <div className="text-xs text-gray-600">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {record.lastImportDate}
                      </div>
                      <div className={`text-xs font-medium ${getComplianceColor(record.complianceStatus)}`}>
                        {record.complianceStatus}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCRM(record)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
                        title="Add to CRM"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && results.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">Start Your Trade Intelligence Search</h3>
          <p className="text-sm">Enter company names, commodities, or trade routes to discover global trade patterns</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Enterprise Trade Intelligence Platform
          </div>
          <div className="flex items-center gap-4">
            <span>Panjiva + Flexport Style Analytics</span>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}