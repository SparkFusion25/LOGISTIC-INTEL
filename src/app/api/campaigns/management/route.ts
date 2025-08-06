import { NextRequest, NextResponse } from 'next/server';

interface Campaign {
  id: string;
  name: string;
  tradeLane: {
    from: string;
    to: string;
  };
  industry: string[];
  type: 'email' | 'email_linkedin' | 'email_phantom' | 'omnichannel';
  status: 'draft' | 'active' | 'paused' | 'completed';
  created: string;
  lastModified: string;
  stats: {
    totalLeads: number;
    sent: number;
    opened: number;
    replied: number;
    clicked: number;
    bounced: number;
    linkedinConnections: number;
  };
  sequence: CampaignStep[];
  targetFilters: {
    countries: string[];
    industries: string[];
    companySizes: string[];
    titles: string[];
  };
}

interface CampaignStep {
  id: string;
  type: 'email' | 'linkedin' | 'wait' | 'condition';
  delay: number;
  delayUnit: 'hours' | 'days';
  subject?: string;
  content?: string;
  condition?: 'opened' | 'clicked' | 'replied' | 'none';
  templateId?: string;
}

// Enhanced mock campaigns with more detailed data
let campaigns: Campaign[] = [
  {
    id: 'camp_001',
    name: 'China Electronics Importers Q1',
    tradeLane: { from: 'China', to: 'USA' },
    industry: ['Electronics', 'Consumer Goods'],
    type: 'email_linkedin',
    status: 'active',
    created: '2024-01-15',
    lastModified: '2024-01-18',
    stats: {
      totalLeads: 156,
      sent: 142,
      opened: 89,
      replied: 23,
      clicked: 45,
      bounced: 3,
      linkedinConnections: 67
    },
    sequence: [
      {
        id: 'step_001',
        type: 'email',
        delay: 0,
        delayUnit: 'days',
        subject: 'Competitive shipping rates for {{industry}} imports from {{origin}}',
        content: 'Hi {{firstName}}, I noticed {{company}} imports {{industry}} products from {{origin}}...',
        templateId: 'freight_intro'
      },
      {
        id: 'step_002',
        type: 'wait',
        delay: 2,
        delayUnit: 'days'
      },
      {
        id: 'step_003',
        type: 'linkedin',
        delay: 0,
        delayUnit: 'days',
        content: 'Hi {{firstName}}, I sent you an email about shipping solutions for {{company}}. Would love to connect!'
      },
      {
        id: 'step_004',
        type: 'wait',
        delay: 3,
        delayUnit: 'days'
      },
      {
        id: 'step_005',
        type: 'email',
        delay: 0,
        delayUnit: 'days',
        subject: 'Following up on shipping partnership for {{company}}',
        content: 'Hi {{firstName}}, I wanted to follow up on my previous email about shipping solutions...',
        condition: 'none'
      }
    ],
    targetFilters: {
      countries: ['USA', 'Canada'],
      industries: ['Electronics', 'Consumer Goods'],
      companySizes: ['Mid-Market', 'Enterprise'],
      titles: ['Procurement Manager', 'Supply Chain Director', 'Logistics Manager']
    }
  },
  {
    id: 'camp_002',
    name: 'Auto Parts - Korea → Mexico',
    tradeLane: { from: 'South Korea', to: 'Mexico' },
    industry: ['Automotive'],
    type: 'omnichannel',
    status: 'paused',
    created: '2024-01-10',
    lastModified: '2024-01-16',
    stats: {
      totalLeads: 89,
      sent: 76,
      opened: 52,
      replied: 18,
      clicked: 31,
      bounced: 2,
      linkedinConnections: 34
    },
    sequence: [
      {
        id: 'step_001',
        type: 'email',
        delay: 0,
        delayUnit: 'days',
        subject: 'Automotive shipping partnership - Korea to Mexico',
        content: 'Hello {{firstName}}, We specialize in Korea → Mexico automotive shipments...',
        templateId: 'automotive_intro'
      }
    ],
    targetFilters: {
      countries: ['Mexico'],
      industries: ['Automotive'],
      companySizes: ['Enterprise'],
      titles: ['Logistics Director', 'Procurement Manager', 'Operations Manager']
    }
  },
  {
    id: 'camp_003',
    name: 'European Pharmaceutical Outreach',
    tradeLane: { from: 'Germany', to: 'UK' },
    industry: ['Pharmaceutical', 'Healthcare'],
    type: 'email',
    status: 'draft',
    created: '2024-01-20',
    lastModified: '2024-01-20',
    stats: {
      totalLeads: 45,
      sent: 0,
      opened: 0,
      replied: 0,
      clicked: 0,
      bounced: 0,
      linkedinConnections: 0
    },
    sequence: [],
    targetFilters: {
      countries: ['UK', 'Ireland'],
      industries: ['Pharmaceutical', 'Healthcare'],
      companySizes: ['Enterprise'],
      titles: ['Supply Chain Manager', 'Procurement Director']
    }
  },
  {
    id: 'camp_004',
    name: 'Southeast Asia Textiles',
    tradeLane: { from: 'Vietnam', to: 'USA' },
    industry: ['Apparel & Textiles'],
    type: 'email_phantom',
    status: 'completed',
    created: '2024-01-05',
    lastModified: '2024-01-15',
    stats: {
      totalLeads: 234,
      sent: 234,
      opened: 178,
      replied: 45,
      clicked: 89,
      bounced: 8,
      linkedinConnections: 123
    },
    sequence: [
      {
        id: 'step_001',
        type: 'email',
        delay: 0,
        delayUnit: 'days',
        subject: 'Vietnam textile shipping - competitive rates available',
        content: 'Hi {{firstName}}, We offer premium shipping services for textile imports from Vietnam...'
      }
    ],
    targetFilters: {
      countries: ['USA'],
      industries: ['Apparel & Textiles'],
      companySizes: ['Mid-Market', 'Enterprise'],
      titles: ['Buyer', 'Sourcing Manager', 'Supply Chain Manager']
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const tradeLane = searchParams.get('trade_lane');

    let filteredCampaigns = [...campaigns];

    // Apply filters
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status);
    }

    if (type) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.type === type);
    }

    if (tradeLane) {
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        `${campaign.tradeLane.from} → ${campaign.tradeLane.to}`.toLowerCase().includes(tradeLane.toLowerCase())
      );
    }

    // Sort by last modified date
    filteredCampaigns.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    // Calculate summary stats
    const totalLeads = filteredCampaigns.reduce((sum, campaign) => sum + campaign.stats.totalLeads, 0);
    const totalSent = filteredCampaigns.reduce((sum, campaign) => sum + campaign.stats.sent, 0);
    const totalOpened = filteredCampaigns.reduce((sum, campaign) => sum + campaign.stats.opened, 0);
    const totalReplies = filteredCampaigns.reduce((sum, campaign) => sum + campaign.stats.replied, 0);
    const activeCampaigns = filteredCampaigns.filter(c => c.status === 'active').length;

    return NextResponse.json({
      success: true,
      campaigns: filteredCampaigns,
      summary: {
        total_campaigns: filteredCampaigns.length,
        active_campaigns: activeCampaigns,
        total_leads: totalLeads,
        total_sent: totalSent,
        total_opened: totalOpened,
        total_replies: totalReplies,
        overall_open_rate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
        overall_reply_rate: totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Campaign management API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Campaign management system unavailable'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      name: body.name || 'New Campaign',
      tradeLane: body.tradeLane || { from: '', to: '' },
      industry: body.industry || [],
      type: body.type || 'email',
      status: 'draft',
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      stats: {
        totalLeads: 0,
        sent: 0,
        opened: 0,
        replied: 0,
        clicked: 0,
        bounced: 0,
        linkedinConnections: 0
      },
      sequence: body.sequence || [],
      targetFilters: body.targetFilters || {
        countries: [],
        industries: [],
        companySizes: [],
        titles: []
      }
    };

    campaigns.unshift(newCampaign);

    return NextResponse.json({
      success: true,
      campaign: newCampaign,
      message: 'Campaign created successfully'
    });

  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create campaign'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
    
    if (campaignIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Campaign not found'
      }, { status: 404 });
    }

    // Update campaign
    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...updateData,
      lastModified: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      campaign: campaigns[campaignIndex],
      message: 'Campaign updated successfully'
    });

  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update campaign'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Campaign ID required'
      }, { status: 400 });
    }

    const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
    
    if (campaignIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Campaign not found'
      }, { status: 404 });
    }

    const deletedCampaign = campaigns.splice(campaignIndex, 1)[0];

    return NextResponse.json({
      success: true,
      campaign: deletedCampaign,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Campaign deletion error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete campaign'
    }, { status: 500 });
  }
}