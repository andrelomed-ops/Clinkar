
-- 1. Create Inspection Appointments table
CREATE TABLE IF NOT EXISTS public.inspection_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES public.profiles(id),
    seller_id UUID REFERENCES public.profiles(id),
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, CANCELLED
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Technical Reports table
CREATE TABLE IF NOT EXISTS public.technical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.inspection_appointments(id) ON DELETE CASCADE,
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES public.profiles(id),
    report_data JSONB DEFAULT '{}'::jsonb,
    photos TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED
    admin_notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.inspection_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_reports ENABLE ROW LEVEL SECURITY;

-- 4. Policies for inspection_appointments
CREATE POLICY "Inspectors can view their own appointments" 
ON public.inspection_appointments FOR SELECT 
USING (auth.uid() = inspector_id);

CREATE POLICY "Admins have full access to appointments" 
ON public.inspection_appointments FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Policies for technical_reports
CREATE POLICY "Inspectors can manage their own reports" 
ON public.technical_reports FOR ALL 
USING (auth.uid() = inspector_id);

CREATE POLICY "Admins have full access to reports" 
ON public.technical_reports FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
