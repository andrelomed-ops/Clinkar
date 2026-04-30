
-- FIX: Missing Transaction Columns (v5.9.15)
-- Description: Ensures all required columns for tracking and follow-up are present.
-- RUN THIS IN SUPABASE SQL EDITOR IF YOU SEE "column not found" ERRORS.

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS buyer_email TEXT,
ADD COLUMN IF NOT EXISTS seller_email TEXT,
ADD COLUMN IF NOT EXISTS buyer_phone TEXT;

-- Update comments for clarity
COMMENT ON COLUMN public.transactions.buyer_email IS 'Email del comprador para tracking rapido sin joins';
COMMENT ON COLUMN public.transactions.seller_email IS 'Email del vendedor para tracking rapido sin joins';
COMMENT ON COLUMN public.transactions.buyer_phone IS 'WhatsApp del comprador para seguimiento de citas de inspección';
