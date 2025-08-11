export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getDb(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if(!url || !key) throw new Error('Supabase env missing');
  return createClient(url, key, { auth: { persistSession:false } });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const channel = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    if (!contactId) return NextResponse.json({ error: 'contactId is required' }, { status: 400 });

    let query = supabase.from('outreach_logs').select(`id,contact_id,channel,action,timestamp,contact:contacts(id,full_name,email,company)`).eq('contact_id', contactId).order('timestamp', { ascending: false }).range(offset, offset + limit - 1);
    if (channel && channel !== 'all') {
      const channelMap: Record<string,string> = { gmail: 'email', outlook: 'email', linkedin: 'linkedin', phone: 'phone' };
      const mappedChannel = channelMap[channel] || channel;
      query = query.eq('channel', mappedChannel);
    }
    const { data: outreachLogs, error, count } = await query;
    if (error) return NextResponse.json({ error: 'Failed to fetch outreach history' }, { status: 500 });

    const transformedData = (outreachLogs||[]).map((item: any) => ({ id: item.id, contactId: item.contact_id, platform: item.channel, type: item.action, subject: `${item.action} via ${item.channel}`, snippet: `Contact was ${item.action} via ${item.channel}`, fullContent: `${item.action} interaction via ${item.channel} on ${new Date(item.timestamp).toLocaleString()}`, timestamp: item.timestamp, engagementStatus: item.action, contact: item.contact }));
    const hasMore = (count || 0) > offset + limit;
    return NextResponse.json({ data: transformedData, total: count || 0, hasMore });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getDb();
    const body = await request.json();
    const { contactId, channel, action } = body;
    if (!contactId || !channel || !action) return NextResponse.json({ error: 'contactId, channel, and action are required' }, { status: 400 });

    const { data, error } = await supabase.from('outreach_logs').insert({ contact_id: contactId, channel, action }).select().single();
    if (error) return NextResponse.json({ error: 'Failed to create outreach log entry' }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}