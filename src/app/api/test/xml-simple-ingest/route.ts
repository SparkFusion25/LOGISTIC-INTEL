import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting simple XML ingestion...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Parse XML
    const xmlText = await file.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsedXML = parser.parse(xmlText);
    
    // Extract shipments
    let shipments: any[] = [];
    if (parsedXML.OceanShipments?.OceanShipment) {
      shipments = Array.isArray(parsedXML.OceanShipments.OceanShipment) 
        ? parsedXML.OceanShipments.OceanShipment 
        : [parsedXML.OceanShipments.OceanShipment];
    }

    console.log(`Found ${shipments.length} shipments`);

    // Create minimal records for insertion
    const records = shipments.map(shipment => ({
      consignee_name: shipment.Consignee || 'Unknown',
      shipper_name: shipment.Shipper || 'Unknown',
      shipper_country: shipment.ShipperCountry || shipment.OriginCountry,
      consignee_country: shipment.ConsigneeCountry || shipment.DestinationCountry,
      consignee_city: shipment.ConsigneeCity,
      goods_description: shipment.GoodsDescription,
      vessel_name: shipment.VesselName,
      arrival_date: shipment.ArrivalDate,
      weight_kg: shipment.WeightKG ? parseFloat(shipment.WeightKG) : null,
      value_usd: shipment.ValueUSD && shipment.ValueUSD !== 'N/A' ? parseFloat(shipment.ValueUSD) : null,
      raw_xml_filename: file.name
    })).filter(record => record.consignee_name !== 'Unknown' || record.shipper_name !== 'Unknown');

    console.log(`Inserting ${records.length} clean records`);
    console.log('Sample record:', records[0]);

    // Insert into database
    const { data, error } = await supabase
      .from('ocean_shipments')
      .insert(records)
      .select('id');

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert records',
        details: error.message,
        recordCount: records.length
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'XML processed successfully',
      recordsProcessed: shipments.length,
      recordsInserted: data?.length || 0,
      filename: file.name,
      sampleRecord: records[0]
    });

  } catch (error) {
    console.error('XML processing error:', error);
    return NextResponse.json({
      success: false,
      error: 'XML processing failed',
      details: (error as Error).message
    }, { status: 500 });
  }
}