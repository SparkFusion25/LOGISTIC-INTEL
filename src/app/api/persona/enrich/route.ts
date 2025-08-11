export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!url || !key) {
    throw new Error('Supabase env missing');
  }
  return createClient(url, key, { auth: { persistSession:false } });
}

interface PersonaData {
  personaSummary: string;
  topChallenges: string[];
  communicationStyle: string;
  smartQuestions: string[];
  buyingLikelihood: number;
  industryVertical: string;
  decisionMakerLevel: 'low' | 'medium' | 'high';
  preferredChannels: string[];
  lastEnriched: string;
}

interface ContactEnrichmentData {
  id: string;
  full_name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  domain?: string;
  region?: string;
  department?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();
    if (!contactId) return NextResponse.json({ success: false, error: 'Contact ID is required' }, { status: 400 });

    const db = getDb();
    const { data: contact } = await db.from('contacts').select('*').eq('id', contactId).maybeSingle();
    if (!contact) return NextResponse.json({ success: false, error: 'Contact not found' }, { status: 404 });

    const { data: outreachHistory } = await db.from('outreach_logs').select('*').eq('contact_id', contactId).order('timestamp', { ascending: false }).limit(10);

    const personaData = await generateAIPersona(contact as any, outreachHistory || []);

    const { error: updateError } = await db.from('contacts').update({ persona: personaData }).eq('id', contactId);
    if (updateError) return NextResponse.json({ success: false, error: 'Failed to update contact persona' }, { status: 500 });

    await logEnrichmentActivity(db, contactId, personaData);

