-- Gutenform Platform – run in Supabase SQL Editor
-- 1. Extensions & Enums
create extension if not exists pgsodium;
create type user_role as enum ('user', 'admin');
create type license_status as enum ('active', 'expired', 'banned');
create type plan_tier as enum ('free', 'starter', 'pro', 'agency');

-- 2. Profiles (User Daten)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role user_role default 'user',
  lemon_squeezy_customer_id text,
  full_name text,
  created_at timestamptz default now()
);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Licenses (pgsodium key must exist; create via Supabase Dashboard or: select pgsodium.create_key();)
create table public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  key_prefix text,
  encrypted_key text,
  key_id uuid,
  associated_data text,
  status license_status default 'active',
  tier plan_tier default 'free',
  credits_balance int default 0,
  credits_monthly_limit int default 500,
  activation_limit int default 1,
  current_activations int default 0,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 4. Marketplace & Products
create table public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  version text default '1.0.0',
  download_path text,
  price_cents int default 0,
  required_tier plan_tier default 'free',
  is_active boolean default true
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id),
  item_id uuid references public.marketplace_items(id),
  purchased_at timestamptz default now()
);

-- 5. AI Configuration
create table public.system_prompts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prompt_text text not null,
  is_active boolean default false,
  created_at timestamptz default now()
);

create table public.block_definitions (
  id uuid primary key default gen_random_uuid(),
  block_slug text unique not null,
  description text,
  attributes_schema jsonb,
  updated_at timestamptz default now()
);

-- 6. Logs & Audit
create table public.credit_logs (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references public.licenses(id),
  amount int not null,
  action text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  event_id text,
  payload jsonb,
  status text default 'pending',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- 7. RLS
alter table public.profiles enable row level security;
alter table public.licenses enable row level security;
alter table public.system_prompts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.webhook_events enable row level security;

create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users delete own profile" on public.profiles for delete using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select
  using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins manage prompts" on public.system_prompts for all
  using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins manage audit_logs" on public.audit_logs for all
  using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Admins manage webhook_events" on public.webhook_events for all
  using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Users see own licenses
alter table public.licenses enable row level security;
create policy "Users view own licenses" on public.licenses for select
  using (auth.uid() = user_id);
create policy "Users insert own licenses" on public.licenses for insert
  with check (auth.uid() = user_id);
create policy "Users delete own licenses" on public.licenses for delete
  using (auth.uid() = user_id);
create policy "Admins view all licenses" on public.licenses for select
  using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Users see own credit_logs via license
alter table public.credit_logs enable row level security;
create policy "Users view own credit_logs" on public.credit_logs for select
  using (license_id in (select id from public.licenses where user_id = auth.uid()));
create policy "Admins view all credit_logs" on public.credit_logs for select
  using (auth.uid() in (select id from public.profiles where role = 'admin'));
