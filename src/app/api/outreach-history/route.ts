import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client only if environment variables are available
let supabase: any = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { 
          data: [], 
          total: 0, 
          hasMore: false,
          message: 'Supabase not configured - returning empty results' 
        },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const platform = searchParams.get('platform'); // 'gmail', 'linkedin', 'outlook', or 'all'
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
      .from('outreach_history')
      .select(`
        id,
        contact_id,
        platform,
        type,
        subject,
        snippet,
        full_content,
        timestamp,
        engagement_status,
        thread_id,
        campaign_id,
        linkedin_url,
        gmail_message_id,
        contact:contacts(
          id,
          name,
          email,
          company
        ),
        campaign:campaigns(
          id,
          name
        )
      `)
      .eq('contact_id', contactId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by platform if specified
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }

    const { data: outreachHistory, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch outreach history' },
        { status: 500 }
      );
    }

    // Transform the data for frontend consumption
    const transformedData = outreachHistory?.map((item: any) => ({
      id: item.id,
      contactId: item.contact_id,
      platform: item.platform,
      type: item.type,
      subject: item.subject,
      snippet: item.snippet,
      fullContent: item.full_content,
      timestamp: item.timestamp,
      engagementStatus: item.engagement_status,
      threadId: item.thread_id,
      campaignId: item.campaign_id,
      campaignName: item.campaign?.name,
      linkedinUrl: item.linkedin_url,
      gmailMessageId: item.gmail_message_id,
      contact: item.contact,
    })) || [];

    return NextResponse.json({
      data: transformedData,
      total: transformedData.length,
      hasMore: transformedData.length === limit
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
    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      contactId,
      platform,
      type,
      subject,
      snippet,
      fullContent,
      engagementStatus,
      threadId,
      campaignId,
      linkedinUrl,
      gmailMessageId
    } = body;

    if (!contactId || !platform || !type) {
      return NextResponse.json(
        { error: 'contactId, platform, and type are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('outreach_history')
      .insert({
        contact_id: contactId,
        platform,
        type,
        subject,
        snippet,
        full_content: fullContent,
        engagement_status: engagementStatus || 'sent',
        thread_id: threadId,
        campaign_id: campaignId,
        linkedin_url: linkedinUrl,
        gmail_message_id: gmailMessageId,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create outreach history entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}