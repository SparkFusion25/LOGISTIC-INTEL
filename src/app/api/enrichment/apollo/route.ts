import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  linkedin_url: string;
  phone_numbers: string[];
  organization: {
    id: string;
    name: string;
    website_url: string;
    industry: string;
    organization_size_range: string;
    headquarters_address: string;
  };
}

interface EnrichmentRequest {
  companyName: string;
  companyWebsite?: string;
  location?: string;
  zipCode?: string;
  industry?: string;
  maxContacts?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyWebsite, location, zipCode, industry, maxContacts = 5 }: EnrichmentRequest = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${companyName}_${location || ''}_${zipCode || ''}`;
    const cached = await getCachedEnrichment(cacheKey);
    
    if (cached && !isStale(cached.enriched_at)) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        companyName,
        contacts: cached.contacts,
        organization: cached.organization,
        cachedAt: cached.enriched_at
      });
    }

    // Try Apollo.io enrichment
    const apolloResult = await enrichWithApollo(companyName, companyWebsite, location, zipCode, industry, maxContacts);
    
    if (apolloResult.success && apolloResult.data) {
      // Cache the results
      await cacheEnrichmentResult(cacheKey, apolloResult.data);
      
      // Store contacts in CRM
      await storeContactsInCRM(apolloResult.data.contacts, companyName);

      return NextResponse.json({
        success: true,
        source: 'apollo',
        companyName,
        contacts: apolloResult.data.contacts,
        organization: apolloResult.data.organization,
        enrichedAt: new Date().toISOString()
      });
    }

    // If Apollo fails, return empty instead of mock data
    return NextResponse.json({
      success: false,
      source: 'apollo_unavailable',
      companyName,
      contacts: [],
      organization: null,
      enrichedAt: new Date().toISOString(),
      error: 'Apollo.io API key not configured or request failed. Configure APOLLO_API_KEY environment variable for live contact enrichment.'
    });

  } catch (error) {
    console.error('Apollo enrichment error:', error);
    return NextResponse.json(
      { success: false, error: 'Enrichment failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function enrichWithApollo(
  companyName: string, 
  companyWebsite?: string, 
  location?: string, 
  zipCode?: string, 
  industry?: string,
  maxContacts: number = 5
) {
  try {
    const apolloApiKey = process.env.APOLLO_API_KEY;
    
    if (!apolloApiKey) {
      console.log('Apollo API key not configured, using mock data');
      return { success: false, error: 'Apollo API key not configured' };
    }

    // Apollo.io organization search
    const orgSearchResponse = await fetch('https://api.apollo.io/v1/organizations/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey
      },
      body: JSON.stringify({
        q_organization_name: companyName,
        page: 1,
        per_page: 1,
        ...(companyWebsite && { q_organization_domain: companyWebsite }),
        ...(location && { q_organization_locations: [location] }),
        ...(industry && { q_organization_industries: [industry] })
      })
    });

    if (!orgSearchResponse.ok) {
      throw new Error(`Apollo organization search failed: ${orgSearchResponse.status}`);
    }

    const orgData = await orgSearchResponse.json();
    
    if (!orgData.organizations || orgData.organizations.length === 0) {
      throw new Error('No organization found in Apollo');
    }

    const organization = orgData.organizations[0];

    // Apollo.io people search for the organization
    const peopleSearchResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey
      },
      body: JSON.stringify({
        q_organization_ids: [organization.id],
        page: 1,
        per_page: maxContacts,
        person_titles: [
          'Director', 'Manager', 'VP', 'President', 'CEO', 'COO', 'CFO',
          'Logistics', 'Supply Chain', 'Operations', 'Procurement', 'Shipping'
        ]
      })
    });

    if (!peopleSearchResponse.ok) {
      throw new Error(`Apollo people search failed: ${peopleSearchResponse.status}`);
    }

    const peopleData = await peopleSearchResponse.json();

    return {
      success: true,
      data: {
        contacts: peopleData.people || [],
        organization
      }
    };

  } catch (error) {
    console.error('Apollo API error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Mock data generation function removed - using real Apollo API only

async function getCachedEnrichment(cacheKey: string) {
  try {
    const { data, error } = await supabase
      .from('contact_enrichment_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (error || !data) return null;

    return {
      enriched_at: data.enriched_at,
      contacts: data.contacts,
      organization: data.organization
    };
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

async function cacheEnrichmentResult(cacheKey: string, data: any) {
  try {
    const { error } = await supabase
      .from('contact_enrichment_cache')
      .upsert({
        cache_key: cacheKey,
        contacts: data.contacts,
        organization: data.organization,
        enriched_at: new Date().toISOString()
      });

    if (error) {
      console.error('Cache storage error:', error);
    }
  } catch (error) {
    console.error('Failed to cache enrichment result:', error);
  }
}

async function storeContactsInCRM(contacts: any[], companyName: string) {
  try {
    const crmContacts = contacts.map(contact => ({
      company_name: companyName,
      contact_name: contact.name || `${contact.first_name} ${contact.last_name}`,
      title: contact.title,
      email: contact.email,
      linkedin_url: contact.linkedin_url,
      phone: contact.phone_numbers?.[0] || null,
      source: 'Apollo',
      enriched_at: new Date().toISOString(),
      apollo_id: contact.id
    }));

    const { error } = await supabase
      .from('crm_contacts')
      .upsert(crmContacts, {
        onConflict: 'email'
      });

    if (error) {
      console.error('CRM storage error:', error);
    }
  } catch (error) {
    console.error('Failed to store contacts in CRM:', error);
  }
}

function isStale(enrichedAt: string): boolean {
  const cacheAge = Date.now() - new Date(enrichedAt).getTime();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  return cacheAge > maxAge;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company');

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Get cached enrichment data
    const cacheKey = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cached = await getCachedEnrichment(cacheKey);

    if (cached) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        companyName,
        contacts: cached.contacts,
        organization: cached.organization,
        cachedAt: cached.enriched_at,
        isStale: isStale(cached.enriched_at)
      });
    }

    return NextResponse.json({
      success: false,
      message: 'No cached data found. Use POST to enrich company data.'
    });

  } catch (error) {
    console.error('Apollo cache retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve cached data', details: (error as Error).message },
      { status: 500 }
    );
  }
}