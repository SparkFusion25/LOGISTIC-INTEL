'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  Play, 
  Pause, 
  Square, 
  BarChart3, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import StatsCard from '@/components/charts/StatsCard'
import UsageChart, { createLineChartData, createBarChartData } from '@/components/charts/UsageChart'
import { mockData } from '@/lib/supabase'
import { Campaign } from '@/types/admin'
import { format } from 'date-fns'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const campaignsData = mockData.getCampaigns()
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: 'paused' as const }
          : campaign
      ))
      alert('Campaign paused successfully')
    } catch (error) {
      console.error('Failed to pause campaign:', error)
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId))
        alert('Campaign deleted successfully')
      } catch (error) {
        console.error('Failed to delete campaign:', error)
      }
    }
  }

  const handleViewDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowDetailsModal(true)
  }

  const handleExportCampaigns = () => {
    const csvContent = [
      ['Name', 'User', 'Company', 'Type', 'Status', 'Created', 'Sent', 'Opened', 'Clicked', 'Replied'].join(','),
      ...filteredCampaigns.map(campaign => [
        campaign.name,
        campaign.user_email,
        campaign.company,
        campaign.type,
        campaign.status,
        campaign.created_at,
        campaign.metrics.sent,
        campaign.metrics.opened,
        campaign.metrics.clicked,
        campaign.metrics.replied
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate stats
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.sent, 0)
  const totalOpened = campaigns.reduce((sum, c) => sum + c.metrics.opened, 0)
  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'linkedin': return 'bg-purple-100 text-purple-800'
      case 'mixed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Chart data
  const campaignPerformanceData = createBarChartData(
    filteredCampaigns.slice(0, 5).map(c => c.name.substring(0, 10) + '...'),
    [
      {
        label: 'Sent',
        data: filteredCampaigns.slice(0, 5).map(c => c.metrics.sent),
      },
      {
        label: 'Opened',
        data: filteredCampaigns.slice(0, 5).map(c => c.metrics.opened),
      },
      {
        label: 'Replied',
        data: filteredCampaigns.slice(0, 5).map(c => c.metrics.replied),
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
            <h1 className="text-3xl font-bold text-gray-900">Campaign Monitor</h1>
            <p className="text-gray-600 mt-1">Monitor and manage user campaigns across the platform</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadCampaigns}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCampaigns}
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
            title="Total Campaigns"
            value={totalCampaigns}
            icon={Mail}
            color="blue"
          />
          <StatsCard
            title="Active Campaigns"
            value={activeCampaigns}
            subtitle={`${Math.round((activeCampaigns / totalCampaigns) * 100)}% of total`}
            icon={Play}
            color="green"
          />
          <StatsCard
            title="Total Emails Sent"
            value={totalSent}
            icon={BarChart3}
            color="purple"
          />
          <StatsCard
            title="Avg Open Rate"
            value={`${avgOpenRate.toFixed(1)}%`}
            icon={Eye}
            color="orange"
          />
        </div>

        {/* Campaign Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="bar"
            title="Top 5 Campaign Performance"
            data={campaignPerformanceData}
            height={300}
          />
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Status Distribution</h3>
            <div className="space-y-3">
              {['active', 'paused', 'completed', 'cancelled'].map(status => {
                const count = campaigns.filter(c => c.status === status).length
                const percentage = (count / totalCampaigns) * 100
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">{count} campaigns</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{percentage.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search campaigns, users, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10"
            />
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="admin-input"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="linkedin">LinkedIn</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="admin-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Performance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{campaign.user_email}</div>
                        <div className="text-sm text-gray-500">{campaign.company}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(campaign.type)}`}>
                        {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">
                        {format(new Date(campaign.created_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Sent:</span>
                          <span className="font-medium">{campaign.metrics.sent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Opened:</span>
                          <span className="font-medium">{campaign.metrics.opened}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Replied:</span>
                          <span className="font-medium">{campaign.metrics.replied}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Open Rate: {campaign.metrics.sent > 0 ? ((campaign.metrics.opened / campaign.metrics.sent) * 100).toFixed(1) : 0}%
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(campaign)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {campaign.status === 'active' && (
                          <button
                            onClick={() => handlePauseCampaign(campaign.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Pause Campaign"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No campaigns found matching your criteria</div>
            </div>
          )}
        </div>

        {/* Campaign Details Modal */}
        {showDetailsModal && selectedCampaign && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Campaign Details</h3>
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
                      Campaign Name
                    </label>
                    <div className="text-sm text-gray-900">{selectedCampaign.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedCampaign.status)}`}>
                      {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User
                    </label>
                    <div className="text-sm text-gray-900">{selectedCampaign.user_email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <div className="text-sm text-gray-900">{selectedCampaign.company}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="text-sm text-gray-900">{selectedCampaign.description}</div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Sent:</span>
                        <span className="text-sm font-medium">{selectedCampaign.metrics.sent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Opened:</span>
                        <span className="text-sm font-medium">{selectedCampaign.metrics.opened}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Clicked:</span>
                        <span className="text-sm font-medium">{selectedCampaign.metrics.clicked}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Replied:</span>
                        <span className="text-sm font-medium">{selectedCampaign.metrics.replied}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bounced:</span>
                        <span className="text-sm font-medium">{selectedCampaign.metrics.bounced}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Campaign Info</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium">{selectedCampaign.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Steps:</span>
                        <span className="text-sm font-medium">{selectedCampaign.total_steps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium">
                          {format(new Date(selectedCampaign.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Open Rate:</span>
                        <span className="text-sm font-medium">
                          {selectedCampaign.metrics.sent > 0 ? ((selectedCampaign.metrics.opened / selectedCampaign.metrics.sent) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reply Rate:</span>
                        <span className="text-sm font-medium">
                          {selectedCampaign.metrics.sent > 0 ? ((selectedCampaign.metrics.replied / selectedCampaign.metrics.sent) * 100).toFixed(1) : 0}%
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
                  {selectedCampaign.status === 'active' && (
                    <button
                      onClick={() => {
                        handlePauseCampaign(selectedCampaign.id)
                        setShowDetailsModal(false)
                      }}
                      className="admin-button-danger"
                    >
                      Pause Campaign
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}