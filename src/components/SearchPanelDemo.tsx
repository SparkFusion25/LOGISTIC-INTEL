'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, TrendingUp, Ship, Plane, Globe, Building2, 
  Package, MapPin, Calendar, DollarSign, Users, Plus, Lock,
  ChevronDown, ChevronUp, Mail, Phone, BarChart3, Activity, Send,
  Menu, X, Eye, AlertCircle, CheckCircle, Loader, LineChart,
  TrendingDown, Zap, Clock, Target
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ShipmentDetail {
  id?: string;
  bol_number: string | null;
  arrival_date: string;
  vessel_name: string | null;
  gross_weight_kg?: number;
  weight_kg?: number;
  value_usd: number;
  port_of_loading: string | null;
  port_of_lading: string | null;
  port_of_discharge: string | null;
  hs_code: string | null;
  shipment_type: 'ocean' | 'air';
  goods_description?: string | null;
  departure_date?: string | null;
  unified_id?: string;
  origin_country?: string;
  destination_country?: string;
}

interface Contact {
  id?: string;
  full_name: string;
  email: string;
  title: string;
  phone?: string;
  linkedin_url?: string;
  company_id?: string;
  is_enriched?: boolean;
}

interface SeasonalTrend {
  month: string;
  shipments: number;
  value_usd: number;
  weight_kg: number;
  season: 'high' | 'medium' | 'low';
}

interface Company {
  id?: string;
  company_name: string;
  shipment_mode: 'ocean' | 'air' | 'mixed' | undefined;
  total_shipments: number;
  total_weight_kg: number;
  total_value_usd: number;
  confidence_score: number;
  first_arrival: string;
  last_arrival: string;
  shipments: ShipmentDetail[];
  contacts?: Contact[];
  seasonal_trends?: SeasonalTrend[];
  primary_commodities?: string[];
  top_routes?: Array<{origin: string, destination: string, frequency: number}>;
  is_in_crm?: boolean;
  crm_added_date?: string;
}

interface CompanyModalProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCRM: (company: Company) => void;
  onSendEmail: (company: Company) => void;
  userPlan: string;
  isAddingToCRM: boolean;
  isSendingEmail: boolean;
}

