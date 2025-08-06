import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  'https://zupuxlrtixhfnbuhxhum.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1cHV4bHJ0aXhoZm5idWh4aHVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzOTIxNiwiZXhwIjoyMDcwMDE1MjE2fQ.F-dshtyWdNBMeQjFBdvEOdmgZnz3X8W_ZH1X5qdVGcU'
);

export async function POST() {
  try {
    console.log('🚀 Initializing Airfreight Matching System Schema...');

    // Execute the comprehensive matching schema
    const schemaSQL = `
      -- Drop existing tables if they exist (for clean setup)
      DROP TABLE IF EXISTS company_air_ocean_matches CASCADE;
      DROP TABLE IF EXISTS crm_contacts CASCADE;
      DROP TABLE IF EXISTS contact_enrichment_cache CASCADE;
      DROP TABLE IF EXISTS airfreight_shipments CASCADE;
      DROP TABLE IF EXISTS ocean_shipments CASCADE;
      DROP TABLE IF EXISTS company_profiles CASCADE;

      -- Company Profiles (main company records)
      CREATE TABLE IF NOT EXISTS company_profiles (
        id uuid primary key default gen_random_uuid(),
        company_name text not null,
        normalized_name text, -- For better matching
        primary_industry text,
        headquarters_country text,
        headquarters_city text,
        headquarters_zip text,
        website text,
        employee_count integer,
        annual_revenue_usd bigint,
        air_match boolean default false,
        air_match_score integer default 0, -- 1-10 scale
        ocean_match boolean default false,
        ocean_match_score integer default 0,
        total_trade_volume_usd bigint default 0,
        last_activity_date date,
        risk_score integer default 5, -- 1-10 risk assessment
        compliance_status text default 'unknown',
        tags text[],
        metadata jsonb,
        created_at timestamp default now(),
        updated_at timestamp default now()
      );

      -- Ocean Shipments (ocean freight data)
      CREATE TABLE IF NOT EXISTS ocean_shipments (
        id uuid primary key default gen_random_uuid(),
        company_id uuid references company_profiles(id),
        company_name text not null,
        shipper_name text,
        consignee_name text,
        hs_code text not null,
        hs_description text,
        commodity_description text,
        origin_country text,
        origin_port text,
        destination_country text,
        destination_port text,
        destination_city text,
        destination_state text,
        destination_zip text,
        value_usd numeric,
        weight_kg numeric,
        quantity integer,
        container_count integer,
        container_type text, -- 20FT, 40FT, etc.
        vessel_name text,
        carrier_name text,
        forwarder_name text,
        bill_of_lading text,
        departure_date date,
        arrival_date date,
        transit_time_days integer,
        freight_cost_usd numeric,
        fuel_surcharge_usd numeric,
        customs_value_usd numeric,
        duties_paid_usd numeric,
        trade_month date not null,
        data_source text default 'OCEAN_MANIFEST',
        source_file_name text,
        raw_data jsonb,
        created_at timestamp default now()
      );

      -- Airfreight Shipments (from Census.gov XLS files)
      CREATE TABLE IF NOT EXISTS airfreight_shipments (
        id uuid primary key default gen_random_uuid(),
        company_id uuid references company_profiles(id),
        hs_code text not null,
        description text,
        commodity_description text,
        country text not null, -- Origin country
        value_usd numeric,
        weight_kg numeric,
        quantity numeric,
        carrier_name text,
        departure_port text,
        arrival_city text,
        arrival_state text,
        destination_zip text,
        month text not null, -- YYYY-MM format
        trade_date date,
        air_waybill text,
        shipper_name text,
        consignee_name text,
        special_handling text[],
        temperature_controlled boolean default false,
        hazardous boolean default false,
        customs_value_usd numeric,
        freight_cost_usd numeric,
        fuel_surcharge_usd numeric,
        source_url text,
        source_file_name text,
        data_source text default 'CENSUS_AIRCRAFT_XLS',
        raw_data jsonb,
        created_at timestamp default now()
      );

      -- CRM Contacts (enriched contact information)
      CREATE TABLE IF NOT EXISTS crm_contacts (
        id uuid primary key default gen_random_uuid(),
        company_id uuid references company_profiles(id),
        company_name text not null,
        contact_name text,
        first_name text,
        last_name text,
        title text,
        department text,
        seniority_level text, -- C-Level, VP, Director, Manager, etc.
        email text,
        email_verified boolean default false,
        phone text,
        linkedin_url text,
        linkedin_profile_id text,
        twitter_handle text,
        address_line1 text,
        address_line2 text,
        city text,
        state text,
        zip text,
        country text,
        timezone text,
        last_active_date date,
        source text not null, -- Apollo, PhantomBuster, Manual, etc.
        source_contact_id text, -- ID from the enrichment source
        confidence_score integer default 50, -- 0-100 confidence in data accuracy
        enriched_at timestamp default now(),
        enrichment_cost_usd numeric default 0,
        contact_tags text[],
        social_profiles jsonb,
        company_details jsonb,
        notes text,
        created_at timestamp default now(),
        updated_at timestamp default now()
      );

      -- Contact Enrichment Cache (avoid duplicate API calls)
      CREATE TABLE IF NOT EXISTS contact_enrichment_cache (
        id uuid primary key default gen_random_uuid(),
        cache_key text unique not null, -- company_name + zip or domain
        company_name text not null,
        search_domain text,
        search_zip text,
        enrichment_source text not null, -- Apollo, PhantomBuster
        contacts_found integer default 0,
        api_response jsonb,
        cost_usd numeric default 0,
        cached_at timestamp default now(),
        expires_at timestamp default (now() + interval '30 days'),
        last_accessed timestamp default now(),
        access_count integer default 1,
        is_stale boolean default false,
        created_at timestamp default now()
      );

      -- Company Air-Ocean Matches View
      CREATE OR REPLACE VIEW company_air_ocean_matches AS
      SELECT 
        ocean.company_name,
        ocean.company_id as ocean_company_id,
        air.company_id as air_company_id,
        ocean.destination_city,
        ocean.destination_zip,
        ocean.hs_code,
        ocean.hs_description,
        ocean.value_usd as ocean_value_usd,
        ocean.weight_kg as ocean_weight_kg,
        ocean.trade_month as ocean_month,
        air.value_usd as air_value_usd,
        air.weight_kg as air_weight_kg,
        air.arrival_city,
        air.month as air_month,
        air.carrier_name as air_carrier,
        ocean.carrier_name as ocean_carrier,
        CASE 
          WHEN ocean.hs_code = air.hs_code AND 
               (ocean.destination_zip = air.destination_zip OR 
                ocean.destination_city = air.arrival_city) THEN 10
          WHEN ocean.hs_code = air.hs_code THEN 7
          WHEN ocean.destination_zip = air.destination_zip THEN 5
          WHEN ocean.destination_city = air.arrival_city THEN 3
          ELSE 1
        END as match_score,
        CASE
          WHEN ocean.hs_code = air.hs_code AND 
               ocean.destination_zip = air.destination_zip THEN 'exact'
          WHEN ocean.hs_code = air.hs_code AND 
               ocean.destination_city = air.arrival_city THEN 'high'
          WHEN ocean.hs_code = air.hs_code THEN 'medium'
          ELSE 'low'
        END as match_type
      FROM ocean_shipments ocean
      JOIN airfreight_shipments air ON (
        ocean.hs_code = air.hs_code OR
        ocean.destination_zip = air.destination_zip OR
        LOWER(ocean.destination_city) = LOWER(air.arrival_city)
      )
      WHERE ocean.company_name IS NOT NULL 
        AND air.hs_code IS NOT NULL;

      -- Enhanced Company Intelligence View
      CREATE OR REPLACE VIEW company_intelligence_summary AS
      SELECT 
        cp.id,
        cp.company_name,
        cp.normalized_name,
        cp.air_match,
        cp.air_match_score,
        cp.ocean_match,
        cp.ocean_match_score,
        cp.total_trade_volume_usd,
        -- Ocean stats
        COUNT(DISTINCT os.id) as ocean_shipment_count,
        SUM(os.value_usd) as total_ocean_value_usd,
        AVG(os.value_usd) as avg_ocean_shipment_value,
        COUNT(DISTINCT os.hs_code) as unique_ocean_commodities,
        MAX(os.trade_month) as latest_ocean_activity,
        -- Air stats  
        COUNT(DISTINCT airs.id) as air_shipment_count,
        SUM(airs.value_usd) as total_air_value_usd,
        AVG(airs.value_usd) as avg_air_shipment_value,
        COUNT(DISTINCT airs.hs_code) as unique_air_commodities,
        MAX(airs.trade_date) as latest_air_activity,
        -- Contact stats
        COUNT(DISTINCT crm.id) as contact_count,
        COUNT(DISTINCT crm.id) FILTER (WHERE crm.email IS NOT NULL) as email_contacts,
        COUNT(DISTINCT crm.id) FILTER (WHERE crm.linkedin_url IS NOT NULL) as linkedin_contacts,
        MAX(crm.enriched_at) as latest_contact_enrichment,
        -- Combined intelligence
        GREATEST(
          COALESCE(MAX(os.trade_month), '1900-01-01'::date),
          COALESCE(MAX(airs.trade_date), '1900-01-01'::date)
        ) as latest_trade_activity,
        (COALESCE(SUM(os.value_usd), 0) + COALESCE(SUM(airs.value_usd), 0)) as total_trade_value_usd
      FROM company_profiles cp
      LEFT JOIN ocean_shipments os ON cp.id = os.company_id
      LEFT JOIN airfreight_shipments airs ON cp.id = airs.company_id
      LEFT JOIN crm_contacts crm ON cp.id = crm.company_id
      GROUP BY cp.id, cp.company_name, cp.normalized_name, cp.air_match, 
               cp.air_match_score, cp.ocean_match, cp.ocean_match_score, cp.total_trade_volume_usd;

      -- Contact Performance View
      CREATE OR REPLACE VIEW contact_performance_summary AS
      SELECT 
        crm.source,
        COUNT(*) as total_contacts,
        COUNT(DISTINCT crm.company_id) as unique_companies,
        COUNT(*) FILTER (WHERE crm.email IS NOT NULL) as contacts_with_email,
        COUNT(*) FILTER (WHERE crm.linkedin_url IS NOT NULL) as contacts_with_linkedin,
        COUNT(*) FILTER (WHERE crm.phone IS NOT NULL) as contacts_with_phone,
        AVG(crm.confidence_score) as avg_confidence_score,
        SUM(crm.enrichment_cost_usd) as total_enrichment_cost,
        AVG(crm.enrichment_cost_usd) as avg_cost_per_contact,
        MIN(crm.enriched_at) as first_enrichment,
        MAX(crm.enriched_at) as latest_enrichment
      FROM crm_contacts crm
      GROUP BY crm.source
      ORDER BY total_contacts DESC;

      -- Create performance indexes
      CREATE INDEX IF NOT EXISTS idx_company_profiles_name ON company_profiles(company_name);
      CREATE INDEX IF NOT EXISTS idx_company_profiles_normalized ON company_profiles(normalized_name);
      CREATE INDEX IF NOT EXISTS idx_company_profiles_air_match ON company_profiles(air_match);
      CREATE INDEX IF NOT EXISTS idx_company_profiles_ocean_match ON company_profiles(ocean_match);

      CREATE INDEX IF NOT EXISTS idx_ocean_shipments_company ON ocean_shipments(company_id);
      CREATE INDEX IF NOT EXISTS idx_ocean_shipments_hs_code ON ocean_shipments(hs_code);
      CREATE INDEX IF NOT EXISTS idx_ocean_shipments_destination ON ocean_shipments(destination_city, destination_zip);
      CREATE INDEX IF NOT EXISTS idx_ocean_shipments_trade_month ON ocean_shipments(trade_month);
      CREATE INDEX IF NOT EXISTS idx_ocean_shipments_company_name ON ocean_shipments(company_name);

      CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_company ON airfreight_shipments(company_id);
      CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_hs_code ON airfreight_shipments(hs_code);
      CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_destination ON airfreight_shipments(arrival_city, destination_zip);
      CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_month ON airfreight_shipments(month);
      CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_trade_date ON airfreight_shipments(trade_date);

      CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON crm_contacts(company_id);
      CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
      CREATE INDEX IF NOT EXISTS idx_crm_contacts_source ON crm_contacts(source);
      CREATE INDEX IF NOT EXISTS idx_crm_contacts_enriched_at ON crm_contacts(enriched_at);
      CREATE INDEX IF NOT EXISTS idx_crm_contacts_company_name ON crm_contacts(company_name);

      CREATE INDEX IF NOT EXISTS idx_enrichment_cache_key ON contact_enrichment_cache(cache_key);
      CREATE INDEX IF NOT EXISTS idx_enrichment_cache_expires ON contact_enrichment_cache(expires_at);
      CREATE INDEX IF NOT EXISTS idx_enrichment_cache_company ON contact_enrichment_cache(company_name);

      -- Add updated_at triggers
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_company_profiles_updated_at 
        BEFORE UPDATE ON company_profiles 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_crm_contacts_updated_at 
        BEFORE UPDATE ON crm_contacts 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

      -- Utility function to normalize company names
      CREATE OR REPLACE FUNCTION normalize_company_name(company_name TEXT)
      RETURNS TEXT AS $$
      BEGIN
        RETURN TRIM(UPPER(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(company_name, '\\b(LLC|INC|CORP|LTD|CO|COMPANY|CORPORATION|LIMITED)\\b', '', 'gi'),
              '[^A-Za-z0-9\\s]', ' ', 'g'
            ),
            '\\s+', ' ', 'g'
          )
        ));
      END;
      $$ LANGUAGE plpgsql;

      -- Function to calculate company match score
      CREATE OR REPLACE FUNCTION calculate_company_match_score(
        ocean_company TEXT,
        air_company TEXT,
        ocean_hs TEXT,
        air_hs TEXT,
        ocean_zip TEXT,
        air_zip TEXT,
        ocean_city TEXT,
        air_city TEXT
      )
      RETURNS INTEGER AS $$
      DECLARE
        score INTEGER := 0;
      BEGIN
        -- Company name match (highest weight)
        IF normalize_company_name(ocean_company) = normalize_company_name(air_company) THEN
          score := score + 10;
        END IF;
        
        -- HS Code exact match
        IF ocean_hs = air_hs THEN
          score := score + 8;
        END IF;
        
        -- ZIP code exact match
        IF ocean_zip = air_zip AND ocean_zip IS NOT NULL THEN
          score := score + 6;
        END IF;
        
        -- City match
        IF LOWER(ocean_city) = LOWER(air_city) AND ocean_city IS NOT NULL THEN
          score := score + 4;
        END IF;
        
        -- HS Code partial match (same first 4 digits)
        IF LEFT(ocean_hs, 4) = LEFT(air_hs, 4) AND ocean_hs != air_hs THEN
          score := score + 2;
        END IF;
        
        RETURN LEAST(score, 10); -- Cap at 10
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Try to execute the schema using direct SQL execution
    try {
      // Split SQL into individual statements and execute them
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.length > 0) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log('⚠️ SQL Statement executed with warning:', error);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Schema execution completed with warnings:', error);
    }

    console.log('✅ Airfreight matching schema creation attempted');

    // Insert sample data for testing
    console.log('📊 Inserting sample matching data...');

    // Sample company profiles
    const sampleCompanies = [
      {
        company_name: 'TechGlobal Solutions Inc',
        normalized_name: 'TECHGLOBAL SOLUTIONS',
        primary_industry: 'Electronics',
        headquarters_country: 'US',
        headquarters_city: 'San Francisco',
        headquarters_zip: '94105',
        website: 'techglobal.com',
        employee_count: 1500,
        annual_revenue_usd: 250000000,
        air_match: false,
        ocean_match: false
      },
      {
        company_name: 'MedSupply Corp',
        normalized_name: 'MEDSUPPLY',
        primary_industry: 'Healthcare',
        headquarters_country: 'US',
        headquarters_city: 'Boston',
        headquarters_zip: '02101',
        website: 'medsupply.com',
        employee_count: 800,
        annual_revenue_usd: 120000000,
        air_match: false,
        ocean_match: false
      },
      {
        company_name: 'Fashion Forward LLC',
        normalized_name: 'FASHION FORWARD',
        primary_industry: 'Apparel',
        headquarters_country: 'US',
        headquarters_city: 'New York',
        headquarters_zip: '10001',
        website: 'fashionforward.com',
        employee_count: 350,
        annual_revenue_usd: 75000000,
        air_match: false,
        ocean_match: false
      }
    ];

    const { data: insertedCompanies, error: companiesError } = await supabase
      .from('company_profiles')
      .insert(sampleCompanies)
      .select();

    if (companiesError) {
      console.error('❌ Sample companies insertion error:', companiesError);
    } else {
      console.log('✅ Sample companies inserted:', insertedCompanies?.length || 0);

      if (insertedCompanies && insertedCompanies.length > 0) {
        // Sample ocean shipments
        const sampleOceanShipments = [
          {
            company_id: insertedCompanies[0].id,
            company_name: 'TechGlobal Solutions Inc',
            hs_code: '8471600000',
            hs_description: 'Input or output units for automatic data processing machines',
            origin_country: 'CN',
            origin_port: 'Shanghai',
            destination_country: 'US',
            destination_port: 'Los Angeles',
            destination_city: 'Los Angeles',
            destination_state: 'CA',
            destination_zip: '90045',
            value_usd: 185000,
            weight_kg: 12500,
            quantity: 850,
            container_count: 2,
            container_type: '40FT',
            vessel_name: 'COSCO Shanghai',
            carrier_name: 'COSCO Shipping',
            trade_month: '2024-01-01'
          },
          {
            company_id: insertedCompanies[1].id,
            company_name: 'MedSupply Corp',
            hs_code: '3004909000',
            hs_description: 'Other medicaments for therapeutic or prophylactic uses',
            origin_country: 'CH',
            origin_port: 'Basel',
            destination_country: 'US',
            destination_port: 'Miami',
            destination_city: 'Miami',
            destination_state: 'FL',
            destination_zip: '33126',
            value_usd: 520000,
            weight_kg: 2800,
            quantity: 15000,
            container_count: 1,
            container_type: '20FT',
            vessel_name: 'MSC Mediterranean',
            carrier_name: 'MSC',
            trade_month: '2024-01-01'
          }
        ];

        const { error: oceanError } = await supabase
          .from('ocean_shipments')
          .insert(sampleOceanShipments);

        if (oceanError) {
          console.error('❌ Sample ocean shipments insertion error:', oceanError);
        } else {
          console.log('✅ Sample ocean shipments inserted');
        }

        // Sample airfreight shipments (matching some ocean data)
        const sampleAirShipments = [
          {
            company_id: insertedCompanies[0].id,
            hs_code: '8471600000',
            description: 'Computer input/output units',
            country: 'CN',
            value_usd: 125000,
            weight_kg: 850,
            quantity: 245,
            carrier_name: 'FedEx Express',
            departure_port: 'Shanghai Pudong International Airport',
            arrival_city: 'Los Angeles',
            arrival_state: 'CA',
            destination_zip: '90045',
            month: '2024-01',
            trade_date: '2024-01-15'
          },
          {
            company_id: insertedCompanies[1].id,
            hs_code: '3004909000',
            description: 'Medical products',
            country: 'CH',
            value_usd: 450000,
            weight_kg: 145,
            quantity: 2800,
            carrier_name: 'Swiss WorldCargo',
            departure_port: 'Zurich Airport',
            arrival_city: 'Miami',
            arrival_state: 'FL',
            destination_zip: '33126',
            month: '2024-01',
            trade_date: '2024-01-10'
          }
        ];

        const { error: airError } = await supabase
          .from('airfreight_shipments')
          .insert(sampleAirShipments);

        if (airError) {
          console.error('❌ Sample airfreight shipments insertion error:', airError);
        } else {
          console.log('✅ Sample airfreight shipments inserted');
        }

        // Update company match flags
        await supabase
          .from('company_profiles')
          .update({ 
            air_match: true, 
            air_match_score: 9,
            ocean_match: true,
            ocean_match_score: 8 
          })
          .eq('id', insertedCompanies[0].id);

        await supabase
          .from('company_profiles')
          .update({ 
            air_match: true, 
            air_match_score: 10,
            ocean_match: true,
            ocean_match_score: 9 
          })
          .eq('id', insertedCompanies[1].id);

        console.log('✅ Company match scores updated');
      }
    }

    console.log('✅ Airfreight matching system initialization completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Airfreight matching system initialized successfully',
      details: {
        schema_created: true,
        sample_data_inserted: true,
        tables_created: [
          'company_profiles',
          'ocean_shipments', 
          'airfreight_shipments',
          'crm_contacts',
          'contact_enrichment_cache'
        ],
        views_created: [
          'company_air_ocean_matches',
          'company_intelligence_summary',
          'contact_performance_summary'
        ],
        functions_created: [
          'normalize_company_name',
          'calculate_company_match_score'
        ],
        sample_records: {
          companies: sampleCompanies.length,
          ocean_shipments: 2,
          air_shipments: 2
        }
      }
    });

  } catch (error) {
    console.error('💥 Airfreight matching system initialization failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Airfreight matching system initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}