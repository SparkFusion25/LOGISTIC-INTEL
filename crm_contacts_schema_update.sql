-- =====================================================
-- CRM CONTACTS TABLE SCHEMA UPDATE
-- =====================================================
-- Add fields required for linking to trade_data_view records

-- Add unified_id to link back to specific shipment records
ALTER TABLE public.crm_contacts
ADD COLUMN IF NOT EXISTS unified_id TEXT;

-- Add HS code for trade intelligence
ALTER TABLE public.crm_contacts  
ADD COLUMN IF NOT EXISTS hs_code TEXT;

-- Add user tracking
ALTER TABLE public.crm_contacts
ADD COLUMN IF NOT EXISTS added_by_user UUID;

-- Add foreign key reference to users table if it exists
-- ALTER TABLE public.crm_contacts
-- ADD CONSTRAINT fk_crm_contacts_user 
-- FOREIGN KEY (added_by_user) REFERENCES users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_crm_contacts_unified_id 
    ON public.crm_contacts (unified_id);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_hs_code 
    ON public.crm_contacts (hs_code);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_added_by_user 
    ON public.crm_contacts (added_by_user);

-- Verify schema update
SELECT 'CRM contacts schema updated successfully' as status;