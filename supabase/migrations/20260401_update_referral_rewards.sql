-- 4. Add commission columns to transactions table if missing
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS buyer_commission numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS seller_success_fee numeric DEFAULT 0;

-- 2. Add reward_type to referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS reward_type reward_type NOT NULL DEFAULT 'FREE_INSPECTION';

-- 3. Create user_perks table to store accumulated benefits
CREATE TABLE IF NOT EXISTS public.user_perks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    perk_type reward_type NOT NULL,
    status text NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, USED, EXPIRED
    metadata jsonb DEFAULT '{}'::jsonb, -- Store details like car_id where used or discount amount
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for user_perks
ALTER TABLE public.user_perks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own perks
CREATE POLICY "Users can view their own perks" ON public.user_perks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admin can manage all perks
CREATE POLICY "Admin can manage all perks" ON public.user_perks
    USING (exists (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_perks_updated_at
    BEFORE UPDATE ON public.user_perks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
