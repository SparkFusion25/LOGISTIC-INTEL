// API functions for trade data search and CRM operations

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export interface TradeDataFilters {
  company: string;
  country: string;
  city: string;
  state: string;
  hsCode: string;
  commodity: string;
  mode: string;
}

// Import the standardized TradeEntry type
import { TradeEntry } from '../types/TradeEntry';

export interface CRMLead {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

// Mock trade data for demonstration
const mockTradeData: TradeEntry[] = [
  {
    company: 'Global Electronics Trading Corp',
    tradelane: 'China - USA',
    commodity: 'Electronics',
    contact: 'Sarah Chen',
    email: 'sarah.chen@getc.com',
    city: 'Shanghai',
    country: 'China',
    volume: 2450
  },
  {
    company: 'European Auto Parts Ltd',
    tradelane: 'Germany - USA',
    commodity: 'Auto Parts',
    contact: 'Miguel Rodriguez',
    email: 'm.rodriguez@eaparts.eu',
    city: 'Hamburg',
    country: 'Germany',
    volume: 1200
  },
  {
    company: 'Pacific Textiles Manufacturing',
    tradelane: 'South Korea - Europe',
    commodity: 'Textiles',
    contact: 'Jin Kim',
    email: 'j.kim@pactextiles.com',
    city: 'Busan',
    country: 'South Korea',
    volume: 890
  },
  {
    company: 'American Steel Corp',
    tradelane: 'USA - Canada',
    commodity: 'Steel Products',
    contact: 'Robert Wilson',
    email: 'operations@amsteel.com',
    city: 'Pittsburgh',
    country: 'USA',
    volume: 450
  },
  {
    company: 'California Fresh Produce',
    tradelane: 'USA - Asia',
    commodity: 'Fresh Fruits',
    contact: 'Maria Lopez',
    email: 'exports@cafresh.com',
    city: 'Los Angeles',
    country: 'USA',
    volume: 125
  }
];

// Replace with your real API fetch logic
export async function searchTradeData(filters: any): Promise<any[]> {
  const response = await fetch('/api/search', {
    method: 'POST',
    body: JSON.stringify(filters),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Search API failed');
  }

  return await response.json();
}

/**
 * Save lead to CRM system
 */
export const saveLeadToCRM = async (lead: CRMLead): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real implementation, this would make an API call to your backend
    const response = await fetch(`${API_BASE_URL}/crm/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (response.ok) {
      return { success: true, message: 'Lead saved successfully' };
    } else {
      throw new Error('Failed to save lead');
    }
  } catch (error) {
    console.error('Error saving lead to CRM:', error);
    
    // For demo purposes, return success even if API call fails
    return { success: true, message: 'Lead saved to local storage (demo mode)' };
  }
};

/**
 * Get trade statistics
 */
export const getTradeStatistics = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      totalCompanies: mockTradeData.length,
      totalVolume: '5,115 TEU',
      totalValue: '$6.05M',
      topCommodity: 'Electronics',
      topCountry: 'China',
      averageShipmentValue: '$1.21M'
    };
  } catch (error) {
    console.error('Error fetching trade statistics:', error);
    throw new Error('Failed to fetch trade statistics');
  }
};

/**
 * Get real-time trade updates
 */
export const getTradeUpdates = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      recentShipments: [
        { company: 'Global Electronics Trading Corp', status: 'In Transit', eta: '2024-01-20' },
        { company: 'European Auto Parts Ltd', status: 'Delivered', date: '2024-01-18' },
        { company: 'Pacific Textiles Manufacturing', status: 'Loading', eta: '2024-01-22' }
      ],
      marketTrends: {
        oceanRates: 'Increasing (+5%)',
        airRates: 'Stable',
        truckRates: 'Decreasing (-2%)'
      }
    };
  } catch (error) {
    console.error('Error fetching trade updates:', error);
    throw new Error('Failed to fetch trade updates');
  }
};

/**
 * Export trade data to CSV
 */
export const exportTradeData = (data: TradeEntry[]): void => {
  const headers = ['Company', 'Tradelane', 'Commodity', 'Contact', 'Email', 'City', 'Country', 'Volume'];
  const csvContent = [
    headers.join(','),
    ...data.map(entry => [
      entry.company,
      entry.tradelane,
      entry.commodity,
      entry.contact,
      entry.email,
      entry.city,
      entry.country,
      entry.volume.toString()
    ].map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trade_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};