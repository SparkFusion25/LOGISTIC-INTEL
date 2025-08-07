const fs = require('fs');

// Read and parse XML manually
const xmlContent = fs.readFileSync('real_ocean_shipments_100.xml', 'utf8');

// Extract shipments using simple regex (since we know the structure)
const shipmentMatches = xmlContent.match(/<OceanShipment>([\s\S]*?)<\/OceanShipment>/g);

if (!shipmentMatches) {
  console.log('No shipments found');
  process.exit(1);
}

console.log(`Found ${shipmentMatches.length} shipments`);

// Parse each shipment
const shipments = shipmentMatches.map(shipmentXml => {
  const extract = (tag) => {
    const match = shipmentXml.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, 's'));
    return match ? match[1].trim() : null;
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
    weight_kg: extract('WeightKG') ? parseFloat(extract('WeightKG')) : null,
    value_usd: extract('ValueUSD') && extract('ValueUSD') !== 'N/A' ? null : null, // Most are N/A
    port_of_lading: extract('PortOfLading'),
    port_of_unlading: extract('PortOfUnlading'),
    transport_method: extract('TransportMethod'),
    vessel_name: extract('VesselName'),
    arrival_date: extract('ArrivalDate'),
    bol_number: extract('BolNumber'),
    raw_xml_filename: 'real_ocean_shipments_100.xml'
  };
});

// Filter out incomplete records
const validShipments = shipments.filter(s => s.consignee_name || s.shipper_name);

console.log(`Valid shipments: ${validShipments.length}`);
console.log('Sample shipment:', JSON.stringify(validShipments[0], null, 2));

// Output as JSON for inspection
fs.writeFileSync('parsed_shipments.json', JSON.stringify(validShipments, null, 2));
console.log('Shipments saved to parsed_shipments.json');

// Show some stats
const companies = [...new Set(validShipments.map(s => s.consignee_name || s.shipper_name).filter(Boolean))];
console.log(`Unique companies: ${companies.length}`);
console.log('First 10 companies:', companies.slice(0, 10));