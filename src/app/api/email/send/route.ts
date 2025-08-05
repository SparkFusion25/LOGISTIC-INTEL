import { NextRequest, NextResponse } from 'next/server';

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  template_id?: string;
  variables?: { [key: string]: string };
  track_opens?: boolean;
  track_clicks?: boolean;
}

// Email logs for tracking
let emailLogs: Array<{
  id: string;
  to: string;
  subject: string;
  body: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced';
  tracking_id: string;
  opens: number;
  clicks: number;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const emailData: EmailRequest = await request.json();
    const { to, subject, body, template_id, variables = {}, track_opens = true, track_clicks = true } = emailData;

    // Validate required fields
    if (!to || !subject || !body) {
      return NextResponse.json({
        success: false,
        message: 'To, subject, and body are required'
      }, { status: 400 });
    }

    // Replace template variables
    let finalBody = body;
    let finalSubject = subject;
    
    if (variables) {
      Object.keys(variables).forEach(key => {
        const placeholder = `{{${key}}}`;
        finalBody = finalBody.replace(new RegExp(placeholder, 'g'), variables[key]);
        finalSubject = finalSubject.replace(new RegExp(placeholder, 'g'), variables[key]);
      });
    }

    // Generate tracking ID
    const trackingId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add tracking pixel if enabled
    if (track_opens) {
      finalBody += `\n\n<img src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/track/open/${trackingId}" width="1" height="1" style="display:none;" />`;
    }

    // In production, this would integrate with actual email service (Gmail, Outlook, SendGrid, etc.)
    // For demo purposes, we'll simulate sending
    console.log('📧 Sending Email:', {
      to,
      subject: finalSubject,
      tracking_id: trackingId
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log the email
    const emailLog = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to,
      subject: finalSubject,
      body: finalBody,
      sent_at: new Date().toISOString(),
      status: 'sent' as const,
      tracking_id: trackingId,
      opens: 0,
      clicks: 0
    };

    emailLogs.push(emailLog);

    // Auto-log to CRM if the endpoint exists
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crm/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: to,
          subject: finalSubject,
          activity_type: 'email_sent',
          notes: `Email sent: ${finalSubject}`
        })
      });
    } catch (error) {
      console.log('CRM logging failed (optional):', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      email_id: emailLog.id,
      tracking_id: trackingId,
      sent_at: emailLog.sent_at
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send email'
    }, { status: 500 });
  }
}

// Get email sending history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const recentEmails = emailLogs
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      emails: recentEmails,
      total: emailLogs.length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch email history'
    }, { status: 500 });
  }
}