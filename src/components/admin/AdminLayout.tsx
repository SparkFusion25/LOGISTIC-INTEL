'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Database,
  TrendingUp,
  Shield,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User,
  Crown,
  BarChart3,
  UserCheck,
  CreditCard,
  Mail
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  // Mock user data - replace with real auth
  useEffect(() => {
    setUser({
      name: 'Admin User',
      email: 'admin@logisticintel.com',
      avatar: '/api/placeholder/32/32',
      role: 'Super Admin'
    })
  }, [])

  const navigation = [
    {
      name: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      current: pathname === '/admin'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: pathname?.startsWith('/admin/users'),
      count: 1247
    },
    {
      name: 'Affiliates',
      href: '/admin/affiliates',
      icon: UserCheck,
      current: pathname?.startsWith('/admin/affiliates'),
      count: 89
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      current: pathname?.startsWith('/admin/subscriptions'),
      badge: 'Premium'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: pathname?.startsWith('/admin/analytics')
    },
    {
      name: 'Database',
      href: '/admin/database',
      icon: Database,
      current: pathname?.startsWith('/admin/database'),
      badge: 'Live'
    },
    {
      name: 'Email',
      href: '/admin/email',
      icon: Mail,
      current: pathname?.startsWith('/admin/email')
    },
    {
      name: 'Security',
      href: '/admin/security',
      icon: Shield,
      current: pathname?.startsWith('/admin/security')
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: pathname?.startsWith('/admin/settings')
    }
  ]

  const stats = [
    { name: 'Active Users', value: '1,247', change: '+12%', changeType: 'increase' },
    { name: 'Monthly Revenue', value: '$58,420', change: '+24%', changeType: 'increase' },
    { name: 'Active Subscriptions', value: '892', change: '+8%', changeType: 'increase' },
    { name: 'System Uptime', value: '99.9%', change: '0%', changeType: 'neutral' }
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out lg:translate-x-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LI</span>
            </div>
            <span className="text-ink font-semibold">Admin Portal</span>
          </div>
          <button
            className="lg:hidden p-2 text-muted hover:text-ink transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  item.current
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted hover:text-ink hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 ${item.current ? 'text-primary' : ''}`} />
                  <span>{item.name}</span>
                </div>
                
                {item.count && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    item.current ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted'
                  }`}>
                    {item.count}
                  </span>
                )}
                
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-muted truncate">{user?.role}</p>
            </div>
            <button className="p-2 text-muted hover:text-ink transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-border bg-surface/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden p-2 text-muted hover:text-ink transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 lg:gap-x-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Search users, data, settings..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <button className="p-2 text-muted hover:text-ink transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">3</span>
              </span>
            </button>
            
            <div className="hidden lg:block w-px h-6 bg-border"></div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden lg:block text-sm font-medium text-ink">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick stats - show on overview page */}
          {pathname === '/admin' && (
            <div className="mb-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted">{stat.name}</p>
                        <p className="text-2xl font-bold text-ink">{stat.value}</p>
                      </div>
                      <div className={`flex items-center text-sm ${
                        stat.changeType === 'increase' ? 'text-success' : 
                        stat.changeType === 'decrease' ? 'text-danger' : 'text-muted'
                      }`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  )
}