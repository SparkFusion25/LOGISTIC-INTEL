import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'increase' | 'decrease'
  icon: LucideIcon
  color: string
  trend?: 'up' | 'down' | 'stable'
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon: Icon, 
  color,
  trend = 'up' 
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center">
              {trend === 'up' && (
                <svg className="w-4 h-4 text-emerald-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )}
              {trend === 'down' && (
                <svg className="w-4 h-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}