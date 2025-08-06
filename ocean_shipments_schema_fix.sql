-- =====================================================
-- CRITICAL SCHEMA FIX: ocean_shipments Table
-- =====================================================
-- This adds all missing columns expected by XML ingestion

-- First, let's check what tables exist (Supabase compatible)
SELECT tablename, schemaname 
FROM pg_catalog.pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'ocean_shipments';

-- Add missing columns to ocean_shipments table
-- Core identification
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS shipment_id TEXT,
ADD COLUMN IF NOT EXISTS raw_xml_filename TEXT;

-- Company information
ALTER TABLE public.ocean_shipments 
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

-- Geographic data
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS origin_country TEXT,
ADD COLUMN IF NOT EXISTS destination_country TEXT,
ADD COLUMN IF NOT EXISTS destination_city TEXT,
ADD COLUMN IF NOT EXISTS destination_port TEXT,
ADD COLUMN IF NOT EXISTS origin_port TEXT,
ADD COLUMN IF NOT EXISTS port_of_loading TEXT,
ADD COLUMN IF NOT EXISTS port_of_discharge TEXT;

-- Commodity data
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS hs_code TEXT,
ADD COLUMN IF NOT EXISTS commodity_description TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS product_description TEXT;

-- Financial data
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS value_usd NUMERIC,
ADD COLUMN IF NOT EXISTS freight_amount NUMERIC,
ADD COLUMN IF NOT EXISTS customs_value NUMERIC,
ADD COLUMN IF NOT EXISTS invoice_value NUMERIC;

-- Quantity and weight
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS gross_weight NUMERIC,
ADD COLUMN IF NOT EXISTS net_weight NUMERIC,
ADD COLUMN IF NOT EXISTS quantity NUMERIC,
ADD COLUMN IF NOT EXISTS container_count INTEGER,
ADD COLUMN IF NOT EXISTS unit_of_measure TEXT;

-- Date information
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS arrival_date DATE,
ADD COLUMN IF NOT EXISTS departure_date DATE,
ADD COLUMN IF NOT EXISTS shipment_date DATE,
ADD COLUMN IF NOT EXISTS bill_of_lading_date DATE,
ADD COLUMN IF NOT EXISTS manifest_date DATE;

-- Logistics data
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS vessel_name TEXT,
ADD COLUMN IF NOT EXISTS voyage_number TEXT,
ADD COLUMN IF NOT EXISTS carrier_name TEXT,
ADD COLUMN IF NOT EXISTS bill_of_lading_number TEXT,
ADD COLUMN IF NOT EXISTS container_number TEXT,
ADD COLUMN IF NOT EXISTS seal_number TEXT;

-- Metadata
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ocean_shipments_consignee_name 
    ON public.ocean_shipments USING gin(LOWER(consignee_name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_shipper_name 
    ON public.ocean_shipments USING gin(LOWER(shipper_name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_hs_code 
    ON public.ocean_shipments (hs_code);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_arrival_date 
    ON public.ocean_shipments (arrival_date);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_origin_dest 
    ON public.ocean_shipments (origin_country, destination_country);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_value 
    ON public.ocean_shipments (value_usd);

-- Verify the schema after changes (Supabase compatible)
SELECT 'Schema updates completed successfully' as status;

-- Test insert to verify all columns work
INSERT INTO public.ocean_shipments (
    consignee_name, hs_code, value_usd, arrival_date, vessel_name
) VALUES (
    'Schema Test Company', '8471', 1000, '2024-01-01', 'TEST VESSEL'
) RETURNING id, consignee_name, vessel_name;

-- Clean up test data
DELETE FROM public.ocean_shipments 
WHERE consignee_name = 'Schema Test Company';