'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, ExternalLink, Building2, Ship, Package, MapPin, Calendar, TrendingUp, Globe, Eye, AlertCircle, ChevronDown, Menu, Plane, Waves, Brain } from 'lucide-react';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import MobileOptimizedForm from '@/components/ui/MobileOptimizedForm';

type SearchMode = 'all' | 'air' | 'ocean';

interface SearchModeOption {
  key: SearchMode;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface UnifiedTradeRecord {
  id: string;
  mode: 'air' | 'ocean';
  mode_icon: string;
  unified_company_name: string;
  unified_destination: string;
  unified_value: number;
  unified_weight: number;
  unified_date: string;
  unified_carrier: string;
  hs_code: string;
  description?: string;
  hs_description?: string;
  commodity_description?: string;
  company_profile?: {
    id: string;
    company_name: string;
    primary_industry: string;
    air_match: boolean;
    air_match_score: number;
    ocean_match?: boolean;
    ocean_match_score?: number;
  };
  match_info?: {
    match_score: number;
    match_type: string;
  };
}

interface SearchFilters {
  mode: SearchMode;
  company: string;
  commodity: string;
  origin_country: string;
  destination_country: string;
  destination_city: string;
  destination_state: string;
  destination_zip: string;
  hs_code: string;
  carrier: string;
  date_from: string;
  date_to: string;
  min_value: string;
  max_value: string;
}

interface SearchSummary {
  total_records: number;
  total_value_usd: number;
  total_weight_kg: number;
  average_shipment_value: number;
  unique_companies: number;
  unique_carriers: number;
  unique_commodities: number;
  mode_breakdown: {
    air: number;
    ocean: number;
  };
  value_per_kg: number;
}

export default function SearchPanel() {
  const [searchResults, setSearchResults] = useState<UnifiedTradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentMode, setCurrentMode] = useState<SearchMode>('all');
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const [filters, setFilters] = useState<SearchFilters>({
    mode: 'all',
    company: '',
    commodity: '',
    origin_country: '',
    destination_country: '',
    destination_city: '',
    destination_state: '',
    destination_zip: '',
    hs_code: '',
    carrier: '',
    date_from: '',
    date_to: '',
    min_value: '',
    max_value: ''
  });

  const searchModes: SearchModeOption[] = [
    {
      key: 'all',
      label: 'All Data',
      icon: <Globe className="w-4 h-4" />,
      description: 'Combined air + ocean intelligence',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      key: 'air',
      label: 'Airfreight',
      icon: <Plane className="w-4 h-4" />,
      description: 'Air cargo data from US Census',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'ocean',
      label: 'Ocean',
      icon: <Waves className="w-4 h-4" />,
      description: 'Ocean freight manifest data',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    }
  ];

  useEffect(() => {
    // Load default search results
    handleSearch();
  }, []);

  useEffect(() => {
    // Update search when mode changes
    if (currentMode !== filters.mode) {
      setFilters(prev => ({ ...prev, mode: currentMode }));
      handleSearch();
    }
  }, [currentMode]);

