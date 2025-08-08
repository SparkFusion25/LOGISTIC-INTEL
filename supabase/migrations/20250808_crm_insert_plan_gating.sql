-- Enable RLS on crm_contacts (if not already)
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

-- Add plan-gated insert policy (drop existing similarly named policy first)
DROP POLICY IF EXISTS "crm: insert plan-gated" ON public.crm_contacts;

CREATE POLICY "crm: insert plan-gated"
  ON public.crm_contacts FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin_uid(auth.uid()) OR public.get_user_plan(auth.uid()) IN ('pro','enterprise')
  );