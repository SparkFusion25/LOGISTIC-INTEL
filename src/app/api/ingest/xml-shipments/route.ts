import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ShipmentRecord {
  consignee_name?: string;
  shipper_name?: string;
  origin_country?: string;
  destination_country?: string;
  destination_city?: string;
  hs_code?: string;
  commodity_description?: string;
  value_usd?: number;
  arrival_date?: string;
  vessel_name?: string;
  weight_kg?: number;
  raw_xml_filename?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting XML ingestion process...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.xml')) {
      return NextResponse.json(
        { success: false, error: 'File must be XML format' },
        { status: 400 }
      );
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes)`);

    // Read XML content
    const xmlContent = await file.text();
    
    // Upload raw XML to Supabase Storage
    const filename = `${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('raw-xml')
      .upload(filename, xmlContent, {
        contentType: 'application/xml',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Continue processing even if storage upload fails
    } else {
      console.log(`✅ Raw XML uploaded to storage: ${filename}`);
    }

    // Parse XML content
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true
    });

    const parsedXML = parser.parse(xmlContent);
    console.log('📊 XML parsed successfully');

    // Extract shipment records from various XML structures
    const shipmentRecords = extractShipmentRecords(parsedXML, filename);
    
    if (shipmentRecords.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No shipment records found in XML',
        filename,
        xmlStructure: Object.keys(parsedXML)
      }, { status: 400 });
    }

    console.log(`🔍 Extracted ${shipmentRecords.length} shipment records`);

    // Clean records - remove undefined fields and ensure only valid columns
    const cleanRecords = shipmentRecords.map(record => {
      const cleanRecord: any = {};
      
      // Only include fields that exist and are not undefined
      if (record.consignee_name) cleanRecord.consignee_name = record.consignee_name;
      if (record.shipper_name) cleanRecord.shipper_name = record.shipper_name;
      if (record.origin_country) cleanRecord.shipper_country = record.origin_country;
      if (record.destination_country) cleanRecord.consignee_country = record.destination_country;
      if (record.destination_city) cleanRecord.consignee_city = record.destination_city;
      if (record.hs_code) cleanRecord.hs_code = record.hs_code;
      if (record.commodity_description) cleanRecord.goods_description = record.commodity_description;
      if (record.value_usd !== undefined) cleanRecord.value_usd = record.value_usd;
      if (record.arrival_date) cleanRecord.arrival_date = record.arrival_date;
      if (record.vessel_name) cleanRecord.vessel_name = record.vessel_name;
      if (record.weight_kg !== undefined) cleanRecord.weight_kg = record.weight_kg;
      if (record.raw_xml_filename) cleanRecord.raw_xml_filename = record.raw_xml_filename;
      
      return cleanRecord;
    });

    console.log(`🧹 Cleaned records, sample:`, cleanRecords[0]);

    // Insert records into ocean_shipments table
    const { data: insertData, error: insertError } = await supabase
      .from('ocean_shipments')
      .insert(cleanRecords)
      .select('id');

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert shipment records',
        details: insertError.message,
        recordCount: shipmentRecords.length
      }, { status: 500 });
    }

    console.log(`✅ Successfully inserted ${insertData?.length || 0} records`);

    return NextResponse.json({
      success: true,
      message: 'XML file processed successfully',
      filename,
      recordsProcessed: shipmentRecords.length,
      recordsInserted: insertData?.length || 0,
      storageUploaded: !uploadError,
      sampleRecord: shipmentRecords[0]
    });

  } catch (error) {
    console.error('XML ingestion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'XML processing failed', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

function extractShipmentRecords(parsedXML: any, filename: string): ShipmentRecord[] {
  const records: ShipmentRecord[] = [];

  // Handle different XML structures
  const possibleRoots = [
    'Shipments',
    'ShipmentData', 
    'TradeData',
    'Manifest',
    'BillOfLading',
    'ImportExport'
  ];

  let shipmentArray: any[] = [];

  // Find shipment data in XML structure
  for (const root of possibleRoots) {
    if (parsedXML[root]) {
      const rootData = parsedXML[root];
      
      // Handle single shipment vs array of shipments
      if (Array.isArray(rootData)) {
        shipmentArray = rootData;
        break;
      } else if (rootData.Shipment) {
        shipmentArray = Array.isArray(rootData.Shipment) 
          ? rootData.Shipment 
          : [rootData.Shipment];
        break;
      } else if (rootData.Record) {
        shipmentArray = Array.isArray(rootData.Record) 
          ? rootData.Record 
          : [rootData.Record];
        break;
      }
    }
  }

  // If no standard structure found, try to find any array of objects
  if (shipmentArray.length === 0) {
    const findArrays = (obj: any): any[] => {
      if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') {
        return obj;
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          const result = findArrays(obj[key]);
          if (result.length > 0) return result;
        }
      }
      
      return [];
    };

    shipmentArray = findArrays(parsedXML);
  }

  // Extract records
  for (const shipment of shipmentArray) {
    try {
      const record: ShipmentRecord = {
        raw_xml_filename: filename,
        
        // Company information - try various field names
        consignee_name: extractField(shipment, [
          'ConsigneeName', 'Consignee', 'ReceiverName', 'Receiver',
          'ImporterName', 'Importer', 'BuyerName', 'Buyer'
        ]),
        
        shipper_name: extractField(shipment, [
          'ShipperName', 'Shipper', 'SenderName', 'Sender',
          'ExporterName', 'Exporter', 'SupplierName', 'Supplier'
        ]),

        // Geographic data
        origin_country: extractField(shipment, [
          'OriginCountry', 'CountryOfOrigin', 'ExportCountry',
          'ShipperCountry', 'OriginCountryCode'
        ]),
        
        destination_country: extractField(shipment, [
          'DestinationCountry', 'CountryOfDestination', 'ImportCountry',
          'ConsigneeCountry', 'DestinationCountryCode'
        ]),

        destination_city: extractField(shipment, [
          'DestinationCity', 'CityOfDestination', 'ImportCity',
          'ConsigneeCity', 'Port', 'DestinationPort'
        ]),

        // Commodity data
        hs_code: extractField(shipment, [
          'HSCode', 'HS_Code', 'CommodityCode', 'TariffCode',
          'ClassificationCode', 'ProductCode'
        ]),
        
        commodity_description: extractField(shipment, [
          'CommodityDescription', 'Description', 'GoodsDescription',
          'ProductDescription', 'Goods', 'Commodity'
        ]),

        // Financial data - only basic value
        value_usd: parseNumeric(extractField(shipment, [
          'ValueUSD', 'Value', 'DeclaredValue', 'InvoiceValue',
          'CustomsValue', 'CIFValue', 'FOBValue'
        ])),

        // Date information - only arrival_date for now
        arrival_date: parseDate(extractField(shipment, [
          'ArrivalDate', 'DischargeDate', 'ImportDate',
          'UnloadingDate', 'DeliveryDate'
        ])),

        // Logistics data - only basic fields
        vessel_name: extractField(shipment, [
          'VesselName', 'Vessel', 'ShipName', 'Ship',
          'CarrierName', 'TransportName'
        ]),
        
        weight_kg: parseNumeric(extractField(shipment, [
          'WeightKG', 'Weight', 'GrossWeight', 'NetWeight',
          'TotalWeight', 'WeightInKG'
        ]))
      };

      // Only add record if it has essential data
      if (record.consignee_name || record.shipper_name) {
        records.push(record);
      }
    } catch (error) {
      console.warn('Error processing shipment record:', error);
      continue;
    }
  }

  return records;
}

function extractField(obj: any, fieldNames: string[]): string | undefined {
  for (const fieldName of fieldNames) {
    if (obj[fieldName]) {
      const value = obj[fieldName];
      return typeof value === 'object' ? value['#text'] || value.toString() : value.toString();
    }
  }
  return undefined;
}

function parseNumeric(value: string | undefined): number | undefined {
  if (!value) return undefined;
  
  const cleaned = value.toString().replace(/[,$\s]/g, '');
  const numeric = parseFloat(cleaned);
  
  return isNaN(numeric) ? undefined : numeric;
}

function parseDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check and ingestion status
    const { data: recentUploads, error } = await supabase
      .from('ocean_shipments')
      .select('raw_xml_filename, created_at')
      .not('raw_xml_filename', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { data: totalCount } = await supabase
      .from('ocean_shipments')
      .select('id', { count: 'exact' });

    return NextResponse.json({
      success: true,
      message: 'XML ingestion service is active',
      totalRecords: totalCount?.length || 0,
      recentUploads: recentUploads || [],
      endpoint: '/api/ingest/xml-shipments',
      usage: 'POST with multipart/form-data containing XML file'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}