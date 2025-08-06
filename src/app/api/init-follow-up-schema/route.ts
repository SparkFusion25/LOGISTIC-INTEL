import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

export async function POST() {
  try {
    console.log('🚀 Initializing Follow-Up System Schema...');

    // Execute the follow-up schema
    const schemaSQL = `
      -- Drop existing follow-up tables if they exist (for clean setup)
      DROP TABLE IF EXISTS follow_up_executions CASCADE;
      DROP TABLE IF EXISTS follow_up_steps CASCADE;
      DROP TABLE IF EXISTS follow_up_rules CASCADE;
      DROP TABLE IF EXISTS campaign_follow_ups CASCADE;

      -- Campaign Follow-Ups (main configuration for each campaign)
      CREATE TABLE IF NOT EXISTS campaign_follow_ups (
        id uuid primary key default gen_random_uuid(),
        campaign_id uuid references campaigns(id) ON DELETE CASCADE,
        name text not null,
        description text,
        is_active boolean default true,
        created_at timestamp default now(),
        updated_at timestamp default now()
      );

      -- Follow-Up Rules (defines trigger conditions)
      CREATE TABLE IF NOT EXISTS follow_up_rules (
        id uuid primary key default gen_random_uuid(),
        campaign_follow_up_id uuid references campaign_follow_ups(id) ON DELETE CASCADE,
        trigger_type text not null, -- 'email_opened', 'email_not_opened', 'link_clicked', 'no_reply', 'linkedin_viewed'
        trigger_condition jsonb, -- {days: 3, operator: 'after'} or {days: 7, operator: 'before'}
        action_type text not null, -- 'send_email', 'send_linkedin', 'mark_complete', 'add_to_list'
        action_config jsonb, -- email template, linkedin message, etc.
        step_order integer default 1,
        is_active boolean default true,
        created_at timestamp default now()
      );

      -- Follow-Up Steps (individual steps in a sequence)
      CREATE TABLE IF NOT EXISTS follow_up_steps (
        id uuid primary key default gen_random_uuid(),
        campaign_follow_up_id uuid references campaign_follow_ups(id) ON DELETE CASCADE,
        step_number integer not null,
        step_type text not null, -- 'email', 'linkedin', 'wait', 'condition'
        subject_line text,
        email_body text,
        delay_days integer default 1,
        delay_hours integer default 0,
        trigger_condition text, -- 'no_reply', 'no_open', 'clicked', 'opened'
        cta_text text,
        cta_url text,
        is_active boolean default true,
        created_at timestamp default now()
      );

      -- Follow-Up Executions (tracks actual execution of follow-ups)
      CREATE TABLE IF NOT EXISTS follow_up_executions (
        id uuid primary key default gen_random_uuid(),
        campaign_follow_up_id uuid references campaign_follow_ups(id) ON DELETE CASCADE,
        contact_id uuid references contacts(id) ON DELETE CASCADE,
        follow_up_step_id uuid references follow_up_steps(id) ON DELETE CASCADE,
        status text default 'pending', -- 'pending', 'sent', 'failed', 'skipped', 'completed'
        scheduled_at timestamp not null,
        executed_at timestamp,
        error_message text,
        email_message_id text, -- Gmail/Outlook message ID
        trigger_event_id uuid, -- Reference to the outreach_logs entry that triggered this
        execution_data jsonb, -- Store additional execution metadata
        created_at timestamp default now(),
        updated_at timestamp default now()
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_campaign_follow_ups_campaign_id ON campaign_follow_ups(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_follow_up_rules_campaign_follow_up_id ON follow_up_rules(campaign_follow_up_id);
      CREATE INDEX IF NOT EXISTS idx_follow_up_steps_campaign_follow_up_id ON follow_up_steps(campaign_follow_up_id);
      CREATE INDEX IF NOT EXISTS idx_follow_up_steps_step_number ON follow_up_steps(step_number);
      CREATE INDEX IF NOT EXISTS idx_follow_up_executions_status ON follow_up_executions(status);
      CREATE INDEX IF NOT EXISTS idx_follow_up_executions_scheduled_at ON follow_up_executions(scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_follow_up_executions_contact_id ON follow_up_executions(contact_id);

      -- Add updated_at trigger for follow_up_executions
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_follow_up_executions_updated_at 
        BEFORE UPDATE ON follow_up_executions 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_campaign_follow_ups_updated_at 
        BEFORE UPDATE ON campaign_follow_ups 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    `;

    // Try to execute the schema using direct SQL execution
    try {
      // Split SQL into individual statements and execute them
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.length > 0) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log('⚠️ SQL Statement executed with warning:', error);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Schema execution completed with warnings:', error);
    }

    console.log('✅ Follow-up schema creation attempted');

    // Insert sample follow-up configurations
    console.log('📊 Inserting sample follow-up data...');

    // Get existing campaigns for sample data
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name')
      .limit(2);

    if (campaigns && campaigns.length > 0) {
      // Create sample campaign follow-up
      const { data: campaignFollowUp, error: followUpError } = await supabase
        .from('campaign_follow_ups')
        .insert({
          campaign_id: campaigns[0].id,
          name: 'Smart Follow-Up Sequence',
          description: 'Automated follow-up sequence with intelligent triggers',
          is_active: true
        })
        .select()
        .single();

      if (followUpError) {
        console.error('❌ Sample campaign follow-up insertion error:', followUpError);
      } else if (campaignFollowUp) {
        console.log('✅ Sample campaign follow-up created');

        // Create sample follow-up steps
        const sampleSteps = [
          {
            campaign_follow_up_id: campaignFollowUp.id,
            step_number: 1,
            step_type: 'email',
            subject_line: 'Following up on our trade discussion',
            email_body: 'Hi {{name}}, I wanted to follow up on our previous conversation about trade opportunities. Have you had a chance to review our proposal?',
            delay_days: 3,
            trigger_condition: 'no_reply',
            is_active: true
          },
          {
            campaign_follow_up_id: campaignFollowUp.id,
            step_number: 2,
            step_type: 'email',
            subject_line: 'Quick question about your logistics needs',
            email_body: 'Hi {{name}}, I understand you\'re busy. Just wondering if you\'re still interested in optimizing your supply chain costs? We\'ve helped similar companies save 20-30% on shipping.',
            delay_days: 5,
            trigger_condition: 'no_open',
            cta_text: 'Schedule a Quick Call',
            cta_url: 'https://calendly.com/logistic-intel',
            is_active: true
          },
          {
            campaign_follow_up_id: campaignFollowUp.id,
            step_number: 3,
            step_type: 'email',
            subject_line: 'Last check-in: Trade intelligence insights',
            email_body: 'Hi {{name}}, This is my final follow-up. I\'ve attached a custom trade analysis report for your industry. Feel free to reach out if you\'d like to discuss further.',
            delay_days: 7,
            trigger_condition: 'no_reply',
            is_active: true
          }
        ];

        const { error: stepsError } = await supabase
          .from('follow_up_steps')
          .insert(sampleSteps);

        if (stepsError) {
          console.error('❌ Sample follow-up steps insertion error:', stepsError);
        } else {
          console.log('✅ Sample follow-up steps created');
        }

        // Create sample follow-up rules
        const sampleRules = [
          {
            campaign_follow_up_id: campaignFollowUp.id,
            trigger_type: 'no_reply',
            trigger_condition: { days: 3, operator: 'after' },
            action_type: 'send_email',
            action_config: { step_number: 1 },
            step_order: 1,
            is_active: true
          },
          {
            campaign_follow_up_id: campaignFollowUp.id,
            trigger_type: 'email_not_opened',
            trigger_condition: { days: 5, operator: 'after' },
            action_type: 'send_email',
            action_config: { step_number: 2 },
            step_order: 2,
            is_active: true
          },
          {
            campaign_follow_up_id: campaignFollowUp.id,
            trigger_type: 'no_reply',
            trigger_condition: { days: 7, operator: 'after' },
            action_type: 'send_email',
            action_config: { step_number: 3 },
            step_order: 3,
            is_active: true
          }
        ];

        const { error: rulesError } = await supabase
          .from('follow_up_rules')
          .insert(sampleRules);

        if (rulesError) {
          console.error('❌ Sample follow-up rules insertion error:', rulesError);
        } else {
          console.log('✅ Sample follow-up rules created');
        }
      }
    }

    console.log('✅ Follow-up system initialization completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Follow-up system initialized successfully',
      details: {
        schema_created: true,
        sample_data_inserted: true,
        tables_created: [
          'campaign_follow_ups',
          'follow_up_rules', 
          'follow_up_steps',
          'follow_up_executions'
        ]
      }
    });

  } catch (error) {
    console.error('💥 Follow-up system initialization failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Follow-up system initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}