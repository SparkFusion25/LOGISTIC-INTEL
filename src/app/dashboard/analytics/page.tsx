'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  MessageCircle, 
  Mail, 
  Users, 
  Target,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface AnalyticsData {
  campaigns: {
    totalCampaigns: number
    activeCampaigns: number
    totalContacts: number
    avgOpenRate: number
    avgClickRate: number
    avgReplyRate: number
  }
  emailTracking: {
    totalSent: number
    opened: number
    clicked: number
    replied: number
    bounced: number
    openRate: number
    clickRate: number
    replyRate: number
  }
  widgetUsage: {
    totalWidgets: number
    activeWidgets: number
    monthlyUsage: number
    usageLimit: number
    topWidgets: Array<{
      name: string
      usage: number
      percentage: number
    }>
  }
  crmActivity: {
    totalContacts: number
    newContacts: number
    touchpoints: number
    conversions: number
    pipelineValue: string
  }
}

interface TimeSeriesData {
  date: string
  opens: number
  clicks: number
  replies: number
  newContacts: number
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)

  // Mock analytics data
  const mockAnalyticsData: AnalyticsData = {
    campaigns: {
      totalCampaigns: 8,
      activeCampaigns: 3,
      totalContacts: 247,
      avgOpenRate: 58.3,
      avgClickRate: 15.7,
      avgReplyRate: 8.2
    },
    emailTracking: {
      totalSent: 1840,
      opened: 1073,
      clicked: 289,
      replied: 151,
      bounced: 23,
      openRate: 58.3,
      clickRate: 15.7,
      replyRate: 8.2
    },
    widgetUsage: {
      totalWidgets: 7,
      activeWidgets: 5,
      monthlyUsage: 3247,
      usageLimit: 5000,
      topWidgets: [
        { name: 'Company Search', usage: 1247, percentage: 38.4 },
        { name: 'Trade Analytics', usage: 856, percentage: 26.4 },
        { name: 'Quote Generator', usage: 634, percentage: 19.5 },
        { name: 'Tariff Calculator', usage: 345, percentage: 10.6 },
        { name: 'Market Benchmark', usage: 165, percentage: 5.1 }
      ]
    },
    crmActivity: {
      totalContacts: 156,
      newContacts: 23,
      touchpoints: 342,
      conversions: 12,
      pipelineValue: '$1.8M'
    }
  }

  const mockTimeSeriesData: TimeSeriesData[] = [
    { date: '2024-01-01', opens: 45, clicks: 12, replies: 3, newContacts: 8 },
    { date: '2024-01-02', opens: 52, clicks: 15, replies: 5, newContacts: 6 },
    { date: '2024-01-03', opens: 38, clicks: 9, replies: 2, newContacts: 11 },
    { date: '2024-01-04', opens: 67, clicks: 18, replies: 7, newContacts: 4 },
    { date: '2024-01-05', opens: 59, clicks: 16, replies: 4, newContacts: 9 },
    { date: '2024-01-06', opens: 71, clicks: 22, replies: 8, newContacts: 7 },
    { date: '2024-01-07', opens: 48, clicks: 13, replies: 6, newContacts: 12 }
  ]

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData)
      setTimeSeriesData(mockTimeSeriesData)
      setLoading(false)
    }, 1000)
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analyticsData) return null

  return (
    <div className="min-h-screen bg-gray-100 p-3 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="glass-card p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 lg:mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
              <p className="text-sm lg:text-base text-gray-600">Track campaign performance, email engagement, and widget usage</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-input py-2 text-sm lg:text-base"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="btn-secondary text-sm lg:text-base">
                <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                Refresh
              </button>
              <button className="btn-primary text-sm lg:text-base">
                <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Analytics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Total Campaigns</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{analyticsData.campaigns.totalCampaigns}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs lg:text-sm text-green-600 flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +2 this month
                  </span>
                </div>
              </div>
              <Target className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 flex-shrink-0" />
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Avg. Open Rate</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">{analyticsData.campaigns.avgOpenRate}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs lg:text-sm text-green-600 flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +3.2% vs industry
                  </span>
                </div>
              </div>
              <Eye className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 flex-shrink-0" />
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Avg. Click Rate</p>
                <p className="text-xl lg:text-2xl font-bold text-orange-600">{analyticsData.campaigns.avgClickRate}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs lg:text-sm text-green-600 flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +1.8% vs last month
                  </span>
                </div>
              </div>
              <MousePointer className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600 flex-shrink-0" />
            </div>
          </div>

          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Avg. Reply Rate</p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">{analyticsData.campaigns.avgReplyRate}%</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs lg:text-sm text-green-600 flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +0.5% vs last month
                  </span>
                </div>
              </div>
              <MessageCircle className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Email Tracking & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="glass-card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Email Performance</h3>
              <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            </div>
            
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-xs lg:text-sm text-gray-600">Total Sent</p>
                  <p className="text-lg lg:text-xl font-bold text-gray-900">{analyticsData.emailTracking.totalSent.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-gray-600">This Month</p>
                  <p className="text-xs lg:text-sm text-green-600">+12.5%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:gap-4">
                <div className="text-center p-2 lg:p-3 bg-green-50 rounded-lg">
                  <p className="text-lg lg:text-2xl font-bold text-green-600">{analyticsData.emailTracking.opened}</p>
                  <p className="text-xs lg:text-sm text-gray-600">Opened</p>
                  <p className="text-xs text-green-600">{analyticsData.emailTracking.openRate}%</p>
                </div>
                <div className="text-center p-2 lg:p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg lg:text-2xl font-bold text-blue-600">{analyticsData.emailTracking.clicked}</p>
                  <p className="text-xs lg:text-sm text-gray-600">Clicked</p>
                  <p className="text-xs text-blue-600">{analyticsData.emailTracking.clickRate}%</p>
                </div>
                <div className="text-center p-2 lg:p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg lg:text-2xl font-bold text-purple-600">{analyticsData.emailTracking.replied}</p>
                  <p className="text-xs lg:text-sm text-gray-600">Replied</p>
                  <p className="text-xs text-purple-600">{analyticsData.emailTracking.replyRate}%</p>
                </div>
                <div className="text-center p-2 lg:p-3 bg-red-50 rounded-lg">
                  <p className="text-lg lg:text-2xl font-bold text-red-600">{analyticsData.emailTracking.bounced}</p>
                  <p className="text-xs lg:text-sm text-gray-600">Bounced</p>
                  <p className="text-xs text-red-600">1.3%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Widget Usage Analytics */}
          <div className="glass-card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Widget Usage</h3>
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            </div>

            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="text-xs lg:text-sm text-gray-600">Monthly Usage</p>
                  <p className="text-base lg:text-xl font-bold text-gray-900">
                    {analyticsData.widgetUsage.monthlyUsage.toLocaleString()} / {analyticsData.widgetUsage.usageLimit.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-gray-600">Usage Rate</p>
                  <p className="text-xs lg:text-sm font-medium text-blue-600">
                    {((analyticsData.widgetUsage.monthlyUsage / analyticsData.widgetUsage.usageLimit) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2 lg:space-y-3">
                <h4 className="text-sm lg:text-base font-medium text-gray-900">Top Widgets</h4>
                {analyticsData.widgetUsage.topWidgets.map((widget, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm font-medium text-gray-900 truncate pr-2">{widget.name}</span>
                      <span className="text-xs lg:text-sm text-gray-600 flex-shrink-0">{widget.usage}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 lg:h-2">
                      <div 
                        className="bg-blue-600 h-1.5 lg:h-2 rounded-full transition-all duration-300"
                        style={{ width: `${widget.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CRM Activity & Time Series */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* CRM Activity */}
          <div className="glass-card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">CRM Activity</h3>
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            </div>

            <div className="space-y-3 lg:space-y-4">
              <div className="text-center p-3 lg:p-4 bg-blue-50 rounded-lg">
                <p className="text-xl lg:text-2xl font-bold text-blue-600">{analyticsData.crmActivity.totalContacts}</p>
                <p className="text-xs lg:text-sm text-gray-600">Total Contacts</p>
              </div>

              <div className="grid grid-cols-2 gap-2 lg:gap-3">
                <div className="text-center p-2 lg:p-3 bg-green-50 rounded-lg">
                  <p className="text-base lg:text-lg font-bold text-green-600">{analyticsData.crmActivity.newContacts}</p>
                  <p className="text-xs text-gray-600">New This Month</p>
                </div>
                <div className="text-center p-2 lg:p-3 bg-orange-50 rounded-lg">
                  <p className="text-base lg:text-lg font-bold text-orange-600">{analyticsData.crmActivity.touchpoints}</p>
                  <p className="text-xs text-gray-600">Touchpoints</p>
                </div>
              </div>

              <div className="text-center p-3 lg:p-4 bg-purple-50 rounded-lg">
                <p className="text-lg lg:text-xl font-bold text-purple-600">{analyticsData.crmActivity.pipelineValue}</p>
                <p className="text-xs lg:text-sm text-gray-600">Pipeline Value</p>
              </div>
            </div>
          </div>

          {/* Performance Trends */}
          <div className="lg:col-span-2 glass-card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Performance Trends</h3>
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            </div>

            <div className="space-y-3 lg:space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 text-center">
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Avg Opens/Day</p>
                  <p className="text-base lg:text-lg font-bold text-blue-600">
                    {Math.round(timeSeriesData.reduce((sum, d) => sum + d.opens, 0) / timeSeriesData.length)}
                  </p>
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Avg Clicks/Day</p>
                  <p className="text-base lg:text-lg font-bold text-green-600">
                    {Math.round(timeSeriesData.reduce((sum, d) => sum + d.clicks, 0) / timeSeriesData.length)}
                  </p>
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">Avg Replies/Day</p>
                  <p className="text-base lg:text-lg font-bold text-purple-600">
                    {Math.round(timeSeriesData.reduce((sum, d) => sum + d.replies, 0) / timeSeriesData.length)}
                  </p>
                </div>
                <div>
                  <p className="text-xs lg:text-sm text-gray-600">New Contacts/Day</p>
                  <p className="text-base lg:text-lg font-bold text-orange-600">
                    {Math.round(timeSeriesData.reduce((sum, d) => sum + d.newContacts, 0) / timeSeriesData.length)}
                  </p>
                </div>
              </div>

              {/* Simple Chart Visualization */}
              <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                <h4 className="text-sm lg:text-base font-medium text-gray-900 mb-2 lg:mb-3">7-Day Performance</h4>
                <div className="grid grid-cols-7 gap-1 lg:gap-2 h-24 lg:h-32">
                  {timeSeriesData.map((data, index) => (
                    <div key={index} className="flex flex-col justify-end items-center space-y-1">
                      <div className="w-full flex flex-col justify-end space-y-1 h-16 lg:h-24">
                        <div 
                          className="w-full bg-blue-500 rounded-sm"
                          style={{ height: `${(data.opens / 80) * 100}%` }}
                          title={`Opens: ${data.opens}`}
                        ></div>
                        <div 
                          className="w-full bg-green-500 rounded-sm"
                          style={{ height: `${(data.clicks / 80) * 100}%` }}
                          title={`Clicks: ${data.clicks}`}
                        ></div>
                        <div 
                          className="w-full bg-purple-500 rounded-sm"
                          style={{ height: `${(data.replies / 80) * 100}%` }}
                          title={`Replies: ${data.replies}`}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{data.date.split('-')[2]}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-2 lg:space-x-4 mt-2 lg:mt-3 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded"></div>
                    <span>Opens</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded"></div>
                    <span>Clicks</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 lg:w-3 lg:h-3 bg-purple-500 rounded"></div>
                    <span>Replies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Email Tracking */}
        <div className="glass-card p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Real-time Email Tracking</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs lg:text-sm text-gray-600">Live</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="space-y-2 lg:space-y-3">
              <h4 className="text-sm lg:text-base font-medium text-gray-900">Recent Opens</h4>
              <div className="space-y-1 lg:space-y-2 max-h-24 lg:max-h-32 overflow-y-auto">
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Sarah Chen - Global Freight</span>
                  <span className="text-gray-500 flex-shrink-0">2 min ago</span>
                </div>
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Michael Rodriguez - Ocean Logistics</span>
                  <span className="text-gray-500 flex-shrink-0">5 min ago</span>
                </div>
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Jennifer Kim - Pacific Textiles</span>
                  <span className="text-gray-500 flex-shrink-0">8 min ago</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 lg:space-y-3">
              <h4 className="text-sm lg:text-base font-medium text-gray-900">Recent Clicks</h4>
              <div className="space-y-1 lg:space-y-2 max-h-24 lg:max-h-32 overflow-y-auto">
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Case Study Link</span>
                  <span className="text-gray-500 flex-shrink-0">12 min ago</span>
                </div>
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Schedule Meeting</span>
                  <span className="text-gray-500 flex-shrink-0">18 min ago</span>
                </div>
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Pricing Information</span>
                  <span className="text-gray-500 flex-shrink-0">25 min ago</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 lg:space-y-3">
              <h4 className="text-sm lg:text-base font-medium text-gray-900">Recent Replies</h4>
              <div className="space-y-1 lg:space-y-2 max-h-24 lg:max-h-32 overflow-y-auto">
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">David Thompson</span>
                  <span className="text-green-600 flex-shrink-0">Interested</span>
                </div>
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Jennifer Kim</span>
                  <span className="text-blue-600 flex-shrink-0">Questions</span>
                </div>
                <div className="flex items-center justify-between text-xs lg:text-sm">
                  <span className="truncate pr-2">Sarah Chen</span>
                  <span className="text-orange-600 flex-shrink-0">Meeting Req</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}