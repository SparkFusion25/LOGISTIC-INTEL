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

export default function FollowUpsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Follow-Up Automation</h1>
          <p className="text-gray-600 mt-2">
            Create and manage automated follow-up sequences with AI-powered smart timing
          </p>
        </div>

        {/* Auto Follow-Up Component */}
        <AutoFollowUp className="w-full" />
      </div>
    </div>
  );
}