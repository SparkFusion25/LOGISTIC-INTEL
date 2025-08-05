// app/dashboard/page.tsx

import SearchPanel from '@/components/widgets/SearchPanel';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Welcome back 👋</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-600">Contacts</h2>
          <p className="text-xl font-semibold">231</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-600">Campaigns Sent</h2>
          <p className="text-xl font-semibold">12</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-sm text-gray-600">Widgets Active</h2>
          <p className="text-xl font-semibold">4</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Quick Search</h2>
        <SearchPanel compact />
      </div>
    </div>
  );
}