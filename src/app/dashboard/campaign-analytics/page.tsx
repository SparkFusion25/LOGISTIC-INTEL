import { BarChart3, TrendingUp, Users, Mail, Target, ArrowUpRight } from 'lucide-react'

export default function CampaignAnalyticsPage() {
  const stats = [
    { name: 'Total Campaigns', value: '24', change: '+12%', icon: Target },
    { name: 'Open Rate', value: '34.2%', change: '+5.1%', icon: Mail },
    { name: 'Click Rate', value: '8.7%', change: '+2.3%', icon: ArrowUpRight },
    { name: 'Conversions', value: '156', change: '+18%', icon: Users },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
        <p className="text-gray-600">Track and analyze your email campaign performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-emerald-600 mt-1">{stat.change} vs last month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Analytics Coming Soon</h2>
        <p className="text-gray-600">Advanced campaign analytics and reporting features will be available soon.</p>
      </div>
    </div>
  )
}