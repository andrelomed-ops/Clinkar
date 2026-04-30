-- Migration: Add Commission Tracking (Emergency Fix)
-- Description: Ensures commission columns exist in transactions table.

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_payment_method TEXT,
ADD COLUMN IF NOT EXISTS commission_payment_date TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN public.transactions.commission_paid IS 'Indica si la comisión de éxito (3.5%) ya fue cobrada';
COMMENT ON COLUMN public.transactions.commission_amount IS 'Monto real cobrado por comisión';
COMMENT ON COLUMN public.transactions.commission_payment_method IS 'Método de pago: SPEI, Efectivo, Tarjeta, etc.';
COMMENT ON COLUMN public.transactions.commission_payment_date IS 'Fecha en que se registró el ingreso a tesorería';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
