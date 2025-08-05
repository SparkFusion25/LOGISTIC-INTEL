'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  HeadphonesIcon,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import StatsCard from '@/components/charts/StatsCard'
import UsageChart, { createDoughnutChartData, createBarChartData } from '@/components/charts/UsageChart'
import { mockData } from '@/lib/supabase'
import { FeedbackItem } from '@/types/admin'
import { format } from 'date-fns'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)

  useEffect(() => {
    loadFeedback()
  }, [])

  const loadFeedback = async () => {
    try {
      setLoading(true)
      // Generate more mock feedback data
      const baseFeedback = mockData.getFeedback()
      const expandedFeedback = [
        ...baseFeedback,
        {
          id: '3',
          user_id: '3',
          user_email: 'mike@logistics.com',
          type: 'support' as const,
          title: 'Unable to access tariff calculator',
          description: 'Getting a 403 error when trying to access the tariff calculator widget. This started happening after the latest update.',
          status: 'new' as const,
          priority: 'high' as const,
          assigned_to: null,
          created_at: '2024-01-20T14:30:00Z',
          updated_at: '2024-01-20T14:30:00Z'
        },
        {
          id: '4',
          user_id: '1',
          user_email: 'john@acme.com',
          type: 'feature_request' as const,
          title: 'Bulk campaign import',
          description: 'Would love to be able to import multiple campaigns from a CSV file instead of creating them one by one.',
          status: 'in_progress' as const,
          priority: 'medium' as const,
          assigned_to: 'product-team',
          created_at: '2024-01-17T11:20:00Z',
          updated_at: '2024-01-19T09:15:00Z'
        },
        {
          id: '5',
          user_id: '2',
          user_email: 'sarah@globaltrade.com',
          type: 'feedback' as const,
          title: 'Great new dashboard design',
          description: 'The new dashboard looks amazing! Much easier to navigate and find what I need. Keep up the great work.',
          status: 'resolved' as const,
          priority: 'low' as const,
          assigned_to: 'design-team',
          created_at: '2024-01-16T16:45:00Z',
          updated_at: '2024-01-18T10:30:00Z'
        }
      ]
      setFeedback(expandedFeedback)
    } catch (error) {
      console.error('Failed to load feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (item: FeedbackItem) => {
    setSelectedItem(item)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = async (itemId: string, newStatus: 'new' | 'in_progress' | 'resolved' | 'closed') => {
    try {
      setFeedback(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
          : item
      ))
      alert('Status updated successfully')
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleAssignToTeam = async (itemId: string, team: string) => {
    try {
      setFeedback(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, assigned_to: team, updated_at: new Date().toISOString() }
          : item
      ))
      alert('Ticket assigned successfully')
    } catch (error) {
      console.error('Failed to assign ticket:', error)
    }
  }

  // Filter feedback
  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
    return matchesSearch && matchesType && matchesStatus && matchesPriority
  })

  // Calculate stats
  const totalItems = feedback.length
  const newItems = feedback.filter(i => i.status === 'new').length
  const inProgressItems = feedback.filter(i => i.status === 'in_progress').length
  const resolvedItems = feedback.filter(i => i.status === 'resolved').length
  const highPriorityItems = feedback.filter(i => i.priority === 'high' || i.priority === 'urgent').length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return Bug
      case 'feature_request': return Lightbulb
      case 'support': return HeadphonesIcon
      case 'feedback': return MessageSquare
      default: return MessageSquare
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'text-red-600'
      case 'feature_request': return 'text-blue-600'
      case 'support': return 'text-orange-600'
      case 'feedback': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-800'
      case 'feature_request': return 'bg-blue-100 text-blue-800'
      case 'support': return 'bg-orange-100 text-orange-800'
      case 'feedback': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Chart data
  const typeDistributionData = createDoughnutChartData(
    ['Bug Reports', 'Feature Requests', 'Support', 'Feedback'],
    [
      feedback.filter(i => i.type === 'bug').length,
      feedback.filter(i => i.type === 'feature_request').length,
      feedback.filter(i => i.type === 'support').length,
      feedback.filter(i => i.type === 'feedback').length,
    ]
  )

  const statusDistributionData = createBarChartData(
    ['New', 'In Progress', 'Resolved', 'Closed'],
    [
      {
        label: 'Count',
        data: [
          feedback.filter(i => i.status === 'new').length,
          feedback.filter(i => i.status === 'in_progress').length,
          feedback.filter(i => i.status === 'resolved').length,
          feedback.filter(i => i.status === 'closed').length,
        ],
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
            <h1 className="text-3xl font-bold text-gray-900">Feedback & Bug Tracker</h1>
            <p className="text-gray-600 mt-1">Manage user feedback, bug reports, and feature requests</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="admin-button-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tickets"
            value={totalItems}
            icon={MessageSquare}
            color="blue"
          />
          <StatsCard
            title="New Tickets"
            value={newItems}
            subtitle="Require attention"
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="In Progress"
            value={inProgressItems}
            subtitle="Being worked on"
            icon={Edit}
            color="yellow"
          />
          <StatsCard
            title="High Priority"
            value={highPriorityItems}
            subtitle="Urgent items"
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart
            type="doughnut"
            title="Ticket Type Distribution"
            data={typeDistributionData}
            height={300}
          />
          <UsageChart
            type="bar"
            title="Status Distribution"
            data={statusDistributionData}
            height={300}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="admin-input"
          >
            <option value="all">All Types</option>
            <option value="bug">Bug Reports</option>
            <option value="feature_request">Feature Requests</option>
            <option value="support">Support</option>
            <option value="feedback">Feedback</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="admin-input"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            {filteredFeedback.length} of {totalItems} tickets
          </div>
        </div>

        {/* Tickets Table */}
        <div className="admin-card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((item) => {
                  const TypeIcon = getTypeIcon(item.type)
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {item.description.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className={`h-4 w-4 ${getTypeColor(item.type)}`} />
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(item.type)}`}>
                            {item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.user_email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(item.priority)}`}>
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
                          {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      <td>
                        {item.assigned_to ? (
                          <span className="text-sm text-gray-900">{item.assigned_to}</span>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div className="text-sm text-gray-900">
                          {format(new Date(item.created_at), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {item.status === 'new' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'in_progress')}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="Start Working"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {item.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'resolved')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark Resolved"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">No tickets found matching your criteria</div>
            </div>
          )}
        </div>

        {/* Ticket Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Ticket Details</h3>
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
                      Title
                    </label>
                    <div className="text-sm text-gray-900 font-medium">{selectedItem.title}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(selectedItem.type)}`}>
                      {selectedItem.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User
                    </label>
                    <div className="text-sm text-gray-900">{selectedItem.user_email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(selectedItem.priority)}`}>
                      {selectedItem.priority.charAt(0).toUpperCase() + selectedItem.priority.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedItem.status)}`}>
                      {selectedItem.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedItem.assigned_to || 'Unassigned'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {selectedItem.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <div className="text-sm text-gray-900">
                      {format(new Date(selectedItem.created_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <div className="text-sm text-gray-900">
                      {format(new Date(selectedItem.updated_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.status === 'new' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedItem.id, 'in_progress')
                          setShowDetailsModal(false)
                        }}
                        className="admin-button-primary text-sm"
                      >
                        Start Working
                      </button>
                    )}
                    {selectedItem.status === 'in_progress' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedItem.id, 'resolved')
                          setShowDetailsModal(false)
                        }}
                        className="admin-button-primary text-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {!selectedItem.assigned_to && (
                      <>
                        <button
                          onClick={() => {
                            handleAssignToTeam(selectedItem.id, 'dev-team')
                            setShowDetailsModal(false)
                          }}
                          className="admin-button-secondary text-sm"
                        >
                          Assign to Dev Team
                        </button>
                        <button
                          onClick={() => {
                            handleAssignToTeam(selectedItem.id, 'support-team')
                            setShowDetailsModal(false)
                          }}
                          className="admin-button-secondary text-sm"
                        >
                          Assign to Support
                        </button>
                      </>
                    )}
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

        {/* New Ticket Modal */}
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Ticket</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Enter ticket title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select className="admin-input">
                    <option value="bug">Bug Report</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="support">Support</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select className="admin-input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    placeholder="Describe the issue or request"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNewTicketModal(false)}
                  className="admin-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would create the ticket
                    setShowNewTicketModal(false)
                    alert('Ticket created successfully')
                  }}
                  className="admin-button-primary"
                >
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}