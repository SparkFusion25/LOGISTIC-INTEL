import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

interface CRMLead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  last_contacted: string;
  stage: 'Prospect' | 'Contacted' | 'Nurturing' | 'Converted';
  source: 'Search' | 'Manual' | 'Campaign' | 'Import';
  notes?: string;
  created_at: string;
}

// Enhanced in-memory storage with realistic CRM data
let leads: CRMLead[] = [
  {
    id: 'lead_001',
    name: 'Sarah Chen',
    title: 'VP Supply Chain Operations',
    company: 'Apple Inc.',
    email: 's.chen@apple.com',
    phone: '+1-408-555-0123',
    linkedin: 'https://linkedin.com/in/sarahchen-apple',
    last_contacted: '2024-01-15',
    stage: 'Contacted',
    source: 'Search',
    notes: 'Interested in smartphone logistics. Follow up next week.',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'lead_002',
    name: 'Michael Zhang',
    title: 'Director of Global Logistics',
    company: 'Tesla Motors',
    email: 'm.zhang@tesla.com',
    phone: '+1-512-555-0456',
    linkedin: 'https://linkedin.com/in/mzhang-tesla',
    last_contacted: '2024-01-12',
    stage: 'Nurturing',
    source: 'Search',
    notes: 'Exploring EV component shipping options. Very responsive.',
    createdAt: '2024-01-08T14:30:00Z'
  },
  {
    id: 'lead_003',
    name: 'Jennifer Liu',
    title: 'Senior Manager, Import Operations',
    company: 'Amazon.com Inc.',
    email: 'j.liu@amazon.com',
    phone: '+1-206-555-0789',
    linkedin: 'https://linkedin.com/in/jliu-amazon',
    last_contacted: '2024-01-18',
    stage: 'Converted',
    source: 'Campaign',
    notes: 'Signed 6-month contract for electronics import. Great partnership!',
    createdAt: '2024-01-05T09:15:00Z'
  },
  {
    id: 'lead_004',
    name: 'David Rodriguez',
    title: 'VP International Sourcing',
    company: 'Walmart Inc.',
    email: 'd.rodriguez@walmart.com',
    phone: '+1-479-555-0234',
    linkedin: 'https://linkedin.com/in/drodriguez-walmart',
    last_contacted: '2024-01-10',
    stage: 'Prospect',
    source: 'Manual',
    notes: 'Potential high-volume textile imports from Vietnam.',
    createdAt: '2024-01-03T16:45:00Z'
  },
  {
    id: 'lead_005',
    name: 'Amanda Kim',
    title: 'Director, Global Trade Operations',
    company: 'Nike Inc.',
    email: 'a.kim@nike.com',
    phone: '+1-503-555-0567',
    linkedin: 'https://linkedin.com/in/akim-nike',
    last_contacted: '2024-01-14',
    stage: 'Contacted',
    source: 'Search',
    notes: 'Athletic footwear logistics expert. Scheduled demo for next week.',
    createdAt: '2024-01-02T11:20:00Z'
  },
  {
    id: 'lead_006',
    name: 'Robert Johnson',
    title: 'Senior Director, Supply Chain',
    company: 'Microsoft Corporation',
    email: 'r.johnson@microsoft.com',
    phone: '+1-425-555-0890',
    linkedin: 'https://linkedin.com/in/rjohnson-microsoft',
    last_contacted: '2024-01-16',
    stage: 'Nurturing',
    source: 'Campaign',
    notes: 'Tech hardware shipping requirements. Evaluating proposals.',
    createdAt: '2024-01-01T08:30:00Z'
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stage = searchParams.get('stage') || '';
  const company = searchParams.get('company') || '';
  const name = searchParams.get('name') || '';

  let filteredLeads = leads;

  // Apply filters
  if (stage) {
    filteredLeads = filteredLeads.filter(lead => lead.stage === stage);
  }
  if (company) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.company.toLowerCase().includes(company.toLowerCase())
    );
  }
  if (name) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  return NextResponse.json({ 
    success: true, 
    leads: filteredLeads,
    total_count: filteredLeads.length 
  })
}

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json()
    
    const newLead: CRMLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: leadData.name || '',
      title: leadData.title || '',
      company: leadData.company || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      linkedin: leadData.linkedin || '',
      last_contacted: new Date().toISOString().split('T')[0],
      stage: leadData.stage || 'Prospect',
      source: leadData.source || 'Manual',
      notes: leadData.notes || '',
      createdAt: new Date().toISOString()
    }
    
    leads.push(newLead)
    
    return NextResponse.json({ 
      success: true, 
      lead: newLead,
      message: 'Lead saved successfully' 
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to save lead' 
    }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    const initialLength = leads.length
    leads = leads.filter(lead => lead.id !== id)
    
    if (leads.length < initialLength) {
      return NextResponse.json({ 
        success: true, 
        message: 'Lead deleted successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Lead not found' 
      }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to delete lead' 
    }, { status: 400 })
  }
}