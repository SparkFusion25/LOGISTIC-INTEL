'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Users, Search, Globe, Ship, 
  Plane, BarChart3, ArrowRight, Eye, Download, RefreshCw,
  Calendar, Filter, MoreVertical, Mail, Package, Target,
  Zap, Clock, CheckCircle, DollarSign
} from 'lucide-react'
import Link from 'next/link'
import TradeNewsFeed from '@/components/dashboard/TradeNewsFeed'
import ResponsiveCard from '@/components/ui/ResponsiveCard'
import dynamic from 'next/dynamic'

const BenchmarkWidget = dynamic(() => import('@/components/BenchmarkWidget'), { ssr: false })

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7d')

  // Preserve your existing stats structure but with enhanced presentation
  const stats = [
    {
      name: 'Companies Tracked',
      value: '1,840',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'from-blue-400 to-blue-500',
      description: 'Active trade partners'
    },
    {
      name: 'Recent Quotes Sent',
      value: '92',
      change: '+8%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'from-emerald-400 to-emerald-500',
      description: 'This week'
    },
    {
      name: 'Avg Benchmark Cost',
      value: '$1,200',
      change: '-3%',
      changeType: 'decrease',
      icon: BarChart3,
      color: 'from-sky-400 to-sky-500',
      description: 'Per TEU'
    },
    {
      name: 'Email Open Rate',
      value: '48.7%',
      change: '+15%',
      changeType: 'increase',
      icon: Mail,
      color: 'from-purple-400 to-purple-500',
      description: 'Campaign performance'
    }
  ]

  // Preserve your existing quick actions with enhanced styling
  const quickActions = [
    {
      title: 'Trade Intelligence Search',
      description: 'Search global trade data and shipment records',
      icon: Search,
      href: '/dashboard/search',
      color: 'from-sky-400 to-blue-500'
    },
    {
      title: 'CRM Contact Center',
      description: 'Manage leads and track outreach progress',
      icon: Users,
      href: '/dashboard/crm',
      color: 'from-emerald-400 to-emerald-500'
    },
    {
      title: 'Email Outreach Hub',
      description: 'Launch intelligence-driven email campaigns',
      icon: Mail,
      href: '/dashboard/email',
      color: 'from-purple-400 to-purple-500'
    },
    {
      title: 'Quote Generator',
      description: 'Create professional shipping quotes',
      icon: Package,
      href: '/dashboard/widgets/quote',
      color: 'from-orange-400 to-orange-500'
    }
  ]

  // Preserve your existing recent activity structure
  const recentActivity = [
    { 
      action: 'Email opened by Sarah Chen (Apple Inc.)', 
      time: '2 minutes ago', 
      type: 'email',
      icon: Mail,
      color: 'text-green-600'
    },
    { 
      action: 'New lead added: Tesla Motors - Michael Zhang', 
      time: '15 minutes ago', 
      type: 'crm',
      icon: Users,
      color: 'text-blue-600'
    },
    { 
      action: 'Quote generated for Amazon logistics', 
      time: '1 hour ago', 
      type: 'quote',
      icon: Package,
      color: 'text-orange-600'
    },
    { 
      action: 'Trade search: Electronics from Vietnam', 
      time: '2 hours ago', 
      type: 'search',
      icon: Search,
      color: 'text-indigo-600'
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header with existing welcome message */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Valesco! 👋</h1>
            <p className="mt-2 text-gray-600">Your trade intelligence platform is ready. Here's what's happening with your logistics operations.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
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

      {/* Enhanced Stats Grid using existing data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
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
        {/* Enhanced Recent Activity with existing data */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="text-sky-600 hover:text-sky-700 font-semibold flex items-center mx-auto">
                View All Activity
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Platform Status with existing data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Platform Status</h2>
            <p className="text-sm text-gray-600 mt-1">System health overview</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Trade Data APIs</span>
                </div>
                <span className="text-xs text-emerald-700 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Email Services</span>
                </div>
                <span className="text-xs text-emerald-700 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">CRM Sync</span>
                </div>
                <span className="text-xs text-emerald-700 font-medium">Live</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Market Data</span>
                </div>
                <span className="text-xs text-yellow-700 font-medium">Updating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preserve existing Widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <BenchmarkWidget />
        {/* Render other widgets here if available */}
      </div>

      {/* Enhanced Quick Actions with existing functionality */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Preserve existing Global Trade News Feed */}
      <TradeNewsFeed />
    </div>
  )
}