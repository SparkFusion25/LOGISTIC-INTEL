'use client'

import React, { useState, useEffect } from 'react';
import { 
  Search, TrendingUp, Ship, Plane, Globe, Building2, 
  Package, MapPin, Calendar, DollarSign, Users, Plus,
  ChevronDown, ChevronUp, Mail, Phone, BarChart3, Activity, Send
} from 'lucide-react';

const SearchPanel = () => {
  const [viewMode, setViewMode] = useState('cards');
  const [filterMode, setFilterMode] = useState('all');
  const [expandedCompanies, setExpandedCompanies] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [userPlan] = useState('pro'); // Demo with Pro plan
  
  // Demo data
  const demoCompanies = [
    {
      company_name: "Global Electronics Corp",
      shipment_mode: "ocean",
      total_shipments: 247,
      total_weight_kg: 1850000,
      total_value_usd: 285000000,
      confidence_score: 85,
      first_arrival: "2024-01-01",
      last_arrival: "2024-12-15",
      shipments: [
        {
          unified_id: "SH001",
          bol_number: "MAEU123456",
          arrival_date: "2024-12-15",
          vessel_name: "MAERSK DENVER",
          gross_weight_kg: 25000,
          value_usd: 1500000,
          port_of_loading: "Shanghai",
          port_of_discharge: "Los Angeles",
          hs_code: "8517120000",
          shipment_type: "ocean"
        },
        {
          unified_id: "SH002",
          bol_number: "MAEU123457",
          arrival_date: "2024-12-10",
          vessel_name: "MAERSK ATLANTA",
          gross_weight_kg: 22000,
          value_usd: 1300000,
          port_of_loading: "Shenzhen",
          port_of_discharge: "Long Beach",
          hs_code: "8517120000",
          shipment_type: "ocean"
        }
      ],
      contacts: [
        {
          full_name: "Sarah Chen",
          email: "s.chen@globalelectronics.com",
          title: "VP Supply Chain",
          phone: "+1-555-0123"
        },
        {
          full_name: "Michael Zhang",
          email: "m.zhang@globalelectronics.com",
          title: "Director of Logistics",
          phone: "+1-555-0124"
        }
      ]
    },
    {
      company_name: "Pacific Textiles Ltd",
      shipment_mode: "mixed",
      total_shipments: 156,
      total_weight_kg: 450000,
      total_value_usd: 75000000,
      confidence_score: 72,
      first_arrival: "2024-02-01",
      last_arrival: "2024-12-10",
      shipments: [
        {
          unified_id: "SH003",
          bol_number: "COSU456789",
          arrival_date: "2024-12-10",
          vessel_name: "COSCO SHIPPING",
          gross_weight_kg: 18000,
          value_usd: 500000,
          port_of_loading: "Ho Chi Minh",
          port_of_discharge: "Oakland",
          hs_code: "6203420000",
          shipment_type: "ocean"
        }
      ],
      contacts: []
    },
    {
      company_name: "Air Cargo Express",
      shipment_mode: "air",
      total_shipments: 89,
      total_weight_kg: 125000,
      total_value_usd: 95000000,
      confidence_score: 91,
      first_arrival: "2024-03-01",
      last_arrival: "2024-12-14",
      shipments: [
        {
          unified_id: "SH004",
          bol_number: "KE789012",
          arrival_date: "2024-12-14",
          vessel_name: "Korean Air Cargo",
          gross_weight_kg: 2500,
          value_usd: 2000000,
          port_of_loading: "Seoul",
          port_of_discharge: "Chicago",
          hs_code: "8471300000",
          shipment_type: "air"
        }
      ],
      contacts: [
        {
          full_name: "Jennifer Kim",
          email: "j.kim@aircargoexpress.com",
          title: "Operations Manager",
          phone: "+1-555-0125"
        }
      ]
    }
  ];

  const [companies, setCompanies] = useState(demoCompanies);
  const [searchFilters, setSearchFilters] = useState({
    company: '',
    originCountry: '',
    destinationCountry: '',
    commodity: ''
  });

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = demoCompanies;
      
      if (searchFilters.company) {
        filtered = filtered.filter(c => 
          c.company_name.toLowerCase().includes(searchFilters.company.toLowerCase())
        );
      }
      
      if (filterMode !== 'all') {
        filtered = filtered.filter(c => 
          filterMode === 'ocean' ? c.shipment_mode !== 'air' : c.shipment_mode === 'air'
        );
      }
      
      setCompanies(filtered);
      setLoading(false);
    }, 800);
  };

  const toggleCompanyExpansion = (companyName, section = '') => {
    const key = companyName + section;
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCompanies(newExpanded);
  };

  const mapShipments = companies.flatMap(company => 
    company.shipments.map(s => ({
      company: company.company_name,
      origin: s.port_of_loading,
      destination: s.port_of_discharge,
      type: s.shipment_type,
      value: s.value_usd
    }))
  );

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getModeColor = (mode) => {
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
                {['cards', 'map', 'table'].map(mode => (
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
                {['all', 'ocean', 'air'].map(mode => (
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
            {companies.map(company => (
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
                      <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add to CRM
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2">
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
                          {company.contacts.map((contact, idx) => (
                            <div key={idx} className="bg-white rounded p-3">
                              <p className="font-medium">{contact.full_name}</p>
                              <p className="text-sm text-gray-600">{contact.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-indigo-600 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {contact.email}
                                </span>
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
                        {company.shipments.map((shipment, idx) => (
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
                {companies.map(company => (
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
                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                          Add to CRM
                        </button>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
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