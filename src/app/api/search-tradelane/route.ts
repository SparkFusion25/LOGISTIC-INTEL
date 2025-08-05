import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company') || '';
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const commodity = searchParams.get('commodity') || '';
  const port = searchParams.get('port') || '';

  // Simulate API delay for realistic experience
  await new Promise(resolve => setTimeout(resolve, 800));

  // Comprehensive mock data representing real trade intelligence
  const mockResults = [
    {
      company_name: "Apple Inc.",
      origin_country: "China",
      destination_country: "United States",
      port_of_loading: "Shenzhen",
      port_of_discharge: "Los Angeles",
      hs_code: "8517120000",
      commodity_description: "Smartphones and Mobile Devices",
      shipment_count: 247,
      total_weight_kg: 1850000,
      total_value_usd: 285000000,
      last_shipment_date: "2024-01-15",
      primary_contact: {
        name: "Sarah Chen",
        email: "s.chen@apple.com",
        title: "VP Supply Chain Operations",
        linkedin_url: "https://linkedin.com/in/sarahchen-apple"
      }
    },
    {
      company_name: "Tesla Motors",
      origin_country: "China",
      destination_country: "United States",
      port_of_loading: "Shanghai",
      port_of_discharge: "Long Beach",
      hs_code: "8703800000",
      commodity_description: "Electric Vehicle Components",
      shipment_count: 89,
      total_weight_kg: 2400000,
      total_value_usd: 450000000,
      last_shipment_date: "2024-01-12",
      primary_contact: {
        name: "Michael Zhang",
        email: "m.zhang@tesla.com",
        title: "Director of Global Logistics",
        linkedin_url: "https://linkedin.com/in/mzhang-tesla"
      }
    },
    {
      company_name: "Amazon.com Inc.",
      origin_country: "China",
      destination_country: "United States",
      port_of_loading: "Ningbo",
      port_of_discharge: "Seattle",
      hs_code: "9503001000",
      commodity_description: "Consumer Electronics & Accessories",
      shipment_count: 1547,
      total_weight_kg: 890000,
      total_value_usd: 125000000,
      last_shipment_date: "2024-01-18",
      primary_contact: {
        name: "Jennifer Liu",
        email: "j.liu@amazon.com",
        title: "Senior Manager, Import Operations",
        linkedin_url: "https://linkedin.com/in/jliu-amazon"
      }
    },
    {
      company_name: "Walmart Inc.",
      origin_country: "Vietnam",
      destination_country: "United States",
      port_of_loading: "Ho Chi Minh City",
      port_of_discharge: "Savannah",
      hs_code: "6203420000",
      commodity_description: "Textile and Apparel Products",
      shipment_count: 312,
      total_weight_kg: 450000,
      total_value_usd: 75000000,
      last_shipment_date: "2024-01-10",
      primary_contact: {
        name: "David Rodriguez",
        email: "d.rodriguez@walmart.com",
        title: "VP International Sourcing",
        linkedin_url: "https://linkedin.com/in/drodriguez-walmart"
      }
    },
    {
      company_name: "Nike Inc.",
      origin_country: "Vietnam",
      destination_country: "United States",
      port_of_loading: "Da Nang",
      port_of_discharge: "Oakland",
      hs_code: "6403990000",
      commodity_description: "Athletic Footwear",
      shipment_count: 156,
      total_weight_kg: 180000,
      total_value_usd: 95000000,
      last_shipment_date: "2024-01-14",
      primary_contact: {
        name: "Amanda Kim",
        email: "a.kim@nike.com",
        title: "Director, Global Trade Operations",
        linkedin_url: "https://linkedin.com/in/akim-nike"
      }
    },
    {
      company_name: "Microsoft Corporation",
      origin_country: "Taiwan",
      destination_country: "United States",
      port_of_loading: "Kaohsiung",
      port_of_discharge: "Tacoma",
      hs_code: "8471300000",
      commodity_description: "Computer Hardware & Components",
      shipment_count: 78,
      total_weight_kg: 290000,
      total_value_usd: 180000000,
      last_shipment_date: "2024-01-16",
      primary_contact: {
        name: "Robert Johnson",
        email: "r.johnson@microsoft.com",
        title: "Senior Director, Supply Chain",
        linkedin_url: "https://linkedin.com/in/rjohnson-microsoft"
      }
    },
    {
      company_name: "Home Depot Inc.",
      origin_country: "China",
      destination_country: "United States",
      port_of_loading: "Qingdao",
      port_of_discharge: "Norfolk",
      hs_code: "9403601000",
      commodity_description: "Furniture and Home Improvement",
      shipment_count: 234,
      total_weight_kg: 680000,
      total_value_usd: 45000000,
      last_shipment_date: "2024-01-11",
      primary_contact: {
        name: "Maria Gonzalez",
        email: "m.gonzalez@homedepot.com",
        title: "VP Merchandising Operations",
        linkedin_url: "https://linkedin.com/in/mgonzalez-homedepot"
      }
    },
    {
      company_name: "Costco Wholesale",
      origin_country: "South Korea",
      destination_country: "United States",
      port_of_loading: "Busan",
      port_of_discharge: "Los Angeles",
      hs_code: "8418100000",
      commodity_description: "Household Appliances",
      shipment_count: 67,
      total_weight_kg: 1200000,
      total_value_usd: 85000000,
      last_shipment_date: "2024-01-13",
      primary_contact: {
        name: "Kevin Park",
        email: "k.park@costco.com",
        title: "Director, International Buying",
        linkedin_url: "https://linkedin.com/in/kpark-costco"
      }
    }
  ];

  // Filter results based on search parameters
  let filteredResults = mockResults;

  if (company) {
    filteredResults = filteredResults.filter(r => 
      r.company_name.toLowerCase().includes(company.toLowerCase())
    );
  }

  if (origin) {
    filteredResults = filteredResults.filter(r => 
      r.origin_country.toLowerCase().includes(origin.toLowerCase())
    );
  }

  if (destination) {
    filteredResults = filteredResults.filter(r => 
      r.destination_country.toLowerCase().includes(destination.toLowerCase())
    );
  }

  if (commodity) {
    filteredResults = filteredResults.filter(r => 
      r.commodity_description.toLowerCase().includes(commodity.toLowerCase())
    );
  }

  if (port) {
    filteredResults = filteredResults.filter(r => 
      r.port_of_loading.toLowerCase().includes(port.toLowerCase()) ||
      r.port_of_discharge.toLowerCase().includes(port.toLowerCase())
    );
  }

  return NextResponse.json({ 
    results: filteredResults,
    total_count: filteredResults.length,
    search_metadata: {
      filters: { company, origin, destination, commodity, port },
      timestamp: new Date().toISOString()
    }
  });
}