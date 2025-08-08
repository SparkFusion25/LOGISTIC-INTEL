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

  const getModeColor = (mode: 'ocean' | 'air' | 'mixed'): string =
