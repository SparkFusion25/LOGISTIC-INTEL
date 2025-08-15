'use client'

import { useState } from 'react'
import { 
  Search, Filter, Download, BookmarkPlus, TrendingUp, 
  Globe, ArrowRight, BarChart3, Users, Ship, Plane
} from 'lucide-react'
import SearchPanel from '@/components/SearchPanel'
import SearchResultsMount from '@/components/SearchResultsMount'

export default function SearchPage() {
  const [timeRange, setTimeRange] = useState('30d')

  // Search statistics - you can connect these to your actual API data
  const searchStats = [
    {
      name: 'Available Records',
      value: '50M+',
      change: '+2.1M',
      changeType: 'increase',
      icon: BarChart3,
      color: 'from-blue-400 to-blue-500'
    },
    {
      name: 'Companies',
      value: '2.4M',
      change: '+15K',
      changeType: 'increase', 
      icon: Users,
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      name: 'Ocean Shipments',
      value: '890K',
      change: '+45K',
      changeType: 'increase',
      icon: Ship,
      color: 'from-sky-400 to-sky-500'
    },
    {
      name: 'Air Cargo',
      value: '124K',
      change: '+8K',
      changeType: 'increase',
      icon: Plane,
      color: 'from-purple-400 to-purple-500'
    }
  ]

  const quickSearches = [
    { query: 'Apple suppliers', count: '1,247 results' },
    { query: 'Tesla electronics imports', count: '891 results' },
    { query: 'Electronics from China', count: '15,634 results' },
    { query: 'Automotive parts Germany', count: '2,156 results' }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trade Intelligence Search</h1>
            <p className="mt-2 text-gray-600">Discover global trade patterns and company insights from our comprehensive database.</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors">
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Save Search
            </button>
            <button className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </button>
          </div>
        </div>
      </div>

      {/* Search Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {searchStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-emerald-600 mt-1">{stat.change} this month</p>
              </div>
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar with Quick Searches */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Searches</h3>
            <div className="space-y-3">
              {quickSearches.map((search, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-sky-600 transition-colors">
                        {search.query}
                      </p>
                      <p className="text-sm text-gray-500">{search.count}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Search Tips</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Use company names for precise results</p>
                <p>• Add country codes for location filtering</p>
                <p>• Try product categories like "electronics"</p>
                <p>• Use HS codes for specific commodities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Search Area */}
        <div className="lg:col-span-3">
          {/* Enhanced Search Panel Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Search Global Trade Data</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Filter className="w-4 h-4" />
                </button>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>
            
            {/* Preserve existing SearchPanel component */}
            <SearchPanel />
          </div>

          {/* Search Results Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Search Results</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Live data from verified sources</span>
                </div>
              </div>
            </div>
            
            {/* Preserve existing search results mount point */}
            <div id="search-results" className="min-h-96">
              <SearchResultsMount />
            </div>
          </div>
        </div>
      </div>

      {/* Data Sources Info */}
      <div className="mt-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Trusted Data Sources</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">US Census Bureau</p>
              <p className="text-sm text-gray-600">Official trade statistics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Bureau of Transportation</p>
              <p className="text-sm text-gray-600">Logistics & freight data</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Commercial Databases</p>
              <p className="text-sm text-gray-600">Verified company data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}