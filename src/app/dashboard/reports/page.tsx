import { FileText, Download, Calendar, Filter, BarChart3, TrendingUp, Users, Globe } from 'lucide-react'

export default function ReportsPage() {
  const recentReports = [
    { name: 'Trade Volume Analysis', type: 'PDF', date: '2 hours ago', size: '2.4 MB' },
    { name: 'Monthly CRM Summary', type: 'Excel', date: '1 day ago', size: '1.8 MB' },
    { name: 'Lead Generation Report', type: 'PDF', date: '3 days ago', size: '3.1 MB' },
    { name: 'Email Campaign Performance', type: 'PDF', date: '1 week ago', size: '892 KB' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and download comprehensive business reports</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Reports</h3>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Downloads</h3>
              <p className="text-2xl font-bold text-gray-900">234</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scheduled</h3>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data Sources</h3>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Report Generation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Reports</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Trade Analytics</span>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">CRM Summary</span>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Market Intelligence</span>
              </div>
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Custom Report Builder */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Custom Report Builder</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none">
                <option>Trade Volume Analysis</option>
                <option>Lead Generation Report</option>
                <option>Campaign Performance</option>
                <option>Custom Query</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last 6 months</option>
                  <option>Custom range</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-sky-600 text-white py-2 rounded-lg hover:bg-sky-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
            <button className="flex items-center space-x-2 text-sky-600 hover:text-sky-700">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports.map((report, index) => (
            <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.type} • {report.size} • {report.date}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-sky-600 rounded-lg hover:bg-sky-50">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}