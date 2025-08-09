### Logistic Intel Database Additions

This document describes new COALESCE-safe views and RPCs added via migrations under `supabase/migrations/`.

### Views

- v_company_standard_intel
  - Source: `public.company_profiles` with optional enrichments from `public.trade_data_view`, `public.crm_contacts`, and `public.companies` when present.
  - Columns:
    - `company_id_int` (int, may be NULL if `public.companies` absent)
    - `company_name` (text, never NULL)
    - `industry` (text, default 'unknown')
    - `headquarters_city` (text, default 'unknown')
    - `headquarters_country` (text, default 'unknown')
    - `total_shipments` (bigint, default 0)
    - `last_shipment_date` (date, default 1970-01-01)
    - `contacts_count` (int, default 0)
    - `has_apollo_enrichment` (boolean, default false)

- v_company_premium_intel
  - Extends standard view with 12-month trade metrics if `public.trade_data_view` exists.
  - Columns (in addition to standard):
    - `value_usd_12m` (numeric, default 0)
    - `air_shipments_12m` (bigint, default 0)
    - `ocean_shipments_12m` (bigint, default 0)

### RPCs

- compute_heat_score(company_id int) -> int
  - Combines recency, volume, and CRM enrichment to compute 0..100.

- v_company_standard_intel_rpc(p_company_id int)
  - Returns one row from `v_company_standard_intel` for the given company id, plus `heat_score`.

- v_company_premium_intel_rpc(p_company_id int)
  - Returns one row from `v_company_premium_intel` for the given company id, plus `heat_score`.

- upsert_crm_company(p_company_id int) -> uuid
  - Creates or updates a minimal `crm_contacts` record for the resolved company name. Requires auth; respects existing RLS.

### Test Queries

Run in Supabase SQL editor (staging):

```sql
-- Views exist
SELECT to_regclass('public.v_company_standard_intel') IS NOT NULL AS has_standard,
       to_regclass('public.v_company_premium_intel') IS NOT NULL AS has_premium;

-- Sample data
SELECT * FROM public.v_company_standard_intel ORDER BY total_shipments DESC NULLS LAST LIMIT 10;
SELECT * FROM public.v_company_premium_intel ORDER BY value_usd_12m DESC NULLS LAST LIMIT 10;

-- Heat score
SELECT public.compute_heat_score(1) AS heat_score_example;

-- RPCs
SELECT * FROM public.v_company_standard_intel_rpc(1);
SELECT * FROM public.v_company_premium_intel_rpc(1);

-- Upsert into CRM
SELECT public.upsert_crm_company(1) AS crm_contact_id;

-- Verify CRM insert
SELECT company_name, added_by_user FROM public.crm_contacts
ORDER BY created_at DESC LIMIT 5;
```

### Notes

- All outputs use COALESCE defaults to avoid NULL handling in the app.
- Migrations are safe if optional tables/views are missing.
- No production secrets are added; staging only.


