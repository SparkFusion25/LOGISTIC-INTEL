-- Prepare Database for 20,000+ XML Shipment Records
-- Optimize schema, indexes, and performance for bulk ingestion

-- Step 1: Ensure all required columns exist in ocean_shipments
ALTER TABLE public.ocean_shipments 
ADD COLUMN IF NOT EXISTS container_type TEXT,
ADD COLUMN IF NOT EXISTS shipping_line TEXT,
ADD COLUMN IF NOT EXISTS port_of_loading TEXT,
ADD COLUMN IF NOT EXISTS port_of_discharge TEXT,
ADD COLUMN IF NOT EXISTS vessel_voyage TEXT,
ADD COLUMN IF NOT EXISTS master_bill_of_lading TEXT,
ADD COLUMN IF NOT EXISTS house_bill_of_lading TEXT,
ADD COLUMN IF NOT EXISTS notify_party TEXT,
ADD COLUMN IF NOT EXISTS gross_weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS net_weight_kg NUMERIC,
ADD COLUMN IF NOT EXISTS measurement_cbm NUMERIC,
ADD COLUMN IF NOT EXISTS commodity_code TEXT,
ADD COLUMN IF NOT EXISTS marks_and_numbers TEXT,
ADD COLUMN IF NOT EXISTS container_numbers TEXT[];

-- Step 2: Create performance indexes for bulk searches
CREATE INDEX IF NOT EXISTS idx_ocean_shipments_company_search 
ON public.ocean_shipments(consignee_name, shipper_name);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_date_range 
ON public.ocean_shipments(arrival_date, departure_date);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_ports 
ON public.ocean_shipments(port_of_loading, port_of_discharge);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_hs_code 
ON public.ocean_shipments(hs_code);

CREATE INDEX IF NOT EXISTS idx_ocean_shipments_value_weight 
ON public.ocean_shipments(value_usd, weight_kg);

-- Step 3: Optimize trade_data_view for 20K+ records
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
  -- Additional fields for 20K+ data
  o.container_type,
  o.shipping_line,
  o.port_of_loading,
  o.port_of_discharge,
  o.vessel_voyage,
  o.gross_weight_kg,
  o.net_weight_kg,
  o.measurement_cbm,
  o.commodity_code,
  o.created_at,
  o.updated_at
FROM public.ocean_shipments o;

-- Step 4: Create materialized view for fast aggregations (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.company_stats AS
SELECT 
  COALESCE(consignee_name, shipper_name) as company_name,
  COUNT(*) as total_shipments,
  SUM(value_usd) as total_value,
  SUM(weight_kg) as total_weight,
  COUNT(DISTINCT hs_code) as unique_commodities,
  MIN(arrival_date) as first_shipment,
  MAX(arrival_date) as latest_shipment,
  COUNT(DISTINCT vessel_name) as unique_vessels
FROM public.ocean_shipments 
WHERE consignee_name IS NOT NULL OR shipper_name IS NOT NULL
GROUP BY COALESCE(consignee_name, shipper_name);

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_company_stats_name 
ON public.company_stats(company_name);

-- Step 5: Verify readiness
SELECT 
  'ocean_shipments' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT consignee_name) + COUNT(DISTINCT shipper_name) as unique_companies
FROM public.ocean_shipments
UNION ALL
SELECT 
  'crm_contacts' as table_name,
  COUNT(*) as current_records,
  COUNT(DISTINCT company_name) as unique_companies
FROM public.crm_contacts;