
-- Migration: Email-Based Tracking & Identification (v5.8.5)
-- Description: Adds email columns to core tables for administrative readability.

-- 1. Transactions Table
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS buyer_email TEXT,
ADD COLUMN IF NOT EXISTS seller_email TEXT;

-- 2. Demand Registry Table
ALTER TABLE public.demand_registry
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 3. User Favorites Table
ALTER TABLE public.user_favorites
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 4. Sync existing data (Optional/Best effort)
-- This assumes profiles are already filled. 
-- In a real migration, we would run these updates.

-- UPDATE public.transactions t
-- SET buyer_email = p.email
-- FROM public.profiles p
-- WHERE t.buyer_id = p.id;

-- UPDATE public.transactions t
-- SET seller_email = p.email
-- FROM public.profiles p
-- WHERE t.seller_id = p.id;

COMMENT ON COLUMN public.transactions.buyer_email IS 'Email del comprador para tracking rapido sin joins';
COMMENT ON COLUMN public.transactions.seller_email IS 'Email del vendedor para tracking rapido sin joins';
