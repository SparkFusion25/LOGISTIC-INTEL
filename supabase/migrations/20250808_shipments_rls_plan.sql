-- Enable RLS on shipments
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on shipments
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='shipments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.shipments', r.policyname);
  END LOOP;
END$$;

-- Owner select (based on added_by_user)
CREATE POLICY "shipments: select own"
  ON public.shipments FOR SELECT TO authenticated
  USING (added_by_user = auth.uid() OR public.is_admin_uid(auth.uid()));

-- Plan filter: trial/starter ocean only; pro/enterprise all
CREATE POLICY "shipments: plan filter"
  ON public.shipments FOR SELECT TO authenticated
  USING (
    (
      public.get_user_plan(auth.uid()) IN ('trial','starter')
      AND lower(coalesce(shipment_type,'')) = 'ocean'
    )
    OR public.get_user_plan(auth.uid()) IN ('pro','enterprise')
    OR public.is_admin_uid(auth.uid())
  );