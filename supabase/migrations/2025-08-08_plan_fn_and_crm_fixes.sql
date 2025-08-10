-- === PLAN FN + CRM FIXES ===
-- 1) Helper: get_user_plan(auth.uid())
CREATE OR REPLACE FUNCTION public.get_user_plan(p_uid uuid)
RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(up.plan, (u.raw_user_meta_data->>'plan'))::text
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  WHERE u.id = p_uid
$$;

-- 2) Companies: optional normalization helpers + uniqueness guard (within tenant/adder)
CREATE OR REPLACE FUNCTION public.norm_text(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN t IS NULL THEN NULL ELSE trim(regexp_replace(lower(t), '\\s+', ' ', 'g')) END;
$$;

-- Add missing columns (guarded)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='companies' AND column_name='added_by_user'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN added_by_user uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Scoped uniqueness per user (company_name+country per tenant)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uq_companies_name_country_by_user'
  ) THEN
    CREATE UNIQUE INDEX uq_companies_name_country_by_user
    ON public.companies (norm_text(company_name), norm_text(country), added_by_user)
    WHERE company_name IS NOT NULL;
  END IF;
END $$;

-- 3) CRM contacts: ensure company_id exists and email uniqueness scoped by company
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='crm_contacts' AND column_name='company_id'
  ) THEN
    ALTER TABLE public.crm_contacts ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='uq_crm_company_email'
  ) THEN
    ALTER TABLE public.crm_contacts
    ADD CONSTRAINT uq_crm_company_email UNIQUE (company_id, email);
  END IF;
END $$;

-- 4) RLS sanity: allow users to manage their own companies/contacts, admins full access
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS companies_user_rw ON public.companies';
  EXECUTE 'DROP POLICY IF EXISTS companies_admin_all ON public.companies';
  EXECUTE 'DROP POLICY IF EXISTS crm_user_rw ON public.crm_contacts';
  EXECUTE 'DROP POLICY IF EXISTS crm_admin_all ON public.crm_contacts';
EXCEPTION WHEN OTHERS THEN NULL; END $$;

CREATE POLICY companies_user_rw ON public.companies
  FOR ALL USING (added_by_user = auth.uid())
  WITH CHECK (added_by_user = auth.uid());

CREATE POLICY companies_admin_all ON public.companies
  FOR ALL USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND (u.raw_user_meta_data->>'role')='admin'
  ));

CREATE POLICY crm_user_rw ON public.crm_contacts
  FOR ALL USING (added_by_user = auth.uid())
  WITH CHECK (added_by_user = auth.uid());

CREATE POLICY crm_admin_all ON public.crm_contacts
  FOR ALL USING (EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND (u.raw_user_meta_data->>'role')='admin'
  ));