-- =====================================================
-- SCHEMA VERIFICATION TEST SCRIPT
-- =====================================================
-- This tests that all expected columns exist and can accept data

-- Test 1: Insert sample ocean shipment record
INSERT INTO public.ocean_shipments (
    consignee_name,
    consignee_city,
    consignee_state,
    consignee_country,
    shipper_name,
    shipper_country,
    origin_country,
    destination_country,
    destination_city,
    hs_code,
    commodity_description,
    value_usd,
    weight_kg,
    arrival_date,
    vessel_name,
    container_count,
    raw_xml_filename
) VALUES (
    'Samsung Electronics America Inc',
    'Dallas',
    'TX',
    'United States',
    'Samsung Electronics Co Ltd',
    'South Korea',
    'South Korea',
    'United States',
    'Dallas',
    '8471',
    'Computer monitors and displays',
    125000.00,
    2500.50,
    '2024-01-15',
    'MSC VESSEL',
    2,
    'test_ocean_shipment.xml'
);

-- Test 2: Insert sample airfreight record (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'airfreight_shipments') THEN
        INSERT INTO public.airfreight_shipments (
            consignee_name,
            consignee_city,
            consignee_country,
            shipper_name,
            shipper_country,
            origin_country,
            destination_country,
            destination_city,
            destination_airport,
            origin_airport,
            hs_code,
            commodity_description,
            value_usd,
            weight_kg,
            arrival_date,
            airline,
            piece_count,
            raw_xml_filename
        ) VALUES (
            'Apple Inc',
            'Cupertino',
            'United States',
            'Foxconn Technology Co Ltd',
            'China',
            'China',
            'United States',
            'San Francisco',
            'SFO',
            'PVG',
            '8518',
            'Audio equipment and headphones',
            75000.00,
            150.25,
            '2024-01-20',
            'United Airlines',
            5,
            'test_air_shipment.xml'
        );
    END IF;
END $$;

-- Test 3: Query the trade_data_view to ensure it works
SELECT 
    unified_id,
    shipment_type,
    company_name,
    origin_country,
    destination_country,
    destination_city,
    hs_code,
    description,
    value_usd,
    weight_kg,
    shipment_date,
    carrier
FROM public.trade_data_view
WHERE company_name ILIKE '%samsung%' OR company_name ILIKE '%apple%'
ORDER BY shipment_date DESC;

-- Test 4: Test search filters that the API uses
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT company_name) as unique_companies,
    COUNT(DISTINCT hs_code) as unique_hs_codes,
    MIN(shipment_date) as earliest_date,
    MAX(shipment_date) as latest_date,
    SUM(value_usd) as total_value
FROM public.trade_data_view;

-- Test 5: Test company name search (case insensitive)
SELECT 
    company_name,
    hs_code,
    description,
    value_usd
FROM public.trade_data_view
WHERE company_name_lower LIKE '%samsung%'
   OR company_name_lower LIKE '%apple%';

-- Test 6: Test HS code search
SELECT 
    company_name,
    hs_code,
    description,
    value_usd
FROM public.trade_data_view
WHERE hs_code LIKE '847%' OR hs_code LIKE '851%';

-- Test 7: Test geographic search
SELECT 
    company_name,
    origin_country,
    destination_city,
    value_usd
FROM public.trade_data_view
WHERE destination_city ILIKE '%dallas%'
   OR destination_city ILIKE '%san francisco%';

-- Test 8: Test date range search
SELECT 
    company_name,
    shipment_date,
    value_usd
FROM public.trade_data_view
WHERE shipment_date >= '2024-01-01'
  AND shipment_date <= '2024-12-31';

-- Test 9: Verify indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('ocean_shipments', 'airfreight_shipments')
ORDER BY tablename, indexname;

-- Test 10: Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('ocean_shipments', 'airfreight_shipments')
ORDER BY tablename, policyname;

-- Test 11: Clean up test data (optional)
-- DELETE FROM public.ocean_shipments WHERE raw_xml_filename = 'test_ocean_shipment.xml';
-- DELETE FROM public.airfreight_shipments WHERE raw_xml_filename = 'test_air_shipment.xml';

-- Success message
SELECT 'Schema verification completed successfully!' as status;