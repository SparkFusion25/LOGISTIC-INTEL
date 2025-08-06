import { NextRequest, NextResponse } from 'next/server';

interface OutreachLog {
  id: string;
  campaign_id: string;
  contact_email: string;
  contact_name: string;
  channel: 'Email' | 'LinkedIn' | 'PhantomBuster';
  status: 'Sent' | 'Opened' | 'Replied' | 'Clicked' | 'Failed' | 'Bounced';
  timestamp: string;
  campaign_name: string;
  subject?: string;
  message_preview?: string;
  user_id?: string;
  lead_id?: string;
  template_id?: string;
}

// Mock outreach logs data
let outreachLogs: OutreachLog[] = [
  {
    id: 'log_001',
    campaign_id: 'camp_001',
    contact_email: 'sarah.chen@techglobal.com',
    contact_name: 'Sarah Chen',
    channel: 'Email',
    status: 'Replied',
    timestamp: '2024-01-20T14:30:00Z',
    campaign_name: 'China Electronics Q1 2024',
    subject: 'Competitive shipping rates for electronics imports',
    message_preview: 'Hi Sarah, I noticed TechGlobal imports electronics from China...',
    user_id: 'user_001',
    lead_id: 'lead_001'
  },
  {
    id: 'log_002',
    campaign_id: 'camp_001',
    contact_email: 'michael.wong@electronics-plus.com',
    contact_name: 'Michael Wong',
    channel: 'Email',
    status: 'Opened',
    timestamp: '2024-01-20T13:15:00Z',
    campaign_name: 'China Electronics Q1 2024',
    subject: 'Partnership opportunity for Asia-Pacific trade',
    message_preview: 'Hello Michael, Electronics Plus appears to be a major importer...',
    user_id: 'user_001',
    lead_id: 'lead_002'
  },
  {
    id: 'log_003',
    campaign_id: 'camp_001',
    contact_email: 'jennifer.liu@smart-devices.com',
    contact_name: 'Jennifer Liu',
    channel: 'LinkedIn',
    status: 'Sent',
    timestamp: '2024-01-20T12:00:00Z',
    campaign_name: 'China Electronics Q1 2024',
    message_preview: 'Hi Jennifer, I sent you an email about shipping solutions...',
    user_id: 'user_001',
    lead_id: 'lead_003'
  },
  {
    id: 'log_004',
    campaign_id: 'camp_002',
    contact_email: 'carlos.rodriguez@autoparts-mx.com',
    contact_name: 'Carlos Rodriguez',
    channel: 'Email',
    status: 'Clicked',
    timestamp: '2024-01-20T11:45:00Z',
    campaign_name: 'Auto Parts Korea-Mexico',
    subject: 'Auto parts shipping optimization Korea → Mexico',
    message_preview: 'Dear Carlos, AutoParts MX handles significant Korea imports...',
    user_id: 'user_001',
    lead_id: 'lead_004'
  },
  {
    id: 'log_005',
    campaign_id: 'camp_001',
    contact_email: 'david.kim@tech-solutions.com',
    contact_name: 'David Kim',
    channel: 'PhantomBuster',
    status: 'Sent',
    timestamp: '2024-01-20T10:30:00Z',
    campaign_name: 'China Electronics Q1 2024',
    message_preview: 'LinkedIn automation: Tech Solutions contact discovery',
    user_id: 'user_001',
    lead_id: 'lead_005'
  },
  {
    id: 'log_006',
    campaign_id: 'camp_002',
    contact_email: 'maria.gonzalez@logistics-pro.mx',
    contact_name: 'Maria Gonzalez',
    channel: 'Email',
    status: 'Bounced',
    timestamp: '2024-01-20T09:15:00Z',
    campaign_name: 'Auto Parts Korea-Mexico',
    subject: 'Freight forwarding partnership opportunity',
    message_preview: 'Email delivery failed - invalid address',
    user_id: 'user_001',
    lead_id: 'lead_006'
  },
  {
    id: 'log_007',
    campaign_id: 'camp_003',
    contact_email: 'thomas.mueller@pharma-europe.de',
    contact_name: 'Thomas Mueller',
    channel: 'Email',
    status: 'Opened',
    timestamp: '2024-01-19T16:20:00Z',
    campaign_name: 'Pharma EU Expansion',
    subject: 'FDA-compliant pharma logistics Germany → USA',
    message_preview: 'Hello Thomas, Pharma Europe requires specialized logistics...',
    user_id: 'user_001',
    lead_id: 'lead_007'
  },
  {
    id: 'log_008',
    campaign_id: 'camp_001',
    contact_email: 'amy.zhang@global-electronics.com',
    contact_name: 'Amy Zhang',
    channel: 'LinkedIn',
    status: 'Replied',
    timestamp: '2024-01-19T15:45:00Z',
    campaign_name: 'China Electronics Q1 2024',
    message_preview: 'Thanks for connecting! Interested in your shipping rates.',
    user_id: 'user_001',
    lead_id: 'lead_008'
  },
  {
    id: 'log_009',
    campaign_id: 'camp_002',
    contact_email: 'luis.fernandez@automotive-supply.mx',
    contact_name: 'Luis Fernandez',
    channel: 'Email',
    status: 'Opened',
    timestamp: '2024-01-19T14:30:00Z',
    campaign_name: 'Auto Parts Korea-Mexico',
    subject: 'Automotive supply chain optimization',
    message_preview: 'Dear Luis, Automotive Supply handles Korea-Mexico trade...',
    user_id: 'user_001',
    lead_id: 'lead_009'
  },
  {
    id: 'log_010',
    campaign_id: 'camp_003',
    contact_email: 'anna.schmidt@german-pharma.de',
    contact_name: 'Anna Schmidt',
    channel: 'Email',
    status: 'Sent',
    timestamp: '2024-01-19T13:15:00Z',
    campaign_name: 'Pharma EU Expansion',
    subject: 'Cold chain logistics for pharmaceutical exports',
    message_preview: 'Hello Anna, German Pharma requires specialized cold chain...',
    user_id: 'user_001',
    lead_id: 'lead_010'
  }
];

