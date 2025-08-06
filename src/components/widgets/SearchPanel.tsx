'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, ExternalLink, Building2, Ship, Package, MapPin, Calendar, TrendingUp, Globe, Eye, AlertCircle, ChevronDown, Menu, Plane, Waves, Brain, Zap, Users } from 'lucide-react';
import ResponsiveTable from '@/components/ui/ResponsiveTable';
import EnrichedContactCard from '@/components/widgets/EnrichedContactCard';
import CompanyTrendChart from '@/components/insights/CompanyTrendChart';
import ShipmentTrendMini from '@/components/insights/ShipmentTrendMini';
import ConfidenceIndicator from '@/components/ui/ConfidenceIndicator';
import CompanyFeedback from '@/components/ui/CompanyFeedback';
import { ConfidenceEngine } from '@/lib/confidenceEngine';

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
  unified_id: string;
  mode: 'air' | 'ocean';
  mode_icon: string;
  shipment_type: 'air' | 'ocean';
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
  // Enhanced confidence data from new UN Comtrade integration
  confidence_score?: number;
  confidence_sources?: string[];
  apollo_verified?: boolean;
  company_profile?: {
    id: string;
    company_name: string;
    primary_industry: string;
    air_match: boolean;
    air_match_score: number;
    ocean_match?: boolean;
    ocean_match_score?: number;
    likely_air_shipper?: boolean;
    air_confidence_score?: number;
    bts_route_matches?: any[];
  };
  match_info?: {
    match_score: number;
    match_type: string;
  };
  // BTS-specific fields
  bts_intelligence?: {
    is_likely_air_shipper: boolean;
    confidence_score: number;
    route_matches: BTSRouteMatch[];
    last_analysis: string;
  };
}

interface BTSRouteMatch {
  origin_airport: string;
  dest_airport: string;
  carrier: string;
  dest_city: string;
  freight_kg: number;
}

interface SearchFilters {
  mode?: SearchMode;
  companyName?: string;
  company?: string;
  commodity?: string;
  originCountry?: string;
  origin_country?: string;
  destinationCountry?: string;
  destination_country?: string;
  destination_city?: string;
  destination_state?: string;
  destination_zip?: string;
  hsCode?: string;
  hs_code?: string;
  carrier?: string;
  date_from?: string;
  date_to?: string;
  min_value?: string;
  max_value?: string;
  air_shipper_only?: boolean;
  // Index signature to prevent TypeScript errors for dynamic keys
  [key: string]: string | boolean | SearchMode | undefined;
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
  air_shipper_breakdown?: {
    likely_air_shippers: number;
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
  };
}

