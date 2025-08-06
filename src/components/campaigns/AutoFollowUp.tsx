'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Mail, Linkedin, Send, Zap, Target, 
  ChevronLeft, ChevronRight, Plus, Edit, Trash2, Play,
  Pause, CheckCircle, AlertCircle, Eye, MessageCircle,
  Settings, RefreshCw, Filter, Download
} from 'lucide-react';

interface FollowUpRule {
  id: string;
  name: string;
  contactId?: string;
  campaignId?: string;
  method: 'Gmail' | 'Outlook' | 'LinkedIn';
  templateId: string;
  templateName: string;
  delay: number;
  delayUnit: 'hours' | 'days' | 'weeks';
  smartTiming: boolean;
  conditions: {
    ifOpened?: boolean;
    ifClicked?: boolean;
    ifReplied?: boolean;
    ifNotResponded?: boolean;
  };
  status: 'active' | 'paused' | 'completed';
  scheduledFor: string;
  createdAt: string;
  lastExecuted?: string;
  nextExecution?: string;
}

interface FollowUpExecution {
  id: string;
  ruleId: string;
  contactEmail: string;
  contactName: string;
  method: string;
  status: 'scheduled' | 'sent' | 'opened' | 'replied' | 'failed';
  scheduledFor: string;
  executedAt?: string;
  subject: string;
  templateUsed: string;
}

interface AutoFollowUpProps {
  contactId?: string;
  campaignId?: string;
  className?: string;
}

