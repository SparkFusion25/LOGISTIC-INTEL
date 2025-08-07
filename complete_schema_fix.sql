-- Complete Schema Fix for Trade Data View and CRM
-- Fix all missing columns and create a proper unified view

-- Step 0: Fix CRM contacts table schema
ALTER TABLE public.crm_contacts 
ADD COLUMN IF NOT EXISTS added_by_user TEXT;

-- Step 1: Add missing column to ocean_shipments
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS shipment_type TEXT DEFAULT 'ocean';

-- Update existing records to have shipment_type
UPDATE public.ocean_shipments 
SET shipment_type = 'ocean' 
WHERE shipment_type IS NULL;

-- Step 2: Drop and recreate trade_data_view with all required columns
DROP VIEW IF EXISTS public.trade_data_view;

CREATE VIEW public.trade_data_view AS
SELECT
  o.id::text AS unified_id,
  COALESCE(o.consignee_name, o.shipper_name, 'Unknown Company') AS company_name,
  o.bol_number,
  o.arrival_date AS shipment_date,
  o.shipper_name,
  o.shipper_country AS origin_country,
  o.consignee_name,
  o.consignee_city AS destination_city,
  o.destination_country,
  o.goods_description AS description,
  o.weight_kg,
  o.value_usd,
  o.vessel_name,
  o.raw_xml_filename,
  COALESCE(o.shipment_type, 'ocean') AS shipment_type,
  COALESCE(o.hs_code, '') AS hs_code,
  o.departure_date,
  o.arrival_port AS destination_port,
  o.departure_port AS origin_port,
  o.freight_amount,
  o.container_count,
  o.created_at,
  o.updated_at
FROM public.ocean_shipments o;

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trade_data_view_shipment_type ON public.ocean_shipments(shipment_type);
CREATE INDEX IF NOT EXISTS idx_trade_data_view_company_name ON public.ocean_shipments(consignee_name, shipper_name);
CREATE INDEX IF NOT EXISTS idx_trade_data_view_hs_code ON public.ocean_shipments(hs_code);

-- Step 4: Verify the view works
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT shipment_type) as shipment_types,
  COUNT(DISTINCT company_name) as distinct_companies
FROM public.trade_data_view;