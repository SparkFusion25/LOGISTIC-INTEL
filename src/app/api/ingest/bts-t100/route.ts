import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

interface BTSRecord {
  origin_airport: string;
  dest_airport: string;
  carrier: string;
  carrier_name: string;
  freight_kg: number;
  mail_kg: number;
  month: number;
  year: number;
  aircraft_type?: string;
  departures_performed?: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🛫 Starting real BTS T-100 data ingestion...');

    const { year, month } = await request.json();
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    // BTS T-100 data download URL (real government source)
    const btsUrl = `https://transtats.bts.gov/DownLoad_Table.asp?Table_ID=293&Has_Group=3&Is_Zipped=0`;
    
    console.log(`📥 Downloading BTS T-100 data for ${targetYear}-${targetMonth}...`);

    // Download real BTS data
    const downloadResult = await downloadBTSData(btsUrl, targetYear, targetMonth);
    
    if (!downloadResult.success) {
      throw new Error(`BTS download failed: ${downloadResult.error}`);
    }

    console.log('🔄 Parsing BTS T-100 data...');
    const parsedRecords = await parseBTSData(downloadResult.data!, targetYear, targetMonth);
    
    console.log(`📊 Parsed ${parsedRecords.length} BTS records`);

    // Clear existing data for this month/year
    const { error: deleteError } = await supabase
      .from('t100_air_segments')
      .delete()
      .eq('year', targetYear)
      .eq('month', targetMonth);

    if (deleteError) {
      console.warn('Warning: Could not clear existing data:', deleteError.message);
    }

    // Insert new data in batches
    const batchSize = 100;
    let insertedCount = 0;
    const errors = [];

    for (let i = 0; i < parsedRecords.length; i += batchSize) {
      const batch = parsedRecords.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('t100_air_segments')
        .insert(batch);

      if (insertError) {
        errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
      } else {
        insertedCount += batch.length;
      }
    }

    console.log(`✅ Inserted ${insertedCount} BTS records`);

    return NextResponse.json({
      success: true,
      message: `BTS T-100 data ingestion completed for ${targetYear}-${targetMonth}`,
      details: {
        year: targetYear,
        month: targetMonth,
        records_parsed: parsedRecords.length,
        records_inserted: insertedCount,
        errors: errors
      }
    });

  } catch (error) {
    console.error('💥 BTS ingestion failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'BTS T-100 data ingestion failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function downloadBTSData(url: string, year: number, month: number): Promise<{success: boolean; data?: string; error?: string}> {
  try {
    // For production, you would use the actual BTS API or CSV download
    // This is a simplified implementation that would need to be adapted to the real BTS data format
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'LogisticIntel/1.0 Trade Intelligence Platform'
      }
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.text();
    return { success: true, data };

  } catch (error) {
    console.error('BTS download error:', error);
    return { success: false, error: (error as Error).message };
  }
}

async function parseBTSData(csvData: string, year: number, month: number): Promise<BTSRecord[]> {
  const records: BTSRecord[] = [];
  
  try {
    // Parse CSV data (BTS T-100 is typically CSV format)
    const lines = csvData.split('\n');
    const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''));
    
    if (!headers) {
      throw new Error('No headers found in BTS data');
    }

    // Map BTS column names to our fields
    const columnMapping = {
      'ORIGIN': 'origin_airport',
      'DEST': 'dest_airport', 
      'UNIQUE_CARRIER': 'carrier',
      'UNIQUE_CARRIER_NAME': 'carrier_name',
      'FREIGHT': 'freight_kg',
      'MAIL': 'mail_kg',
      'DEPARTURES_PERFORMED': 'departures_performed',
      'AIRCRAFT_TYPE': 'aircraft_type'
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      if (values.length < headers.length) continue;

      const record: any = { year, month };
      
      headers.forEach((header, index) => {
        const mappedField = columnMapping[header as keyof typeof columnMapping];
        if (mappedField && values[index]) {
          let value = values[index].replace(/"/g, '').trim();
          
          // Convert numeric fields
          if (mappedField.includes('_kg') || mappedField === 'departures_performed') {
            record[mappedField] = parseFloat(value) || 0;
          } else {
            record[mappedField] = value;
          }
        }
      });

      // Validate required fields
      if (record.origin_airport && record.dest_airport && record.carrier) {
        // Convert freight from pounds to kg if needed (BTS often uses pounds)
        if (record.freight_kg && record.freight_kg > 10000) {
          record.freight_kg = record.freight_kg * 0.453592; // pounds to kg
        }
        
        records.push(record);
      }
    }

  } catch (error) {
    console.error('BTS parsing error:', error);
    throw new Error(`Failed to parse BTS data: ${(error as Error).message}`);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}