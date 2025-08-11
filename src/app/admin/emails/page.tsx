'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  ExternalLink,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import StatsCard from '@/components/charts/StatsCard'
import UsageChart, { createLineChartData, createDoughnutChartData } from '@/components/charts/UsageChart'
import { mockData } from '@/lib/mockData'
import { EmailActivity } from '@/types/admin'
import { format } from 'date-fns'

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [selectedEmail, setSelectedEmail] = useState<EmailActivity | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    try {
      setLoading(true)
      // Generate more mock email data for demo
      const baseEmails = mockData.getEmailActivity()
      const expandedEmails = [
        ...baseEmails,
        // Add more mock data
        {
          id: '3',
          user_id: '3',
          user_email: 'mike@logistics.com',
          campaign_id: '1',
          campaign_name: 'Q1 Outreach Campaign',
          subject: 'Freight Solutions Partnership',
          recipient: 'director@shippingco.com',
          status: 'sent' as const,
          timestamp: '2024-01-20T08:15:00Z',
          domain: 'shippingco.com'
        },
        {
          id: '4',
          user_id: '1',
          user_email: 'john@acme.com',
          campaign_id: '1',
          campaign_name: 'Q1 Outreach Campaign',
          subject: 'Partnership Opportunity in Logistics',
          recipient: 'ceo@tradehub.com',
          status: 'bounced' as const,
          timestamp: '2024-01-19T16:30:00Z',
          domain: 'tradehub.com'
        },
        {
          id: '5',
          user_id: '2',
          user_email: 'sarah@globaltrade.com',
          campaign_id: '2',
          campaign_name: 'LinkedIn Outreach',
          subject: 'Trade Intelligence Solutions',
          recipient: 'ops@cargomaster.com',
          status: 'delivered' as const,
          timestamp: '2024-01-18T11:20:00Z',
          domain: 'cargomaster.com'
        }
      ]
      setEmails(expandedEmails)
    } catch (error) {
      console.error('Failed to load emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (email: EmailActivity) => {
    setSelectedEmail(email)
    setShowDetailsModal(true)
  }

  const handleExportEmails = () => {
    const csvContent = [
      ['User', 'Campaign', 'Subject', 'Recipient', 'Status', 'Timestamp', 'Domain'].join(','),
      ...filteredEmails.map(email => [
        email.user_email,
        email.campaign_name,
        email.subject,
        email.recipient,
        email.status,
        email.timestamp,
        email.domain
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-activity-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter emails
  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.campaign_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || email.status === statusFilter
    const matchesDomain = domainFilter === 'all' || email.domain === domainFilter
    
    let matchesDate = true
    if (dateFilter !== 'all') {
      const emailDate = new Date(email.timestamp)
      const now = new Date()
      switch (dateFilter) {
        case 'today':
          matchesDate = emailDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = emailDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = emailDate >= monthAgo
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesDomain && matchesDate
  })

  // Calculate stats
  const totalEmails = emails.length
  const sentEmails = emails.filter(e => e.status === 'sent' || e.status === 'delivered' || e.status === 'opened' || e.status === 'clicked').length
  const openedEmails = emails.filter(e => e.status === 'opened' || e.status === 'clicked').length
  const bouncedEmails = emails.filter(e => e.status === 'bounced' || e.status === 'failed').length
  const openRate = sentEmails > 0 ? (openedEmails / sentEmails) * 100 : 0

  // Get unique domains for filter
  const uniqueDomains = Array.from(new Set(emails.map(email => email.domain)))

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'opened': return 'bg-purple-100 text-purple-800'
      case 'clicked': return 'bg-orange-100 text-orange-800'
      case 'bounced': return 'bg-red-100 text-red-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return Mail
      case 'delivered': return CheckCircle
      case 'opened': return Eye
      case 'clicked': return ExternalLink
      case 'bounced': return XCircle
      case 'failed': return AlertTriangle
      default: return Mail
    }
  }

  // Chart data
  const emailStatusData = createDoughnutChartData(
    ['Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Failed'],
    [
      emails.filter(e => e.status === 'sent').length,
      emails.filter(e => e.status === 'delivered').length,
      emails.filter(e => e.status === 'opened').length,
      emails.filter(e => e.status === 'clicked').length,
      emails.filter(e => e.status === 'bounced').length,
      emails.filter(e => e.status === 'failed').length,
    ]
  )

  // Mock daily email volume data
  const emailVolumeData = createLineChartData(
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    [
      {
        label: 'Emails Sent',
        data: [120, 145, 180, 165, 190, 85, 45],
      },
      {
        label: 'Emails Opened',
        data: [35, 42, 52, 48, 58, 25, 12],
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
            <h1 className="text-3xl font-bold text-gray-900">Email Activity Feed</h1>
            <p className="text-gray-600 mt-1">Track all email communications and campaign performance</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadEmails}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportEmails}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Emails"
            value={totalEmails}
            icon={Mail}
            color="blue"
          />
          <StatsCard
            title="Successfully Sent"
            value={sentEmails}
            subtitle={`${Math.round((sentEmails / totalEmails) * 100)}% of total`}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Open Rate"
            value={`${openRate.toFixed(1)}%`}
            icon={Eye}
            trend={{ value: 2.3, label: 'vs last week', isPositive: true }}
            color="purple"
          />
          <StatsCard
            title="Bounced/Failed"
            value={bouncedEmails}
            subtitle={`${Math.round((bouncedEmails / totalEmails) * 100)}% of total`}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="line"
            title="Email Volume Over Time"
            data={emailVolumeData}
            height={300}
          />
          <UsageChart
            type="doughnut"
            title="Email Status Distribution"
            data={emailStatusData}
            height={300}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="opened">Opened</option>
            <option value="clicked">Clicked</option>
            <option value="bounced">Bounced</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="admin-input"
          >
            <option value="all">All Domains</option>
            {uniqueDomains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="admin-input"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {filteredEmails.length} of {totalEmails} emails
          </div>
        </div>

        {/* Email Activity Table */}
        <div className="admin-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email Details</th>
                  <th>Campaign</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.map((email) => {
                  const StatusIcon = getStatusIcon(email.status)
                  
                  return (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{email.subject}</div>
                          <div className="text-sm text-gray-500">
                            To: {email.recipient}
                          </div>
                          <div className="text-xs text-gray-400">
                            Domain: {email.domain}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">{email.campaign_name}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">{email.user_email}</div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${
                            ['opened', 'clicked', 'delivered'].includes(email.status) ? 'text-green-500' :
                            ['sent'].includes(email.status) ? 'text-blue-500' :
                            'text-red-500'
                          }`} />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(email.status)}`}>
                            {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          {format(new Date(email.timestamp), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(email.timestamp), 'HH:mm')}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewDetails(email)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredEmails.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No emails found matching your criteria</div>
            </div>
          )}
        </div>

        {/* Email Details Modal */}
        {showDetailsModal && selectedEmail && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Email Details</h3>
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
                      Subject
                    </label>
                    <div className="text-sm text-gray-900">{selectedEmail.subject}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedEmail.status)}`}>
                      {selectedEmail.status.charAt(0).toUpperCase() + selectedEmail.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient
                    </label>
                    <div className="text-sm text-gray-900">{selectedEmail.recipient}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domain
                    </label>
                    <div className="text-sm text-gray-900">{selectedEmail.domain}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign
                    </label>
                    <div className="text-sm text-gray-900">{selectedEmail.campaign_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User
                    </label>
                    <div className="text-sm text-gray-900">{selectedEmail.user_email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sent At
                    </label>
                    <div className="text-sm text-gray-900">
                      {format(new Date(selectedEmail.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email ID
                    </label>
                    <div className="text-sm text-gray-900 font-mono">{selectedEmail.id}</div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Tracking Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Campaign ID:</span>
                        <span className="font-mono">{selectedEmail.campaign_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-mono">{selectedEmail.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Status:</span>
                        <span className={`font-medium ${
                          ['delivered', 'opened', 'clicked'].includes(selectedEmail.status) ? 'text-green-600' :
                          ['sent'].includes(selectedEmail.status) ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {selectedEmail.status === 'delivered' ? 'Successfully Delivered' :
                           selectedEmail.status === 'opened' ? 'Opened by Recipient' :
                           selectedEmail.status === 'clicked' ? 'Links Clicked' :
                           selectedEmail.status === 'sent' ? 'Sent Successfully' :
                           selectedEmail.status === 'bounced' ? 'Bounced - Invalid Address' :
                           'Failed to Send'}
                        </span>
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}