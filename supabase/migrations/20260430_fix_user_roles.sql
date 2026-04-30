-- Migration: Fix User Roles (v5.9.11)
-- Description: Updates the check constraint in the profiles table to allow specialized roles.

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'inspector', 'seller', 'buyer', 'investor'));

-- Ensure columns for specialized roles exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS investor_tier TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS coordinates JSONB;

COMMENT ON COLUMN public.profiles.investor_tier IS 'Nivel de inversionista: starter, pro, elite';
