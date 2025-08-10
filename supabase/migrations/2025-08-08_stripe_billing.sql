-- ===============================================
-- Stripe Billing (no DO blocks) — safe to re-run
-- ===============================================
create extension if not exists pgcrypto;

-- Ensure helpers exist
create or replace function public.is_admin(p_uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from auth.users u
    left join public.user_profiles up on up.id=u.id
    where u.id=p_uid and ((u.raw_user_meta_data->>'role')='admin' or up.role='admin')
  );
$$;

-- Minimal user_profiles columns used here
alter table public.user_profiles add column if not exists plan text default 'trial' check (plan in ('trial','starter','pro','enterprise'));
alter table public.user_profiles add column if not exists subscription_status text default 'inactive' check (subscription_status in ('active','inactive','trial','cancelled'));

-- Billing core tables
create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  price_id text,
  plan text,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  stripe_invoice_id text unique not null,
  stripe_subscription_id text,
  amount_due numeric,
  amount_paid numeric,
  currency text,
  status text,
  created_at timestamptz default now()
);

-- Affiliate/promo augment (safe if exists)
alter table public.affiliate_referrals add column if not exists stripe_customer_id text;
alter table public.affiliate_referrals add column if not exists stripe_subscription_id text;
alter table public.affiliate_referrals add column if not exists promotion_code text;

-- Indexes
create index if not exists idx_bsub_user on public.billing_subscriptions(user_id);
create index if not exists idx_bsub_status on public.billing_subscriptions(status);
create index if not exists idx_binv_user on public.billing_invoices(user_id);

-- RLS
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_invoices enable row level security;

-- Policies: users see own; admins full
-- billing_customers
drop policy if exists bc_self on public.billing_customers;
drop policy if exists bc_admin on public.billing_customers;
create policy bc_self on public.billing_customers for select using (user_id=auth.uid());
create policy bc_admin on public.billing_customers for all using (public.is_admin(auth.uid()));

-- billing_subscriptions
drop policy if exists bs_self on public.billing_subscriptions;
drop policy if exists bs_admin on public.billing_subscriptions;
create policy bs_self on public.billing_subscriptions for select using (user_id=auth.uid());
create policy bs_admin on public.billing_subscriptions for all using (public.is_admin(auth.uid()));

-- billing_invoices
drop policy if exists binv_self on public.billing_invoices;
drop policy if exists binv_admin on public.billing_invoices;
create policy binv_self on public.billing_invoices for select using (user_id=auth.uid());
create policy binv_admin on public.billing_invoices for all using (public.is_admin(auth.uid()));

-- Touch user plan from webhook
create or replace function public.apply_plan(p_user uuid, p_plan text, p_status text)
returns void language sql as $$
  update public.user_profiles set plan=p_plan, subscription_status=p_status, updated_at=now() where id=p_user;
$$;

-- Small sanity
select 'OK' as status,
  (select count(*) from public.billing_subscriptions) subs,
  (select count(*) from public.billing_invoices) invoices;