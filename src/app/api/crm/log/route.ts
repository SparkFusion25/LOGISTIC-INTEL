import { NextRequest, NextResponse } from 'next/server';

interface CRMActivity {
  id: string;
  email: string;
  subject?: string;
  activity_type: 'email_sent' | 'email_opened' | 'email_clicked' | 'email_replied' | 'call_made' | 'meeting_scheduled' | 'note_added';
  notes?: string;
  timestamp: string;
  metadata?: { [key: string]: any };
}

// In-memory activity log (in production, this would be a database)
let crmActivities: CRMActivity[] = [
  {
    id: 'activity_001',
    email: 's.chen@apple.com',
    subject: 'Strategic Logistics Partnership Opportunity - Apple Inc.',
    activity_type: 'email_sent',
    notes: 'Initial outreach email sent to Apple VP Supply Chain',
    timestamp: '2024-01-15T10:30:00Z',
    metadata: { template_id: 'intro_logistics', tracking_id: 'track_12345' }
  },
  {
    id: 'activity_002',
    email: 'm.zhang@tesla.com',
    subject: 'Market Intelligence Update: Electronics Shipping Trends',
    activity_type: 'email_opened',
    notes: 'Email opened by Tesla Director of Global Logistics',
    timestamp: '2024-01-12T14:15:00Z',
    metadata: { open_count: 3, last_opened: '2024-01-14T09:22:00Z' }
  },
  {
    id: 'activity_003',
    email: 'j.liu@amazon.com',
    subject: 'Q1 Logistics Performance Review - Amazon.com Inc.',
    activity_type: 'email_replied',
    notes: 'Positive response! Scheduled follow-up meeting for next week.',
    timestamp: '2024-01-18T16:45:00Z',
    metadata: { reply_sentiment: 'positive', meeting_scheduled: true }
  }
];

export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json();
    const { email, subject, activity_type, notes, metadata = {} } = activityData;

    if (!email || !activity_type) {
      return NextResponse.json({
        success: false,
        message: 'Email and activity_type are required'
      }, { status: 400 });
    }

    const newActivity: CRMActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      subject,
      activity_type,
      notes,
      timestamp: new Date().toISOString(),
      metadata
    };

    crmActivities.push(newActivity);

    console.log('📝 CRM Activity Logged:', {
      email,
      activity_type,
      timestamp: newActivity.timestamp
    });

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
      activity_id: newActivity.id
    });

  } catch (error) {
    console.error('CRM logging error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to log activity'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const activity_type = searchParams.get('activity_type');
    const limit = parseInt(searchParams.get('limit') || '100');

    let filteredActivities = crmActivities;

    // Filter by email if provided
    if (email) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.email.toLowerCase().includes(email.toLowerCase())
      );
    }

    // Filter by activity type if provided
    if (activity_type) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.activity_type === activity_type
      );
    }

    // Sort by timestamp (most recent first) and limit results
    const sortedActivities = filteredActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    // Get activity summary stats
    const stats = {
      total_activities: sortedActivities.length,
      emails_sent: sortedActivities.filter(a => a.activity_type === 'email_sent').length,
      emails_opened: sortedActivities.filter(a => a.activity_type === 'email_opened').length,
      emails_replied: sortedActivities.filter(a => a.activity_type === 'email_replied').length,
      unique_contacts: Array.from(new Set(sortedActivities.map(a => a.email))).length
    };

    return NextResponse.json({
      success: true,
      activities: sortedActivities,
      stats,
      total_count: filteredActivities.length
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch CRM activities'
    }, { status: 500 });
  }
}