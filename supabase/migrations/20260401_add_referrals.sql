-- MODULE: REFERRAL PROGRAM

DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM ('PENDING_OPERATION', 'OPERATION_CLOSED', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Referral Links
-- Stores the unique referral link per user
create table if not exists public.referral_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null unique,
  code text not null unique,
  default_reward_amount numeric not null default 500,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.referral_links enable row level security;

-- Policy: Users can view their own link
create policy "Users can view their own link" on public.referral_links
  for select using (auth.uid() = user_id);

-- Policy: Public can query by code to validate it
create policy "Public can read links" on public.referral_links
  for select using (true);
  
-- Policy: Users can insert their own link
create policy "Users can create their own link" on public.referral_links
  for insert with check (auth.uid() = user_id);

-- Policy: Admin can maintain
create policy "Admin can do all on links" on public.referral_links
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 2. Referrals Tracking
-- Tracks who referred whom, and payment status

create table if not exists public.referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references public.profiles(id) not null,
  referred_user_id uuid references public.profiles(id) not null unique,
  transaction_id uuid references public.transactions(id),
  status referral_status not null default 'PENDING_OPERATION',
  actual_reward numeric,
  
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.referrals enable row level security;

-- Policy: Referrers can see their referrals
create policy "Referrers can view their referrals" on public.referrals
  for select using (auth.uid() = referrer_id);

-- Policy: Admin can do all on referrals
create policy "Admin can do all on referrals" on public.referrals
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
