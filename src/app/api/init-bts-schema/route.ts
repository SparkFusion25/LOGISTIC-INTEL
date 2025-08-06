import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing BTS T-100 schema and air shipper matching logic...');

    const results = [];

    // 1. Create t100_air_segments table
    try {
      console.log('Creating t100_air_segments table...');
      
      const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS t100_air_segments (
            id SERIAL PRIMARY KEY,
            origin_airport TEXT NOT NULL,
            dest_airport TEXT NOT NULL,
            carrier TEXT NOT NULL,
            freight_kg FLOAT DEFAULT 0,
            mail_kg FLOAT DEFAULT 0,
            month INT NOT NULL,
            year INT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );

          -- Create indexes for performance
          CREATE INDEX IF NOT EXISTS idx_t100_origin_dest ON t100_air_segments(origin_airport, dest_airport);
          CREATE INDEX IF NOT EXISTS idx_t100_carrier ON t100_air_segments(carrier);
          CREATE INDEX IF NOT EXISTS idx_t100_date ON t100_air_segments(year, month);
          CREATE INDEX IF NOT EXISTS idx_t100_freight ON t100_air_segments(freight_kg DESC);

          -- Add constraint for valid months
          ALTER TABLE t100_air_segments ADD CONSTRAINT IF NOT EXISTS check_valid_month 
            CHECK (month >= 1 AND month <= 12);
        `
      });

      if (tableError) {
        console.error('Table creation error:', tableError);
        results.push({ step: 't100_air_segments table', status: 'error', error: tableError.message });
      } else {
        results.push({ step: 't100_air_segments table', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 't100_air_segments table', status: 'error', error: (error as Error).message });
    }

    // 2. Update company_profiles table for air shipper tracking
    try {
      console.log('Updating company_profiles for air shipper tracking...');
      
      const { error: profileError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE company_profiles 
          ADD COLUMN IF NOT EXISTS likely_air_shipper BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS air_confidence_score INT DEFAULT 0,
          ADD COLUMN IF NOT EXISTS last_air_analysis TIMESTAMP,
          ADD COLUMN IF NOT EXISTS bts_route_matches JSONB DEFAULT '[]'::jsonb;

          -- Create index for air shipper queries
          CREATE INDEX IF NOT EXISTS idx_company_air_shipper ON company_profiles(likely_air_shipper, air_confidence_score);
        `
      });

      if (profileError) {
        console.error('Company profiles update error:', profileError);
        results.push({ step: 'company_profiles air tracking', status: 'error', error: profileError.message });
      } else {
        results.push({ step: 'company_profiles air tracking', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 'company_profiles air tracking', status: 'error', error: (error as Error).message });
    }

    // 3. Create airport mapping table
    try {
      console.log('Creating airport mapping table...');
      
      const { error: airportError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS airport_city_mapping (
            id SERIAL PRIMARY KEY,
            airport_code TEXT UNIQUE NOT NULL,
            city TEXT NOT NULL,
            state TEXT,
            country TEXT NOT NULL,
            region TEXT,
            timezone TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );

          -- Insert major airport mappings
          INSERT INTO airport_city_mapping (airport_code, city, state, country, region) VALUES
          ('ORD', 'Chicago', 'IL', 'USA', 'North America'),
          ('LAX', 'Los Angeles', 'CA', 'USA', 'North America'),
          ('JFK', 'New York', 'NY', 'USA', 'North America'),
          ('MIA', 'Miami', 'FL', 'USA', 'North America'),
          ('ATL', 'Atlanta', 'GA', 'USA', 'North America'),
          ('DFW', 'Dallas', 'TX', 'USA', 'North America'),
          ('SEA', 'Seattle', 'WA', 'USA', 'North America'),
          ('SFO', 'San Francisco', 'CA', 'USA', 'North America'),
          ('ICN', 'Seoul', NULL, 'South Korea', 'Asia'),
          ('PVG', 'Shanghai', NULL, 'China', 'Asia'),
          ('NRT', 'Tokyo', NULL, 'Japan', 'Asia'),
          ('HKG', 'Hong Kong', NULL, 'Hong Kong', 'Asia'),
          ('SIN', 'Singapore', NULL, 'Singapore', 'Asia'),
          ('TPE', 'Taipei', NULL, 'Taiwan', 'Asia'),
          ('BOM', 'Mumbai', NULL, 'India', 'Asia'),
          ('DEL', 'Delhi', NULL, 'India', 'Asia'),
          ('FRA', 'Frankfurt', NULL, 'Germany', 'Europe'),
          ('AMS', 'Amsterdam', NULL, 'Netherlands', 'Europe'),
          ('LHR', 'London', NULL, 'United Kingdom', 'Europe'),
          ('CDG', 'Paris', NULL, 'France', 'Europe'),
          ('YYZ', 'Toronto', 'ON', 'Canada', 'North America'),
          ('GRU', 'São Paulo', NULL, 'Brazil', 'South America'),
          ('MEX', 'Mexico City', NULL, 'Mexico', 'North America')
          ON CONFLICT (airport_code) DO NOTHING;

          CREATE INDEX IF NOT EXISTS idx_airport_city ON airport_city_mapping(city);
          CREATE INDEX IF NOT EXISTS idx_airport_country ON airport_city_mapping(country);
        `
      });

      if (airportError) {
        console.error('Airport mapping error:', airportError);
        results.push({ step: 'airport_city_mapping table', status: 'error', error: airportError.message });
      } else {
        results.push({ step: 'airport_city_mapping table', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 'airport_city_mapping table', status: 'error', error: (error as Error).message });
    }

    // 4. Create air shipper probability function
    try {
      console.log('Creating air shipper probability function...');
      
      const { error: functionError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION update_air_shipper_probabilities()
          RETURNS void AS $$
          BEGIN
            -- Update company profiles based on BTS + Census matching
            UPDATE company_profiles 
            SET 
              likely_air_shipper = CASE 
                WHEN air_confidence_score >= 70 THEN TRUE 
                ELSE FALSE 
              END,
              air_confidence_score = calculated_score.score,
              last_air_analysis = NOW(),
              bts_route_matches = calculated_score.routes
            FROM (
              SELECT 
                cp.id,
                GREATEST(
                  -- Base score from having ocean shipments
                  CASE WHEN ocean_count > 0 THEN 30 ELSE 0 END +
                  -- Bonus for matching HS codes with BTS routes
                  CASE WHEN bts_hs_matches > 0 THEN 25 ELSE 0 END +
                  -- Bonus for matching destinations
                  CASE WHEN dest_matches > 0 THEN 20 ELSE 0 END +
                  -- Bonus for high-value shipments (likely candidates for air)
                  CASE WHEN avg_value > 100000 THEN 15 ELSE 0 END +
                  -- Bonus for electronics/high-tech (common air cargo)
                  CASE WHEN cp.primary_industry ILIKE '%tech%' OR cp.primary_industry ILIKE '%electronic%' THEN 10 ELSE 0 END,
                  0
                ) as score,
                COALESCE(matching_routes.routes, '[]'::jsonb) as routes
              FROM company_profiles cp
              LEFT JOIN (
                SELECT 
                  company_name,
                  COUNT(*) as ocean_count,
                  AVG(value_usd) as avg_value,
                  COUNT(DISTINCT hs_code) as unique_hs_codes
                FROM ocean_shipments 
                GROUP BY company_name
              ) ocean_stats ON cp.company_name = ocean_stats.company_name
              LEFT JOIN (
                SELECT 
                  cp2.company_name,
                  COUNT(DISTINCT t100.id) as bts_hs_matches,
                  COUNT(DISTINCT dest_mapping.city) as dest_matches,
                  jsonb_agg(DISTINCT jsonb_build_object(
                    'origin_airport', t100.origin_airport,
                    'dest_airport', t100.dest_airport,
                    'carrier', t100.carrier,
                    'dest_city', dest_mapping.city,
                    'freight_kg', t100.freight_kg
                  )) as routes
                FROM company_profiles cp2
                JOIN ocean_shipments os ON cp2.company_name = os.company_name
                JOIN t100_air_segments t100 ON TRUE
                JOIN airport_city_mapping dest_mapping ON t100.dest_airport = dest_mapping.airport_code
                WHERE 
                  -- Match if destination city is similar
                  (dest_mapping.city ILIKE '%' || COALESCE(os.destination_city, '') || '%' 
                   OR COALESCE(os.destination_city, '') ILIKE '%' || dest_mapping.city || '%')
                  -- Or if HS codes suggest air-worthy cargo (electronics, machinery, etc.)
                  OR (os.hs_code LIKE '84%' OR os.hs_code LIKE '85%' OR os.hs_code LIKE '90%')
                GROUP BY cp2.company_name
              ) matching_routes ON cp.company_name = matching_routes.company_name
              LEFT JOIN (
                SELECT 
                  company_name,
                  COUNT(*) as bts_hs_matches,
                  COUNT(DISTINCT dest_city) as dest_matches
                FROM (
                  SELECT DISTINCT
                    os.company_name,
                    os.hs_code,
                    dest_mapping.city as dest_city
                  FROM ocean_shipments os
                  JOIN t100_air_segments t100 ON TRUE
                  JOIN airport_city_mapping dest_mapping ON t100.dest_airport = dest_mapping.airport_code
                  WHERE 
                    dest_mapping.city ILIKE '%' || COALESCE(os.destination_city, '') || '%'
                    OR COALESCE(os.destination_city, '') ILIKE '%' || dest_mapping.city || '%'
                ) matches
                GROUP BY company_name
              ) route_matches ON cp.company_name = route_matches.company_name
            ) calculated_score
            WHERE company_profiles.id = calculated_score.id;
          END;
          $$ LANGUAGE plpgsql;
        `
      });

      if (functionError) {
        console.error('Function creation error:', functionError);
        results.push({ step: 'air shipper probability function', status: 'error', error: functionError.message });
      } else {
        results.push({ step: 'air shipper probability function', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 'air shipper probability function', status: 'error', error: (error as Error).message });
    }

    // 5. Create view for air-ocean company intelligence
    try {
      console.log('Creating air-ocean intelligence view...');
      
      const { error: viewError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE VIEW air_ocean_company_intelligence AS
          SELECT 
            cp.id,
            cp.company_name,
            cp.normalized_name,
            cp.primary_industry,
            cp.headquarters_city,
            cp.headquarters_country,
            cp.likely_air_shipper,
            cp.air_confidence_score,
            cp.bts_route_matches,
            cp.last_air_analysis,
            
            -- Ocean shipment stats
            ocean_stats.total_ocean_shipments,
            ocean_stats.total_ocean_value,
            ocean_stats.avg_ocean_value,
            ocean_stats.last_ocean_shipment,
            
            -- Air route potential
            air_potential.potential_air_routes,
            air_potential.matching_airports,
            air_potential.total_bts_freight_kg,
            
            -- Combined intelligence score
            CASE 
              WHEN cp.air_confidence_score >= 80 AND ocean_stats.total_ocean_shipments >= 5 THEN 'High Probability Air+Ocean'
              WHEN cp.air_confidence_score >= 60 AND ocean_stats.total_ocean_shipments >= 2 THEN 'Medium Probability Air+Ocean'
              WHEN cp.air_confidence_score >= 40 THEN 'Low Probability Air Shipper'
              WHEN ocean_stats.total_ocean_shipments >= 10 THEN 'Ocean Only (High Volume)'
              WHEN ocean_stats.total_ocean_shipments >= 1 THEN 'Ocean Only (Low Volume)'
              ELSE 'Unknown Shipping Pattern'
            END as shipping_intelligence_level
            
          FROM company_profiles cp
          LEFT JOIN (
            SELECT 
              company_name,
              COUNT(*) as total_ocean_shipments,
              SUM(value_usd) as total_ocean_value,
              AVG(value_usd) as avg_ocean_value,
              MAX(arrival_date) as last_ocean_shipment
            FROM ocean_shipments
            GROUP BY company_name
          ) ocean_stats ON cp.company_name = ocean_stats.company_name
          LEFT JOIN (
            SELECT 
              cp2.company_name,
              COUNT(DISTINCT t100.dest_airport) as potential_air_routes,
              COUNT(DISTINCT dest_mapping.city) as matching_airports,
              SUM(t100.freight_kg) as total_bts_freight_kg
            FROM company_profiles cp2
            JOIN ocean_shipments os ON cp2.company_name = os.company_name
            JOIN t100_air_segments t100 ON TRUE
            JOIN airport_city_mapping dest_mapping ON t100.dest_airport = dest_mapping.airport_code
            WHERE 
              dest_mapping.city ILIKE '%' || COALESCE(os.destination_city, '') || '%'
              OR COALESCE(os.destination_city, '') ILIKE '%' || dest_mapping.city || '%'
            GROUP BY cp2.company_name
          ) air_potential ON cp.company_name = air_potential.company_name
          
          WHERE cp.company_name IS NOT NULL
          ORDER BY cp.air_confidence_score DESC, ocean_stats.total_ocean_value DESC;
        `
      });

      if (viewError) {
        console.error('View creation error:', viewError);
        results.push({ step: 'air_ocean_company_intelligence view', status: 'error', error: viewError.message });
      } else {
        results.push({ step: 'air_ocean_company_intelligence view', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 'air_ocean_company_intelligence view', status: 'error', error: (error as Error).message });
    }

    // 6. Insert sample BTS data for testing
    try {
      console.log('Inserting sample BTS T-100 data...');
      
      const sampleData = [
        { origin: 'ICN', dest: 'ORD', carrier: 'Korean Air Cargo', freight_kg: 125000, mail_kg: 2500, month: 12, year: 2024 },
        { origin: 'ICN', dest: 'LAX', carrier: 'Korean Air Cargo', freight_kg: 98000, mail_kg: 1800, month: 12, year: 2024 },
        { origin: 'PVG', dest: 'LAX', carrier: 'China Cargo Airlines', freight_kg: 215000, mail_kg: 3200, month: 12, year: 2024 },
        { origin: 'PVG', dest: 'JFK', carrier: 'China Cargo Airlines', freight_kg: 187000, mail_kg: 2900, month: 12, year: 2024 },
        { origin: 'NRT', dest: 'LAX', carrier: 'All Nippon Airways', freight_kg: 156000, mail_kg: 2100, month: 12, year: 2024 },
        { origin: 'FRA', dest: 'JFK', carrier: 'Lufthansa Cargo', freight_kg: 198000, mail_kg: 2800, month: 12, year: 2024 },
        { origin: 'AMS', dest: 'LAX', carrier: 'KLM Cargo', freight_kg: 134000, mail_kg: 1700, month: 12, year: 2024 },
        { origin: 'SIN', dest: 'LAX', carrier: 'Singapore Airlines Cargo', freight_kg: 178000, mail_kg: 2400, month: 12, year: 2024 },
        { origin: 'HKG', dest: 'LAX', carrier: 'Cathay Pacific Cargo', freight_kg: 201000, mail_kg: 2700, month: 12, year: 2024 },
        { origin: 'LHR', dest: 'JFK', carrier: 'British Airways World Cargo', freight_kg: 123000, mail_kg: 1900, month: 12, year: 2024 }
      ];

      const { error: insertError } = await supabase
        .from('t100_air_segments')
        .upsert(sampleData, { onConflict: 'origin_airport,dest_airport,carrier,month,year' });

      if (insertError) {
        console.error('Sample data insert error:', insertError);
        results.push({ step: 'sample BTS data', status: 'error', error: insertError.message });
      } else {
        results.push({ step: 'sample BTS data', status: 'success', recordsInserted: sampleData.length });
      }
    } catch (error) {
      results.push({ step: 'sample BTS data', status: 'error', error: (error as Error).message });
    }

    // 7. Run initial air shipper probability calculation
    try {
      console.log('Running initial air shipper probability calculation...');
      
      const { error: calcError } = await supabase.rpc('update_air_shipper_probabilities');

      if (calcError) {
        console.error('Probability calculation error:', calcError);
        results.push({ step: 'initial probability calculation', status: 'error', error: calcError.message });
      } else {
        results.push({ step: 'initial probability calculation', status: 'success' });
      }
    } catch (error) {
      results.push({ step: 'initial probability calculation', status: 'error', error: (error as Error).message });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: errorCount === 0,
      message: `BTS T-100 schema initialization completed. ${successCount} steps successful, ${errorCount} errors.`,
      details: results,
      summary: {
        totalSteps: results.length,
        successful: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('BTS schema initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize BTS schema', details: (error as Error).message },
      { status: 500 }
    );
  }
}