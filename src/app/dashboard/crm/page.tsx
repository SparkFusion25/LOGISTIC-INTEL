// app/dashboard/crm/page.tsx

'use client'

import { useState } from 'react'
import { 
  Users, Plus, Search, Filter, MoreVertical, Mail, Phone, 
  Building2, MapPin, Calendar, Star, Tag, Eye, Edit3,
  UserPlus, Download, RefreshCw, ArrowUpRight, TrendingUp
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Preserve existing CRMPanel with dynamic loading
const CRMPanel = dynamic(() => import('@/components/dashboard/CRMPanel'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      <span className="ml-3 text-gray-600">Loading CRM Contact Center...</span>
    </div>
  )
})

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState('contacts')
  const [viewMode, setViewMode] = useState('grid')

  // CRM statistics - you can connect these to your actual API data
  const stats = [
    { name: 'Total Contacts', value: '1,247', change: '+12.5%', icon: Users, color: 'from-blue-400 to-blue-500' },
    { name: 'Active Deals', value: '89', change: '+8.2%', icon: Star, color: 'from-emerald-400 to-emerald-500' },
    { name: 'This Month Revenue', value: '$2.4M', change: '+15.7%', icon: ArrowUpRight, color: 'from-purple-400 to-purple-500' },
    { name: 'Conversion Rate', value: '23.8%', change: '+3.1%', icon: Tag, color: 'from-orange-400 to-orange-500' },
  ]

  const quickActions = [
    { name: 'Add Contact', icon: UserPlus, color: 'bg-blue-500' },
    { name: 'Import Leads', icon: Upload, color: 'bg-emerald-500' },
    { name: 'Send Campaign', icon: Mail, color: 'bg-purple-500' },
    { name: 'Generate Report', icon: Download, color: 'bg-orange-500' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your logistics contacts, track outreach campaigns, and monitor lead progression through your sales pipeline.</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-emerald-600 mt-1">{stat.change} vs last month</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-100 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.name}
              className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                  {action.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced CRM Panel Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Contact Management</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Real-time CRM data</span>
            </div>
          </div>
        </div>
        
        {/* Preserve existing CRMPanel functionality */}
        <div className="p-6">
          <CRMPanel />
        </div>
      </div>

      {/* CRM Features Info */}
      <div className="mt-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">CRM Features</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Contact Management</p>
              <p className="text-sm text-gray-600">Organize and track all leads</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Campaigns</p>
              <p className="text-sm text-gray-600">Automated outreach tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Pipeline Management</p>
              <p className="text-sm text-gray-600">Track deal progression</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}