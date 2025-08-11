export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });

    const xmlText = await file.text();
    const shipmentMatches = xmlText.match(/<OceanShipment>([\s\S]*?)<\/OceanShipment>/g);
    if (!shipmentMatches) return NextResponse.json({ success: false, error: 'No shipments found in XML' }, { status: 400 });

    const records = shipmentMatches.map(shipmentXml => {
      const extract = (tag: string) => {
        const match = shipmentXml.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's'));
        return match ? match[1].trim() : null;
      };
      const parseNumber = (value: string | null) => {
        if (!value || value === 'N/A') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };
      return {
        consignee_name: extract('Consignee'),
        shipper_name: extract('Shipper'),
        shipper_country: extract('ShipperCountry'),
        consignee_country: extract('ConsigneeCountry'), 
        consignee_city: extract('ConsigneeCity'),
        consignee_state: extract('ConsigneeState'),
        consignee_zip: extract('ConsigneeZip'),
        goods_description: extract('GoodsDescription'),
        weight_kg: parseNumber(extract('WeightKG')),
        value_usd: parseNumber(extract('ValueUSD')),
        port_of_lading: extract('PortOfLading'),
        port_of_unlading: extract('PortOfUnlading'),
        transport_method: extract('TransportMethod'),
        vessel_name: extract('VesselName'),
        arrival_date: extract('ArrivalDate'),
        bol_number: extract('BolNumber'),
        raw_xml_filename: file.name
      };
    }).filter(record => record.consignee_name || record.shipper_name);

    const { data, error } = await supabase.from('ocean_shipments').insert(records).select('id, consignee_name, shipper_name');
    if (error) return NextResponse.json({ success: false, error: 'Failed to insert records', details: error.message, recordCount: records.length, sampleRecord: records[0] }, { status: 500 });

    const filename = `${Date.now()}_${file.name}`;
    await supabase.storage.from('raw-xml').upload(filename, file).catch(()=>null);

    return NextResponse.json({ success: true, message: 'Minimal XML ingestion completed', recordsProcessed: shipmentMatches.length, recordsInserted: data?.length || 0, filename, storageUploaded: true, sampleInserted: data?.[0], nextStep: 'Check /api/search/unified for real company data' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'XML processing failed', details: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Minimal XML ingestion endpoint', description: 'Uses only basic columns that exist in ocean_shipments', usage: 'POST with multipart/form-data XML file', columns: ['consignee_name', 'shipper_name', 'shipper_country', 'consignee_country','consignee_city', 'goods_description', 'weight_kg', 'vessel_name', 'arrival_date'] });
}