ALTER TABLE transactions ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS commission_payment_method TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS commission_payment_date TIMESTAMP WITH TIME ZONE;
