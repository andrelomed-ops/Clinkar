
-- EMERGENCY FIX: Restore missing columns and tables
-- Run this in the Supabase SQL Editor

-- 1. Restore VIN to cars
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS vin TEXT UNIQUE;

-- 2. Create inspection_appointments if missing
CREATE TABLE IF NOT EXISTS public.inspection_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES public.profiles(id),
    seller_id UUID REFERENCES public.profiles(id),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING',
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.inspection_appointments ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins full access" ON public.inspection_appointments;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "Admins full access" ON public.inspection_appointments 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public view" ON public.inspection_appointments;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "Public view" ON public.inspection_appointments FOR SELECT USING (true);
