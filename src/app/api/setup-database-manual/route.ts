import { NextResponse } from 'next/server';

export async function GET() {
  const sqlCommands = `
-- =============================================================================
-- LOGISTIC INTEL SUPABASE DATABASE SETUP
-- =============================================================================
-- Run these commands in your Supabase SQL Editor
-- (Project Settings > SQL Editor > New Query)

-- 1. Core CRM and User Tables
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  created_at timestamp default now()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text,
  tradelane text,
  industry text,
  status text default 'draft',
  created_at timestamp default now()
);

-- Contacts (CRM)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id),
  full_name text,
  email text,
  phone text,
  company text,
  title text,
  linkedin text,
  persona jsonb, -- Store AI-generated persona data
  created_at timestamp default now()
);

-- Outreach Logs
CREATE TABLE IF NOT EXISTS outreach_logs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id),
  channel text, -- "email", "linkedin", "phone"
  action text,  -- "viewed", "clicked", "replied"
  timestamp timestamp default now()
);

-- Personas
CREATE TABLE IF NOT EXISTS personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  industry text,
  segment text,
  tone text,
  key_challenges text,
  preferred_channels text,
  created_at timestamp default now()
);

-- 2. Trade Intelligence Tables
-- =============================================================================

-- Census Trade Data (US Import/Export Data)
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

-- BTS T-100 Air Cargo Data
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

-- Company Profiles (for Air Shipper Analysis)
CREATE TABLE IF NOT EXISTS company_profiles (
  id uuid primary key default gen_random_uuid(),
  company_name TEXT NOT NULL,
  normalized_name TEXT,
  primary_industry TEXT,
  headquarters_city TEXT,
  headquarters_country TEXT,
  likely_air_shipper BOOLEAN DEFAULT FALSE,
  air_confidence_score INT DEFAULT 0,
  last_air_analysis TIMESTAMP,
  bts_route_matches JSONB DEFAULT '[]'::jsonb,
  air_match BOOLEAN DEFAULT FALSE,
  air_match_score DECIMAL(5,2) DEFAULT 0,
  ocean_match BOOLEAN DEFAULT FALSE,
  ocean_match_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ocean Shipments (for matching with air data)
CREATE TABLE IF NOT EXISTS ocean_shipments (
  id uuid primary key default gen_random_uuid(),
  company_name TEXT NOT NULL,
  hs_code TEXT,
  destination_city TEXT,
  value_usd DECIMAL(15,2),
  weight_kg DECIMAL(12,2),
  arrival_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Airport City Mapping
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

-- 3. Follow-Up Campaign System
-- =============================================================================

-- Follow-Up Rules
CREATE TABLE IF NOT EXISTS follow_up_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  rule_name text not null,
  trigger_type text not null, -- 'email_opened', 'email_clicked', 'no_response', 'linkedin_viewed'
  delay_hours int default 24,
  max_attempts int default 3,
  is_active boolean default true,
  created_at timestamp default now()
);

-- Follow-Up Steps (sequence definition)
CREATE TABLE IF NOT EXISTS follow_up_steps (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references follow_up_rules(id),
  step_order int not null,
  channel text not null, -- 'email', 'linkedin', 'phone'
  message_template text,
  subject_template text,
  delay_from_previous int default 48, -- hours
  created_at timestamp default now()
);

-- Follow-Up Executions (actual executions)
CREATE TABLE IF NOT EXISTS follow_up_executions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id),
  rule_id uuid references follow_up_rules(id),
  step_id uuid references follow_up_steps(id),
  status text default 'pending', -- 'pending', 'sent', 'failed', 'skipped'
  scheduled_at timestamp,
  executed_at timestamp,
  response_received boolean default false,
  error_message text,
  created_at timestamp default now()
);

-- Campaign Follow-Ups (link campaigns to follow-up rules)
CREATE TABLE IF NOT EXISTS campaign_follow_ups (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns(id),
  rule_id uuid references follow_up_rules(id),
  is_active boolean default true,
  created_at timestamp default now()
);

-- 4. Performance Indexes
-- =============================================================================

-- Census Trade Data Indexes
CREATE INDEX IF NOT EXISTS idx_census_transport_mode ON census_trade_data(transport_mode);
CREATE INDEX IF NOT EXISTS idx_census_year_month ON census_trade_data(year, month);
CREATE INDEX IF NOT EXISTS idx_census_commodity ON census_trade_data(commodity);
CREATE INDEX IF NOT EXISTS idx_census_value ON census_trade_data(value_usd DESC);
CREATE INDEX IF NOT EXISTS idx_census_state ON census_trade_data(state);
CREATE INDEX IF NOT EXISTS idx_census_country ON census_trade_data(country);

-- BTS T-100 Indexes
CREATE INDEX IF NOT EXISTS idx_t100_origin_dest ON t100_air_segments(origin_airport, dest_airport);
CREATE INDEX IF NOT EXISTS idx_t100_carrier ON t100_air_segments(carrier);
CREATE INDEX IF NOT EXISTS idx_t100_date ON t100_air_segments(year, month);
CREATE INDEX IF NOT EXISTS idx_t100_freight ON t100_air_segments(freight_kg DESC);

-- Company Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_company_air_shipper ON company_profiles(likely_air_shipper, air_confidence_score);
CREATE INDEX IF NOT EXISTS idx_company_name ON company_profiles(company_name);

-- 5. Sample Data Inserts
-- =============================================================================

-- Sample Users
INSERT INTO users (email, name) VALUES
('john@acme.com', 'John Smith'),
('sarah@globaltrade.com', 'Sarah Chen'),
('mike@logistics.com', 'Mike Johnson')
ON CONFLICT (email) DO NOTHING;

-- Sample Airport Mappings
INSERT INTO airport_city_mapping (airport_code, city, state, country, region) VALUES
('ORD', 'Chicago', 'IL', 'USA', 'North America'),
('LAX', 'Los Angeles', 'CA', 'USA', 'North America'),
('JFK', 'New York', 'NY', 'USA', 'North America'),
('MIA', 'Miami', 'FL', 'USA', 'North America'),
('ICN', 'Seoul', NULL, 'South Korea', 'Asia'),
('PVG', 'Shanghai', NULL, 'China', 'Asia'),
('NRT', 'Tokyo', NULL, 'Japan', 'Asia'),
('FRA', 'Frankfurt', NULL, 'Germany', 'Europe'),
('AMS', 'Amsterdam', NULL, 'Netherlands', 'Europe'),
('LHR', 'London', NULL, 'United Kingdom', 'Europe')
ON CONFLICT (airport_code) DO NOTHING;

-- Sample Census Trade Data
INSERT INTO census_trade_data (commodity, commodity_name, value_usd, weight_kg, year, month, state, country, transport_mode) VALUES
('8471600000', 'Computer processing units and controllers', 2400000, 15000, 2024, 12, 'CA', 'South Korea', '40'),
('8528720000', 'LCD monitors and display units', 1850000, 12500, 2024, 12, 'IL', 'South Korea', '40'),
('8518300000', 'Audio equipment and headphones', 920000, 8200, 2024, 12, 'CA', 'Japan', '40'),
('9018390000', 'Medical and surgical instruments', 1200000, 5500, 2024, 12, 'MN', 'Germany', '40'),
('8471700000', 'Computer storage units and drives', 680000, 45000, 2024, 12, 'CA', 'Thailand', '20'),
('8471600000', 'Computer processing units and controllers', 1100000, 32000, 2024, 12, 'TX', 'China', '20'),
('8528720000', 'LCD monitors and display units', 950000, 28000, 2024, 12, 'NY', 'South Korea', '20');

-- Sample BTS T-100 Data
INSERT INTO t100_air_segments (origin_airport, dest_airport, carrier, freight_kg, mail_kg, month, year) VALUES
('ICN', 'ORD', 'Korean Air Cargo', 125000, 2500, 12, 2024),
('ICN', 'LAX', 'Korean Air Cargo', 98000, 1800, 12, 2024),
('PVG', 'LAX', 'China Cargo Airlines', 215000, 3200, 12, 2024),
('PVG', 'JFK', 'China Cargo Airlines', 187000, 2900, 12, 2024),
('NRT', 'LAX', 'All Nippon Airways', 156000, 2100, 12, 2024),
('FRA', 'JFK', 'Lufthansa Cargo', 198000, 2800, 12, 2024),
('AMS', 'LAX', 'KLM Cargo', 134000, 1700, 12, 2024);

-- Sample Company Profiles
INSERT INTO company_profiles (company_name, normalized_name, primary_industry, headquarters_city, headquarters_country) VALUES
('Samsung Electronics', 'samsung-electronics', 'Technology', 'Seoul', 'South Korea'),
('LG Electronics', 'lg-electronics', 'Technology', 'Seoul', 'South Korea'),
('Sony Corporation', 'sony-corporation', 'Technology', 'Tokyo', 'Japan');

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- After running these commands, your Logistic Intel database will be ready.
-- You can test the setup by checking that all tables exist in your Supabase dashboard.
`;

  return NextResponse.json({
    success: true,
    message: "Database setup SQL commands generated successfully",
    instructions: [
      "1. Copy the SQL commands below",
      "2. Go to your Supabase project dashboard",
      "3. Navigate to SQL Editor (in the left sidebar)",
      "4. Create a new query",
      "5. Paste all the SQL commands",
      "6. Click 'Run' to execute",
      "7. Verify tables are created in the Table Editor"
    ],
    sql_commands: sqlCommands,
    tables_created: [
      "users", "campaigns", "contacts", "outreach_logs", "personas",
      "census_trade_data", "t100_air_segments", "company_profiles", 
      "ocean_shipments", "airport_city_mapping", "follow_up_rules",
      "follow_up_steps", "follow_up_executions", "campaign_follow_ups"
    ],
    note: "These commands create all the tables and sample data needed for Logistic Intel. Run them once in your Supabase SQL Editor."
  });
}

export async function POST() {
  // Same as GET for convenience
  return GET();
}