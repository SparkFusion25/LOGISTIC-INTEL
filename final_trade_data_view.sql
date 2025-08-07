-- =====================================================
-- REBUILD trade_data_view WITH company_name COLUMN
-- =====================================================

-- Drop existing view
DROP VIEW IF EXISTS public.trade_data_view;

-- Recreate view with all required columns including company_name
CREATE VIEW public.trade_data_view AS
SELECT
  o.id::text AS unified_id,
  o.consignee_name AS company_name,
  o.bol_number,
  o.arrival_date AS shipment_date,
  o.departure_date,
  o.destination_port,
  o.shipper_name,
  o.shipper_country,
  o.consignee_name,
  o.consignee_city,
  o.consignee_state,
  o.consignee_zip,
  o.consignee_country,
  o.goods_description,
  o.weight_kg,
  o.value_usd,
  o.freight_amount,
  o.port_of_lading,
  o.port_of_unlading,
  o.transport_method,
  o.vessel_name,
  o.container_count,
  o.shipment_type,
  o.raw_xml_filename,
  'ocean' AS shipment_mode
FROM public.ocean_shipments o

UNION ALL

SELECT
  a.id::text AS unified_id,
  a.consignee_name AS company_name,
  a.bol_number,
  a.arrival_date AS shipment_date,
  a.departure_date,
  a.destination_port,
  a.shipper_name,
  a.shipper_country,
  a.consignee_name,
  a.consignee_city,
  a.consignee_state,
  a.consignee_zip,
  a.consignee_country,
  a.goods_description,
  a.weight_kg,
  a.value_usd,
  a.freight_amount,
  a.port_of_lading,
  a.port_of_unlading,
  a.transport_method,
  a.vessel_name,
  a.container_count,
  a.shipment_type,
  a.raw_xml_filename,
  'air' AS shipment_mode
FROM public.airfreight_shipments a;

-- Grant permissions
GRANT SELECT ON public.trade_data_view TO public;
GRANT SELECT ON public.trade_data_view TO anon;
GRANT SELECT ON public.trade_data_view TO authenticated;

-- Test the view
SELECT 
  'trade_data_view created successfully' AS status,
  COUNT(*) AS total_records,
  COUNT(DISTINCT company_name) AS unique_companies,
  COUNT(DISTINCT shipment_mode) AS shipment_modes
FROM public.trade_data_view;