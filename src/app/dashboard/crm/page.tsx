// app/dashboard/crm/page.tsx

'use client';

import dynamic from 'next/dynamic';

const CRMPanel = dynamic(() => import('@/components/dashboard/CRMPanel'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600">Loading CRM Contact Center...</span>
    </div>
  )
});

export default function CRMPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600 text-lg">
          Manage your logistics contacts, track outreach campaigns, and monitor lead progression through your sales pipeline.
        </p>
      </div>
      <CRMPanel />
    </div>
  );
}