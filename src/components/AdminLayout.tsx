'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  BarChart3, 
  Activity, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Database,
  TrendingUp,
  Globe
} from 'lucide-react'
import { adminAuth } from '@/lib/adminAuthMock'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Campaigns', href: '/admin/campaigns', icon: Mail },
  { name: 'Widgets', href: '/admin/widgets', icon: BarChart3 },
  { name: 'Email Activity', href: '/admin/emails', icon: Activity },
  { name: 'API Status', href: '/admin/api-status', icon: Settings },
  { name: 'CRM Monitoring', href: '/admin/crm-monitoring', icon: Database },
  { name: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { user } = await adminAuth.getCurrentUser()
      if (user) {
        const { isAdmin } = await adminAuth.checkAdminRole(user.id)
        if (isAdmin) {
          setAdminUser(user)
        } else {
          console.log('Access denied: Not an admin user')
          router.push('/admin/login?error=access_denied')
        }
      } else {
        console.log('No authenticated user found')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      router.push('/admin/login?error=auth_failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await adminAuth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!adminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`sidebar-fixed ${sidebarOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-white/10">
            <Shield className="w-8 h-8 text-white mr-3" />
            <div>
              <span className="text-xl font-bold text-white">Admin Portal</span>
              <p className="text-xs text-white/60">Logistic Intel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="sidebar-nav-icon" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{adminUser.name || adminUser.email}</p>
                <p className="text-xs text-white/60 truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">Admin Portal</span>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page Content */}
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  )
}