-- Create investor tiers and applications tables
CREATE TABLE IF NOT EXISTS investor_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  car_limit INTEGER -- NULL for unlimited
);

-- Insert initial tiers
INSERT INTO investor_tiers (id, name, price, car_limit) VALUES
('starter', 'Starter', 2500, 3),
('pro', 'Pro', 8000, 12),
('elite', 'Elite', 15000, NULL)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  car_limit = EXCLUDED.car_limit;

CREATE TABLE IF NOT EXISTS investor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id TEXT REFERENCES investor_tiers(id),
  rfc TEXT NOT NULL,
  razon_social TEXT NOT NULL,
  telefono TEXT NOT NULL,
  constancia_fiscal_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  payment_method TEXT DEFAULT 'spei',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- Only one application per user
);

-- Storage bucket for Constancia Fiscal
-- Note: This might need to be run in the Supabase Dashboard if the extensions aren't enabled, 
-- but we include it for completeness.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('investor-docs', 'investor-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for applications
ALTER TABLE investor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
ON investor_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
ON investor_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON investor_applications FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update applications"
ON investor_applications FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
