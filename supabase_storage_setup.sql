-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP
-- =====================================================
-- This creates the missing raw-xml bucket for XML file storage

-- Create the raw-xml bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'raw-xml',
  'raw-xml', 
  false,
  52428800, -- 50MB limit
  ARRAY['application/xml', 'text/xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the raw-xml bucket
-- Allow authenticated users to upload XML files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'raw-xml');

-- Allow authenticated users to read their uploaded files
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'raw-xml');

-- Allow service role (API) to upload files
CREATE POLICY "Allow service role uploads" ON storage.objects
  FOR INSERT TO service_role
  WITH CHECK (bucket_id = 'raw-xml');

-- Allow service role to read files  
CREATE POLICY "Allow service role reads" ON storage.objects
  FOR SELECT TO service_role
  USING (bucket_id = 'raw-xml');

-- Allow anon uploads for XML ingestion API
CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'raw-xml');

-- Verify bucket creation
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'raw-xml';