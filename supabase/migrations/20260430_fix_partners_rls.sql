
-- Migration: Fix Partners RLS for Administrative Management
-- Description: Enables INSERT, UPDATE, and DELETE for admin users on the partners table.

-- 1. Ensure RLS is enabled
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if they exist (except the public view one)
DROP POLICY IF EXISTS "Admins can manage partners" ON public.partners;
DROP POLICY IF EXISTS "Public can view partners" ON public.partners;

-- 3. Re-create Select policy for everyone
CREATE POLICY "Public can view partners" 
ON public.partners FOR SELECT 
USING (true);

-- 4. Create Management policy for Admins
-- This policy checks if the authenticated user has the 'admin' role in their profile
CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

COMMENT ON TABLE public.partners IS 'Tabla de talleres aliados con seguridad reforzada para administradores.';
