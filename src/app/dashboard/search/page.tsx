'use client'

import { useState } from 'react'
import { Search, Filter, Download, MapPin, Ship, Package, Building, Plus, Mail, Linkedin, Phone } from 'lucide-react'

interface SearchFilters {
  company: string
  city: string
  country: string
  hsCode: string
  mode: 'all' | 'air' | 'ocean' | 'truck'
  source: 'all' | 'us_census' | 'comtrade' | 'freightos' | 'cbp'
}

interface TradeResult {
  id: string
  company: string
  tradeStats: {
    totalVolume: string
    totalValue: string
    avgShipmentSize: string
    frequency: string
  }
  mode: string[]
  contact: {
    name?: string
    email?: string
    phone?: string
    linkedin?: string
    position?: string
  }
  routes: Array<{
    origin: string
    destination: string
    volume: string
    lastShipment: string
  }>
  hsCode: string
  country: string
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    company: '',
    city: '',
    country: '',
    hsCode: '',
    mode: 'all',
    source: 'all'
  })
  
  const [results, setResults] = useState<TradeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Mock comprehensive trade data
  const mockResults: TradeResult[] = [
    {
      id: '1',
      company: 'Global Electronics Trading Corp',
      tradeStats: {
        totalVolume: '15,450 TEU',
        totalValue: '$45.2M',
        avgShipmentSize: '125 TEU',
        frequency: '3x/week'
      },
      mode: ['Ocean', 'Air'],
      contact: {
        name: 'Sarah Chen',
        email: 'sarah.chen@getc.com',
        phone: '+1-555-0123',
        linkedin: 'https://linkedin.com/in/sarahchen',
        position: 'VP of Logistics'
      },
      routes: [
        { origin: 'Shanghai, China', destination: 'Los Angeles, USA', volume: '8,200 TEU', lastShipment: '2024-01-15' },
        { origin: 'Shenzhen, China', destination: 'Long Beach, USA', volume: '4,100 TEU', lastShipment: '2024-01-12' },
        { origin: 'Hong Kong', destination: 'Oakland, USA', volume: '3,150 TEU', lastShipment: '2024-01-10' }
      ],
      hsCode: '8471.30.01',
      country: 'China'
    },
    {
      id: '2',
      company: 'European Auto Parts Ltd',
      tradeStats: {
        totalVolume: '8,900 TEU',
        totalValue: '$28.7M',
        avgShipmentSize: '89 TEU',
        frequency: '2x/week'
      },
      mode: ['Ocean', 'Truck'],
      contact: {
        name: 'Michael Rodriguez',
        email: 'm.rodriguez@eaparts.eu',
        phone: '+49-89-123456',
        linkedin: 'https://linkedin.com/in/mrodriguez',
        position: 'Operations Director'
      },
      routes: [
        { origin: 'Hamburg, Germany', destination: 'New York, USA', volume: '5,200 TEU', lastShipment: '2024-01-14' },
        { origin: 'Rotterdam, Netherlands', destination: 'Baltimore, USA', volume: '3,700 TEU', lastShipment: '2024-01-11' }
      ],
      hsCode: '8708.29.50',
      country: 'Germany'
    },
    {
      id: '3',
      company: 'Pacific Textiles Manufacturing',
      tradeStats: {
        totalVolume: '12,300 TEU',
        totalValue: '$19.8M',
        avgShipmentSize: '156 TEU',
        frequency: '4x/week'
      },
      mode: ['Ocean'],
      contact: {
        name: 'Jennifer Kim',
        email: 'j.kim@pactextiles.com',
        phone: '+82-2-123456',
        position: 'Export Manager'
      },
      routes: [
        { origin: 'Busan, South Korea', destination: 'Long Beach, USA', volume: '7,800 TEU', lastShipment: '2024-01-16' },
        { origin: 'Incheon, South Korea', destination: 'Tacoma, USA', volume: '4,500 TEU', lastShipment: '2024-01-13' }
      ],
      hsCode: '6109.10.00',
      country: 'South Korea'
    }
  ]

  const handleSearch = async () => {
    setLoading(true)
    // Simulate API call with comprehensive filtering
    setTimeout(() => {
      let filteredResults = mockResults

      if (filters.company) {
        filteredResults = filteredResults.filter(result => 
          result.company.toLowerCase().includes(filters.company.toLowerCase())
        )
      }

      if (filters.city) {
        filteredResults = filteredResults.filter(result => 
          result.routes.some(route => 
            route.origin.toLowerCase().includes(filters.city.toLowerCase()) ||
            route.destination.toLowerCase().includes(filters.city.toLowerCase())
          )
        )
      }

      if (filters.country) {
        filteredResults = filteredResults.filter(result => 
          result.country.toLowerCase().includes(filters.country.toLowerCase())
        )
      }

      if (filters.hsCode) {
        filteredResults = filteredResults.filter(result => 
          result.hsCode.includes(filters.hsCode)
        )
      }

      if (filters.mode !== 'all') {
        filteredResults = filteredResults.filter(result => 
          result.mode.some(mode => mode.toLowerCase() === filters.mode)
        )
      }

      setResults(filteredResults)
      setLoading(false)
    }, 1500)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const addToCRM = (result: TradeResult) => {
    // Add contact to CRM
    console.log('Adding to CRM:', result.contact)
    // This would integrate with your CRM service
    alert(`Added ${result.contact.name || result.company} to CRM!`)
  }

  const addToCampaign = (result: TradeResult) => {
    // Add to campaign
    console.log('Adding to campaign:', result.contact)
    alert(`Added ${result.contact.name || result.company} to campaign!`)
  }

  const exportResults = () => {
    const csvContent = [
      ['Company', 'Contact', 'Email', 'Phone', 'Total Volume', 'Total Value', 'Mode', 'HS Code', 'Country'],
      ...results.map(r => [
        r.company,
        r.contact.name || '',
        r.contact.email || '',
        r.contact.phone || '',
        r.tradeStats.totalVolume,
        r.tradeStats.totalValue,
        r.mode.join(', '),
        r.hsCode,
        r.country
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trade_search_results.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Trade Search</h1>
              <p className="text-gray-600">Search companies by trade activity, shipment history, and market intelligence</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
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
          </div>

          {/* Search Bar */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by company name..."
                className="form-input w-full"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shanghai"
                  className="form-input"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  placeholder="e.g. China"
                  className="form-input"
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
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
                  Mode
                </label>
                <select
                  className="form-input"
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                >
                  <option value="all">All Modes</option>
                  <option value="ocean">Ocean</option>
                  <option value="air">Air</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                <select
                  className="form-input"
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="us_census">US Census</option>
                  <option value="comtrade">Comtrade</option>
                  <option value="freightos">Freightos</option>
                  <option value="cbp">CBP</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {results.map((result) => (
                <div key={result.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{result.company}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="badge bg-blue-100 text-blue-800">{result.hsCode}</span>
                        <span>{result.country}</span>
                        <span>{result.mode.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => addToCRM(result)}
                        className="btn-secondary"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to CRM
                      </button>
                      <button
                        onClick={() => addToCampaign(result)}
                        className="btn-primary"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Add to Campaign
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trade Statistics */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Trade Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Volume:</span>
                          <span className="font-medium">{result.tradeStats.totalVolume}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-medium text-green-600">{result.tradeStats.totalValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Shipment:</span>
                          <span className="font-medium">{result.tradeStats.avgShipmentSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Frequency:</span>
                          <span className="font-medium">{result.tradeStats.frequency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                      {result.contact.name ? (
                        <div className="space-y-2">
                          <div className="font-medium">{result.contact.name}</div>
                          <div className="text-sm text-gray-600">{result.contact.position}</div>
                          <div className="flex items-center space-x-3">
                            {result.contact.email && (
                              <a href={`mailto:${result.contact.email}`} className="text-blue-600 hover:text-blue-800">
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            {result.contact.phone && (
                              <a href={`tel:${result.contact.phone}`} className="text-green-600 hover:text-green-800">
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                            {result.contact.linkedin && (
                              <a href={result.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            <div>{result.contact.email}</div>
                            <div>{result.contact.phone}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Contact information not available
                          <button className="block mt-2 text-blue-600 hover:text-blue-800">
                            Find with PhantomBuster
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Top Routes */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Top Trade Routes</h4>
                      <div className="space-y-2">
                        {result.routes.slice(0, 3).map((route, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-gray-900">
                              {route.origin} → {route.destination}
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>{route.volume}</span>
                              <span>{route.lastShipment}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}