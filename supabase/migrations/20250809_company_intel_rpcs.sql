-- =====================================================================
-- Company Intelligence RPCs (COALESCE-safe)
-- - compute_heat_score(company_id int)
-- - v_company_standard_intel_rpc(p_company_id int)
-- - v_company_premium_intel_rpc(p_company_id int)
-- - upsert_crm_company(p_company_id int)
--
-- Design:
-- - Heat score is derived from shipments recency/volume and CRM enrichment.
-- - RPCs read from views; guarded if views unavailable.
-- - Upsert targets public.crm_contacts using name from profiles/companies.
-- =====================================================================

-- Helper: safe boolean to int
CREATE OR REPLACE FUNCTION public.bool_to_int(p boolean)
RETURNS int LANGUAGE sql IMMUTABLE AS $$ SELECT CASE WHEN p THEN 1 ELSE 0 END $$;

-- compute_heat_score(company_id int): returns int 0..100
CREATE OR REPLACE FUNCTION public.compute_heat_score(company_id int)
RETURNS int
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_name text;
  v_last_shipment date := DATE '1970-01-01';
  v_total_shipments bigint := 0;
  v_contacts int := 0;
  v_has_apollo boolean := false;
  v_score int := 0;
BEGIN
  -- Resolve company name from public.companies or public.company_profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='companies') THEN
    SELECT name INTO v_name FROM public.companies WHERE id = company_id::bigint LIMIT 1;
  END IF;
  IF v_name IS NULL THEN
    SELECT cp.company_name INTO v_name
    FROM public.company_profiles cp
    WHERE (cp.company_name IS NOT NULL)
    ORDER BY CASE WHEN cp.company_name ILIKE (SELECT name FROM public.companies WHERE id = company_id::bigint LIMIT 1) THEN 0 ELSE 1 END
    LIMIT 1;
  END IF;

  -- Load aggregates from views if present
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema='public' AND table_name='v_company_standard_intel') THEN
    SELECT
      COALESCE(last_shipment_date, DATE '1970-01-01'),
      COALESCE(total_shipments, 0),
      COALESCE(contacts_count, 0),
      COALESCE(has_apollo_enrichment, false)
    INTO v_last_shipment, v_total_shipments, v_contacts, v_has_apollo
    FROM public.v_company_standard_intel
    WHERE TRIM(LOWER(company_name)) = TRIM(LOWER(COALESCE(v_name,'')))
    LIMIT 1;
  END IF;

  -- Scoring: recency (0..40), shipments (0..40), CRM enrichment (0..20)
  IF v_last_shipment >= (now() - interval '30 days') THEN
    v_score := v_score + 40;
  ELSIF v_last_shipment >= (now() - interval '90 days') THEN
    v_score := v_score + 30;
  ELSIF v_last_shipment >= (now() - interval '180 days') THEN
    v_score := v_score + 20;
  ELSIF v_last_shipment >= (now() - interval '365 days') THEN
    v_score := v_score + 10;
  END IF;

  IF v_total_shipments >= 100 THEN
    v_score := v_score + 40;
  ELSIF v_total_shipments >= 20 THEN
    v_score := v_score + 30;
  ELSIF v_total_shipments >= 5 THEN
    v_score := v_score + 20;
  ELSIF v_total_shipments >= 1 THEN
    v_score := v_score + 10;
  END IF;

  v_score := v_score + LEAST(10, COALESCE(v_contacts,0));
  v_score := v_score + (10 * public.bool_to_int(v_has_apollo));

  IF v_score > 100 THEN v_score := 100; END IF;
  IF v_score < 0 THEN v_score := 0; END IF;
  RETURN v_score;
END;
$$;

