'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Linkedin, 
  MapPin, 
  Building, 
  Calendar,
  Activity,
  Eye,
  Edit,
  Star,
  MessageSquare,
  Globe,
  ExternalLink,
  PlayCircle,
  Import
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  company: string
  position: string
  phone?: string
  linkedin?: string
  location: string
  industry: string
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'customer'
  source: 'manual' | 'phantombuster' | 'import' | 'web'
  lastContact: string
  addedDate: string
  tags: string[]
  notes: string
  avatar?: string
}

interface Activity {
  id: string
  contactId: string
  type: 'email' | 'call' | 'linkedin' | 'meeting' | 'note'
  description: string
  date: string
  status: 'completed' | 'scheduled' | 'failed'
}

interface PhantomBusterJob {
  id: string
  name: string
  type: 'linkedin_search' | 'linkedin_scraper' | 'email_finder'
  status: 'running' | 'completed' | 'failed' | 'pending'
  progress: number
  results: number
  startTime: string
}

export default function CRMManager() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [phantomJobs, setPhantomJobs] = useState<PhantomBusterJob[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddContact, setShowAddContact] = useState(false)
  const [showPhantomBuster, setShowPhantomBuster] = useState(false)
  const [activeTab, setActiveTab] = useState<'contacts' | 'activities' | 'phantombuster'>('contacts')

  // Real data state
  const [realContacts, setRealContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real contacts from API
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crm/contacts');
      const data = await response.json();
      if (data.success) {
        setRealContacts(data.contacts || []);
      } else {
        setRealContacts(sampleContacts); // Fallback to sample data
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      setRealContacts(sampleContacts); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  // Sample data for demo/fallback
  const sampleContacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@globalfreight.com',
      company: 'Global Freight Solutions',
      position: 'VP of Logistics',
      phone: '+1-555-0123',
      linkedin: 'https://linkedin.com/in/sarahchen',
      location: 'San Francisco, CA',
      industry: 'Logistics',
      status: 'opportunity',
      source: 'phantombuster',
      lastContact: '2024-01-15',
      addedDate: '2024-01-10',
      tags: ['hot-lead', 'decision-maker'],
      notes: 'Interested in air freight solutions for Q2 expansion'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'm.rodriguez@oceanlogistics.com',
      company: 'Ocean Logistics Inc',
      position: 'Operations Manager',
      phone: '+1-555-0456',
      linkedin: 'https://linkedin.com/in/mrodriguez',
      location: 'Los Angeles, CA',
      industry: 'Shipping',
      status: 'contacted',
      source: 'manual',
      lastContact: '2024-01-12',
      addedDate: '2024-01-08',
      tags: ['ocean-freight'],
      notes: 'Evaluating current carriers, may switch in Q2'
    }
  ]

  const mockActivities: Activity[] = [
    {
      id: '1',
      contactId: '1',
      type: 'email',
      description: 'Sent intro email with freight solutions overview',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      contactId: '1',
      type: 'linkedin',
      description: 'Connected on LinkedIn',
      date: '2024-01-14',
      status: 'completed'
    }
  ]

  const mockPhantomJobs: PhantomBusterJob[] = [
    {
      id: '1',
      name: 'LinkedIn Logistics Professionals Search',
      type: 'linkedin_search',
      status: 'completed',
      progress: 100,
      results: 247,
      startTime: '2024-01-15 10:30:00'
    },
    {
      id: '2',
      name: 'Email Finder for Freight Companies',
      type: 'email_finder',
      status: 'running',
      progress: 65,
      results: 89,
      startTime: '2024-01-15 14:20:00'
    }
  ]

  useEffect(() => {
    setContacts(realContacts)
    setActivities(mockActivities)
    setPhantomJobs(mockPhantomJobs)
  }, [realContacts])

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      opportunity: 'bg-green-100 text-green-800',
      customer: 'bg-emerald-100 text-emerald-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'phantombuster': return <Globe className="w-4 h-4" />
      case 'import': return <Import className="w-4 h-4" />
      case 'web': return <ExternalLink className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const startPhantomBusterJob = (type: string) => {
    const newJob: PhantomBusterJob = {
      id: Date.now().toString(),
      name: `New ${type.replace('_', ' ')} Job`,
      type: type as any,
      status: 'running',
      progress: 0,
      results: 0,
      startTime: new Date().toISOString()
    }
    setPhantomJobs(prev => [newJob, ...prev])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">CRM & Lead Management</h2>
            <p className="text-gray-600">Manage contacts, track activities, and generate leads with PhantomBuster</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPhantomBuster(true)}
              className="btn-secondary"
            >
              <Globe className="w-4 h-4 mr-2" />
              PhantomBuster
            </button>
            <button
              onClick={() => setShowAddContact(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'contacts', name: 'Contacts', icon: Users },
            { id: 'activities', name: 'Activities', icon: Activity },
            { id: 'phantombuster', name: 'PhantomBuster', icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              {/* Search and Filter */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="form-input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {/* Contacts Grid */}
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedContact?.id === contact.id ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{contact.name}</h3>
                            {getSourceIcon(contact.source)}
                          </div>
                          <p className="text-sm text-gray-600">{contact.position}</p>
                          <p className="text-sm text-gray-500">{contact.company}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`badge ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                            {contact.tags.map((tag) => (
                              <span key={tag} className="badge bg-gray-100 text-gray-600">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {contact.email && (
                          <button className="text-gray-400 hover:text-blue-600">
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {contact.linkedin && (
                          <button className="text-gray-400 hover:text-blue-600">
                            <Linkedin className="w-4 h-4" />
                          </button>
                        )}
                        {contact.phone && (
                          <button className="text-gray-400 hover:text-green-600">
                            <Phone className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="glass-card p-6">
            {selectedContact ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                  <button className="btn-secondary">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedContact.name}</h4>
                      <p className="text-sm text-gray-600">{selectedContact.position}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedContact.company}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedContact.email}</span>
                    </div>
                    {selectedContact.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedContact.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{selectedContact.location}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                    <p className="text-sm text-gray-600">{selectedContact.notes}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button className="btn-primary flex-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </button>
                    <button className="btn-secondary flex-1">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </button>
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Recent Activities</h5>
                  <div className="space-y-2">
                    {activities
                      .filter(activity => activity.contactId === selectedContact.id)
                      .map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            {activity.type === 'email' && <Mail className="w-3 h-3 text-blue-600" />}
                            {activity.type === 'linkedin' && <Linkedin className="w-3 h-3 text-blue-600" />}
                            {activity.type === 'call' && <Phone className="w-3 h-3 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.date}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a contact</h3>
                <p className="text-gray-500">Choose a contact from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PhantomBuster Tab */}
      {activeTab === 'phantombuster' && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PhantomBuster Integration</h3>
              <p className="text-gray-600">Automate LinkedIn lead generation and email finding</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => startPhantomBusterJob('linkedin_search')}
                className="btn-primary"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start LinkedIn Search
              </button>
              <button
                onClick={() => startPhantomBusterJob('email_finder')}
                className="btn-secondary"
              >
                <Mail className="w-4 h-4 mr-2" />
                Find Emails
              </button>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="space-y-4">
            {phantomJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.name}</h4>
                    <p className="text-sm text-gray-600">Started: {job.startTime}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-sm font-medium">{job.results} results</span>
                  </div>
                </div>
                
                {job.status === 'running' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {activities.map((activity) => {
              const contact = contacts.find(c => c.id === activity.contactId)
              return (
                <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {activity.type === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'call' && <Phone className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{activity.description}</h4>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                    {contact && (
                      <p className="text-sm text-gray-600">{contact.name} • {contact.company}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}