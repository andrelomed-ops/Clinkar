# Clinkar (StarterKar)

Plataforma de compraventa de autos con arbitraje neutral, pagos seguros tipo escrow, y torre de control administrativa.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **Backend**: Supabase (Auth, PostgreSQL, Storage, RLS)
- **Pagos**: Stripe (internacional) + Conekta (México, SPEI)
- **Mobile**: Capacitor (Android/iOS)
- **Analytics**: PostHog
- **Testing**: Vitest, Playwright (E2E)

## Requisitos

- Node.js >=20.0.0 <21.0.0

## Instalación

```bash
npm install
cp .env.example .env.local  # Configurar variables
npm run dev
```

## Variables de Entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `CONEKTA_API_KEY` | Conekta API key (México) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API key (analytics) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |

## Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build producción
npm test -- --run # Tests
npm run lint      # Linter
```

## Funcionalidades Principales

- Marketplace de autos con 150 puntos de inspección
- Pago seguro tipo escrow (Stripe + Conekta + SPEI)
- Depósito en garantía reembolsable ($2,500 MXN)
- Flujo comprador/vendedor separado
- Sistema PLD (Prevención de Lavado de Dinero)
- Logística (Clinkargo) con cálculo de distancias
- Panel admin (Torre de Control) con 12 vistas
- Referidos con pagos por Conekta
- Inversionistas con tiers
- Asistente IA (EliteAdvisor/SK IA Bot)
- Inspecciones y certificaciones
- Certificado de no robo (REPUVE)

## Despliegue

```bash
npm run build
# Deploy a Vercel
```