export default function AutoFollowUp({ contactId, campaignId, className = '' }: AutoFollowUpProps) {
  const [currentView, setCurrentView] = useState<'rules' | 'calendar' | 'executions'>('rules');
  const [followUpRules, setFollowUpRules] = useState<FollowUpRule[]>([]);
  const [executions, setExecutions] = useState<FollowUpExecution[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mock data
  const mockRules: FollowUpRule[] = [
    {
      id: 'rule_001',
      name: 'Electronics Importer Follow-up Sequence',
      contactId: 'contact_001',
      campaignId: 'camp_001',
      method: 'Gmail',
      templateId: 'template_001',
      templateName: 'Follow-up: Competitive Shipping Rates',
      delay: 3,
      delayUnit: 'days',
      smartTiming: true,
      conditions: {
        ifNotResponded: true
      },
      status: 'active',
      scheduledFor: '2024-01-23T09:00:00Z',
      createdAt: '2024-01-20T10:00:00Z',
      nextExecution: '2024-01-23T09:00:00Z'
    },
    {
      id: 'rule_002',
      name: 'LinkedIn Connection Follow-up',
      contactId: 'contact_001',
      method: 'LinkedIn',
      templateId: 'template_002',
      templateName: 'LinkedIn: Thanks for connecting',
      delay: 1,
      delayUnit: 'days',
      smartTiming: false,
      conditions: {
        ifOpened: true
      },
      status: 'active',
      scheduledFor: '2024-01-22T14:00:00Z',
      createdAt: '2024-01-21T10:00:00Z',
      nextExecution: '2024-01-22T14:00:00Z'
    },
    {
      id: 'rule_003',
      name: 'Auto Parts Partnership Reminder',
      contactId: 'contact_002',
      campaignId: 'camp_002',
      method: 'Gmail',
      templateId: 'template_003',
      templateName: 'Reminder: Partnership Discussion',
      delay: 1,
      delayUnit: 'weeks',
      smartTiming: true,
      conditions: {
        ifNotResponded: true
      },
      status: 'paused',
      scheduledFor: '2024-01-29T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ];

  const mockExecutions: FollowUpExecution[] = [
    {
      id: 'exec_001',
      ruleId: 'rule_001',
      contactEmail: 'sarah.chen@techglobal.com',
      contactName: 'Sarah Chen',
      method: 'Gmail',
      status: 'sent',
      scheduledFor: '2024-01-20T09:00:00Z',
      executedAt: '2024-01-20T09:02:00Z',
      subject: 'Follow-up: Competitive shipping rates for electronics imports',
      templateUsed: 'Follow-up: Competitive Shipping Rates'
    },
    {
      id: 'exec_002',
      ruleId: 'rule_002',
      contactEmail: 'michael.wong@electronics-plus.com',
      contactName: 'Michael Wong',
      method: 'LinkedIn',
      status: 'scheduled',
      scheduledFor: '2024-01-22T14:00:00Z',
      subject: 'LinkedIn connection follow-up',
      templateUsed: 'LinkedIn: Thanks for connecting'
    },
    {
      id: 'exec_003',
      ruleId: 'rule_001',
      contactEmail: 'jennifer.liu@smart-devices.com',
      contactName: 'Jennifer Liu',
      method: 'Gmail',
      status: 'opened',
      scheduledFor: '2024-01-21T10:30:00Z',
      executedAt: '2024-01-21T10:32:00Z',
      subject: 'Follow-up: Your interest in logistics optimization',
      templateUsed: 'Follow-up: Competitive Shipping Rates'
    }
  ];

  const emailTemplates = [
    { id: 'template_001', name: 'Follow-up: Competitive Shipping Rates', method: 'Gmail' },
    { id: 'template_002', name: 'LinkedIn: Thanks for connecting', method: 'LinkedIn' },
    { id: 'template_003', name: 'Reminder: Partnership Discussion', method: 'Gmail' },
    { id: 'template_004', name: 'Cold Chain Logistics Follow-up', method: 'Gmail' },
    { id: 'template_005', name: 'Freight Rate Comparison', method: 'Outlook' }
  ];

  useEffect(() => {
    loadFollowUpRules();
    loadExecutions();
  }, [contactId, campaignId]);

  const loadFollowUpRules = async () => {
    // Simulate loading from Supabase
    let filteredRules = mockRules;
    
    if (contactId) {
      filteredRules = filteredRules.filter(rule => rule.contactId === contactId);
    }
    
    if (campaignId) {
      filteredRules = filteredRules.filter(rule => rule.campaignId === campaignId);
    }
    
    setFollowUpRules(filteredRules);
  };

  const loadExecutions = async () => {
    // Simulate loading executions
    setExecutions(mockExecutions);
  };

  const createNewRule = () => {
    setIsCreating(true);
    setEditingRule(null);
  };

  const saveRule = (ruleData: Partial<FollowUpRule>) => {
    const newRule: FollowUpRule = {
      id: `rule_${Date.now()}`,
      name: ruleData.name || 'New Follow-up Rule',
      contactId: contactId,
      campaignId: campaignId,
      method: ruleData.method || 'Gmail',
      templateId: ruleData.templateId || 'template_001',
      templateName: ruleData.templateName || 'Default Template',
      delay: ruleData.delay || 3,
      delayUnit: ruleData.delayUnit || 'days',
      smartTiming: ruleData.smartTiming || false,
      conditions: ruleData.conditions || { ifNotResponded: true },
      status: 'active',
      scheduledFor: calculateNextExecution(ruleData.delay || 3, ruleData.delayUnit || 'days', ruleData.smartTiming || false),
      createdAt: new Date().toISOString(),
      nextExecution: calculateNextExecution(ruleData.delay || 3, ruleData.delayUnit || 'days', ruleData.smartTiming || false)
    };

    setFollowUpRules(prev => [newRule, ...prev]);
    setIsCreating(false);
  };

  const calculateNextExecution = (delay: number, unit: string, smartTiming: boolean) => {
    const now = new Date();
    let nextDate = new Date(now);

    switch (unit) {
      case 'hours':
        nextDate.setHours(nextDate.getHours() + delay);
        break;
      case 'days':
        nextDate.setDate(nextDate.getDate() + delay);
        break;
      case 'weeks':
        nextDate.setDate(nextDate.getDate() + (delay * 7));
        break;
    }

    if (smartTiming) {
      // Set to optimal time (9 AM in user's timezone)
      nextDate.setHours(9, 0, 0, 0);
      
      // Avoid weekends
      if (nextDate.getDay() === 0) { // Sunday
        nextDate.setDate(nextDate.getDate() + 1);
      } else if (nextDate.getDay() === 6) { // Saturday
        nextDate.setDate(nextDate.getDate() + 2);
      }
    }

    return nextDate.toISOString();
  };

  const toggleRuleStatus = (ruleId: string) => {
    setFollowUpRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, status: rule.status === 'active' ? 'paused' : 'active' }
        : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setFollowUpRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'sent':
        return <Send className="w-4 h-4 text-gray-600" />;
      case 'opened':
        return <Eye className="w-4 h-4 text-green-600" />;
      case 'replied':
        return <MessageCircle className="w-4 h-4 text-purple-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-gray-100 text-gray-800';
      case 'opened':
        return 'bg-green-100 text-green-800';
      case 'replied':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Gmail':
      case 'Outlook':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4 text-purple-600" />;
      default:
        return <Send className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatNextExecution = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) {
      return `In ${diffDays} days`;
    } else if (diffHours > 1) {
      return `In ${diffHours} hours`;
    } else if (diffMs > 0) {
      return 'Soon';
    } else {
      return 'Overdue';
    }
  };

  const filteredExecutions = executions.filter(execution => {
    if (statusFilter === 'all') return true;
    return execution.status === statusFilter;
  });

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Auto Follow-Up Sequences</h3>
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
              Smart Timing
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-2 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={createNewRule}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Rule
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'rules', label: 'Follow-up Rules', icon: Settings },
            { key: 'calendar', label: 'Calendar View', icon: Calendar },
            { key: 'executions', label: 'Execution Log', icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setCurrentView(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === tab.key
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* Rules View */}
        {currentView === 'rules' && (
          <div>
            {isCreating && (
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Create New Follow-up Rule</h4>
                <CreateRuleForm 
                  onSave={saveRule}
                  onCancel={() => setIsCreating(false)}
                  templates={emailTemplates}
                />
              </div>
            )}

            <div className="space-y-4">
              {followUpRules.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Follow-up Rules</h4>
                  <p className="text-gray-600 mb-4">
                    Create automated follow-up sequences to nurture your contacts
                  </p>
                  <button
                    onClick={createNewRule}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                  >
                    Create Your First Rule
                  </button>
                </div>
              ) : (
                followUpRules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(rule.method)}
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rule.status === 'active' ? 'bg-green-100 text-green-800' :
                          rule.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.status}
                        </span>
                        {rule.smartTiming && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">
                            Smart Timing
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRuleStatus(rule.id)}
                          className={`p-1 rounded transition-colors ${
                            rule.status === 'active' 
                              ? 'text-yellow-600 hover:text-yellow-700' 
                              : 'text-green-600 hover:text-green-700'
                          }`}
                          title={rule.status === 'active' ? 'Pause rule' : 'Activate rule'}
                        >
                          {rule.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditingRule(rule.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                          title="Edit rule"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Template:</span>
                        <span className="ml-2 font-medium">{rule.templateName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Delay:</span>
                        <span className="ml-2 font-medium">{rule.delay} {rule.delayUnit}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Next execution:</span>
                        <span className="ml-2 font-medium">
                          {rule.nextExecution ? formatNextExecution(rule.nextExecution) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Conditions:</span>
                      {Object.entries(rule.conditions).filter(([_, value]) => value).map(([key]) => (
                        <span key={key} className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {key.replace('if', '').replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-medium text-gray-900">Scheduled Follow-ups</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-gray-900">
                  {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid gap-3">
              {followUpRules
                .filter(rule => rule.status === 'active' && rule.nextExecution)
                .sort((a, b) => new Date(a.nextExecution!).getTime() - new Date(b.nextExecution!).getTime())
                .map((rule) => (
                  <div key={rule.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-sm">
                        {new Date(rule.nextExecution!).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(rule.nextExecution!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getMethodIcon(rule.method)}
                      <span className="text-sm">{rule.method}</span>
                    </div>
                    
                    <div className="flex-1">
                      <span className="text-sm font-medium">{rule.name}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {formatNextExecution(rule.nextExecution!)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Executions View */}
        {currentView === 'executions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-medium text-gray-900">Execution Log</h4>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="opened">Opened</option>
                  <option value="replied">Replied</option>
                  <option value="failed">Failed</option>
                </select>
                
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredExecutions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No executions found for the selected filters.</p>
                </div>
              ) : (
                filteredExecutions.map((execution) => (
                  <div key={execution.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(execution.method)}
                          <span className="font-medium text-gray-900">{execution.contactName}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(execution.status)}`}>
                          {getStatusIcon(execution.status)}
                          {execution.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {execution.executedAt 
                          ? new Date(execution.executedAt).toLocaleDateString()
                          : new Date(execution.scheduledFor).toLocaleDateString()
                        }
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Subject:</span> {execution.subject}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Template: {execution.templateUsed}</span>
                      <span>{execution.contactEmail}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Create Rule Form Component
interface CreateRuleFormProps {
  onSave: (ruleData: Partial<FollowUpRule>) => void;
  onCancel: () => void;
  templates: Array<{ id: string; name: string; method: string }>;
}

function CreateRuleForm({ onSave, onCancel, templates }: CreateRuleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    method: 'Gmail' as 'Gmail' | 'Outlook' | 'LinkedIn',
    templateId: '',
    delay: 3,
    delayUnit: 'days' as 'hours' | 'days' | 'weeks',
    smartTiming: true,
    conditions: {
      ifNotResponded: true,
      ifOpened: false,
      ifClicked: false,
      ifReplied: false
    }
  });

  const filteredTemplates = templates.filter(template => 
    template.method === formData.method || template.method === 'All'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedTemplate = templates.find(t => t.id === formData.templateId);
    
    onSave({
      ...formData,
      templateName: selectedTemplate?.name || 'Unknown Template'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter rule name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
          <select
            value={formData.method}
            onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any, templateId: '' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="Gmail">Gmail</option>
            <option value="Outlook">Outlook</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
          <select
            value={formData.templateId}
            onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
          >
            <option value="">Select template</option>
            {filteredTemplates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delay</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.delay}
              onChange={(e) => setFormData(prev => ({ ...prev, delay: parseInt(e.target.value) || 1 }))}
              min="1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <select
              value={formData.delayUnit}
              onChange={(e) => setFormData(prev => ({ ...prev, delayUnit: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.smartTiming}
            onChange={(e) => setFormData(prev => ({ ...prev, smartTiming: e.target.checked }))}
            className="text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">Enable Smart Timing (AI-optimized send time)</span>
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Conditions</label>
        <div className="space-y-2">
          {Object.entries(formData.conditions).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  conditions: { ...prev.conditions, [key]: e.target.checked }
                }))}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">
                {key.replace('if', '').replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3 pt-4">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Create Rule
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}