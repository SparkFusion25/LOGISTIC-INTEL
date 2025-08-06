import { NextRequest, NextResponse } from 'next/server';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Company domain is required' },
        { status: 400 }
      );
    }

    // In production, this would integrate with:
    // - NewsAPI.org for general company news
    // - Google News API for recent updates  
    // - Company's own RSS feeds
    // - Industry publications
    // - SEC filings for public companies

    // For now, we'll return mock but realistic news data
    const mockNews = await generateMockCompanyNews(domain);

    return NextResponse.json({
      success: true,
      articles: mockNews,
      domain,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Company news fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company news' },
      { status: 500 }
    );
  }
}

async function generateMockCompanyNews(domain: string): Promise<NewsArticle[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const companyName = extractCompanyName(domain);
  const industryType = inferIndustryFromDomain(domain);
  
  const newsTemplates = [
    {
      title: `${companyName} Announces Expansion into New Markets`,
      description: `${companyName} reveals plans to expand operations into emerging markets, signaling potential growth in logistics and supply chain requirements.`,
      url: `https://example.com/news/${companyName.toLowerCase()}-expansion`,
      publishedAt: getRecentDate(7),
      source: 'Industry Weekly'
    },
    {
      title: `${companyName} Streamlines Supply Chain Operations`,
      description: `The company implements new supply chain optimization strategies to reduce costs and improve delivery times across their global network.`,
      url: `https://example.com/news/${companyName.toLowerCase()}-supply-chain`,
      publishedAt: getRecentDate(14),
      source: 'Supply Chain Today'
    },
    {
      title: `${companyName} Reports Strong Quarterly Performance`,
      description: `Latest earnings report shows increased revenue and operational efficiency, indicating potential budget availability for new vendor partnerships.`,
      url: `https://example.com/news/${companyName.toLowerCase()}-earnings`,
      publishedAt: getRecentDate(21),
      source: 'Business Journal'
    },
    {
      title: `${companyName} Invests in Digital Transformation`,
      description: `The company announces significant investment in digital tools and automation to modernize their operations and improve visibility.`,
      url: `https://example.com/news/${companyName.toLowerCase()}-digital`,
      publishedAt: getRecentDate(35),
      source: 'Tech Business News'
    },
    {
      title: `${companyName} Strengthens ${industryType} Partnerships`,
      description: `New strategic partnerships announced to enhance capabilities in ${industryType.toLowerCase()} sector and improve customer service.`,
      url: `https://example.com/news/${companyName.toLowerCase()}-partnerships`,
      publishedAt: getRecentDate(42),
      source: 'Industry Report'
    }
  ];

  // Return 3-5 random articles
  const numArticles = Math.floor(Math.random() * 3) + 3;
  return newsTemplates
    .sort(() => 0.5 - Math.random())
    .slice(0, numArticles);
}

function extractCompanyName(domain: string): string {
  // Remove common domain extensions and www
  let name = domain
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|co|inc|llc)$/, '')
    .split('.')[0];
  
  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function inferIndustryFromDomain(domain: string): string {
  const lowerDomain = domain.toLowerCase();
  
  const industryKeywords = [
    { keywords: ['tech', 'software', 'digital', 'cloud', 'app'], industry: 'Technology' },
    { keywords: ['logistics', 'freight', 'shipping', 'cargo'], industry: 'Logistics' },
    { keywords: ['auto', 'car', 'vehicle', 'motor'], industry: 'Automotive' },
    { keywords: ['health', 'medical', 'pharma', 'bio'], industry: 'Healthcare' },
    { keywords: ['retail', 'shop', 'store', 'commerce'], industry: 'Retail' },
    { keywords: ['food', 'restaurant', 'cafe', 'dining'], industry: 'Food & Beverage' },
    { keywords: ['finance', 'bank', 'invest', 'capital'], industry: 'Financial Services' },
    { keywords: ['energy', 'oil', 'gas', 'solar', 'wind'], industry: 'Energy' },
    { keywords: ['real', 'estate', 'property', 'housing'], industry: 'Real Estate' }
  ];

  for (const mapping of industryKeywords) {
    if (mapping.keywords.some(keyword => lowerDomain.includes(keyword))) {
      return mapping.industry;
    }
  }

  return 'Manufacturing';
}

function getRecentDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}