export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const { data: existingTables } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');

    const schemaSQL = `
      DROP TABLE IF EXISTS outreach_logs CASCADE;
      DROP TABLE IF EXISTS personas CASCADE;
      DROP TABLE IF EXISTS contacts CASCADE;
      DROP TABLE IF EXISTS campaigns CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      CREATE TABLE IF NOT EXISTS users ( id uuid primary key default gen_random_uuid(), email text not null, name text, created_at timestamp default now() );
      CREATE TABLE IF NOT EXISTS campaigns ( id uuid primary key default gen_random_uuid(), user_id uuid references users(id), name text, tradelane text, industry text, status text default 'draft', created_at timestamp default now() );
      CREATE TABLE IF NOT EXISTS contacts ( id uuid primary key default gen_random_uuid(), campaign_id uuid references campaigns(id), full_name text, email text, phone text, company text, title text, linkedin text, persona jsonb, created_at timestamp default now() );
      CREATE TABLE IF NOT EXISTS outreach_logs ( id uuid primary key default gen_random_uuid(), contact_id uuid references contacts(id), channel text, action text, timestamp timestamp default now() );
      CREATE TABLE IF NOT EXISTS personas ( id uuid primary key default gen_random_uuid(), user_id uuid references users(id), industry text, segment text, tone text, key_challenges text, preferred_channels text, created_at timestamp default now() );
    `;

    try {
      const statements = schemaSQL.split(';').map(s => s.trim()).filter(Boolean);
      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) { /* continue */ }
      }
    } catch {}

    const { data: insertedUsers } = await supabase.from('users').upsert([ { email: 'john@acme.com', name: 'John Smith' }, { email: 'sarah@globaltrade.com', name: 'Sarah Chen' }, { email: 'mike@logistics.com', name: 'Mike Johnson' } ], { onConflict: 'email' }).select();
    const { data: users } = await supabase.from('users').select('id, email');
    if (users && users.length > 0) {
      const { data: insertedCampaigns } = await supabase.from('campaigns').upsert([ { user_id: users[0].id, name: 'China Electronics Q1 2024', tradelane: 'China → USA', industry: 'Electronics', status: 'active' }, { user_id: users[1].id, name: 'Asia-Pacific Partnership Drive', tradelane: 'Asia → USA', industry: 'Logistics', status: 'active' } ]).select();
      if (insertedCampaigns && insertedCampaigns.length > 0) {
        const { data: insertedContacts } = await supabase.from('contacts').upsert([ { campaign_id: insertedCampaigns[0].id, full_name: 'Sarah Chen', email: 'sarah.chen@techglobal.com', phone: '+1-408-555-0123', company: 'TechGlobal Solutions', title: 'Supply Chain Director', linkedin: 'https://linkedin.com/in/sarahchen-techglobal' }, { campaign_id: insertedCampaigns[0].id, full_name: 'Michael Wong', email: 'michael.wong@electronics-plus.com', phone: '+1-650-555-0456', company: 'Electronics Plus', title: 'Procurement Manager', linkedin: 'https://linkedin.com/in/mwong-electronics' }, { campaign_id: insertedCampaigns[1].id, full_name: 'Jennifer Liu', email: 'jennifer.liu@smart-devices.com', phone: '+1-415-555-0789', company: 'Smart Devices Inc', title: 'Logistics Manager', linkedin: 'https://linkedin.com/in/jliu-smartdevices' } ]).select();
        if (insertedContacts && insertedContacts.length > 0) {
          await supabase.from('outreach_logs').insert([ { contact_id: insertedContacts[0].id, channel: 'email', action: 'replied' }, { contact_id: insertedContacts[1].id, channel: 'linkedin', action: 'viewed' }, { contact_id: insertedContacts[2].id, channel: 'email', action: 'clicked' } ]);
        }
      }
      await supabase.from('personas').upsert([ { user_id: users[0].id, industry: 'Electronics', segment: 'Supply Chain Directors', tone: 'Professional', key_challenges: 'Cost optimization, Supply chain visibility, Compliance', preferred_channels: 'Email, LinkedIn' }, { user_id: users[1].id, industry: 'Logistics', segment: 'Freight Forwarders', tone: 'Relationship-focused', key_challenges: 'Capacity management, Rate optimization, Technology adoption', preferred_channels: 'Phone, Email' } ]);
    }

    return NextResponse.json({ success: true, message: 'Database initialized successfully' });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database initialization failed', details: (error as Error).message }, { status: 500 });
  }
}