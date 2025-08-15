'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, Search, Users, Settings, Bell, Grid3x3, 
  ChevronDown, Menu, X, User, LogOut, HelpCircle,
  Database, BarChart3, FileText, Mail, Calendar,
  Send, TrendingUp, Zap, Target, Globe
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Search Intelligence', href: '/dashboard/search', icon: Search },
    { name: 'CRM', href: '/dashboard/crm', icon: Users },
    { name: 'Email Campaigns', href: '/dashboard/email', icon: Mail },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Campaign Analytics', href: '/dashboard/campaign-analytics', icon: TrendingUp },
    { name: 'Follow-up Automation', href: '/dashboard/automation', icon: Zap },
    { name: 'Data Sources', href: '/dashboard/data-sources', icon: Database },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const quickActions = [
    { name: 'New Search', href: '/dashboard/search/new', icon: Search },
    { name: 'Add Contact', href: '/dashboard/crm/contacts/new', icon: Users },
    { name: 'Create Campaign', href: '/dashboard/email/new', icon: Mail },
    { name: 'Schedule Report', href: '/dashboard/reports/schedule', icon: Calendar },
  ]

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <div className="flex items-center justify-between h-20 px-6 border-b border-blue-800/50">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Logistic Intel</span>
              <p className="text-xs text-blue-200">Trade Intelligence Platform</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-blue-300 hover:text-white hover:bg-blue-800/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-b border-blue-800/50">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Dashboard Overview</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-800/30 rounded-lg p-3">
              <p className="text-xs text-blue-200">Active Searches</p>
              <p className="text-lg font-bold text-white">247</p>
            </div>
            <div className="bg-blue-800/30 rounded-lg p-3">
              <p className="text-xs text-blue-200">New Leads</p>
              <p className="text-lg font-bold text-white">1.2K</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-4">Navigation</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-blue-200 hover:bg-blue-800/30 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  isActive ? 'text-white' : 'text-blue-300 group-hover:text-blue-100'
                }`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="border-t border-blue-800/50 p-6">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-4">Quick Actions</p>
          <div className="space-y-2">
            {quickActions.slice(0, 2).map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-800/30 rounded-lg transition-colors group"
              >
                <action.icon className="w-4 h-4 mr-3 text-blue-300 group-hover:text-blue-100" />
                {action.name}
              </Link>
            ))}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="border-t border-blue-800/50 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-blue-300">Premium Plan</p>
            </div>
            <button className="p-1 text-blue-300 hover:text-white">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

        {/* Main content */}
        <div className="flex-1 min-h-screen overflow-x-hidden">
          {/* Top navigation */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {navigation.find(item => pathname === item.href || pathname.startsWith(item.href + '/'))?.name || 'Dashboard'}
                    </h1>
                    <p className="text-sm text-gray-500">Welcome back to Logistic Intel</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    JD
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">John Doe</p>
                    <p className="text-xs text-gray-500">john@company.com</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Preferences
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href="/about"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </Link>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

          {/* Page content */}
          <main className="flex-1 min-h-[calc(100vh-4rem)] p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}