-- FIX: Force Investor Role Synchronization (v5.12.0)
-- Descripción: Sincroniza el rol de inversionista para el usuario andrelomed@gmail.com

-- 1. Actualizar el perfil principal para asegurar que tenga el rol y el tier correcto.
UPDATE public.profiles 
SET role = 'investor', 
    investor_tier = 'elite' 
WHERE email = 'andrelomed@gmail.com';

-- 2. Asegurar que cualquier solicitud de inversionista esté marcada como aprobada
UPDATE public.investor_applications
SET status = 'approved',
    tier_id = 'elite'
WHERE email = 'andrelomed@gmail.com';

-- 3. Notificar a PostgREST para recargar
NOTIFY pgrst, 'reload schema';
