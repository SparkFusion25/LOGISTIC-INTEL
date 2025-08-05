import { NextRequest, NextResponse } from 'next/server';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  variables: string[];
}

// Professional logistics email templates
const emailTemplates: EmailTemplate[] = [
  {
    id: 'intro_logistics',
    name: '🚢 Logistics Partnership Introduction',
    subject: 'Strategic Logistics Partnership Opportunity - {{company}}',
    category: 'introduction',
    variables: ['firstName', 'company', 'commodity'],
    body: `Hi {{firstName}},

I hope this email finds you well. I'm reaching out because I noticed {{company}} has significant {{commodity}} trade activity, and I believe there's a strategic opportunity for us to collaborate.

At Logistic Intel, we specialize in optimizing global supply chains for companies like {{company}}. Our clients typically see:

• 15-25% reduction in freight costs
• 40% faster customs clearance
• Real-time shipment visibility and tracking
• Dedicated account management

Would you be open to a brief 15-minute call to discuss how we can support {{company}}'s logistics operations?

Best regards,
[Your Name]

P.S. I've attached our recent case study showing how we helped a similar company in your industry reduce shipping costs by 23%.`
  },
  {
    id: 'follow_up_quote',
    name: '📋 Quote Follow-up',
    subject: 'Your {{commodity}} Shipping Quote - Next Steps',
    category: 'follow_up',
    variables: ['firstName', 'company', 'commodity', 'route'],
    body: `Hi {{firstName}},

I wanted to follow up on the shipping quote I sent for your {{commodity}} shipments on the {{route}} route.

Quick recap of what we discussed:
• Competitive rates with guaranteed capacity
• Door-to-door service with full visibility
• Dedicated customer support team
• Flexible payment terms

I understand logistics decisions involve multiple stakeholders. Is there anything specific I can clarify or any additional information you need to move forward?

I'm here to help make this as smooth as possible for {{company}}.

Best regards,
[Your Name]

---
Need immediate assistance? Call me directly at [Your Phone]`
  },
  {
    id: 'market_update',
    name: '📈 Market Intelligence Update',
    subject: 'Critical Market Update: {{commodity}} Shipping Trends',
    category: 'intelligence',
    variables: ['firstName', 'company', 'commodity'],
    body: `Hi {{firstName}},

Given {{company}}'s involvement in {{commodity}} trade, I wanted to share some critical market intelligence that could impact your shipping strategy:

📊 Current Market Trends:
• Ocean freight rates: Stabilizing after Q4 volatility
• Air cargo capacity: 15% increase in {{route}} routes
• Port congestion: Significant improvements at key ports
• Fuel surcharges: Expected to decrease 8-12% next quarter

💡 Strategic Recommendations:
1. Lock in rates for Q2-Q3 shipments now
2. Consider air freight for time-sensitive {{commodity}} shipments
3. Diversify port usage to avoid single-port dependency

Would you like to schedule a brief call to discuss how these trends specifically affect {{company}}'s operations?

Best regards,
[Your Name]

---
📱 This intelligence report is exclusive to our logistics partners`
  },
  {
    id: 'case_study',
    name: '🏆 Success Story & Case Study',
    subject: 'How [Similar Company] Reduced {{commodity}} Shipping Costs by 28%',
    category: 'case_study',
    variables: ['firstName', 'company', 'commodity'],
    body: `Hi {{firstName}},

I thought you'd find this case study interesting, especially given {{company}}'s {{commodity}} shipping volume.

📈 Client Challenge:
A Fortune 500 company similar to {{company}} was struggling with:
• Inconsistent shipping rates
• Poor visibility into shipment status
• Multiple vendor relationships
• Rising logistics costs

🎯 Our Solution:
• Consolidated shipping through our network
• Implemented real-time tracking system
• Negotiated volume-based rates
• Provided dedicated account management

📊 Results Achieved:
✅ 28% reduction in total shipping costs
✅ 95% on-time delivery rate
✅ 60% faster customs clearance
✅ Single point of contact for all shipments

The best part? We implemented this solution in just 30 days with zero disruption to their operations.

Would {{company}} be interested in exploring similar results for your {{commodity}} shipments?

Best regards,
[Your Name]

P.S. I have the full case study available if you'd like to review the details.`
  },
  {
    id: 'urgent_capacity',
    name: '🚨 Urgent Capacity Alert',
    subject: 'URGENT: {{commodity}} Shipping Capacity Available - {{route}}',
    category: 'urgent',
    variables: ['firstName', 'company', 'commodity', 'route'],
    body: `Hi {{firstName}},

I have urgent news that could significantly benefit {{company}}'s {{commodity}} operations:

🚨 IMMEDIATE CAPACITY AVAILABLE:
• Route: {{route}}
• Cargo Type: {{commodity}}
• Departure: Next 72 hours
• Special Rate: 20% below market price
• Guaranteed space allocation

This opportunity came up due to a last-minute cancellation, and I immediately thought of {{company}} given your {{commodity}} shipping requirements.

⏰ Time Sensitive:
This capacity must be confirmed by EOD tomorrow to secure the special pricing.

Can we schedule a quick 10-minute call today to discuss:
• Your current {{commodity}} shipping needs
• Timeline requirements
• Volume commitments

Reply ASAP or call me directly at [Your Phone].

Best regards,
[Your Name]

---
💡 Exclusive opportunity for preferred logistics partners`
  },
  {
    id: 'quarterly_review',
    name: '📊 Quarterly Logistics Review Invitation',
    subject: 'Q1 Logistics Performance Review - {{company}}',
    category: 'review',
    variables: ['firstName', 'company'],
    body: `Hi {{firstName}},

As we wrap up Q1, I'd like to invite you to a strategic logistics performance review for {{company}}.

📋 What We'll Cover:
• Q1 shipping performance analysis
• Cost optimization opportunities identified
• Market trends affecting your operations
• Q2 capacity planning and strategy
• New service offerings and solutions

🎯 Why This Matters:
Our quarterly reviews have helped clients:
• Identify $50K+ in annual cost savings
• Improve supply chain resilience
• Optimize routing and carrier selection
• Prepare for seasonal volume changes

📅 Review Options:
• Virtual meeting (30 minutes)
• In-person visit to your facility
• Executive lunch meeting

The review is complimentary and includes a detailed report with actionable recommendations for {{company}}.

When would work best for your schedule over the next two weeks?

Best regards,
[Your Name]

---
📈 Strategic logistics intelligence for informed decision-making`
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filteredTemplates = emailTemplates;
    
    if (category) {
      filteredTemplates = emailTemplates.filter(template => template.category === category);
    }

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      categories: ['introduction', 'follow_up', 'intelligence', 'case_study', 'urgent', 'review']
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch email templates'
    }, { status: 500 });
  }
}