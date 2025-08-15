'use client';

import dynamic from 'next/dynamic';

const AutoFollowUp = dynamic(() => import('@/components/campaigns/AutoFollowUp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
});

export default function FollowUpAutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Follow-up Automation</h2>
        <p className="text-gray-600">Automate your lead follow-up sequences and campaigns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 font-bold">8</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Active Automations</h3>
              <p className="text-sm text-gray-600">Running sequences</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold">1.2K</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Emails Sent</h3>
              <p className="text-sm text-gray-600">This month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold">234</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Responses</h3>
              <p className="text-sm text-gray-600">Generated leads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Automation Workflows</h3>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Create Workflow
          </button>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Automation Coming Soon</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Advanced follow-up automation features are being developed. You'll be able to create sophisticated email sequences and lead nurturing workflows.
          </p>
        </div>
      </div>
    </div>
  )
}