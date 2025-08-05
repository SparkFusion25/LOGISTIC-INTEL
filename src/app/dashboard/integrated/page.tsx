'use client'

import SearchPanel from '@/components/SearchPanel'
import EmailIntegration from '@/components/EmailIntegration'

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
          <SearchPanel />
          <EmailIntegration />
        </div>
      </div>
    </div>
  )
}