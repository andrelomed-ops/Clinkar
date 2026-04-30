
-- Migration: Fix Demand Request & Audit Logs Policies (v5.8.6)
-- Description: Allows public/authenticated users to insert into demand_registry and audit_logs to prevent "hanging" requests.

-- 1. Demand Registry: Ensure anyone can submit a request (even guests)
DROP POLICY IF EXISTS "Public can insert demand_registry" ON public.demand_registry;
CREATE POLICY "Public can insert demand_registry" ON public.demand_registry 
FOR INSERT WITH CHECK (true);

-- 2. Audit Logs: Allow authenticated and anonymous users to insert (required for platform tracking)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.audit_logs;
CREATE POLICY "Enable insert for all users" ON public.audit_logs 
FOR INSERT WITH CHECK (true);

-- 3. Seller Leads: Ensure anyone can submit a lead
DROP POLICY IF EXISTS "Public can insert seller_leads" ON public.seller_leads;
CREATE POLICY "Public can insert seller_leads" ON public.seller_leads 
FOR INSERT WITH CHECK (true);

-- 4. Verify RLS is enabled (should already be)
ALTER TABLE public.demand_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_leads ENABLE ROW LEVEL SECURITY;
