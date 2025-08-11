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

    const schemaSQL = `
      DROP TABLE IF EXISTS follow_up_executions CASCADE;
      DROP TABLE IF EXISTS follow_up_steps CASCADE;
      DROP TABLE IF EXISTS follow_up_rules CASCADE;
      DROP TABLE IF EXISTS campaign_follow_ups CASCADE;
      CREATE TABLE IF NOT EXISTS campaign_follow_ups ( id uuid primary key default gen_random_uuid(), campaign_id uuid references campaigns(id) ON DELETE CASCADE, name text not null, description text, is_active boolean default true, created_at timestamp default now(), updated_at timestamp default now() );
      CREATE TABLE IF NOT EXISTS follow_up_rules ( id uuid primary key default gen_random_uuid(), campaign_follow_up_id uuid references campaign_follow_ups(id) ON DELETE CASCADE, trigger_type text not null, trigger_condition jsonb, action_type text not null, action_config jsonb, step_order integer default 1, is_active boolean default true, created_at timestamp default now() );
      CREATE TABLE IF NOT EXISTS follow_up_steps ( id uuid primary key default gen_random_uuid(), campaign_follow_up_id uuid references campaign_follow_ups(id) ON DELETE CASCADE, step_number integer not null, step_type text not null, subject_line text, email_body text, delay_days integer default 1, delay_hours integer default 0, trigger_condition text, cta_text text, cta_url text, is_active boolean default true, created_at timestamp default now() );
      CREATE TABLE IF NOT EXISTS follow_up_executions ( id uuid primary key default gen_random_uuid(), campaign_follow_up_id uuid references campaign_follow_ups(id) ON DELETE CASCADE, contact_id uuid references contacts(id) ON DELETE CASCADE, follow_up_step_id uuid references follow_up_steps(id) ON DELETE CASCADE, status text default 'pending', scheduled_at timestamp not null, executed_at timestamp, error_message text, email_message_id text, trigger_event_id uuid, execution_data jsonb, created_at timestamp default now(), updated_at timestamp default now() );
    `;

    try { await supabase.rpc('exec_sql', { sql: schemaSQL }); } catch {}

    const { data: campaigns } = await supabase.from('campaigns').select('id, name').limit(2);
    if (campaigns && campaigns.length > 0) {
      const { data: campaignFollowUp } = await supabase.from('campaign_follow_ups').insert({ campaign_id: campaigns[0].id, name: 'Smart Follow-Up Sequence', description: 'Automated follow-up sequence with intelligent triggers', is_active: true }).select().maybeSingle();
      if (campaignFollowUp) {
        const sampleSteps = [ { campaign_follow_up_id: campaignFollowUp.id, step_number: 1, step_type: 'email', subject_line: 'Following up on our trade discussion', email_body: 'Hi {{name}}...', delay_days: 3, trigger_condition: 'no_reply', is_active: true }, { campaign_follow_up_id: campaignFollowUp.id, step_number: 2, step_type: 'email', subject_line: 'Quick question about your logistics needs', email_body: 'Hi {{name}}...', delay_days: 5, trigger_condition: 'no_open', cta_text: 'Schedule a Quick Call', cta_url: 'https://calendly.com/logistic-intel', is_active: true } ];
        await supabase.from('follow_up_steps').insert(sampleSteps);
      }
    }

    return NextResponse.json({ success: true, message: 'Follow-up system initialized successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Follow-up system initialization failed', details: (error as Error).message }, { status: 500 });
  }
}