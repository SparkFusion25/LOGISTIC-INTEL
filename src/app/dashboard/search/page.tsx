import SearchPanel from '@/components/SearchPanel'
import SearchResultsMount from '@/components/SearchResultsMount'
import { Search, TrendingUp, Globe, BarChart3, Users, Ship, Plane } from 'lucide-react'

export default function SearchPage() {
  // Search statistics - these can be connected to your actual API data
  const searchStats = [
    {
      name: 'Available Records',
      value: '50M+',
      change: '+2.1M',
      icon: BarChart3,
      color: 'from-blue-400 to-blue-500'
    },
    {
      name: 'Companies',
      value: '2.4M',
      change: '+15K',
      icon: Users,
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      name: 'Ocean Shipments',
      value: '890K',
      change: '+45K',
      icon: Ship,
      color: 'from-sky-400 to-sky-500'
    },
    {
      name: 'Air Cargo',
      value: '124K',
      change: '+8K',
      icon: Plane,
      color: 'from-purple-400 to-purple-500'
    }
  ]

  return (
    <div className="min-h-full">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 -mx-6 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trade Intelligence Search</h1>
              <p className="mt-2 text-gray-600">Discover global trade patterns and company insights from our comprehensive database.</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Statistics */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto">
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

          {/* Main Search Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Search Global Trade Data</h2>
                  <p className="text-sm text-gray-600 mt-1">Access 50M+ verified trade records from 200+ countries</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Live data from verified sources</span>
                </div>
              </div>
            </div>
            
            {/* Preserve existing SearchPanel functionality */}
            <div className="p-0">
              <SearchPanel />
            </div>
          </div>

          {/* Search Results Container */}
          <div id="search-results" className="mt-6">
            <SearchResultsMount />
          </div>
        </div>
      </div>

      {/* Data Sources Info */}
      <div className="-mx-6 py-8 bg-white border-t border-gray-200 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Trusted Data Sources</h3>
          <div className="grid md:grid-cols-3 gap-6">
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
    </div>
  )
}