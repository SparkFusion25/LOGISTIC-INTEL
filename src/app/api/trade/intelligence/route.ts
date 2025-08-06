import { NextRequest, NextResponse } from 'next/server';

interface TradeIntelligenceRecord {
  id: string;
  companyName: string;
  commodity: string;
  hsCode: string;
  commodityDescription: string;
  originCountry: string;
  originCity: string;
  originPort: string;
  destinationCountry: string;
  destinationCity: string;
  destinationPort: string;
  destinationState?: string;
  destinationZip?: string;
  containerSize: string;
  containerCount: number;
  weightKg: number;
  volumeCbm: number;
  valueUsd: number;
  shipmentFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Irregular';
  carrier: string;
  vessel: string;
  billOfLading: string;
  consignee: string;
  shipper: string;
  lastImportDate: string;
  totalShipmentsYtd: number;
  avgMonthlyVolume: number;
  marketShare: number;
  tradeRelationship: 'New' | 'Established' | 'Frequent' | 'Irregular';
  riskScore: number;
  complianceStatus: 'Clean' | 'Under Review' | 'Flagged';
}

// Enterprise-grade trade intelligence data simulating real import/export records
const enterpriseTradeData: TradeIntelligenceRecord[] = [
  {
    id: 'TI_001',
    companyName: 'Apple Inc.',
    commodity: 'Smartphones & Electronic Devices',
    hsCode: '851712',
    commodityDescription: 'Telephones for cellular networks or other wireless networks',
    originCountry: 'China',
    originCity: 'Shenzhen',
    originPort: 'Yantian',
    destinationCountry: 'United States',
    destinationCity: 'Los Angeles',
    destinationPort: 'Los Angeles',
    destinationState: 'CA',
    destinationZip: '90802',
    containerSize: '40HC',
    containerCount: 847,
    weightKg: 12450000,
    volumeCbm: 56890,
    valueUsd: 890000000,
    shipmentFrequency: 'Weekly',
    carrier: 'COSCO SHIPPING',
    vessel: 'COSCO FORTUNE',
    billOfLading: 'COSU4567891234',
    consignee: 'Apple Operations International',
    shipper: 'Foxconn Technology Group',
    lastImportDate: '2024-01-18',
    totalShipmentsYtd: 127,
    avgMonthlyVolume: 45600,
    marketShare: 23.4,
    tradeRelationship: 'Established',
    riskScore: 1,
    complianceStatus: 'Clean'
  },
  {
    id: 'TI_002',
    companyName: 'Tesla Motors Inc.',
    commodity: 'Lithium-ion Battery Cells',
    hsCode: '850760',
    commodityDescription: 'Lithium-ion accumulators and batteries',
    originCountry: 'China',
    originCity: 'Shanghai',
    originPort: 'Shanghai',
    destinationCountry: 'United States',
    destinationCity: 'Fremont',
    destinationPort: 'Oakland',
    destinationState: 'CA',
    destinationZip: '94538',
    containerSize: '20GP',
    containerCount: 234,
    weightKg: 5670000,
    volumeCbm: 15680,
    valueUsd: 145000000,
    shipmentFrequency: 'Monthly',
    carrier: 'Maersk Line',
    vessel: 'MAERSK ESSEX',
    billOfLading: 'MAEU7891234567',
    consignee: 'Tesla Gigafactory 1',
    shipper: 'CATL (Contemporary Amperex)',
    lastImportDate: '2024-01-15',
    totalShipmentsYtd: 34,
    avgMonthlyVolume: 12800,
    marketShare: 18.7,
    tradeRelationship: 'Frequent',
    riskScore: 2,
    complianceStatus: 'Clean'
  },
  {
    id: 'TI_003',
    companyName: 'Amazon.com Inc.',
    commodity: 'Consumer Electronics & Accessories',
    hsCode: '851790',
    commodityDescription: 'Parts of apparatus for transmission or reception of voice, images',
    originCountry: 'China',
    originCity: 'Guangzhou',
    originPort: 'Nansha',
    destinationCountry: 'United States',
    destinationCity: 'Seattle',
    destinationPort: 'Seattle',
    destinationState: 'WA',
    destinationZip: '98134',
    containerSize: '40HC',
    containerCount: 1205,
    weightKg: 18900000,
    volumeCbm: 81000,
    valueUsd: 567000000,
    shipmentFrequency: 'Daily',
    carrier: 'MSC Mediterranean Shipping',
    vessel: 'MSC AMSTERDAM',
    billOfLading: 'MSCU8901234567',
    consignee: 'Amazon Fulfillment Services',
    shipper: 'Anker Innovations Limited',
    lastImportDate: '2024-01-19',
    totalShipmentsYtd: 189,
    avgMonthlyVolume: 67800,
    marketShare: 31.2,
    tradeRelationship: 'Established',
    riskScore: 1,
    complianceStatus: 'Clean'
  },
  {
    id: 'TI_004',
    companyName: 'Nike Inc.',
    commodity: 'Athletic Footwear',
    hsCode: '640419',
    commodityDescription: 'Footwear with outer soles of rubber/plastics, sports footwear',
    originCountry: 'Vietnam',
    originCity: 'Ho Chi Minh City',
    originPort: 'Cat Lai',
    destinationCountry: 'United States',
    destinationCity: 'Portland',
    destinationPort: 'Portland',
    destinationState: 'OR',
    destinationZip: '97210',
    containerSize: '40HC',
    containerCount: 456,
    weightKg: 8900000,
    volumeCbm: 30600,
    valueUsd: 234000000,
    shipmentFrequency: 'Weekly',
    carrier: 'Yang Ming Marine Transport',
    vessel: 'YM WORTH',
    billOfLading: 'YMLU5678912345',
    consignee: 'Nike USA Inc.',
    shipper: 'Pou Chen Corporation',
    lastImportDate: '2024-01-16',
    totalShipmentsYtd: 78,
    avgMonthlyVolume: 24500,
    marketShare: 15.6,
    tradeRelationship: 'Established',
    riskScore: 1,
    complianceStatus: 'Clean'
  },
  {
    id: 'TI_005',
    companyName: 'Microsoft Corporation',
    commodity: 'Computer Hardware & Peripherals',
    hsCode: '847330',
    commodityDescription: 'Parts and accessories for automatic data processing machines',
    originCountry: 'Taiwan',
    originCity: 'Taipei',
    originPort: 'Kaohsiung',
    destinationCountry: 'United States',
    destinationCity: 'Redmond',
    destinationPort: 'Tacoma',
    destinationState: 'WA',
    destinationZip: '98052',
    containerSize: '20GP',
    containerCount: 167,
    weightKg: 4200000,
    volumeCbm: 11200,
    valueUsd: 89000000,
    shipmentFrequency: 'Monthly',
    carrier: 'Evergreen Marine',
    vessel: 'EVER GIVEN',
    billOfLading: 'EGLV6789123456',
    consignee: 'Microsoft Hardware Division',
    shipper: 'Foxconn Technology Taiwan',
    lastImportDate: '2024-01-12',
    totalShipmentsYtd: 23,
    avgMonthlyVolume: 8900,
    marketShare: 7.8,
    tradeRelationship: 'Frequent',
    riskScore: 1,
    complianceStatus: 'Clean'
  },
  {
    id: 'TI_006',
    companyName: 'Walmart Inc.',
    commodity: 'Home & Garden Products',
    hsCode: '940360',
    commodityDescription: 'Wooden furniture for bedroom use',
    originCountry: 'Vietnam',
    originCity: 'Hanoi',
    originPort: 'Hai Phong',
    destinationCountry: 'United States',
    destinationCity: 'Bentonville',
    destinationPort: 'Houston',
    destinationState: 'TX',
    destinationZip: '77002',
    containerSize: '40HC',
    containerCount: 892,
    weightKg: 15600000,
    volumeCbm: 59800,
    valueUsd: 156000000,
    shipmentFrequency: 'Weekly',
    carrier: 'CMA CGM',
    vessel: 'CMA CGM MARCO POLO',
    billOfLading: 'CMAU7890123456',
    consignee: 'Walmart Import LLC',
    shipper: 'Hoa Phat Furniture JSC',
    lastImportDate: '2024-01-17',
    totalShipmentsYtd: 95,
    avgMonthlyVolume: 34200,
    marketShare: 12.3,
    tradeRelationship: 'Established',
    riskScore: 2,
    complianceStatus: 'Clean'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Advanced filtering parameters
    const company = searchParams.get('company')?.toLowerCase() || '';
    const commodity = searchParams.get('commodity')?.toLowerCase() || '';
    const originCountry = searchParams.get('origin_country')?.toLowerCase() || '';
    const destinationCountry = searchParams.get('destination_country')?.toLowerCase() || '';
    const destinationPort = searchParams.get('destination_port')?.toLowerCase() || '';
    const destinationCity = searchParams.get('destination_city')?.toLowerCase() || '';
    const destinationState = searchParams.get('destination_state')?.toLowerCase() || '';
    const destinationZip = searchParams.get('destination_zip')?.toLowerCase() || '';
    const hsCode = searchParams.get('hs_code') || '';
    const carrier = searchParams.get('carrier')?.toLowerCase() || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Apply sophisticated filtering
    let filteredData = enterpriseTradeData;

    if (company) {
      filteredData = filteredData.filter(record => 
        record.companyName.toLowerCase().includes(company) ||
        record.consignee.toLowerCase().includes(company) ||
        record.shipper.toLowerCase().includes(company)
      );
    }

    if (commodity) {
      filteredData = filteredData.filter(record => 
        record.commodity.toLowerCase().includes(commodity) ||
        record.commodityDescription.toLowerCase().includes(commodity)
      );
    }

    if (originCountry) {
      filteredData = filteredData.filter(record => 
        record.originCountry.toLowerCase().includes(originCountry) ||
        record.originCity.toLowerCase().includes(originCountry) ||
        record.originPort.toLowerCase().includes(originCountry)
      );
    }

    if (destinationCountry) {
      filteredData = filteredData.filter(record => 
        record.destinationCountry.toLowerCase().includes(destinationCountry) ||
        record.destinationCity.toLowerCase().includes(destinationCountry) ||
        record.destinationPort.toLowerCase().includes(destinationCountry)
      );
    }

    if (destinationPort) {
      filteredData = filteredData.filter(record => 
        record.destinationPort.toLowerCase().includes(destinationPort)
      );
    }

    if (destinationCity) {
      filteredData = filteredData.filter(record => 
        record.destinationCity.toLowerCase().includes(destinationCity)
      );
    }

    if (destinationState) {
      filteredData = filteredData.filter(record => 
        record.destinationState?.toLowerCase().includes(destinationState)
      );
    }

    if (destinationZip) {
      filteredData = filteredData.filter(record => 
        record.destinationZip?.toLowerCase().includes(destinationZip)
      );
    }

    if (hsCode) {
      filteredData = filteredData.filter(record => 
        record.hsCode.includes(hsCode)
      );
    }

    if (carrier) {
      filteredData = filteredData.filter(record => 
        record.carrier.toLowerCase().includes(carrier)
      );
    }

    if (dateFrom || dateTo) {
      filteredData = filteredData.filter(record => {
        const recordDate = new Date(record.lastImportDate);
        const fromDate = dateFrom ? new Date(dateFrom) : new Date('2020-01-01');
        const toDate = dateTo ? new Date(dateTo) : new Date();
        return recordDate >= fromDate && recordDate <= toDate;
      });
    }

    // Sort by last import date (most recent first)
    filteredData.sort((a, b) => new Date(b.lastImportDate).getTime() - new Date(a.lastImportDate).getTime());

    // Apply limit
    const paginatedData = filteredData.slice(0, limit);

    // Calculate summary statistics
    const totalValue = filteredData.reduce((sum, record) => sum + record.valueUsd, 0);
    const totalContainers = filteredData.reduce((sum, record) => sum + record.containerCount, 0);
    const uniqueCompanies = new Set(filteredData.map(record => record.companyName)).size;
    const uniqueCarriers = new Set(filteredData.map(record => record.carrier)).size;

    return NextResponse.json({
      success: true,
      results: paginatedData,
      summary: {
        total_records: filteredData.length,
        displayed_records: paginatedData.length,
        total_value_usd: totalValue,
        total_containers: totalContainers,
        unique_companies: uniqueCompanies,
        unique_carriers: uniqueCarriers
      },
      filters_applied: {
        company,
        commodity,
        origin_country: originCountry,
        destination_country: destinationCountry,
        destination_port: destinationPort,
        destination_city: destinationCity,
        destination_state: destinationState,
        destination_zip: destinationZip,
        hs_code: hsCode,
        carrier,
        date_from: dateFrom,
        date_to: dateTo
      },
      source: 'Enterprise Trade Intelligence'
    });

  } catch (error) {
    console.error('Trade intelligence API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Trade intelligence system temporarily unavailable',
      results: [],
      summary: null
    }, { status: 500 });
  }
}