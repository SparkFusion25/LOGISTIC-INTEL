import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendWithGmail } from '@/lib/email/gmailSend';
import { sendWithOutlook } from '@/lib/email/outlookSend';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body } = await request.json();

    // Lookup OAuth tokens
    const { data: userToken } = await supabase
      .from('user_tokens')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!userToken) {
      return NextResponse.json({ success: false, message: 'No email provider connected.' }, { status: 400 });
    }

    if (userToken.provider === 'gmail') {
      await sendWithGmail(userToken, to, subject, body);
    } else if (userToken.provider === 'outlook') {
      await sendWithOutlook(userToken, to, subject, body);
    } else {
      return NextResponse.json({ success: false, message: 'Unsupported provider.' }, { status: 400 });
    }

    // Log to email_activity and outreach_history tables, as before
    await supabase.from('email_activity').insert({
      user_id: user.id,
      contact_email: to,
      subject,
      body,
      status: 'sent',
      opens: 0,
      replies: 0,
    });

    await supabase.from('outreach_history').insert({
      user_id: user.id,
      contact_email: to,
      status: 'sent',
      opens: 0,
      replies: 0,
      next_followup_at: null,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}
