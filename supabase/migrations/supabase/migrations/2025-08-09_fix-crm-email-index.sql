-- Fix oversized email index on public.crm_contacts
-- Safe to re-run

-- 1) Drop any prior email indexes that might conflict
drop index if exists idx_crm_email;
drop index if exists crm_contacts_email_idx;
drop index if exists crm_contacts_company_email_uniq;
drop index if exists crm_contacts_company_email_expr_uniq;
drop index if exists crm_contacts_email_trgm_idx;
drop index if exists crm_contacts_company_email_hash_uniq;

-- 2) Normalizer used by our hash unique index
create or replace function public.norm_text(t text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(coalesce(t,'')), '\s+', '', 'g')
$$;

-- 3) Keep huge values but move them out of email into email_raw
alter table public.crm_contacts
  add column if not exists email_raw text;

-- copy huge values to email_raw
update public.crm_contacts
set email_raw = email
where email is not null and length(email) > 500;

-- null out absurdly long emails so they don’t get indexed
update public.crm_contacts
set email = null
where email is not null and length(email) > 500;

-- 4) Add a length check constraint (only if missing)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'crm_contacts_email_len_chk'
      and conrelid = 'public.crm_contacts'::regclass
  ) then
    alter table public.crm_contacts
      add constraint crm_contacts_email_len_chk
      check (email is null or length(email) <= 500);
  end if;
end$$;

-- 5) Hash-based unique index for equality/dup checks
-- avoids btree row-size limit
create unique index if not exists crm_contacts_company_email_hash_uniq
  on public.crm_contacts (company_id, md5(public.norm_text(email)))
  where email is not null;

-- 6) Optional: fast contains/fuzzy searches
create extension if not exists pg_trgm;
create index if not exists crm_contacts_email_trgm_idx
  on public.crm_contacts
  using gin (email gin_trgm_ops);
