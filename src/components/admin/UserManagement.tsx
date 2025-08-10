'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  Mail, 
  Calendar,
  Crown,
  CheckCircle,
  XCircle,
  Edit,
  Ban,
  RefreshCw
} from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  plan: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_login?: string
  api_calls_used?: number
  api_calls_limit?: number
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const { data, error, isLoading, mutate } = useSWR('/api/admin/users', fetcher)
  const users: User[] = data?.users || []

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesPlan = planFilter === 'all' || user.plan === planFilter
    
    return matchesSearch && matchesStatus && matchesPlan
  })

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return
    
    try {
      await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userIds: selectedUsers })
      })
      mutate()
      setSelectedUsers([])
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      mutate()
    } catch (error) {
      console.error('User action failed:', error)
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'free':
        return <span className="px-2 py-1 text-xs bg-muted/20 text-muted rounded-full">Free</span>
      case 'pro':
        return <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">Pro</span>
      case 'enterprise':
        return <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Enterprise
        </span>
      default:
        return <span className="px-2 py-1 text-xs bg-muted/20 text-muted rounded-full">Unknown</span>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'suspended':
        return <Ban className="w-4 h-4 text-danger" />
      default:
        return <XCircle className="w-4 h-4 text-muted" />
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-8 bg-surface rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink mb-2">Error Loading Users</h3>
          <p className="text-muted mb-4">Failed to load user data</p>
          <button onClick={() => mutate()} className="btn-primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="heading-lg">User Management</h1>
          <p className="text-muted">Manage user accounts, plans, and permissions</p>
        </div>
        <button className="btn-primary inline-flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Users</p>
              <p className="text-2xl font-bold text-ink">{users.length}</p>
            </div>
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Active Users</p>
              <p className="text-2xl font-bold text-success">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Pro Users</p>
              <p className="text-2xl font-bold text-primary">
                {users.filter(u => u.plan === 'pro').length}
              </p>
            </div>
            <Crown className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Enterprise</p>
              <p className="text-2xl font-bold text-accent">
                {users.filter(u => u.plan === 'enterprise').length}
              </p>
            </div>
            <Crown className="w-8 h-8 text-accent" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-4 py-2 bg-bg border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary font-medium">
                {selectedUsers.length} users selected
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBulkAction('suspend')}
                  className="btn-ghost text-sm px-3 py-1 text-danger hover:bg-danger/10"
                >
                  Suspend
                </button>
                <button 
                  onClick={() => handleBulkAction('activate')}
                  className="btn-ghost text-sm px-3 py-1 text-success hover:bg-success/10"
                >
                  Activate
                </button>
                <button 
                  onClick={() => setSelectedUsers([])}
                  className="btn-ghost text-sm px-3 py-1"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="py-4 px-6">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id))
                      } else {
                        setSelectedUsers([])
                      }
                    }}
                  />
                </th>
                <th className="py-4 px-6 text-sm font-medium text-muted">User</th>
                <th className="py-4 px-6 text-sm font-medium text-muted">Plan</th>
                <th className="py-4 px-6 text-sm font-medium text-muted">Status</th>
                <th className="py-4 px-6 text-sm font-medium text-muted">API Usage</th>
                <th className="py-4 px-6 text-sm font-medium text-muted">Last Login</th>
                <th className="py-4 px-6 text-sm font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-4 px-6">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id])
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                        }
                      }}
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-ink">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-ink">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{getPlanBadge(user.plan)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <span className="text-sm capitalize text-ink">{user.status}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-ink">
                        {user.api_calls_used || 0} / {user.api_calls_limit || '∞'}
                      </div>
                      <div className="w-full bg-surface rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${Math.min((user.api_calls_used || 0) / (user.api_calls_limit || 1) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'edit')}
                        className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                        className={`p-2 hover:bg-surface rounded-lg transition-colors ${
                          user.status === 'active' ? 'text-danger hover:text-danger' : 'text-success hover:text-success'
                        }`}
                      >
                        {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button className="p-2 text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-muted">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}