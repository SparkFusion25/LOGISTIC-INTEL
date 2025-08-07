import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing XML ingestion endpoint...');
    
    // Create a sample XML content for testing
    const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<ShipmentData>
  <Shipment>
    <ConsigneeName>Samsung Electronics Co Ltd</ConsigneeName>
    <ShipperName>Apple Inc</ShipperName>
    <HSCode>8471.30.01</HSCode>
    <CommodityDescription>Computer parts and components</CommodityDescription>
    <ValueUSD>125000</ValueUSD>
    <WeightKG>2500</WeightKG>
    <OriginCountry>South Korea</OriginCountry>
    <DestinationCountry>United States</DestinationCountry>
    <DestinationCity>Long Beach</DestinationCity>
    <ArrivalDate>2025-01-15</ArrivalDate>
    <VesselName>MSC TEST VESSEL</VesselName>
    <Carrier>MSC</Carrier>
  </Shipment>
  <Shipment>
    <ConsigneeName>Tesla Inc</ConsigneeName>
    <ShipperName>LG Chem</ShipperName>
    <HSCode>8507.60.00</HSCode>
    <CommodityDescription>Lithium-ion batteries</CommodityDescription>
    <ValueUSD>89000</ValueUSD>
    <WeightKG>1800</WeightKG>
    <OriginCountry>South Korea</OriginCountry>
    <DestinationCountry>United States</DestinationCountry>
    <DestinationCity>Los Angeles</DestinationCity>
    <ArrivalDate>2025-01-12</ArrivalDate>
    <VesselName>EVERGREEN TEST SHIP</VesselName>
    <Carrier>Evergreen</Carrier>
  </Shipment>
  <Shipment>
    <ConsigneeName>Microsoft Corporation</ConsigneeName>
    <ShipperName>Foxconn Technology</ShipperName>
    <HSCode>8471.41.01</HSCode>
    <CommodityDescription>Desktop computers</CommodityDescription>
    <ValueUSD>234000</ValueUSD>
    <WeightKG>3200</WeightKG>
    <OriginCountry>China</OriginCountry>
    <DestinationCountry>United States</DestinationCountry>
    <DestinationCity>Seattle</DestinationCity>
    <ArrivalDate>2025-01-18</ArrivalDate>
    <VesselName>COSCO TEST CONTAINER</VesselName>
    <Carrier>COSCO</Carrier>
  </Shipment>
</ShipmentData>`;

    console.log('📄 Sample XML created, sending to ingestion endpoint...');

    // Create a FormData object with the XML content
    const formData = new FormData();
    const xmlBlob = new Blob([sampleXML], { type: 'application/xml' });
    formData.append('file', xmlBlob, 'test_sample_shipments.xml');

    // Call the ingestion endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    console.log('🚀 Calling ingestion endpoint:', `${baseUrl}/api/ingest/xml-shipments`);

    const ingestionResponse = await fetch(`${baseUrl}/api/ingest/xml-shipments`, {
      method: 'POST',
      body: formData
    });

    const ingestionResult = await ingestionResponse.json();

    console.log('📊 Ingestion response:', ingestionResult);

    // Also test the data verification endpoint to see results
    console.log('🔍 Checking data verification...');
    
    const verificationResponse = await fetch(`${baseUrl}/api/test/data-verification`);
    const verificationResult = await verificationResponse.json();

    return NextResponse.json({
      success: true,
      test_type: 'XML Ingestion Test',
      timestamp: new Date().toISOString(),
      sample_xml_size: sampleXML.length,
      ingestion_response: ingestionResult,
      data_verification: {
        total_shipment_records: verificationResult.database_counts?.ocean_shipments || 0,
        distinct_companies: verificationResult.database_counts?.distinct_companies || 0,
        storage_files: verificationResult.storage_info?.file_count || 0
      },
      test_summary: {
        ingestion_success: ingestionResult.success,
        records_created: ingestionResult.recordsProcessed || 0,
        status: ingestionResult.success ? 'PASSED' : 'FAILED',
        next_steps: ingestionResult.success 
          ? 'XML ingestion working! Ready for real XML files.'
          : 'Check RLS policies and permissions.'
      }
    });

  } catch (error) {
    console.error('💥 XML ingestion test failed:', error);
    return NextResponse.json({
      success: false,
      test_type: 'XML Ingestion Test',
      error: 'Test failed',
      details: (error as Error).message,
      recommendation: 'Check if RLS policies are enabled and /api/ingest/xml-shipments endpoint exists'
    }, { status: 500 });
  }
}