// app/dashboard/search/page.tsx

'use client';
import SearchPanel from '@/components/widgets/SearchPanel';

export default function SearchPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Full Market Intelligence Search</h1>
      <SearchPanel />
    </div>
  );
}