// GET - Fetch outreach logs with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaign_id = searchParams.get('campaign_id');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredLogs = [...outreachLogs];

    // Apply filters
    if (campaign_id) {
      filteredLogs = filteredLogs.filter(log => log.campaign_id === campaign_id);
    }

    if (channel && channel !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.channel === channel);
    }

    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Calculate summary statistics
    const totalLogs = filteredLogs.length;
    const channelBreakdown = {
      Email: filteredLogs.filter(log => log.channel === 'Email').length,
      LinkedIn: filteredLogs.filter(log => log.channel === 'LinkedIn').length,
      PhantomBuster: filteredLogs.filter(log => log.channel === 'PhantomBuster').length,
    };

    const statusBreakdown = {
      Sent: filteredLogs.filter(log => log.status === 'Sent').length,
      Opened: filteredLogs.filter(log => log.status === 'Opened').length,
      Replied: filteredLogs.filter(log => log.status === 'Replied').length,
      Clicked: filteredLogs.filter(log => log.status === 'Clicked').length,
      Failed: filteredLogs.filter(log => log.status === 'Failed').length,
      Bounced: filteredLogs.filter(log => log.status === 'Bounced').length,
    };

    return NextResponse.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        total: totalLogs,
        limit,
        offset,
        hasMore: (offset + limit) < totalLogs
      },
      summary: {
        totalLogs,
        channelBreakdown,
        statusBreakdown,
        uniqueContacts: new Set(filteredLogs.map(log => log.contact_email)).size
      }
    });

  } catch (error) {
    console.error('Error fetching outreach logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch outreach logs' },
      { status: 500 }
    );
  }
}

// POST - Add new outreach log entry
export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();

    const newLog: OutreachLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaign_id: logData.campaign_id,
      contact_email: logData.contact_email,
      contact_name: logData.contact_name || 'Unknown Contact',
      channel: logData.channel,
      status: logData.status || 'Sent',
      timestamp: new Date().toISOString(),
      campaign_name: logData.campaign_name || 'Unknown Campaign',
      subject: logData.subject,
      message_preview: logData.message_preview,
      user_id: logData.user_id,
      lead_id: logData.lead_id,
      template_id: logData.template_id
    };

    // Add to logs
    outreachLogs.unshift(newLog); // Add to beginning for newest first

    return NextResponse.json({
      success: true,
      data: newLog,
      message: 'Outreach log created successfully'
    });

  } catch (error) {
    console.error('Error creating outreach log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create outreach log' },
      { status: 500 }
    );
  }
}

// PUT - Update outreach log status (e.g., email opened, replied)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');
    const updateData = await request.json();

    if (!logId) {
      return NextResponse.json(
        { success: false, error: 'Log ID is required' },
        { status: 400 }
      );
    }

    const logIndex = outreachLogs.findIndex(log => log.id === logId);
    
    if (logIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Outreach log not found' },
        { status: 404 }
      );
    }

    // Update the log
    outreachLogs[logIndex] = {
      ...outreachLogs[logIndex],
      ...updateData,
      timestamp: new Date().toISOString() // Update timestamp for status changes
    };

    return NextResponse.json({
      success: true,
      data: outreachLogs[logIndex],
      message: 'Outreach log updated successfully'
    });

  } catch (error) {
    console.error('Error updating outreach log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update outreach log' },
      { status: 500 }
    );
  }
}

// DELETE - Delete outreach log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json(
        { success: false, error: 'Log ID is required' },
        { status: 400 }
      );
    }

    const logIndex = outreachLogs.findIndex(log => log.id === logId);
    
    if (logIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Outreach log not found' },
        { status: 404 }
      );
    }

    // Remove the log
    const deletedLog = outreachLogs.splice(logIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedLog,
      message: 'Outreach log deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting outreach log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete outreach log' },
      { status: 500 }
    );
  }
}