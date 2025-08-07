'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Building2, TrendingUp, Package, DollarSign, Calendar, Ship, Plane, Globe, Plus, Lock } from 'lucide-react'
import { ShipmentDetailTable } from './ShipmentDetailTable'

interface ShipmentDetail {
  bol_number: string | null;
  arrival_date: string;
  containers: string | null;
  vessel_name: string | null;
  weight_kg: number;
  value_usd: number;
  shipper_name: string | null;
  port_of_lading: string | null;
  port_of_discharge: string | null;
  goods_description: string | null;
  departure_date: string | null;
  hs_code: string | null;
  unified_id: string;
}

interface GroupedCompanyData {
  company_name: string;
  shipment_mode: 'ocean' | 'air' | 'mixed';
  total_shipments: number;
  total_weight_kg: number;
  total_value_usd: number;
  first_arrival: string;
  last_arrival: string;
  confidence_score: number;
  shipments: ShipmentDetail[];
}

interface CompanySummaryCardProps {
  company: GroupedCompanyData;
  onAddToCRM: (company: GroupedCompanyData) => void;
  isAddingToCRM?: boolean;
}

export const CompanySummaryCard = ({ company, onAddToCRM, isAddingToCRM = false }: CompanySummaryCardProps) => {
  const [expanded, setExpanded] = useState(false)

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'air': return <Plane className="w-4 h-4" />
      case 'ocean': return <Ship className="w-4 h-4" />
      case 'mixed': return <Globe className="w-4 h-4" />
      default: return <Ship className="w-4 h-4" />
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'air': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ocean': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'mixed': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'N/A'
    return `$${formatNumber(amount)}`
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getDateRange = () => {
    if (!company.first_arrival && !company.last_arrival) return 'No dates'
    if (company.first_arrival === company.last_arrival) return formatDate(company.first_arrival)
    return `${formatDate(company.first_arrival)} → ${formatDate(company.last_arrival)}`
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Left Column - Company Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getModeColor(company.shipment_mode)}`}>
                {getModeIcon(company.shipment_mode)}
                {company.shipment_mode.toUpperCase()}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(company.confidence_score)}`}>
                <TrendingUp className="w-3 h-3" />
                {company.confidence_score}% Confidence
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              {company.company_name}
            </h2>
          </div>

          {/* Right Column - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAddToCRM(company)}
              disabled={isAddingToCRM}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingToCRM ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to CRM
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Shipments</p>
              <p className="text-lg font-semibold text-gray-900">{company.total_shipments}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="text-lg font-semibold text-gray-900">{formatNumber(company.total_weight_kg)} kg</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Value</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(company.total_value_usd)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Date Range</p>
              <p className="text-sm font-medium text-gray-900">{getDateRange()}</p>
            </div>
          </div>
        </div>

        {/* Contact Info Gating Message */}
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <Lock className="w-4 h-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <span className="font-medium">🔒 Contact Details Protected</span>
            {' '}• Add to CRM to unlock contact information
          </p>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide Shipments ({company.total_shipments})
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show Shipments ({company.total_shipments})
            </>
          )}
        </button>
      </div>

      {/* Expandable Shipment Details */}
      {expanded && (
        <div className="border-t border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Shipment Details ({company.shipments.length} records)
            </h3>
            <ShipmentDetailTable shipments={company.shipments} />
          </div>
        </div>
      )}
    </div>
  )
}