-- Helpers and trigger to enforce Apollo enrichment limits by plan and 7-day trial

-- 0️⃣ Ensure admin helper exists
CREATE OR REPLACE FUNCTION public.is_admin_uid(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p_uid AND (u.raw_user_meta_data->>'role') = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = p_uid AND up.role = 'admin'
  );
$$;

-- 1️⃣ Get user plan with trial expiry handling
CREATE OR REPLACE FUNCTION public.get_user_plan(p_uid uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  WITH up AS (
    SELECT plan, created_at
    FROM public.user_profiles
    WHERE id = p_uid
    LIMIT 1
  )
  SELECT CASE
    WHEN public.is_admin_uid(p_uid) THEN 'enterprise'
    WHEN EXISTS (SELECT 1 FROM up) THEN (
      SELECT CASE
        WHEN lower(coalesce(plan, 'free')) = 'trial' AND (created_at >= now() - interval '7 days') THEN 'trial'
        WHEN lower(coalesce(plan, 'free')) = 'trial' THEN 'free'
        ELSE lower(coalesce(plan, 'free'))
      END FROM up
    )
    ELSE 'free'
  END;
$$;

-- 2️⃣ Helper: check if user is within trial period
CREATE OR REPLACE FUNCTION public.is_trial_user(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.id = p_uid
      AND lower(up.plan) = 'trial'
      AND up.created_at >= (now() - interval '7 days')
  );
$$;

-- 3️⃣ Helper: enrichment per-plan cap (NULL means unlimited)
CREATE OR REPLACE FUNCTION public.plan_enrichment_limit(p_plan text, p_trial int, p_starter int, p_pro int)
RETURNS int
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN lower(coalesce(p_plan, 'free')) = 'enterprise' THEN NULL
    WHEN lower(coalesce(p_plan, 'free')) = 'pro'        THEN p_pro
    WHEN lower(coalesce(p_plan, 'free')) = 'starter'    THEN p_starter
    WHEN lower(coalesce(p_plan, 'free')) = 'trial'      THEN p_trial
    ELSE p_starter
  END;
$$;

-- 4️⃣ Replace trigger to auto-queue with plan enforcement
CREATE OR REPLACE FUNCTION public.queue_contact_for_enrichment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_user uuid := NEW.added_by_user;
  v_plan text := public.get_user_plan(v_user);
  v_is_admin boolean := public.is_admin_uid(v_user);
  v_limit int := public.plan_enrichment_limit(v_plan, 5, 50, 500); -- trial=5, starter=50, pro=500, enterprise=NULL
  v_count int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Enrichment queue insert blocked: added_by_user is required';
  END IF;

  -- Admin bypass
  IF v_is_admin THEN
    INSERT INTO public.enrichment_queue (contact_id, provider) VALUES (NEW.id, 'apollo');
    RETURN NEW;
  END IF;

  -- Unlimited for enterprise
  IF v_limit IS NULL THEN
    INSERT INTO public.enrichment_queue (contact_id, provider) VALUES (NEW.id, 'apollo');
    RETURN NEW;
  END IF;

  -- Count existing queued items for this user
  SELECT COUNT(*) INTO v_count
  FROM public.enrichment_queue eq
  JOIN public.crm_contacts cc ON cc.id = eq.contact_id
  WHERE cc.added_by_user = v_user;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Enrichment limit reached for plan % (limit=%). Please upgrade.', v_plan, v_limit
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.enrichment_queue (contact_id, provider) VALUES (NEW.id, 'apollo');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_queue_contact_for_enrichment ON public.crm_contacts;
CREATE TRIGGER trg_queue_contact_for_enrichment
AFTER INSERT ON public.crm_contacts
FOR EACH ROW
EXECUTE FUNCTION public.queue_contact_for_enrichment();