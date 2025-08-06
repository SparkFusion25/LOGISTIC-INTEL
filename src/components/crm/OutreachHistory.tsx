'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, Linkedin, Clock, Eye, MessageCircle, ExternalLink, 
  Filter, Calendar, Search, ChevronDown, ChevronRight, User,
  Building2, Send, ArrowRight, History, RefreshCw
} from 'lucide-react';
import { getOutreachHistory } from '@/lib/api/outreach';

interface OutreachEntry {
  id: string;
  contactId: string;
  platform: 'gmail' | 'linkedin' | 'outlook';
  type: 'sent' | 'opened' | 'replied' | 'clicked' | 'bounced';
  subject?: string;
  snippet?: string;
  fullContent?: string;
  timestamp: string;
  engagementStatus: string;
  threadId?: string;
  campaignId?: string;
  campaignName?: string;
  linkedinUrl?: string;
  gmailMessageId?: string;
  contact?: {
    id: string;
    name: string;
    email: string;
    company: string;
  };
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOutreachHistory();
  }, [contactId, activeTab]);

  useEffect(() => {
    applyFilters();
  }, [outreachEntries, dateFilter, searchQuery]);

  const loadOutreachHistory = async () => {
    if (!contactId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const platform = activeTab === 'all' ? undefined : activeTab;
      const response = await getOutreachHistory(contactId, { 
        platform,
        limit: 100 
      });
      
      setOutreachEntries(response.data);
    } catch (error) {
      console.error('Error loading outreach history:', error);
      setError('Failed to load outreach history. Please try again.');
      // Fallback to empty array instead of crash
      setOutreachEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...outreachEntries];

    // Date filtering (platform filtering is now handled in loadOutreachHistory)
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
        (entry.subject?.toLowerCase().includes(query)) ||
        (entry.snippet?.toLowerCase().includes(query)) ||
        (entry.contact?.name?.toLowerCase().includes(query)) ||
        (entry.contact?.company?.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredEntries(filtered);
  };

  const getMethodIcon = (platform: string) => {
    switch (platform) {
      case 'gmail':
      case 'outlook':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-purple-600" />;
      default:
        return <Send className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <Send className="w-4 h-4 text-gray-600" />;
      case 'opened':
        return <Eye className="w-4 h-4 text-blue-600" />;
      case 'replied':
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      case 'clicked':
        return <ExternalLink className="w-4 h-4 text-purple-600" />;
      case 'bounced':
        return <ArrowRight className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sent':
        return 'bg-gray-100 text-gray-800';
      case 'opened':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'clicked':
        return 'bg-purple-100 text-purple-800';
      case 'bounced':
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
        {error ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading History</h4>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadOutreachHistory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
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
                : contactId 
                  ? 'No outreach activity found for this contact.'
                  : 'Please select a contact to view outreach history.'
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
                    {getMethodIcon(entry.platform)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors"
                      onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 capitalize">{entry.platform}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(entry.type)}`}>
                            {getTypeIcon(entry.type)}
                            <span className="capitalize">{entry.type}</span>
                          </span>
                          {entry.campaignName && (
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs rounded-full">
                              {entry.campaignName}
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
                        <h4 className="font-medium text-gray-900 mb-1">{entry.subject || '(No Subject)'}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{entry.snippet || 'No preview available'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          {entry.contact && (
                            <>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {entry.contact.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {entry.contact.company}
                              </div>
                            </>
                          )}
                          <div className="flex items-center gap-1">
                            <span className="capitalize">{entry.engagementStatus}</span>
                          </div>
                        </div>
                        
                        {entry.linkedinUrl && (
                          <a
                            href={entry.linkedinUrl}
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
                      {expandedEntry === entry.id && entry.fullContent && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-900 mb-2">Full Message:</h5>
                          <div className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {entry.fullContent}
                          </div>
                          
                          {(entry.platform === 'gmail' || entry.platform === 'outlook') && (
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