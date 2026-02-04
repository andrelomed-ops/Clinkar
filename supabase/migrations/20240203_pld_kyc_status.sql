-- Migration: Add Verification Status to Risk Profiles
-- Purpose: Track KYC status for LFPIORPI Compliance

ALTER TABLE risk_profiles 
ADD COLUMN verification_status text 
CHECK (verification_status IN ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED')) 
DEFAULT 'UNVERIFIED';

-- Add index for faster lookups during transaction creation
CREATE INDEX idx_risk_profiles_verification_status ON risk_profiles(verification_status);

-- Comments for documentation
COMMENT ON COLUMN risk_profiles.verification_status IS 'Estado del Expediente Único (KYC/PLD). Requerido VERIFIED para transacciones > 360k.';