export default function SearchPanel() {
  const [searchResults, setSearchResults] = useState<UnifiedTradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentMode, setCurrentMode] = useState<SearchMode>('all');
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [expandedContacts, setExpandedContacts] = useState<Set<string>>(new Set());

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
    max_value: '',
    air_shipper_only: false
  });

  const searchModes: SearchModeOption[] = [
    {
      key: 'all',
      label: 'All Data',
      icon: <Globe className="w-4 h-4" />,
      description: 'Combined air + ocean + BTS intelligence',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      key: 'air',
      label: 'Airfreight',
      icon: <Plane className="w-4 h-4" />,
      description: 'BTS T-100 + Census airfreight data',
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
    setFilters(prev => ({ ...prev, mode: currentMode }));
    handleSearch();
  }, [currentMode]);

  const handleModeChange = (mode: SearchMode) => {
    setCurrentMode(mode);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    
    try {
      // First get unified search results
      const queryParams = new URLSearchParams();
      
      // Add mode
      queryParams.append('mode', currentMode);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim() && key !== 'mode') {
          queryParams.append(key, value.toString().trim());
        }
      });

      // Add pagination
      queryParams.append('limit', '25');
      queryParams.append('offset', '0');

      const response = await fetch(`/api/search/unified?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        // Enrich results with BTS intelligence
        const enrichedResults = await enrichWithBTSIntelligence(result.data || []);
        
        setSearchResults(enrichedResults);
        setSummary(result.summary);
        setTotalResults(result.total || 0);

        // Log search analytics
        const avgConfidence = enrichedResults.reduce((sum: number, r: UnifiedTradeRecord) => {
          return sum + (r.confidence_score || 0);
        }, 0) / (enrichedResults.length || 1);
        
        await ConfidenceEngine.logSearch(
          filters.companyName || filters.commodity || 'general search',
          { mode: currentMode, ...filters },
          enrichedResults.length,
          avgConfidence
        );
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

  const enrichWithBTSIntelligence = async (records: UnifiedTradeRecord[]) => {
    try {
      // Get BTS intelligence for all companies
      const companyNames = Array.from(new Set(records.map(r => r.unified_company_name)));
      const btsPromises = companyNames.map(async (companyName) => {
        try {
          const response = await fetch(`/api/search/air-intelligence?company=${encodeURIComponent(companyName)}`);
          const data = await response.json();
          return { companyName, intelligence: data.success ? data.intelligence : null };
        } catch (error) {
          return { companyName, intelligence: null };
        }
      });

      const btsResults = await Promise.all(btsPromises);
      const btsMap = new Map(btsResults.map(r => [r.companyName, r.intelligence]));

      // Enrich records with BTS data
      return records.map(record => ({
        ...record,
        bts_intelligence: btsMap.get(record.unified_company_name) || null,
        company_profile: {
          id: record.company_profile?.id || 'unknown',
          company_name: record.company_profile?.company_name || record.unified_company_name,
          primary_industry: record.company_profile?.primary_industry || 'Unknown',
          air_match: record.company_profile?.air_match || false,
          air_match_score: record.company_profile?.air_match_score || 0,
          ocean_match: record.company_profile?.ocean_match,
          ocean_match_score: record.company_profile?.ocean_match_score,
          likely_air_shipper: btsMap.get(record.unified_company_name)?.is_likely_air_shipper || false,
          air_confidence_score: btsMap.get(record.unified_company_name)?.confidence_score || 0,
          bts_route_matches: btsMap.get(record.unified_company_name)?.route_matches || []
        }
      }));
    } catch (error) {
      console.error('BTS enrichment error:', error);
      return records;
    }
  };

  const toggleContactCard = (companyName: string) => {
    const newExpanded = new Set(expandedContacts);
    if (newExpanded.has(companyName)) {
      newExpanded.delete(companyName);
    } else {
      newExpanded.add(companyName);
    }
    setExpandedContacts(newExpanded);
  };

  const addToCRM = async (record: UnifiedTradeRecord) => {
    try {
      const contactData = {
        company_name: record.unified_company_name,
        contact_name: 'Lead Contact', // Default name, will be enriched
        title: 'Contact Person',
        email: '', // Will be enriched by Apollo
        source: 'Trade Search',
        unified_id: record.id,
        hs_code: record.hs_code,
        tags: ['trade-lead', record.mode],
        notes: `Added from ${record.mode} shipment search. Value: ${record.unified_value ? `$${record.unified_value}` : 'Unknown'}, Date: ${record.unified_date}`
      };

      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      const result = await response.json();

      if (result.success) {
        // Show success notification
        alert(`${record.unified_company_name} has been added to your CRM!`);
        
        // Try to enrich the contact with Apollo
        if (result.contact?.id) {
          enrichContactWithApollo(result.contact.id, record.unified_company_name);
        }
      } else {
        if (result.error === 'Contact already exists in CRM') {
          alert('This company is already in your CRM.');
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Failed to add to CRM:', error);
      alert('Failed to add contact to CRM. Please try again.');
    }
  };

  const enrichContactWithApollo = async (contactId: string, companyName: string) => {
    try {
      const response = await fetch('/api/enrichment/apollo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          contactId,
          maxContacts: 3
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log(`Enriched ${companyName} with ${result.contactsAdded} Apollo contacts`);
      }
    } catch (error) {
      console.error('Apollo enrichment failed:', error);
      // Don't show error to user, enrichment is optional
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
    
    // BTS Intelligence Badge
    if (record.bts_intelligence?.is_likely_air_shipper) {
      badges.push(
        <span key="bts" className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
          🚀 BTS Confirmed ({record.bts_intelligence.confidence_score}%)
        </span>
      );
    }
    
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
        <span key="combined" className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          🌐 Combined Match ({record.match_info.match_score}/10)
        </span>
      );
    }

    return badges;
  };

  const handleStartCampaign = (contacts: any[], companyName: string) => {
    console.log(`Starting campaign for ${companyName} with ${contacts.length} contacts:`, contacts);
    // TODO: Integrate with campaign builder
    alert(`Campaign started for ${companyName} with ${contacts.length} contacts`);
  };

  const currentModeConfig = searchModes.find(mode => mode.key === currentMode) || searchModes[0];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            Live Trade Intelligence + BTS Air Cargo
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time trade patterns with enriched contact intelligence
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
              {summary.air_shipper_breakdown && (
                <div className="text-xs text-indigo-600">
                  {summary.air_shipper_breakdown.likely_air_shippers} air shippers detected
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
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

        {/* Air Shipper Filter */}
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.air_shipper_only}
              onChange={(e) => setFilters({...filters, air_shipper_only: e.target.checked})}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              🚀 Show only likely air shippers (BTS confirmed)
            </span>
          </label>
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
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
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
                    placeholder="FedEx, COSCO, Korean Air Cargo"
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
      </form>

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
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-indigo-600">
              {summary.air_shipper_breakdown?.likely_air_shippers || 0}
            </div>
            <div className="text-sm text-indigo-800">Air Shippers</div>
          </div>
        </div>
      )}

      {/* Results Display */}
      <div className="space-y-4">
        {!searchResults || searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isLoading ? 'Searching...' : 'No results found'}
            </h3>
            <p className="text-gray-500">
              {isLoading ? 'Please wait while we search the database' : 'Try adjusting your search criteria'}
            </p>
          </div>
        ) : (
          searchResults.map((record) => (
          <div key={record.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Main Result Row */}
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{record.mode_icon || (record.mode === 'air' ? '✈️' : '🚢')}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      (record.mode === 'air' || record.shipment_type === 'air') ? 'bg-blue-100 text-blue-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {(record.mode || record.shipment_type || 'unknown').toUpperCase()}
                    </span>
                                          <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">{record.unified_company_name || 'Unknown Company'}</h3>
                        {record.unified_company_name && (
                          <ShipmentTrendMini companyName={record.unified_company_name} />
                        )}
                      </div>
                    <div className="flex flex-wrap gap-1">
                      {record && getCompanyMatchBadges(record)}
                    </div>
                  </div>

                  {/* Confidence Indicator */}
                  {record?.confidence_score && (
                    <div className="mb-3">
                      <ConfidenceIndicator 
                        score={record.confidence_score}
                        sources={record.confidence_sources || []}
                        apolloVerified={record.apollo_verified || false}
                        className="mb-2"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Commodity:</span> {record.hs_code}
                    </div>
                    <div>
                      <span className="font-medium">Destination:</span> {record.unified_destination || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Value:</span> 
                      <span className="text-green-600 font-medium ml-1">
                        {formatCurrency(record.unified_value || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Carrier:</span> {record.unified_carrier || 'N/A'}
                    </div>
                  </div>

                  {/* BTS Route Intelligence */}
                  {record.bts_intelligence?.route_matches && record.bts_intelligence.route_matches.length > 0 && (
                    <div className="mt-2 text-sm">
                      <div className="flex items-center gap-2 text-purple-700">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">
                          BTS Air Routes: {record.bts_intelligence.route_matches.length} matches
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {record.bts_intelligence.route_matches.slice(0, 2).map((route, index) => (
                          <div key={index}>
                            {route.origin_airport} → {route.dest_airport} via {route.carrier} 
                            ({(route.freight_kg / 1000).toFixed(0)}K kg)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleContactCard(record.unified_company_name)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      expandedContacts.has(record.unified_company_name)
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {expandedContacts.has(record.unified_company_name) ? 'Hide' : 'Show'} Contacts
                  </button>
                  
                  <button
                    onClick={() => addToCRM(record)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add to CRM
                  </button>
                </div>
              </div>
            </div>

            {/* Company Feedback Section */}
            {record.confidence_score && (
              <div className="border-t border-gray-100 p-4 bg-gray-50">
                <CompanyFeedback
                  companyName={record.unified_company_name}
                  hsCode={record.hs_code}
                  country={record.unified_destination}
                  confidenceScore={record.confidence_score}
                  onFeedbackSubmitted={() => {
                    // Optionally refresh the search results or show confirmation
                    console.log('Feedback submitted for', record.unified_company_name);
                  }}
                />
              </div>
            )}

            {/* Expanded Contact Card and Company Trends */}
            {expandedContacts.has(record.unified_company_name) && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-6">
                <EnrichedContactCard
                  companyName={record.unified_company_name}
                  location={record.unified_destination}
                  industry={record.company_profile?.primary_industry}
                  airShipperConfidence={record.bts_intelligence?.confidence_score || record.company_profile?.air_confidence_score || 0}
                  isLikelyAirShipper={record.bts_intelligence?.is_likely_air_shipper || record.company_profile?.likely_air_shipper || false}
                  btsRouteMatches={record.bts_intelligence?.route_matches || record.company_profile?.bts_route_matches || []}
                  onStartCampaign={(contacts) => handleStartCampaign(contacts, record.unified_company_name)}
                />
                
                {/* Company Shipment Trend Chart */}
                <CompanyTrendChart 
                  companyName={record.unified_company_name}
                />
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* Data Source Information */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className={`${currentModeConfig.color}`}>
            {currentModeConfig.icon}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-1">
              Live Data Sources
            </h3>
            <p className="text-sm text-gray-600 mb-2">{currentModeConfig.description}</p>
            
            <div className="text-xs text-gray-500 space-y-1">
              <div>• <strong>BTS T-100:</strong> Live airfreight data from US Bureau of Transportation Statistics</div>
              <div>• <strong>Census Trade Data:</strong> US import/export manifests with HS code classification</div>
              <div>• <strong>Contact Enrichment:</strong> Apollo.io + PhantomBuster for verified contact details</div>
              <div>• <strong>Intelligence Matching:</strong> Smart algorithms connecting air and ocean shipping patterns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}