    return NextResponse.json({ success: true, persona: personaData, message: 'Contact persona enriched successfully' });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function generateAIPersona(contact: ContactEnrichmentData, outreachHistory: any[]): Promise<PersonaData> {
  const industryKeywords = extractIndustryFromTitle(contact.title, contact.company);
  const seniorityLevel = assessSeniorityLevel(contact.title);
  const engagementScore = calculateEngagementScore(outreachHistory);
  await new Promise(resolve => setTimeout(resolve, 200));
  const persona: PersonaData = {
    personaSummary: generatePersonaSummary(contact, industryKeywords, seniorityLevel),
    topChallenges: generateTopChallenges(industryKeywords, seniorityLevel),
    communicationStyle: determineCommunicationStyle(contact.title, engagementScore),
    smartQuestions: generateSmartQuestions(industryKeywords, seniorityLevel),
    buyingLikelihood: calculateBuyingLikelihood(seniorityLevel, engagementScore, industryKeywords),
    industryVertical: industryKeywords.industry,
    decisionMakerLevel: seniorityLevel,
    preferredChannels: determinePreferredChannels(seniorityLevel, engagementScore),
    lastEnriched: new Date().toISOString()
  };
  return persona;
}

function extractIndustryFromTitle(title: string, company: string): { industry: string; vertical: string } {
  const lowerTitle = title.toLowerCase();
  const lowerCompany = company.toLowerCase();
  const industryMappings = [
    { keywords: ['logistics', 'freight', 'shipping', 'supply chain', 'warehouse'], industry: 'Logistics & Transportation', vertical: 'Freight Forwarding' },
    { keywords: ['electronics', 'technology', 'software', 'tech', 'hardware'], industry: 'Technology', vertical: 'Electronics Manufacturing' },
    { keywords: ['automotive', 'auto', 'vehicle', 'car'], industry: 'Automotive', vertical: 'Auto Parts Manufacturing' },
    { keywords: ['pharmaceutical', 'pharma', 'medical', 'healthcare'], industry: 'Healthcare', vertical: 'Pharmaceuticals' },
    { keywords: ['fashion', 'apparel', 'clothing', 'textile'], industry: 'Fashion & Retail', vertical: 'Apparel Manufacturing' },
    { keywords: ['food', 'beverage', 'agriculture', 'farming'], industry: 'Food & Agriculture', vertical: 'Food Processing' },
    { keywords: ['manufacturing', 'industrial', 'production'], industry: 'Manufacturing', vertical: 'Industrial Equipment' },
    { keywords: ['retail', 'consumer', 'commerce'], industry: 'Retail & E-commerce', vertical: 'Consumer Goods' }
  ];
  for (const mapping of industryMappings) {
    if (mapping.keywords.some(keyword => lowerTitle.includes(keyword) || lowerCompany.includes(keyword))) {
      return { industry: mapping.industry, vertical: mapping.vertical };
    }
  }
  return { industry: 'General Trade', vertical: 'Import/Export' };
}

function assessSeniorityLevel(title: string): 'low' | 'medium' | 'high' {
  const lowerTitle = title.toLowerCase();
  const seniorKeywords = ['director', 'vp', 'vice president', 'ceo', 'coo', 'cfo', 'president', 'head of', 'chief'];
  const midKeywords = ['manager', 'senior', 'lead', 'supervisor', 'coordinator'];
  if (seniorKeywords.some(keyword => lowerTitle.includes(keyword))) return 'high';
  if (midKeywords.some(keyword => lowerTitle.includes(keyword))) return 'medium';
  return 'low';
}

function calculateEngagementScore(outreachHistory: any[]): number {
  if (!outreachHistory || outreachHistory.length === 0) return 0;
  let score = 0;
  const recentHistory = outreachHistory.slice(0, 5);
  recentHistory.forEach(activity => {
    switch (activity.action) {
      case 'replied': score += 40; break;
      case 'clicked': score += 20; break;
      case 'opened': score += 10; break;
      case 'viewed': score += 5; break;
      default: score += 1;
    }
  });
  return Math.min(score, 100);
}

function generatePersonaSummary(contact: ContactEnrichmentData, industry: any, seniority: string): string {
  const desc: Record<string, string> = {
    high: 'a senior decision-maker with significant influence over procurement and strategic partnerships',
    medium: 'a mid-level professional involved in operational decisions and vendor evaluation',
    low: 'an operational team member who may influence vendor selection and day-to-day logistics'
  };
  const d = desc[seniority] || 'a professional';
  return `${contact.full_name} is ${d} at ${contact.company}, specializing in ${industry.industry}.`;
}

function generateTopChallenges(industry: any, seniority: string): string[] {
  const base = [
    'Rising freight and logistics costs',
    'Supply chain visibility limitations',
    'Trade compliance requirements',
    'Unpredictable transit times',
    'Finding reliable logistics partners'
  ];
  const extras: Record<string,string[]> = {
    'Technology': ['Managing component supply chains from Asia','Semiconductor shortage impacts'],
    'Automotive': ['Just-in-time delivery for production','Oversized cargo logistics'],
    'Healthcare': ['Cold chain management','Regulatory compliance'],
    'Fashion & Retail': ['Seasonal inventory planning','Sustainability requirements']
  };
  return [...base.slice(0,3), ...(extras[industry.industry] || []).slice(0,2)];
}

function determineCommunicationStyle(title: string, engagementScore: number): string {
  const lower = title.toLowerCase();
  if (lower.includes('director') || lower.includes('vp') || lower.includes('president')) return 'Strategic and executive-focused';
  if (lower.includes('manager') || lower.includes('senior')) return 'Detail-oriented and analytical';
  if (engagementScore > 50) return 'Responsive and collaborative';
  return 'Professional and cautious';
}

function generateSmartQuestions(industry: any, seniority: string): string[] {
  const base = [
    `What are your biggest challenges in managing ${industry.industry.toLowerCase()} logistics currently?`,
    'How much visibility do you have into your shipments once they leave the origin port?',
    'What percentage of your logistics budget goes to unexpected costs or delays?'
  ];
  const bySeniority: Record<string,string[]> = {
    high: ['What strategic initiatives could benefit from optimized logistics?','How do logistics costs impact profitability and growth plans?'],
    medium: ['What tools do you use to manage shipments?','How do you evaluate and onboard logistics partners?'],
    low: ['What day-to-day operational challenges do you face?','What info would help you manage operations better?']
  };
  return [...base, ...(bySeniority[seniority] || [])];
}

function calculateBuyingLikelihood(seniority: string, engagementScore: number, industry: any): number {
  let score = 30;
  const bySeniority: Record<string, number> = { high: 40, medium: 25, low: 10 };
  score += bySeniority[seniority] || 0;
  score += Math.floor(engagementScore * 0.3);
  const highValue = ['Technology', 'Automotive', 'Healthcare'];
  if (highValue.includes(industry.industry)) score += 15;
  score += Math.floor(Math.random() * 10);
  return Math.min(Math.max(score, 5), 95);
}

function determinePreferredChannels(seniority: string, engagementScore: number): string[] {
  const channels = ['Email'];
  if (seniority === 'high') channels.push('LinkedIn', 'Phone');
  else if (engagementScore > 30) channels.push('LinkedIn');
  if (engagementScore > 60) channels.push('Video Call');
  return channels;
}

async function logEnrichmentActivity(db: SupabaseClient, contactId: string, _personaData: PersonaData) {
  try {
    await db.from('outreach_logs').insert({ contact_id: contactId, channel: 'system', action: 'persona_enriched' });
  } catch {}
}