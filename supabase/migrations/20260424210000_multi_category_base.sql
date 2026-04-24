-- Migration to support multi-category vehicles and specialized mechanics
-- Paso 1 of the Multi-Category Adaptation Plan

-- 1. Update partners table with specialties
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

-- 2. Update cars table with category and technical_specs
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Car',
ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}';

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_specialties ON public.partners USING GIN (specialties);
CREATE INDEX IF NOT EXISTS idx_cars_category ON public.cars (category);
CREATE INDEX IF NOT EXISTS idx_cars_technical_specs ON public.cars USING GIN (technical_specs);

-- Comment for documentation
COMMENT ON COLUMN public.partners.specialties IS 'List of vehicle categories this partner is specialized in (e.g., Car, Motorcycle, Marine)';
COMMENT ON COLUMN public.cars.category IS 'Main category of the mobility asset';
COMMENT ON COLUMN public.cars.technical_specs IS 'Dynamic technical data based on category (e.g., flight hours, engine hours, etc.)';
