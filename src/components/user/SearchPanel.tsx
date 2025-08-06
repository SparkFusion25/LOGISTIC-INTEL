'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, MapPin, Ship, Package, Building } from 'lucide-react'

interface SearchFilters {
  origin?: string
  destination?: string
  hsCode?: string
  carrier?: string
  port?: string
  dateRange?: string
  commodity?: string
  companyName?: string
  originCountry?: string
  destinationCountry?: string
  mode?: string
  // Index signature to prevent TypeScript errors for dynamic keys
  [key: string]: string | undefined
}

interface TradeResult {
  id: string
  company: string
  origin: string
  destination: string
  commodity: string
  hsCode: string
  carrier: string
  port: string
  volume: string
  date: string
  value: string
}

export default function SearchPanel() {
  const [filters, setFilters] = useState<SearchFilters>({
    origin: '',
    destination: '',
    hsCode: '',
    carrier: '',
    port: '',
    dateRange: '30d',
    commodity: ''
  })
  
  const [results, setResults] = useState<TradeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch real trade data from API
  const fetchTradeData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.company) queryParams.set('company', filters.company);
      if (filters.origin) queryParams.set('origin_country', filters.origin);
      if (filters.destination) queryParams.set('destination_country', filters.destination);
      if (filters.commodity) queryParams.set('commodity', filters.commodity);
      if (filters.hsCode) queryParams.set('hs_code', filters.hsCode);
      if (filters.carrier) queryParams.set('carrier', filters.carrier);
      
      const response = await fetch(`/api/search/unified?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success && data.records) {
        // Transform data to match TradeResult interface
        const transformedResults: TradeResult[] = data.records.map((record: any) => ({
          id: record.unified_id || record.id,
          company: record.company_name || record.unified_company_name || 'Unknown Company',
          origin: `${record.origin_country || 'Unknown'}`,
          destination: `${record.destination_city || record.destination_country || 'Unknown'}`,
          commodity: record.description || record.commodity_description || 'Unknown Commodity',
          hsCode: record.hs_code || 'N/A',
          carrier: record.carrier || record.unified_carrier || 'Unknown Carrier',
          port: record.destination_port || record.origin_port || 'Unknown Port',
          volume: `${record.weight_kg || 0} kg`,
          date: record.shipment_date || record.unified_date || 'Unknown Date',
          value: record.value_usd ? `$${(record.value_usd / 1000).toFixed(0)}K` : 'Unknown'
        }));
        setResults(transformedResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Failed to fetch trade data:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchTradeData();
  }, []);

  // Sample data for demo (fallback if no real data)
  const sampleResults: TradeResult[] = [
    {
      id: 'sample-1',
      company: 'Asia Pacific Trading',
      origin: 'Busan, South Korea',
      destination: 'Long Beach, USA',
      commodity: 'Textiles',
      hsCode: '6109.10.00',
      carrier: 'HMM',
      port: 'Port of Long Beach',
      volume: '890 TEU',
      date: '2024-01-10',
      value: '$950K'
    }
  ]

  const handleSearch = async () => {
    await fetchTradeData();
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const exportResults = () => {
    const csvContent = [
      ['Company', 'Origin', 'Destination', 'Commodity', 'HS Code', 'Carrier', 'Port', 'Volume', 'Date', 'Value'],
      ...results.map(r => [r.company, r.origin, r.destination, r.commodity, r.hsCode, r.carrier, r.port, r.volume, r.date, r.value])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trade_search_results.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Trade Search</h2>
            <p className="text-gray-600">Search company trade activity, shipment history, and market intelligence</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Main Search Bar */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by company name, commodity, or HS code..."
              className="form-input w-full"
              value={filters.commodity}
              onChange={(e) => handleFilterChange('commodity', e.target.value)}
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary px-8"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Origin
              </label>
              <input
                type="text"
                placeholder="City, Country"
                className="form-input"
                value={filters.origin}
                onChange={(e) => handleFilterChange('origin', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Destination
              </label>
              <input
                type="text"
                placeholder="City, Country"
                className="form-input"
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                HS Code
              </label>
              <input
                type="text"
                placeholder="e.g. 8471.30.01"
                className="form-input"
                value={filters.hsCode}
                onChange={(e) => handleFilterChange('hsCode', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ship className="w-4 h-4 inline mr-1" />
                Carrier
              </label>
              <input
                type="text"
                placeholder="e.g. COSCO, Hapag-Lloyd"
                className="form-input"
                value={filters.carrier}
                onChange={(e) => handleFilterChange('carrier', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Port
              </label>
              <input
                type="text"
                placeholder="Port name"
                className="form-input"
                value={filters.port}
                onChange={(e) => handleFilterChange('port', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                className="form-input"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Search Results ({results.length})
          </h3>
          {results.length > 0 && (
            <button
              onClick={exportResults}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Route</th>
                  <th>Commodity</th>
                  <th>HS Code</th>
                  <th>Carrier</th>
                  <th>Volume</th>
                  <th>Value</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="font-medium">{result.company}</td>
                    <td>
                      <div className="text-sm">
                        <div>{result.origin}</div>
                        <div className="text-gray-500">→ {result.destination}</div>
                      </div>
                    </td>
                    <td>{result.commodity}</td>
                    <td className="font-mono text-sm">{result.hsCode}</td>
                    <td>{result.carrier}</td>
                    <td>{result.volume}</td>
                    <td className="font-semibold text-green-600">{result.value}</td>
                    <td>{result.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}