  const handleModeChange = (mode: SearchMode) => {
    setCurrentMode(mode);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add mode
      queryParams.append('mode', currentMode);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() && key !== 'mode') {
          queryParams.append(key, value.trim());
        }
      });

      // Add pagination
      queryParams.append('limit', '25');
      queryParams.append('offset', '0');

      const response = await fetch(`/api/search/unified?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setSearchResults(result.data || []);
        setSummary(result.summary);
        setTotalResults(result.total || 0);
      } else {
        console.error('Search failed:', result.error);
        setSearchResults([]);
        setSummary(null);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSummary(null);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatWeight = (weight: number) => {
    return `${weight?.toLocaleString()} kg`;
  };

  const getCompanyMatchBadges = (record: UnifiedTradeRecord) => {
    const badges = [];
    
    if (record.company_profile) {
      if (record.company_profile.air_match) {
        badges.push(
          <span key="air" className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            ✈️ Air Match ({record.company_profile.air_match_score}/10)
          </span>
        );
      }
      if (record.company_profile.ocean_match) {
        badges.push(
          <span key="ocean" className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
            🚢 Ocean Match ({record.company_profile.ocean_match_score}/10)
          </span>
        );
      }
    }

    if (record.match_info) {
      badges.push(
        <span key="combined" className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
          🌐 Combined Match ({record.match_info.match_score}/10)
        </span>
      );
    }

    return badges;
  };

  const currentModeConfig = searchModes.find(mode => mode.key === currentMode) || searchModes[0];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Trade Intelligence Search
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Discover global trade patterns across air and ocean freight
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {searchModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => handleModeChange(mode.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                currentMode === mode.key
                  ? `${mode.bgColor} ${mode.color} ${mode.borderColor} border shadow-sm`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {mode.icon}
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Mode Indicator */}
      <div className={`${currentModeConfig.bgColor} ${currentModeConfig.borderColor} border rounded-lg p-3 mb-6`}>
        <div className="flex items-center gap-3">
          <div className={`${currentModeConfig.color}`}>
            {currentModeConfig.icon}
          </div>
          <div>
            <h3 className={`font-semibold ${currentModeConfig.color}`}>
              Showing: {currentModeConfig.label} Results
            </h3>
            <p className="text-sm text-gray-600">{currentModeConfig.description}</p>
          </div>
          {summary && (
            <div className="ml-auto text-right">
              <div className="text-sm font-medium text-gray-900">
                {totalResults.toLocaleString()} records
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(summary.total_value_usd)} total value
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Form */}
      <MobileOptimizedForm onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              placeholder="Enter company name..."
              value={filters.company}
              onChange={(e) => setFilters({...filters, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commodity/Product</label>
            <input
              type="text"
              placeholder="Electronics, machinery..."
              value={filters.commodity}
              onChange={(e) => setFilters({...filters, commodity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin Country</label>
            <select
              value={filters.origin_country}
              onChange={(e) => setFilters({...filters, origin_country: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              <option value="CN">China</option>
              <option value="DE">Germany</option>
              <option value="JP">Japan</option>
              <option value="KR">South Korea</option>
              <option value="SG">Singapore</option>
              <option value="NL">Netherlands</option>
              <option value="CH">Switzerland</option>
              <option value="FR">France</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
            <input
              type="text"
              placeholder="Los Angeles, New York..."
              value={filters.destination_city}
              onChange={(e) => setFilters({...filters, destination_city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="space-y-6 p-6 bg-gray-50 rounded-lg border">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                General Filters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">HS Code</label>
                  <input
                    type="text"
                    placeholder="8471600000"
                    value={filters.hs_code}
                    onChange={(e) => setFilters({...filters, hs_code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Carrier</label>
                  <input
                    type="text"
                    placeholder="FedEx, COSCO, MSC"
                    value={filters.carrier}
                    onChange={(e) => setFilters({...filters, carrier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Destination State</label>
                  <select
                    value={filters.destination_state}
                    onChange={(e) => setFilters({...filters, destination_state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  >
                    <option value="">All States</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="FL">Florida</option>
                    <option value="TX">Texas</option>
                    <option value="IL">Illinois</option>
                    <option value="WA">Washington</option>
                    <option value="GA">Georgia</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range & Value Filters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Min Value (USD)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={filters.min_value}
                    onChange={(e) => setFilters({...filters, min_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Max Value (USD)</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={filters.max_value}
                    onChange={(e) => setFilters({...filters, max_value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </MobileOptimizedForm>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{summary.total_records}</div>
            <div className="text-sm text-blue-800">Total Records</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_value_usd)}</div>
            <div className="text-sm text-green-800">Total Value</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{summary.unique_companies}</div>
            <div className="text-sm text-purple-800">Companies</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{summary.unique_commodities}</div>
            <div className="text-sm text-orange-800">Commodities</div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <ResponsiveTable
          columns={[
            {
              key: 'mode_indicator',
              label: 'Mode',
              render: (value, record) => (
                <div className="flex items-center gap-1">
                  <span className="text-lg">{record.mode_icon}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    record.mode === 'air' ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {record.mode.toUpperCase()}
                  </span>
                </div>
              )
            },
            {
              key: 'unified_company_name',
              label: 'Company',
              sortable: true,
              render: (value, record) => (
                <div>
                  <div className="font-medium text-gray-900">{value}</div>
                  {record.company_profile?.primary_industry && (
                    <div className="text-xs text-gray-500">{record.company_profile.primary_industry}</div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getCompanyMatchBadges(record)}
                  </div>
                </div>
              )
            },
            {
              key: 'commodity_info',
              label: 'Commodity',
              mobileHidden: true,
              render: (value, record) => (
                <div>
                  <div className="font-medium text-sm">{record.hs_code}</div>
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {record.description || record.hs_description || record.commodity_description || 'N/A'}
                  </div>
                </div>
              )
            },
            {
              key: 'unified_destination',
              label: 'Destination',
              render: (value) => (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{value || 'N/A'}</span>
                </div>
              )
            },
            {
              key: 'unified_value',
              label: 'Value',
              sortable: true,
              render: (value) => (
                <span className="font-medium text-green-600">
                  {formatCurrency(value || 0)}
                </span>
              )
            },
            {
              key: 'trade_details',
              label: 'Details',
              mobileHidden: true,
              render: (value, record) => (
                <div className="text-xs text-gray-600">
                  <div>{formatWeight(record.unified_weight || 0)}</div>
                  <div>{record.unified_carrier || 'N/A'}</div>
                  <div>{new Date(record.unified_date).toLocaleDateString()}</div>
                </div>
              )
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (value, record) => (
                <div className="flex items-center gap-2">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded flex items-center justify-center transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    className="bg-purple-600 hover:bg-purple-700 text-white p-1 rounded flex items-center justify-center transition-colors"
                    title="Enrich Contacts"
                  >
                    <Brain className="w-3 h-3" />
                  </button>
                </div>
              )
            }
          ]}
          data={searchResults}
          searchable={false}
          loading={isLoading}
          emptyMessage={
            currentMode === 'all' 
              ? "No trade records found. Try adjusting your search criteria or filters."
              : `No ${currentMode} freight records found. Try different search parameters.`
          }
          onRowClick={(record) => {
            console.log('Trade record clicked:', record);
          }}
        />
      </div>

      {/* Mode-specific Information */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className={`${currentModeConfig.color}`}>
            {currentModeConfig.icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              {currentModeConfig.label} Data Source
            </h3>
            <p className="text-sm text-gray-600 mb-2">{currentModeConfig.description}</p>
            
            {currentMode === 'air' && (
              <div className="text-xs text-gray-500">
                <div>• Data from US Census Bureau aircraft trade statistics</div>
                <div>• Updated monthly with latest airfreight manifests</div>
                <div>• Includes HS codes, values, weights, and carrier information</div>
              </div>
            )}
            
            {currentMode === 'ocean' && (
              <div className="text-xs text-gray-500">
                <div>• Data from ocean freight manifests and bills of lading</div>
                <div>• Includes container counts, vessel names, and port information</div>
                <div>• Real-time updates from major shipping lines</div>
              </div>
            )}
            
            {currentMode === 'all' && (
              <div className="text-xs text-gray-500">
                <div>• Combined intelligence from both air and ocean freight</div>
                <div>• Advanced matching algorithms identify multi-modal companies</div>
                <div>• Cross-reference HS codes, destinations, and company names</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}