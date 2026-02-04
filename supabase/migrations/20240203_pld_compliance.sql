-- 11. Risk Profiles (Scoring de Riesgo)
create table risk_profiles (
  user_id uuid references profiles(id) primary key,
  risk_level text check (risk_level in ('LOW', 'MEDIUM', 'HIGH', 'BLOCKED')) default 'LOW',
  risk_score numeric default 0, -- 0-100
  last_assessment_at timestamp with time zone default timezone('utc'::text, now()),
  flags text[] -- ['PEP', 'MEDIOS_ADVERSOS', 'OFAC']
);

alter table risk_profiles enable row level security;
create policy "Admins can view risk profiles" on risk_profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 12. Compliance Checks (Historial de Screening)
create table compliance_checks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) not null,
  check_type text check (check_type in ('ONBOARDING', 'TRANSACTION', 'PERIODIC')) not null,
  provider text default 'INTERNAL_PLD_ENGINE',
  result text check (result in ('CLEAR', 'WARNING', 'BLOCKED')) not null,
  matches jsonb, -- Detalles del match (Pablo Escobar, etc.)
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table compliance_checks enable row level security;
create policy "Admins can view compliance checks" on compliance_checks for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 13. Audit Logs (Forensic Trail - Immutable)
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references auth.users(id),
  action text not null, -- 'LOGIN', 'CREATE_TRANSACTION', 'UPLOAD_DOC'
  entity_type text, -- 'TRANSACTION', 'CAR', 'USER'
  entity_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- No update/delete policies for audit_logs to ensure immutability
alter table audit_logs enable row level security;
create policy "Admins can view audit logs" on audit_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 14. Update Transactions table for PLD
alter table transactions 
add column pld_status text check (pld_status in ('PENDING', 'APPROVED', 'BLOCKED_RISK')) default 'PENDING',
add column risk_metadata jsonb;
