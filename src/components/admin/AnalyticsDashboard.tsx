'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Zap,
  Target,
  Eye
} from 'lucide-react'

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  // Mock analytics data
  const metrics = [
    {
      name: 'Total Revenue',
      value: '$127,492',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      name: 'Active Users',
      value: '8,249',
      change: '+8.2%',
      changeType: 'increase', 
      icon: Users,
      color: 'text-primary'
    },
    {
      name: 'API Calls',
      value: '2.4M',
      change: '+15.3%',
      changeType: 'increase',
      icon: Zap,
      color: 'text-accent'
    },
    {
      name: 'Conversion Rate',
      value: '3.7%',
      change: '-0.2%',
      changeType: 'decrease',
      icon: Target,
      color: 'text-warning'
    }
  ]

  const topPages = [
    { path: '/search', views: '47,892', bounce: '24%' },
    { path: '/dashboard', views: '32,441', bounce: '18%' },
    { path: '/companies', views: '28,103', bounce: '31%' },
    { path: '/pricing', views: '19,847', bounce: '45%' },
    { path: '/settings', views: '12,339', bounce: '22%' }
  ]

  const userGrowth = [
    { month: 'Jan', users: 1200, revenue: 48000 },
    { month: 'Feb', users: 1450, revenue: 58000 },
    { month: 'Mar', users: 1680, revenue: 67200 },
    { month: 'Apr', users: 2100, revenue: 84000 },
    { month: 'May', users: 2400, revenue: 96000 },
    { month: 'Jun', users: 2850, revenue: 114000 },
    { month: 'Jul', users: 3200, revenue: 127400 }
  ]

  const planDistribution = [
    { plan: 'Free', users: 4200, percentage: 67 },
    { plan: 'Pro', users: 1800, percentage: 29 },
    { plan: 'Enterprise', users: 249, percentage: 4 }
  ]

  const recentEvents = [
    {
      type: 'signup',
      description: 'New user registration spike',
      impact: '+127 users in last hour',
      time: '5 minutes ago',
      severity: 'positive'
    },
    {
      type: 'api',
      description: 'API rate limit exceeded',
      impact: 'Enterprise client affected',
      time: '23 minutes ago',
      severity: 'warning'
    },
    {
      type: 'payment',
      description: 'Payment processing delay',
      impact: '3 transactions pending',
      time: '1 hour ago',
      severity: 'negative'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="heading-lg">Analytics Dashboard</h1>
          <p className="text-muted">Comprehensive insights into platform performance and user behavior</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button className="btn-secondary inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-card ${metric.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className={`flex items-center text-sm ${
                  metric.changeType === 'increase' ? 'text-success' : 'text-danger'
                }`}>
                  {metric.changeType === 'increase' ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                  )}
                  {metric.change}
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted mb-1">{metric.name}</h3>
              <p className="text-2xl font-bold text-ink">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue & User Growth Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-md">Growth Trends</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('users')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedMetric === 'users'
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedMetric === 'revenue'
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-ink hover:bg-surface'
                }`}
              >
                Revenue
              </button>
            </div>
          </div>
          
          {/* Simplified Chart Visualization */}
          <div className="h-64 bg-bg rounded-xl p-4 flex items-end justify-between">
            {userGrowth.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="bg-gradient-to-t from-primary to-primary/60 rounded-t-lg w-8 transition-all duration-300 hover:scale-110"
                  style={{
                    height: `${(selectedMetric === 'users' ? data.users : data.revenue / 1000) / (selectedMetric === 'users' ? 40 : 1.6)}px`
                  }}
                ></div>
                <span className="text-xs text-muted">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-md">Plan Distribution</h3>
            <PieChart className="w-5 h-5 text-muted" />
          </div>
          
          <div className="space-y-4">
            {planDistribution.map((plan, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded ${
                      plan.plan === 'Free' ? 'bg-muted' :
                      plan.plan === 'Pro' ? 'bg-primary' : 'bg-accent'
                    }`}
                  ></div>
                  <span className="font-medium text-ink">{plan.plan}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-ink">{plan.users.toLocaleString()}</div>
                  <div className="text-sm text-muted">{plan.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Visual Progress Bars */}
          <div className="mt-6 space-y-3">
            {planDistribution.map((plan, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{plan.plan}</span>
                  <span className="text-ink">{plan.percentage}%</span>
                </div>
                <div className="w-full bg-surface rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      plan.plan === 'Free' ? 'bg-muted' :
                      plan.plan === 'Pro' ? 'bg-primary' : 'bg-accent'
                    }`}
                    style={{ width: `${plan.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Pages */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-md">Top Pages</h3>
            <Eye className="w-5 h-5 text-muted" />
          </div>
          
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-bg rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-ink">{page.path}</div>
                  <div className="text-sm text-muted">{page.views} views</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    parseFloat(page.bounce) < 30 ? 'text-success' : 
                    parseFloat(page.bounce) > 40 ? 'text-danger' : 'text-warning'
                  }`}>
                    {page.bounce} bounce
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="heading-md">Real-time Events</h3>
            <div className="flex items-center gap-2 text-sm text-success">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
          
          <div className="space-y-4">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-bg rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-1 ${
                  event.severity === 'positive' ? 'bg-success' :
                  event.severity === 'warning' ? 'bg-warning' : 'bg-danger'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink">{event.description}</p>
                  <p className="text-sm text-muted">{event.impact}</p>
                  <p className="text-xs text-muted mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}