-- =====================================================
-- FIX SCHEMA FOR XML INGESTION
-- =====================================================
-- This script adds missing columns to support XML ingestion
-- and updates the trade_data_view accordingly

-- STEP 1: ALTER ocean_shipments TABLE
-- Add missing columns that XML ingestion expects

ALTER TABLE public.ocean_shipments
ADD COLUMN IF NOT EXISTS container_count INTEGER,
ADD COLUMN IF NOT EXISTS shipment_date DATE,
ADD COLUMN IF NOT EXISTS shipment_type TEXT DEFAULT 'ocean';

-- STEP 2: ALTER airfreight_shipments TABLE 
-- Add same columns for consistency and future air XML uploads

ALTER TABLE public.airfreight_shipments  
ADD COLUMN IF NOT EXISTS container_count INTEGER,
ADD COLUMN IF NOT EXISTS shipment_date DATE,
ADD COLUMN IF NOT EXISTS shipment_type TEXT DEFAULT 'air';

-- STEP 3: UPDATE trade_data_view
-- Recreate the view to include the new columns and proper field mapping

CREATE OR REPLACE VIEW public.trade_data_view AS
SELECT
  -- Unified identifier
  COALESCE('ocean_' || o.shipment_id::text, 'ocean_' || o.id::text) AS unified_id,
  
  -- Basic shipment info
  o.bol_number,
  COALESCE(o.shipment_date, o.arrival_date) AS shipment_date,
  COALESCE(o.shipment_type, 'ocean') AS shipment_type,
  
  -- Company information (for search compatibility)
  COALESCE(o.consignee_name, o.shipper_name, '') AS company_name,
  o.shipper_name,
  o.consignee_name,
  
  -- Geographic data
  o.origin_country,
  o.destination_country, 
  o.destination_city,
  o.destination_port,
  o.origin_port,
  
  -- Commodity data
  o.hs_code,
  COALESCE(o.commodity_description, o.description, o.goods_description) AS description,
  
  -- Financial data
  o.value_usd::numeric AS value_usd,
  o.freight_amount::numeric AS freight_amount,
  
  -- Physical data
  o.weight_kg::numeric AS weight_kg,
  o.container_count,
  
  -- Logistics data
  o.vessel_name,
  o.carrier,
  
  -- Temporal data
  o.arrival_date,
  o.departure_date,
  
  -- Metadata
  o.raw_xml_filename,
  'ocean' AS shipment_mode,
  o.created_at,
  o.updated_at

FROM public.ocean_shipments o

UNION ALL

SELECT
  -- Unified identifier  
  COALESCE('air_' || a.shipment_id::text, 'air_' || a.id::text) AS unified_id,
  
  -- Basic shipment info
  a.bol_number,
  COALESCE(a.shipment_date, a.arrival_date) AS shipment_date,
  COALESCE(a.shipment_type, 'air') AS shipment_type,
  
  -- Company information (for search compatibility)
  COALESCE(a.consignee_name, a.shipper_name, '') AS company_name,
  a.shipper_name,
  a.consignee_name,
  
  -- Geographic data
  a.origin_country,
  a.destination_country,
  a.destination_city, 
  a.destination_port,
  a.origin_port,
  
  -- Commodity data
  a.hs_code,
  COALESCE(a.commodity_description, a.description, a.goods_description) AS description,
  
  -- Financial data
  a.value_usd::numeric AS value_usd,
  a.freight_amount::numeric AS freight_amount,
  
  -- Physical data
  a.weight_kg::numeric AS weight_kg,
  a.container_count,
  
  -- Logistics data
  a.vessel_name,
  a.carrier,
  
  -- Temporal data
  a.arrival_date,
  a.departure_date,
  
  -- Metadata
  a.raw_xml_filename,
  'air' AS shipment_mode,
  a.created_at,
  a.updated_at

FROM public.airfreight_shipments a;

-- STEP 4: Add indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_ocean_shipments_shipment_date 
ON public.ocean_shipments (shipment_date);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_shipment_type 
ON public.ocean_shipments (shipment_type);

CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_shipment_date 
ON public.airfreight_shipments (shipment_date);

CREATE INDEX IF NOT EXISTS idx_airfreight_shipments_shipment_type 
ON public.airfreight_shipments (shipment_type);

-- STEP 5: Verify the schema changes
SELECT 'Schema update verification:' AS status;

-- Check ocean_shipments columns
SELECT 'ocean_shipments columns:' AS table_info, 
       column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ocean_shipments' 
  AND column_name IN ('container_count', 'shipment_date', 'shipment_type')
ORDER BY column_name;

-- Check trade_data_view columns
SELECT 'trade_data_view columns:' AS table_info,
       column_name, data_type
FROM information_schema.columns  
WHERE table_name = 'trade_data_view'
  AND column_name IN ('unified_id', 'shipment_date', 'shipment_type', 'company_name', 'container_count')
ORDER BY column_name;

-- Test insert with new schema
INSERT INTO public.ocean_shipments (
  raw_xml_filename,
  consignee_name,
  shipper_name,
  hs_code,
  commodity_description,
  value_usd,
  weight_kg,
  container_count,
  shipment_date,
  shipment_type,
  origin_country,
  destination_country,
  destination_city
) VALUES (
  'schema_test.xml',
  'Test Company Schema Fix',
  'Test Shipper Schema Fix',
  '8471.30.01',
  'Test commodity for schema verification',
  75000,
  1500,
  2,
  CURRENT_DATE,
  'ocean',
  'China',
  'United States', 
  'Los Angeles'
);

-- Verify the test record appears in trade_data_view
SELECT 'trade_data_view test record:' AS verification,
       unified_id, company_name, shipment_date, shipment_type, container_count
FROM public.trade_data_view
WHERE raw_xml_filename = 'schema_test.xml';

-- Clean up test record
DELETE FROM public.ocean_shipments WHERE raw_xml_filename = 'schema_test.xml';

-- Final status
SELECT 'Schema fixes complete!' AS status,
       'Ready for XML ingestion with container_count, shipment_date, shipment_type' AS next_step;