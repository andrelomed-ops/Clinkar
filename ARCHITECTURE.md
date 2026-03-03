# Documentación de Arquitectura - Clinkar

## 1. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 (App Router), React 19 |
| Estilos | Tailwind CSS 4, class-variance-authority |
| Estado | React Context + Supabase Auth |
| Base de Datos | Supabase (PostgreSQL) |
| Pagos | Stripe (Checkout + Elements), SPEI |
| Auth | Supabase Auth + Google OAuth |
| Móvil | Capacitor (iOS/Android PWA) |
| Testing | Vitest, Playwright |
| IA | OpenAI (GPT-4) para OCR y análisis |

---

## 2. Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/           # Rutas de autenticación
│   ├── (marketing)/      # Páginas públicas
│   ├── admin/            # Panel de administración
│   ├── api/              # API Routes
│   ├── dashboard/        # Dashboard de usuario
│   ├── checkout/         # Proceso de compra
│   ├── inspector/        # Portal de inspectores
│   └── partner/          # Portal de socios
├── components/
│   ├── ui/              # Componentes base (Button, Input, etc.)
│   ├── dashboard/      # Componentes del dashboard
│   ├── market/         # Componentes del marketplace
│   └── transaction/    # Componentes de transacción
├── services/           # Servicios de dominio
│   ├── VehicleCheckService.ts
│   ├── LogisticsService.ts
│   ├── PaymentService.ts
│   ├── VerificationService.ts
│   └── ...
├── lib/                # Utilidades y configuración
└── scripts/           # Scripts de utilidad (NO para producción)
```

---

## 3. Patrones de Diseño

### 3.1 Servicios (Domain Services)
Cada dominio de negocio tiene su propio servicio en `src/services/`:

```typescript
// Patrón base
export class BaseService {
    protected static handleResponse<T>(data: any): ServiceResponse<T>
    protected static handleError(error: any): ServiceResponse<null>
}

// Implementación
export class CarService extends BaseService {
    static async getCars(filters?: CarFilters): Promise<ServiceResponse<Car[]>>
    static async getCarById(id: string): Promise<ServiceResponse<Car>>
}
```

### 3.2 Componentes UI
- Usar `class-variance-authority` para variantes
- Tailwind para estilos
- Exportar tipos explícitos

### 3.3 Autenticación
- Middleware: `src/middleware.ts` maneja protección de rutas
- Auth en cliente: `src/lib/supabase/client.ts`
- Auth en servidor: `src/lib/supabase/server.ts`

---

## 4. Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/buy` | Marketplace (ver autos) |
| `/buy/[id]` | Detalle de auto |
| `/sell` | Vender auto |
| `/checkout/[id]` | Proceso de compra |
| `/dashboard` | Panel de usuario |
| `/dashboard/inspector` | Portal inspector |
| `/admin` | Panel admin |
| `/partner` | Portal socios |

---

## 5. Integraciones Externas

### 5.1 Pagos
- **Stripe**: Pagos con tarjeta (3.6% + fee)
- **SPEI**: Transferencias sin comisión
- **Escrow**: Fondos retenidos hasta entrega

### 5.2 Verificaciones
- **REPUVE**: Robos,Gravámenes
- **RFC**: Validación fiscal
- **INE/CURP**: Identidad PLD/KYC

### 5.3 Logística
- **Google Maps**: Rutas y tracking
- **Proveedor externo**: Transportación

---

## 6. Testing

```bash
npm test           # Unit tests (Vitest)
npm run test:e2e  # E2E tests (Playwright)
```

### Estructura de tests
- Unit: `src/services/__tests__/`
- E2E: `tests/` (Playwright)

---

## 7. Notas de Mantenimiento

### Dependencias Críticas
- Next.js 16 requiere Node.js 18+
- React 19 es muy reciente - verificar compatibilidad
- Stripe keys en variables de entorno

### Scripts NO prod
La carpeta `src/scripts/` contiene scripts de prueba/development. No ejecutar en producción.

### Duplicados conocidos
- `SmartPaymentSelector` existe en 2 versiones (transaction/ y checkout/)
  - transaction: Stripe Elements inline
  - checkout: Redirección a Stripe

### Logging
- Usar `src/lib/logger.ts` en lugar de `console.log`
- En producción solo muestra errores
- En desarrollo muestra todos los logs con colores

---

## 9. Comandos de Desarrollo

```bash
npm run dev          # Desarrollo
npm run build       # Build producción
npm run lint        # Verificar errores
npm test            # Unit tests
npm run test:e2e   # E2E tests
npm run test -- --coverage  # Coverage
```

---

## 10. Variables de Entorno Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# OpenAI
OPENAI_API_KEY=

# REPUVE (México)
REPUVE_API_KEY=
```
