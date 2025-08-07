-- =============================================================
-- RLS POLICY UPDATE: User Isolation + Admin Privileges
-- Targets: companies, shipments, crm_contacts
-- Run this in Supabase SQL editor against your project
-- =============================================================

-- Helper admin condition: checks either auth.users.raw_user_meta_data.role or public.user_profiles.role
-- We inline the OR condition directly in policies to avoid creating extra database functions

-- =====================
-- Companies
-- =====================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies'
  ) THEN
    -- Enable RLS
    EXECUTE 'ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY';

    -- Drop existing conflicting policies (ignore if missing)
    EXECUTE 'DROP POLICY IF EXISTS "Users can view own companies" ON public.companies';
    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own companies" ON public.companies';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can access all companies" ON public.companies';

    -- Users can view own companies
    EXECUTE $$
      CREATE POLICY "Users can view own companies"
      ON public.companies
      FOR SELECT
      TO authenticated
      USING (auth.uid() = added_by_user)
    $$;

    -- Users can manage own companies (SELECT/INSERT/UPDATE/DELETE)
    EXECUTE $$
      CREATE POLICY "Users can manage own companies"
      ON public.companies
      FOR ALL
      TO authenticated
      USING (auth.uid() = added_by_user)
      WITH CHECK (auth.uid() = added_by_user)
    $$;

    -- Admins can access all companies (SELECT/INSERT/UPDATE/DELETE)
    EXECUTE $$
      CREATE POLICY "Admins can access all companies"
      ON public.companies
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u
          WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
        OR EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users u
          WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
        OR EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role = 'admin'
        )
      )
    $$;
  END IF;
END$$;

-- =====================
-- Shipments
-- Assumes shipments table has company_id referencing public.companies(id)
-- =====================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shipments'
  ) THEN
    EXECUTE 'ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Users can view their companies'' shipments" ON public.shipments';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can access all shipments" ON public.shipments';

    -- Users can view shipments of their companies
    EXECUTE $$
      CREATE POLICY "Users can view their companies' shipments"
      ON public.shipments
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.companies c
          WHERE c.id = shipments.company_id
            AND c.added_by_user = auth.uid()
        )
      )
    $$;

    -- Admins can access all shipments (SELECT/INSERT/UPDATE/DELETE)
    EXECUTE $$
      CREATE POLICY "Admins can access all shipments"
      ON public.shipments
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u
          WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
        OR EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users u
          WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
        OR EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role = 'admin'
        )
      )
    $$;
  END IF;
END$$;

-- =====================
-- CRM Contacts
-- =====================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crm_contacts'
  ) THEN
    EXECUTE 'ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Users can manage own CRM contacts" ON public.crm_contacts';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage all CRM contacts" ON public.crm_contacts';

    -- Users can manage their own CRM contacts
    EXECUTE $$
      CREATE POLICY "Users can manage own CRM contacts"
      ON public.crm_contacts
      FOR ALL
      TO authenticated
      USING (auth.uid() = added_by_user)
      WITH CHECK (auth.uid() = added_by_user)
    $$;

    -- Admins can manage all CRM contacts
    EXECUTE $$
      CREATE POLICY "Admins can manage all CRM contacts"
      ON public.crm_contacts
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM auth.users u
          WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
        OR EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM auth.users u
          WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
        OR EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.role = 'admin'
        )
      )
    $$;
  END IF;
END$$;

-- =====================
-- Verification
-- =====================
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('companies','shipments','crm_contacts')
ORDER BY tablename, policyname;