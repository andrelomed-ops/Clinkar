-- Final synchronization of the cars table schema for professional publishing
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'Gasolina',
ADD COLUMN IF NOT EXISTS transmission TEXT DEFAULT 'Automática',
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Ciudad de México',
ADD COLUMN IF NOT EXISTS market_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sensory_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS digital_passport_data JSONB DEFAULT '{}';

-- Index for better performance on JSONB queries
CREATE INDEX IF NOT EXISTS idx_cars_market_data ON cars USING GIN (market_data);
