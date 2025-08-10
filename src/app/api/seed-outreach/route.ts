import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST() {
  try {

    // First, ensure we have some contacts
    const sampleContacts = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Sarah Chen',
        email: 'sarah.chen@techglobal.com',
        company: 'TechGlobal Solutions',
        title: 'Supply Chain Director',
        phone: '+1-555-0123',
        created_at: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Michael Wong',
        email: 'michael.wong@electronics-plus.com',
        company: 'Electronics Plus',
        title: 'Procurement Manager',
        phone: '+1-555-0124',
        created_at: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Jennifer Liu',
        email: 'jennifer.liu@smart-devices.com',
        company: 'Smart Devices Inc',
        title: 'Logistics Manager',
        phone: '+1-555-0125',
        created_at: new Date().toISOString()
      }
    ];

    // Insert contacts (ignore if they already exist)
    await supabase.from('contacts').upsert(sampleContacts, { onConflict: 'id' });

    // Create some campaigns
    const sampleCampaigns = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'China Electronics Q1 2024',
        created_at: new Date().toISOString()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        name: 'Asia-Pacific Partnership Drive',
        created_at: new Date().toISOString()
      }
    ];

    await supabase.from('campaigns').upsert(sampleCampaigns, { onConflict: 'id' });

    // Create sample outreach history
    const sampleOutreachHistory = [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        contact_id: '550e8400-e29b-41d4-a716-446655440001',
        platform: 'gmail',
        type: 'replied',
        subject: 'Re: Competitive shipping rates for electronics imports',
        snippet: 'Thanks for reaching out! We\'re definitely interested in exploring more cost-effective shipping options for our China imports...',
        full_content: 'Thanks for reaching out! We\'re definitely interested in exploring more cost-effective shipping options for our China imports. Our current rates are quite high and we\'re looking for alternatives. Could we schedule a call this week to discuss our requirements in detail?',
        timestamp: '2024-01-20T14:30:00Z',
        engagement_status: 'replied',
        thread_id: 'thread_001',
        campaign_id: '660e8400-e29b-41d4-a716-446655440001',
        gmail_message_id: 'gmail_msg_001'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        contact_id: '550e8400-e29b-41d4-a716-446655440001',
        platform: 'linkedin',
        type: 'sent',
        subject: 'LinkedIn Connection Request',
        snippet: 'Hi Sarah, I sent you an email about shipping solutions for TechGlobal. Would love to connect and discuss further!',
        full_content: 'Hi Sarah, I sent you an email about shipping solutions for TechGlobal. Would love to connect and discuss how we can help optimize your electronics imports from China.',
        timestamp: '2024-01-18T10:15:00Z',
        engagement_status: 'sent',
        linkedin_url: 'https://linkedin.com/in/sarah-chen-techglobal'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440003',
        contact_id: '550e8400-e29b-41d4-a716-446655440001',
        platform: 'gmail',
        type: 'opened',
        subject: 'Competitive shipping rates for electronics imports from China',
        snippet: 'Hi Sarah, I noticed TechGlobal imports significant volumes of electronics from China. We specialize in Asia-Pacific trade lanes...',
        full_content: 'Hi Sarah,\n\nI noticed TechGlobal imports significant volumes of electronics from China. We specialize in Asia-Pacific trade lanes and have helped companies like yours reduce shipping costs by 20-30% while improving transit reliability.\n\nOur services include:\n- Dedicated space allocation on premium vessels\n- Customs clearance and documentation\n- Door-to-door logistics solutions\n- Supply chain visibility platform\n\nWould you be open to a brief call this week to discuss your shipping requirements?\n\nBest regards,\nJohn Smith',
        timestamp: '2024-01-15T09:30:00Z',
        engagement_status: 'opened',
        thread_id: 'thread_001',
        campaign_id: '660e8400-e29b-41d4-a716-446655440001',
        gmail_message_id: 'gmail_msg_002'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440004',
        contact_id: '550e8400-e29b-41d4-a716-446655440002',
        platform: 'gmail',
        type: 'clicked',
        subject: 'Partnership opportunity for Asia-Pacific trade',
        snippet: 'Hello Michael, Electronics Plus appears to be a major importer from China and South Korea...',
        full_content: 'Hello Michael,\n\nElectronics Plus appears to be a major importer from China and South Korea. We have extensive experience in Asia-Pacific logistics and would like to explore a partnership opportunity.\n\nClick here to view our case studies: [Link]\n\nBest regards,\nJohn Smith',
        timestamp: '2024-01-12T14:20:00Z',
        engagement_status: 'clicked',
        campaign_id: '660e8400-e29b-41d4-a716-446655440001',
        gmail_message_id: 'gmail_msg_003'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440005',
        contact_id: '550e8400-e29b-41d4-a716-446655440003',
        platform: 'outlook',
        type: 'sent',
        subject: 'Supply chain optimization for smart device manufacturers',
        snippet: 'Hi Jennifer, Smart Devices Inc has shown impressive growth in the IoT space...',
        full_content: 'Hi Jennifer,\n\nSmart Devices Inc has shown impressive growth in the IoT space. As your volumes increase, optimizing your supply chain becomes crucial for maintaining competitiveness.\n\nWe\'d love to discuss how our logistics solutions can support your expansion plans.\n\nBest regards,\nJohn Smith',
        timestamp: '2024-01-10T11:00:00Z',
        engagement_status: 'sent',
        campaign_id: '660e8400-e29b-41d4-a716-446655440002'
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440006',
        contact_id: '550e8400-e29b-41d4-a716-446655440002',
        platform: 'linkedin',
        type: 'opened',
        subject: 'LinkedIn: Follow-up on procurement discussion',
        snippet: 'Michael, following up on our conversation about procurement challenges...',
        full_content: 'Michael, following up on our conversation about procurement challenges. I believe our platform could provide the visibility and cost savings you mentioned needing.',
        timestamp: '2024-01-08T16:45:00Z',
        engagement_status: 'opened',
        linkedin_url: 'https://linkedin.com/in/michael-wong-electronics'
      }
    ];

    const { data, error } = await supabase
      .from('outreach_history')
      .upsert(sampleOutreachHistory, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding outreach history:', error);
      return NextResponse.json(
        { error: 'Failed to seed outreach history' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Sample outreach history seeded successfully',
      contacts: sampleContacts.length,
      campaigns: sampleCampaigns.length,
      outreachEntries: sampleOutreachHistory.length
    });

  } catch (error) {
    console.error('Error in seed-outreach:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}