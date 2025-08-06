-- =====================================================
-- QUICK FIX: Add missing vessel_name column
-- =====================================================
-- This adds the vessel_name column that may be missing

-- Add vessel_name column to ocean_shipments if not exists
ALTER TABLE public.ocean_shipments
ADD COLUMN IF NOT EXISTS vessel_name TEXT;

-- Test the column exists by inserting sample data
INSERT INTO public.ocean_shipments (
    consignee_name, 
    hs_code, 
    value_usd, 
    arrival_date, 
    vessel_name
) VALUES (
    'Vessel Test Company', 
    '8471', 
    1000, 
    '2024-01-01', 
    'TEST VESSEL NAME'
) RETURNING id, consignee_name, vessel_name;

-- Clean up test data
DELETE FROM public.ocean_shipments 
WHERE consignee_name = 'Vessel Test Company';

-- Confirm success
SELECT 'vessel_name column added successfully' as status;