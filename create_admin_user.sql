-- Create Admin User with Full Visibility for Testing Gated Features
-- Email: info@getb3acon.com
-- Password: 7354

-- Note: This script should be run in Supabase SQL Editor
-- The user will need to sign up first via the normal auth flow, then we'll upgrade their permissions

-- 1. First, ensure the user exists in auth.users (they need to sign up normally first)
-- You'll need to sign up at: /signup with email: info@getb3acon.com, password: 7354

-- 2. After signup, find the user ID and update their role
-- This will be run after the user signs up:

-- Update user metadata to mark as admin
UPDATE auth.users 
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin", "plan": "enterprise", "admin_level": "full"}'::jsonb,
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"full_name": "Admin User", "company": "B3acon Technologies", "plan": "enterprise"}'::jsonb
WHERE email = 'info@getb3acon.com';

-- 3. Create a comprehensive user profile in our custom tables
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  company,
  role,
  plan,
  subscription_status,
  admin_permissions,
  features_enabled,
  created_at,
  updated_at
) 
SELECT 
  auth.users.id,
  'info@getb3acon.com',
  'Admin User',
  'B3acon Technologies',
  'admin',
  'enterprise',
  'active',
  '["full_admin", "user_management", "crm_access", "analytics_access", "api_management", "billing_access"]'::jsonb,
  '["unlimited_search", "contact_enrichment", "trend_analysis", "campaign_builder", "advanced_filters", "export_data"]'::jsonb,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'info@getb3acon.com'
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  plan = EXCLUDED.plan,
  subscription_status = EXCLUDED.subscription_status,
  admin_permissions = EXCLUDED.admin_permissions,
  features_enabled = EXCLUDED.features_enabled,
  updated_at = NOW();

-- 4. Create Stripe customer record (for billing testing)
INSERT INTO public.stripe_customers (
  user_id,
  customer_id,
  email,
  plan,
  subscription_status,
  subscription_id,
  current_period_end,
  created_at
)
SELECT 
  auth.users.id,
  'cus_admin_' || auth.users.id,
  'info@getb3acon.com',
  'enterprise',
  'active',
  'sub_admin_' || auth.users.id,
  (NOW() + INTERVAL '1 year'),
  NOW()
FROM auth.users 
WHERE email = 'info@getb3acon.com'
ON CONFLICT (user_id) DO UPDATE SET
  plan = EXCLUDED.plan,
  subscription_status = EXCLUDED.subscription_status,
  current_period_end = EXCLUDED.current_period_end;

-- 5. Pre-populate some CRM contacts for testing
INSERT INTO public.crm_contacts (
  company_name,
  contact_name,
  title,
  email,
  phone,
  linkedin_url,
  source,
  status,
  tags,
  notes,
  added_by_user,
  unified_id,
  hs_code,
  enriched_at,
  apollo_id
)
SELECT 
  'Samsung Electronics',
  'John Kim',
  'Logistics Manager',
  'john.kim@samsung.com',
  '+82-2-2255-0114',
  'https://linkedin.com/in/johnkim-samsung',
  'Trade Search',
  'qualified',
  '["enterprise", "electronics", "high-priority"]'::jsonb,
  'High-value prospect from Samsung shipment analysis. Multiple ocean shipments monthly.',
  auth.users.id,
  'samsung_001',
  '8517.12',
  NOW(),
  'apollo_samsung_001'
FROM auth.users 
WHERE email = 'info@getb3acon.com'

UNION ALL

SELECT 
  'Tesla Inc',
  'Sarah Chen',
  'Supply Chain Director',
  'sarah.chen@tesla.com',
  '+1-512-516-8177',
  'https://linkedin.com/in/sarahchen-tesla',
  'Campaign Builder',
  'contacted',
  '["automotive", "electric-vehicles", "premium"]'::jsonb,
  'Tesla contact from recent battery shipment tracking. Interested in supply chain optimization.',
  auth.users.id,
  'tesla_001',
  '8507.60',
  NOW(),
  'apollo_tesla_001'
FROM auth.users 
WHERE email = 'info@getb3acon.com'

UNION ALL

SELECT 
  'Apple Inc',
  'Michael Johnson',
  'Global Trade Manager',
  'michael.johnson@apple.com',
  '+1-408-996-1010',
  'https://linkedin.com/in/mjohnson-apple',
  'API Integration',
  'lead',
  '["technology", "premium", "global"]'::jsonb,
  'Apple trade intelligence lead. Multiple air shipments from China facilities.',
  auth.users.id,
  'apple_001',
  '8517.62',
  NOW(),
  'apollo_apple_001'
FROM auth.users 
WHERE email = 'info@getb3acon.com';

-- 6. Create some outreach logs for testing campaign features
INSERT INTO public.outreach_logs (
  crm_contact_id,
  campaign_id,
  unified_id,
  email_subject,
  email_body,
  sent_at,
  opened,
  clicked,
  replied,
  status,
  created_by
)
SELECT 
  crm.id,
  'campaign_test_001',
  crm.unified_id,
  'Tesla Supply Chain Optimization Opportunity',
  'Hi Sarah, I noticed Tesla has been increasing battery component shipments from Asia. Would you be interested in optimizing your supply chain visibility?',
  NOW() - INTERVAL '2 days',
  true,
  true,
  false,
  'sent',
  auth.users.id
FROM public.crm_contacts crm
JOIN auth.users ON auth.users.id = crm.added_by_user
WHERE auth.users.email = 'info@getb3acon.com' 
AND crm.company_name = 'Tesla Inc';

-- 7. Grant admin access to all RLS policies
-- This ensures the admin user can see all data regardless of RLS restrictions

-- Create admin role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
    CREATE ROLE admin_role;
  END IF;
END
$$;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin_role;
GRANT USAGE ON SCHEMA public TO admin_role;

-- Set the admin user's role in JWT claims (this will be handled by auth hooks)
-- Note: In production, this would be set via Supabase Auth hooks

-- 8. Confirmation query to verify setup
SELECT 
  'Admin user setup completed for: ' || email as status,
  'Role: ' || (raw_app_meta_data->>'role') as role,
  'Plan: ' || (raw_app_meta_data->>'plan') as plan,
  'Admin Level: ' || (raw_app_meta_data->>'admin_level') as admin_level
FROM auth.users 
WHERE email = 'info@getb3acon.com';

-- Instructions:
-- 1. First, go to /signup and create account with: info@getb3acon.com / 7354
-- 2. Then run this SQL script in Supabase SQL Editor
-- 3. The user will have full admin access to test all gated features