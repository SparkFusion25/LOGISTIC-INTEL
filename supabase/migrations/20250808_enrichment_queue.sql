-- 1️⃣ Create enrichment_queue table (UUID-based, linked to CRM)
CREATE TABLE IF NOT EXISTS public.enrichment_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
    enrichment_status text DEFAULT 'pending' CHECK (enrichment_status IN ('pending','processing','completed','failed')),
    provider text DEFAULT 'apollo',
    enriched_data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 1b️⃣ updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enrichment_queue_updated_at ON public.enrichment_queue;
CREATE TRIGGER trg_enrichment_queue_updated_at
BEFORE UPDATE ON public.enrichment_queue
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2️⃣ Auto-queue for Apollo enrichment when new CRM contact is added
CREATE OR REPLACE FUNCTION public.queue_contact_for_enrichment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.enrichment_queue (contact_id, provider)
  VALUES (NEW.id, 'apollo');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_queue_contact_for_enrichment ON public.crm_contacts;
CREATE TRIGGER trg_queue_contact_for_enrichment
AFTER INSERT ON public.crm_contacts
FOR EACH ROW
EXECUTE FUNCTION public.queue_contact_for_enrichment();

-- 3️⃣ RLS: enable and policies
ALTER TABLE public.enrichment_queue ENABLE ROW LEVEL SECURITY;

-- Allow users to view queue rows for their own contacts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'enrichment_queue' AND policyname = 'Users can view their enrichment rows'
  ) THEN
    CREATE POLICY "Users can view their enrichment rows" ON public.enrichment_queue
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.crm_contacts c
        WHERE c.id = enrichment_queue.contact_id AND c.added_by_user = auth.uid()
      )
    );
  END IF;
END$$;

-- Admin can manage all rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'enrichment_queue' AND policyname = 'Admins manage all enrichment rows'
  ) THEN
    CREATE POLICY "Admins manage all enrichment rows" ON public.enrichment_queue
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND (u.raw_user_meta_data->>'role') = 'admin'
      ) OR EXISTS (
        SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND (u.raw_user_meta_data->>'role') = 'admin'
      ) OR EXISTS (
        SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'
      )
    );
  END IF;
END$$;

-- Service role bypasses RLS, but allow users to insert only via the trigger (no direct insert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'enrichment_queue' AND policyname = 'Prevent direct inserts'
  ) THEN
    CREATE POLICY "Prevent direct inserts" ON public.enrichment_queue
    FOR INSERT TO authenticated
    WITH CHECK (false);
  END IF;
END$$;