-- v_company_standard_intel_rpc(p_company_id int)
CREATE OR REPLACE FUNCTION public.v_company_standard_intel_rpc(p_company_id int)
RETURNS TABLE (
  company_id_int int,
  company_name text,
  industry text,
  headquarters_city text,
  headquarters_country text,
  total_shipments bigint,
  last_shipment_date date,
  contacts_count int,
  has_apollo_enrichment boolean,
  heat_score int
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT * FROM public.v_company_standard_intel v
    WHERE (v.company_id_int = p_company_id)
       OR (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = p_company_id::bigint AND TRIM(LOWER(c.name)) = TRIM(LOWER(v.company_name))))
    LIMIT 1
  )
  SELECT
    b.company_id_int,
    b.company_name,
    b.industry,
    b.headquarters_city,
    b.headquarters_country,
    COALESCE(b.total_shipments,0) AS total_shipments,
    COALESCE(b.last_shipment_date, DATE '1970-01-01') AS last_shipment_date,
    COALESCE(b.contacts_count,0) AS contacts_count,
    COALESCE(b.has_apollo_enrichment,false) AS has_apollo_enrichment,
    public.compute_heat_score(p_company_id) AS heat_score
  FROM base b;
END;
$$;

-- v_company_premium_intel_rpc(p_company_id int)
CREATE OR REPLACE FUNCTION public.v_company_premium_intel_rpc(p_company_id int)
RETURNS TABLE (
  company_id_int int,
  company_name text,
  industry text,
  headquarters_city text,
  headquarters_country text,
  total_shipments bigint,
  last_shipment_date date,
  contacts_count int,
  has_apollo_enrichment boolean,
  value_usd_12m numeric,
  air_shipments_12m bigint,
  ocean_shipments_12m bigint,
  heat_score int
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT * FROM public.v_company_premium_intel v
    WHERE (v.company_id_int = p_company_id)
       OR (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = p_company_id::bigint AND TRIM(LOWER(c.name)) = TRIM(LOWER(v.company_name))))
    LIMIT 1
  )
  SELECT
    b.company_id_int,
    b.company_name,
    b.industry,
    b.headquarters_city,
    b.headquarters_country,
    COALESCE(b.total_shipments,0) AS total_shipments,
    COALESCE(b.last_shipment_date, DATE '1970-01-01') AS last_shipment_date,
    COALESCE(b.contacts_count,0) AS contacts_count,
    COALESCE(b.has_apollo_enrichment,false) AS has_apollo_enrichment,
    COALESCE(b.value_usd_12m,0)::numeric AS value_usd_12m,
    COALESCE(b.air_shipments_12m,0) AS air_shipments_12m,
    COALESCE(b.ocean_shipments_12m,0) AS ocean_shipments_12m,
    public.compute_heat_score(p_company_id) AS heat_score
  FROM base b;
END;
$$;

-- upsert_crm_company(p_company_id int)
-- Creates or updates a minimal crm_contacts row for the company
CREATE OR REPLACE FUNCTION public.upsert_crm_company(p_company_id int)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_name text;
  v_user uuid := auth.uid();
  v_row_id uuid;
BEGIN
  -- Resolve name from companies, fallback to company_profiles
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='companies') THEN
    SELECT name INTO v_company_name FROM public.companies WHERE id = p_company_id::bigint LIMIT 1;
  END IF;
  IF v_company_name IS NULL THEN
    SELECT company_name INTO v_company_name
    FROM public.company_profiles cp
    WHERE TRIM(LOWER(cp.company_name)) = TRIM(LOWER((SELECT name FROM public.companies WHERE id = p_company_id::bigint LIMIT 1)))
    OR p_company_id IS NOT NULL
    LIMIT 1;
  END IF;

  v_company_name := COALESCE(NULLIF(TRIM(v_company_name),''), 'Unknown Company');

  INSERT INTO public.crm_contacts (id, company_name, contact_name, title, email, linkedin_url, industry, added_by_user)
  VALUES (gen_random_uuid(), v_company_name, NULL, NULL, NULL, NULL, NULL, v_user)
  ON CONFLICT (company_name)
  DO UPDATE SET company_name = EXCLUDED.company_name
  RETURNING id INTO v_row_id;

  RETURN v_row_id;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.compute_heat_score(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.v_company_standard_intel_rpc(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.v_company_premium_intel_rpc(int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_crm_company(int) TO authenticated;


