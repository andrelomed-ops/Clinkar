
-- Migration: Justicia & Certeza (v5.8.1)
-- Description: Adds transparency and fair pricing fields to cars table.

ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS provenance TEXT DEFAULT 'original',
ADD COLUMN IF NOT EXISTS reconditioning_notes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS reconditioning_budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS fair_price_suggested NUMERIC,
ADD COLUMN IF NOT EXISTS legal_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.cars.provenance IS 'Origen legal: original, insurance_salvage, theft_recovered, auction, imported';
COMMENT ON COLUMN public.cars.reconditioning_notes IS 'Lista de detalles mecanicos/esteticos a corregir';
COMMENT ON COLUMN public.cars.reconditioning_budget IS 'Costo estimado para poner el auto en condiciones optimas';
