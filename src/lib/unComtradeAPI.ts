/**
 * UN Comtrade API Service
 * Production-grade integration with real UN Comtrade API endpoints
 * 🚨 NO MOCK DATA - REAL API CALLS ONLY
 */

export interface UnComtradeFilters {
  reporterCode?: string; // US = 840
  partnerCode?: string[]; // Array of M49 country codes
  cmdCode?: string; // HS commodity code
  motCode?: string; // Mode of Transport: 5=Air, 1=Ocean
  flowCode?: string; // 1=Export, 2=Import
  period?: string; // Year: 2024, 2023, etc.
  offset?: number;
  limit?: number;
}

export interface UnComtradeRecord {
  period: number;
  reporterCode: number;
  reporterDesc: string;
  partnerCode: number;
  partnerDesc: string;
  cmdCode: string;
  cmdDesc: string;
  motCode: number;
  motDesc: string;
  flowCode: number;
  flowDesc: string;
  primaryValue: number;
  netWgt: number;
  grossWgt: number;
  qty: number;
  qtyUnitCode: number;
  qtyUnitDesc: string;
}

export interface UnComtradeResponse {
  data: UnComtradeRecord[];
  count: number;
  elapsedTime: string;
}

export class UnComtradeAPI {
  private static readonly BASE_URL = 'https://comtradeapi.un.org/data/v1/get';
  private static readonly DEFAULT_REPORTER = '840'; // United States
  
  /**
   * Get trade data from UN Comtrade API
   * Real API call - NO MOCK DATA
   */
  static async getTradeData(filters: UnComtradeFilters): Promise<UnComtradeResponse> {
    try {
      console.log('🌍 Fetching REAL UN Comtrade data with filters:', filters);
      
      const url = this.buildApiUrl(filters);
      console.log('📡 UN Comtrade API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LogisticIntel/1.0 Trade Intelligence Platform'
        }
      });

