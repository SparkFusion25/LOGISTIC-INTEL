// components/search/CompanySummaryCard.tsx
'use client';
import React, { useState } from 'react';
import { Plus, Send, ChevronDown, ChevronUp, Mail, Phone, Users, Ship, Plane, Globe, TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';

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

interface Contact {
  id?: string;
  full_name?: string;
  email: string;
  phone?: string;
  title?: string;
  linkedin_url?: string;
}

interface CompanyProps {
  company: {
    company_name: string;
    shipment_mode: 'ocean' | 'air' | 'mixed';
    total_shipments: number;
    total_weight_kg: number;
    total_value_usd: number;
    confidence_score: number;
    first_arrival: string;
    last_arrival: string;
    shipments: ShipmentDetail[];
    contacts?: Contact[];
  };
  userPlan: 'trial' | 'starter' | 'pro' | 'enterprise';
  onAddToCRM: (company: any) => Promise<void>;
  onSendInsight: (company: any) => Promise<void>;
  isAddingToCRM?: boolean;
}

export const CompanySummaryCard: React.FC<CompanyProps> = ({ company, userPlan, onAddToCRM, onSendInsight, isAddingToCRM }) => {
  const [expanded, setExpanded] = useState(false);

  const canViewContacts = userPlan === 'pro' || userPlan === 'enterprise';
  const canSendInsight = userPlan === 'pro' || userPlan === 'enterprise';

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {company.company_name}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              company.shipment_mode === 'ocean' ? 'bg-blue-100 text-blue-800' :
              company.shipment_mode === 'air' ? 'bg-sky-100 text-sky-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {company.shipment_mode === 'ocean' ? <Ship className="w-3 h-3" /> :
               company.shipment_mode === 'air' ? <Plane className="w-3 h-3" /> :
               <Globe className="w-3 h-3" />}
              {company.shipment_mode.toUpperCase()}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              company.confidence_score >= 80 ? 'bg-green-100 text-green-800' :
              company.confidence_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              <TrendingUp className="w-3 h-3" />
              {company.confidence_score}% Confidence
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddToCRM(company)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            disabled={isAddingToCRM}
          >
            {isAddingToCRM ? "Adding..." : (<><Plus className="w-4 h-4" /> Add to CRM</>)}
          </button>
          <button
            onClick={() => onSendInsight(company)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
            disabled={!canSendInsight}
          >
            <Send className="w-4 h-4" />
            Send Insight
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Latest</span>
          </div>
          <p className="text-sm font-medium">{company.last_arrival}</p>
        </div>
      </div>

      {/* Expand for Shipments */}
      <button
        onClick={() => setExpanded((ex) => !ex)}
        className="w-full mt-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? 'Hide' : 'Show'} Shipment Details
      </button>
      {expanded && (
        <div className="border-t bg-gray-50 p-4 mt-2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-600">
                <th className="pb-2">BOL#</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Route</th>
                <th className="pb-2">Vessel</th>
                <th className="pb-2">Value</th>
                <th className="pb-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {company.shipments.slice(0, 10).map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 font-mono">{s.bol_number}</td>
                  <td className="py-2">{s.arrival_date}</td>
                  <td className="py-2">{s.port_of_loading} → {s.port_of_discharge}</td>
                  <td className="py-2">{s.vessel_name}</td>
                  <td className="py-2 text-green-700">${(s.value_usd / 1000).toFixed(0)}K</td>
                  <td className="py-2">{s.shipment_type?.toUpperCase() || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
