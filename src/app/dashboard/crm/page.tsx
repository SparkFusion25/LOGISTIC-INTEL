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
  Import,
  ArrowRight,
  Clock,
  Target
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
  source: 'manual' | 'phantombuster' | 'import' | 'web' | 'search'
  lastContact: string
  addedDate: string
  tags: string[]
  notes: string
  avatar?: string
  tradelane?: string
  value?: string
}

interface TouchPoint {
  id: string
  contactId: string
  type: 'email' | 'call' | 'linkedin' | 'meeting' | 'note' | 'campaign'
  description: string
  date: string
  status: 'completed' | 'scheduled' | 'failed'
  details?: string
}

interface CRMFilters {
  industry: string
  tradelane: string
  lastContacted: string
  source: string
  status: string
}

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<CRMFilters>({
    industry: 'all',
    tradelane: 'all',
    lastContacted: 'all',
    source: 'all',
    status: 'all'
  })
  const [showAddContact, setShowAddContact] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Mock comprehensive CRM data
  const mockContacts: Contact[] = [
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
      source: 'search',
      lastContact: '2024-01-15',
      addedDate: '2024-01-10',
      tags: ['hot-lead', 'decision-maker', 'air-freight'],
      notes: 'Interested in air freight solutions for Q2 expansion. Budget: $500K+',
      tradelane: 'Asia-US',
      value: '$750K'
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
      source: 'phantombuster',
      lastContact: '2024-01-12',
      addedDate: '2024-01-08',
      tags: ['ocean-freight', 'follow-up'],
      notes: 'Evaluating current carriers, may switch in Q2. Prefers long-term contracts.',
      tradelane: 'Europe-US',
      value: '$320K'
    },
    {
      id: '3',
      name: 'Jennifer Kim',
      email: 'j.kim@pactextiles.com',
      company: 'Pacific Textiles Manufacturing',
      position: 'Export Manager',
      phone: '+82-2-123456',
      location: 'Seoul, South Korea',
      industry: 'Manufacturing',
      status: 'qualified',
      source: 'manual',
      lastContact: '2024-01-14',
      addedDate: '2024-01-05',
      tags: ['textiles', 'asia-us'],
      notes: 'High volume shipper, looking for cost optimization. Very responsive.',
      tradelane: 'Asia-US',
      value: '$450K'
    },
    {
      id: '4',
      name: 'David Thompson',
      email: 'd.thompson@europarts.com',
      company: 'Euro Parts Distribution',
      position: 'Procurement Director',
      phone: '+49-30-123456',
      linkedin: 'https://linkedin.com/in/davidthompson',
      location: 'Berlin, Germany',
      industry: 'Automotive',
      status: 'new',
      source: 'import',
      lastContact: '2024-01-16',
      addedDate: '2024-01-16',
      tags: ['automotive', 'new-contact'],
      notes: 'Just imported from lead list. Specializes in auto parts distribution.',
      tradelane: 'Europe-Global',
      value: '$280K'
    }
  ]

  const mockTouchPoints: TouchPoint[] = [
    {
      id: '1',
      contactId: '1',
      type: 'email',
      description: 'Sent intro email with air freight solutions overview',
      date: '2024-01-15',
      status: 'completed',
      details: 'Email opened 3 times, no reply yet'
    },
    {
      id: '2',
      contactId: '1',
      type: 'linkedin',
      description: 'Connected on LinkedIn and sent message',
      date: '2024-01-14',
      status: 'completed',
      details: 'Connection accepted, message viewed'
    },
    {
      id: '3',
      contactId: '1',
      type: 'meeting',
      description: 'Follow-up call scheduled',
      date: '2024-01-18',
      status: 'scheduled',
      details: '15-minute discovery call to discuss requirements'
    },
    {
      id: '4',
      contactId: '2',
      type: 'email',
      description: 'Follow-up email with ocean freight case study',
      date: '2024-01-12',
      status: 'completed',
      details: 'Email opened once, clicked on case study link'
    },
    {
      id: '5',
      contactId: '3',
      type: 'call',
      description: 'Initial discovery call completed',
      date: '2024-01-14',
      status: 'completed',
      details: '30-minute call, discussed current challenges and timeline'
    }
  ]

  useEffect(() => {
    setContacts(mockContacts)
    setTouchPoints(mockTouchPoints)
  }, [])

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesIndustry = filters.industry === 'all' || contact.industry.toLowerCase() === filters.industry
    const matchesTradelane = filters.tradelane === 'all' || contact.tradelane === filters.tradelane
    const matchesStatus = filters.status === 'all' || contact.status === filters.status
    const matchesSource = filters.source === 'all' || contact.source === filters.source

    return matchesSearch && matchesIndustry && matchesTradelane && matchesStatus && matchesSource
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
      case 'search': return <Search className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getTouchPointIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'meeting': return <Calendar className="w-4 h-4" />
      case 'campaign': return <Target className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const addToCampaign = (contact: Contact) => {
    console.log('Adding to campaign:', contact)
    alert(`Added ${contact.name} to campaign!`)
  }

  const sendDirectEmail = (contact: Contact) => {
    console.log('Sending email to:', contact)
    alert(`Opening email composer for ${contact.name}`)
  }

  const connectLinkedIn = (contact: Contact) => {
    if (contact.linkedin) {
      window.open(contact.linkedin, '_blank')
    } else {
      alert('LinkedIn profile not available')
    }
  }

  const logActivity = (contact: Contact, type: string) => {
    const newTouchPoint: TouchPoint = {
      id: Date.now().toString(),
      contactId: contact.id,
      type: type as any,
      description: `Manual ${type} activity logged`,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    }
    setTouchPoints(prev => [newTouchPoint, ...prev])
    alert(`Logged ${type} activity for ${contact.name}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM & Contact Management</h1>
              <p className="text-gray-600">Manage contacts, track touchpoints, and accelerate your sales pipeline</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
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

          {/* Search and Filters */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search contacts by name, company, or email..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  className="form-input"
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                >
                  <option value="all">All Industries</option>
                  <option value="logistics">Logistics</option>
                  <option value="shipping">Shipping</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="automotive">Automotive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trade Lane</label>
                <select
                  className="form-input"
                  value={filters.tradelane}
                  onChange={(e) => setFilters(prev => ({ ...prev, tradelane: e.target.value }))}
                >
                  <option value="all">All Trade Lanes</option>
                  <option value="Asia-US">Asia-US</option>
                  <option value="Europe-US">Europe-US</option>
                  <option value="Europe-Global">Europe-Global</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="form-input"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  className="form-input"
                  value={filters.source}
                  onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                >
                  <option value="all">All Sources</option>
                  <option value="search">Search</option>
                  <option value="phantombuster">PhantomBuster</option>
                  <option value="manual">Manual</option>
                  <option value="import">Import</option>
                  <option value="web">Web</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Contacted</label>
                <select
                  className="form-input"
                  value={filters.lastContacted}
                  onChange={(e) => setFilters(prev => ({ ...prev, lastContacted: e.target.value }))}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacts ({filteredContacts.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Pipeline Value: ${filteredContacts.reduce((sum, c) => sum + parseInt(c.value?.replace(/[$K]/g, '') || '0'), 0)}K
                </div>
              </div>

              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedContact?.id === contact.id ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                            {getSourceIcon(contact.source)}
                            {contact.value && (
                              <span className="text-sm font-medium text-green-600">{contact.value}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{contact.position}</p>
                          <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`badge text-xs ${getStatusColor(contact.status)}`}>
                              {contact.status}
                            </span>
                            {contact.tradelane && (
                              <span className="badge bg-gray-100 text-gray-600 text-xs">
                                {contact.tradelane}
                              </span>
                            )}
                            {contact.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="badge bg-blue-100 text-blue-600 text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>Last contact: {contact.lastContact}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendDirectEmail(contact)
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            connectLinkedIn(contact)
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCampaign(contact)
                          }}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredContacts.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Details & Touchpoint History */}
          <div className="glass-card p-6">
            {selectedContact ? (
              <div className="space-y-6">
                {/* Contact Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Details</h3>
                  <button className="btn-secondary text-sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedContact.name}</h4>
                      <p className="text-sm text-gray-600">{selectedContact.position}</p>
                      <p className="text-sm text-gray-500">{selectedContact.company}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{selectedContact.company}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:text-blue-800">
                        {selectedContact.email}
                      </a>
                    </div>
                    {selectedContact.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:text-blue-800">
                          {selectedContact.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedContact.location}</span>
                    </div>
                    {selectedContact.value && (
                      <div className="flex items-center space-x-3">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-green-600">Pipeline Value: {selectedContact.value}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedContact.notes}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Quick Actions</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => sendDirectEmail(selectedContact)}
                        className="btn-primary text-sm py-2"
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </button>
                      <button
                        onClick={() => connectLinkedIn(selectedContact)}
                        className="btn-secondary text-sm py-2"
                      >
                        <Linkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </button>
                      <button
                        onClick={() => logActivity(selectedContact, 'call')}
                        className="btn-secondary text-sm py-2"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Log Call
                      </button>
                      <button
                        onClick={() => addToCampaign(selectedContact)}
                        className="btn-secondary text-sm py-2"
                      >
                        <Target className="w-4 h-4 mr-1" />
                        Campaign
                      </button>
                    </div>
                  </div>
                </div>

                {/* Touchpoint History */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Touchpoint History</h5>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {touchPoints
                      .filter(tp => tp.contactId === selectedContact.id)
                      .map((touchPoint) => (
                        <div key={touchPoint.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            touchPoint.status === 'completed' ? 'bg-green-100' :
                            touchPoint.status === 'scheduled' ? 'bg-blue-100' : 'bg-red-100'
                          }`}>
                            {getTouchPointIcon(touchPoint.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{touchPoint.description}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                touchPoint.status === 'completed' ? 'bg-green-100 text-green-800' :
                                touchPoint.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {touchPoint.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{touchPoint.date}</p>
                            {touchPoint.details && (
                              <p className="text-xs text-gray-600 mt-1">{touchPoint.details}</p>
                            )}
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
                <p className="text-gray-500">Choose a contact from the list to view details and touchpoint history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}