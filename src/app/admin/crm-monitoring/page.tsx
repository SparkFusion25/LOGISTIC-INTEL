'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Activity, 
  Calendar,
  Eye,
  MousePointer,
  MessageCircle,
  RefreshCw,
  Filter,
  Download,
  Search,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'

interface CRMUser {
  id: string
  name: string
  email: string
  company: string
  lastActivity: string
  campaignsActive: number
  emailsSent: number
  openRate: number
  replyRate: number
  status: 'active' | 'inactive' | 'trial'
}

interface CampaignPerformance {
  id: string
  name: string
  user: string
  type: 'email' | 'linkedin' | 'mixed'
  sent: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  status: 'active' | 'paused' | 'completed'
  createdAt: string
}

interface EmailActivity {
  id: string
  subject: string
  recipient: string
  sender: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced'
  timestamp: string
  campaign?: string
}

export default function CRMMonitoring() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('7d')
  
  const [crmStats] = useState({
    totalUsers: 143,
    activeCampaigns: 89,
    emailsSentToday: 2847,
    avgOpenRate: 24.3,
    avgReplyRate: 3.8,
    totalContacts: 15420
  })

  const [crmUsers] = useState<CRMUser[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah@globaltrade.com',
      company: 'Global Trade Inc',
      lastActivity: '2 hours ago',
      campaignsActive: 3,
      emailsSent: 156,
      openRate: 28.5,
      replyRate: 4.2,
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'mike@logistics.com',
      company: 'Logistics Pro',
      lastActivity: '5 hours ago',
      campaignsActive: 2,
      emailsSent: 89,
      openRate: 22.1,
      replyRate: 3.1,
      status: 'active'
    },
    {
      id: '3',
      name: 'Jennifer Walsh',
      email: 'jen@maritime.com',
      company: 'Maritime Solutions',
      lastActivity: '1 day ago',
      campaignsActive: 1,
      emailsSent: 45,
      openRate: 31.2,
      replyRate: 5.5,
      status: 'trial'
    }
  ])

  const [topCampaigns] = useState<CampaignPerformance[]>([
    {
      id: '1',
      name: 'Q1 European Prospects',
      user: 'Sarah Chen',
      type: 'email',
      sent: 450,
      opened: 128,
      clicked: 34,
      replied: 12,
      bounced: 8,
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Asia Pacific Outreach',
      user: 'Michael Rodriguez',
      type: 'mixed',
      sent: 320,
      opened: 89,
      clicked: 23,
      replied: 8,
      bounced: 5,
      status: 'active',
      createdAt: '2024-01-18'
    },
    {
      id: '3',
      name: 'US Freight Forwarders',
      user: 'Jennifer Walsh',
      type: 'linkedin',
      sent: 180,
      opened: 67,
      clicked: 15,
      replied: 6,
      bounced: 2,
      status: 'paused',
      createdAt: '2024-01-20'
    }
  ])

  const [recentEmails] = useState<EmailActivity[]>([
    {
      id: '1',
      subject: 'Freight Rate Inquiry - Urgent',
      recipient: 'john@acme.com',
      sender: 'sarah@globaltrade.com',
      status: 'replied',
      timestamp: '10 minutes ago',
      campaign: 'Q1 European Prospects'
    },
    {
      id: '2',
      subject: 'Market Insights Report',
      recipient: 'mary@logistics.net',
      sender: 'mike@logistics.com',
      status: 'opened',
      timestamp: '25 minutes ago',
      campaign: 'Asia Pacific Outreach'
    },
    {
      id: '3',
      subject: 'Partnership Opportunity',
      recipient: 'david@shipping.co',
      sender: 'jen@maritime.com',
      status: 'clicked',
      timestamp: '1 hour ago',
      campaign: 'US Freight Forwarders'
    }
  ])

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success'
      case 'inactive': return 'badge-error'
      case 'trial': return 'badge-warning'
      case 'paused': return 'badge-warning'
      case 'completed': return 'badge-info'
      case 'sent': return 'badge-info'
      case 'delivered': return 'badge-success'
      case 'opened': return 'badge-success'
      case 'clicked': return 'badge-success'
      case 'replied': return 'badge-success'
      case 'bounced': return 'badge-error'
      default: return 'badge-info'
    }
  }

  const getEmailStatusIcon = (status: string) => {
    switch (status) {
      case 'opened': return <Eye className="w-4 h-4" />
      case 'clicked': return <MousePointer className="w-4 h-4" />
      case 'replied': return <MessageCircle className="w-4 h-4" />
      case 'bounced': return <AlertCircle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

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
        {/* Page Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">CRM Monitoring</h1>
              <p className="page-subtitle">
                Track user activity, campaign performance, and email engagement across the platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="form-input py-2"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="btn-secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="btn-primary">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* CRM Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="stats-card">
            <div className="stats-card-icon bg-blue-500">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="stats-card-value">{crmStats.totalUsers}</div>
            <div className="stats-card-label">Active Users</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-icon bg-green-500">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="stats-card-value">{crmStats.activeCampaigns}</div>
            <div className="stats-card-label">Active Campaigns</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-icon bg-purple-500">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="stats-card-value">{crmStats.emailsSentToday.toLocaleString()}</div>
            <div className="stats-card-label">Emails Today</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-icon bg-orange-500">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div className="stats-card-value">{crmStats.avgOpenRate}%</div>
            <div className="stats-card-label">Avg Open Rate</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-icon bg-teal-500">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="stats-card-value">{crmStats.avgReplyRate}%</div>
            <div className="stats-card-label">Avg Reply Rate</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-icon bg-indigo-500">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="stats-card-value">{crmStats.totalContacts.toLocaleString()}</div>
            <div className="stats-card-label">Total Contacts</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'users', name: 'User Activity', icon: Users },
                { id: 'campaigns', name: 'Top Campaigns', icon: TrendingUp },
                { id: 'emails', name: 'Email Activity', icon: Mail }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="form-input pl-10 py-2"
                      />
                    </div>
                    <button className="btn-secondary">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                <div className="data-table">
                  <div className="table-header">
                    <div className="grid grid-cols-7 gap-4">
                      <div className="font-semibold text-gray-900">User</div>
                      <div className="font-semibold text-gray-900">Company</div>
                      <div className="font-semibold text-gray-900">Last Activity</div>
                      <div className="font-semibold text-gray-900">Campaigns</div>
                      <div className="font-semibold text-gray-900">Emails Sent</div>
                      <div className="font-semibold text-gray-900">Open Rate</div>
                      <div className="font-semibold text-gray-900">Status</div>
                    </div>
                  </div>
                  {crmUsers.map((user) => (
                    <div key={user.id} className="table-row">
                      <div className="table-cell grid grid-cols-7 gap-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="table-cell">{user.company}</div>
                        <div className="table-cell">{user.lastActivity}</div>
                        <div className="table-cell">{user.campaignsActive}</div>
                        <div className="table-cell">{user.emailsSent}</div>
                        <div className="table-cell">{user.openRate}%</div>
                        <div className="table-cell">
                          <span className={`badge ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
                
                <div className="data-table">
                  <div className="table-header">
                    <div className="grid grid-cols-8 gap-4">
                      <div className="font-semibold text-gray-900">Campaign</div>
                      <div className="font-semibold text-gray-900">User</div>
                      <div className="font-semibold text-gray-900">Type</div>
                      <div className="font-semibold text-gray-900">Sent</div>
                      <div className="font-semibold text-gray-900">Opened</div>
                      <div className="font-semibold text-gray-900">Clicked</div>
                      <div className="font-semibold text-gray-900">Replied</div>
                      <div className="font-semibold text-gray-900">Status</div>
                    </div>
                  </div>
                  {topCampaigns.map((campaign) => (
                    <div key={campaign.id} className="table-row">
                      <div className="table-cell grid grid-cols-8 gap-4">
                        <div>
                          <div className="font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.createdAt}</div>
                        </div>
                        <div className="table-cell">{campaign.user}</div>
                        <div className="table-cell">
                          <span className={`badge badge-info`}>
                            {campaign.type}
                          </span>
                        </div>
                        <div className="table-cell">{campaign.sent}</div>
                        <div className="table-cell">{campaign.opened}</div>
                        <div className="table-cell">{campaign.clicked}</div>
                        <div className="table-cell">{campaign.replied}</div>
                        <div className="table-cell">
                          <span className={`badge ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'emails' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Email Activity</h3>
                
                <div className="data-table">
                  <div className="table-header">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="font-semibold text-gray-900">Subject</div>
                      <div className="font-semibold text-gray-900">Recipient</div>
                      <div className="font-semibold text-gray-900">Sender</div>
                      <div className="font-semibold text-gray-900">Campaign</div>
                      <div className="font-semibold text-gray-900">Status</div>
                      <div className="font-semibold text-gray-900">Time</div>
                    </div>
                  </div>
                  {recentEmails.map((email) => (
                    <div key={email.id} className="table-row">
                      <div className="table-cell grid grid-cols-6 gap-4">
                        <div className="table-cell font-medium text-gray-900">{email.subject}</div>
                        <div className="table-cell">{email.recipient}</div>
                        <div className="table-cell">{email.sender}</div>
                        <div className="table-cell">{email.campaign || '-'}</div>
                        <div className="table-cell">
                          <div className="flex items-center space-x-2">
                            {getEmailStatusIcon(email.status)}
                            <span className={`badge ${getStatusColor(email.status)}`}>
                              {email.status}
                            </span>
                          </div>
                        </div>
                        <div className="table-cell">{email.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Performance Trends</h3>
                  <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Email Engagement Over Time</h3>
                  <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}