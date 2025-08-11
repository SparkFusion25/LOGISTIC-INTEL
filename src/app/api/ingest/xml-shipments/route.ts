export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:false, error:'Supabase env missing' }, { status:500 });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });

    const xmlContent = await file.text();
    const filename = `${Date.now()}_${file.name}`;
    await supabase.storage.from('raw-xml').upload(filename, xmlContent, { contentType: 'application/xml', upsert: false }).catch(()=>null);

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#text', parseAttributeValue: true, trimValues: true });
    const parsedXML = parser.parse(xmlContent);

    const shipmentRecords = extractShipmentRecords(parsedXML, filename);
    if (shipmentRecords.length === 0) return NextResponse.json({ success: false, error: 'No shipment records found in XML', filename, xmlStructure: Object.keys(parsedXML) }, { status: 400 });

    const cleanRecords = shipmentRecords.map(record => {
      const cleanRecord: any = {};
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

    const { data: insertData, error: insertError } = await supabase.from('ocean_shipments').insert(cleanRecords).select('id');
    if (insertError) return NextResponse.json({ success: false, error: 'Failed to insert shipment records', details: insertError.message, recordCount: shipmentRecords.length }, { status: 500 });

    return NextResponse.json({ success: true, message: 'XML file processed successfully', filename, recordsProcessed: shipmentRecords.length, recordsInserted: insertData?.length || 0, storageUploaded: true, sampleRecord: shipmentRecords[0] });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'XML processing failed', details: (error as Error).message }, { status: 500 });
  }
}

function extractShipmentRecords(parsedXML: any, filename: string) {
  const records: any[] = [];
  const possibleRoots = ['Shipments','ShipmentData','TradeData','Manifest','BillOfLading','ImportExport'];
  let shipmentArray: any[] = [];
  for (const root of possibleRoots) {
    if (parsedXML[root]) {
      const rootData = parsedXML[root];
      if (Array.isArray(rootData)) { shipmentArray = rootData; break; }
      else if (rootData.Shipment) { shipmentArray = Array.isArray(rootData.Shipment) ? rootData.Shipment : [rootData.Shipment]; break; }
      else if (rootData.Record) { shipmentArray = Array.isArray(rootData.Record) ? rootData.Record : [rootData.Record]; break; }
    }
  }
  if (shipmentArray.length === 0) {
    const findArrays = (obj: any): any[] => {
      if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object') return obj;
      for (const key in obj) { if (typeof obj[key] === 'object') { const result = findArrays(obj[key]); if (result.length > 0) return result; } }
      return [];
    };
    shipmentArray = findArrays(parsedXML);
  }
  for (const shipment of shipmentArray) {
    try {
      const record: any = { raw_xml_filename: filename };
      const extractField = (o:any, names:string[]) => { for (const n of names) { if (o[n]) { const v=o[n]; return typeof v==='object' ? v['#text'] || v.toString() : v.toString(); } } return undefined; };
      const parseNumeric = (v:string|undefined) => { if (!v) return undefined; const cleaned = v.toString().replace(/[,$\s]/g,''); const n = parseFloat(cleaned); return isNaN(n)? undefined : n; };
      record.consignee_name = extractField(shipment,['ConsigneeName','Consignee','ReceiverName','Receiver','ImporterName','Importer','BuyerName','Buyer']);
      record.shipper_name = extractField(shipment,['ShipperName','Shipper','SenderName','Sender','ExporterName','Exporter','SupplierName','Supplier']);
      record.origin_country = extractField(shipment,['OriginCountry','CountryOfOrigin','ExportCountry','ShipperCountry','OriginCountryCode']);
      record.destination_country = extractField(shipment,['DestinationCountry','CountryOfDestination','ImportCountry','ConsigneeCountry','DestinationCountryCode']);
      record.destination_city = extractField(shipment,['DestinationCity','CityOfDestination','ImportCity','ConsigneeCity','Port','DestinationPort']);
      record.hs_code = extractField(shipment,['HSCode','HS_Code','CommodityCode','TariffCode','ClassificationCode','ProductCode']);
      record.commodity_description = extractField(shipment,['CommodityDescription','Description','GoodsDescription','ProductDescription','Goods','Commodity']);
      record.value_usd = parseNumeric(extractField(shipment,['ValueUSD','Value','DeclaredValue','InvoiceValue','CustomsValue','CIFValue','FOBValue']));
      record.arrival_date = extractField(shipment,['ArrivalDate','DischargeDate','ImportDate','UnloadingDate','DeliveryDate']);
      record.vessel_name = extractField(shipment,['VesselName','Vessel','ShipName','Ship','CarrierName','TransportName']);
      record.weight_kg = parseNumeric(extractField(shipment,['WeightKG','Weight','GrossWeight','NetWeight','TotalWeight','WeightInKG']));
      if (record.consignee_name || record.shipper_name) records.push(record);
    } catch {}
  }
  return records;
}

export async function GET(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ success:true, message:'XML ingestion service; env missing so returning stub status', totalRecords: 0, recentUploads: [], endpoint: '/api/ingest/xml-shipments' });
    const supabase = createClient(url, key, { auth: { persistSession:false } });

    const { data: recentUploads } = await supabase.from('ocean_shipments').select('raw_xml_filename, created_at').not('raw_xml_filename', 'is', null).order('created_at', { ascending: false }).limit(10);
    const { data: totalCount } = await supabase.from('ocean_shipments').select('id', { count: 'exact' });

    return NextResponse.json({ success: true, message: 'XML ingestion service is active', totalRecords: totalCount?.length || 0, recentUploads: recentUploads || [], endpoint: '/api/ingest/xml-shipments', usage: 'POST with multipart/form-data containing XML file' });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}