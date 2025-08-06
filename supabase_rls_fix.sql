-- =====================================================
-- CRITICAL FIX: Row-Level Security Policies
-- =====================================================
-- This fixes the core issue blocking all XML data uploads

-- Enable RLS on ocean_shipments (if not already enabled)
ALTER TABLE public.ocean_shipments ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.ocean_shipments;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.ocean_shipments;
DROP POLICY IF EXISTS "Allow public read" ON public.ocean_shipments;
DROP POLICY IF EXISTS "Allow public insert" ON public.ocean_shipments;

-- Create permissive INSERT policy for XML uploads
CREATE POLICY "Allow anonymous insert"
  ON public.ocean_shipments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create permissive SELECT policy for search functionality
CREATE POLICY "Allow anonymous select"
  ON public.ocean_shipments
  FOR SELECT
  TO public
  USING (true);

-- Also fix airfreight_shipments if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'airfreight_shipments') THEN
    ALTER TABLE public.airfreight_shipments ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow anonymous insert" ON public.airfreight_shipments;
    DROP POLICY IF EXISTS "Allow anonymous select" ON public.airfreight_shipments;
    
    CREATE POLICY "Allow anonymous insert"
      ON public.airfreight_shipments
      FOR INSERT
      TO public
      WITH CHECK (true);
      
    CREATE POLICY "Allow anonymous select"
      ON public.airfreight_shipments
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Verify policies are applied
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('ocean_shipments', 'airfreight_shipments')
ORDER BY tablename, policyname;