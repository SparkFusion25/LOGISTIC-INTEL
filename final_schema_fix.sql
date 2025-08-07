-- =====================================================
-- FINAL SCHEMA FIX FOR LOGISTIC INTEL
-- =====================================================
-- Step 1: Add missing freight_amount column to ocean_shipments

ALTER TABLE public.ocean_shipments
ADD COLUMN IF NOT EXISTS freight_amount NUMERIC;

-- Also ensure other columns exist for complete compatibility
ALTER TABLE public.ocean_shipments
ADD COLUMN IF NOT EXISTS departure_date DATE,
ADD COLUMN IF NOT EXISTS destination_port TEXT,
ADD COLUMN IF NOT EXISTS container_count INTEGER,
ADD COLUMN IF NOT EXISTS shipment_type TEXT DEFAULT 'ocean';

-- Verify column addition
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ocean_shipments' 
AND column_name IN ('freight_amount', 'departure_date', 'destination_port', 'container_count', 'shipment_type');