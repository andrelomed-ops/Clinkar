
-- Migration: WhatsApp Contact for Appointments (v5.9.14)
-- Description: Adds buyer_phone to transactions for follow-up and appointment confirmation.

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS buyer_phone TEXT;

COMMENT ON COLUMN public.transactions.buyer_phone IS 'WhatsApp del comprador para seguimiento de citas de inspección';
