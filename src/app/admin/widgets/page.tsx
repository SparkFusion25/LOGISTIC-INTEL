'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import StatsCard from '@/components/charts/StatsCard'
import UsageChart, { createBarChartData, createDoughnutChartData, createLineChartData } from '@/components/charts/UsageChart'
import { mockData } from '@/lib/supabase'
import { Widget } from '@/types/admin'
import { format } from 'date-fns'

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    loadWidgets()
  }, [])

  const loadWidgets = async () => {
    try {
      setLoading(true)
      const widgetsData = mockData.getWidgets()
      setWidgets(widgetsData)
    } catch (error) {
      console.error('Failed to load widgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleWidgetStatus = async (widgetId: string) => {
    try {
      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, status: widget.status === 'active' ? 'maintenance' as const : 'active' as const }
          : widget
      ))
      alert('Widget status updated successfully')
    } catch (error) {
      console.error('Failed to update widget status:', error)
    }
  }

  const handleViewDetails = (widget: Widget) => {
    setSelectedWidget(widget)
    setShowDetailsModal(true)
  }

  const handleExportWidgetData = () => {
    const csvContent = [
      ['Widget Name', 'Usage Count', 'Active Users', 'Status', 'Last Used'].join(','),
      ...widgets.map(widget => [
        widget.display_name,
        widget.usage_count,
        widget.active_users,
        widget.status,
        widget.last_used
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `widget-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate stats
  const totalUsage = widgets.reduce((sum, widget) => sum + widget.usage_count, 0)
  const totalActiveUsers = widgets.reduce((sum, widget) => sum + widget.active_users, 0)
  const activeWidgets = widgets.filter(w => w.status === 'active').length
  const avgUsagePerWidget = totalUsage / widgets.length

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'deprecated': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'maintenance': return AlertTriangle
      case 'deprecated': return AlertTriangle
      default: return AlertTriangle
    }
  }

  // Chart data
  const widgetUsageData = createBarChartData(
    widgets.map(w => w.display_name),
    [
      {
        label: 'Usage Count',
        data: widgets.map(w => w.usage_count),
      }
    ]
  )

  const widgetUsersData = createBarChartData(
    widgets.map(w => w.display_name),
    [
      {
        label: 'Active Users',
        data: widgets.map(w => w.active_users),
      }
    ]
  )

  const widgetStatusData = createDoughnutChartData(
    ['Active', 'Maintenance', 'Deprecated'],
    [
      widgets.filter(w => w.status === 'active').length,
      widgets.filter(w => w.status === 'maintenance').length,
      widgets.filter(w => w.status === 'deprecated').length
    ]
  )

  // Mock historical data for trend chart
  const usageTrendData = createLineChartData(
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    [
      {
        label: 'Tariff Calculator',
        data: [800, 950, 1100, 1180, 1220, 1250],
      },
      {
        label: 'Quote Generator',
        data: [600, 720, 780, 820, 860, 890],
      },
      {
        label: 'Campaign Builder',
        data: [300, 380, 450, 500, 540, 567],
      },
      {
        label: 'CRM Lookup',
        data: [200, 280, 350, 380, 400, 423],
      }
    ]
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Widget Analytics</h1>
            <p className="text-gray-600 mt-1">Monitor widget usage, performance, and user engagement</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadWidgets}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportWidgetData}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Widget Usage"
            value={totalUsage}
            icon={BarChart3}
            trend={{ value: 15.3, label: 'vs last month', isPositive: true }}
            color="blue"
          />
          <StatsCard
            title="Active Users"
            value={totalActiveUsers}
            subtitle="across all widgets"
            icon={Users}
            trend={{ value: 8.7, label: 'vs last month', isPositive: true }}
            color="green"
          />
          <StatsCard
            title="Active Widgets"
            value={`${activeWidgets}/${widgets.length}`}
            subtitle="operational status"
            icon={CheckCircle}
            color="purple"
          />
          <StatsCard
            title="Avg Usage per Widget"
            value={Math.round(avgUsagePerWidget)}
            icon={TrendingUp}
            trend={{ value: 12.4, label: 'vs last month', isPositive: true }}
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="bar"
            title="Widget Usage Statistics"
            data={widgetUsageData}
            height={350}
          />
          <UsageChart
            type="bar"
            title="Active Users per Widget"
            data={widgetUsersData}
            height={350}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="line"
            title="Usage Trend Over Time"
            data={usageTrendData}
            height={350}
          />
          <UsageChart
            type="doughnut"
            title="Widget Status Distribution"
            data={widgetStatusData}
            height={350}
          />
        </div>

        {/* Widget Details Table */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Widget Performance Details</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Widget</th>
                  <th>Status</th>
                  <th>Usage Count</th>
                  <th>Active Users</th>
                  <th>Usage per User</th>
                  <th>Last Used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {widgets.map((widget) => {
                  const StatusIcon = getStatusIcon(widget.status)
                  const usagePerUser = widget.active_users > 0 ? (widget.usage_count / widget.active_users).toFixed(1) : '0'
                  
                  return (
                    <tr key={widget.id} className="hover:bg-gray-50">
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{widget.display_name}</div>
                            <div className="text-sm text-gray-500">ID: {widget.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${
                            widget.status === 'active' ? 'text-green-500' : 
                            widget.status === 'maintenance' ? 'text-yellow-500' : 'text-red-500'
                          }`} />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(widget.status)}`}>
                            {widget.status.charAt(0).toUpperCase() + widget.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-900">
                          {widget.usage_count.toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-900">
                          {widget.active_users.toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-900">
                          {usagePerUser}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          {format(new Date(widget.last_used), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(widget)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleWidgetStatus(widget.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              widget.status === 'active' 
                                ? 'text-yellow-600 hover:bg-yellow-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={widget.status === 'active' ? 'Put in Maintenance' : 'Activate Widget'}
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Widget Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Widgets</h3>
            <div className="space-y-3">
              {widgets
                .sort((a, b) => b.usage_count - a.usage_count)
                .slice(0, 3)
                .map((widget, index) => (
                  <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{widget.display_name}</div>
                        <div className="text-sm text-gray-500">{widget.active_users} active users</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{widget.usage_count.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">uses</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Health Status</h3>
            <div className="space-y-4">
              {widgets.map((widget) => {
                const healthScore = widget.status === 'active' ? 100 : 
                                 widget.status === 'maintenance' ? 50 : 0
                const healthColor = healthScore === 100 ? 'bg-green-500' :
                                  healthScore === 50 ? 'bg-yellow-500' : 'bg-red-500'
                
                return (
                  <div key={widget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{widget.display_name}</span>
                      <span className="text-sm text-gray-500">{healthScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${healthColor}`}
                        style={{ width: `${healthScore}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Widget Details Modal */}
        {showDetailsModal && selectedWidget && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Widget Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Widget Name
                    </label>
                    <div className="text-sm text-gray-900">{selectedWidget.display_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedWidget.status)}`}>
                      {selectedWidget.status.charAt(0).toUpperCase() + selectedWidget.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Name
                    </label>
                    <div className="text-sm text-gray-900 font-mono">{selectedWidget.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Used
                    </label>
                    <div className="text-sm text-gray-900">
                      {format(new Date(selectedWidget.last_used), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Usage Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Usage:</span>
                        <span className="text-sm font-medium">{selectedWidget.usage_count.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Users:</span>
                        <span className="text-sm font-medium">{selectedWidget.active_users.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Usage per User:</span>
                        <span className="text-sm font-medium">
                          {selectedWidget.active_users > 0 ? (selectedWidget.usage_count / selectedWidget.active_users).toFixed(1) : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Health Score:</span>
                        <span className="text-sm font-medium">
                          {selectedWidget.status === 'active' ? '100%' : 
                           selectedWidget.status === 'maintenance' ? '50%' : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Uptime:</span>
                        <span className="text-sm font-medium">99.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Error Rate:</span>
                        <span className="text-sm font-medium">0.1%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="admin-button-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleToggleWidgetStatus(selectedWidget.id)
                      setShowDetailsModal(false)
                    }}
                    className={selectedWidget.status === 'active' ? 'admin-button-danger' : 'admin-button-primary'}
                  >
                    {selectedWidget.status === 'active' ? 'Put in Maintenance' : 'Activate Widget'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}