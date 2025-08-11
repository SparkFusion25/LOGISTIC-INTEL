export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const sampleContacts = [
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Sarah Chen', email: 'sarah.chen@techglobal.com', company: 'TechGlobal Solutions', title: 'Supply Chain Director', phone: '+1-555-0123', created_at: new Date().toISOString() },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Michael Wong', email: 'michael.wong@electronics-plus.com', company: 'Electronics Plus', title: 'Procurement Manager', phone: '+1-555-0124', created_at: new Date().toISOString() },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Jennifer Liu', email: 'jennifer.liu@smart-devices.com', company: 'Smart Devices Inc', title: 'Logistics Manager', phone: '+1-555-0125', created_at: new Date().toISOString() }
    ];

    await supabase.from('contacts').upsert(sampleContacts, { onConflict: 'id' });

    const sampleCampaigns = [
      { id: '660e8400-e29b-41d4-a716-446655440001', name: 'China Electronics Q1 2024', created_at: new Date().toISOString() },
      { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Asia-Pacific Partnership Drive', created_at: new Date().toISOString() }
    ];
    await supabase.from('campaigns').upsert(sampleCampaigns, { onConflict: 'id' });

    const sampleOutreachHistory = [
      { id: '770e8400-e29b-41d4-a716-446655440001', contact_id: '550e8400-e29b-41d4-a716-446655440001', platform: 'gmail', type: 'replied', subject: 'Re: Competitive shipping rates for electronics imports', snippet: 'Thanks for reaching out! We\'re definitely interested...', full_content: 'Thanks for reaching out!...', timestamp: '2024-01-20T14:30:00Z', engagement_status: 'replied', thread_id: 'thread_001', campaign_id: '660e8400-e29b-41d4-a716-446655440001', gmail_message_id: 'gmail_msg_001' },
      { id: '770e8400-e29b-41d4-a716-446655440002', contact_id: '550e8400-e29b-41d4-a716-446655440001', platform: 'linkedin', type: 'sent', subject: 'LinkedIn Connection Request', snippet: 'Hi Sarah, I sent you an email...', full_content: 'Hi Sarah, ...', timestamp: '2024-01-18T10:15:00Z', engagement_status: 'sent', linkedin_url: 'https://linkedin.com/in/sarah-chen-techglobal' }
    ];

    const { error } = await supabase.from('outreach_history').upsert(sampleOutreachHistory, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: 'Failed to seed outreach history' }, { status: 500 });

    return NextResponse.json({ message: 'Sample outreach history seeded successfully', contacts: sampleContacts.length, campaigns: sampleCampaigns.length, outreachEntries: sampleOutreachHistory.length });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}