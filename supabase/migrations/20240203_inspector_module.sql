-- MODULE: INSPECTOR APP (Physical Validation)

-- 1. Inspection Reports (150 Points)
-- Stores the JSON result of the 150-point checklist
create table if not exists inspection_reports_150 (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) not null,
  inspector_id uuid references profiles(id) not null,
  
  -- The full JSON checklist: { "motor_oil": { "pass": true, "note": "ok" }, ... }
  data jsonb not null default '{}'::jsonb,
  
  -- Overall verdict
  overall_result text check (overall_result in ('APROBADO', 'RECHAZADO')) not null,
  
  -- Summary notes
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table inspection_reports_150 enable row level security;

-- Policy: Inspectors can insert reports
create policy "Inspectors can create reports" on inspection_reports_150
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role in ('inspector', 'admin'))
  );

-- Policy: Everyone can read reports (Transparency)
create policy "Public can read reports" on inspection_reports_150
  for select using (true);


-- 2. Repair Quotations (Cotizaciones)
-- If inspection fails, this table holds the repair costs
create table if not exists repair_quotations (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references cars(id) not null,
  inspector_id uuid references profiles(id) not null,
  inspection_report_id uuid references inspection_reports_150(id),
  
  -- List of failed items with costs: [{ "id": "brakes", "cost": 5000, "label": "Balatas" }]
  items jsonb not null default '[]'::jsonb,
  
  total_amount numeric default 0,
  
  status text check (status in ('PENDING_BUYER', 'ACCEPTED', 'REJECTED', 'PAID')) default 'PENDING_BUYER',
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table repair_quotations enable row level security;
create policy "Inspectors can create quotations" on repair_quotations for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('inspector', 'admin'))
);
create policy "Users can read quotations for their cars" on repair_quotations for select using (
  exists (select 1 from cars where id = car_id and seller_id = auth.uid())
  or exists (select 1 from profiles where id = auth.uid() and role in ('inspector', 'admin'))
);


-- 3. Update Cars Table (The "Seal")
-- Add the "Verified" badge flag
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name = 'cars' and column_name = 'has_clinkar_seal') then
    alter table cars add column has_clinkar_seal boolean default false;
  end if;
end $$;

-- 4. Storage Bucket for Evidence
insert into storage.buckets (id, name, public) 
values ('inspection-evidence', 'inspection-evidence', true)
on conflict (id) do nothing;

create policy "Inspectors can upload evidence" on storage.objects
  for insert with check (
    bucket_id = 'inspection-evidence' 
    and exists (select 1 from profiles where id = auth.uid() and role in ('inspector', 'admin'))
  );

create policy "Public can view evidence" on storage.objects
  for select using (bucket_id = 'inspection-evidence');
