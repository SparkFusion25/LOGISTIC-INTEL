'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, Filter, Download, MapPin, Ship, Plane, Building, AlertCircle, CheckCircle } from 'lucide-react'
import { CompanySummaryCard } from '../search/CompanySummaryCard'

interface SearchFilters {
  company?: string
  originCountry?: string
  destinationCountry?: string
  destinationCity?: string
  commodity?: string
  hsCode?: string
  startDate?: string
  endDate?: string
  mode?: 'all' | 'ocean' | 'air'
}

interface ShipmentDetail {
  bol_number: string | null;
  arrival_date: string;
  containers: string | null;
  vessel_name: string | null;
  weight_kg: number;
  value_usd: number;
  shipper_name: string | null;
  port_of_lading: string | null;
  port_of_discharge: string | null;
  goods_description: string | null;
  departure_date: string | null;
  hs_code: string | null;
  unified_id: string;
}

interface GroupedCompanyData {
  company_name: string;
  shipment_mode: 'ocean' | 'air' | 'mixed';
  total_shipments: number;
  total_weight_kg: number;
  total_value_usd: number;
  first_arrival: string;
  last_arrival: string;
  confidence_score: number;
  shipments: ShipmentDetail[];
}

interface SearchResponse {
  success: boolean;
  message: string;
  data: GroupedCompanyData[];
  total_companies: number;
  total_shipments: number;
  search_filters: any;
  note?: string;
}

export default function SearchPanel() {
  const [filters, setFilters] = useState<SearchFilters>({
    company: '',
    originCountry: '',
    destinationCountry: '',
    destinationCity: '',
    commodity: '',
    hsCode: '',
    startDate: '',
    endDate: '',
    mode: 'all'
  })
  
  const [companies, setCompanies] = useState<GroupedCompanyData[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingToCRM, setAddingToCRM] = useState<string | null>(null)
  const [countries, setCountries] = useState<string[]>([])
  
  const supabase = createClientComponentClient()

  // Load countries for dropdown
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/search/countries')
        const data = await response.json()
        if (data.success) {
          setCountries(data.countries || [])
        }
      } catch (error) {
        console.error('Failed to load countries:', error)
        // Fallback list
        setCountries(['China', 'United States', 'Germany', 'India', 'Vietnam', 'Turkey', 'South Korea', 'Japan'])
      }
    }
    loadCountries()
  }, [])

  const handleSearch = async () => {
    if (!hasSearched && !filters.company && !filters.originCountry && !filters.commodity) {
      setError('Please enter at least one search criteria')
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const searchParams = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) {
          searchParams.append(key, value.trim())
        }
      })

      console.log('Searching with filters:', filters)

      const response = await fetch(`/api/search/unified?${searchParams.toString()}`)
      const data: SearchResponse = await response.json()

      if (data.success) {
        setCompanies(data.data || [])
        console.log(`Found ${data.total_companies} companies with ${data.total_shipments} shipments`)
      } else {
        setError(data.message || 'Search failed')
        setCompanies([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setError('Failed to search. Please try again.')
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCRM = async (company: GroupedCompanyData) => {
    setAddingToCRM(company.company_name)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please sign in to add companies to CRM')
        return
      }

      const crmData = {
        company_name: company.company_name,
        total_shipments: company.total_shipments,
        total_weight_kg: company.total_weight_kg,
        total_value_usd: company.total_value_usd,
        shipment_mode: company.shipment_mode,
        confidence_score: company.confidence_score,
        source: 'Trade Search',
        added_by_user: user.id
      }

      console.log('Adding to CRM:', crmData)

      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crmData)
      })

      const result = await response.json()

      if (result.success) {
        // Show success message
        alert(`${company.company_name} added to CRM successfully!`)
      } else {
        if (result.error?.includes('already exists')) {
          alert(`${company.company_name} is already in your CRM`)
        } else {
          setError(result.error || 'Failed to add to CRM')
        }
      }
    } catch (error) {
      console.error('Add to CRM error:', error)
      setError('Failed to add to CRM. Please try again.')
    } finally {
      setAddingToCRM(null)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      company: '',
      originCountry: '',
      destinationCountry: '',
      destinationCity: '',
      commodity: '',
      hsCode: '',
      startDate: '',
      endDate: '',
      mode: 'all'
    })
    setCompanies([])
    setHasSearched(false)
    setError(null)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trade Intelligence Search</h1>
        <p className="text-gray-600">
          Search global trade data to discover companies, shipment patterns, and market opportunities.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Company Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={filters.company || ''}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              placeholder="Search companies..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Origin Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Origin Country
            </label>
            <select
              value={filters.originCountry || ''}
              onChange={(e) => handleFilterChange('originCountry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Shipment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipment Mode
            </label>
            <select
              value={filters.mode || 'all'}
              onChange={(e) => handleFilterChange('mode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Modes</option>
              <option value="ocean">🚢 Ocean</option>
              <option value="air">✈️ Air</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Country
              </label>
              <select
                value={filters.destinationCountry || ''}
                onChange={(e) => handleFilterChange('destinationCountry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commodity
              </label>
              <input
                type="text"
                value={filters.commodity || ''}
                onChange={(e) => handleFilterChange('commodity', e.target.value)}
                placeholder="e.g., Electronics, Textiles"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HS Code
              </label>
              <input
                type="text"
                value={filters.hsCode || ''}
                onChange={(e) => handleFilterChange('hsCode', e.target.value)}
                placeholder="e.g., 8471, 6204"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Search Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Welcome Message - Before Search */}
      {!hasSearched && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            Global Trade Intelligence Search
          </h2>
          <p className="text-blue-700 mb-4">
            Search and analyze global trade data to discover new business opportunities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-600">
            <div className="flex items-center justify-center gap-2">
              <Ship className="w-4 h-4" />
              Ocean & Air Shipments
            </div>
            <div className="flex items-center justify-center gap-2">
              <Building className="w-4 h-4" />
              Company Intelligence
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              Trade Trends
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {hasSearched && companies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({companies.length} companies found)
            </h2>
            <button
              onClick={() => console.log('Export functionality')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="space-y-4">
            {companies.map((company, index) => (
              <CompanySummaryCard
                key={`${company.company_name}-${index}`}
                company={company}
                onAddToCRM={handleAddToCRM}
                isAddingToCRM={addingToCRM === company.company_name}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {hasSearched && companies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or broadening your filters.
          </p>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}