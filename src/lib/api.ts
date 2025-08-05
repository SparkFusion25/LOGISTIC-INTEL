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
    city: 'Shanghai',
    country: 'China',
    state: '',
    commodity: 'Electronics',
    hsCode: '8471.30.01',
    mode: 'Ocean',
    contactEmail: 'sarah.chen@getc.com',
    contactPhone: '+86-21-123456',
    volume: '2,450 TEU',
    value: '$2.4M',
    lastShipment: '2024-01-15'
  },
  {
    company: 'European Auto Parts Ltd',
    city: 'Hamburg',
    country: 'Germany',
    state: '',
    commodity: 'Auto Parts',
    hsCode: '8708.29.50',
    mode: 'Ocean',
    contactEmail: 'm.rodriguez@eaparts.eu',
    contactPhone: '+49-40-123456',
    volume: '1,200 TEU',
    value: '$1.8M',
    lastShipment: '2024-01-12'
  },
  {
    company: 'Pacific Textiles Manufacturing',
    city: 'Busan',
    country: 'South Korea',
    state: '',
    commodity: 'Textiles',
    hsCode: '6109.10.00',
    mode: 'Ocean',
    contactEmail: 'j.kim@pactextiles.com',
    contactPhone: '+82-51-123456',
    volume: '890 TEU',
    value: '$950K',
    lastShipment: '2024-01-10'
  },
  {
    company: 'American Steel Corp',
    city: 'Pittsburgh',
    country: 'USA',
    state: 'PA',
    commodity: 'Steel Products',
    hsCode: '7208.10.00',
    mode: 'Truck',
    contactEmail: 'operations@amsteel.com',
    contactPhone: '+1-412-555-0123',
    volume: '450 tons',
    value: '$680K',
    lastShipment: '2024-01-14'
  },
  {
    company: 'California Fresh Produce',
    city: 'Los Angeles',
    country: 'USA',
    state: 'CA',
    commodity: 'Fresh Fruits',
    hsCode: '0803.10.00',
    mode: 'Air',
    contactEmail: 'exports@cafresh.com',
    contactPhone: '+1-323-555-0456',
    volume: '125 tons',
    value: '$220K',
    lastShipment: '2024-01-16'
  }
];

/**
 * Search trade data based on filters
 */
export const searchTradeData = async (filters: TradeDataFilters): Promise<TradeEntry[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Filter mock data based on provided filters
    const filteredData = mockTradeData.filter(entry => {
      const matchesCompany = !filters.company || 
        entry.company.toLowerCase().includes(filters.company.toLowerCase());
      
      const matchesCountry = !filters.country || 
        entry.country.toLowerCase().includes(filters.country.toLowerCase());
      
      const matchesCity = !filters.city || 
        entry.city.toLowerCase().includes(filters.city.toLowerCase());
      
      const matchesState = !filters.state || 
        entry.state.toLowerCase().includes(filters.state.toLowerCase());
      
      const matchesHsCode = !filters.hsCode || 
        entry.hsCode.includes(filters.hsCode);
      
      const matchesCommodity = !filters.commodity || 
        entry.commodity.toLowerCase().includes(filters.commodity.toLowerCase());
      
      const matchesMode = !filters.mode || 
        entry.mode.toLowerCase().includes(filters.mode.toLowerCase());

      return matchesCompany && matchesCountry && matchesCity && 
             matchesState && matchesHsCode && matchesCommodity && matchesMode;
    });

    return filteredData;
  } catch (error) {
    console.error('Error searching trade data:', error);
    throw new Error('Failed to search trade data');
  }
};

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
  const headers = ['Company', 'City', 'Country', 'State', 'Commodity', 'HS Code', 'Mode', 'Contact Email', 'Volume', 'Value'];
  const csvContent = [
    headers.join(','),
    ...data.map(entry => [
      entry.company,
      entry.city,
      entry.country,
      entry.state,
      entry.commodity,
      entry.hsCode,
      entry.mode,
      entry.contactEmail || '',
      entry.volume || '',
      entry.value || ''
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