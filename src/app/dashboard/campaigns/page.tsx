'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, BarChart3, Users, Mail, Linkedin, Settings, Plus, 
  Trash2, Copy, Edit, ChevronDown, ChevronRight, Target, Globe, Building2,
  Clock, TrendingUp, Eye, MousePointer, MessageCircle, Send, Zap, Filter,
  Calendar, CheckCircle, AlertCircle, ExternalLink, Download
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  tradeLane: {
    from: string;
    to: string;
  };
  industry: string[];
  type: 'email' | 'email_linkedin' | 'email_phantom' | 'omnichannel';
  status: 'draft' | 'active' | 'paused' | 'completed';
  created: string;
  lastModified: string;
  stats: {
    totalLeads: number;
    sent: number;
    opened: number;
    replied: number;
    clicked: number;
    bounced: number;
    linkedinConnections: number;
  };
  sequence: CampaignStep[];
}

interface CampaignStep {
  id: string;
  type: 'email' | 'linkedin' | 'wait' | 'condition';
  delay: number;
  delayUnit: 'hours' | 'days';
  subject?: string;
  content?: string;
  condition?: 'opened' | 'clicked' | 'replied' | 'none';
  templateId?: string;
}

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  country: string;
  industry: string;
  stage: string;
}

export default function CampaignBuilder() {
  const [activeTab, setActiveTab] = useState<'builder' | 'contacts' | 'templates' | 'results'>('builder');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Trade lanes and industries for targeting
  const tradeLanes = [
    { label: 'China → USA', value: { from: 'China', to: 'USA' } },
    { label: 'Germany → UK', value: { from: 'Germany', to: 'UK' } },
    { label: 'South Korea → Mexico', value: { from: 'South Korea', to: 'Mexico' } },
    { label: 'Vietnam → USA', value: { from: 'Vietnam', to: 'USA' } },
    { label: 'India → Europe', value: { from: 'India', to: 'Europe' } },
    { label: 'Thailand → Australia', value: { from: 'Thailand', to: 'Australia' } },
  ];

  const industries = [
    'Automotive', 'Pharmaceutical', 'Electronics', 'Apparel & Textiles', 
    'Industrial Machinery', 'Aerospace', 'Chemical', 'Food & Beverage',
    'Consumer Goods', 'Energy & Oil', 'Raw Materials', 'Healthcare'
  ];

  const campaignTypes = [
    { value: 'email', label: 'Email Only', description: 'Pure email outreach campaign' },
    { value: 'email_linkedin', label: 'Email + LinkedIn', description: 'Email with LinkedIn connection requests' },
    { value: 'email_phantom', label: 'Email + PhantomBuster', description: 'Email with automated LinkedIn prospecting' },
    { value: 'omnichannel', label: 'Full Omnichannel', description: 'Email + LinkedIn + PhantomBuster + Calls' }
  ];

  const emailTemplates = [
    {
      id: 'freight_intro',
      name: 'Freight Rate Introduction',
      subject: 'Competitive shipping rates for {{industry}} imports from {{origin}}',
      content: `Hi {{firstName}},

I noticed {{company}} imports {{industry}} products from {{origin}}. 

We're currently offering highly competitive rates on this trade lane with:
- 15-20% cost savings vs. major carriers
- 12-18 day transit time
- Full container load and LCL options
- Real-time tracking and updates

Would you be open to a 10-minute call this week to discuss your shipping needs?

Best regards,
{{senderName}}`
    },
    {
      id: 'ocean_freight',
      name: 'Ocean Freight Partnership',
      subject: 'Partnership opportunity - {{origin}} to {{destination}} shipping',
      content: `Hello {{firstName}},

I hope this email finds you well. I'm reaching out because {{company}} appears to be a significant importer from {{origin}}.

We specialize in {{origin}} → {{destination}} trade lanes and have helped companies like yours reduce shipping costs by 20-30% while improving transit reliability.

Our services include:
- Dedicated space allocation on premium vessels
- Customs clearance and documentation
- Door-to-door logistics solutions
- Supply chain visibility platform

Could we schedule a brief call to explore how we might support {{company}}'s shipping requirements?

Best regards,
{{senderName}}`
    }
  ];

  // Mock campaigns data
  const mockCampaigns: Campaign[] = [
    {
      id: 'camp_001',
      name: 'China Electronics Importers Q1',
      tradeLane: { from: 'China', to: 'USA' },
      industry: ['Electronics', 'Consumer Goods'],
      type: 'email_linkedin',
      status: 'active',
      created: '2024-01-15',
      lastModified: '2024-01-18',
      stats: {
        totalLeads: 156,
        sent: 142,
        opened: 89,
        replied: 23,
        clicked: 45,
        bounced: 3,
        linkedinConnections: 67
      },
      sequence: [
        {
          id: 'step_001',
          type: 'email',
          delay: 0,
          delayUnit: 'days',
          subject: 'Competitive shipping rates for electronics imports from China',
          content: 'Hi {{firstName}}, I noticed {{company}} imports electronics from China...',
          templateId: 'freight_intro'
        },
        {
          id: 'step_002',
          type: 'wait',
          delay: 2,
          delayUnit: 'days'
        },
        {
          id: 'step_003',
          type: 'linkedin',
          delay: 0,
          delayUnit: 'days',
          content: 'Hi {{firstName}}, I sent you an email about shipping solutions for {{company}}. Would love to connect!'
        },
        {
          id: 'step_004',
          type: 'wait',
          delay: 3,
          delayUnit: 'days'
        },
        {
          id: 'step_005',
          type: 'email',
          delay: 0,
          delayUnit: 'days',
          subject: 'Following up on shipping partnership for {{company}}',
          content: 'Hi {{firstName}}, I wanted to follow up on my previous email...',
          condition: 'none'
        }
      ]
    },
    {
      id: 'camp_002',
      name: 'Auto Parts - Korea → Mexico',
      tradeLane: { from: 'South Korea', to: 'Mexico' },
      industry: ['Automotive'],
      type: 'omnichannel',
      status: 'paused',
      created: '2024-01-10',
      lastModified: '2024-01-16',
      stats: {
        totalLeads: 89,
        sent: 76,
        opened: 52,
        replied: 18,
        clicked: 31,
        bounced: 2,
        linkedinConnections: 34
      },
      sequence: []
    }
  ];

  useEffect(() => {
    setCampaigns(mockCampaigns);
    loadAvailableLeads();
  }, []);

  const loadAvailableLeads = async () => {
    // Simulate loading leads from CRM API
    const mockLeads: Lead[] = [
      {
        id: 'lead_001',
        name: 'Sarah Chen',
        title: 'Procurement Manager',
        company: 'TechGlobal Solutions',
        email: 'sarah.chen@techglobal.com',
        country: 'USA',
        industry: 'Electronics',
        stage: 'Prospect'
      },
      {
        id: 'lead_002',
        name: 'Miguel Rodriguez',
        title: 'Logistics Director',
        company: 'AutoParts Mexico',
        email: 'miguel.r@autoparts.mx',
        country: 'Mexico',
        industry: 'Automotive',
        stage: 'Qualified'
      },
      {
        id: 'lead_003',
        name: 'James Wilson',
        title: 'Supply Chain Manager',
        company: 'PharmaCorp Inc.',
        email: 'j.wilson@pharmacorp.com',
        country: 'USA',
        industry: 'Pharmaceutical',
        stage: 'Prospect'
      }
    ];
    setAvailableLeads(mockLeads);
  };

  const createNewCampaign = () => {
    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: 'New Campaign',
      tradeLane: { from: '', to: '' },
      industry: [],
      type: 'email',
      status: 'draft',
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      stats: {
        totalLeads: 0,
        sent: 0,
        opened: 0,
        replied: 0,
        clicked: 0,
        bounced: 0,
        linkedinConnections: 0
      },
      sequence: []
    };
    
    setCampaigns([newCampaign, ...campaigns]);
    setSelectedCampaign(newCampaign);
    setIsCreating(true);
    setActiveTab('builder');
  };

  const addSequenceStep = () => {
    if (!selectedCampaign) return;
    
    const newStep: CampaignStep = {
      id: `step_${Date.now()}`,
      type: 'email',
      delay: 1,
      delayUnit: 'days',
      subject: 'New message',
      content: 'Your message content here...'
    };
    
    const updatedCampaign = {
      ...selectedCampaign,
      sequence: [...selectedCampaign.sequence, newStep]
    };
    
    setSelectedCampaign(updatedCampaign);
    setCampaigns(campaigns.map(c => c.id === selectedCampaign.id ? updatedCampaign : c));
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'linkedin': return Linkedin;
      case 'wait': return Clock;
      case 'condition': return Target;
      default: return Mail;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-indigo-600" />
              Campaign Builder
            </h1>
            <p className="text-gray-600 mt-2">Build intelligent outreach campaigns for international trade prospects</p>
          </div>
          <button
            onClick={createNewCampaign}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Campaign List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Campaigns
            </h3>
            
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setIsCreating(false);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedCampaign?.id === campaign.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-1">{campaign.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    {campaign.tradeLane.from} → {campaign.tradeLane.to}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {campaign.industry.join(', ')}
                  </div>
                  
                  {campaign.stats.totalLeads > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Sent:</span>
                        <span className="ml-1 font-medium">{campaign.stats.sent}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Opened:</span>
                        <span className="ml-1 font-medium">{campaign.stats.opened}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedCampaign ? (
            <div className="space-y-6">
              {/* Campaign Header & Tabs */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.name}</h2>
                      <p className="text-gray-600">
                        {selectedCampaign.tradeLane.from} → {selectedCampaign.tradeLane.to} | {selectedCampaign.industry.join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {selectedCampaign.status === 'active' ? (
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      ) : (
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Launch
                        </button>
                      )}
                      
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Clone
                      </button>
                    </div>
                  </div>

                  {/* Stats Summary */}
                  {selectedCampaign.stats.totalLeads > 0 && (
                    <div className="grid md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedCampaign.stats.totalLeads}</div>
                        <div className="text-xs text-gray-600">Total Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">{selectedCampaign.stats.sent}</div>
                        <div className="text-xs text-gray-600">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedCampaign.stats.opened}</div>
                        <div className="text-xs text-gray-600">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedCampaign.stats.replied}</div>
                        <div className="text-xs text-gray-600">Replied</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedCampaign.stats.clicked}</div>
                        <div className="text-xs text-gray-600">Clicked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedCampaign.stats.linkedinConnections}</div>
                        <div className="text-xs text-gray-600">LinkedIn</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  {(['builder', 'contacts', 'templates', 'results'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-medium capitalize ${
                        activeTab === tab
                          ? 'border-b-2 border-indigo-600 text-indigo-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'builder' && (
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Campaign Configuration */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      Campaign Configuration
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                        <input
                          type="text"
                          value={selectedCampaign.name}
                          onChange={(e) => {
                            const updatedCampaign = { ...selectedCampaign, name: e.target.value };
                            setSelectedCampaign(updatedCampaign);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter campaign name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trade Lane</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Select trade lane</option>
                          {tradeLanes.map((lane) => (
                            <option key={lane.label} value={lane.label}>{lane.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry Segments</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {industries.map((industry) => (
                            <label key={industry} className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={selectedCampaign.industry.includes(industry)}
                                onChange={(e) => {
                                  const updatedIndustries = e.target.checked
                                    ? [...selectedCampaign.industry, industry]
                                    : selectedCampaign.industry.filter(i => i !== industry);
                                  setSelectedCampaign({
                                    ...selectedCampaign,
                                    industry: updatedIndustries
                                  });
                                }}
                                className="mr-2 text-indigo-600"
                              />
                              {industry}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                        <div className="space-y-2">
                          {campaignTypes.map((type) => (
                            <label key={type.value} className="flex items-start">
                              <input
                                type="radio"
                                name="campaignType"
                                value={type.value}
                                checked={selectedCampaign.type === type.value}
                                onChange={(e) => {
                                  setSelectedCampaign({
                                    ...selectedCampaign,
                                    type: e.target.value as any
                                  });
                                }}
                                className="mr-3 mt-1 text-indigo-600"
                              />
                              <div>
                                <div className="font-medium text-sm">{type.label}</div>
                                <div className="text-xs text-gray-600">{type.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sequence Builder */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Send className="w-5 h-5 text-indigo-600" />
                        Sequence Builder
                      </h3>
                      <button
                        onClick={addSequenceStep}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Step
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedCampaign.sequence.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Send className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No sequence steps yet</p>
                          <p className="text-sm">Click "Add Step" to start building your campaign</p>
                        </div>
                      ) : (
                        selectedCampaign.sequence.map((step, index) => {
                          const StepIcon = getStepIcon(step.type);
                          
                          return (
                            <div key={step.id} className="relative">
                              {index > 0 && (
                                <div className="absolute -top-3 left-6 w-0.5 h-3 bg-gray-300"></div>
                              )}
                              
                              <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <StepIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-gray-900 capitalize">
                                      {step.type === 'wait' ? `Wait ${step.delay} ${step.delayUnit}` : step.type}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                      <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button className="p-1 text-gray-400 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {step.type === 'email' && (
                                    <div>
                                      <div className="text-sm text-gray-600 mb-1">Subject: {step.subject}</div>
                                      <div className="text-xs text-gray-500 line-clamp-2">{step.content}</div>
                                    </div>
                                  )}
                                  
                                  {step.type === 'linkedin' && (
                                    <div className="text-sm text-gray-600">LinkedIn connection request</div>
                                  )}
                                  
                                  {step.delay > 0 && step.type !== 'wait' && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Delay: {step.delay} {step.delayUnit}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Target Contacts ({availableLeads.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filter Leads
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Import CSV
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input type="checkbox" className="text-indigo-600" />
                          </th>
                          <th className="px-4 py-3 text-left font-medium">Contact</th>
                          <th className="px-4 py-3 text-left font-medium">Company</th>
                          <th className="px-4 py-3 text-left font-medium">Industry</th>
                          <th className="px-4 py-3 text-left font-medium">Country</th>
                          <th className="px-4 py-3 text-left font-medium">Stage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {availableLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input 
                                type="checkbox" 
                                className="text-indigo-600"
                                checked={selectedLeads.includes(lead.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLeads([...selectedLeads, lead.id]);
                                  } else {
                                    setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                  }
                                }}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">{lead.name}</div>
                                <div className="text-gray-600">{lead.title}</div>
                                <div className="text-gray-500 text-xs">{lead.email}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-900">{lead.company}</td>
                            <td className="px-4 py-3 text-gray-600">{lead.industry}</td>
                            <td className="px-4 py-3 text-gray-600">{lead.country}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                lead.stage === 'Qualified' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {lead.stage}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    Email Templates
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {emailTemplates.map((template) => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                            Use Template
                          </button>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">Subject:</div>
                          <div className="text-sm text-gray-700 font-medium">{template.subject}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Content Preview:</div>
                          <div className="text-sm text-gray-600 line-clamp-4">{template.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="space-y-6">
                  {selectedCampaign.stats.totalLeads > 0 ? (
                    <>
                      {/* Performance Overview */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-indigo-600" />
                          Performance Overview
                        </h3>
                        
                        <div className="grid md:grid-cols-4 gap-6">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                              {Math.round((selectedCampaign.stats.opened / selectedCampaign.stats.sent) * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">Open Rate</div>
                          </div>
                          
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                              {Math.round((selectedCampaign.stats.replied / selectedCampaign.stats.sent) * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">Reply Rate</div>
                          </div>
                          
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-3xl font-bold text-purple-600 mb-1">
                              {Math.round((selectedCampaign.stats.clicked / selectedCampaign.stats.sent) * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">Click Rate</div>
                          </div>
                          
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-3xl font-bold text-orange-600 mb-1">
                              {Math.round((selectedCampaign.stats.linkedinConnections / selectedCampaign.stats.sent) * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">LinkedIn Rate</div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <MessageCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <div className="font-medium text-gray-900">Sarah Chen replied</div>
                                <div className="text-sm text-gray-600">TechGlobal Solutions - Electronics</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">2 hours ago</div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Eye className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">Miguel Rodriguez opened email</div>
                                <div className="text-sm text-gray-600">AutoParts Mexico - Automotive</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">4 hours ago</div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Linkedin className="w-5 h-5 text-purple-600" />
                              <div>
                                <div className="font-medium text-gray-900">James Wilson connected on LinkedIn</div>
                                <div className="text-sm text-gray-600">PharmaCorp Inc. - Pharmaceutical</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">1 day ago</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                      <p className="text-gray-600 mb-4">Launch your campaign to start seeing performance data</p>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md">
                        Launch Campaign
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* No Campaign Selected */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Campaign Builder</h3>
              <p className="text-gray-600 mb-6">
                Create intelligent outreach campaigns for international trade prospects
              </p>
              <button
                onClick={createNewCampaign}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Create Your First Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}