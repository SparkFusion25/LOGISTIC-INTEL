import { NextRequest, NextResponse } from 'next/server';

interface FreightEmailTemplate {
  id: string;
  name: string;
  category: 'freight_introduction' | 'ocean_shipping' | 'air_cargo' | 'customs_trade' | 'follow_up' | 'partnership';
  subject: string;
  content: string;
  variables: string[];
  tradeLanes: string[];
  industries: string[];
  useCase: string;
  performance: {
    avgOpenRate: number;
    avgReplyRate: number;
    timesUsed: number;
  };
}

const freightEmailTemplates: FreightEmailTemplate[] = [
  {
    id: 'freight_rates_intro',
    name: 'Competitive Freight Rates Introduction',
    category: 'freight_introduction',
    subject: 'Competitive shipping rates for {{industry}} imports from {{origin}}',
    content: `Hi {{firstName}},

I noticed {{company}} imports {{industry}} products from {{origin}} to {{destination}}.

We're currently offering highly competitive rates on this trade lane with:
• 15-20% cost savings vs. major carriers
• {{transitTime}} transit time
• Full container load (FCL) and less container load (LCL) options
• Real-time tracking and supply chain visibility
• Dedicated customer service team

Our recent shipments on the {{origin}} → {{destination}} route have achieved:
✓ 98.5% on-time delivery rate
✓ Zero damage claims in the last 6 months
✓ Average cost savings of $2,500 per container

Would you be open to a 10-minute call this week to discuss your shipping requirements and how we can optimize your logistics costs?

Best regards,
{{senderName}}
{{title}}
{{company}}
{{phone}} | {{email}}`,
    variables: ['firstName', 'company', 'industry', 'origin', 'destination', 'transitTime', 'senderName', 'title', 'phone', 'email'],
    tradeLanes: ['China → USA', 'Germany → UK', 'Vietnam → USA', 'South Korea → Mexico'],
    industries: ['Electronics', 'Automotive', 'Apparel & Textiles', 'Industrial Machinery'],
    useCase: 'Initial outreach to prospects importing goods on specific trade lanes',
    performance: {
      avgOpenRate: 34,
      avgReplyRate: 12,
      timesUsed: 156
    }
  },
  {
    id: 'ocean_freight_partnership',
    name: 'Ocean Freight Partnership Proposal',
    category: 'ocean_shipping',
    subject: 'Strategic shipping partnership - {{origin}} to {{destination}} trade lane',
    content: `Hello {{firstName}},

I hope this email finds you well. I'm reaching out because {{company}} appears to be a significant importer of {{industry}} products from {{origin}}.

We specialize in the {{origin}} → {{destination}} trade lane and have helped companies like yours:
• Reduce ocean freight costs by 20-30%
• Improve transit reliability and on-time performance
• Streamline customs clearance and documentation
• Gain end-to-end supply chain visibility

**Our Ocean Freight Services Include:**
→ Dedicated space allocation on premium vessel services
→ FCL and LCL consolidation options
→ Door-to-door logistics coordination
→ Customs brokerage and trade compliance
→ Supply chain analytics and reporting platform

Recent success story: We helped a similar company reduce their monthly shipping costs by $45,000 while improving delivery performance by 23% on the same trade lane.

I'd love to schedule a brief call to understand {{company}}'s shipping challenges and explore how we might support your logistics operations.

Are you available for a 15-minute conversation this week?

Best regards,
{{senderName}}
{{title}}
{{company}}
Direct: {{phone}}
Email: {{email}}`,
    variables: ['firstName', 'company', 'industry', 'origin', 'destination', 'senderName', 'title', 'phone', 'email'],
    tradeLanes: ['China → USA', 'Germany → UK', 'India → Europe', 'Thailand → Australia'],
    industries: ['Electronics', 'Automotive', 'Pharmaceutical', 'Consumer Goods'],
    useCase: 'Building strategic partnerships with high-volume importers',
    performance: {
      avgOpenRate: 28,
      avgReplyRate: 18,
      timesUsed: 89
    }
  },
  {
    id: 'air_cargo_urgent',
    name: 'Air Cargo Express Solutions',
    category: 'air_cargo',
    subject: 'Urgent air cargo solutions for {{industry}} - {{origin}} to {{destination}}',
    content: `Hi {{firstName}},

Time-sensitive shipments require reliable air cargo partners. If {{company}} ever needs expedited shipping for {{industry}} products from {{origin}}, we can help.

**Our Air Cargo Express Services:**
✈️ Next-flight-out options for critical shipments
✈️ 24-48 hour transit times on major routes
✈️ Temperature-controlled handling for sensitive goods
✈️ Real-time flight tracking and notifications
✈️ Customs clearance coordination at destination

**Why companies choose us for air cargo:**
• Dedicated account management
• Competitive rates with premium airlines
• Proactive communication throughout the shipment lifecycle
• 99.2% on-time delivery performance

Whether it's a production line down situation, last-minute order fulfillment, or seasonal peak shipping, we have the network and expertise to deliver when it matters most.

I'd be happy to provide a rate quote for your typical air cargo requirements. Could we schedule a brief call to discuss your expedited shipping needs?

Best regards,
{{senderName}}
{{title}}
{{company}}
Mobile: {{phone}}
Email: {{email}}`,
    variables: ['firstName', 'company', 'industry', 'origin', 'destination', 'senderName', 'title', 'phone', 'email'],
    tradeLanes: ['China → USA', 'Germany → USA', 'Japan → USA', 'South Korea → USA'],
    industries: ['Electronics', 'Pharmaceutical', 'Aerospace', 'Automotive'],
    useCase: 'Targeting companies that require urgent or time-sensitive shipping',
    performance: {
      avgOpenRate: 41,
      avgReplyRate: 22,
      timesUsed: 67
    }
  },
  {
    id: 'customs_trade_compliance',
    name: 'Customs & Trade Compliance Expertise',
    category: 'customs_trade',
    subject: 'Streamline customs clearance for {{industry}} imports - {{origin}} expertise',
    content: `Dear {{firstName}},

Importing {{industry}} products from {{origin}} involves complex customs regulations and trade compliance requirements. I wanted to reach out because {{company}} could benefit from our specialized customs brokerage services.

**Our Trade Compliance Expertise Includes:**
📋 HS code classification and optimization
📋 Duty and tax calculation and planning
📋 Import/export documentation management
📋 Trade agreement utilization (USMCA, EU-UK TCA, etc.)
📋 Regulatory compliance monitoring
📋 Customs audit support and consultation

**Recent Client Success:**
We helped a {{industry}} importer save $180,000 annually by:
• Optimizing HS classifications for lower duty rates
• Implementing USMCA preferential treatment
• Streamlining documentation processes
• Reducing customs examination rates by 40%

Customs delays and compliance issues can be costly. Our team of licensed customs brokers ensures your shipments clear efficiently while maintaining full regulatory compliance.

Would you be interested in a complimentary customs consultation to review your current import processes?

Best regards,
{{senderName}}
{{title}}
{{company}}
Direct: {{phone}}
Email: {{email}}`,
    variables: ['firstName', 'company', 'industry', 'origin', 'senderName', 'title', 'phone', 'email'],
    tradeLanes: ['Mexico → USA', 'China → USA', 'Canada → USA', 'EU → UK'],
    industries: ['Automotive', 'Electronics', 'Apparel & Textiles', 'Industrial Machinery'],
    useCase: 'Positioning customs brokerage and trade compliance services',
    performance: {
      avgOpenRate: 26,
      avgReplyRate: 15,
      timesUsed: 43
    }
  },
  {
    id: 'supply_chain_optimization',
    name: 'Supply Chain Optimization Follow-up',
    category: 'follow_up',
    subject: 'Following up: Supply chain optimization for {{company}}',
    content: `Hi {{firstName}},

I wanted to follow up on my previous email about shipping solutions for {{company}}.

I understand you're likely evaluating multiple logistics providers, which is why I wanted to share some specific ways we've helped similar {{industry}} companies optimize their supply chains:

**Case Study - Similar {{industry}} Company:**
Challenge: High shipping costs and inconsistent transit times from {{origin}}
Solution: Implemented our integrated logistics platform
Results:
• 22% reduction in total logistics costs
• 35% improvement in on-time delivery
• Reduced inventory carrying costs by $125,000
• Enhanced supply chain visibility and reporting

**What sets us apart:**
→ Industry-specific expertise in {{industry}} logistics
→ Proprietary technology platform for real-time visibility
→ Dedicated account team with 10+ years experience
→ Risk management and contingency planning

I'd be happy to put together a customized proposal showing potential cost savings and service improvements for {{company}}'s specific shipping requirements.

Are you available for a brief call this week to discuss your logistics challenges?

Best regards,
{{senderName}}
{{title}}
{{company}}
Direct: {{phone}}`,
    variables: ['firstName', 'company', 'industry', 'origin', 'senderName', 'title', 'phone'],
    tradeLanes: ['China → USA', 'Vietnam → USA', 'Germany → UK', 'India → Europe'],
    industries: ['Electronics', 'Automotive', 'Pharmaceutical', 'Consumer Goods'],
    useCase: 'Follow-up email with specific value propositions and case studies',
    performance: {
      avgOpenRate: 31,
      avgReplyRate: 19,
      timesUsed: 112
    }
  },
  {
    id: 'strategic_partnership',
    name: 'Strategic Logistics Partnership',
    category: 'partnership',
    subject: 'Strategic logistics partnership opportunity for {{company}}',
    content: `Dear {{firstName}},

As {{title}} at {{company}}, you understand the critical importance of reliable logistics partners in today's global supply chain environment.

I'm reaching out to explore a potential strategic partnership between {{company}} and our organization. We specialize in comprehensive logistics solutions for {{industry}} companies importing from {{origin}}.

**Strategic Partnership Benefits:**
🤝 Dedicated account management and priority service
🤝 Volume-based pricing tiers and cost predictability
🤝 Quarterly business reviews and performance analytics
🤝 Supply chain risk mitigation and contingency planning
🤝 Technology integration and data sharing capabilities
🤝 Market intelligence and trade lane insights

**Our Partnership Approach:**
Rather than just being a service provider, we become an extension of your supply chain team. Our partnerships typically result in:
• 15-25% reduction in total logistics costs
• Improved working capital management
• Enhanced operational efficiency
• Risk mitigation and supply chain resilience

Given {{company}}'s position in the {{industry}} market and your {{origin}} sourcing activities, I believe there's significant potential for a mutually beneficial partnership.

I'd welcome the opportunity to discuss how we can support {{company}}'s growth objectives through strategic logistics collaboration.

Would you be open to an exploratory conversation over the next week or two?

Best regards,
{{senderName}}
{{title}}
{{company}}
Direct: {{phone}}
Email: {{email}}`,
    variables: ['firstName', 'company', 'title', 'industry', 'origin', 'senderName', 'phone', 'email'],
    tradeLanes: ['China → USA', 'Germany → UK', 'South Korea → Mexico', 'Vietnam → Australia'],
    industries: ['Automotive', 'Electronics', 'Pharmaceutical', 'Industrial Machinery'],
    useCase: 'High-level outreach for strategic partnerships with large importers',
    performance: {
      avgOpenRate: 24,
      avgReplyRate: 14,
      timesUsed: 34
    }
  },
  {
    id: 'rate_increase_alternative',
    name: 'Rate Increase Alternative Solution',
    category: 'freight_introduction',
    subject: 'Alternative to rising {{mode}} rates - {{origin}} to {{destination}}',
    content: `Hi {{firstName}},

With recent rate increases from major carriers on the {{origin}} → {{destination}} trade lane, many {{industry}} importers are looking for cost-effective alternatives.

I wanted to reach out because we've been able to help companies like {{company}} maintain competitive shipping costs despite market volatility.

**How we're helping {{industry}} importers:**
💰 Fixed-rate contracts protecting against market fluctuations
💰 Alternative routing options reducing costs by 10-15%
💰 Consolidation services for LCL shipments
💰 Flexible booking and space protection programs

**Current Market Advantage:**
While major carriers have implemented 15-20% rate increases, we're offering stable pricing with improved service levels through our carrier partnerships and space allocation agreements.

Recent client example: We helped a similar company reduce their monthly shipping spend by $23,000 while maintaining the same service levels during the recent rate volatility.

Given the current market conditions, this might be an ideal time to review your shipping arrangements and explore cost optimization opportunities.

Would you be interested in a rate comparison for your typical {{origin}} → {{destination}} shipments?

Best regards,
{{senderName}}
{{title}}
{{company}}
Direct: {{phone}}`,
    variables: ['firstName', 'company', 'industry', 'origin', 'destination', 'mode', 'senderName', 'title', 'phone'],
    tradeLanes: ['China → USA', 'Vietnam → USA', 'Germany → UK', 'South Korea → Mexico'],
    industries: ['Electronics', 'Automotive', 'Apparel & Textiles', 'Consumer Goods'],
    useCase: 'Addressing market rate increases and positioning as cost-effective alternative',
    performance: {
      avgOpenRate: 38,
      avgReplyRate: 16,
      timesUsed: 78
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tradeLane = searchParams.get('trade_lane');
    const industry = searchParams.get('industry');

    let filteredTemplates = [...freightEmailTemplates];

    // Apply filters
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }

    if (tradeLane) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.tradeLanes.some(lane => lane.toLowerCase().includes(tradeLane.toLowerCase()))
      );
    }

    if (industry) {
      filteredTemplates = filteredTemplates.filter(template => 
        template.industries.some(ind => ind.toLowerCase().includes(industry.toLowerCase()))
      );
    }

    // Sort by performance (open rate + reply rate)
    filteredTemplates.sort((a, b) => {
      const scoreA = a.performance.avgOpenRate + a.performance.avgReplyRate;
      const scoreB = b.performance.avgOpenRate + b.performance.avgReplyRate;
      return scoreB - scoreA;
    });

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      categories: [
        { value: 'freight_introduction', label: 'Freight Introduction', count: freightEmailTemplates.filter(t => t.category === 'freight_introduction').length },
        { value: 'ocean_shipping', label: 'Ocean Shipping', count: freightEmailTemplates.filter(t => t.category === 'ocean_shipping').length },
        { value: 'air_cargo', label: 'Air Cargo', count: freightEmailTemplates.filter(t => t.category === 'air_cargo').length },
        { value: 'customs_trade', label: 'Customs & Trade', count: freightEmailTemplates.filter(t => t.category === 'customs_trade').length },
        { value: 'follow_up', label: 'Follow-up', count: freightEmailTemplates.filter(t => t.category === 'follow_up').length },
        { value: 'partnership', label: 'Partnership', count: freightEmailTemplates.filter(t => t.category === 'partnership').length }
      ],
      performance_summary: {
        avg_open_rate: Math.round(freightEmailTemplates.reduce((sum, t) => sum + t.performance.avgOpenRate, 0) / freightEmailTemplates.length),
        avg_reply_rate: Math.round(freightEmailTemplates.reduce((sum, t) => sum + t.performance.avgReplyRate, 0) / freightEmailTemplates.length),
        total_usage: freightEmailTemplates.reduce((sum, t) => sum + t.performance.timesUsed, 0)
      }
    });

  } catch (error) {
    console.error('Freight templates API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Freight templates system unavailable'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newTemplate: FreightEmailTemplate = {
      id: `template_${Date.now()}`,
      name: body.name,
      category: body.category,
      subject: body.subject,
      content: body.content,
      variables: body.variables || [],
      tradeLanes: body.tradeLanes || [],
      industries: body.industries || [],
      useCase: body.useCase || '',
      performance: {
        avgOpenRate: 0,
        avgReplyRate: 0,
        timesUsed: 0
      }
    };

    freightEmailTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: 'Template created successfully'
    });

  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create template'
    }, { status: 500 });
  }
}