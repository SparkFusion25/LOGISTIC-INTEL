-- Fix crm_contacts schema: Add metadata column
-- This fixes the "Could not find the 'metadata' column" error

-- Add metadata column as JSONB for flexible data storage
ALTER TABLE public.crm_contacts
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add owner_user_id column if it doesn't exist
ALTER TABLE public.crm_contacts
ADD COLUMN IF NOT EXISTS owner_user_id UUID;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crm_contacts_metadata ON public.crm_contacts USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_added_by_user ON public.crm_contacts (added_by_user);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_owner_user_id ON public.crm_contacts (owner_user_id);

-- Update existing records with empty metadata if needed
UPDATE public.crm_contacts 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;

-- Set owner_user_id to match added_by_user for existing records
UPDATE public.crm_contacts 
SET owner_user_id = added_by_user 
WHERE owner_user_id IS NULL AND added_by_user IS NOT NULL;

-- Create RLS policies for metadata access
-- Policy for users to see their own contacts
CREATE POLICY IF NOT EXISTS "Users can view their own CRM contacts" ON public.crm_contacts
    FOR SELECT USING (
        auth.uid() = added_by_user OR 
        auth.uid() = owner_user_id
    );

-- Policy for users to insert their own contacts
CREATE POLICY IF NOT EXISTS "Users can insert their own CRM contacts" ON public.crm_contacts
    FOR INSERT WITH CHECK (
        auth.uid() = added_by_user OR 
        auth.uid() = owner_user_id
    );

-- Policy for users to update their own contacts
CREATE POLICY IF NOT EXISTS "Users can update their own CRM contacts" ON public.crm_contacts
    FOR UPDATE USING (
        auth.uid() = added_by_user OR 
        auth.uid() = owner_user_id
    );

-- Enable RLS on the table
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;