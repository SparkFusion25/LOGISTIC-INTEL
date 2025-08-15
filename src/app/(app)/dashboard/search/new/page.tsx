import SearchPanel from '@/components/SearchPanel'
import { Search, ArrowLeft, Bookmark, Download, Share } from 'lucide-react'
import Link from 'next/link'

export default function NewSearchPage() {
  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard/search" 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Trade Search</h1>
                <p className="text-gray-600">Create a new search to discover trade patterns and company insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Bookmark className="w-4 h-4 mr-2" />
                Save Search
              </button>
              <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Search Configuration</h2>
                  <p className="text-sm text-gray-600">Configure your search parameters to find relevant trade data</p>
                </div>
              </div>
            </div>
            
            {/* Search Panel */}
            <SearchPanel />
          </div>
        </div>
      </div>

      {/* Search Tips */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Search Tips</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Company Search</h4>
                <p className="text-sm text-gray-600">Use exact company names for precise results. Try variations like "Apple Inc" or "Apple Computer"</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Location Filtering</h4>
                <p className="text-sm text-gray-600">Use port codes, city names, or country codes for origin and destination filters</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Transport Modes</h4>
                <p className="text-sm text-gray-600">Filter by Ocean freight for bulk shipments or Air cargo for time-sensitive goods</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}