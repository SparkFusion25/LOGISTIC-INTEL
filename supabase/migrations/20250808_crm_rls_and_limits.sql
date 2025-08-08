-- =========================================
-- RLS Policy for crm_contacts
-- =========================================

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.crm_contacts;
DROP POLICY IF EXISTS "Admins manage all contacts" ON public.crm_contacts;

-- Common admin condition
CREATE OR REPLACE FUNCTION public.is_admin_uid(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = p_uid AND LOWER(au.raw_user_meta_data->>'role') = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = p_uid AND LOWER(up.role) = 'admin'
  );
$$;

-- View own contacts (or all if admin)
CREATE POLICY "Users can view own contacts"
ON public.crm_contacts
FOR SELECT
USING (
  added_by_user = auth.uid()
  OR public.is_admin_uid(auth.uid())
);

-- Insert own contacts (or any if admin)
CREATE POLICY "Users can insert own contacts"
ON public.crm_contacts
FOR INSERT
WITH CHECK (
  added_by_user = auth.uid()
  OR public.is_admin_uid(auth.uid())
);

-- Update own contacts (or any if admin)
CREATE POLICY "Users can update own contacts"
ON public.crm_contacts
FOR UPDATE
USING (
  added_by_user = auth.uid()
  OR public.is_admin_uid(auth.uid())
)
WITH CHECK (
  added_by_user = auth.uid()
  OR public.is_admin_uid(auth.uid())
);

-- Delete own contacts (or any if admin)
CREATE POLICY "Users can delete own contacts"
ON public.crm_contacts
FOR DELETE
USING (
  added_by_user = auth.uid()
  OR public.is_admin_uid(auth.uid())
);

-- =========================================
-- Trigger to enforce plan limits (trial, starter, pro, enterprise)
-- =========================================

-- Helper: get_user_plan with 7-day trial handling
CREATE OR REPLACE FUNCTION public.get_user_plan(p_uid uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  WITH up AS (
    SELECT LOWER(COALESCE(plan, 'free')) AS plan, created_at
    FROM public.user_profiles
    WHERE id = p_uid
    LIMIT 1
  )
  SELECT CASE
    WHEN public.is_admin_uid(p_uid) THEN 'enterprise'
    WHEN EXISTS (SELECT 1 FROM up) THEN (
      SELECT CASE
        WHEN plan = 'trial' AND created_at >= (now() - interval '7 days') THEN 'trial'
        WHEN plan = 'trial' THEN 'free'
        ELSE plan
      END FROM up
    )
    ELSE 'free'
  END;
$$;

-- Helper: plan-specific CRM limit (NULL = unlimited)
CREATE OR REPLACE FUNCTION public.plan_crm_limit(p_plan text)
RETURNS int
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN LOWER(COALESCE(p_plan, 'free')) = 'enterprise' THEN NULL
    WHEN LOWER(COALESCE(p_plan, 'free')) = 'pro'        THEN 500   -- keep aligned with app TIERS
    WHEN LOWER(COALESCE(p_plan, 'free')) = 'starter'    THEN 50
    WHEN LOWER(COALESCE(p_plan, 'free')) = 'trial'      THEN 20
    ELSE 0  -- free plan cannot add CRM contacts
  END;
$$;

-- Enforce limit trigger
CREATE OR REPLACE FUNCTION public.enforce_crm_contact_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_user uuid := NEW.added_by_user;
  v_plan text := public.get_user_plan(v_user);
  v_is_admin boolean := public.is_admin_uid(v_user);
  v_limit int := public.plan_crm_limit(v_plan);
  v_count int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'CRM contact insert blocked: added_by_user is required';
  END IF;

  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- Unlimited
  IF v_limit IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count existing contacts for this user
  SELECT COUNT(*) INTO v_count
  FROM public.crm_contacts
  WHERE added_by_user = v_user;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'CRM contact limit reached for plan % (limit=%). Please upgrade.', v_plan, v_limit
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trg_enforce_crm_contact_limit ON public.crm_contacts;
CREATE TRIGGER trg_enforce_crm_contact_limit
BEFORE INSERT ON public.crm_contacts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_crm_contact_limit();