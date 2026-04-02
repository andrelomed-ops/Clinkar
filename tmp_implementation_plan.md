# Integración del Programa de Referidos - Clinkar

Este plan detalla la arquitectura y los pasos para implementar el Programa de Referidos, donde se paga una comisión (ej. $500 MXN) a quien refiera a un cliente y este concluya exitosamente una compraventa de automóvil a través de la plataforma Clinkar.

## User Review Required

> [!IMPORTANT]
> **Modelo de Pago a Referidores**  
> Hemos detectado en `STRATEGY.md` que la comisión sugerida a mecánicos u otros referidores es de **$500 MXN**.  
> ¿Confirmas este monto por defecto o prefieres que sea un porcentaje del valor u otro monto fijo? Además, ¿cómo prefieres que se les pague (ej. SPEI manual procesado por Admin, o transferencia automática vía Stripe)?

## Proposed Changes

### 1. Base de Datos (Supabase)

Se crearán dos nuevas tablas para gestionar la lógica de referidos sin afectar las transacciones actuales.

#### [NEW] `supabase/migrations/xxxx_referral_system.sql`
- **Tabla `referral_codes`**:
  - `id` (uuid)
  - `user_id` (uuid, FK a auth.users): El usuario que refiere (ej. el mecánico o usuario existente).
  - `code` (text, único): Código alfanumérico corto (ej. `MEC-500` o un hash corto).
  - `reward_amount` (numeric): Monto a pagar al completarse (ej. 500).
- **Tabla `referral_tracking`**:
  - `id` (uuid)
  - `referrer_id` (uuid, FK a auth.users): El que refirió.
  - `referred_email_or_phone` (text): Para registrar de antemano a quién se refirió.
  - `referred_user_id` (uuid, FK a auth.users, opcional): Usuario que se registró con el código.
  - `transaction_id` (uuid, FK a transactions, opcional): Transacción asociada.
  - `status` (enum: `'PENDING_OPERATION'`, `'OPERATION_CLOSED'`, `'PAID'`): Estado del pago del referido.

---

### 2. Servicios Backend y Lógica (Domain Services)

#### [NEW] `src/services/ReferralService.ts`
- Lógica para generar códigos únicos para un usuario.
- Lógica para aplicar un código al crear un usuario o una nueva intención de compra/venta.
- Función `markReferralAsClosed(transactionId)` que se ejecutará cuando una transacción pase a estado `RELEASED` en la Bóveda.

#### [MODIFY] `src/services/TransactionService.ts`
- Añadir un "hook" o llamada a `ReferralService.markReferralAsClosed` una vez que la operación de compra-venta termine exitosamente, para cambiar el estado del referido a `'OPERATION_CLOSED'`.

---

### 3. Interfaz de Usuario (Frontend)

#### [NEW] `src/app/dashboard/referrals/page.tsx`
- Dashboard del Usuario donde puede:
  - Generar y ver su liga de referido (`https://clinkar.com/?ref=CODIGO`).
  - Ver el estatus de sus referidos (En progreso, Operación Cerrada, Pagado).
  - Ver sus ganancias totales.

#### [MODIFY] `src/app/(auth)/login/page.tsx` (y áreas de Signup/Checkout)
- Capturar el parámetro `?ref=CODIGO` de la URL o permitir ingresarlo manualmente al registrar la operación, asociándolo al usuario.

#### [MODIFY] `src/app/admin/page.tsx` (Panel Administrativo)
- Agregar una sección de **"Pagos a Referidores"** para que el equipo financiero de Clinkar vea la lista de referidos en estado `'OPERATION_CLOSED'` y pueda marcarlos como `'PAID'` una vez que les efectúen la transferencia (SPEI).

## Open Questions

1. **Flujo de ingreso del código:** ¿Prefieres que el cliente ingrese el código de referido al momento de registrarse en la plataforma, o al momento de crear específicamente la transacción del vehículo (subir el auto / agendar cita)?
2. **Quiénes pueden referir:** ¿Cualquier usuario logueado tendrá acceso a su dashboard de referidos y generar su enlace, o solo cuentas marcadas como "Socios/Mecánicos"?

## Verification Plan

### Automated Tests
- Ejecutaré Unit Tests (`npm test`) en `ReferralService.ts` para validar la creación de códigos únicos y el cálculo de comisiones.

### Manual Verification
1. Generaremos un usuario y un código de referido en local.
2. Iniciaremos sesión con un cliente nuevo usando ese enlace de referido.
3. Crearemos una transacción mock de un vehículo y la cambiaremos a estado "Cerrada/Liberada".
4. Validaremos que en el dashboard del referidor el estado cambie a "Operación Cerrada" y sume los $500.
