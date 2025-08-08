'use client'

import React, { useEffect, useState } from 'react';
import { 
  Search, TrendingUp, Ship, Plane, Globe, Building2, 
  Package, MapPin, Calendar, DollarSign, Users, Plus,
  ChevronDown, ChevronUp, Mail, Phone, BarChart3, Activity, Send
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Shipment = {
  unified_id: string;
  bol_number: string | null;
  arrival_date: string;
  vessel_name: string | null;
  gross_weight_kg?: number;
  weight_kg?: number;
  value_usd: number;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  hs_code: string | null;
  shipment_type: 'ocean' | 'air';
};

type Contact = {
  id?: string;
  full_name?: string;
  contact_name?: string;
  email: string;
  title?: string;
  phone?: string;
};

type Company = {
  company_name: string;
  shipment_mode: 'ocean' | 'air' | 'mixed';
  total_shipments: number;
  total_weight_kg: number;
  total_value_usd: number;
  confidence_score: number;
  first_arrival: string;
  last_arrival: string;
  shipments: Shipment[];
  contacts?: Contact[];
};

const SearchPanel: React.FC = () => {
  const supabase = createClientComponentClient();

  const [viewMode, setViewMode] = useState<'cards' | 'map' | 'table'>('cards');
  const [filterMode, setFilterMode] = useState<'all' | 'ocean' | 'air'>('all');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set<string>());
  const [loading, setLoading] = useState<boolean>(false);
  const [userPlan, setUserPlan] = useState<'trial' | 'starter' | 'pro' | 'enterprise'>('trial');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchFilters, setSearchFilters] = useState<{ company: string; originCountry: string; destinationCountry: string; commodity: string; }>(
    {
      company: '',
      originCountry: '',
      destinationCountry: '',
      commodity: ''
    }
  );

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase.rpc('get_user_plan', { uid: user.id });
        if (!error && typeof data === 'string') {
          const plan = data.toLowerCase() as 'trial' | 'starter' | 'pro' | 'enterprise';
          setUserPlan(plan);
        }
      } catch (e) {
        // ignore plan load errors
      }
    };
    loadPlan();
  }, []);

  const fetchContactsForCompany = async (companyName: string): Promise<Contact[]> => {
    try {
      const res = await fetch(`/api/crm/contacts?company=${encodeURIComponent(companyName)}&limit=25`, { cache: 'no-store' });
      const json = await res.json();
      if (json?.success && Array.isArray(json.contacts)) {
        // Normalize shape
        return json.contacts.map((c: any) => ({
          id: c.id,
          full_name: c.contact_name || c.full_name,
          email: c.email || '',
          phone: c.phone || '',
        }));
      }
    } catch {}
    return [];
  };

  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('mode', filterMode);
      if (searchFilters.company) params.set('company', searchFilters.company);
      if (searchFilters.originCountry) params.set('originCountry', searchFilters.originCountry);
      if (searchFilters.destinationCountry) params.set('destinationCountry', searchFilters.destinationCountry);
      if (searchFilters.commodity) params.set('commodity', searchFilters.commodity);

      const res = await fetch(`/api/search/unified?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();

      if (json?.success && Array.isArray(json.data)) {
        const mapped: Company[] = json.data.map((c: any) => ({
          company_name: c.company_name,
          shipment_mode: c.shipment_mode,
          total_shipments: c.total_shipments,
          total_weight_kg: c.total_weight_kg || 0,
          total_value_usd: c.total_value_usd || 0,
          confidence_score: c.confidence_score || 0,
          first_arrival: c.first_arrival || '',
          last_arrival: c.last_arrival || '',
          shipments: (c.shipments || []).map((s: any): Shipment => ({
            unified_id: s.unified_id,
            bol_number: s.bol_number,
            arrival_date: s.arrival_date,
            vessel_name: s.vessel_name,
            value_usd: Number(s.value_usd) || 0,
            weight_kg: Number(s.weight_kg) || 0,
            // normalize field names for UI
            port_of_loading: s.port_of_lading || s.port_of_loading || null,
            port_of_discharge: s.port_of_discharge || null,
            hs_code: s.hs_code || null,
            shipment_type: (c.shipment_mode === 'mixed' ? (s.shipment_type as 'ocean' | 'air') : c.shipment_mode) as 'ocean' | 'air',
          })),
          contacts: [],
        }));
        setCompanies(mapped);
      } else {
        setCompanies([]);
      }
    } catch (e) {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCRM = async (companyName: string): Promise<void> => {
    try {
      // Add minimal lead
      const addRes = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName, source: 'Trade Search' })
      });
      // Proceed even if already exists
      // Trigger enrichment
      await fetch('/api/crm/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: companyName })
      });
      // Refresh contacts for this company
      const contacts = await fetchContactsForCompany(companyName);
      setCompanies(prev => prev.map(c => c.company_name === companyName ? { ...c, contacts } : c));
    } catch {}
  };

  const handleSendInsight = async (company: Company): Promise<void> => {
    try {
      const toEmail = company.contacts && company.contacts.length > 0 ? (company.contacts[0].email || '') : '';
      if (!toEmail) return; // nothing to send without a contact
      const subject = `Logistics insight for ${company.company_name}`;
      const body = `Hi,

We identified ${company.total_shipments} recent shipments for ${company.company_name}. Value: $${(company.total_value_usd/1_000_000).toFixed(1)}M.

Route highlights and trends attached.
\nRegards,\nYour Team`;
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toEmail, subject, body })
      });
    } catch {}
  };

  const toggleCompanyExpansion = (companyName: string, section: string = ''): void => {
    const key = companyName + section;
    const newExpanded = new Set<string>(expandedCompanies);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCompanies(newExpanded);
  };

  const mapShipments = companies.flatMap((company: Company) => 
    company.shipments.map((s: Shipment) => ({
      company: company.company_name,
      origin: s.port_of_loading,
      destination: s.port_of_discharge,
      type: s.shipment_type,
      value: s.value_usd
    }))
  );

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getModeColor = (mode: 'ocean' | 'air' | 'mixed'): string => {
    if (mode === 'ocean') return 'bg-blue-100 text-blue-800';
    if (mode === 'air') return 'bg-sky-100 text-sky-800';
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                Global Trade Intelligence Platform
              </h1>
              <p className="text-gray-600 mt-1">
                Search shipments, analyze trends, and connect with decision makers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                <span className="text-gray-500">Plan: </span>
                <span className="font-semibold text-indigo-600">{userPlan.toUpperCase()}</span>
              </span>
              <div className="flex gap-2">
                {(['cards', 'map', 'table'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded ${viewMode === mode ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
                  >
                    {mode === 'cards' && <Building2 className="w-5 h-5" />}
                    {mode === 'map' && <MapPin className="w-5 h-5" />}
                    {mode === 'table' && <BarChart3 className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Search Filters */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Company name..."
                value={searchFilters.company}
                onChange={(e) => setSearchFilters({...searchFilters, company: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Origin country..."
                value={searchFilters.originCountry}
                onChange={(e) => setSearchFilters({...searchFilters, originCountry: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Destination country..."
                value={searchFilters.destinationCountry}
                onChange={(e) => setSearchFilters({...searchFilters, destinationCountry: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="HS Code or commodity..."
                value={searchFilters.commodity}
                onChange={(e) => setSearchFilters({...searchFilters, commodity: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex justify-between">
              <div className="flex gap-2">
                {(['all', 'ocean', 'air'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filterMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {mode === 'all' && 'All Modes'}
                    {mode === 'ocean' && (
                      <span className="flex items-center gap-2">
                        <Ship className="w-4 h-4" />
                        Ocean
                      </span>
                    )}
                    {mode === 'air' && (
                      <span className="flex items-center gap-2">
                        <Plane className="w-4 h-4" />
                        Air
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Interactive Shipment Routes</h3>
            <div className="h-[500px] bg-slate-900 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="grid grid-cols-12 gap-4 p-4">
                  {[...Array(48)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  ))}
                </div>
              </div>
              
              {/* Simple SVG Map */}
              <svg className="absolute inset-0 w-full h-full">
                {mapShipments.map((shipment, idx) => {
                  const startX = 20 + (idx * 30) % 80;
                  const startY = 30;
                  const endX = 20 + ((idx + 1) * 40) % 80;
                  const endY = 70;
                  
                  return (
                    <g key={idx}>
                      <path
                        d={`M ${startX}% ${startY}% Q 50% 50% ${endX}% ${endY}%`}
                        fill="none"
                        stroke={shipment.type === 'air' ? '#0ea5e9' : '#3b82f6'}
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      <circle cx={`${startX}%`} cy={`${startY}%`} r="4" fill="#10b981" />
                      <circle cx={`${endX}%`} cy={`${endY}%`} r="4" fill="#f59e0b" />
                    </g>
                  );
                })}
              </svg>
              
              <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">Active Routes</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Origin Ports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span>Destination Ports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && (
          <div className="space-y-4">
            {companies.map((company: Company) => (
              <div key={company.company_name} className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {/* Company Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {company.company_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getModeColor(company.shipment_mode)}`}>
                          {company.shipment_mode === 'ocean' && <Ship className="w-3 h-3" />}
                          {company.shipment_mode === 'air' && <Plane className="w-3 h-3" />}
                          {company.shipment_mode === 'mixed' && <Globe className="w-3 h-3" />}
                          {company.shipment_mode.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(company.confidence_score)}`}>
                          <TrendingUp className="w-3 h-3" />
                          {company.confidence_score}% Confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCRM(company.company_name)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to CRM
                      </button>
                      <button
                        onClick={() => handleSendInsight(company)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Insight
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Shipments</span>
                      </div>
                      <p className="text-xl font-bold">{company.total_shipments}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Value</span>
                      </div>
                      <p className="text-xl font-bold">${(company.total_value_usd / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">Weight</span>
                      </div>
                      <p className="text-xl font-bold">{(company.total_weight_kg / 1000).toFixed(0)}T</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Latest</span>
                      </div>
                      <p className="text-sm font-medium">{company.last_arrival}</p>
                    </div>
                  </div>
                  
                  {/* Contacts Section */}
                  {company.contacts && company.contacts.length > 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-green-800">
                          {company.contacts.length} Contacts Available
                        </span>
                        <button
                          onClick={() => toggleCompanyExpansion(company.company_name, '_contacts')}
                          className="text-green-600 text-sm flex items-center gap-1"
                        >
                          <Users className="w-4 h-4" />
                          {expandedCompanies.has(company.company_name + '_contacts') ? 'Hide' : 'Show'} Contacts
                        </button>
                      </div>
                      
                      {expandedCompanies.has(company.company_name + '_contacts') && (
                        <div className="mt-3 space-y-2">
                          {company.contacts.map((contact: Contact, idx: number) => (
                            <div key={idx} className="bg-white rounded p-3">
                              <p className="font-medium">{contact.full_name || contact.contact_name || 'Contact'}</p>
                              <div className="flex items-center gap-3 mt-1">
                                {contact.email && (
                                  <span className="text-sm text-indigo-600 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    {contact.email}
                                  </span>
                                )}
                                {contact.phone && (
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {contact.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <span className="text-yellow-800">No contacts enriched yet - Click "Add to CRM" to enrich</span>
                    </div>
                  )}
                  
                  {/* Trends */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Shipping Trends
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-600 font-medium">Monthly Avg</p>
                        <p className="text-lg font-bold">{Math.round(company.total_shipments / 12)} shipments</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-sm text-green-600 font-medium">Quarterly Value</p>
                        <p className="text-lg font-bold">${(company.total_value_usd / 4 / 1000000).toFixed(1)}M</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-sm text-purple-600 font-medium">Growth</p>
                        <p className="text-lg font-bold">+23%</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Shipment Details Toggle */}
                  <button
                    onClick={() => toggleCompanyExpansion(company.company_name, '_details')}
                    className="w-full mt-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
                  >
                    {expandedCompanies.has(company.company_name + '_details') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {expandedCompanies.has(company.company_name + '_details') ? 'Hide' : 'Show'} Shipment Details
                  </button>
                </div>
                
                {/* Expanded Details */}
                {expandedCompanies.has(company.company_name + '_details') && (
                  <div className="border-t bg-gray-50 p-6">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-gray-600">
                          <th className="pb-2">BOL#</th>
                          <th className="pb-2">Date</th>
                          <th className="pb-2">Route</th>
                          <th className="pb-2">Vessel</th>
                          <th className="pb-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.shipments.map((shipment: Shipment, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="py-2 text-sm font-mono">{shipment.bol_number}</td>
                            <td className="py-2 text-sm">{shipment.arrival_date}</td>
                            <td className="py-2 text-sm">{shipment.port_of_loading} → {shipment.port_of_discharge}</td>
                            <td className="py-2 text-sm">{shipment.vessel_name}</td>
                            <td className="py-2 text-sm font-medium text-green-600">${(shipment.value_usd / 1000).toFixed(0)}K</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Mode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Shipments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {companies.map((company: Company) => (
                  <tr key={company.company_name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{company.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getModeColor(company.shipment_mode)}`}>
                        {company.shipment_mode.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{company.total_shipments}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ${(company.total_value_usd / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 text-sm">{(company.total_weight_kg / 1000).toFixed(0)}T</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${company.confidence_score}%` }}
                          />
                        </div>
                        <span className="text-xs">{company.confidence_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCRM(company.company_name)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Add to CRM
                        </button>
                        <button
                          onClick={() => handleSendInsight(company)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Send
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;