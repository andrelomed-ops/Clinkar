
-- Migration: Referral System & Investor Profiles (v5.8.6)
-- Description: Adds tables for referral tracking and investor specific data.

-- 1. Referral Links (Unique codes for users)
CREATE TABLE IF NOT EXISTS public.referral_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    reward_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Referrals (Tracking the relationship)
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'PENDING_OPERATION', -- PENDING_OPERATION, OPERATION_CLOSED, PAID
    reward_type TEXT DEFAULT 'CASH',
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    actual_reward NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referred_user_id) -- A user can only be referred once
);

-- 3. Investor Profiles (Extended data for Elite/Pro tiers)
CREATE TABLE IF NOT EXISTS public.investor_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'starter', -- starter, pro, elite
    total_invested NUMERIC DEFAULT 0,
    commission_rate NUMERIC DEFAULT 3.5,
    active_operations INTEGER DEFAULT 0,
    preferred_categories TEXT[],
    legal_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Basic)
ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- Simple policies (Admins can do everything, users can see their own)
CREATE POLICY "Users can view own referral code" ON public.referral_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);
CREATE POLICY "Users can view own investor profile" ON public.investor_profiles FOR SELECT USING (auth.uid() = user_id);
