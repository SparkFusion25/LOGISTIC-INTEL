import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

interface PersonaData {
  personaSummary: string;
  topChallenges: string[];
  communicationStyle: string;
  smartQuestions: string[];
  buyingLikelihood: number;
  industryVertical: string;
  decisionMakerLevel: 'low' | 'medium' | 'high';
  preferredChannels: string[];
  lastEnriched: string;
}

interface ContactEnrichmentData {
  id: string;
  full_name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  linkedin?: string;
  domain?: string;
  region?: string;
  department?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { contactId } = await request.json();

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    // Get contact data from Supabase
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      console.error('Contact fetch error:', contactError);
      return NextResponse.json(
        { success: false, error: 'Contact not found' },
        { status: 404 }
      );
    }

    // Get outreach history for context
    const { data: outreachHistory } = await supabase
      .from('outreach_logs')
      .select('*')
      .eq('contact_id', contactId)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Generate AI persona using mock GPT integration
    const personaData = await generateAIPersona(contact, outreachHistory || []);

    // Store/update persona data in contact record
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        persona: personaData
      })
      .eq('id', contactId);

    if (updateError) {
      console.error('Persona update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update contact persona' },
        { status: 500 }
      );
    }

    // Log enrichment activity
    await logEnrichmentActivity(contactId, personaData);

    return NextResponse.json({
      success: true,
      persona: personaData,
      message: 'Contact persona enriched successfully'
    });

  } catch (error) {
    console.error('Persona enrichment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateAIPersona(contact: ContactEnrichmentData, outreachHistory: any[]): Promise<PersonaData> {
  // In production, this would call OpenAI GPT API with a sophisticated prompt
  // For now, we'll use intelligent mock data based on contact details
  
  const industryKeywords = extractIndustryFromTitle(contact.title, contact.company);
  const seniorityLevel = assessSeniorityLevel(contact.title);
  const engagementScore = calculateEngagementScore(outreachHistory);
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate persona based on contact data
  const persona: PersonaData = {
    personaSummary: generatePersonaSummary(contact, industryKeywords, seniorityLevel),
    topChallenges: generateTopChallenges(industryKeywords, seniorityLevel),
    communicationStyle: determineCommunicationStyle(contact.title, engagementScore),
    smartQuestions: generateSmartQuestions(industryKeywords, seniorityLevel),
    buyingLikelihood: calculateBuyingLikelihood(seniorityLevel, engagementScore, industryKeywords),
    industryVertical: industryKeywords.industry,
    decisionMakerLevel: seniorityLevel,
    preferredChannels: determinePreferredChannels(seniorityLevel, engagementScore),
    lastEnriched: new Date().toISOString()
  };

  return persona;
}

function extractIndustryFromTitle(title: string, company: string): { industry: string; vertical: string } {
  const lowerTitle = title.toLowerCase();
  const lowerCompany = company.toLowerCase();
  
  // Industry mapping based on title and company keywords
  const industryMappings = [
    { keywords: ['logistics', 'freight', 'shipping', 'supply chain', 'warehouse'], industry: 'Logistics & Transportation', vertical: 'Freight Forwarding' },
    { keywords: ['electronics', 'technology', 'software', 'tech', 'hardware'], industry: 'Technology', vertical: 'Electronics Manufacturing' },
    { keywords: ['automotive', 'auto', 'vehicle', 'car'], industry: 'Automotive', vertical: 'Auto Parts Manufacturing' },
    { keywords: ['pharmaceutical', 'pharma', 'medical', 'healthcare'], industry: 'Healthcare', vertical: 'Pharmaceuticals' },
    { keywords: ['fashion', 'apparel', 'clothing', 'textile'], industry: 'Fashion & Retail', vertical: 'Apparel Manufacturing' },
    { keywords: ['food', 'beverage', 'agriculture', 'farming'], industry: 'Food & Agriculture', vertical: 'Food Processing' },
    { keywords: ['manufacturing', 'industrial', 'production'], industry: 'Manufacturing', vertical: 'Industrial Equipment' },
    { keywords: ['retail', 'consumer', 'commerce'], industry: 'Retail & E-commerce', vertical: 'Consumer Goods' }
  ];

  for (const mapping of industryMappings) {
    if (mapping.keywords.some(keyword => lowerTitle.includes(keyword) || lowerCompany.includes(keyword))) {
      return { industry: mapping.industry, vertical: mapping.vertical };
    }
  }

  return { industry: 'General Trade', vertical: 'Import/Export' };
}

function assessSeniorityLevel(title: string): 'low' | 'medium' | 'high' {
  const lowerTitle = title.toLowerCase();
  
  const seniorKeywords = ['director', 'vp', 'vice president', 'ceo', 'coo', 'cfo', 'president', 'head of', 'chief'];
  const midKeywords = ['manager', 'senior', 'lead', 'supervisor', 'coordinator'];
  
  if (seniorKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'high';
  } else if (midKeywords.some(keyword => lowerTitle.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

function calculateEngagementScore(outreachHistory: any[]): number {
  if (!outreachHistory || outreachHistory.length === 0) return 0;
  
  let score = 0;
  const recentHistory = outreachHistory.slice(0, 5); // Last 5 interactions
  
  recentHistory.forEach(activity => {
    switch (activity.action) {
      case 'replied': score += 40; break;
      case 'clicked': score += 20; break;
      case 'opened': score += 10; break;
      case 'viewed': score += 5; break;
      default: score += 1;
    }
  });
  
  return Math.min(score, 100); // Cap at 100
}

function generatePersonaSummary(contact: ContactEnrichmentData, industry: any, seniority: string): string {
  const seniorityDescriptions: Record<string, string> = {
    high: 'a senior decision-maker with significant influence over procurement and strategic partnerships',
    medium: 'a mid-level professional involved in operational decisions and vendor evaluation',
    low: 'an operational team member who may influence vendor selection and day-to-day logistics'
  };

  const description = seniorityDescriptions[seniority] || 'a professional';
  return `${contact.full_name} is ${description} at ${contact.company}, specializing in ${industry.industry}. As a ${contact.title}, they likely focus on optimizing supply chain efficiency, managing vendor relationships, and ensuring cost-effective logistics solutions. Their role involves balancing operational requirements with strategic business objectives, making them a key contact for trade intelligence and logistics partnerships.`;
}

function generateTopChallenges(industry: any, seniority: string): string[] {
  const baseChallenges = [
    'Rising freight and logistics costs impacting profit margins',
    'Supply chain visibility and real-time tracking limitations',
    'Complex international trade regulations and compliance requirements',
    'Unpredictable transit times affecting inventory management',
    'Finding reliable logistics partners in key trade lanes'
  ];

  const industryChallenges = {
    'Technology': [
      'Managing electronics component supply chains from Asia',
      'Ensuring temperature-controlled shipping for sensitive equipment',
      'Navigating semiconductor shortage impacts'
    ],
    'Automotive': [
      'Just-in-time delivery requirements for production lines',
      'Managing heavy machinery and oversized cargo logistics',
      'Coordinating multi-tier supplier networks'
    ],
    'Healthcare': [
      'Cold chain management for pharmaceutical products',
      'Regulatory compliance for medical device imports',
      'Emergency supply chain requirements'
    ],
    'Fashion & Retail': [
      'Seasonal inventory planning and fast fashion cycles',
      'Managing diverse product categories and sizes',
      'Sustainability and ethical sourcing requirements'
    ]
  };

  const specificChallenges = (industryChallenges as any)[industry.industry] || [];
  
  return [...baseChallenges.slice(0, 3), ...specificChallenges.slice(0, 2)];
}

function determineCommunicationStyle(title: string, engagementScore: number): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('director') || lowerTitle.includes('vp') || lowerTitle.includes('president')) {
    return 'Strategic and executive-focused, prefers high-level insights and ROI discussions';
  } else if (lowerTitle.includes('manager') || lowerTitle.includes('senior')) {
    return 'Detail-oriented and analytical, values data-driven recommendations and practical solutions';
  } else if (engagementScore > 50) {
    return 'Responsive and collaborative, open to exploring new solutions and partnerships';
  } else {
    return 'Professional and cautious, requires clear value propositions and reference cases';
  }
}

function generateSmartQuestions(industry: any, seniority: string): string[] {
  const baseQuestions = [
    `What are your biggest challenges in managing ${industry.industry.toLowerCase()} logistics currently?`,
    'How much visibility do you have into your shipments once they leave the origin port?',
    'What percentage of your logistics budget would you estimate goes to unexpected costs or delays?'
  ];

  const seniorityQuestions = {
    high: [
      'What strategic initiatives is your company pursuing that could benefit from optimized logistics?',
      'How do logistics costs impact your overall business profitability and growth plans?'
    ],
    medium: [
      'What tools or platforms do you currently use to track and manage shipments?',
      'How do you typically evaluate and onboard new logistics partners?'
    ],
    low: [
      'What daily operational challenges do you face with your current logistics setup?',
      'What information would help you better manage day-to-day shipping operations?'
    ]
  };

  const questions = (seniorityQuestions as any)[seniority] || [];
  return [...baseQuestions, ...questions];
}

function calculateBuyingLikelihood(seniority: string, engagementScore: number, industry: any): number {
  let baseScore = 30; // Base likelihood
  
  // Seniority impact
  const seniorityScores: Record<string, number> = { high: 40, medium: 25, low: 10 };
  baseScore += seniorityScores[seniority] || 0;
  
  // Engagement impact
  baseScore += Math.floor(engagementScore * 0.3);
  
  // Industry impact (some industries have higher logistics spend)
  const highValueIndustries = ['Technology', 'Automotive', 'Healthcare'];
  if (highValueIndustries.includes(industry.industry)) {
    baseScore += 15;
  }
  
  // Add some randomness for realism
  baseScore += Math.floor(Math.random() * 10);
  
  return Math.min(Math.max(baseScore, 5), 95); // Keep between 5-95%
}

function determinePreferredChannels(seniority: string, engagementScore: number): string[] {
  const baseChannels = ['Email'];
  
  if (seniority === 'high') {
    baseChannels.push('LinkedIn', 'Phone');
  } else if (engagementScore > 30) {
    baseChannels.push('LinkedIn');
  }
  
  if (engagementScore > 60) {
    baseChannels.push('Video Call');
  }
  
  return baseChannels;
}

async function logEnrichmentActivity(contactId: string, personaData: PersonaData) {
  try {
    await supabase
      .from('outreach_logs')
      .insert({
        contact_id: contactId,
        channel: 'system',
        action: 'persona_enriched'
      });
  } catch (error) {
    console.error('Failed to log enrichment activity:', error);
  }
}