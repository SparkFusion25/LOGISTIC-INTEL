-- 2.1 Introspect shipments and confirm mode column
SELECT column_name
FROM information_schema.columns
WHERE table_schema='public' AND table_name='shipments';
-- Ensure there is a text column that holds 'ocean'/'air' (e.g., transport_mode).

-- 2.2 Create/get user plan function (reads from user_profiles)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','enterprise')),
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','starter','pro','enterprise')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active','inactive','trial','cancelled')),
  admin_permissions TEXT[] DEFAULT '{}',
  features_enabled  TEXT[] DEFAULT '{}',
  api_usage_limit   INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.get_user_plan(uid uuid) RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT plan FROM public.user_profiles WHERE id = uid
$$;

-- 2.3 CRM contacts (policy-compliant)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  title TEXT,
  added_by_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, email)
);

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm: manage own" ON public.crm_contacts;
DROP POLICY IF EXISTS "crm: admin override" ON public.crm_contacts;

CREATE POLICY "crm: manage own"
  ON public.crm_contacts FOR ALL
  USING (added_by_user = auth.uid());

CREATE POLICY "crm: admin override"
  ON public.crm_contacts FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 2.4 Shipments RLS (user isolation + tier filter)
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipments: select" ON public.shipments;

-- Replace transport_mode with the actual mode column if different
CREATE POLICY "shipments: select"
  ON public.shipments
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies
      WHERE owner_user_id = auth.uid()
    )
    AND (
      (public.get_user_plan(auth.uid()) IN ('trial','starter') AND transport_mode = 'ocean')
      OR public.get_user_plan(auth.uid()) IN ('pro','enterprise')
    )
  );

-- 2.5 Admin user (enterprise plan)
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'role','admin','plan','enterprise','admin_level','full',
  'full_name','Admin Test User','company','Logistic Intel'
),
email_confirmed_at = now()
WHERE email = 'info@getb3acon.com';

INSERT INTO public.user_profiles (id,email,full_name,company,role,plan,subscription_status,
  admin_permissions,features_enabled,api_usage_limit)
SELECT id,'info@getb3acon.com','Admin Test User','Logistic Intel','admin','enterprise','active',
  ARRAY['user_management','billing_access','analytics_access','api_access','admin_panel','full_admin'],
  ARRAY['contact_enrichment','trend_analysis','campaign_builder','advanced_filters','export_data','unlimited_search','api_access','admin_panel','user_management','billing_access','analytics_access'],
  999999
FROM auth.users WHERE email='info@getb3acon.com'
ON CONFLICT (id) DO UPDATE
SET role='admin', plan='enterprise', subscription_status='active',
    admin_permissions=EXCLUDED.admin_permissions, features_enabled=EXCLUDED.features_enabled,
    api_usage_limit=EXCLUDED.api_usage_limit, updated_at=now();
