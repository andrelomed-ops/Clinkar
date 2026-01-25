-- Supabase Schema for Clinkar

-- 1. Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('buyer', 'seller', 'inspector', 'admin')) default 'buyer',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. Cars Table
create table cars (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references profiles(id) not null,
  make text not null,
  model text not null,
  year integer not null,
  price numeric not null,
  description text,
  vin text unique,
  images text[], -- Array of Supabase Storage URLs
  has_clinkar_seal boolean default false,
  status text check (status in ('draft', 'published', 'pending_inspection', 'inspected', 'sold', 'archived')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table cars enable row level security;

-- Policies for cars
create policy "Cars are viewable by everyone" on cars for select using (true);
create policy "Sellers can manage own cars" on cars for all using (auth.uid() = seller_id);

-- 3. Inspections Table
create table inspections (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) not null,
  inspector_id uuid references profiles(id) not null,
  report_url text,
  summary text,
  rating integer check (rating >= 1 and rating <= 5),
  status text check (status in ('pending', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table inspections enable row level security;

-- Policies for inspections
create policy "Inspections are viewable by involved parties" on inspections for select 
using (auth.uid() = inspector_id or auth.uid() in (select seller_id from cars where id = car_id));
create policy "Inspectors can manage own inspections" on inspections for all using (auth.uid() = inspector_id);

-- 4. Escrow Transactions
create table escrow_transactions (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) not null,
  buyer_id uuid references profiles(id) not null,
  seller_id uuid references profiles(id) not null,
  amount numeric not null,
  currency text default 'USD',
  status text check (status in ('pending', 'funded', 'completed', 'cancelled', 'disputed')) default 'pending',
  qr_release_code text,
  stripe_payment_intent_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  released_at timestamp with time zone
);

alter table escrow_transactions enable row level security;

-- Policies for escrow
create policy "Transactions are viewable by involved parties" on escrow_transactions for select 
using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers can create transactions" on escrow_transactions for insert with check (auth.uid() = buyer_id);
create policy "System/Parties can update transactions" on escrow_transactions for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- 5. Documents Table
create table documents (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references escrow_transactions(id) not null,
  uploader_id uuid references profiles(id) not null,
  name text not null, -- Title, Registration, ID, etc.
  file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table documents enable row level security;

create policy "Documents are viewable by transaction parties" on documents for select 
using (auth.uid() in (
  select buyer_id from escrow_transactions where id = transaction_id
  union
  select seller_id from escrow_transactions where id = transaction_id
));

create policy "Parties can upload documents" on documents for insert 
with check (auth.uid() in (
  select buyer_id from escrow_transactions where id = transaction_id
  union
  select seller_id from escrow_transactions where id = transaction_id
));

-- Trigger for profile creation on user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security modeller;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. New Transactions Table (Split Logic)
create table transactions (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) not null,
  buyer_id uuid references profiles(id) not null,
  seller_id uuid references profiles(id) not null,
  car_price numeric not null,
  buyer_commission numeric default 3448.00,
  seller_success_fee numeric default 2149.13,
  certification_cost numeric default 1299.13,
  status text check (status in ('PENDING', 'IN_VAULT', 'RELEASED', 'CANCELLED')) default 'PENDING',
  stripe_payment_intent_id text,
  qr_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table transactions enable row level security;

create policy "Transactions are viewable by participants" on transactions
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- 7. 150-Point Inspection Reports
create table inspection_reports_150 (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) not null,
  inspector_id uuid references profiles(id) not null,
  data jsonb not null, -- Stores the 150 points (id, category, pass, notes)
  overall_result text check (overall_result in ('APROBADO', 'RECHAZADO')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table inspection_reports_150 enable row level security;

create policy "Inspections are viewable by everyone" on inspection_reports_150 for select using (true);
create policy "Only inspectors can insert reports" on inspection_reports_150 for insert with check (
  exists (select 1 from profiles where id = auth.uid() and (role = 'inspector' or role = 'admin'))
);

-- 8. Notifications Table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  message text not null,
  type text check (type in ('INFO', 'SUCCESS', 'WARNING', 'FINANCIAL')) default 'INFO',
  link text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on notifications
  for update using (auth.uid() = user_id);

-- System/Internal function to create notifications (simulated since we don't have DB triggers for external APIs here)
create policy "Enable insert for system" on notifications for insert with check (true); 

-- 9. Repair Quotations
create table repair_quotations (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) not null,
  inspector_id uuid references profiles(id) not null,
  inspection_report_id uuid references inspection_reports_150(id) not null,
  items jsonb not null, -- Stores items to repair and their cost
  total_amount numeric not null,
  status text check (status in ('PENDING_BUYER', 'ACCEPTED_BY_BUYER', 'DENIED_BY_BUYER', 'ACCEPTED_BY_MECHANIC', 'REPAIRED')) default 'PENDING_BUYER',
  buyer_acknowledgment boolean default false, -- For the "as-is" purchase
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table repair_quotations enable row level security;

create policy "Quotations viewable by related parties" on repair_quotations
  for select using (
    auth.uid() = inspector_id or 
    exists (select 1 from transactions t where t.car_id = car_id and (t.buyer_id = auth.uid() or t.seller_id = auth.uid())) or
    exists (select 1 from cars c where c.id = car_id and c.seller_id = auth.uid())
  );

create policy "Quotations manageable by inspector" on repair_quotations
  for all using (auth.uid() = inspector_id);

create policy "Buyers can update quotation status" on repair_quotations
  for update using (
    exists (select 1 from transactions t where t.car_id = car_id and t.buyer_id = auth.uid())
  );

-- 10. Storage Configuration
-- Create the bucket for inspection photos
insert into storage.buckets (id, name, public)
values ('inspection-photos', 'inspection-photos', true)
on conflict (id) do nothing;

-- Allow public viewing of photos
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'inspection-photos' );

-- Allow inspectors to upload photos
create policy "Inspectors can upload" 
on storage.objects for insert 
with check ( 
  bucket_id = 'inspection-photos' 
);

-- Allow deletion
create policy "Inspectors can delete" 
on storage.objects for delete 
 