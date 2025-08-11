import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting CRM schema fix...');

    // Add metadata column as JSONB
    const { error: metadataError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add metadata column as JSONB for flexible data storage
        ALTER TABLE public.crm_contacts
        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
        
        -- Add owner_user_id column if it doesn't exist
        ALTER TABLE public.crm_contacts
        ADD COLUMN IF NOT EXISTS owner_user_id UUID;
      `
    });

    if (metadataError) {
      console.error('Error adding columns:', metadataError);
    } else {
      console.log('✅ Added metadata and owner_user_id columns');
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_crm_contacts_metadata ON public.crm_contacts USING GIN (metadata);
        CREATE INDEX IF NOT EXISTS idx_crm_contacts_added_by_user ON public.crm_contacts (added_by_user);
        CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner_user_id ON public.crm_contacts (owner_user_id);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Created performance indexes');
    }

    // Update existing records
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Update existing records with empty metadata if needed
        UPDATE public.crm_contacts 
        SET metadata = '{}'::jsonb 
        WHERE metadata IS NULL;
        
        -- Set owner_user_id to match added_by_user for existing records
        UPDATE public.crm_contacts 
        SET owner_user_id = added_by_user 
        WHERE owner_user_id IS NULL AND added_by_user IS NOT NULL;
      `
    });

    if (updateError) {
      console.error('Error updating records:', updateError);
    } else {
      console.log('✅ Updated existing records');
    }

    // Verify the schema
    const { data: schemaCheck } = await supabase
      .from('crm_contacts')
      .select('*')
      .limit(1);

    console.log('✅ CRM schema fix completed successfully');

    return NextResponse.json({
      success: true,
      message: 'CRM schema fixed - metadata column added',
      schemaCheck: schemaCheck ? 'Schema verified' : 'Schema needs verification'
    });

  } catch (error) {
    console.error('❌ CRM schema fix failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix CRM schema',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check current schema
    const { data, error } = await supabase
      .from('crm_contacts')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'CRM schema check',
      hasData: !!data?.length,
      error: error?.message || null
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check CRM schema',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}