import { NextRequest, NextResponse } from 'next/server'

interface SearchFilters {
  company?: string;
  name?: string;
  city?: string;
  commodity?: string;
}

interface TradeEntry {
  company: string;
  name: string;
  city: string;
  commodity: string;
  contact: string;
  email: string;
  phone?: string;
}

// Mock data that matches the new TradeEntry structure
const mockTradeData: TradeEntry[] = [
  {
    company: 'Global Electronics Trading Corp',
    name: 'Sarah Chen',
    city: 'Shanghai',
    commodity: 'Electronics',
    contact: 'Sarah Chen',
    email: 'sarah.chen@getc.com',
    phone: '+86-21-123456'
  },
  {
    company: 'European Auto Parts Ltd',
    name: 'Miguel Rodriguez',
    city: 'Hamburg',
    commodity: 'Auto Parts',
    contact: 'Miguel Rodriguez',
    email: 'm.rodriguez@eaparts.eu',
    phone: '+49-40-123456'
  },
  {
    company: 'Pacific Textiles Manufacturing',
    name: 'Jin Kim',
    city: 'Busan',
    commodity: 'Textiles',
    contact: 'Jin Kim',
    email: 'j.kim@pactextiles.com',
    phone: '+82-51-123456'
  },
  {
    company: 'American Steel Corp',
    name: 'Robert Wilson',
    city: 'Pittsburgh',
    commodity: 'Steel Products',
    contact: 'Robert Wilson',
    email: 'operations@amsteel.com',
    phone: '+1-412-555-0123'
  },
  {
    company: 'California Fresh Produce',
    name: 'Maria Lopez',
    city: 'Los Angeles',
    commodity: 'Fresh Fruits',
    contact: 'Maria Lopez',
    email: 'exports@cafresh.com',
    phone: '+1-323-555-0456'
  },
  {
    company: 'Nordic Shipping Solutions',
    name: 'Lars Anderson',
    city: 'Oslo',
    commodity: 'Maritime Services',
    contact: 'Lars Anderson',
    email: 'lars@nordicship.no',
    phone: '+47-22-123456'
  },
  {
    company: 'Brazilian Coffee Exports',
    name: 'Carlos Silva',
    city: 'São Paulo',
    commodity: 'Coffee',
    contact: 'Carlos Silva',
    email: 'carlos@brazcoffee.com',
    phone: '+55-11-987654'
  },
  {
    company: 'Indian Textile Mills',
    name: 'Priya Sharma',
    city: 'Mumbai',
    commodity: 'Textiles',
    contact: 'Priya Sharma',
    email: 'priya@indiantextiles.in',
    phone: '+91-22-555-0789'
  }
]

export async function POST(request: NextRequest) {
  try {
    const filters: SearchFilters = await request.json()
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Filter the mock data based on the provided filters
    let filteredData = mockTradeData
    
    if (filters.company) {
      filteredData = filteredData.filter(entry =>
        entry.company.toLowerCase().includes(filters.company!.toLowerCase())
      )
    }
    
    if (filters.name) {
      filteredData = filteredData.filter(entry =>
        entry.name.toLowerCase().includes(filters.name!.toLowerCase())
      )
    }
    
    if (filters.city) {
      filteredData = filteredData.filter(entry =>
        entry.city.toLowerCase().includes(filters.city!.toLowerCase())
      )
    }
    
    if (filters.commodity) {
      filteredData = filteredData.filter(entry =>
        entry.commodity.toLowerCase().includes(filters.commodity!.toLowerCase())
      )
    }
    
    console.log(`Search API called with filters:`, filters)
    console.log(`Returning ${filteredData.length} results`)
    
    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return all data for testing purposes
    return NextResponse.json(mockTradeData)
  } catch (error) {
    console.error('Search API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get search data' },
      { status: 500 }
    )
  }
}