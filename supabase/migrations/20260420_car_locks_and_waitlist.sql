-- Tabla para el bloqueo atómico temporal de vehículos
CREATE TABLE IF NOT EXISTS public.car_locks (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    locked_by UUID NOT NULL REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(car_id) -- Garantiza que sólo pueda haber un candado vivo (o uno en general)
);

-- Si necesitamos manejar expiración, al hacer upsert verificamos expires_at
-- O eliminamos un candado antes de intentar lockear uno nuevo.

-- Tabla para la fila de espera en ofertas flash / alta demanda
CREATE TABLE IF NOT EXISTS public.car_waitlists (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(car_id, user_id)
);

-- Habilitar RLS e insertar políticas (según sea necesario)
ALTER TABLE public.car_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_waitlists ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para lectura (todos pueden ver qué autos están bloqueados)
CREATE POLICY "Anyone can view car locks" ON public.car_locks FOR SELECT USING (true);
CREATE POLICY "Anyone can view car waitlists" ON public.car_waitlists FOR SELECT USING (true);

-- Política para que el admin interactue, aunque manejado vía Service Role en Backend.
