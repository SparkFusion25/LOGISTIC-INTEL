-- =====================================================
-- TRADE DATA VIEW - UNIFIED SEARCH INTERFACE
-- =====================================================
-- This creates the missing trade_data_view that your search depends on

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.trade_data_view;

-- Create unified view combining ocean and air shipments
CREATE OR REPLACE VIEW public.trade_data_view AS
SELECT 
  -- Unified identifier (using shipment_id if available, otherwise id)
  COALESCE('ocean_' || shipment_id::text, 'ocean_' || id::text) as unified_id,
  'ocean' as shipment_type,
  
  -- Company information
  COALESCE(consignee_name, shipper_name, '') as company_name,
  shipper_name,
  consignee_name,
  
  -- Geographic data
  origin_country,
  destination_country,
  destination_city,
  destination_port,
  origin_port,
  
  -- Commodity data
  hs_code,
  COALESCE(commodity_description, description, product_description) as description,
  
  -- Financial data
  value_usd::numeric as value_usd,
  freight_amount::numeric as freight_amount,
  
  -- Temporal data
  COALESCE(arrival_date, shipment_date, created_at::date) as shipment_date,
  arrival_date,
  departure_date,
  
  -- Logistics data
  COALESCE(vessel_name, carrier_name) as carrier,
  container_count,
  weight_kg,
  
  -- Metadata
  created_at,
  updated_at,
  raw_xml_filename,
  
  -- Search helpers
  LOWER(COALESCE(consignee_name, shipper_name, '')) as company_name_lower,
  LOWER(COALESCE(commodity_description, description, product_description, '')) as description_lower,
  EXTRACT(YEAR FROM COALESCE(arrival_date, shipment_date, created_at::date)) as year,
  EXTRACT(MONTH FROM COALESCE(arrival_date, shipment_date, created_at::date)) as month

FROM public.ocean_shipments
WHERE (consignee_name IS NOT NULL OR shipper_name IS NOT NULL)
  AND (consignee_name != '' OR shipper_name != '')

UNION ALL

-- Add airfreight data if table exists
SELECT 
  -- Unified identifier (using shipment_id if available, otherwise id)
  COALESCE('air_' || shipment_id::text, 'air_' || id::text) as unified_id,
  'air' as shipment_type,
  
  -- Company information
  COALESCE(consignee_name, shipper_name, '') as company_name,
  shipper_name,
  consignee_name,
  
  -- Geographic data
  origin_country,
  destination_country,
  destination_city,
  COALESCE(destination_airport, arrival_airport) as destination_port,
  COALESCE(origin_airport, departure_airport) as origin_port,
  
  -- Commodity data
  hs_code,
  COALESCE(commodity_description, description, product_description) as description,
  
  -- Financial data
  value_usd::numeric as value_usd,
  freight_amount::numeric as freight_amount,
  
  -- Temporal data
  COALESCE(arrival_date, shipment_date, flight_date, created_at::date) as shipment_date,
  arrival_date,
  departure_date,
  
  -- Logistics data
  airline as carrier,
  piece_count as container_count,
  weight_kg,
  
  -- Metadata
  created_at,
  updated_at,
  raw_xml_filename,
  
  -- Search helpers
  LOWER(COALESCE(consignee_name, shipper_name, '')) as company_name_lower,
  LOWER(COALESCE(commodity_description, description, product_description, '')) as description_lower,
  EXTRACT(YEAR FROM COALESCE(arrival_date, shipment_date, flight_date, created_at::date)) as year,
  EXTRACT(MONTH FROM COALESCE(arrival_date, shipment_date, flight_date, created_at::date)) as month

FROM public.airfreight_shipments
WHERE (consignee_name IS NOT NULL OR shipper_name IS NOT NULL)
  AND (consignee_name != '' OR shipper_name != '')
  AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'airfreight_shipments');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_data_view_company_name 
  ON public.ocean_shipments USING gin(LOWER(COALESCE(consignee_name, shipper_name, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_trade_data_view_hs_code 
  ON public.ocean_shipments (hs_code);

CREATE INDEX IF NOT EXISTS idx_trade_data_view_dates 
  ON public.ocean_shipments (COALESCE(arrival_date, shipment_date, created_at::date));

CREATE INDEX IF NOT EXISTS idx_trade_data_view_origin_dest 
  ON public.ocean_shipments (origin_country, destination_country);

-- Grant access to the view
GRANT SELECT ON public.trade_data_view TO public;
GRANT SELECT ON public.trade_data_view TO anon;
GRANT SELECT ON public.trade_data_view TO authenticated;

-- Test the view
SELECT 
  shipment_type,
  COUNT(*) as record_count,
  MIN(shipment_date) as earliest_date,
  MAX(shipment_date) as latest_date,
  COUNT(DISTINCT company_name) as unique_companies
FROM public.trade_data_view 
GROUP BY shipment_type;