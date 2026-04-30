-- Migration: Analytics & Database Optimization (v6.0)
-- Description: Establishes formal relationships and creates business intelligence views.

-- 1. Database Relationships (Foreign Keys)
-- This allows native joins like .select('*, cars(*)')

-- Relationship: transactions -> cars
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_car_id_fkey;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_car_id_fkey 
FOREIGN KEY (car_id) 
REFERENCES public.cars(id)
ON DELETE SET NULL;

-- Relationship: transactions -> profiles (buyer)
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_buyer_id_fkey;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_buyer_id_fkey 
FOREIGN KEY (buyer_id) 
REFERENCES public.profiles(id);

-- Relationship: transactions -> profiles (seller)
ALTER TABLE public.transactions
DROP CONSTRAINT IF EXISTS transactions_seller_id_fkey;

ALTER TABLE public.transactions
ADD CONSTRAINT transactions_seller_id_fkey 
FOREIGN KEY (seller_id) 
REFERENCES public.profiles(id);


-- 2. Business Intelligence View: admin_business_stats
-- Calculates GMV, commission totals, and trends automatically

CREATE OR REPLACE VIEW public.admin_business_stats AS
WITH monthly_metrics AS (
    SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as sales,
        SUM(car_price) as gmv
    FROM public.transactions
    GROUP BY 1
)
SELECT 
    COUNT(*) as total_sales,
    COALESCE(SUM(car_price), 0) as total_gmv,
    COALESCE(SUM(car_price * 0.035), 0) as total_commissions,
    COUNT(CASE WHEN status = 'RELEASED' THEN 1 END) as completed_sales,
    COALESCE((SELECT jsonb_object_agg(month, jsonb_build_object('sales', sales, 'gmv', gmv)) FROM monthly_metrics), '{}'::jsonb) as monthly_trends
FROM public.transactions;


-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cars_status ON public.cars(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON public.cars(make, model);
