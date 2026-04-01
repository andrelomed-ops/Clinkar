-- =============================================
-- STARTERKAR DATABASE SCHEMA (formerly Clinkar)
-- Project: StarterKar - Bóveda Digital de Autos
-- =============================================

-- =============================================
-- 1. USER PROFILES
-- =============================================
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    avatar_url text,
    role text check (role in ('buyer', 'seller', 'inspector', 'admin', 'partner')) default 'buyer',
    phone text,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- =============================================
-- 2. CARS INVENTORY
-- =============================================
create table cars (
    id uuid default gen_random_uuid() primary key,
    seller_id uuid references profiles(id) not null,
    make text not null,
    model text not null,
    year integer not null,
    price numeric not null,
    description text,
    vin text unique,
    license_plate text,
    images text[],
    mileage integer,
    fuel_type text,
    transmission text,
    color text,
    has_starterkar_seal boolean default false,
    status text check (status in ('draft', 'published', 'pending_inspection', 'inspected', 'reserved', 'sold', 'archived')) default 'draft',
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table cars enable row level security;

create policy "Cars are viewable by everyone" on cars for select using (true);
create policy "Sellers can manage own cars" on cars for all using (auth.uid() = seller_id);
create policy "Admins can manage all cars" on cars for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Indexes for performance
create index idx_cars_make on cars(make);
create index idx_cars_year on cars(year);
create index idx_cars_status on cars(status);
create index idx_cars_price on cars(price);

-- =============================================
-- 3. INSPECTIONS (150-POINT PROTOCOL)
-- =============================================
create table inspection_reports_150 (
    id uuid default gen_random_uuid() primary key,
    car_id uuid references cars(id) not null,
    inspector_id uuid references profiles(id) not null,
    data jsonb not null,
    overall_result text check (overall_result in ('APROBADO', 'RECHAZADO', 'CON_OBSERVACIONES')) not null,
    score integer,
    notes text,
    photos text[],
    created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table inspection_reports_150 enable row level security;

create policy "Inspections are viewable by everyone" on inspection_reports_150 for select using (true);
create policy "Only inspectors can insert reports" on inspection_reports_150 for insert with check (
    exists (select 1 from profiles where id = auth.uid() and (role = 'inspector' or role = 'admin'))
);
create policy "Only inspectors can update reports" on inspection_reports_150 for update using (
    exists (select 1 from profiles where id = auth.uid() and (role = 'inspector' or role = 'admin'))
);

-- =============================================
-- 4. TRANSACTIONS (ESCROW)
-- =============================================
create table transactions (
    id uuid default gen_random_uuid() primary key,
    car_id uuid references cars(id) not null,
    buyer_id uuid references profiles(id) not null,
    seller_id uuid references profiles(id) not null,
    car_price numeric not null,
    buyer_commission numeric default 0,
    seller_success_fee numeric default 0,
    logistics_cost numeric default 0,
    warranty_cost numeric default 0,
    total_amount numeric not null,
    status text check (status in ('PENDING', 'IN_VAULT', 'IN_TRANSIT', 'RELEASED', 'CANCELLED', 'DISPUTED')) default 'PENDING',
    stripe_payment_intent_id text,
    qr_code text,
    qr_release_code text,
    logistics_id text,
    logistics_quote jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table transactions enable row level security;

create policy "Transactions are viewable by participants" on transactions
    for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Admins can view all transactions" on transactions
    for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- =============================================
-- 5. DOCUMENTS
-- =============================================
create table documents (
    id uuid default gen_random_uuid() primary key,
    transaction_id uuid references transactions(id) not null,
    uploader_id uuid references profiles(id) not null,
    name text not null,
    type text check (type in ('registration', 'id', 'insurance', 'receipt', 'contract', 'other')),
    file_url text not null,
    status text check (status in ('pending', 'verified', 'rejected')) default 'pending',
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table documents enable row level security;

create policy "Documents are viewable by transaction parties" on documents for select 
    using (auth.uid() in (
        select buyer_id from transactions where id = transaction_id
        union
        select seller_id from transactions where id = transaction_id
    ));

-- =============================================
-- 6. NOTIFICATIONS
-- =============================================
create table notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) not null,
    title text not null,
    message text not null,
    type text check (type in ('INFO', 'SUCCESS', 'WARNING', 'FINANCIAL', 'MATCH')) default 'INFO',
    link text,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table notifications enable row level security;

create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);
create policy "Enable insert for authenticated" on notifications for insert with check (auth.uid() = user_id);

-- =============================================
-- 7. REPAIR QUOTATIONS
-- =============================================
create table repair_quotations (
    id uuid default gen_random_uuid() primary key,
    car_id uuid references cars(id) not null,
    inspector_id uuid references profiles(id) not null,
    inspection_report_id uuid references inspection_reports_150(id) not null,
    items jsonb not null,
    total_amount numeric not null,
    status text check (status in ('PENDING_BUYER', 'ACCEPTED_BY_BUYER', 'DENIED_BY_BUYER', 'ACCEPTED_BY_SELLER', 'REPAIRED')) default 'PENDING_BUYER',
    buyer_acknowledgment boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table repair_quotations enable row level security;

create policy "Quotations viewable by related parties" on repair_quotations for select using (
    auth.uid() = inspector_id or 
    exists (select 1 from transactions where car_id = car_id and (buyer_id = auth.uid() or seller_id = auth.uid()))
);

-- =============================================
-- 8. DEMAND REGISTRY (Petitions)
-- =============================================
create table demand_registry (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id),
    brand text not null,
    model text,
    year_min integer,
    year_max integer,
    budget_min numeric,
    budget_max numeric,
    location text,
    notes text,
    status text check (status in ('pending', 'notified', 'matched', 'fulfilled', 'expired')) default 'pending',
    match_found boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table demand_registry enable row level security;

create policy "Public can read demand_registry" on demand_registry for select using (true);
create policy "Authenticated can insert demand_registry" on demand_registry for insert with check (true);
create policy "Authenticated can update own demands" on demand_registry for update using (auth.uid() = user_id or auth.uid() is null);

create index idx_demand_brand on demand_registry(brand);
create index idx_demand_status on demand_registry(status);

-- =============================================
-- 9. SELLER LEADS (Tengo auto, busco comprador)
-- =============================================
create table seller_leads (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id),
    current_brand text not null,
    current_model text,
    current_year integer not null,
    current_price_expected numeric,
    condition text check (condition in ('excellent', 'good', 'fair', 'needs_work')) default 'good',
    looking_for text,
    contact_preference text check (contact_preference in ('phone', 'whatsapp', 'email')) default 'whatsapp',
    status text check (status in ('new', 'contacted', 'matched', 'sold', 'expired')) default 'new',
    demand_match_id uuid references demand_registry(id),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table seller_leads enable row level security;

create policy "Public can read seller_leads" on seller_leads for select using (true);
create policy "Authenticated can insert seller_leads" on seller_leads for insert with check (true);
create policy "Authenticated can update own leads" on seller_leads for update using (auth.uid() = user_id or auth.uid() is null);

create index idx_seller_leads_brand on seller_leads(current_brand);
create index idx_seller_leads_status on seller_leads(status);

-- =============================================
-- 10. DEMAND MATCHES
-- =============================================
create table demand_matches (
    id uuid default gen_random_uuid() primary key,
    demand_id uuid references demand_registry(id),
    seller_lead_id uuid references seller_leads(id),
    matched_at timestamp with time zone default timezone('utc'::text, now()),
    status text check (status in ('active', 'completed', 'cancelled')) default 'active'
);

alter table demand_matches enable row level security;

create policy "Demand matches are viewable by participants" on demand_matches for select using (true);

-- =============================================
-- 11. LOGISTICS ORDERS
-- =============================================
create table logistics_orders (
    id uuid default gen_random_uuid() primary key,
    transaction_id uuid references transactions(id),
    order_type text check (order_type in ('transport', 'towing', 'delivery')),
    provider text default 'Clinkargo',
    origin_address text not null,
    destination_address text not null,
    origin_coordinates jsonb,
    destination_coordinates jsonb,
    distance_km numeric,
    cost numeric,
    status text check (status in ('pending', 'assigned', 'in_transit', 'delivered', 'cancelled')) default 'pending',
    driver_name text,
    driver_phone text,
    estimated_arrival timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table logistics_orders enable row level security;

create policy "Logistics viewable by transaction parties" on logistics_orders for select using (
    exists (select 1 from transactions where id = transaction_id and (buyer_id = auth.uid() or seller_id = auth.uid()))
);

-- =============================================
-- 12. FAVORITES
-- =============================================
create table favorites (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) not null,
    car_id uuid references cars(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(user_id, car_id)
);

alter table favorites enable row level security;

create policy "Users can view own favorites" on favorites for select using (auth.uid() = user_id);
create policy "Users can manage own favorites" on favorites for all using (auth.uid() = user_id);

-- =============================================
-- 13. PARTNERS (Revendedores)
-- =============================================
create table partners (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) not null,
    company_name text,
    rfc text,
    business_type text,
    verified boolean default false,
    total_sales numeric default 0,
    rating numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table partners enable row level security;

create policy "Partners are viewable by authenticated" on partners for select using (true);
create policy "Users can manage own partner profile" on partners for all using (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
insert into storage.buckets (id, name, public)
values 
    ('inspection-photos', 'inspection-photos', true),
    ('car-images', 'car-images', true),
    ('documents', 'documents', true),
    ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public can view car images" on storage.objects for select using (bucket_id = 'car-images');
create policy "Public can view inspection photos" on storage.objects for select using (bucket_id = 'inspection-photos');
create policy "Public can view documents" on storage.objects for select using (bucket_id = 'documents');
create policy "Authenticated can upload car images" on storage.objects for insert with check (bucket_id = 'car-images' and auth.role() = 'authenticated');
create policy "Authenticated can upload inspection photos" on storage.objects for insert with check (bucket_id = 'inspection-photos' and auth.role() = 'authenticated');
create policy "Authenticated can upload documents" on storage.objects for insert with check (bucket_id = 'documents' and auth.role() = 'authenticated');

-- =============================================
-- TRIGGERS
-- =============================================
-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url, role)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'buyer');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Update car status when transaction is created
create or replace function public.handle_transaction_created()
returns trigger as $$
begin
    update cars set status = 'reserved' where id = new.car_id;
    return new;
end;
$$ language plpgsql security definer;

create trigger on_transaction_created
    after insert on transactions
    for each row execute procedure public.handle_transaction_created();

-- =============================================
-- SEED DATA (Optional)
-- =============================================
-- Insert sample car brands for reference
-- This can be used for dropdowns in the UI
insert into cars (seller_id, make, model, year, price, status, location) 
select 
    p.id,
    'Toyota',
    'Corolla',
    2022,
    350000,
    'draft',
    'Ciudad de México'
from profiles p limit 1
on conflict do nothing;

-- =============================================
-- COMPLETED
-- =============================================
-- Schema created successfully for StarterKar