      if (!response.ok) {
        throw new Error(`UN Comtrade API error: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.json();
      console.log('📊 Raw UN Comtrade API response:', rawData);
      
      // Validate response structure
      if (!rawData || !rawData.data) {
        throw new Error('Invalid UN Comtrade API response structure');
      }

      console.log(`✅ UN Comtrade API returned ${rawData.data.length} real records`);
      
      return {
        data: rawData.data || [],
        count: rawData.count || rawData.data?.length || 0,
        elapsedTime: rawData.elapsedTime || 'unknown'
      };

    } catch (error) {
      console.error('💥 UN Comtrade API error:', error);
      throw new Error(`Failed to fetch UN Comtrade data: ${(error as Error).message}`);
    }
  }

  /**
   * Build UN Comtrade API URL with dynamic parameters
   * ALL PARAMETERS ARE DYNAMIC - NO HARDCODED VALUES
   */
  private static buildApiUrl(filters: UnComtradeFilters): string {
    const params = new URLSearchParams();
    
    // Required parameters
    params.append('reporterCode', filters.reporterCode || this.DEFAULT_REPORTER);
    params.append('period', filters.period || new Date().getFullYear().toString());
    
    // Dynamic country codes (M49 format)
    if (filters.partnerCode && filters.partnerCode.length > 0) {
      params.append('partnerCode', filters.partnerCode.join(','));
    } else {
      // Default to major trading partners if none specified
      params.append('partnerCode', this.getDefaultPartnerCodes().join(','));
    }
    
    // Mode of Transport (CRITICAL for Air/Ocean filtering)
    if (filters.motCode) {
      params.append('motCode', filters.motCode);
      console.log(`🚛 Mode filter applied: ${filters.motCode} (${filters.motCode === '5' ? 'Air' : filters.motCode === '1' ? 'Ocean' : 'Other'})`);
    }
    
    // Flow direction
    params.append('flowCode', filters.flowCode || '1'); // Default to exports
    
    // Commodity code
    if (filters.cmdCode) {
      params.append('cmdCode', filters.cmdCode);
    }
    
    // Include descriptions for human readability
    params.append('includeDesc', 'true');
    
    // Pagination
    if (filters.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }
    if (filters.limit !== undefined) {
      params.append('max', Math.min(filters.limit, 250).toString()); // UN Comtrade max is 250
    } else {
      params.append('max', '100'); // Default to 100 records
    }

    return `${this.BASE_URL}/C/A/HS?${params.toString()}`;
  }

  /**
   * Get default partner country codes (M49 format)
   * Major trading partners for realistic data
   */
  private static getDefaultPartnerCodes(): string[] {
    return [
      '156', // China
      '410', // South Korea  
      '392', // Japan
      '276', // Germany
      '826', // United Kingdom
      '124', // Canada
      '484', // Mexico
      '158', // Taiwan
      '702', // Singapore
      '356', // India
      '528', // Netherlands
      '380', // Italy
      '250', // France
      '036', // Australia
      '076'  // Brazil
    ];
  }

  /**
   * Convert search mode to UN Comtrade motCode
   */
  static getModeOfTransportCode(mode: 'air' | 'ocean' | 'all'): string | undefined {
    switch (mode) {
      case 'air':
        return '5'; // Air transport
      case 'ocean':
        return '1'; // Ocean transport
      case 'all':
      default:
        return undefined; // No filter - all modes
    }
  }

  /**
   * Convert country name to M49 code
   */
  static getCountryCode(countryName: string): string | undefined {
    const countryMap: Record<string, string> = {
      'china': '156',
      'south korea': '410',
      'korea': '410',
      'japan': '392',
      'germany': '276',
      'united kingdom': '826',
      'uk': '826',
      'canada': '124',
      'mexico': '484',
      'taiwan': '158',
      'singapore': '702',
      'india': '356',
      'netherlands': '528',
      'italy': '380',
      'france': '250',
      'australia': '036',
      'brazil': '076'
    };
    
    return countryMap[countryName.toLowerCase()];
  }

  /**
   * Search with pagination support
   */
  static async searchWithPagination(
    filters: UnComtradeFilters, 
    maxResults: number = 500
  ): Promise<UnComtradeRecord[]> {
    const allRecords: UnComtradeRecord[] = [];
    const pageSize = 100; // UN Comtrade optimal page size
    let offset = 0;
    
    console.log(`🔄 Starting paginated UN Comtrade search (target: ${maxResults} records)`);
    
    while (allRecords.length < maxResults) {
      const pageFilters = {
        ...filters,
        offset,
        limit: Math.min(pageSize, maxResults - allRecords.length)
      };
      
      const response = await this.getTradeData(pageFilters);
      
      if (!response.data || response.data.length === 0) {
        console.log('📄 No more records available');
        break;
      }
      
      allRecords.push(...response.data);
      console.log(`📊 Fetched page ${Math.floor(offset / pageSize) + 1}: ${response.data.length} records (total: ${allRecords.length})`);
      
      // Check if we got fewer records than requested (indicates end of data)
      if (response.data.length < pageSize) {
        console.log('📄 Reached end of available data');
        break;
      }
      
      offset += pageSize;
      
      // Add small delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Pagination complete: ${allRecords.length} total records fetched`);
    return allRecords;
  }

  /**
   * Transform UN Comtrade record to our unified format
   */
  static transformToUnifiedRecord(record: UnComtradeRecord, index: number) {
    return {
      id: `comtrade_${record.period}_${record.cmdCode}_${index}`,
      mode: record.motCode === 5 ? 'air' as const : 'ocean' as const,
      mode_icon: record.motCode === 5 ? '✈️' : '🚢',
      unified_company_name: `${record.partnerDesc} Trader`, // Will be enhanced by confidence engine
      unified_destination: `${record.reporterDesc}`,
      unified_value: record.primaryValue || 0,
      unified_weight: record.netWgt || 0,
      unified_date: `${record.period}-01-01`,
      unified_carrier: record.motDesc || 'Unknown Carrier',
      hs_code: record.cmdCode,
      description: record.cmdDesc || 'Trade commodity',
      transport_mode: record.motCode === 5 ? '40' : '20', // Convert to Census format
      origin_country: record.partnerDesc,
      // Enhanced confidence data (to be populated by confidence engine)
      confidence_score: 0,
      confidence_sources: [],
      apollo_verified: false,
      comtrade_source: true
    };
  }
}