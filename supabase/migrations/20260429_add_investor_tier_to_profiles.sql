-- Migración para añadir soporte de rangos de inversionista en el perfil
-- v5.0.4 - Tier System Integration

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS investor_tier TEXT REFERENCES investor_tiers(id) DEFAULT NULL;

-- Asegurar que los admins puedan editar esta nueva columna
-- (Las políticas existentes de UPDATE en profiles ya deberían cubrir esto, 
-- pero nos aseguramos de que el esquema esté actualizado)

COMMENT ON COLUMN profiles.investor_tier IS 'Define el rango del inversionista: starter, pro, elite';
