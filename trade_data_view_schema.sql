-- =====================================================
-- TRADE DATA VIEW - UNIFIED SEARCH INTERFACE
-- =====================================================
-- This creates the missing trade_data_view that your search depends on

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.trade_data_view;

-- Create unified view combining ocean and air shipments
CREATE OR REPLACE VIEW public.trade_data_view AS
SELECT 
  -- Unified identifier
  COALESCE(id::text, 'ocean_' || COALESCE(bol_number, 'unknown')) as unified_id,
  'ocean' as shipment_type,
  
  -- Company information (this is the key field that was missing!)
  COALESCE(consignee_name, shipper_name, 'Unknown Company') as company_name,
  shipper_name,
  consignee_name,
  shipper_country as origin_country,
  consignee_country as destination_country,
  consignee_city as destination_city,
  
  -- Port information
  port_of_lading as origin_port,
  port_of_unlading as destination_port,
  
  -- Commodity data
  hs_code,
  goods_description as description,
  
  -- Financial data
  value_usd,
  
  -- Temporal data
  COALESCE(arrival_date, shipment_date) as shipment_date,
  arrival_date,
  
  -- Logistics data
  vessel_name as carrier,
  weight_kg,
  
  -- Metadata
  created_at,
  raw_xml_filename,
  
  -- Additional fields for compatibility
  transport_method,
  bol_number,
  consignee_state,
  consignee_zip

FROM public.ocean_shipments
WHERE (consignee_name IS NOT NULL OR shipper_name IS NOT NULL)

UNION ALL

-- Add airfreight data if table exists (simplified to avoid column errors)
SELECT 
  COALESCE(id::text, 'air_' || COALESCE(bol_number, 'unknown')) as unified_id,
  'air' as shipment_type,
  
  -- Company information
  COALESCE(consignee_name, shipper_name, 'Unknown Company') as company_name,
  shipper_name,
  consignee_name,
  shipper_country as origin_country,
  consignee_country as destination_country,
  consignee_city as destination_city,
  
  -- Port information
  port_of_lading as origin_port,
  port_of_unlading as destination_port,
  
  -- Commodity data
  hs_code,
  goods_description as description,
  
  -- Financial data
  value_usd,
  
  -- Temporal data
  COALESCE(arrival_date, shipment_date) as shipment_date,
  arrival_date,
  
  -- Logistics data
  vessel_name as carrier,
  weight_kg,
  
  -- Metadata
  created_at,
  raw_xml_filename,
  
  -- Additional fields for compatibility
  transport_method,
  bol_number,
  consignee_state,
  consignee_zip

FROM public.airfreight_shipments
WHERE (consignee_name IS NOT NULL OR shipper_name IS NOT NULL)
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'airfreight_shipments');

-- Grant access to the view
GRANT SELECT ON public.trade_data_view TO public;
GRANT SELECT ON public.trade_data_view TO anon;
GRANT SELECT ON public.trade_data_view TO authenticated;

-- Test the view
SELECT 
  'Testing trade_data_view...' as status,
  COUNT(*) as total_records,
  COUNT(DISTINCT company_name) as unique_companies,
  COUNT(DISTINCT shipment_type) as shipment_types
FROM public.trade_data_view;