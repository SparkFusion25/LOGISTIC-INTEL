'use client'

import { useState, useEffect } from 'react'
import { Plus, Download, Upload, RefreshCw } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import UserTable from '@/components/UserManagement/UserTable'
import StatsCard from '@/components/charts/StatsCard'
import { mockData } from '@/lib/supabase'
import { User } from '@/types/admin'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // In a real app, this would be an API call
      const usersData = mockData.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadUsers()
    setRefreshing(false)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // In a real app, this would be an API call
        setUsers(prev => prev.filter(user => user.id !== userId))
        alert('User deleted successfully')
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const handleImpersonateUser = async (userId: string) => {
    if (confirm('Are you sure you want to impersonate this user? You will be logged in as them.')) {
      try {
        // In a real app, this would create an impersonation session
        alert('Impersonation feature would be implemented here')
      } catch (error) {
        console.error('Failed to impersonate user:', error)
        alert('Failed to impersonate user')
      }
    }
  }

  const handleUpdateUserPlan = async (userId: string, plan: 'trial' | 'pro' | 'enterprise') => {
    try {
      // In a real app, this would be an API call
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: plan } : user
      ))
      alert(`User plan updated to ${plan}`)
    } catch (error) {
      console.error('Failed to update user plan:', error)
      alert('Failed to update user plan')
    }
  }

  const handleExportUsers = () => {
    // Convert users to CSV
    const csvContent = [
      ['Email', 'Company', 'Role', 'Status', 'Signup Date', 'Last Login', 'Usage Count'].join(','),
      ...users.map(user => [
        user.email,
        user.company,
        user.role,
        user.plan_status,
        user.signup_date,
        user.last_login,
        user.usage_count
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.plan_status === 'active').length
  const enterpriseUsers = users.filter(user => user.role === 'enterprise').length
  const avgUsage = users.reduce((sum, user) => sum + user.usage_count, 0) / users.length

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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage platform users, roles, and permissions</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportUsers}
              className="admin-button-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button className="admin-button-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={totalUsers}
            icon={Plus}
            color="blue"
          />
          <StatsCard
            title="Active Users"
            value={activeUsers}
            subtitle={`${Math.round((activeUsers / totalUsers) * 100)}% of total`}
            icon={Plus}
            color="green"
          />
          <StatsCard
            title="Enterprise Users"
            value={enterpriseUsers}
            subtitle={`${Math.round((enterpriseUsers / totalUsers) * 100)}% of total`}
            icon={Plus}
            color="purple"
          />
          <StatsCard
            title="Avg Usage"
            value={Math.round(avgUsage)}
            subtitle="per user"
            icon={Plus}
            color="orange"
          />
        </div>

        {/* User Table */}
        <UserTable
          users={users}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onImpersonateUser={handleImpersonateUser}
          onUpdateUserPlan={handleUpdateUserPlan}
        />

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editingUser.company}
                    onChange={(e) => setEditingUser({ ...editingUser, company: e.target.value })}
                    className="admin-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="admin-input"
                  >
                    <option value="trial">Trial</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingUser.plan_status}
                    onChange={(e) => setEditingUser({ ...editingUser, plan_status: e.target.value as any })}
                    className="admin-input"
                  >
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="admin-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would save to API
                    setUsers(prev => prev.map(user => 
                      user.id === editingUser.id ? editingUser : user
                    ))
                    setShowEditModal(false)
                    alert('User updated successfully')
                  }}
                  className="admin-button-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}