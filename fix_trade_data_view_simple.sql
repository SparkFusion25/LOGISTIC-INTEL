-- SIMPLE FIX: Recreate trade_data_view with only existing columns
-- This fixes the search API with basic functionality

-- Drop the existing view
DROP VIEW IF EXISTS public.trade_data_view;

-- Recreate trade_data_view with only columns we know exist
CREATE VIEW public.trade_data_view AS
SELECT 
  id::text as unified_id,
  company_name,
  'ocean' as shipment_type,
  arrival_date,
  departure_date,
  vessel_name,
  bol_number,
  container_count,
  gross_weight_kg,
  value_usd,
  shipper_name,
  consignee_name,
  port_of_loading,
  port_of_discharge,
  origin_country,
  destination_city,
  hs_code,
  description as goods_description,
  created_at,
  updated_at
FROM public.ocean_shipments
WHERE company_name IS NOT NULL;

-- Grant permissions
GRANT SELECT ON public.trade_data_view TO authenticated;
GRANT SELECT ON public.trade_data_view TO anon;

-- Test the view
SELECT COUNT(*) as total_records FROM public.trade_data_view;
SELECT DISTINCT company_name FROM public.trade_data_view LIMIT 5;