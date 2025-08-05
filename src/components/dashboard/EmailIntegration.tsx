'use client';

import { useState, useEffect } from 'react';
import { Mail, Send, Users, Zap, Globe, Target, Eye, MousePointer, MessageCircle, CheckCircle, Clock, ExternalLink, Linkedin, Phone, Settings, TrendingUp, FileText, Sparkles, AlertCircle } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
}

interface CRMLead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  stage: string;
}

interface EmailStatus {
  connected: boolean;
  email: string | null;
  provider: string | null;
}

interface EmailStats {
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  unique_contacts: number;
}

export default function EmailIntegration() {
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    connected: false,
    email: null,
    provider: null
  });
  
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [crmContacts, setCrmContacts] = useState<CRMLead[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<EmailStats>({
    emails_sent: 0,
    emails_opened: 0,
    emails_replied: 0,
    unique_contacts: 0
  });

  useEffect(() => {
    loadEmailStatus();
    loadTemplates();
    loadCRMContacts();
    loadEmailStats();
  }, []);

  const loadEmailStatus = async () => {
    try {
      const res = await fetch('/api/email/status');
      const data = await res.json();
      if (data.success) {
        setEmailStatus({
          connected: data.connected,
          email: data.email,
          provider: data.provider
        });
      }
    } catch (error) {
      console.error('Failed to load email status:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/email/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadCRMContacts = async () => {
    try {
      const res = await fetch('/api/crm/leads');
      const data = await res.json();
      if (data.success) {
        setCrmContacts(data.leads);
      }
    } catch (error) {
      console.error('Failed to load CRM contacts:', error);
    }
  };

  const loadEmailStats = async () => {
    try {
      const res = await fetch('/api/crm/log');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load email stats:', error);
    }
  };

  const connectGmail = () => {
    window.location.href = '/api/oauth/gmail';
  };

  const connectOutlook = () => {
    window.location.href = '/api/oauth/outlook';
  };

  const selectContact = (contact: CRMLead) => {
    setTo(contact.email);
    setVariables(prev => ({
      ...prev,
      firstName: contact.name.split(' ')[0],
      company: contact.company,
      title: contact.title
    }));
  };

  const selectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setSelectedTemplate(templateId);
      
      // Initialize variables object
      const newVariables: { [key: string]: string } = {};
      template.variables.forEach(variable => {
        newVariables[variable] = variables[variable] || '';
      });
      setVariables(newVariables);
    }
  };

  const updateVariable = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const previewEmail = () => {
    let previewSubject = subject;
    let previewBody = body;
    
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      previewSubject = previewSubject.replace(new RegExp(placeholder, 'g'), variables[key]);
      previewBody = previewBody.replace(new RegExp(placeholder, 'g'), variables[key]);
    });
    
    return { subject: previewSubject, body: previewBody };
  };

  const sendEmail = async () => {
    if (!to || !subject || !body) {
      alert('Please fill in all required fields');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          body,
          variables,
          track_opens: true,
          track_clicks: true
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Email sent successfully!');
        // Clear form
        setTo('');
        setSubject('');
        setBody('');
        setVariables({});
        setSelectedTemplate('');
        loadEmailStats(); // Refresh stats
      } else {
        alert('❌ Failed to send email: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('❌ Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const categories = ['introduction', 'follow_up', 'intelligence', 'case_study', 'urgent', 'review'];
  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  const getCurrentTemplate = () => templates.find(t => t.id === selectedTemplate);
  const preview = previewEmail();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">📧 Email Outreach Hub</h2>
              <p className="text-blue-200 text-sm mt-1">Intelligence-driven campaign launcher for logistics professionals</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.emails_sent}</div>
              <div className="text-xs">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">{stats.emails_opened}</div>
              <div className="text-xs">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{stats.emails_replied}</div>
              <div className="text-xs">Replied</div>
            </div>
          </div>
        </div>
      </div>

      {/* OAuth Connection Status */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        {!emailStatus.connected ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Connect Your Email Account</h3>
            </div>
            <p className="text-amber-700 mb-4 text-sm">Connect Gmail or Outlook to start sending intelligence-driven outreach emails.</p>
            <div className="flex gap-3">
              <button 
                onClick={connectGmail}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                Connect Gmail
              </button>
              <button 
                onClick={connectOutlook}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                Connect Outlook
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Email Connected</p>
                  <p className="text-green-700 text-sm">{emailStatus.email} via {emailStatus.provider}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Ready for outreach</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* Left Column: Email Composer */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Campaign Composer
            </h3>

            {/* CRM Contact Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Select from CRM Contacts
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  const contact = crmContacts.find(c => c.id === e.target.value);
                  if (contact) selectContact(contact);
                }}
                value=""
              >
                <option value="">Choose a contact...</option>
                {crmContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} ({contact.company}) - {contact.stage}
                  </option>
                ))}
              </select>
            </div>

            {/* To Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="email@company.com"
              />
            </div>

            {/* Subject Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line"
              />
            </div>

            {/* Template Variables */}
            {getCurrentTemplate() && getCurrentTemplate()!.variables.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Smart Variables
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getCurrentTemplate()!.variables.map(variable => (
                    <input
                      key={variable}
                      type="text"
                      placeholder={`{{${variable}}}`}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={variables[variable] || ''}
                      onChange={(e) => updateVariable(variable, e.target.value)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Body Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Compose your intelligence-driven outreach message..."
              />
            </div>

            {/* Send Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={sendEmail}
                disabled={!emailStatus.connected || sending || !to || !subject || !body}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Launch Campaign
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>Opens tracked</span>
                <MousePointer className="w-4 h-4" />
                <span>Clicks tracked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Templates & Intelligence */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Intelligence Templates
            </h3>

            {/* Template Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category:</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Template:</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedTemplate}
                onChange={(e) => selectTemplate(e.target.value)}
              >
                <option value="">Choose a template...</option>
                {filteredTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {template.category.replace('_', ' ').toUpperCase()} • {template.variables.length} variables
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Preview */}
          {(subject || body) && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                Email Preview
              </h3>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="border-b border-gray-200 pb-2 mb-3">
                  <div className="text-sm font-medium text-gray-700">Subject:</div>
                  <div className="text-sm text-gray-900">{preview.subject || 'No subject'}</div>
                </div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap">
                  {preview.body || 'No message body'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Intelligence-Driven Outreach</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.unique_contacts} contacts engaged</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span>Apollo + Lemlist + DSV style</span>
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}