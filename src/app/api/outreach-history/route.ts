import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const channel = searchParams.get('platform'); // 'email', 'linkedin', 'phone', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!contactId) {
      return NextResponse.json(
        { error: 'contactId is required' },
        { status: 400 }
      );
    }

    // Build the query
    let query = supabase
      .from('outreach_logs')
      .select(`
        id,
        contact_id,
        channel,
        action,
        timestamp,
        contact:contacts(
          id,
          full_name,
          email,
          company
        )
      `)
      .eq('contact_id', contactId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply channel filter if specified
    if (channel && channel !== 'all') {
      // Map platform names to channel names
      const channelMap: { [key: string]: string } = {
        'gmail': 'email',
        'outlook': 'email',
        'linkedin': 'linkedin',
        'phone': 'phone'
      };
      
      const mappedChannel = channelMap[channel] || channel;
      query = query.eq('channel', mappedChannel);
    }

    const { data: outreachLogs, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch outreach history' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const transformedData = outreachLogs?.map((item: any) => ({
      id: item.id,
      contactId: item.contact_id,
      platform: item.channel, // Map channel back to platform
      type: item.action,
      subject: `${item.action} via ${item.channel}`,
      snippet: `Contact was ${item.action} via ${item.channel}`,
      fullContent: `${item.action} interaction via ${item.channel} on ${new Date(item.timestamp).toLocaleString()}`,
      timestamp: item.timestamp,
      engagementStatus: item.action,
      contact: item.contact
    })) || [];

    const hasMore = (count || 0) > offset + limit;

    return NextResponse.json({
      data: transformedData,
      total: count || 0,
      hasMore
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contactId,
      channel,
      action
    } = body;

    if (!contactId || !channel || !action) {
      return NextResponse.json(
        { error: 'contactId, channel, and action are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('outreach_logs')
      .insert({
        contact_id: contactId,
        channel,
        action
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create outreach log entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}