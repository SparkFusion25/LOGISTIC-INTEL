// app/dashboard/search/page.tsx

'use client';

import dynamic from 'next/dynamic';

const SearchPanelDemo = dynamic(() => import('@/components/SearchPanelDemo'), { 
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
    <div className="min-h-screen">
      <SearchPanelDemo />
    </div>
  );
}