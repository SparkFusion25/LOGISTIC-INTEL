'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Mail, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Globe,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import StatsCard from '@/components/charts/StatsCard'
import UsageChart, { 
  createLineChartData, 
  createBarChartData, 
  createDoughnutChartData 
} from '@/components/charts/UsageChart'
import { mockData } from '@/lib/supabase'
import { DashboardStats } from '@/types/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      // In a real app, this would be an API call
      const dashboardStats = mockData.getDashboardStats()
      setStats(dashboardStats)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  // Chart data
  const userGrowthData = createLineChartData(
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    [
      {
        label: 'Total Users',
        data: [850, 920, 980, 1050, 1120, 1200],
      },
      {
        label: 'Active Users',
        data: [680, 740, 790, 850, 900, 960],
      }
    ]
  )

  const widgetUsageData = createBarChartData(
    ['Tariff Calc', 'Quote Gen', 'Campaign Builder', 'CRM Lookup'],
    [
      {
        label: 'Usage Count',
        data: [1250, 890, 567, 423],
      }
    ]
  )

  const userTierData = createDoughnutChartData(
    ['Trial', 'Pro', 'Enterprise'],
    [stats.total_users.breakdown.trial, stats.total_users.breakdown.pro, stats.total_users.breakdown.enterprise]
  )

  const campaignMetricsData = createLineChartData(
    ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    [
      {
        label: 'Emails Sent',
        data: [3200, 3800, 4100, 4300],
      },
      {
        label: 'Emails Opened',
        data: [780, 920, 1050, 1100],
      },
      {
        label: 'Replies',
        data: [125, 145, 168, 180],
      }
    ]
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor platform performance and user activity</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.total_users.count}
            subtitle={`${stats.total_users.breakdown.enterprise} Enterprise`}
            icon={Users}
            trend={{ value: 12.5, label: 'vs last month', isPositive: true }}
            color="blue"
          />
          <StatsCard
            title="Active Campaigns"
            value={stats.active_campaigns}
            subtitle="Running campaigns"
            icon={Mail}
            trend={{ value: 8.2, label: 'vs last month', isPositive: true }}
            color="green"
          />
          <StatsCard
            title="Widget Usage"
            value={stats.widgets_in_use}
            subtitle="Total interactions"
            icon={BarChart3}
            trend={{ value: 15.3, label: 'vs last week', isPositive: true }}
            color="purple"
          />
          <StatsCard
            title="API Health"
            value={`${stats.api_status.healthy}/${stats.api_status.total}`}
            subtitle="Endpoints healthy"
            icon={Activity}
            color={stats.api_status.healthy === stats.api_status.total ? 'green' : 'orange'}
          />
        </div>

        {/* Campaign Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Avg Open Rate"
            value={`${stats.campaign_metrics.avg_open_rate}%`}
            icon={TrendingUp}
            trend={{ value: 2.1, label: 'vs industry avg', isPositive: true }}
            color="green"
          />
          <StatsCard
            title="Avg Reply Rate"
            value={`${stats.campaign_metrics.avg_reply_rate}%`}
            icon={Mail}
            trend={{ value: 0.8, label: 'vs last month', isPositive: true }}
            color="blue"
          />
          <StatsCard
            title="Total Emails Sent"
            value={stats.campaign_metrics.total_emails_sent}
            icon={Globe}
            trend={{ value: 22.4, label: 'vs last month', isPositive: true }}
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="line"
            title="User Growth Trend"
            data={userGrowthData}
            height={350}
          />
          <UsageChart
            type="doughnut"
            title="User Distribution by Tier"
            data={userTierData}
            height={350}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="bar"
            title="Widget Usage Statistics"
            data={widgetUsageData}
            height={350}
          />
          <UsageChart
            type="line"
            title="Campaign Performance Metrics"
            data={campaignMetricsData}
            height={350}
          />
        </div>

        {/* Top Users Table */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Users by Activity</h3>
            <button className="admin-button-secondary text-sm">
              View All Users
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Usage Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_users.map((user, index) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td>{user.company}</td>
                    <td>
                      <span className="font-medium">{user.usage_count}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="admin-button-primary text-center p-4">
              Export User Data
            </button>
            <button className="admin-button-secondary text-center p-4">
              Generate Report
            </button>
            <button className="admin-button-secondary text-center p-4">
              System Health Check
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}