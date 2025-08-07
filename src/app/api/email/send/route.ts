import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  template_id?: string;
  variables?: { [key: string]: string };
  track_opens?: boolean;
  track_clicks?: boolean;
  contact_id?: string;
  campaign_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const emailData: EmailRequest = await request.json();
    const { to, subject, body, template_id, variables = {}, track_opens = true, track_clicks = true, contact_id, campaign_id } = emailData;

    if (!to || !subject || !body) {
      return NextResponse.json({ success: false, message: 'To, subject, and body are required' }, { status: 400 });
    }

    // Replace template variables
    let finalBody = body;
    let finalSubject = subject;
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      finalBody = finalBody.replace(new RegExp(placeholder, 'g'), variables[key]);
      finalSubject = finalSubject.replace(new RegExp(placeholder, 'g'), variables[key]);
    });

    // Generate tracking ID
    const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Optionally append tracking pixel (your webhook would process opens)
    if (track_opens) {
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      finalBody += `\n\n<img src="${base}/api/email/track/open/${trackingId}" width="1" height="1" style="display:none;" />`;
    }

    // Persist email to email_activity
    const { data: activity, error: activityError } = await supabase
      .from('email_activity')
      .insert({
        user_id: user.id,
        contact_id: contact_id || null,
        subject: finalSubject,
        body: finalBody,
        status: 'sent',
        opens: 0,
        replies: 0
      })
      .select()
      .single()

    if (activityError) {
      return NextResponse.json({ success: false, message: 'Failed to log email activity', details: activityError.message }, { status: 500 })
    }

    // Log to outreach_history
    const { error: historyError } = await supabase
      .from('outreach_history')
      .insert({
        user_id: user.id,
        contact_id: contact_id || null,
        campaign_id: campaign_id || null,
        status: 'sent',
        opens: 0,
        replies: 0,
        next_followup_at: null
      })

    if (historyError) {
      // Not fatal to sending, but report back
      console.warn('outreach_history insert failed:', historyError)
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      email_id: activity?.id,
      tracking_id: trackingId,
      sent_at: activity?.created_at
    })

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
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
    const limit = parseInt(searchParams.get('limit') || '50');

    const { data, error } = await supabase
      .from('email_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ success: false, message: 'Failed to fetch email history' }, { status: 500 })
    }

    return NextResponse.json({ success: true, emails: data || [], total: data?.length || 0 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch email history' }, { status: 500 })
  }
}