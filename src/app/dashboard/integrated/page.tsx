'use client'

import dynamic from 'next/dynamic'
import EmailIntegration from '@/components/EmailIntegration'

const SearchPanelDemo = dynamic(() => import('@/components/SearchPanelDemo'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600">Loading Trade Intelligence...</span>
    </div>
  )
});

export default function IntegratedDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8 space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrated Trade Intelligence Dashboard</h1>
            <p className="text-gray-600">Search global trade data and manage your outreach campaigns</p>
          </div>

          {/* Main Components */}
          <SearchPanelDemo />
          <EmailIntegration />
        </div>
      </div>
    </div>
  )
}