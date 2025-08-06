'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, TrendingUp, Mail, Linkedin, Zap, Eye, MessageCircle, 
  Send, Users, Clock, Download, Filter, RefreshCw, Activity,
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  tradeLane: string;
  industry: string;
  status: string;
  created_at: string;
}

interface OutreachLog {
  id: string;
  campaign_id: string;
  contact_email: string;
  contact_name: string;
  channel: 'Email' | 'LinkedIn' | 'PhantomBuster';
  status: 'Sent' | 'Opened' | 'Replied' | 'Clicked' | 'Failed' | 'Bounced';
  timestamp: string;
  campaign_name: string;
  subject?: string;
  message_preview?: string;
}

interface CampaignMetrics {
  email_sent: number;
  email_opened: number;
  email_replied: number;
  email_clicked: number;
  email_bounced: number;
  linkedin_sent: number;
  linkedin_connected: number;
  phantombuster_sent: number;
  phantombuster_connected: number;
  open_rate: number;
  reply_rate: number;
  click_rate: number;
  bounce_rate: number;
  total_contacts: number;
}

export default function CampaignAnalytics() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [logs, setLogs] = useState<OutreachLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<CampaignMetrics>({
    email_sent: 0,
    email_opened: 0,
    email_replied: 0,
    email_clicked: 0,
    email_bounced: 0,
    linkedin_sent: 0,
    linkedin_connected: 0,
    phantombuster_sent: 0,
    phantombuster_connected: 0,
    open_rate: 0,
    reply_rate: 0,
    click_rate: 0,
    bounce_rate: 0,
    total_contacts: 0
  });
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock campaign data
  const mockCampaigns: Campaign[] = [
    {
      id: 'camp_001',
      name: 'China Electronics Q1 2024',
      tradeLane: 'China → USA',
      industry: 'Electronics',
      status: 'active',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'camp_002', 
      name: 'Auto Parts Korea-Mexico',
      tradeLane: 'South Korea → Mexico',
      industry: 'Automotive',
      status: 'active',
      created_at: '2024-01-10T00:00:00Z'
    },
    {
      id: 'camp_003',
      name: 'Pharma EU Expansion',
      tradeLane: 'Germany → USA',
      industry: 'Pharmaceutical',
      status: 'paused',
      created_at: '2024-01-05T00:00:00Z'
    }
  ];

  // Mock outreach logs
  const mockLogs: OutreachLog[] = [
    {
      id: 'log_001',
      campaign_id: 'camp_001',
      contact_email: 'sarah.chen@techglobal.com',
      contact_name: 'Sarah Chen',
      channel: 'Email',
      status: 'Replied',
      timestamp: '2024-01-20T14:30:00Z',
      campaign_name: 'China Electronics Q1 2024',
      subject: 'Competitive shipping rates for electronics imports',
      message_preview: 'Hi Sarah, I noticed TechGlobal imports electronics from China...'
    },
    {
      id: 'log_002',
      campaign_id: 'camp_001',
      contact_email: 'michael.wong@electronics-plus.com',
      contact_name: 'Michael Wong',
      channel: 'Email',
      status: 'Opened',
      timestamp: '2024-01-20T13:15:00Z',
      campaign_name: 'China Electronics Q1 2024',
      subject: 'Partnership opportunity for Asia-Pacific trade',
      message_preview: 'Hello Michael, Electronics Plus appears to be a major importer...'
    },
    {
      id: 'log_003',
      campaign_id: 'camp_001',
      contact_email: 'jennifer.liu@smart-devices.com',
      contact_name: 'Jennifer Liu',
      channel: 'LinkedIn',
      status: 'Sent',
      timestamp: '2024-01-20T12:00:00Z',
      campaign_name: 'China Electronics Q1 2024',
      message_preview: 'Hi Jennifer, I sent you an email about shipping solutions...'
    },
    {
      id: 'log_004',
      campaign_id: 'camp_002',
      contact_email: 'carlos.rodriguez@autoparts-mx.com',
      contact_name: 'Carlos Rodriguez',
      channel: 'Email',
      status: 'Clicked',
      timestamp: '2024-01-20T11:45:00Z',
      campaign_name: 'Auto Parts Korea-Mexico',
      subject: 'Auto parts shipping optimization Korea → Mexico',
      message_preview: 'Dear Carlos, AutoParts MX handles significant Korea imports...'
    },
    {
      id: 'log_005',
      campaign_id: 'camp_001',
      contact_email: 'david.kim@tech-solutions.com',
      contact_name: 'David Kim',
      channel: 'PhantomBuster',
      status: 'Sent',
      timestamp: '2024-01-20T10:30:00Z',
      campaign_name: 'China Electronics Q1 2024',
      message_preview: 'LinkedIn automation: Tech Solutions contact discovery'
    },
    {
      id: 'log_006',
      campaign_id: 'camp_002',
      contact_email: 'maria.gonzalez@logistics-pro.mx',
      contact_name: 'Maria Gonzalez',
      channel: 'Email',
      status: 'Bounced',
      timestamp: '2024-01-20T09:15:00Z',
      campaign_name: 'Auto Parts Korea-Mexico',
      subject: 'Freight forwarding partnership opportunity',
      message_preview: 'Email delivery failed - invalid address'
    },
    {
      id: 'log_007',
      campaign_id: 'camp_003',
      contact_email: 'thomas.mueller@pharma-europe.de',
      contact_name: 'Thomas Mueller',
      channel: 'Email',
      status: 'Opened',
      timestamp: '2024-01-19T16:20:00Z',
      campaign_name: 'Pharma EU Expansion',
      subject: 'FDA-compliant pharma logistics Germany → USA',
      message_preview: 'Hello Thomas, Pharma Europe requires specialized logistics...'
    },
    {
      id: 'log_008',
      campaign_id: 'camp_001',
      contact_email: 'amy.zhang@global-electronics.com',
      contact_name: 'Amy Zhang',
      channel: 'LinkedIn',
      status: 'Replied',
      timestamp: '2024-01-19T15:45:00Z',
      campaign_name: 'China Electronics Q1 2024',
      message_preview: 'Thanks for connecting! Interested in your shipping rates.'
    }
  ];

  useEffect(() => {
    // Simulate fetching campaigns
    setCampaigns(mockCampaigns);
  }, []);

  useEffect(() => {
    if (!selectedCampaign) return;

    const fetchLogs = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter logs by selected campaign
      const campaignLogs = mockLogs.filter(log => log.campaign_id === selectedCampaign);
      setLogs(campaignLogs);

      // Calculate metrics
      const emailSent = campaignLogs.filter(l => l.channel === 'Email').length;
      const emailOpened = campaignLogs.filter(l => l.channel === 'Email' && l.status === 'Opened').length;
      const emailReplied = campaignLogs.filter(l => l.channel === 'Email' && l.status === 'Replied').length;
      const emailClicked = campaignLogs.filter(l => l.channel === 'Email' && l.status === 'Clicked').length;
      const emailBounced = campaignLogs.filter(l => l.channel === 'Email' && l.status === 'Bounced').length;
      
      const linkedinSent = campaignLogs.filter(l => l.channel === 'LinkedIn').length;
      const linkedinConnected = campaignLogs.filter(l => l.channel === 'LinkedIn' && l.status === 'Replied').length;
      
      const phantomSent = campaignLogs.filter(l => l.channel === 'PhantomBuster').length;
      const phantomConnected = campaignLogs.filter(l => l.channel === 'PhantomBuster' && l.status === 'Replied').length;

      setMetrics({
        email_sent: emailSent,
        email_opened: emailOpened,
        email_replied: emailReplied,
        email_clicked: emailClicked,
        email_bounced: emailBounced,
        linkedin_sent: linkedinSent,
        linkedin_connected: linkedinConnected,
        phantombuster_sent: phantomSent,
        phantombuster_connected: phantomConnected,
        open_rate: emailSent > 0 ? Math.round((emailOpened / emailSent) * 100) : 0,
        reply_rate: emailSent > 0 ? Math.round((emailReplied / emailSent) * 100) : 0,
        click_rate: emailSent > 0 ? Math.round((emailClicked / emailSent) * 100) : 0,
        bounce_rate: emailSent > 0 ? Math.round((emailBounced / emailSent) * 100) : 0,
        total_contacts: new Set(campaignLogs.map(l => l.contact_email)).size
      });

      setIsLoading(false);
    };

    fetchLogs();
  }, [selectedCampaign]);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'LinkedIn': return <Linkedin className="w-4 h-4 text-purple-600" />;
      case 'PhantomBuster': return <Zap className="w-4 h-4 text-orange-600" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-gray-100 text-gray-800';
      case 'Opened': return 'bg-blue-100 text-blue-800';
      case 'Replied': return 'bg-green-100 text-green-800';
      case 'Clicked': return 'bg-purple-100 text-purple-800';
      case 'Failed': case 'Bounced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sent': return <Send className="w-3 h-3" />;
      case 'Opened': return <Eye className="w-3 h-3" />;
      case 'Replied': return <MessageCircle className="w-3 h-3" />;
      case 'Clicked': return <TrendingUp className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterChannel !== 'all' && log.channel !== filterChannel) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    return true;
  });

  const exportData = () => {
    const csvData = [
      ['Campaign', 'Contact', 'Email', 'Channel', 'Status', 'Timestamp', 'Subject'],
      ...filteredLogs.map(log => [
        log.campaign_name,
        log.contact_name,
        log.contact_email,
        log.channel,
        log.status,
        new Date(log.timestamp).toLocaleString(),
        log.subject || 'N/A'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_analytics_${selectedCampaign}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaign Analytics</h1>
              <p className="text-gray-600 mt-1">Real-time outreach performance and engagement tracking</p>
            </div>
          </div>
          
          {selectedCampaign && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Campaign</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => setSelectedCampaign(campaign.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCampaign === campaign.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">{campaign.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-1">{campaign.tradeLane}</div>
              <div className="text-xs text-gray-500">{campaign.industry}</div>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading campaign analytics...</p>
          </div>
        </div>
      ) : selectedCampaign ? (
        <div className="space-y-8">
          {/* Performance Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Performance Overview
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {/* Total Contacts */}
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-indigo-900 mb-1">{metrics.total_contacts}</div>
                <div className="text-sm text-indigo-700">Total Contacts</div>
              </div>

              {/* Email Metrics */}
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900 mb-1">{metrics.email_sent}</div>
                <div className="text-sm text-blue-700">Emails Sent</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900 mb-1">{metrics.open_rate}%</div>
                <div className="text-sm text-green-700">Open Rate</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900 mb-1">{metrics.reply_rate}%</div>
                <div className="text-sm text-purple-700">Reply Rate</div>
              </div>

              {/* LinkedIn Metrics */}
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Linkedin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900 mb-1">{metrics.linkedin_sent}</div>
                <div className="text-sm text-orange-700">LinkedIn Sent</div>
              </div>

              {/* PhantomBuster Metrics */}
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-900 mb-1">{metrics.phantombuster_sent}</div>
                <div className="text-sm text-yellow-700">PhantomBuster</div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Click Rate</span>
                <span className="font-semibold text-gray-900">{metrics.click_rate}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Bounce Rate</span>
                <span className="font-semibold text-gray-900">{metrics.bounce_rate}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">LinkedIn Connected</span>
                <span className="font-semibold text-gray-900">{metrics.linkedin_connected}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">PhantomBuster Connected</span>
                <span className="font-semibold text-gray-900">{metrics.phantombuster_connected}</span>
              </div>
            </div>
          </div>

          {/* Outreach Activity Log */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                Recent Outreach Activity ({filteredLogs.length})
              </h3>
              
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterChannel}
                    onChange={(e) => setFilterChannel(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Channels</option>
                    <option value="Email">Email</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="PhantomBuster">PhantomBuster</option>
                  </select>
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="Sent">Sent</option>
                  <option value="Opened">Opened</option>
                  <option value="Replied">Replied</option>
                  <option value="Clicked">Clicked</option>
                  <option value="Bounced">Bounced</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Contact</th>
                    <th className="px-4 py-3 text-left font-medium">Channel</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Subject/Message</th>
                    <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No outreach activity found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{log.contact_name}</div>
                            <div className="text-gray-500 text-xs">{log.contact_email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getChannelIcon(log.channel)}
                            <span className="text-gray-900">{log.channel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                            {getStatusIcon(log.status)}
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <div className="text-gray-900 font-medium text-xs line-clamp-1">
                            {log.subject || 'LinkedIn Message'}
                          </div>
                          <div className="text-gray-500 text-xs line-clamp-2 mt-1">
                            {log.message_preview}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* No Campaign Selected */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Campaign</h3>
          <p className="text-gray-600">
            Choose a campaign above to view detailed analytics and outreach performance
          </p>
        </div>
      )}
    </div>
  );
}