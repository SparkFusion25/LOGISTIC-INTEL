// components/search/SearchPanel.tsx
'use client';
import React, { useState } from 'react';
import InteractiveShipmentMap from './InteractiveShipmentMap';
import { CompanySummaryCard } from './CompanySummaryCard';

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
      Object.entries(searchFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await fetch(`/api/search/unified?${params.toString()}`);
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        setCompanies(json.data);
        // Prepare for the map
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
     
