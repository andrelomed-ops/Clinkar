-- LOGISTICS ORDERS TABLE
create table if not exists public.logistics_orders (
    id uuid not null default gen_random_uuid(),
    transaction_id uuid references public.transactions(id) on delete cascade,
    
    origin_address text not null,
    destination_address text not null,
    distance_km numeric,
    cost numeric not null,
    
    status text check (status in ('PENDING', 'SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')) default 'PENDING',
    tracking_number text,
    provider text default 'Clinkar Logistics (Mock)',
    
    estimated_delivery_date timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    primary key (id)
);

-- WARRANTY POLICIES TABLE
create table if not exists public.warranty_policies (
    id uuid not null default gen_random_uuid(),
    car_id uuid references public.cars(id) on delete cascade,
    transaction_id uuid references public.transactions(id),
    
    type text check (type in ('STANDARD', 'EXTENDED')) not null,
    status text check (status in ('PENDING', 'ACTIVE', 'EXPIRED', 'VOID')) default 'PENDING',
    
    start_date timestamptz,
    end_date timestamptz,
    
    coverage_cap_amount numeric,
    coverage_details jsonb default '{}'::jsonb, -- Stores specific parts covered
    
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    primary key (id)
);

-- RLS POLICIES
alter table public.logistics_orders enable row level security;
alter table public.warranty_policies enable row level security;

-- Logistics: Users can view their own transaction's logistics
create policy "Users can view logistics for their transactions"
    on public.logistics_orders for select
    using (
        exists (
            select 1 from public.transactions t
            where t.id = logistics_orders.transaction_id
            and (t.buyer_id = auth.uid() or t.seller_id = auth.uid())
        )
    );

-- Warranty: Public view (for checking car status) or Owner view?
-- Let's allow public view if they know the ID (for validation), 
-- or restrict to owner. For now, restrict to owner/buyer.
create policy "Owners can view their warranties"
    on public.warranty_policies for select
    using (
        exists (
            select 1 from public.transactions t
            where t.id = warranty_policies.transaction_id
            and t.buyer_id = auth.uid()
        )
    );
