'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, TrendingUp, Ship, Plane, Globe, Building2, 
  Package, MapPin, Calendar, DollarSign, Users, Plus,
  ChevronDown, ChevronUp, Mail, Phone, BarChart3, Activity, Send
} from 'lucide-react';
import InteractiveShipmentMap from './InteractiveShipmentMap'; // <-- adjust import as needed

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
  // Optional: lat/lng coordinates for map plotting
  origin_coords?: [number, number];
  dest_coords?: [number, number];
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

export default function SearchPanel() {
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

  // ----------- NO DEFAULT AUTOLOAD -----------
  // Companies list is always empty on mount until search button clicked

  // ---------- BUTTON LOGIC ----------
  const handleAddToCRM = async (companyName: string): Promise<void> => {
    alert(`Add to CRM clicked for ${companyName}`);
    // Add your CRM integration logic here (fetch/post etc)
  };

  const handleSendInsight = async (company: Company): Promise<void> => {
    alert(`Send Insight clicked for ${company.company_name}`);
    // Add your email/send insight logic here
  };

  const mapShipments = companies.flatMap((company: Company) => 
    company.shipments.map((s: Shipment) => ({
      origin: {
        city: s.port_of_loading || '',
        country: '', // optionally fill
        coords: s.origin_coords || [37.7749, -122.4194], // Example default coords, San Francisco
      },
      destination: {
        city: s.port_of_discharge || '',
        country: '', // optionally fill
        coords: s.dest_coords || [34.0522, -118.2437], // Example default coords, Los Angeles
      },
      type: s.shipment_type,
    }))
  );

  // ------------- SEARCH BUTTON ONLY -------------
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
        setCompanies(json.data);
      } else {
        setCompanies([]);
      }
    } catch (e) {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 px-6 md:px-12 py-6">
      <div className="max-w-screen-2xl mx-auto space-y-8">
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
            <InteractiveShipmentMap
              shipments={mapShipments}
              filterType={filterMode}
              searchQuery={searchFilters.company}
              isLoading={loading}
              onSelect={(s) => alert(`Selected shipment from ${s.origin.city} to ${s.destination.city}`)}
            />
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
                </div>
              </div>
            ))}
            {companies.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search filters or search for different criteria</p>
              </div>
            )}
          </div>
        )}
        {/* Table View (unchanged, optional) */}
        {/* ... */}
      </div>
    </div>
  );
}
