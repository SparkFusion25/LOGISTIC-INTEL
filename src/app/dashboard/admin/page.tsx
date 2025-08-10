'use client'

import { AdminLayout } from '../../../components/admin/AdminLayout'
import { 
  Users, 
  TrendingUp, 
  Database, 
  Shield,
  Activity,
  DollarSign,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Globe,
  Server,
  CreditCard,
  Mail,
  Plus
} from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'user_signup',
      user: 'Sarah Chen',
      action: 'signed up',
      target: 'Premium plan',
      timestamp: '2 minutes ago',
      icon: UserCheck,
      color: 'text-success'
    },
    {
      id: 2,
      type: 'system_alert',
      user: 'System',
      action: 'detected high traffic',
      target: 'API endpoint /search',
      timestamp: '15 minutes ago',
      icon: AlertTriangle,
      color: 'text-warning'
    },
    {
      id: 3,
      type: 'data_update',
      user: 'Auto Sync',
      action: 'updated shipment data',
      target: '2,847 new records',
      timestamp: '1 hour ago',
      icon: Database,
      color: 'text-primary'
    },
    {
      id: 4,
      type: 'payment',
      user: 'ACME Corp',
      action: 'upgraded to',
      target: 'Enterprise plan',
      timestamp: '3 hours ago',
      icon: DollarSign,
      color: 'text-accent'
    },
    {
      id: 5,
      type: 'affiliate',
      user: 'Mike Johnson',
      action: 'earned commission',
      target: '$127.50',
      timestamp: '4 hours ago',
      icon: TrendingUp,
      color: 'text-success'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="heading-md">Recent Activity</h3>
        <button className="btn-ghost text-sm px-3 py-1">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-card ${activity.color}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted mt-1">{activity.timestamp}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SystemHealth() {
  const healthMetrics = [
    {
      name: 'API Response Time',
      value: '234ms',
      status: 'healthy',
      change: '-12ms',
      changeType: 'improvement'
    },
    {
      name: 'Database Performance',
      value: '98.7%',
      status: 'healthy',
      change: '+0.3%',
      changeType: 'improvement'
    },
    {
      name: 'Error Rate',
      value: '0.12%',
      status: 'healthy',
      change: '-0.05%',
      changeType: 'improvement'
    },
    {
      name: 'Active Connections',
      value: '2,847',
      status: 'warning',
      change: '+234',
      changeType: 'neutral'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="heading-md">System Health</h3>
        <div className="flex items-center gap-2 text-sm text-success">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          All systems operational
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="bg-bg rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted">{metric.name}</span>
              <div className={`w-2 h-2 rounded-full ${
                metric.status === 'healthy' ? 'bg-success' :
                metric.status === 'warning' ? 'bg-warning' : 'bg-danger'
              }`}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-ink">{metric.value}</span>
              <div className={`flex items-center text-xs ${
                metric.changeType === 'improvement' ? 'text-success' :
                metric.changeType === 'decline' ? 'text-danger' : 'text-muted'
              }`}>
                {metric.changeType === 'improvement' && <ArrowUp className="w-3 h-3 mr-1" />}
                {metric.changeType === 'decline' && <ArrowDown className="w-3 h-3 mr-1" />}
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminOverview() {
  const { data: users } = useSWR('/api/admin/users', fetcher)
  const { data: subs } = useSWR('/api/admin/subscriptions', fetcher)
  const { data: aff } = useSWR('/api/admin/affiliates', fetcher)
  const { data: codes, mutate: mutateCodes } = useSWR('/api/admin/promo-codes', fetcher)

  async function createPromo() {
    const code = prompt('Code (e.g. LAUNCH20)')
    if (!code) return
    try {
      await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, percent_off: 20 })
      })
      mutateCodes()
    } catch (error) {
      console.error('Failed to create promo code:', error)
    }
  }

  const quickStats = [
    {
      name: 'Total Users',
      value: users?.users?.length || 0,
      icon: Users,
      color: 'from-primary to-primary-600'
    },
    {
      name: 'Active Subscriptions', 
      value: subs?.subscriptions?.length || 0,
      icon: CreditCard,
      color: 'from-accent to-accent'
    },
    {
      name: 'Affiliate Accounts',
      value: aff?.accounts?.length || 0,
      icon: UserCheck,
      color: 'from-success to-success'
    },
    {
      name: 'Promo Codes',
      value: codes?.codes?.length || 0,
      icon: DollarSign,
      color: 'from-warning to-warning'
    }
  ]

  return (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">{stat.name}</p>
                  <p className="text-2xl font-bold text-ink">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Management Sections */}
      <div className="space-y-6">
        {/* Promo Codes Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-md">Promo Codes</h3>
            <button 
              onClick={createPromo}
              className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2"
            >
              <Plus className="w-4 h-4" />
              New Code
            </button>
          </div>
          <div className="space-y-3">
            {(codes?.codes || []).map((code: any) => (
              <div key={code.id} className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                <div>
                  <span className="font-medium text-ink">{code.code}</span>
                  {code.percent_off && (
                    <span className="ml-2 text-sm text-success">- {code.percent_off}%</span>
                  )}
                </div>
                <div className="text-sm text-muted">
                  Used {code.redemptions_used || 0}
                  {code.max_redemptions && `/${code.max_redemptions}`}
                </div>
              </div>
            ))}
            {(!codes?.codes || codes.codes.length === 0) && (
              <div className="text-center py-8 text-muted">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No promo codes created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Affiliate Summary */}
        <div className="card">
          <h3 className="heading-md mb-6">Affiliate Program Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-ink mb-1">
                {aff?.accounts?.length || 0}
              </div>
              <div className="text-sm text-muted">Affiliate Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ink mb-1">
                {aff?.links?.length || 0}
              </div>
              <div className="text-sm text-muted">Active Links</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ink mb-1">
                {aff?.referrals?.length || 0}
              </div>
              <div className="text-sm text-muted">Total Referrals</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function QuickActions() {
  const actions = [
    {
      name: 'Add New User',
      icon: Users,
      href: '/admin/users/new',
      color: 'from-primary to-primary-600'
    },
    {
      name: 'View Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-accent to-accent'
    },
    {
      name: 'System Backup',
      icon: Server,
      href: '/admin/database/backup',
      color: 'from-success to-success'
    },
    {
      name: 'Send Broadcast',
      icon: Mail,
      href: '/admin/email/broadcast',
      color: 'from-warning to-warning'
    }
  ]

  return (
    <div className="card">
      <h3 className="heading-md mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <button
              key={index}
              className="p-4 bg-bg hover:bg-surface rounded-xl transition-all duration-200 hover:scale-105 group text-left"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-ink group-hover:text-primary transition-colors">
                {action.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="heading-lg mb-2">Admin Dashboard</h1>
          <p className="text-muted">Monitor system performance, user activity, and key metrics</p>
        </div>

        {/* Overview Section */}
        <AdminOverview />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <RecentActivity />
            <SystemHealth />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <QuickActions />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}