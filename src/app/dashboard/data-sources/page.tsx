import { Database, Globe, Activity, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function DataSourcesPage() {
  const dataSources = [
    { name: 'US Census Bureau', status: 'active', records: '45M+', lastSync: '2 hours ago', health: 'healthy' },
    { name: 'Bureau of Transportation', status: 'active', records: '12M+', lastSync: '4 hours ago', health: 'healthy' },
    { name: 'Commercial Trade DB', status: 'syncing', records: '8M+', lastSync: 'Syncing...', health: 'syncing' },
    { name: 'Port Authority Data', status: 'active', records: '3M+', lastSync: '1 hour ago', health: 'healthy' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
        <p className="text-gray-600">Manage and monitor your trade data integrations</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Active Sources</h3>
              <p className="text-2xl font-bold text-gray-900">4</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Records</h3>
              <p className="text-2xl font-bold text-gray-900">68M+</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sync Status</h3>
              <p className="text-sm font-bold text-emerald-600">All Active</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Last Update</h3>
              <p className="text-sm font-bold text-gray-900">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Connected Data Sources</h2>
            <button className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors">
              Add Data Source
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {dataSources.map((source, index) => (
            <div key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    source.health === 'healthy' ? 'bg-emerald-500' : 
                    source.health === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{source.name}</h3>
                    <p className="text-sm text-gray-600">{source.records} records • Last sync: {source.lastSync}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    source.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    source.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {source.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}