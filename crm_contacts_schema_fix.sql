-- Fix crm_contacts schema: Add added_by_user column
-- This fixes the "Could not find the 'added_by_user' column" error

ALTER TABLE public.crm_contacts
ADD COLUMN IF NOT EXISTS added_by_user UUID;

-- Add a default user for existing records (temporary solution)
UPDATE public.crm_contacts 
SET added_by_user = '00000000-0000-0000-0000-000000000001'::uuid 
WHERE added_by_user IS NULL;

-- Optionally add a foreign key reference to auth.users (if needed)
-- ALTER TABLE public.crm_contacts 
-- ADD CONSTRAINT fk_crm_contacts_user 
-- FOREIGN KEY (added_by_user) REFERENCES auth.users(id);