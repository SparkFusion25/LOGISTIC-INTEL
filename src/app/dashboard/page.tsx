'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  BarChart3, 
  Users, 
  Mail, 
  Globe,
  Package,
  Calculator,
  TrendingUp,
  MessageSquare,
  Settings,
  Bell,
  User,
  LogOut,
  Plus,
  Download,
  RefreshCw,
  Menu,
  X,
  Activity,
  CreditCard,
  Eye,
  ExternalLink
} from 'lucide-react'

interface UserData {
  name: string
  email: string
  company: string
  plan: string
  avatar?: string
}

interface Widget {
  id: string
  name: string
  description: string
  icon: any
  usage: number
  limit: number
  active: boolean
  category: string
}

interface QuickStat {
  label: string
  value: string
  icon: any
  color: string
  trend?: string
}

export default function UserDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<UserData>({
    name: 'John Smith',
    email: 'john@globaltradesolutions.com',
    company: 'Global Trade Solutions',
    plan: 'Professional'
  })

  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    { label: 'Total Searches', value: '2,847', icon: Search, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Active Contacts', value: '156', icon: Users, color: 'bg-green-500', trend: '+8%' },
    { label: 'Active Campaigns', value: '7', icon: Mail, color: 'bg-purple-500', trend: '+2' },
    { label: 'API Calls', value: '12.4K', icon: Globe, color: 'bg-orange-500', trend: '+15%' }
  ])

  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'company-search',
      name: 'Company & Trade Lookup',
      description: 'Search any company\'s global trade activity and shipment history',
      icon: Search,
      usage: 847,
      limit: 2000,
      active: true,
      category: 'Search'
    },
    {
      id: 'analytics-dashboard',
      name: 'Trade Analytics Dashboard',
      description: 'Comprehensive analytics on air freight and ocean shipment volumes',
      icon: BarChart3,
      usage: 234,
      limit: 500,
      active: true,
      category: 'Analytics'
    },
    {
      id: 'quote-generator',
      name: 'Quote Generator (Air/Ocean)',
      description: 'Generate instant quotes for air and ocean freight shipments',
      icon: Package,
      usage: 156,
      limit: 300,
      active: true,
      category: 'Quotes'
    },
    {
      id: 'tariff-calculator',
      name: 'Tariff Calculator',
      description: 'Calculate customs duties and tariffs for international shipments',
      icon: Calculator,
      usage: 89,
      limit: 200,
      active: true,
      category: 'Tools'
    },
    {
      id: 'market-benchmark',
      name: 'Market Benchmark (Load Estimator)',
      description: 'Compare rates and get market insights with Freightos integration',
      icon: TrendingUp,
      usage: 45,
      limit: 100,
      active: false,
      category: 'Analytics'
    },
    {
      id: 'campaign-builder',
      name: 'Campaign Builder',
      description: 'Create and manage multi-step outreach campaigns',
      icon: MessageSquare,
      usage: 23,
      limit: 50,
      active: true,
      category: 'CRM'
    },
    {
      id: 'crm-contacts',
      name: 'CRM Contact List',
      description: 'Manage prospects and customer relationships with email tracking',
      icon: Users,
      usage: 156,
      limit: 500,
      active: true,
      category: 'CRM'
    }
  ])

  const [recentActivity] = useState([
    { id: 1, action: 'Company search for "ACME Trading Corp"', time: '2 minutes ago', type: 'search' },
    { id: 2, action: 'Generated ocean freight quote', time: '15 minutes ago', type: 'quote' },
    { id: 3, action: 'Campaign "EU Prospects" sent to 45 contacts', time: '1 hour ago', type: 'campaign' },
    { id: 4, action: 'Added contact: Sarah Chen - Logistics Plus', time: '2 hours ago', type: 'contact' },
    { id: 5, action: 'Calculated tariff for HS Code 8471.30', time: '3 hours ago', type: 'tariff' }
  ])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: true },
    { name: 'Search', href: '/dashboard/search', icon: Search, current: false },
    { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, current: false },
    { name: 'CRM', href: '/dashboard/crm', icon: Users, current: false },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: Mail, current: false },
    { name: 'Widgets', href: '/dashboard/widgets', icon: Package, current: false }
  ]

  const handleLogout = () => {
    localStorage.removeItem('user_session')
    router.push('/login')
  }

  const openWidget = (widgetId: string) => {
    // Route to specific widget pages
    router.push(`/dashboard/widgets/${widgetId}`)
  }

  const getUsageColor = (usage: number, limit: number) => {
    const percentage = (usage / limit) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-white/10">
            <Globe className="w-8 h-8 text-white mr-3" />
            <span className="text-xl font-bold text-white">Logistic Intel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`sidebar-nav-item ${item.current ? 'active' : ''}`}
                >
                  <Icon className="sidebar-nav-icon" />
                  {item.name}
                </a>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-white/60 truncate">{user.plan} Plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Welcome back, {user.name.split(' ')[0]}!</h1>
              <p className="page-subtitle">
                Here's what's happening with your trade intelligence platform today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Search
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`stats-card-icon ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="stats-card-value">{stat.value}</div>
                    <div className="stats-card-label">{stat.label}</div>
                  </div>
                  {stat.trend && (
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">{stat.trend}</span>
                      <p className="text-xs text-gray-500">vs last month</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widgets Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Widgets</h2>
              <button className="btn-secondary">
                <Settings className="w-4 h-4 mr-2" />
                Manage Widgets
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {widgets.map((widget) => {
                const Icon = widget.icon
                const usagePercentage = (widget.usage / widget.limit) * 100
                
                return (
                  <div key={widget.id} className="widget-card">
                    <div className="widget-header">
                      <div className="widget-icon">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="widget-title">{widget.name}</h3>
                        <span className={`badge ${widget.active ? 'badge-success' : 'badge-warning'}`}>
                          {widget.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <p className="widget-description">{widget.description}</p>

                    {/* Usage Bar */}
                    <div className="mb-4">
                      <div className="usage-text">
                        <span>Monthly Usage</span>
                        <span>{widget.usage.toLocaleString()}/{widget.limit.toLocaleString()}</span>
                      </div>
                      <div className="usage-bar">
                        <div 
                          className={`usage-fill ${getUsageColor(widget.usage, widget.limit)}`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => openWidget(widget.id)}
                      className="btn-primary w-full"
                      disabled={!widget.active}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Widget
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Information */}
            <div className="stats-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                Your Plan
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Plan</span>
                  <span className="font-medium text-blue-600">{user.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Usage</span>
                  <span className="text-gray-900">2,847/5,000 searches</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing</span>
                  <span className="text-gray-900">Feb 15, 2024</span>
                </div>
                <div className="usage-bar">
                  <div className="usage-fill bg-blue-500" style={{ width: '57%' }} />
                </div>
              </div>
              <button className="btn-cta w-full mt-4">
                Upgrade Plan
              </button>
            </div>

            {/* Recent Activity */}
            <div className="stats-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  Recent Activity
                </h3>
                <button className="text-blue-600 hover:text-blue-700">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All Activity
              </button>
            </div>

            {/* Quick Actions */}
            <div className="stats-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                  <Search className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">New Company Search</span>
                </button>
                <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                  <Package className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Generate Quote</span>
                </button>
                <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Create Campaign</span>
                </button>
                <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center space-x-3 transition-colors">
                  <Calculator className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Calculate Tariff</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}