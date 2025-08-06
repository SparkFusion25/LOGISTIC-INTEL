'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Linkedin, Clock, Eye, MessageCircle, ExternalLink, 
  Filter, Calendar, Search, ChevronDown, ChevronRight, User,
  Building2, Send, ArrowRight, History, RefreshCw
} from 'lucide-react';

interface OutreachEntry {
  id: string;
  contact_id: string;
  contact_name: string;
  contact_email: string;
  company: string;
  method: 'Gmail' | 'LinkedIn' | 'Outlook';
  type: 'Sent' | 'Opened' | 'Replied' | 'Clicked' | 'Bounced';
  subject: string;
  snippet: string;
  full_content?: string;
  timestamp: string;
  campaign_id?: string;
  campaign_name?: string;
  thread_id?: string;
  linkedin_url?: string;
  attachment_count?: number;
}

interface OutreachHistoryProps {
  contactId?: string;
  className?: string;
}

export default function OutreachHistory({ contactId, className = '' }: OutreachHistoryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'gmail' | 'linkedin'>('all');
  const [outreachEntries, setOutreachEntries] = useState<OutreachEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<OutreachEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with Supabase integration
  const mockOutreachData: OutreachEntry[] = [
    {
      id: 'out_001',
      contact_id: contactId || 'contact_001',
      contact_name: 'Sarah Chen',
      contact_email: 'sarah.chen@techglobal.com',
      company: 'TechGlobal Solutions',
      method: 'Gmail',
      type: 'Replied',
      subject: 'Re: Competitive shipping rates for electronics imports',
      snippet: 'Thanks for reaching out! We\'re definitely interested in exploring more cost-effective shipping options for our China imports...',
      full_content: 'Thanks for reaching out! We\'re definitely interested in exploring more cost-effective shipping options for our China imports. Our current rates are quite high and we\'re looking for alternatives. Could we schedule a call this week to discuss our requirements in detail?',
      timestamp: '2024-01-20T14:30:00Z',
      campaign_id: 'camp_001',
      campaign_name: 'China Electronics Q1 2024',
      thread_id: 'thread_001'
    },
    {
      id: 'out_002',
      contact_id: contactId || 'contact_001',
      contact_name: 'Sarah Chen',
      contact_email: 'sarah.chen@techglobal.com',
      company: 'TechGlobal Solutions',
      method: 'LinkedIn',
      type: 'Sent',
      subject: 'LinkedIn Connection Request',
      snippet: 'Hi Sarah, I sent you an email about shipping solutions for TechGlobal. Would love to connect and discuss further!',
      full_content: 'Hi Sarah, I sent you an email about shipping solutions for TechGlobal. Would love to connect and discuss how we can help optimize your electronics imports from China.',
      timestamp: '2024-01-18T10:15:00Z',
      linkedin_url: 'https://linkedin.com/in/sarah-chen-techglobal'
    },
    {
      id: 'out_003',
      contact_id: contactId || 'contact_001',
      contact_name: 'Sarah Chen',
      contact_email: 'sarah.chen@techglobal.com',
      company: 'TechGlobal Solutions',
      method: 'Gmail',
      type: 'Opened',
      subject: 'Competitive shipping rates for electronics imports from China',
      snippet: 'Hi Sarah, I noticed TechGlobal imports significant volumes of electronics from China. We specialize in Asia-Pacific trade lanes...',
      full_content: 'Hi Sarah,\n\nI noticed TechGlobal imports significant volumes of electronics from China. We specialize in Asia-Pacific trade lanes and have helped companies like yours reduce shipping costs by 20-30% while improving transit reliability.\n\nOur services include:\n- Dedicated space allocation on premium vessels\n- Customs clearance and documentation\n- Door-to-door logistics solutions\n- Supply chain visibility platform\n\nWould you be open to a brief call this week to discuss your shipping requirements?\n\nBest regards,\nJohn Smith',
      timestamp: '2024-01-15T09:30:00Z',
      campaign_id: 'camp_001',
      campaign_name: 'China Electronics Q1 2024',
      thread_id: 'thread_001',
      attachment_count: 1
    },
    {
      id: 'out_004',
      contact_id: contactId || 'contact_002',
      contact_name: 'Michael Wong',
      contact_email: 'michael.wong@electronics-plus.com',
      company: 'Electronics Plus',
      method: 'Gmail',
      type: 'Clicked',
      subject: 'Partnership opportunity for Asia-Pacific trade',
      snippet: 'Hello Michael, Electronics Plus appears to be a major importer from China and South Korea...',
      full_content: 'Hello Michael,\n\nElectronics Plus appears to be a major importer from China and South Korea. We have extensive experience in Asia-Pacific logistics and would like to explore a partnership opportunity.\n\nClick here to view our case studies: [Link]\n\nBest regards,\nJohn Smith',
      timestamp: '2024-01-12T14:20:00Z',
      campaign_id: 'camp_001',
      campaign_name: 'China Electronics Q1 2024'
    }
  ];

  useEffect(() => {
    loadOutreachHistory();
  }, [contactId]);

  useEffect(() => {
    applyFilters();
  }, [outreachEntries, activeTab, dateFilter, searchQuery]);

  const loadOutreachHistory = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with Supabase query
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const filteredData = contactId 
        ? mockOutreachData.filter(entry => entry.contact_id === contactId)
        : mockOutreachData;
      
      setOutreachEntries(filteredData);
    } catch (error) {
      console.error('Error loading outreach history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...outreachEntries];

    // Filter by method/tab
    if (activeTab === 'gmail') {
      filtered = filtered.filter(entry => entry.method === 'Gmail' || entry.method === 'Outlook');
    } else if (activeTab === 'linkedin') {
      filtered = filtered.filter(entry => entry.method === 'LinkedIn');
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const days = parseInt(dateFilter.replace('d', ''));
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= cutoffDate);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.subject.toLowerCase().includes(query) ||
        entry.snippet.toLowerCase().includes(query) ||
        entry.contact_name.toLowerCase().includes(query) ||
        entry.company.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredEntries(filtered);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Gmail':
      case 'Outlook':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'LinkedIn':
        return <Linkedin className="w-5 h-5 text-purple-600" />;
      default:
        return <Send className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Sent':
        return <Send className="w-4 h-4 text-gray-600" />;
      case 'Opened':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'Replied':
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'Clicked':
        return <ExternalLink className="w-4 h-4 text-purple-600" />;
      case 'Bounced':
        return <ArrowRight className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Sent':
        return 'bg-gray-100 text-gray-800';
      case 'Opened':
        return 'bg-blue-100 text-blue-800';
      case 'Replied':
        return 'bg-green-100 text-green-800';
      case 'Clicked':
        return 'bg-purple-100 text-purple-800';
      case 'Bounced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Outreach History</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {filteredEntries.length}
            </span>
          </div>
          
          <button
            onClick={loadOutreachHistory}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-2 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
          {[
            { key: 'all', label: 'All Channels' },
            { key: 'gmail', label: 'Email' },
            { key: 'linkedin', label: 'LinkedIn' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages, contacts, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">Loading outreach history...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Outreach History Found</h4>
            <p className="text-gray-600">
              {searchQuery || dateFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Start engaging with this contact to see outreach history here.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline */}
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {filteredEntries.map((entry, index) => (
                <div key={entry.id} className="relative flex items-start space-x-4 pb-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full">
                    {getMethodIcon(entry.method)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors"
                      onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{entry.method}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(entry.type)}`}>
                            {getTypeIcon(entry.type)}
                            {entry.type}
                          </span>
                          {entry.campaign_name && (
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs rounded-full">
                              {entry.campaign_name}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatTimestamp(entry.timestamp)}
                          {expandedEntry === entry.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <h4 className="font-medium text-gray-900 mb-1">{entry.subject}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{entry.snippet}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {entry.contact_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {entry.company}
                          </div>
                          {entry.attachment_count && (
                            <span>{entry.attachment_count} attachment{entry.attachment_count > 1 ? 's' : ''}</span>
                          )}
                        </div>
                        
                        {entry.linkedin_url && (
                          <a
                            href={entry.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Profile
                          </a>
                        )}
                      </div>
                      
                      {/* Expanded content */}
                      {expandedEntry === entry.id && entry.full_content && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-900 mb-2">Full Message:</h5>
                          <div className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {entry.full_content}
                          </div>
                          
                          {(entry.method === 'Gmail' || entry.method === 'Outlook') && (
                            <div className="mt-3 flex items-center gap-2">
                              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm">
                                Reply
                              </button>
                              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm">
                                Forward
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}