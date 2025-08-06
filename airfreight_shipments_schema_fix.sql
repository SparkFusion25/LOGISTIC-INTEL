-- =====================================================
-- CRITICAL SCHEMA FIX: airfreight_shipments Table
-- =====================================================
-- This adds all missing columns expected by XML ingestion

-- First, check if table exists, create if not
CREATE TABLE IF NOT EXISTS public.airfreight_shipments (
    id BIGSERIAL PRIMARY KEY
);

-- Add missing columns to airfreight_shipments table
-- Core identification
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS shipment_id TEXT,
ADD COLUMN IF NOT EXISTS raw_xml_filename TEXT,
ADD COLUMN IF NOT EXISTS awb_number TEXT;

-- Company information
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS consignee_name TEXT,
ADD COLUMN IF NOT EXISTS consignee_city TEXT,
ADD COLUMN IF NOT EXISTS consignee_state TEXT,
ADD COLUMN IF NOT EXISTS consignee_zip TEXT,
ADD COLUMN IF NOT EXISTS consignee_country TEXT,
ADD COLUMN IF NOT EXISTS shipper_name TEXT,
ADD COLUMN IF NOT EXISTS shipper_city TEXT,
ADD COLUMN IF NOT EXISTS shipper_state TEXT,
ADD COLUMN IF NOT EXISTS shipper_zip TEXT,
ADD COLUMN IF NOT EXISTS shipper_country TEXT;

-- Geographic data (airports for air freight)
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS origin_country TEXT,
ADD COLUMN IF NOT EXISTS destination_country TEXT,
ADD COLUMN IF NOT EXISTS destination_city TEXT,
ADD COLUMN IF NOT EXISTS destination_airport TEXT,
ADD COLUMN IF NOT EXISTS origin_airport TEXT,
ADD COLUMN IF NOT EXISTS departure_airport TEXT,
ADD COLUMN IF NOT EXISTS arrival_airport TEXT;

-- Commodity data
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS hs_code TEXT,
ADD COLUMN IF NOT EXISTS commodity_description TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS product_description TEXT;

-- Financial data
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS value_usd NUMERIC,
ADD COLUMN IF NOT EXISTS freight_amount NUMERIC,
ADD COLUMN IF NOT EXISTS customs_value NUMERIC,
ADD COLUMN IF NOT EXISTS invoice_value NUMERIC;

-- Quantity and weight (air freight specific)
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS gross_weight NUMERIC,
ADD COLUMN IF NOT EXISTS net_weight NUMERIC,
ADD COLUMN IF NOT EXISTS chargeable_weight NUMERIC,
ADD COLUMN IF NOT EXISTS quantity NUMERIC,
ADD COLUMN IF NOT EXISTS piece_count INTEGER,
ADD COLUMN IF NOT EXISTS unit_of_measure TEXT;

-- Date information
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS arrival_date DATE,
ADD COLUMN IF NOT EXISTS departure_date DATE,
ADD COLUMN IF NOT EXISTS shipment_date DATE,
ADD COLUMN IF NOT EXISTS flight_date DATE,
ADD COLUMN IF NOT EXISTS manifest_date DATE;

-- Logistics data (air freight specific)
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS airline TEXT,
ADD COLUMN IF NOT EXISTS flight_number TEXT,
ADD COLUMN IF NOT EXISTS aircraft_type TEXT,
ADD COLUMN IF NOT EXISTS carrier_code TEXT,
ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Metadata
ALTER TABLE public.airfreight_shipments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Enable RLS for airfreight_shipments
ALTER TABLE public.airfreight_shipments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.airfreight_shipments;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.airfreight_shipments;

CREATE POLICY "Allow anonymous insert"
  ON public.airfreight_shipments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select"
  ON public.airfreight_shipments
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_consignee_name 
    ON public.airfreight_shipments USING gin(LOWER(consignee_name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_shipper_name 
    ON public.airfreight_shipments USING gin(LOWER(shipper_name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_hs_code 
    ON public.airfreight_shipments (hs_code);

CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_arrival_date 
    ON public.airfreight_shipments (arrival_date);

CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_airports 
    ON public.airfreight_shipments (origin_airport, destination_airport);

CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_value 
    ON public.airfreight_shipments (value_usd);

-- Verify the schema after changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'airfreight_shipments' 
AND table_schema = 'public'
ORDER BY ordinal_position;