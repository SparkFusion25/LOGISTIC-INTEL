-- =========================================================
-- Logistic Intel — Settings, Admin, Affiliate (no DO blocks)
-- Safe to re-run. Run on STAGING first.
-- =========================================================
create extension if not exists pgcrypto;

-- Helpers
create or replace function public.is_admin(p_uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from auth.users u
    left join public.user_profiles up on up.id = u.id
    where u.id = p_uid and ((u.raw_user_meta_data->>'role')='admin' or up.role='admin')
  );
$$;

create or replace function public.norm_text(t text)
returns text language sql immutable as $$
  select case when t is null then null else trim(regexp_replace(lower(t), '\\s+', ' ', 'g')) end;
$$;

create or replace function public.get_user_plan(p_uid uuid)
returns text language sql stable as $$
  select coalesce(up.plan, u.raw_user_meta_data->>'plan', 'trial')
  from auth.users u left join public.user_profiles up on up.id = u.id
  where u.id = p_uid;
$$;

-- user_profiles (extends if already exists)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  company text,
  role text default 'user' check (role in ('user','admin','enterprise')),
  plan text default 'trial' check (plan in ('trial','starter','pro','enterprise')),
  subscription_status text default 'inactive' check (subscription_status in ('active','inactive','trial','cancelled')),
  avatar_url text,
  company_logo_url text,
  sender_name text,
  sender_email text,
  signature_html text,
  signature_plain text,
  admin_permissions text[] default '{}',
  features_enabled text[] default '{}',
  api_usage_count integer default 0,
  api_usage_limit integer default 100,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $f$
begin new.updated_at := now(); return new; end
$f$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at before update on public.user_profiles
for each row execute function public.set_updated_at();

alter table public.user_profiles enable row level security;
drop policy if exists "profiles_self_select" on public.user_profiles;
drop policy if exists "profiles_self_upsert" on public.user_profiles;
drop policy if exists "profiles_admin_all" on public.user_profiles;

create policy "profiles_self_select" on public.user_profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_self_upsert" on public.user_profiles for all
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));
create policy "profiles_admin_all" on public.user_profiles for all
  using (public.is_admin(auth.uid()));

-- Companies minimal columns for unique index (if missing)
alter table public.companies add column if not exists company_name text;
alter table public.companies add column if not exists country text;
alter table public.companies add column if not exists industry text;
alter table public.companies add column if not exists added_by_user uuid references auth.users(id);
alter table public.companies add column if not exists created_at timestamptz default now();

-- Scoped uniqueness
drop index if exists uq_companies_name_country_by_user;
create unique index uq_companies_name_country_by_user
  on public.companies (public.norm_text(company_name), public.norm_text(country), added_by_user)
  where company_name is not null;

-- SHIPMENTS (ensure aligned)
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  shipment_id text,
  shipment_type text,
  arrival_date date,
  origin_country text,
  destination_country text,
  hs_code text,
  product_description text,
  weight_kg numeric,
  created_at timestamptz default now()
);
alter table public.shipments add column if not exists company_id uuid references public.companies(id) on delete cascade;
alter table public.shipments add column if not exists shipment_type text;
alter table public.shipments drop constraint if exists shipments_type_chk;
alter table public.shipments add constraint shipments_type_chk check (shipment_type in ('ocean','air'));
create index if not exists idx_shipments_company on public.shipments(company_id);
create index if not exists idx_shipments_arrival on public.shipments(arrival_date);
create index if not exists idx_shipments_type on public.shipments(shipment_type);
create index if not exists idx_shipments_hs on public.shipments(hs_code);

alter table public.shipments enable row level security;
drop policy if exists "shipments_user_rw" on public.shipments;
drop policy if exists "shipments_admin_all" on public.shipments;
create policy "shipments_user_rw" on public.shipments for all
  using (exists (select 1 from public.companies c where c.id=shipments.company_id and c.added_by_user=auth.uid()))
  with check (exists (select 1 from public.companies c where c.id=shipments.company_id and c.added_by_user=auth.uid()));
create policy "shipments_admin_all" on public.shipments for all using (public.is_admin(auth.uid()));

-- CRM CONTACTS (ensure aligned)
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  title text,
  added_by_user uuid references auth.users(id) on delete cascade,
  notes text,
  hs_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.crm_contacts add column if not exists company_id uuid references public.companies(id) on delete cascade;
alter table public.crm_contacts add column if not exists added_by_user uuid references auth.users(id) on delete cascade;
alter table public.crm_contacts add column if not exists updated_at timestamptz default now();

alter table public.crm_contacts drop constraint if exists uq_crm_company_email;
alter table public.crm_contacts add constraint uq_crm_company_email unique (company_id, email);
create index if not exists idx_crm_company on public.crm_contacts(company_id);
create index if not exists idx_crm_added_by on public.crm_contacts(added_by_user);

drop trigger if exists trg_crm_contacts_updated_at on public.crm_contacts;
create trigger trg_crm_contacts_updated_at before update on public.crm_contacts
for each row execute function public.set_updated_at();

alter table public.crm_contacts enable row level security;
drop policy if exists "crm_user_rw" on public.crm_contacts;
drop policy if exists "crm_admin_all" on public.crm_contacts;
create policy "crm_user_rw" on public.crm_contacts for all
  using (added_by_user = auth.uid()) with check (added_by_user = auth.uid());
create policy "crm_admin_all" on public.crm_contacts for all using (public.is_admin(auth.uid()));

-- ADMIN: promo codes
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','amount')),
  discount_value numeric not null,
  valid_from timestamptz,
  valid_to timestamptz,
  max_redemptions int,
  redemptions_used int default 0,
  active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.validate_promo(p_code text)
