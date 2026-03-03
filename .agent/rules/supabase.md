
# Reglas de Ingeniería de Datos y Backend (Supabase & Next.js 16)

## 1. Arquitectura de Servicios
* **Service Layer Pattern:** Toda interacción con Supabase debe estar encapsulada dentro de `app/src/services`.
    * ❌ NO llames a `supabase.from(...)` directamente dentro de un componente de UI (`app/src/components`).
    * ✅ Crea funciones exportables en `app/src/services/nombre-servicio.ts` (ej: `userService.ts`, `paymentService.ts`).
* **Server Actions:** Para mutaciones de datos (INSERT, UPDATE, DELETE), usa Server Actions de Next.js invocados desde los servicios.

## 2. Configuración del Cliente (SSR)
* **Librería Oficial:** Usa estrictamente `@supabase/ssr` para manejar las cookies y la sesión.
* **Contexto:**
    * Usa `createBrowserClient` solo para componentes cliente (Client Components).
    * Usa `createServerClient` para Server Components, Server Actions y Route Handlers.

## 3. Seguridad y RLS (Row Level Security)
* **RLS Mandatorio:** NUNCA crees una tabla sin habilitar Row Level Security (`alter table x enable row level security;`).
* **Políticas:** Define políticas explícitas para SELECT, INSERT, UPDATE y DELETE. Nunca uses `true` como política pública a menos que sea datos estáticos de solo lectura.

## 4. Tipado (TypeScript)
* **Database Types:** Usa siempre los tipos generados automáticamente (interfaz `Database`) para asegurar que las queries estén tipadas.
* **No `any`:** Evita el uso de `any` en las respuestas de la base de datos. Mapea los resultados a interfaces de dominio si es necesario.
