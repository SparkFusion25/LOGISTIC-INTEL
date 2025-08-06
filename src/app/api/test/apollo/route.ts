import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testCompany = searchParams.get('company') || 'Samsung';

    const apolloKey = process.env.VITE_APOLLO_INTEL_KEY;
    
    if (!apolloKey) {
      return NextResponse.json({
        success: false,
        error: 'VITE_APOLLO_INTEL_KEY not configured',
        message: 'Please add the Apollo Intel API key to your environment variables'
      }, { status: 400 });
    }

    console.log(`🧪 Testing Apollo Intel API with company: ${testCompany}`);

    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'x-api-key': apolloKey,
    };

    const searchBody = {
      api_key: apolloKey,
      q_organization_names: [testCompany],
      person_titles: ["Logistics Manager", "Director of Supply Chain", "Procurement Manager"],
      page: 1,
      per_page: 5
    };

    const startTime = Date.now();
    
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers,
      body: JSON.stringify(searchBody)
    });

    const responseTime = Date.now() - startTime;

    console.log(`📊 Apollo API Response: ${response.status} (${responseTime}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apollo API Error: ${response.status} - ${errorText}`);
      
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        responseTime,
        testCompany,
        apiEndpoint: 'https://api.apollo.io/v1/mixed_people/search'
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      status: response.status,
      responseTime,
      testCompany,
      apiEndpoint: 'https://api.apollo.io/v1/mixed_people/search',
      results: {
        totalContacts: data.people?.length || 0,
        hasContacts: data.people && data.people.length > 0,
        contacts: data.people?.slice(0, 3).map((person: any) => ({
          name: person.name || `${person.first_name} ${person.last_name}`,
          title: person.title,
          email: person.email ? 'present' : 'not available',
          organization: person.organization?.name || 'unknown'
        })) || [],
        pagination: {
          page: data.pagination?.page || 1,
          per_page: data.pagination?.per_page || 5,
          total_entries: data.pagination?.total_entries || 0
        }
      },
      rawResponse: process.env.NODE_ENV === 'development' ? data : undefined
    });

  } catch (error) {
    console.error('Apollo test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test request failed',
      details: (error as Error).message,
      apiEndpoint: 'https://api.apollo.io/v1/mixed_people/search'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyDomain } = await request.json();

    if (!companyName && !companyDomain) {
      return NextResponse.json({
        success: false,
        error: 'Either companyName or companyDomain is required'
      }, { status: 400 });
    }

    const apolloKey = process.env.VITE_APOLLO_INTEL_KEY;
    
    if (!apolloKey) {
      return NextResponse.json({
        success: false,
        error: 'VITE_APOLLO_INTEL_KEY not configured'
      }, { status: 400 });
    }

    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'x-api-key': apolloKey,
    };

    const searchBody: any = {
      api_key: apolloKey,
      person_titles: [
        "Logistics Manager", 
        "Director of Supply Chain", 
        "Procurement Manager",
        "Operations Manager",
        "Supply Chain Director"
      ],
      page: 1,
      per_page: 5
    };

    if (companyDomain) {
      searchBody.q_organization_domains = [companyDomain];
    } else {
      searchBody.q_organization_names = [companyName];
    }

    console.log(`🧪 Testing Apollo with ${companyDomain ? 'domain' : 'name'}: ${companyDomain || companyName}`);

    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers,
      body: JSON.stringify(searchBody)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        error: data,
        searchCriteria: searchBody
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      searchCriteria: {
        company: companyName,
        domain: companyDomain,
        searchType: companyDomain ? 'domain' : 'name'
      },
      results: {
        totalContacts: data.people?.length || 0,
        contacts: data.people?.map((person: any) => ({
          id: person.id,
          name: person.name || `${person.first_name} ${person.last_name}`,
          title: person.title,
          email: person.email,
          linkedin_url: person.linkedin_url,
          organization: person.organization?.name
        })) || []
      }
    });

  } catch (error) {
    console.error('Apollo POST test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Test request failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}