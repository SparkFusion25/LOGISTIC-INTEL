'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import StatsCard from '@/components/charts/StatsCard'
import UsageChart, { createLineChartData, createBarChartData } from '@/components/charts/UsageChart'
import { mockData } from '@/lib/supabase'
import { APIEndpoint } from '@/types/admin'
import { format } from 'date-fns'

export default function APIStatusPage() {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    loadAPIStatus()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadAPIStatus()
      setLastUpdated(new Date())
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadAPIStatus = async () => {
    try {
      setLoading(true)
      const apiData = mockData.getAPIEndpoints()
      setEndpoints(apiData)
    } catch (error) {
      console.error('Failed to load API status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshStatus = async () => {
    await loadAPIStatus()
    setLastUpdated(new Date())
  }

  // Calculate overall stats
  const totalEndpoints = endpoints.length
  const healthyEndpoints = endpoints.filter(e => e.status === 'up').length
  const degradedEndpoints = endpoints.filter(e => e.status === 'degraded').length
  const downEndpoints = endpoints.filter(e => e.status === 'down').length
  const overallUptime = endpoints.reduce((sum, e) => sum + e.uptime_percentage, 0) / totalEndpoints
  const avgResponseTime = endpoints.reduce((sum, e) => sum + e.avg_response_time, 0) / totalEndpoints

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'down': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'up': return 'bg-green-100 text-green-800'
      case 'degraded': return 'bg-yellow-100 text-yellow-800'
      case 'down': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': return CheckCircle
      case 'degraded': return AlertTriangle
      case 'down': return AlertTriangle
      default: return AlertTriangle
    }
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.5) return 'text-green-600'
    if (uptime >= 95) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime <= 500) return 'text-green-600'
    if (responseTime <= 1000) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Chart data
  const uptimeData = createBarChartData(
    endpoints.map(e => e.name.replace(' API', '')),
    [
      {
        label: 'Uptime %',
        data: endpoints.map(e => e.uptime_percentage),
      }
    ]
  )

  const responseTimeData = createBarChartData(
    endpoints.map(e => e.name.replace(' API', '')),
    [
      {
        label: 'Response Time (ms)',
        data: endpoints.map(e => e.avg_response_time),
      }
    ]
  )

  // Mock historical data for uptime trend
  const uptimeTrendData = createLineChartData(
    ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
    [
      {
        label: 'Overall Uptime %',
        data: [99.8, 99.5, 99.2, 98.8, 99.1, 99.4, overallUptime],
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
            <h1 className="text-3xl font-bold text-gray-900">API Health Monitor</h1>
            <p className="text-gray-600 mt-1">Real-time monitoring of external API endpoints and services</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-500">
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </div>
            <button
              onClick={handleRefreshStatus}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div className={`p-4 rounded-lg border-l-4 ${
          downEndpoints > 0 ? 'bg-red-50 border-red-400' :
          degradedEndpoints > 0 ? 'bg-yellow-50 border-yellow-400' :
          'bg-green-50 border-green-400'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {downEndpoints > 0 ? (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              ) : degradedEndpoints > 0 ? (
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
              <div>
                <h3 className={`text-lg font-semibold ${
                  downEndpoints > 0 ? 'text-red-800' :
                  degradedEndpoints > 0 ? 'text-yellow-800' :
                  'text-green-800'
                }`}>
                  {downEndpoints > 0 ? 'Service Disruption Detected' :
                   degradedEndpoints > 0 ? 'Some Services Degraded' :
                   'All Systems Operational'}
                </h3>
                <p className={`text-sm ${
                  downEndpoints > 0 ? 'text-red-700' :
                  degradedEndpoints > 0 ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  {healthyEndpoints} of {totalEndpoints} services are running normally
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                overallUptime >= 99.5 ? 'text-green-600' :
                overallUptime >= 95 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {overallUptime.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Uptime</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Healthy Services"
            value={`${healthyEndpoints}/${totalEndpoints}`}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Overall Uptime"
            value={`${overallUptime.toFixed(1)}%`}
            icon={TrendingUp}
            trend={{ 
              value: 0.2, 
              label: 'vs last hour', 
              isPositive: overallUptime >= 99.5 
            }}
            color="blue"
          />
          <StatsCard
            title="Avg Response Time"
            value={`${Math.round(avgResponseTime)}ms`}
            icon={Zap}
            trend={{ 
              value: 5.3, 
              label: 'vs last hour', 
              isPositive: avgResponseTime <= 500 
            }}
            color="purple"
          />
          <StatsCard
            title="Issues Detected"
            value={degradedEndpoints + downEndpoints}
            subtitle={downEndpoints > 0 ? `${downEndpoints} critical` : 'No critical issues'}
            icon={AlertTriangle}
            color={downEndpoints > 0 ? 'red' : degradedEndpoints > 0 ? 'orange' : 'green'}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="line"
            title="Uptime Trend (Last 6 Hours)"
            data={uptimeTrendData}
            height={300}
          />
          <UsageChart
            type="bar"
            title="Service Uptime Comparison"
            data={uptimeData}
            height={300}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <UsageChart
            type="bar"
            title="Average Response Times"
            data={responseTimeData}
            height={300}
          />
        </div>

        {/* API Endpoints Status Table */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">API Endpoints Status</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Auto-refresh every 30 seconds</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Uptime</th>
                  <th>Response Time</th>
                  <th>Last Error</th>
                  <th>Last Checked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((endpoint) => {
                  const StatusIcon = getStatusIcon(endpoint.status)
                  
                  return (
                    <tr key={endpoint.id} className="hover:bg-gray-50">
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Globe className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{endpoint.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{endpoint.url}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(endpoint.status)}`} />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(endpoint.status)}`}>
                            {endpoint.status.charAt(0).toUpperCase() + endpoint.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={`font-medium ${getUptimeColor(endpoint.uptime_percentage)}`}>
                          {endpoint.uptime_percentage.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              endpoint.uptime_percentage >= 99.5 ? 'bg-green-500' :
                              endpoint.uptime_percentage >= 95 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${endpoint.uptime_percentage}%` }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <div className={`font-medium ${getResponseTimeColor(endpoint.avg_response_time)}`}>
                          {endpoint.avg_response_time}ms
                        </div>
                        <div className="text-xs text-gray-500">
                          {endpoint.avg_response_time <= 500 ? 'Excellent' :
                           endpoint.avg_response_time <= 1000 ? 'Good' : 'Slow'}
                        </div>
                      </td>
                      <td>
                        {endpoint.last_error ? (
                          <div className="text-sm text-red-600 font-medium">
                            {endpoint.last_error}
                          </div>
                        ) : (
                          <div className="text-sm text-green-600">
                            No recent errors
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          {format(new Date(endpoint.last_checked), 'MMM dd, HH:mm')}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(endpoint.url, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Open API Documentation"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="View Detailed Metrics"
                          >
                            <Activity className="h-4 w-4" />
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

        {/* Recent Incidents */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
          <div className="space-y-3">
            {/* Mock incident data */}
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-yellow-800">DataForSEO API Rate Limit</div>
                <div className="text-sm text-yellow-700">
                  API returned 429 Too Many Requests. Response times increased to 1200ms average.
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  2 hours ago • Resolved automatically
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-green-800">All Services Restored</div>
                <div className="text-sm text-green-700">
                  All API endpoints are now responding normally. Performance metrics back to baseline.
                </div>
                <div className="text-xs text-green-600 mt-1">
                  6 hours ago • Incident resolved
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Level Objectives */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Level Objectives (SLO)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-gray-600">Target Uptime</div>
              <div className="text-xs text-gray-500 mt-1">
                Current: {overallUptime.toFixed(1)}% 
                {overallUptime >= 99.9 ? ' ✓' : ' ⚠️'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">&lt;500ms</div>
              <div className="text-sm text-gray-600">Target Response Time</div>
              <div className="text-xs text-gray-500 mt-1">
                Current: {Math.round(avgResponseTime)}ms 
                {avgResponseTime <= 500 ? ' ✓' : ' ⚠️'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">&lt;0.1%</div>
              <div className="text-sm text-gray-600">Target Error Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                Current: 0.05% ✓
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}