export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to your Logistic Intel dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Companies Tracked</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">1,840</p>
              <p className="text-sm text-emerald-600 mt-1">+12% this month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quotes Sent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">92</p>
              <p className="text-sm text-emerald-600 mt-1">+8% this week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Cost</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">$1,200</p>
              <p className="text-sm text-emerald-600 mt-1">Per TEU</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">48.7%</p>
              <p className="text-sm text-emerald-600 mt-1">Email campaigns</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/dashboard/search" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900">Trade Intelligence Search</h4>
            <p className="text-sm text-gray-600 mt-1">Search global trade data</p>
          </a>
          <a href="/dashboard/crm" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900">CRM Contact Center</h4>
            <p className="text-sm text-gray-600 mt-1">Manage leads and outreach</p>
          </a>
          <a href="/dashboard/email" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h4 className="font-medium text-gray-900">Email Campaigns</h4>
            <p className="text-sm text-gray-600 mt-1">Launch email outreach</p>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Trade Data APIs</span>
            <span className="text-xs text-green-700 font-medium">Operational</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Email Services</span>
            <span className="text-xs text-green-700 font-medium">Connected</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">CRM Sync</span>
            <span className="text-xs text-green-700 font-medium">Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}