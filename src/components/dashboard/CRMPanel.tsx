'use client';

import { useEffect, useState } from 'react';
import { Mail, Trash2, Linkedin, UserCheck, Filter, RefreshCw, Users, TrendingUp, Clock, ExternalLink, Eye, X } from 'lucide-react';
import OutreachHistory from '@/components/crm/OutreachHistory';

interface CRMLead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  last_contacted: string;
  stage: 'Prospect' | 'Contacted' | 'Nurturing' | 'Converted';
  source: 'Search' | 'Manual' | 'Campaign';
  notes?: string;
  createdAt: string;
}

export default function CRMPanel() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [showOutreachHistory, setShowOutreachHistory] = useState(false);
  const [filters, setFilters] = useState({ 
    stage: '', 
    company: '', 
    name: '' 
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/crm/leads?${params.toString()}`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStage = async (leadId: string, stage: string) => {
    try {
      await fetch('/api/crm/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, stage }),
      });
      fetchLeads();
    } catch (error) {
      console.error('Failed to update stage:', error);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (confirm('Delete this lead?')) {
      try {
        await fetch('/api/crm/delete-lead', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: leadId }),
        });
        fetchLeads();
      } catch (error) {
        console.error('Failed to delete lead:', error);
      }
    }
  };

  const sendEmail = (email: string) => {
    window.open(`/dashboard/email?to=${email}`, '_blank');
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Prospect': return 'bg-gray-100 text-gray-800';
      case 'Contacted': return 'bg-blue-100 text-blue-800';
      case 'Nurturing': return 'bg-yellow-100 text-yellow-800';
      case 'Converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Search': return '🔍';
      case 'Manual': return '✋';
      case 'Campaign': return '📧';
      default: return '📋';
    }
  };

  const getStageStats = () => {
    const stats = {
      Prospect: leads.filter(l => l.stage === 'Prospect').length,
      Contacted: leads.filter(l => l.stage === 'Contacted').length,
      Nurturing: leads.filter(l => l.stage === 'Nurturing').length,
      Converted: leads.filter(l => l.stage === 'Converted').length,
    };
    return stats;
  };

  const stats = getStageStats();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-900 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-bold">📇 CRM Dashboard</h2>
              <p className="text-indigo-200 text-sm mt-1">Manage leads and track outreach progress</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-indigo-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{leads.length}</div>
              <div className="text-xs">Total Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">{stats.Converted}</div>
              <div className="text-xs">Converted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-4 gap-4 mb-4">
          {Object.entries(stats).map(([stage, count]) => (
            <div key={stage} className="bg-white p-3 rounded-lg border text-center">
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-600">{stage}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search leads..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Company</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Company name..."
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Stage</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.stage}
              onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
            >
              <option value="">All Stages</option>
              <option value="Prospect">Prospect</option>
              <option value="Contacted">Contacted</option>
              <option value="Nurturing">Nurturing</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              className="w-full bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-semibold flex items-center justify-center gap-2 transition-colors" 
              onClick={fetchLeads}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Leads'}
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CRM leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No leads found</p>
          <p className="text-sm">Try adjusting your filters or add new leads from the search panel</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-left font-semibold">Company & Title</th>
                <th className="px-4 py-3 text-left font-semibold">Contact Info</th>
                <th className="px-4 py-3 text-left font-semibold">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Last Contacted
                </th>
                <th className="px-4 py-3 text-left font-semibold">Stage</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-gray-900">{lead.name}</div>
                      {lead.notes && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {lead.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{lead.company}</div>
                      <div className="text-xs text-gray-600">{lead.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">{lead.email}</div>
                      {lead.phone && (
                        <div className="text-xs text-gray-600">{lead.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.last_contacted}</td>
                  <td className="px-4 py-3">
                    <select
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStageColor(lead.stage)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      value={lead.stage}
                      onChange={(e) => updateStage(lead.id, e.target.value)}
                    >
                      <option value="Prospect">Prospect</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Nurturing">Nurturing</option>
                      <option value="Converted">Converted</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs">
                      {getSourceIcon(lead.source)} {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => sendEmail(lead.email)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded flex items-center justify-center transition-colors"
                        title="Send Email"
                      >
                        <Mail className="w-3 h-3" />
                      </button>
                      {lead.linkedin && (
                        <a
                          href={lead.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-800 hover:bg-blue-900 text-white p-1 rounded flex items-center justify-center transition-colors"
                          title="View LinkedIn"
                        >
                          <Linkedin className="w-3 h-3" />
                        </a>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowOutreachHistory(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded flex items-center justify-center transition-colors"
                        title="View Outreach History"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => deleteLead(lead.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded flex items-center justify-center transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {leads.length} leads
          </div>
          <div className="flex items-center gap-4">
            <span>Apollo.io-style CRM for Logistics</span>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Outreach History Modal */}
      {showOutreachHistory && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Outreach History - {selectedLead.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedLead.company} • {selectedLead.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOutreachHistory(false);
                  setSelectedLead(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <OutreachHistory contactId={selectedLead.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}