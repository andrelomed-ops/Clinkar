# 🏗️ Clinkar Master Plan

**Status:** In Progress
**Context**: Next.js 16 + Supabase (SSR) + Tailwind 4 + Stripe.
**Rules**: `service-layer`, `strict-ssr`, `rls-mandatory`, `no-any`.

---

## 🎯 Phase 1: Foundation (SSR & Layout)
Establecer los cimientos robustos de la aplicación y la conexión segura con datos.

- [x] **1.1. Supabase Client Setup (SSR)**
    - Configurar `lib/supabase/client.ts` (`createBrowserClient`) y `lib/supabase/server.ts` (`createServerClient`) siguiendo las [Reglas de Ingeniería](.agent/rules/supabase.md).
    - Verificar variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

- [x] **1.2. Root Layout & Base UI**
    - Configurar `app/layout.tsx` con fuentes y metadatos base.
    - Implementar un `Navbar` y `Footer` responsivo en `app/src/components/layout`.
    - Validar configuración de Tailwind 4.

## 🎯 Phase 2: Payments (Stripe Checkout) - [DONE]
## 🎯 Phase 3: Post-Purchase (QR & Verification) - [DONE]
## 🎯 Phase 4: Data Integrity & Specialized Flows - [DONE]
## 🎯 Phase 5: Legal & Partner Ecosystem - [DONE]

## 🎯 Phase 6: Admin Dashboard & Global Analytics - [DONE]
Panel centralizado de administración para el control total de la plataforma.

- [x] **6.1. Platform Health Dashboard**
    - Crear `/dashboard/admin` con métricas clave (GMV, Tickets activos, Usuarios).
    - Implementar gráficos de tendencias (opcional/representativo).
- [x] **6.2. Global Transaction Management**
    - Vista de lista maestra de todas las transacciones para resolución de conflictos.
    - Acciones administrativas: Cancelación manual, liberación forzada (Escrow override).
- [x] **6.3. Global Inventory & Logs**
    - Visualización de logs de actividad (`audit_logs`) para seguridad.

## 🎯 Phase 7: Connectivity & Final Polish - [DONE]
Vínculo de flujos externos (Logística/Seguros) y notificaciones en tiempo real.

- [x] **7.1. Real-time Notifications**
    - Integrar `NotificationBell` con canales de Supabase Realtime.
    - Notificar eventos críticos (Pago confirmado, Inspección lista, Oferta recibida).
- [x] **7.2. External Connectivity (Logistics/Insurance)**
    - Conectar `SelectionView` de seguros y logística con la tabla `transactions`.
    - Persistir proveedores seleccionados en la base de datos.
- [x] **7.3. Premium Experience Audit**
    - Revisión de contrastes, micro-animaciones y consistencia visual "WOW".
    - Optimización de estados de carga (Skeletons) en dashboards.

## 🎯 Phase 8: Bulletproof Resilience - [DONE]
Garantizar la estabilidad absoluta de la aplicación mediante manejo de errores robusto y validación de datos.

- [x] **8.1. Multi-Layer Error Handling**
    - Implementar `GlobalErrorBoundary` con interfaz de recuperación premium.
    - Asegurar hidratación segura con `SafeHydration` wrapper.
- [x] **8.2. Fail-Safe Data Layer**
    - Integrar **Zod** para validación de esquemas en tiempo de ejecución (`schemas.ts`).
    - Refactorizar `BaseService` para interceptar fallos de integridad de datos.
- [x] **8.3. Runtime Integrity Audit**
    - Corregir errores de JSX, entidades no escapadas y funciones impuras en el render.

---
## 📝 Notes
- **Auditor:** Run `npm run lint` y verificar build antes de cada commit.
- **Architect:** Updates to this plan require explicit approval.
