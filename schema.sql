-- Run this in Supabase Dashboard > SQL Editor.
create sequence if not exists public.customer_id_seq start 1;

create table if not exists public.customers (
  customer_id text primary key default ('AW-' || lpad(nextval('public.customer_id_seq')::text, 6, '0')),
  full_name text not null,
  place text not null,
  feedback text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  code text primary key,
  status text not null default 'generated'
    check (status in ('generated','approved','redeemed','deactivated')),
  customer_id text unique references public.customers(customer_id),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  redeemed_at timestamptz
);

create index if not exists coupons_status_idx on public.coupons(status);
create index if not exists coupons_customer_id_idx on public.coupons(customer_id);

-- Security: all browser-side direct table access is denied. Server API uses the
-- service-role key, which must ONLY exist in server environment variables.
alter table public.customers enable row level security;
alter table public.coupons enable row level security;
revoke all on public.customers from anon, authenticated;
revoke all on public.coupons from anon, authenticated;

-- Optional: prevent public signup in Supabase Auth settings. Create the owner
-- account manually in Authentication > Users. Set ADMIN_EMAIL to that exact email.