export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
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
  companyDomain?: string;
  location?: string;
  zipCode?: string;
  industry?: string;
  maxContacts?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyWebsite, companyDomain, location, zipCode, industry, maxContacts = 5 }: EnrichmentRequest = await request.json();
    if (!companyName) return NextResponse.json({ success: false, error: 'Company name is required' }, { status: 400 });

    const cacheKey = `${companyName}_${location || ''}_${zipCode || ''}`;

    const db = getDb();
    const cached = await getCachedEnrichment(db, cacheKey);
    if (cached && !isStale(cached.enriched_at)) {
      return NextResponse.json({ success: true, source: 'cache', companyName, contacts: cached.contacts, organization: cached.organization, cachedAt: cached.enriched_at });
    }

    const apolloResult = await enrichWithApollo(companyName, companyWebsite || companyDomain, location, zipCode, industry, maxContacts);
    if (apolloResult.success && apolloResult.data) {
      await cacheEnrichmentResult(db, cacheKey, apolloResult.data);
      await storeContactsInCRM(db, apolloResult.data.contacts, companyName);
      return NextResponse.json({ success: true, source: 'apollo', companyName, contacts: apolloResult.data.contacts, organization: apolloResult.data.organization, enrichedAt: new Date().toISOString() });
    }

    return NextResponse.json({ success: false, source: 'apollo_unavailable', companyName, contacts: [], organization: null, enrichedAt: new Date().toISOString(), error: apolloResult.error || 'No contacts found for this company' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Enrichment failed', details: (error as Error).message }, { status: 500 });
  }
}

function getDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) {
    throw new Error('Supabase env missing');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

async function enrichWithApollo(companyName: string, companyDomain?: string, location?: string, zipCode?: string, industry?: string, maxContacts: number = 5) {
  try {
    const apolloKey = process.env.VITE_APOLLO_INTEL_KEY;
    if (!apolloKey) return { success: false, error: 'Apollo Intel API key not configured' };

    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'x-api-key': apolloKey } as const;
    const searchBody: any = { api_key: apolloKey, page: 1, per_page: maxContacts, person_titles: [
      'Logistics Manager','Director of Supply Chain','Procurement Manager','Operations Manager','Supply Chain Director','Logistics Director','Import Manager','Export Manager','Director','Manager'] };

    if (companyDomain) {
      const domain = extractDomain(companyDomain);
      searchBody.q_organization_domains = [domain];
    } else {
      searchBody.q_organization_names = [companyName];
    }

    const apolloResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', { method: 'POST', headers, body: JSON.stringify(searchBody) });
    if (!apolloResponse.ok) throw new Error(`Apollo API request failed: ${apolloResponse.status}`);
    const apolloData = await apolloResponse.json();
    if (!apolloData || !apolloData.people || apolloData.people.length === 0) return { success: false, error: 'No contacts found' };

    const organization = apolloData.people[0]?.organization || { name: companyName, website_url: companyDomain || '', industry: industry || '', headquarters_address: location || '' };
    return { success: true, data: { contacts: apolloData.people.map((person: any) => ({ id: person.id, first_name: person.first_name, last_name: person.last_name, name: person.name || `${person.first_name} ${person.last_name}`, title: person.title, email: person.email, linkedin_url: person.linkedin_url, phone_numbers: person.phone_numbers || [], organization: person.organization })), organization } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

function extractDomain(url: string): string {
  try {
    if (!url.startsWith('http')) url = 'https://' + url;
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '');
  }
}

async function getCachedEnrichment(db: SupabaseClient, cacheKey: string) {
  try {
    const { data } = await db.from('contact_enrichment_cache').select('*').eq('cache_key', cacheKey).single();
    if (!data) return null;
    return { enriched_at: data.enriched_at, contacts: data.contacts, organization: data.organization };
  } catch {
    return null;
  }
}

async function cacheEnrichmentResult(db: SupabaseClient, cacheKey: string, data: any) {
  try {
    await db.from('contact_enrichment_cache').upsert({ cache_key: cacheKey, contacts: data.contacts, organization: data.organization, enriched_at: new Date().toISOString() });
  } catch {}
}

async function storeContactsInCRM(db: SupabaseClient, contacts: ApolloContact[], companyName: string) {
  try {
    const crmContacts = contacts.map(contact => ({ company_name: companyName, contact_name: contact.name || `${contact.first_name} ${contact.last_name}`, title: contact.title, email: contact.email, linkedin_url: contact.linkedin_url, phone: contact.phone_numbers?.[0] || null, source: 'Apollo Intel', enriched_at: new Date().toISOString(), apollo_id: contact.id }));
    await db.from('crm_contacts').upsert(crmContacts, { onConflict: 'email' });
  } catch {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company');
    if (!companyName) return NextResponse.json({ success: false, error: 'Company name is required' }, { status: 400 });
    const db = getDb();
    const cacheKey = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cached = await getCachedEnrichment(db, cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, source: 'cache', companyName, contacts: cached.contacts, organization: cached.organization, cachedAt: cached.enriched_at, isStale: isStale(cached.enriched_at) });
    }
    return NextResponse.json({ success: false, message: 'No cached data found. Use POST to enrich company data.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to retrieve cached data', details: (error as Error).message }, { status: 500 });
  }
}

function isStale(enrichedAt: string): boolean {
  const cacheAge = Date.now() - new Date(enrichedAt).getTime();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  return cacheAge > maxAge;
}