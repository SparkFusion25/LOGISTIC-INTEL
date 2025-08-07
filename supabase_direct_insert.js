const fs = require('fs');

// Read parsed shipments
const shipments = JSON.parse(fs.readFileSync('parsed_shipments.json', 'utf8'));

console.log(`Preparing to insert ${shipments.length} shipments directly to Supabase...`);

// Take first 10 as a test batch
const testBatch = shipments.slice(0, 10);

console.log('Test batch companies:', testBatch.map(s => s.consignee_name || s.shipper_name));

// Output the batch for manual insertion
const insertSQL = `INSERT INTO ocean_shipments (
  consignee_name, shipper_name, shipper_country, consignee_country, 
  consignee_city, consignee_state, consignee_zip, goods_description,
  weight_kg, port_of_lading, port_of_unlading, transport_method,
  vessel_name, arrival_date, bol_number, raw_xml_filename
) VALUES `;

const values = testBatch.map(s => `(
  ${s.consignee_name ? `'${s.consignee_name.replace(/'/g, "''")}'` : 'NULL'},
  ${s.shipper_name ? `'${s.shipper_name.replace(/'/g, "''")}'` : 'NULL'},
  ${s.shipper_country ? `'${s.shipper_country.replace(/'/g, "''")}'` : 'NULL'},
  ${s.consignee_country ? `'${s.consignee_country.replace(/'/g, "''")}'` : 'NULL'},
  ${s.consignee_city ? `'${s.consignee_city.replace(/'/g, "''")}'` : 'NULL'},
  ${s.consignee_state ? `'${s.consignee_state.replace(/'/g, "''")}'` : 'NULL'},
  ${s.consignee_zip ? `'${s.consignee_zip}'` : 'NULL'},
  ${s.goods_description ? `'${s.goods_description.replace(/'/g, "''")}'` : 'NULL'},
  ${s.weight_kg || 'NULL'},
  ${s.port_of_lading ? `'${s.port_of_lading.replace(/'/g, "''")}'` : 'NULL'},
  ${s.port_of_unlading ? `'${s.port_of_unlading.replace(/'/g, "''")}'` : 'NULL'},
  ${s.transport_method ? `'${s.transport_method.replace(/'/g, "''")}'` : 'NULL'},
  ${s.vessel_name ? `'${s.vessel_name.replace(/'/g, "''")}'` : 'NULL'},
  ${s.arrival_date ? `'${s.arrival_date}'` : 'NULL'},
  ${s.bol_number ? `'${s.bol_number}'` : 'NULL'},
  '${s.raw_xml_filename}'
)`).join(',\n');

const fullSQL = insertSQL + values + ';';

fs.writeFileSync('insert_test_batch.sql', fullSQL);

console.log('✅ SQL INSERT statement saved to insert_test_batch.sql');
console.log('📋 You can run this in Supabase SQL Editor to insert the first 10 real companies');
console.log('\n📊 Test batch will add these companies:');
testBatch.forEach((s, i) => {
  console.log(`${i+1}. ${s.consignee_name || s.shipper_name} - ${s.vessel_name} - ${s.arrival_date}`);
});