returns table(
  code text, discount_type text, discount_value numeric, valid boolean, reason text
) language sql stable as $$
  select code, discount_type, discount_value,
    (active is true)
    and (valid_from is null or now() >= valid_from)
    and (valid_to is null or now() <= valid_to)
    and (max_redemptions is null or redemptions_used < max_redemptions) as valid,
    case
      when active is not true then 'inactive'
      when valid_from is not null and now() < valid_from then 'not_started'
      when valid_to is not null and now() > valid_to then 'expired'
      when max_redemptions is not null and redemptions_used >= max_redemptions then 'exhausted'
      else 'ok'
    end as reason
  from public.promo_codes where lower(code)=lower(p_code) limit 1;
$$;

alter table public.promo_codes enable row level security;
drop policy if exists "promo_admin_all" on public.promo_codes;
create policy "promo_admin_all" on public.promo_codes for all using (public.is_admin(auth.uid()));

-- AFFILIATES
create table if not exists public.affiliate_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending','active','suspended')),
  default_rate_percent numeric default 20,
  payout_method text,
  payout_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.affiliate_accounts(id) on delete cascade,
  code text unique not null,
  destination_url text,
  created_at timestamptz default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references public.affiliate_links(id) on delete cascade,
  clicked_at timestamptz default now(),
  ip inet,
  user_agent text,
  referer text
);

create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references public.affiliate_links(id) on delete cascade,
  referred_user uuid references auth.users(id),
  plan text,
  status text check (status in ('trial','converted','refunded','chargeback')),
  amount_usd numeric,
  commission_usd numeric,
  occurred_at timestamptz default now()
);

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.affiliate_accounts(id) on delete cascade,
  period_start timestamptz,
  period_end timestamptz,
  amount_usd numeric,
  status text default 'pending' check (status in ('pending','paid','failed')),
  paid_at timestamptz,
  notes text
);

-- RLS: affiliates
alter table public.affiliate_accounts enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_referrals enable row level security;
alter table public.affiliate_payouts enable row level security;

-- Accounts
drop policy if exists "aff_acc_self_rw" on public.affiliate_accounts;
drop policy if exists "aff_acc_admin_all" on public.affiliate_accounts;
create policy "aff_acc_self_rw" on public.affiliate_accounts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "aff_acc_admin_all" on public.affiliate_accounts for all using (public.is_admin(auth.uid()));

-- Links
drop policy if exists "aff_links_self_rw" on public.affiliate_links;
drop policy if exists "aff_links_admin_all" on public.affiliate_links;
create policy "aff_links_self_rw" on public.affiliate_links for all
  using (exists (select 1 from public.affiliate_accounts a where a.id=affiliate_links.affiliate_id and a.user_id=auth.uid()))
  with check (exists (select 1 from public.affiliate_accounts a where a.id=affiliate_links.affiliate_id and a.user_id=auth.uid()));
create policy "aff_links_admin_all" on public.affiliate_links for all using (public.is_admin(auth.uid()));

-- Clicks: allow public insert (tracking pixel), affiliates/admin can select
drop policy if exists "aff_clicks_public_insert" on public.affiliate_clicks;
drop policy if exists "aff_clicks_aff_select" on public.affiliate_clicks;
drop policy if exists "aff_clicks_admin_all" on public.affiliate_clicks;
create policy "aff_clicks_public_insert" on public.affiliate_clicks for insert with check (true);
create policy "aff_clicks_aff_select" on public.affiliate_clicks for select
  using (exists (
    select 1 from public.affiliate_links l
    join public.affiliate_accounts a on a.id=l.affiliate_id
    where l.id = affiliate_clicks.link_id and (a.user_id = auth.uid() or public.is_admin(auth.uid()))
  ));
create policy "aff_clicks_admin_all" on public.affiliate_clicks for all using (public.is_admin(auth.uid()));

-- Referrals & Payouts: affiliates can read their rows; admin full
drop policy if exists "aff_ref_self_select" on public.affiliate_referrals;
drop policy if exists "aff_ref_admin_all" on public.affiliate_referrals;
create policy "aff_ref_self_select" on public.affiliate_referrals for select
  using (exists (
    select 1 from public.affiliate_links l
    join public.affiliate_accounts a on a.id=l.affiliate_id
    where l.id = affiliate_referrals.link_id and (a.user_id = auth.uid() or public.is_admin(auth.uid()))
  ));
create policy "aff_ref_admin_all" on public.affiliate_referrals for all using (public.is_admin(auth.uid()));

drop policy if exists "aff_payouts_self_select" on public.affiliate_payouts;
drop policy if exists "aff_payouts_admin_all" on public.affiliate_payouts;
create policy "aff_payouts_self_select" on public.affiliate_payouts for select
  using (exists (select 1 from public.affiliate_accounts a where a.id=affiliate_payouts.affiliate_id and (a.user_id=auth.uid() or public.is_admin(auth.uid()))));
create policy "aff_payouts_admin_all" on public.affiliate_payouts for all using (public.is_admin(auth.uid()));

-- Admin seed/confirm
update auth.users set
  raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || jsonb_build_object('role','admin','plan','enterprise'),
  email_confirmed_at = now()
where email='info@getb3acon.com';

insert into public.user_profiles (id,email,full_name,company,role,plan,subscription_status,api_usage_limit)
select u.id,u.email,'Admin Test User','Logistic Intel','admin','enterprise','active',999999
from auth.users u where u.email='info@getb3acon.com'
on conflict (id) do update set role='admin',plan='enterprise',subscription_status='active',updated_at=now();

-- Sanity
select 'OK' as status,
  (select count(*) from public.user_profiles) as profiles,
  (select count(*) from public.promo_codes) as promo_codes,
  (select count(*) from public.affiliate_accounts) as affiliates;