import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const activityData = await request.json();
    const { email, subject, activity_type, notes, metadata = {} } = activityData;

    if (!email || !activity_type) {
      return NextResponse.json({ success: false, message: 'Email and activity_type are required' }, { status: 400 });
    }

    // Map activity_type to status fields if needed
    const statusMap: Record<string, string> = {
      email_sent: 'sent',
      email_opened: 'opened',
      email_clicked: 'clicked',
      email_replied: 'replied'
    }

    const status = statusMap[activity_type] || 'sent'

    const { error } = await supabase
      .from('outreach_history')
      .insert({
        user_id: user.id,
        contact_id: null,
        campaign_id: null,
        status,
        opens: status === 'opened' ? 1 : 0,
        replies: status === 'replied' ? 1 : 0,
        next_followup_at: null
      })

    if (error) {
      return NextResponse.json({ success: false, message: 'Failed to log activity', details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Activity logged successfully' });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to log activity' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const { data, error } = await supabase
      .from('outreach_history')
      .select('id, user_id, contact_id, campaign_id, status, opens, replies, next_followup_at, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ success: false, message: 'Failed to fetch CRM activities' }, { status: 500 })
    }

    const activities = data || []
    const stats = {
      total_activities: activities.length,
      emails_sent: activities.filter(a => a.status === 'sent').length,
      emails_opened: activities.filter(a => a.status === 'opened').length,
      emails_replied: activities.filter(a => a.status === 'replied').length,
      unique_contacts: new Set(activities.map(a => a.contact_id).filter(Boolean)).size
    }

    return NextResponse.json({ success: true, activities, stats, total_count: activities.length })

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch CRM activities' }, { status: 500 })
  }
}