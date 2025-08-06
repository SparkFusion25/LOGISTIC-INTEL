'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function XmlUploader() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus('Uploading...');

    try {
      // Upload raw XML to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('raw-xml')
        .upload(`xml/${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // Parse the file in-browser
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');

      // Example: parse <Shipment> nodes — adjust as needed
      const shipments = xmlDoc.querySelectorAll('Shipment');
      const records: any[] = [];

      shipments.forEach((shipment) => {
        const consignee = shipment.querySelector('ConsigneeName')?.textContent;
        const city = shipment.querySelector('ConsigneeCity')?.textContent;
        const hsCode = shipment.querySelector('HSCode')?.textContent;
        const value = shipment.querySelector('ValueUSD')?.textContent;
        const date = shipment.querySelector('ArrivalDate')?.textContent;

        if (consignee && hsCode && value && date) {
          records.push({
            consignee_name: consignee,
            consignee_city: city || null,
            hs_code: hsCode,
            value_usd: parseFloat(value),
            arrival_date: date,
          });
        }
      });

      // Insert records into Supabase table
      if (records.length > 0) {
        const { error: insertError } = await supabase
          .from('ocean_shipments')
          .insert(records);

        if (insertError) throw insertError;
        setStatus(`✅ Uploaded and inserted ${records.length} records`);
      } else {
        setStatus('⚠️ No valid records found in XML.');
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Error: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📤 Upload XML Shipment File</h2>
      <input type="file" accept=".xml" onChange={handleUpload} disabled={loading} />
      <p>{status}</p>
    </div>
  );
}
