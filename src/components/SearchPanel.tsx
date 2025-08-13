// components/search/SearchPanel.tsx
'use client';
import React, { useState } from 'react';
import InteractiveShipmentMap from './InteractiveShipmentMap';
import { CompanySummaryCard } from './search/CompanySummaryCard';

type UserPlan = 'trial' | 'starter' | 'pro' | 'enterprise';

interface ShipmentDetail {
  bol_number: string | null;
  arrival_date: string;
  vessel_name: string | null;
  gross_weight_kg?: number;
  value_usd: number;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  hs_code: string | null;
  shipment_type: 'ocean' | 'air';
}

interface Company {
  company_name: string;
  shipment_mode: 'ocean' | 'air' | 'mixed';
  total_shipments: number;
  total_weight_kg: number;
  total_value_usd: number;
  confidence_score: number;
  first_arrival: string;
  last_arrival: string;
  shipments: ShipmentDetail[];
  contacts?: any[];
}

export default function SearchPanel() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mapShipments, setMapShipments] = useState<any[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    company: '',
    originCountry: '',
    destinationCountry: '',
    commodity: '',
    hsCode: '',
    mode: 'all'
  });
  const [loading, setLoading] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan>('trial'); // TODO: Load from user profile
  const [hasSearched, setHasSearched] = useState(false);

  // Handles search/filter submit
  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (searchFilters.company) params.append('company', searchFilters.company);
      if (searchFilters.originCountry) params.append('origin_country', searchFilters.originCountry);
      if (searchFilters.destinationCountry) params.append('destination_country', searchFilters.destinationCountry);
      if (searchFilters.hsCode) params.append('hs_code', searchFilters.hsCode);
      if (searchFilters.mode && searchFilters.mode !== 'all') params.append('mode', searchFilters.mode);
      const res = await fetch(`/api/search/unified?${params.toString()}`);
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setCompanies(json.data);
        const mapped = json.data.flatMap((c: Company) => 
          c.shipments.map((s: ShipmentDetail) => ({
            origin: { city: s.port_of_loading, country: '' },
            destination: { city: s.port_of_discharge, country: '' },
            type: s.shipment_type
          }))
        );
        setMapShipments(mapped);
      } else {
        setCompanies([]);
        setMapShipments([]);
      }
    } catch (e) {
      setCompanies([]);
      setMapShipments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handles add to CRM, including Apollo enrichment if eligible
  const handleAddToCRM = async (company: Company) => {
    if (!company?.company_name) return;
    const crmRes = await fetch('/api/crm/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: company.company_name, source: 'Trade Search' })
    });
    const crmJson = await crmRes.json();
    if (crmJson.success && (userPlan === 'pro' || userPlan === 'enterprise')) {
      // trigger enrichment only for pro/enterprise
      await fetch('/api/enrichment/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: company.company_name })
      });
      alert(`Added and enriched ${company.company_name} to CRM!`);
    } else if (crmJson.success) {
      alert(`Added ${company.company_name} to CRM!`);
    } else {
      alert(crmJson.error || 'Failed to add to CRM');
    }
  };

  // Handles sending insight email
  const handleSendInsight = async (company: Company) => {
    const toEmail = company?.contacts?.[0]?.email || '';
    if (!toEmail) return alert('No contact email found for this company.');
    const subject = `Logistics Intelligence for ${company.company_name}`;
    const body = `We identified ${company.total_shipments} shipments for ${company.company_name}. Value: $${(company.total_value_usd/1_000_000).toFixed(1)}M.`;
    const emailRes = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, subject, body })
    });
    const emailJson = await emailRes.json();
    if (emailJson.success) {
      alert('Email sent!');
    } else {
      alert(emailJson.error || 'Failed to send email.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[1280px] mx-auto space-y-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <input
              type="text"
              placeholder="Company name..."
              value={searchFilters.company}
              onChange={e => setSearchFilters(f => ({ ...f, company: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 flex-1"
            />
            <input
              type="text"
              placeholder="Origin country..."
              value={searchFilters.originCountry}
              onChange={e => setSearchFilters(f => ({ ...f, originCountry: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 flex-1"
            />
            <input
              type="text"
              placeholder="Destination country..."
              value={searchFilters.destinationCountry}
              onChange={e => setSearchFilters(f => ({ ...f, destinationCountry: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 flex-1"
            />
            <input
              type="text"
              placeholder="Commodity..."
              value={searchFilters.commodity}
              onChange={e => setSearchFilters(f => ({ ...f, commodity: e.target.value }))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Map View */}
        <InteractiveShipmentMap
          shipments={mapShipments}
          filterType={searchFilters.mode as 'all' | 'ocean' | 'air'}
          searchQuery={searchFilters.company}
          isLoading={loading}
        />

        {/* Company Results */}
        <div className="space-y-6">
          {!hasSearched ? (
            <div className="text-center py-24 text-gray-400 text-xl">
              Start your search above to see company results.
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-xl">
              No results. Try a different search.
            </div>
          ) : (
            companies.map((c, i) =>
              <CompanySummaryCard
                key={c.company_name}
                company={c}
                userPlan={userPlan}
                onAddToCRM={handleAddToCRM}
                onSendInsight={handleSendInsight}
                isAddingToCRM={false}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
