// app/dashboard/search/page.tsx

'use client';

import dynamic from 'next/dynamic';

const SearchPanel = dynamic(() => import('@/components/user/SearchPanel'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600">Loading Trade Intelligence Search...</span>
    </div>
  )
});

export default function SearchPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600 text-lg">
          Search global trade data and shipment records to identify new business opportunities and track competitor activity.
        </p>
      </div>
      <SearchPanel />
    </div>
  );
}