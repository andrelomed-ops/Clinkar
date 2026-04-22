-- Add RFC and CIF fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rfc TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cif_url TEXT;

-- Update RLS if needed (assuming profiles are already manageable by owners)
-- Usually profiles are readable by everyone and updatable by the owner.
