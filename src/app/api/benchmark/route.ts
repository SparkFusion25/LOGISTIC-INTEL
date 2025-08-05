import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const hsCode = searchParams.get('hs') || '';
  const mode = searchParams.get('mode') || 'Ocean';
  const timeRange = searchParams.get('range') || '90d';

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data structure matching the component expectations
  const mockData = {
    volume: [
      { month: 'Jan 2024', tons: 12500, value_usd: 2800000 },
      { month: 'Feb 2024', tons: 15200, value_usd: 3200000 },
      { month: 'Mar 2024', tons: 18700, value_usd: 3900000 },
      { month: 'Apr 2024', tons: 16800, value_usd: 3500000 },
      { month: 'May 2024', tons: 19400, value_usd: 4100000 },
      { month: 'Jun 2024', tons: 22100, value_usd: 4600000 },
    ],
    rates: {
      low: mode === 'Air' ? 2.8 : 1200,
      avg: mode === 'Air' ? 3.5 : 1850,
      high: mode === 'Air' ? 4.2 : 2400,
      carriers: mode === 'Air' 
        ? ['DHL', 'FedEx', 'UPS', 'Lufthansa Cargo']
        : ['Maersk', 'MSC', 'COSCO', 'CMA CGM'],
      frequency: mode === 'Air' ? 'Daily' : '3x per week',
      valid_until: '2024-12-31'
    },
    metadata: {
      origin,
      destination,
      hsCode,
      mode,
      timeRange,
      lastUpdated: new Date().toISOString()
    }
  };

  return NextResponse.json(mockData);
}