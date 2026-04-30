
-- FULL ECOSYSTEM REPAIR (v5.9.16)
-- Run this in Supabase SQL Editor to resolve all "Unknown error" and "Column not found" issues.

-- 1. Transactions Table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS buyer_email TEXT,
ADD COLUMN IF NOT EXISTS seller_email TEXT,
ADD COLUMN IF NOT EXISTS buyer_phone TEXT;

-- 2. Demand Registry Table
ALTER TABLE public.demand_registry
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 3. Profiles Table (Ensure email exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 4. Audit Logs (Ensuring existence for admin notifications)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT,
    entity_id TEXT,
    action TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RLS Policies for Demand & Leads (Allow public insertion)
ALTER TABLE public.demand_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert demand_registry" ON public.demand_registry;
CREATE POLICY "Public can insert demand_registry" ON public.demand_registry FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.audit_logs;
CREATE POLICY "Enable insert for all users" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