const CompanyDetailModal: React.FC<CompanyModalProps> = ({
  company,
  isOpen,
  onClose,
  onAddToCRM,
  onSendEmail,
  userPlan,
  isAddingToCRM,
  isSendingEmail
}) => {
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'3m' | '6m' | '12m'>('12m');
  
  if (!isOpen || !company) return null;

  const hasAccess = userPlan === 'pro' || userPlan === 'enterprise';
  const canViewContacts = hasAccess && company.is_in_crm;

  const generateSeasonalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      shipments: Math.floor(Math.random() * 50) + 5,
      value_usd: Math.floor(Math.random() * 5000000) + 500000,
      weight_kg: Math.floor(Math.random() * 100000) + 10000,
      season: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as 'high' | 'medium' | 'low'
    }));
  };

  const seasonalData = company.seasonal_trends || generateSeasonalData();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-card">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-brand" />
              {company.company_name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                company.shipment_mode === 'ocean' ? 'bg-blue-100 text-blue-800' :
                company.shipment_mode === 'air' ? 'bg-sky-100 text-sky-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {company.shipment_mode?.toUpperCase() || 'MIXED'}
              </span>
              <span className="text-sm text-slate-600">
                Confidence: {company.confidence_score || 0}%
              </span>
              {company.is_in_crm && (
                <span className="bg-success/10 text-success px-2 py-1 rounded-lg text-xs font-medium">
                  ✓ In CRM
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAddToCRM(company)}
              disabled={isAddingToCRM || company.is_in_crm}
              className="btn-primary disabled:opacity-50"
            >
              {isAddingToCRM ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {company.is_in_crm ? 'Added to CRM' : 'Add to CRM'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="kpi bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Total Shipments</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{company.total_shipments || 0}</p>
            </div>
            <div className="kpi bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 text-success mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Total Value</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                ${((company.total_value_usd || 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="kpi bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Total Weight</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {((company.total_weight_kg || 0) / 1000).toFixed(0)}T
              </p>
            </div>
            <div className="kpi bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Latest Activity</span>
              </div>
              <p className="text-sm font-bold text-orange-900">{company.last_arrival || 'N/A'}</p>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand" />
                Seasonal Shipping Trends
              </h3>
              <div className="flex gap-2">
                {['3m', '6m', '12m'].map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedTrendPeriod(period as '3m' | '6m' | '12m')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      selectedTrendPeriod === period
                        ? 'bg-brand text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-2 mb-4">
              {seasonalData.map((data, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className={`rounded-lg mb-2 flex items-end justify-center text-white text-xs font-bold transition ${
                      data.season === 'high' ? 'bg-success' :
                      data.season === 'medium' ? 'bg-warn' : 'bg-danger'
                    }`}
                    style={{
                      height: `${Math.max(20, (data.shipments / 50) * 80)}px`
                    }}
                  >
                    {data.shipments}
                  </div>
                  <div className="text-xs text-slate-600">{data.month}</div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span>High Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warn rounded-full"></div>
                <span>Medium Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-danger rounded-full"></div>
                <span>Low Volume</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="kpi bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Peak Season</span>
                </div>
                <p className="text-sm text-slate-600">
                  Highest activity in {seasonalData.reduce((max, curr) => max.shipments > curr.shipments ? max : curr).month}
                </p>
              </div>
              <div className="kpi bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Low Season</span>
                </div>
                <p className="text-sm text-slate-600">
                  Lowest activity in {seasonalData.reduce((min, curr) => min.shipments < curr.shipments ? min : curr).month}
                </p>
              </div>
              <div className="kpi bg-purple-50 border border-purple-200">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">Opportunity</span>
                </div>
                <p className="text-sm text-slate-600">
                  Best outreach timing for maximum engagement
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-brand" />
              Contact Information
            </h3>
            
            {!hasAccess ? (
              <div className="bg-warn/10 border border-warn/20 rounded-lg p-4 text-center">
                <Lock className="w-8 h-8 text-warn mx-auto mb-2" />
                <h4 className="font-medium text-warn mb-1">Premium Feature</h4>
                <p className="text-sm text-slate-700">
                  Upgrade to Pro or Enterprise to access contact details and enrichment
                </p>
              </div>
            ) : !canViewContacts ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-800 mb-1">Add to CRM First</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Add this company to your CRM to unlock enriched contact details
                </p>
                <button
                  onClick={() => onAddToCRM(company)}
                  disabled={isAddingToCRM}
                  className="btn-primary disabled:opacity-50 mx-auto"
                >
                  {isAddingToCRM ? (
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add to CRM & Enrich
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {company.contacts && company.contacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.contacts.map((contact, idx) => (
                      <div key={idx} className="card p-4">
                        <h4 className="font-semibold text-slate-900">{contact.full_name}</h4>
                        <p className="text-sm text-slate-600 mb-2">{contact.title}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-brand" />
                            <span>{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-success" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onSendEmail(company)}
                          disabled={isSendingEmail}
                          className="mt-3 w-full btn-primary disabled:opacity-50"
                        >
                          {isSendingEmail ? (
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Send Insight Email
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-warn/10 border border-warn/20 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-warn mx-auto mb-2" />
                    <h4 className="font-medium text-warn mb-1">Contacts Being Enriched</h4>
                    <p className="text-sm text-slate-700">
                      Contact enrichment is in progress. Check back in a few minutes.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Ship className="w-5 h-5 text-brand" />
              Recent Shipments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="text-left p-3 border-b border-slate-200">BOL Number</th>
                    <th className="text-left p-3 border-b border-slate-200">Date</th>
                    <th className="text-left p-3 border-b border-slate-200">Route</th>
                    <th className="text-left p-3 border-b border-slate-200">Value</th>
                    <th className="text-left p-3 border-b border-slate-200">HS Code</th>
                  </tr>
                </thead>
                <tbody>
                  {company.shipments?.slice(0, 10).map((shipment, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs">{shipment.bol_number || 'N/A'}</td>
                      <td className="p-3">{shipment.arrival_date}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {shipment.shipment_type === 'air' ? (
                            <Plane className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Ship className="w-3 h-3 text-teal-500" />
                          )}
                          {shipment.port_of_loading || shipment.port_of_lading} → {shipment.port_of_discharge}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-success">
                        ${((shipment.value_usd || 0) / 1000).toFixed(0)}K
                      </td>
                      <td className="p-3 text-xs font-mono">{shipment.hs_code || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {company.shipments && company.shipments.length > 10 && (
                <p className="text-sm text-slate-500 mt-3 text-center">
                  Showing 10 of {company.shipments.length} shipments
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchPanelDemo = () => {
  const [viewMode, setViewMode] = useState('cards');
  const [filterMode, setFilterMode] = useState('all');
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<'trial' | 'starter' | 'pro' | 'enterprise'>('pro');
  const [hasSearched, setHasSearched] = useState(false);
  const [operationLoading, setOperationLoading] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, type: 'info' | 'success' | 'error'}>>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  
  const supabase = createClientComponentClient();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    company: '',
    originCountry: '',
    destinationCountry: '',
    commodity: '',
    hsCode: ''
  });

  useEffect(() => {
    async function loadUserPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const response = await fetch('/api/me/plan');
          if (response.ok) {
            const planData = await response.json();
            setUserPlan(planData.plan || 'pro');
          } else {
            setUserPlan('pro');
          }
        } else {
          setUserPlan('pro');
        }
      } catch (error) {
        console.error('Failed to load user plan:', error);
        setUserPlan('pro');
      }
    }
    loadUserPlan();
  }, [supabase]);

  const addNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      
      if (searchFilters.company) params.append('company', searchFilters.company);
      if (searchFilters.originCountry) params.append('origin_country', searchFilters.originCountry);
      if (searchFilters.destinationCountry) params.append('destination_country', searchFilters.destinationCountry);
      if (searchFilters.commodity) params.append('commodity', searchFilters.commodity);
      if (searchFilters.hsCode) params.append('hs_code', searchFilters.hsCode);
      if (filterMode !== 'all') params.append('mode', filterMode);
      
      console.log('Search params:', params.toString());
      
      const response = await fetch(`/api/search/unified?${params.toString()}`);
      const data = await response.json();
      
      console.log('Search response:', data);
      
      if (data.success) {
        const enrichedCompanies = await Promise.all(
          (data.data || []).map(async (company: any) => {
            try {
              const crmResponse = await fetch(`/api/crm/contacts/check?company_name=${encodeURIComponent(company.company_name)}`);
              const crmData = await crmResponse.json();
              company.is_in_crm = crmData.exists;
              company.crm_added_date = crmData.added_date;
              
              if (company.is_in_crm) {
                const contactsResponse = await fetch(`/api/crm/contacts?company_name=${encodeURIComponent(company.company_name)}`);
                const contactsData = await contactsResponse.json();
                company.contacts = contactsData.contacts || [];
              }
            } catch (error) {
              console.error('Error checking CRM status:', error);
              company.is_in_crm = false;
            }
            
            return company;
          })
        );
        
        setCompanies(enrichedCompanies);
        addNotification(`Found ${enrichedCompanies.length} companies matching your search`, 'success');
      } else {
        setCompanies([]);
        addNotification(data.error || 'No companies found for your search criteria', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      setCompanies([]);
      addNotification('Search failed. Please try again or contact support.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const response = await fetch('/api/search/unified?limit=10');
        const data = await response.json();
        
        if (data.success && data.data?.length > 0) {
          setCompanies(data.data);
          addNotification(`Loaded ${data.data.length} recent companies`, 'info');
        }
      } catch (error) {
        console.error('Failed to load default data:', error);
      }
    };
    
    loadDefaultData();
  }, []);

  const handleCompanyClick = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleAddToCRM = async (company: Company) => {
    const opKey = `crm_${company.company_name}`;
    setOperationLoading(prev => ({ ...prev, [opKey]: true }));
    
    try {
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: company.company_name,
          source: 'Trade Search',
          metadata: {
            total_shipments: company.total_shipments || 0,
            total_value_usd: company.total_value_usd || 0,
            shipment_mode: company.shipment_mode || 'unknown'
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        company.is_in_crm = true;
        company.crm_added_date = new Date().toISOString();
        
        setCompanies(prev => prev.map(c => 
          c.company_name === company.company_name ? { ...c, is_in_crm: true } : c
        ));
        
        addNotification(`${company.company_name} added to CRM successfully!`, 'success');
        
        if (userPlan === 'pro' || userPlan === 'enterprise') {
          try {
            const enrichResponse = await fetch('/api/enrichment/apollo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ companyName: company.company_name })
            });
            
            if (enrichResponse.ok) {
              addNotification('Contact enrichment started - contacts will appear shortly', 'info');
            }
          } catch (enrichError) {
            console.error('Enrichment error:', enrichError);
          }
        }
      } else {
        addNotification(result.error || 'Failed to add to CRM', 'error');
      }
    } catch (error) {
      console.error('CRM error:', error);
      addNotification('Failed to add to CRM', 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [opKey]: false }));
    }
  };

  const handleSendInsight = async (company: Company) => {
    const opKey = `email_${company.company_name}`;
    setOperationLoading(prev => ({ ...prev, [opKey]: true }));
    
    try {
      const contactEmail = company.contacts?.[0]?.email;
      if (!contactEmail) {
        addNotification('No contact email available. Add to CRM first to enrich contacts.', 'error');
        return;
      }

      const subject = `Trade Intelligence Insights for ${company.company_name}`;
      const body = `Hello,

We've identified significant trade activity for ${company.company_name}:

📊 Trade Summary:
• Total Shipments: ${company.total_shipments || 0}
• Total Value: $${((company.total_value_usd || 0) / 1000000).toFixed(1)}M
• Primary Mode: ${company.shipment_mode?.toUpperCase() || 'UNKNOWN'}
• Latest Activity: ${company.last_arrival || 'N/A'}

Our platform shows strong growth potential for logistics partnerships. Would you be interested in a brief discussion about optimizing your supply chain operations?

Best regards,
Trade Intelligence Team`;

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contactEmail,
          subject,
          body
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        addNotification('Insight email sent successfully!', 'success');
      } else {
        addNotification(result.message || 'Failed to send email', 'error');
      }
    } catch (error) {
      console.error('Email error:', error);
      addNotification('Failed to send email', 'error');
    } finally {
      setOperationLoading(prev => ({ ...prev, [opKey]: false }));
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-success/10 text-success border-success/20';
    if (score >= 60) return 'bg-warn/10 text-warn border-warn/20';
    return 'bg-danger/10 text-danger border-danger/20';
  };

  const getModeColor = (mode: 'ocean' | 'air' | 'mixed' | undefined) => {
    if (!mode) return 'bg-slate-100 text-slate-800';
    if (mode === 'ocean') return 'bg-blue-100 text-blue-800';
    if (mode === 'air') return 'bg-sky-100 text-sky-800';
    return 'bg-purple-100 text-purple-800';
