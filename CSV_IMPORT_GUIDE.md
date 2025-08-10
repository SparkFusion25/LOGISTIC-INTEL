# CSV Import Guide

## 5.1 File Format
- **Encoding:** UTF-8 (no BOM)
- **Delimiter:** `,`
- **Quotes:** wrap fields with commas/quotes/linebreaks in `"`
- **Date:** `YYYY-MM-DD`
- **Nulls:** blank (no `NULL/N/A`)
- **IDs:** use UUIDv4 for `id` and `company_id`
- **Headers:** lowercase, match schema exactly

## 5.2 CSVs
- **companies.csv** → columns:
  `id,company_name,country,confidence_score,total_shipments,last_activity,created_at,updated_at,owner_user_id`
- **shipments.csv** → columns:
  `id,company_id,bol_number,departure_date,arrival_date,origin_country,destination_country,hs_code,product_description,gross_weight_kg,transport_mode,progress`
- **crm_contacts.csv** (optional) → columns:
  `id,company_id,full_name,email,phone,title,added_by_user`

## 5.3 COPY Commands
```sql
COPY public.companies
(id,company_name,country,confidence_score,total_shipments,last_activity,created_at,updated_at,owner_user_id)
FROM '/absolute/path/companies.csv' WITH (FORMAT csv, HEADER true);

COPY public.shipments
(id,company_id,bol_number,departure_date,arrival_date,origin_country,destination_country,hs_code,product_description,gross_weight_kg,transport_mode,progress)
FROM '/absolute/path/shipments.csv' WITH (FORMAT csv, HEADER true);

-- optional if you have contacts:
COPY public.crm_contacts
(id,company_id,full_name,email,phone,title,added_by_user)
FROM '/absolute/path/crm_contacts.csv' WITH (FORMAT csv, HEADER true);
```

## 5.4 Post-Import Verification
```sql
SELECT count(*) FROM public.companies;
SELECT count(*) FROM public.shipments;
-- Orphan check (must be zero):
SELECT count(*) FROM public.shipments s
LEFT JOIN public.companies c ON c.id = s.company_id
WHERE c.id IS NULL;
```

## 5.5 Queue Enrichment
```sql
-- Example if you maintain enrichment_queue
INSERT INTO public.enrichment_queue (company_id, created_at)
SELECT id, now()
FROM public.companies
WHERE id NOT IN (SELECT company_id FROM public.crm_contacts);
```
