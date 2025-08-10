-- =============================
-- Settings/Admin/Affiliate (safe to re-run)
-- =============================
create extension if not exists pgcrypto;

-- Ensure helper from prior step
create or replace function public.is_admin(p_uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from auth.users u
    left join public.user_profiles up on up.id=u.id
    where u.id=p_uid and ((u.raw_user_meta_data->>'role')='admin' or up.role='admin')
  );
$$;

-- user_profiles enrichments (id is FK to auth.users)
alter table public.user_profiles add column if not exists avatar_url text;
alter table public.user_profiles add column if not exists company_logo_url text;
alter table public.user_profiles add column if not exists company_domain text;
alter table public.user_profiles add column if not exists email_signature_html text;

-- Promo codes (admin-managed, used by Stripe webhook)
create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  percent_off numeric,
  amount_off numeric,
  currency text,
  max_redemptions integer,
  redemptions_used integer default 0,
  active boolean default true,
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.promo_codes enable row level security;
drop policy if exists promo_admin on public.promo_codes;
create policy promo_admin on public.promo_codes for all using (public.is_admin(auth.uid()));

-- Affiliates (admin creates accounts and links; affiliates see own)
create table if not exists public.affiliate_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  default_rate_percent numeric default 20,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references public.affiliate_accounts(id) on delete cascade,
  code text unique not null,
  landing_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);
create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references public.affiliate_links(id) on delete set null,
  referred_user uuid references auth.users(id) on delete set null,
  plan text,
  status text,
  amount_usd numeric,
  commission_usd numeric,
  stripe_customer_id text,
  stripe_subscription_id text,
  promotion_code text,
  created_at timestamptz default now()
);

alter table public.affiliate_accounts enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.affiliate_referrals enable row level security;

-- RLS: affiliates see their stuff; admins full
-- accounts
drop policy if exists aff_admin on public.affiliate_accounts;
drop policy if exists aff_self on public.affiliate_accounts;
create policy aff_admin on public.affiliate_accounts for all using (public.is_admin(auth.uid()));
create policy aff_self on public.affiliate_accounts for select using (user_id=auth.uid());
-- links
drop policy if exists affl_admin on public.affiliate_links;
drop policy if exists affl_self on public.affiliate_links;
create policy affl_admin on public.affiliate_links for all using (public.is_admin(auth.uid()));
create policy affl_self on public.affiliate_links for select using (
  exists (select 1 from public.affiliate_accounts a where a.id=affiliate_id and a.user_id=auth.uid())
);
-- referrals
drop policy if exists afrr_admin on public.affiliate_referrals;
drop policy if exists afrr_self on public.affiliate_referrals;
create policy afrr_admin on public.affiliate_referrals for all using (public.is_admin(auth.uid()));
create policy afrr_self on public.affiliate_referrals for select using (
  exists (select 1 from public.affiliate_links l join public.affiliate_accounts a on a.id=l.affiliate_id where l.id=link_id and a.user_id=auth.uid())
);

-- Storage buckets: we'll use logos/ and avatars/ folder inside a single public bucket
-- You can't CREATE BUCKET via SQL reliably; we'll grant policy here assuming bucket name 'public-assets'.
-- Add storage policies if you use Supabase Storage with SQL policies enabled
create table if not exists public.public_assets_meta (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  path text unique not null,
  created_at timestamptz default now()
);
alter table public.public_assets_meta enable row level security;
drop policy if exists pam_self on public.public_assets_meta;
drop policy if exists pam_admin on public.public_assets_meta;
create policy pam_self on public.public_assets_meta for all using (user_id=auth.uid());
create policy pam_admin on public.public_assets_meta for all using (public.is_admin(auth.uid()));

-- Companies unique index guard (matches your schema)
create or replace function public.norm_text(t text) returns text language sql immutable as $$ lower(trim(regexp_replace(coalesce(t,''),'\s+',' ','g'))) $$;
create index if not exists companies_unique_guard on public.companies (norm_text(company_name), norm_text(coalesce(country,'')), added_by_user);

-- CRM contacts table must include added_by_user per your policy
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  title text,
  added_by_user uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.crm_contacts enable row level security;
drop policy if exists crm_self on public.crm_contacts;
drop policy if exists crm_admin on public.crm_contacts;
create policy crm_self on public.crm_contacts for all using (added_by_user=auth.uid());
create policy crm_admin on public.crm_contacts for all using (public.is_admin(auth.uid()));

-- Minimal sanity
select 'OK settings/admin/affiliate' as status;