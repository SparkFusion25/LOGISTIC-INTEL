'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Shield, Users, BarChart3, Settings, Database, FileText, 
  Bell, Grid3x3, Menu, X, ChevronDown, User, LogOut, 
  AlertTriangle, Activity, CreditCard, Globe, Mail
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Data Sources', href: '/admin/data-sources', icon: Database },
    { name: 'System Health', href: '/admin/system', icon: Activity },
    { name: 'Billing & Plans', href: '/admin/billing', icon: CreditCard },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const quickStats = [
    { label: 'Active Users', value: '1,247', change: '+5.2%' },
    { label: 'System Load', value: '68%', change: '-2.1%' },
    { label: 'API Calls', value: '2.4M', change: '+12.8%' },
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

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Admin Panel</span>
              <p className="text-xs text-slate-400">Logistic Intel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">System Status</p>
          <div className="space-y-2">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{stat.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                  <span className={`text-xs ml-1 ${
                    stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Administration</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                }`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin Profile Section */}
        <div className="border-t border-slate-700 p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              AD
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-slate-400">System Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigation.find(item => pathname === item.href || pathname.startsWith(item.href + '/'))?.name || 'Admin Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Alerts */}
              <button className="relative p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
              </button>

              {/* Admin menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    AD
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">admin@logistic-intel.com</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Admin Settings
                    </Link>
                    <Link
                      href="/admin/system"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      System Config
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      User Dashboard
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
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}