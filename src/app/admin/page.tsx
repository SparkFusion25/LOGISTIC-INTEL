'use client'

import { useState } from 'react'
import { 
  Users, Database, Activity, AlertTriangle, TrendingUp, TrendingDown,
  Server, Globe, CreditCard, FileText, RefreshCw, Download, Eye,
  UserCheck, UserX, DollarSign, Clock, ArrowRight, MoreVertical
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const systemStats = [
    {
      name: 'Total Users',
      value: '1,247',
      change: '+12.5%',
      changeType: 'increase',
      icon: Users,
      color: 'from-blue-400 to-blue-500'
    },
    {
      name: 'Active Sessions',
      value: '847',
      change: '+8.2%',
      changeType: 'increase',
      icon: Activity,
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      name: 'System Load',
      value: '68%',
      change: '-2.1%',
      changeType: 'decrease',
      icon: Server,
      color: 'from-orange-400 to-orange-500'
    },
    {
      name: 'Revenue (MTD)',
      value: '$124,847',
      change: '+15.7%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-purple-400 to-purple-500'
    }
  ]

  const recentUsers = [
    { name: 'Sarah Chen', email: 'sarah@globallogistics.com', plan: 'Enterprise', status: 'active', joined: '2 hours ago' },
    { name: 'Marcus Rodriguez', email: 'marcus@techflow.com', plan: 'Pro', status: 'active', joined: '4 hours ago' },
    { name: 'Emily Watson', email: 'emily@europeanports.com', plan: 'Enterprise', status: 'pending', joined: '1 day ago' },
    { name: 'David Kim', email: 'david@aptrading.com', plan: 'Basic', status: 'active', joined: '2 days ago' },
    { name: 'Lisa Thompson', email: 'lisa@mfgplus.com', plan: 'Pro', status: 'active', joined: '3 days ago' },
  ]

  const systemAlerts = [
    { type: 'warning', message: 'High API usage detected on US-East servers', time: '5 min ago', severity: 'medium' },
    { type: 'info', message: 'Scheduled maintenance completed successfully', time: '2 hours ago', severity: 'low' },
    { type: 'error', message: 'Data sync failed for Census Bureau integration', time: '4 hours ago', severity: 'high' },
    { type: 'success', message: 'New backup completed (2.4TB)', time: '6 hours ago', severity: 'low' },
  ]

  const topPlans = [
    { name: 'Enterprise', users: 523, revenue: '$78,450', growth: '+18.2%' },
    { name: 'Pro', users: 724, revenue: '$43,400', growth: '+12.5%' },
    { name: 'Basic', users: 147, revenue: '$2,940', growth: '+8.1%' },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'success': return <Activity className="w-5 h-5 text-emerald-500" />
      default: return <Activity className="w-5 h-5 text-blue-500" />
    }
  }

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'success': return 'bg-emerald-50 border-emerald-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
            <p className="mt-2 text-gray-600">Monitor system performance and user activity</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* System Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">System Alerts</h2>
              <button className="text-sky-600 hover:text-sky-700 font-semibold text-sm">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getAlertBg(alert.type)}`}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Plan Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Revenue by subscription tier</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topPlans.map((plan, index) => (
                <div key={plan.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{plan.name}</p>
                    <p className="text-sm text-gray-500">{plan.users} users</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{plan.revenue}</p>
                    <p className="text-sm text-emerald-600">{plan.growth}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-sky-600 hover:text-sky-700 font-semibold flex items-center mx-auto">
                View Billing Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent User Activity</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                    user.plan === 'Pro' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.plan}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status}
                  </span>
                  <span className="text-sm text-gray-500">{user.joined}</span>
                  <button className="p-2 text-gray-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-sky-600 hover:text-sky-700 font-semibold flex items-center mx-auto">
              View All Users
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600">View and edit users</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Data Sources</p>
                <p className="text-sm text-gray-600">Manage integrations</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Generate Report</p>
                <p className="text-sm text-gray-600">System analytics</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </button>

          <button className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Billing</p>
                <p className="text-sm text-gray-600">Revenue & plans</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  )
}