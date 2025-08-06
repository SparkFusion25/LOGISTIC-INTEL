'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Linkedin, Building, MapPin, Calendar, ExternalLink, MessageSquare, UserPlus, Star, Eye, Crown, Zap } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  linkedin_url?: string;
  phone?: string;
  source: 'Apollo' | 'Phantom';
}

interface Organization {
  id: string;
  name: string;
  website_url?: string;
  industry?: string;
  organization_size_range?: string;
  headquarters_address?: string;
}

interface BTSRouteMatch {
  origin_airport: string;
  dest_airport: string;
  carrier: string;
  dest_city: string;
  freight_kg: number;
}

interface EnrichedContactCardProps {
  companyName: string;
  location?: string;
  zipCode?: string;
  industry?: string;
  airShipperConfidence?: number;
  isLikelyAirShipper?: boolean;
  btsRouteMatches?: BTSRouteMatch[];
  onStartCampaign?: (contacts: Contact[]) => void;
  className?: string;
}

export default function EnrichedContactCard({
  companyName,
  location,
  zipCode,
  industry,
  airShipperConfidence = 0,
  isLikelyAirShipper = false,
  btsRouteMatches = [],
  onStartCampaign,
  className = ''
}: EnrichedContactCardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [enrichmentSource, setEnrichmentSource] = useState<'cache' | 'apollo' | 'mock' | null>(null);
  const [lastEnriched, setLastEnriched] = useState<string | null>(null);

  useEffect(() => {
    if (companyName && isExpanded) {
      enrichContacts();
    }
  }, [companyName, isExpanded]);

  const enrichContacts = async () => {
    setIsLoading(true);
    
    try {
      // First check cache
      const cacheResponse = await fetch(`/api/enrichment/apollo?company=${encodeURIComponent(companyName)}`);
      const cacheData = await cacheResponse.json();

      if (cacheData.success && !cacheData.isStale) {
        setContacts(cacheData.contacts || []);
        setOrganization(cacheData.organization);
        setEnrichmentSource(cacheData.source);
        setLastEnriched(cacheData.cachedAt);
        setIsLoading(false);
        return;
      }

      // Enrich with Apollo/mock data
      const enrichResponse = await fetch('/api/enrichment/apollo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          location,
          zipCode,
          industry,
          maxContacts: 5
        })
      });

      const enrichData = await enrichResponse.json();

      if (enrichData.success) {
        setContacts(enrichData.contacts || []);
        setOrganization(enrichData.organization);
        setEnrichmentSource(enrichData.source);
        setLastEnriched(enrichData.enrichedAt);
      }
    } catch (error) {
      console.error('Contact enrichment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getShippingIntelligence = () => {
    if (isLikelyAirShipper && airShipperConfidence >= 80) {
      return {
        level: 'High Probability Air+Ocean',
        icon: '🚀',
        color: 'text-green-600 bg-green-50 border-green-200'
      };
    } else if (isLikelyAirShipper && airShipperConfidence >= 60) {
      return {
        level: 'Medium Probability Air Shipper',
        icon: '✈️',
        color: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    } else if (airShipperConfidence >= 40) {
      return {
        level: 'Low Probability Air Shipper',
        icon: '🔍',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
      };
    } else {
      return {
        level: 'Ocean Only',
        icon: '🚢',
        color: 'text-teal-600 bg-teal-50 border-teal-200'
      };
    }
  };

  const intelligence = getShippingIntelligence();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">{companyName}</h3>
              {isLikelyAirShipper && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  ✈️ AIR SHIPPER (BTS CONFIRMED)
                </span>
              )}
            </div>

            {/* Shipping Intelligence */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm border ${intelligence.color}`}>
              <span>{intelligence.icon}</span>
              <span className="font-medium">{intelligence.level}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${getConfidenceColor(airShipperConfidence)}`}>
                {airShipperConfidence}% confidence
              </span>
            </div>

            {/* BTS Route Intelligence */}
            {btsRouteMatches.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="font-medium">
                    {btsRouteMatches.length} BTS route match{btsRouteMatches.length > 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {btsRouteMatches.slice(0, 2).map((route, index) => (
                    <div key={index}>
                      {route.origin_airport} → {route.dest_airport} via {route.carrier} 
                      ({(route.freight_kg / 1000).toFixed(0)}K kg)
                    </div>
                  ))}
                  {btsRouteMatches.length > 2 && (
                    <div className="text-indigo-600">+{btsRouteMatches.length - 2} more routes</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isExpanded 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            {isExpanded ? 'Hide' : 'Show'} Contacts
            {contacts.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {contacts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Contact Details */}
      {isExpanded && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Enriching contacts...</span>
            </div>
          ) : contacts.length > 0 ? (
            <div className="space-y-4">
              {/* Enrichment Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>
                    Enriched via {enrichmentSource === 'apollo' ? 'Apollo.io' : enrichmentSource === 'phantom' ? 'PhantomBuster' : 'Sample Data'}
                  </span>
                  {lastEnriched && (
                    <span className="text-xs">
                      • {new Date(lastEnriched).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {enrichmentSource === 'mock' && (
                  <span className="text-yellow-600 text-xs">Configure Apollo API for live data</span>
                )}
              </div>

              {/* Contacts List */}
              <div className="grid gap-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{contact.name}</div>
                            <div className="text-sm text-gray-600">{contact.title}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 ml-10">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${contact.email}`} className="hover:text-indigo-600">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${contact.phone}`} className="hover:text-indigo-600">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          
                          {contact.linkedin_url && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Linkedin className="w-3 h-3" />
                              <a 
                                href={contact.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-indigo-600 flex items-center gap-1"
                              >
                                LinkedIn Profile
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1 ml-2">
                        <button
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="View Contact Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Add to CRM"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Send Email"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Organization Info */}
              {organization && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      {organization.industry && (
                        <div>
                          <span className="font-medium">Industry:</span> {organization.industry}
                        </div>
                      )}
                      {organization.organization_size_range && (
                        <div>
                          <span className="font-medium">Size:</span> {organization.organization_size_range}
                        </div>
                      )}
                      {organization.headquarters_address && (
                        <div>
                          <span className="font-medium">HQ:</span> {organization.headquarters_address}
                        </div>
                      )}
                      {organization.website_url && (
                        <div>
                          <a 
                            href={organization.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            Company Website <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => onStartCampaign?.(contacts)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Start Campaign
                </button>
                
                <button
                  onClick={enrichContacts}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Re-enrich
                </button>

                <a
                  href={`https://www.google.com/search?q="${companyName}" logistics shipping`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Research
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No contacts found for {companyName}</p>
              <button
                onClick={enrichContacts}
                className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Try enriching contacts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}