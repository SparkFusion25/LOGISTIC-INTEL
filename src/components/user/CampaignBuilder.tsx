'use client'

import { useState } from 'react'
import { 
  Plus, 
  Mail, 
  Phone, 
  Linkedin, 
  Clock, 
  Send, 
  Users, 
  Play, 
  Pause, 
  Square,
  BarChart3,
  Target,
  Eye,
  MousePointer,
  MessageCircle,
  Trash2,
  Edit,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface CampaignStep {
  id: string
  type: 'email' | 'linkedin' | 'call' | 'delay'
  order: number
  subject?: string
  content?: string
  delay?: number
  delayUnit?: 'hours' | 'days'
  template?: string
}

interface Campaign {
  id: string
  name: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  steps: CampaignStep[]
  contacts: number
  stats: {
    sent: number
    opened: number
    clicked: number
    replied: number
    openRate: number
    clickRate: number
    replyRate: number
  }
  createdAt: string
  startDate?: string
}

const STEP_TEMPLATES = {
  email: {
    intro: {
      subject: "Quick question about {{company}} logistics",
      content: "Hi {{firstName}},\n\nI noticed {{company}} has been expanding operations. I'm curious - what's your biggest challenge with freight logistics right now?\n\nBest,\n{{senderName}}"
    },
    followup: {
      subject: "Re: Freight solutions for {{company}}",
      content: "Hi {{firstName}},\n\nFollowing up on my previous email about freight solutions. Many companies like {{company}} are seeing 20-30% cost savings.\n\nWould you be open to a 10-minute call this week?\n\nBest,\n{{senderName}}"
    }
  },
  linkedin: {
    connect: "Hi {{firstName}}, I'd like to connect as I work with logistics companies like {{company}} on freight optimization.",
    message: "Thanks for connecting! I help companies like {{company}} reduce freight costs by 20-30%. Would you be open to a brief call?"
  }
}

export default function CampaignBuilder() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    steps: [],
    status: 'draft'
  })

  // Mock campaigns data
  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      name: 'Logistics Decision Makers Outreach',
      description: 'Target VPs and Directors at logistics companies',
      status: 'active',
      steps: [
        { id: '1', type: 'email', order: 1, subject: 'Quick question about freight', content: 'Hi there...' },
        { id: '2', type: 'delay', order: 2, delay: 3, delayUnit: 'days' },
        { id: '3', type: 'linkedin', order: 3, content: 'Thanks for connecting...' },
        { id: '4', type: 'delay', order: 4, delay: 5, delayUnit: 'days' },
        { id: '5', type: 'email', order: 5, subject: 'Follow up', content: 'Following up...' }
      ],
      contacts: 150,
      stats: {
        sent: 150,
        opened: 89,
        clicked: 23,
        replied: 12,
        openRate: 59.3,
        clickRate: 15.3,
        replyRate: 8.0
      },
      createdAt: '2024-01-10',
      startDate: '2024-01-12'
    }
  ]

  const addStep = (type: CampaignStep['type']) => {
    const newStep: CampaignStep = {
      id: Date.now().toString(),
      type,
      order: (newCampaign.steps?.length || 0) + 1,
      ...(type === 'delay' && { delay: 1, delayUnit: 'days' }),
      ...(type === 'email' && { subject: '', content: '' }),
      ...(type === 'linkedin' && { content: '' })
    }

    setNewCampaign(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }))
  }

  const updateStep = (stepId: string, updates: Partial<CampaignStep>) => {
    setNewCampaign(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ) || []
    }))
  }

  const removeStep = (stepId: string) => {
    setNewCampaign(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId) || []
    }))
  }

  const saveCampaign = () => {
    if (!newCampaign.name) return

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      description: newCampaign.description || '',
      status: 'draft',
      steps: newCampaign.steps || [],
      contacts: 0,
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0
      },
      createdAt: new Date().toISOString().split('T')[0]
    }

    setCampaigns(prev => [campaign, ...prev])
    setShowBuilder(false)
    setNewCampaign({ name: '', description: '', steps: [], status: 'draft' })
    setCurrentStep(1)
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'call': return <Phone className="w-4 h-4" />
      case 'delay': return <Clock className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (showBuilder) {
    return (
      <div className="space-y-6">
        {/* Builder Header */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Campaign</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBuilder(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={saveCampaign}
                className="btn-primary"
                disabled={!newCampaign.name}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Campaign
              </button>
            </div>
          </div>

          {/* Campaign Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
              <input
                type="text"
                placeholder="e.g. Q1 Logistics Outreach"
                className="form-input"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                placeholder="Brief description of this campaign"
                className="form-input"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Step Builder */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Sequence</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => addStep('email')}
                className="btn-secondary text-sm"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </button>
              <button
                onClick={() => addStep('linkedin')}
                className="btn-secondary text-sm"
              >
                <Linkedin className="w-4 h-4 mr-1" />
                LinkedIn
              </button>
              <button
                onClick={() => addStep('call')}
                className="btn-secondary text-sm"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </button>
              <button
                onClick={() => addStep('delay')}
                className="btn-secondary text-sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                Delay
              </button>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {newCampaign.steps?.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getStepIcon(step.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Step {step.order}: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {step.type === 'email' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                      <input
                        type="text"
                        placeholder="Email subject"
                        className="form-input"
                        value={step.subject || ''}
                        onChange={(e) => updateStep(step.id, { subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                      <textarea
                        rows={4}
                        placeholder="Email content..."
                        className="form-input"
                        value={step.content || ''}
                        onChange={(e) => updateStep(step.id, { content: e.target.value })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStep(step.id, STEP_TEMPLATES.email.intro)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Use Intro Template
                      </button>
                      <button
                        onClick={() => updateStep(step.id, STEP_TEMPLATES.email.followup)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Use Follow-up Template
                      </button>
                    </div>
                  </div>
                )}

                {step.type === 'linkedin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Message</label>
                    <textarea
                      rows={3}
                      placeholder="LinkedIn message content..."
                      className="form-input"
                      value={step.content || ''}
                      onChange={(e) => updateStep(step.id, { content: e.target.value })}
                    />
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => updateStep(step.id, { content: STEP_TEMPLATES.linkedin.connect })}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Connection Request
                      </button>
                      <button
                        onClick={() => updateStep(step.id, { content: STEP_TEMPLATES.linkedin.message })}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Follow-up Message
                      </button>
                    </div>
                  </div>
                )}

                {step.type === 'delay' && (
                  <div className="flex items-center space-x-3">
                    <label className="text-sm font-medium text-gray-700">Wait</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input w-20"
                      value={step.delay || 1}
                      onChange={(e) => updateStep(step.id, { delay: parseInt(e.target.value) })}
                    />
                    <select
                      className="form-input w-24"
                      value={step.delayUnit || 'days'}
                      onChange={(e) => updateStep(step.id, { delayUnit: e.target.value as 'hours' | 'days' })}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                    <span className="text-sm text-gray-600">before next step</span>
                  </div>
                )}

                {step.type === 'call' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Script/Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Call talking points..."
                      className="form-input"
                      value={step.content || ''}
                      onChange={(e) => updateStep(step.id, { content: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ))}

            {!newCampaign.steps?.length && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Add Your First Step</h3>
                <p className="text-gray-500 mb-4">Start building your campaign sequence</p>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => addStep('email')}
                    className="btn-primary"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Start with Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Management</h2>
            <p className="text-gray-600">Create and manage multi-step outreach campaigns</p>
          </div>
          <button
            onClick={() => setShowBuilder(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </button>
        </div>

        {/* Campaign Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.contacts, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Reply Rate</p>
                <p className="text-2xl font-bold text-orange-600">
                  {campaigns.length ? (campaigns.reduce((sum, c) => sum + c.stats.replyRate, 0) / campaigns.length).toFixed(1) : 0}%
                </p>
              </div>
              <MessageCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Campaigns</h3>
        
        {mockCampaigns.length > 0 ? (
          <div className="space-y-4">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{campaign.name}</h4>
                      <span className={`badge ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{campaign.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>{campaign.contacts} contacts</span>
                      <span>{campaign.steps.length} steps</span>
                      <span>Created {campaign.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {campaign.status === 'active' && (
                      <button className="btn-secondary">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button className="btn-primary">
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </button>
                    )}
                    <button className="btn-secondary">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button className="btn-secondary">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </button>
                  </div>
                </div>

                {/* Campaign Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{campaign.stats.sent}</p>
                    <p className="text-xs text-gray-600">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{campaign.stats.opened}</p>
                    <p className="text-xs text-gray-600">Opened</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{campaign.stats.clicked}</p>
                    <p className="text-xs text-gray-600">Clicked</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{campaign.stats.replied}</p>
                    <p className="text-xs text-gray-600">Replied</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{campaign.stats.openRate}%</p>
                    <p className="text-xs text-gray-600">Open Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{campaign.stats.replyRate}%</p>
                    <p className="text-xs text-gray-600">Reply Rate</p>
                  </div>
                </div>

                {/* Campaign Steps Preview */}
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Campaign Sequence</h5>
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    {campaign.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-max">
                          {getStepIcon(step.type)}
                          <span className="text-sm font-medium">
                            {step.type === 'delay' ? `${step.delay} ${step.delayUnit}` : step.type}
                          </span>
                        </div>
                        {index < campaign.steps.length - 1 && (
                          <ChevronDown className="w-4 h-4 text-gray-400 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">Create your first campaign to start reaching out to prospects</p>
            <button
              onClick={() => setShowBuilder(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  )
}