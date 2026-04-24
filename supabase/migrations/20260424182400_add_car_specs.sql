-- Add technical specifications and features to the cars table
ALTER TABLE cars
ADD COLUMN IF NOT EXISTS technical_specs JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;
