import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ Initializing Census trade data schema...');

    const results = [];

    // 1. Create census_trade_data table
    try {
      console.log('Creating census_trade_data table...');
      
      const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Create census_trade_data table
          CREATE TABLE IF NOT EXISTS census_trade_data (
            id SERIAL PRIMARY KEY,
            commodity TEXT NOT NULL,
            commodity_name TEXT,
            value_usd DECIMAL(15,2) DEFAULT 0,
            weight_kg DECIMAL(12,2) DEFAULT 0,
            year INT NOT NULL,
            month INT NOT NULL CHECK (month >= 1 AND month <= 12),
            state TEXT NOT NULL,
            country TEXT NOT NULL,
            transport_mode TEXT NOT NULL, -- '20' = Ocean, '40' = Air
            customs_district TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );

          -- Create indexes for performance
          CREATE INDEX IF NOT EXISTS idx_census_transport_mode ON census_trade_data(transport_mode);
          CREATE INDEX IF NOT EXISTS idx_census_year_month ON census_trade_data(year, month);
          CREATE INDEX IF NOT EXISTS idx_census_commodity ON census_trade_data(commodity);
          CREATE INDEX IF NOT EXISTS idx_census_value ON census_trade_data(value_usd DESC);
          CREATE INDEX IF NOT EXISTS idx_census_state ON census_trade_data(state);
          CREATE INDEX IF NOT EXISTS idx_census_country ON census_trade_data(country);
          CREATE INDEX IF NOT EXISTS idx_census_created_at ON census_trade_data(created_at);

          -- Composite indexes for common queries
          CREATE INDEX IF NOT EXISTS idx_census_mode_year_month ON census_trade_data(transport_mode, year, month);
          CREATE INDEX IF NOT EXISTS idx_census_commodity_mode ON census_trade_data(commodity, transport_mode);
        `
      });

      if (tableError) {
        console.error('Table creation error:', tableError);
        results.push({ step: 'census_trade_data table', status: 'error', error: tableError.message });
      } else {
        results.push({ step: 'census_trade_data table', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 'census_trade_data table', status: 'error', error: (error as Error).message });
    }

    // 2. Create view for combined air/ocean intelligence
    try {
      console.log('Creating combined trade intelligence view...');
      
      const { error: viewError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE VIEW combined_trade_intelligence AS
          SELECT 
            ctd.id,
            ctd.commodity,
            ctd.commodity_name,
            ctd.value_usd,
            ctd.weight_kg,
            ctd.year,
            ctd.month,
            ctd.state,
            ctd.country,
            ctd.transport_mode,
            
            -- Infer company based on commodity patterns
            CASE 
              WHEN ctd.commodity LIKE '8471%' THEN 
                CASE 
                  WHEN ctd.country = 'South Korea' THEN 'Samsung Electronics'
                  WHEN ctd.country = 'China' THEN 'Lenovo'
                  ELSE 'Technology Company'
                END
              WHEN ctd.commodity LIKE '8528%' THEN
                CASE 
                  WHEN ctd.country = 'South Korea' THEN 'LG Electronics'
                  WHEN ctd.country = 'Japan' THEN 'Sony Electronics'
                  ELSE 'Electronics Manufacturer'
                END
              WHEN ctd.commodity LIKE '8518%' THEN
                CASE 
                  WHEN ctd.country = 'Japan' THEN 'Sony Electronics'
                  WHEN ctd.country = 'Germany' THEN 'Sennheiser'
                  ELSE 'Audio Equipment Manufacturer'
                END
              WHEN ctd.commodity LIKE '9018%' THEN 'Medical Equipment Supplier'
              ELSE 'Trade Company'
            END as inferred_company,
            
            -- BTS route matching potential
            CASE 
              WHEN ctd.transport_mode = '40' AND ctd.country = 'South Korea' AND ctd.state = 'IL' 
                THEN 'ICN→ORD (Korean Air Cargo)'
              WHEN ctd.transport_mode = '40' AND ctd.country = 'South Korea' AND ctd.state = 'CA' 
                THEN 'ICN→LAX (Korean Air Cargo)'
              WHEN ctd.transport_mode = '40' AND ctd.country = 'Japan' AND ctd.state = 'CA' 
                THEN 'NRT→LAX (All Nippon Airways)'
              WHEN ctd.transport_mode = '40' AND ctd.country = 'China' AND ctd.state = 'CA' 
                THEN 'PVG→LAX (China Cargo Airlines)'
              WHEN ctd.transport_mode = '40' AND ctd.country = 'Germany' AND ctd.state = 'NY' 
                THEN 'FRA→JFK (Lufthansa Cargo)'
              ELSE NULL
            END as bts_route_match,
            
            -- Air shipper confidence scoring
            CASE 
              WHEN ctd.transport_mode = '40' THEN
                CASE 
                  WHEN ctd.commodity LIKE '8471%' OR ctd.commodity LIKE '8528%' THEN 90 -- Electronics
                  WHEN ctd.commodity LIKE '9018%' THEN 85 -- Medical equipment
                  WHEN ctd.commodity LIKE '8518%' THEN 80 -- Audio equipment
                  ELSE 70
                END
              WHEN ctd.transport_mode = '20' THEN
                CASE 
                  WHEN ctd.value_usd > 100000 THEN 45 -- High-value ocean cargo may use air
                  WHEN ctd.commodity LIKE '8471%' OR ctd.commodity LIKE '8528%' THEN 35
                  ELSE 25
                END
              ELSE 50
            END as air_confidence_score,
            
            -- Trade classification
            CASE 
              WHEN ctd.transport_mode = '40' THEN 'Air Freight'
              WHEN ctd.transport_mode = '20' THEN 'Ocean Freight'
              ELSE 'Unknown Mode'
            END as trade_mode_name,
            
            ctd.created_at
            
          FROM census_trade_data ctd
          WHERE ctd.value_usd > 0
          ORDER BY ctd.value_usd DESC, ctd.created_at DESC;
        `
      });

      if (viewError) {
        console.error('View creation error:', viewError);
        results.push({ step: 'combined_trade_intelligence view', status: 'error', error: viewError.message });
      } else {
        results.push({ step: 'combined_trade_intelligence view', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 'combined_trade_intelligence view', status: 'error', error: (error as Error).message });
    }

    // 3. Insert sample data for immediate testing
    try {
      console.log('Inserting sample Census trade data...');
      
      const sampleData = [
        // Air freight samples (transport_mode = '40')
        {
          commodity: '8471600000',
          commodity_name: 'Computer processing units and controllers',
          value_usd: 2400000,
          weight_kg: 15000,
          year: 2024,
          month: 12,
          state: 'CA',
          country: 'South Korea',
          transport_mode: '40'
        },
        {
          commodity: '8528720000',
          commodity_name: 'LCD monitors and display units',
          value_usd: 1850000,
          weight_kg: 12500,
          year: 2024,
          month: 12,
          state: 'IL',
          country: 'South Korea',
          transport_mode: '40'
        },
        {
          commodity: '8518300000',
          commodity_name: 'Audio equipment and headphones',
          value_usd: 920000,
          weight_kg: 8200,
          year: 2024,
          month: 12,
          state: 'CA',
          country: 'Japan',
          transport_mode: '40'
        },
        {
          commodity: '9018390000',
          commodity_name: 'Medical and surgical instruments',
          value_usd: 1200000,
          weight_kg: 5500,
          year: 2024,
          month: 12,
          state: 'MN',
          country: 'Germany',
          transport_mode: '40'
        },
        // Ocean freight samples (transport_mode = '20')
        {
          commodity: '8471700000',
          commodity_name: 'Computer storage units and drives',
          value_usd: 680000,
          weight_kg: 45000,
          year: 2024,
          month: 12,
          state: 'CA',
          country: 'Thailand',
          transport_mode: '20'
        },
        {
          commodity: '8471600000',
          commodity_name: 'Computer processing units and controllers',
          value_usd: 1100000,
          weight_kg: 32000,
          year: 2024,
          month: 12,
          state: 'TX',
          country: 'China',
          transport_mode: '20'
        },
        {
          commodity: '8528720000',
          commodity_name: 'LCD monitors and display units',
          value_usd: 950000,
          weight_kg: 28000,
          year: 2024,
          month: 12,
          state: 'NY',
          country: 'South Korea',
          transport_mode: '20'
        }
      ];

      const { error: insertError } = await supabase
        .from('census_trade_data')
        .upsert(sampleData, { onConflict: 'commodity,year,month,state,country,transport_mode' });

      if (insertError) {
        console.error('Sample data insert error:', insertError);
        results.push({ step: 'sample Census data', status: 'error', error: insertError.message });
      } else {
        results.push({ step: 'sample Census data', status: 'success', recordsInserted: sampleData.length });
      }
    } catch (error) {
      results.push({ step: 'sample Census data', status: 'error', error: (error as Error).message });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: errorCount === 0,
      message: `Census schema initialization completed. ${successCount} steps successful, ${errorCount} errors.`,
      details: results,
      summary: {
        totalSteps: results.length,
        successful: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Census schema initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize Census schema', details: (error as Error).message },
      { status: 500 }
    );
  }
}