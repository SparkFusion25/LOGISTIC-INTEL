-- =====================================================
-- ENABLE XML INGESTION - RLS POLICIES
-- =====================================================
-- This script enables the /api/ingest/xml-shipments endpoint
-- to properly insert parsed XML data into database tables

-- Step 1: Enable INSERT access for ingestion endpoint (service role or authenticated)
-- Applies to ocean_shipments and airfreight_shipments

-- 👇 OCEAN SHIPMENTS
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow XML ingestion insert" ON public.ocean_shipments;

-- Create new INSERT policy for XML ingestion
CREATE POLICY "Allow XML ingestion insert"
  ON public.ocean_shipments
  FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow service_role for API calls
CREATE POLICY "Allow service role insert"
  ON public.ocean_shipments
  FOR INSERT
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow SELECT for authenticated users (for search functionality)
CREATE POLICY "Allow authenticated select"
  ON public.ocean_shipments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow public SELECT for anon users (for public search)
CREATE POLICY "Allow public select"
  ON public.ocean_shipments
  FOR SELECT
  TO public
  USING (true);

-- 👇 AIRFREIGHT SHIPMENTS
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow XML ingestion insert" ON public.airfreight_shipments;

-- Create new INSERT policy for XML ingestion
CREATE POLICY "Allow XML ingestion insert"
  ON public.airfreight_shipments
  FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow service_role for API calls
CREATE POLICY "Allow service role insert"
  ON public.airfreight_shipments
  FOR INSERT
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow SELECT for authenticated users (for search functionality)
CREATE POLICY "Allow authenticated select"
  ON public.airfreight_shipments
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow public SELECT for anon users (for public search)
CREATE POLICY "Allow public select"
  ON public.airfreight_shipments
  FOR SELECT
  TO public
  USING (true);

-- Step 2: Ensure RLS is enabled on both tables
ALTER TABLE public.ocean_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airfreight_shipments ENABLE ROW LEVEL SECURITY;

-- Step 3: Verify policies were created successfully
-- Check ocean_shipments policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename IN ('ocean_shipments', 'airfreight_shipments')
ORDER BY tablename, policyname;

-- Step 4: Test INSERT permissions with a sample record
-- This will verify the policies work correctly

-- Test ocean_shipments INSERT
INSERT INTO public.ocean_shipments (
  raw_xml_filename,
  consignee_name,
  shipper_name,
  hs_code,
  commodity_description,
  value_usd,
  weight_kg,
  origin_country,
  destination_country,
  destination_city,
  shipment_date
) VALUES (
  'test_xml_ingestion.xml',
  'Test Consignee Company',
  'Test Shipper Company', 
  '8471.30.01',
  'Computer components for testing',
  50000,
  1200,
  'China',
  'United States',
  'Los Angeles',
  CURRENT_DATE
);

-- Test airfreight_shipments INSERT
INSERT INTO public.airfreight_shipments (
  raw_xml_filename,
  consignee_name,
  shipper_name,
  hs_code,
  commodity_description,
  value_usd,
  weight_kg,
  origin_country,
  destination_country,
  destination_city,
  shipment_date
) VALUES (
  'test_air_xml_ingestion.xml',
  'Test Air Consignee Company',
  'Test Air Shipper Company',
  '8517.12.00', 
  'Electronics for air freight testing',
  75000,
  800,
  'South Korea',
  'United States',
  'New York',
  CURRENT_DATE
);

-- Step 5: Verify test records were inserted
SELECT 'ocean_shipments test record count:' as test_type, COUNT(*) as record_count
FROM public.ocean_shipments 
WHERE raw_xml_filename = 'test_xml_ingestion.xml';

SELECT 'airfreight_shipments test record count:' as test_type, COUNT(*) as record_count  
FROM public.airfreight_shipments
WHERE raw_xml_filename = 'test_air_xml_ingestion.xml';

-- Step 6: Verify trade_data_view includes test records
SELECT 'trade_data_view test record count:' as test_type, COUNT(*) as record_count
FROM public.trade_data_view
WHERE company_name LIKE '%Test%Company%';

-- Step 7: Clean up test records (optional - comment out if you want to keep them)
DELETE FROM public.ocean_shipments WHERE raw_xml_filename = 'test_xml_ingestion.xml';
DELETE FROM public.airfreight_shipments WHERE raw_xml_filename = 'test_air_xml_ingestion.xml';

-- Final status message
SELECT 'XML ingestion policies enabled successfully!' as status,
       'Ready to process XML files via /api/ingest/xml-shipments' as next_step;