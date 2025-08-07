-- Fix CRM Contacts Schema - Add added_by_user Column
-- This fixes the "added_by_user column missing" error when adding companies to CRM

-- Add added_by_user column if it doesn't exist
ALTER TABLE public.crm_contacts 
ADD COLUMN IF NOT EXISTS added_by_user UUID;

-- Add foreign key constraint to auth.users
ALTER TABLE public.crm_contacts 
ADD CONSTRAINT IF NOT EXISTS fk_crm_contacts_added_by_user 
FOREIGN KEY (added_by_user) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_crm_contacts_added_by_user 
ON public.crm_contacts(added_by_user);

-- Update existing records to have a default user (if any exist without added_by_user)
UPDATE public.crm_contacts 
SET added_by_user = (
  SELECT id FROM auth.users 
  WHERE email = 'info@getb3acon.com' 
  LIMIT 1
)
WHERE added_by_user IS NULL;

-- Verify the schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'crm_contacts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;