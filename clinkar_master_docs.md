# Clinkar - Documentación Maestra del Proyecto (v1.0)

## 1. Visión General
Clinkar es una plataforma *phygital* (física + digital) para la compraventa segura de autos seminuevos entre particulares. Elimina el riesgo de fraude mediante tres pilares:
1.  **Bóveda Digital (Escrow)**: El dinero no se libera al vendedor hasta que el comprador confirma la entrega física y legal.
2.  **Inspección Mecánica**: Certificación de 150 puntos a domicilio.
3.  **Gestión Legal**: Validación de documentos y generación de contratos digitales/híbridos.

## 2. Stack Tecnológico
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript.
- **Estilos**: Tailwind CSS v4, Lucide Icons, Shadcn/UI (modificado).
- **Backend (BaaS)**: Supabase (Postgres, Auth, Storage, Realtime).
- **Móvil**: Capacitor (iOS/Android) sobre la base de Next.js.
- **IA**: Lógica determinista y heurística para inventario y análisis de documentos.

## 3. Módulos Principales

### A. Marketplace (Comprador)
- **Ruta**: `/buy`, `/buy/[id]`
- **Características**:
    - Búsqueda y filtrado en tiempo real (Supabase).
    - SEO Dinámico: Metadatos OpenGraph generados por auto (`generateMetadata`).
    - Simulador de Crédito y Ecuación de Precio.
    - Sistema de Favoritos Híbrido (Local Storage + DB Sync).

### B. Venta y Captación (Vendedor)
- **Ruta**: `/sell`
- **Características**:
    - **Cotizador Instantáneo**: Algoritmo de precios basado en mercado.
    - **Carga de Documentos**: `DocumentUploadView` con `CameraUpload`.
        - Soporte para cámara nativa móvil.
        - Compresión de imágenes del lado del cliente (<5MB).
    - **Mi Garage**: Dashboard para gestionar autos publicados.

### C. Operaciones y Legal (Backoffice)
- **Rutas**: `/admin`, `/dashboard/legal`
- **Características**:
    - **Pipeline de Revisión**: Dashboard para aprobar/rechazar documentos (INE, Facturas).
    - **Notificaciones**: Sistema de alertas (`NotificationService`) integrado a Supabase.
    - **Contratos Inteligentes**: Generación de PDF web para firma.
        - *Firma Híbrida*: Opción de imprimir contrato para firma autógrafa si el usuario lo prefiere.
        - *Logística*: Instrucciones claras para llevar copias impresas a la cita.
    - **Carta Responsiva Digital**: Generación automática de deslinde de responsabilidad civil (`LiabilityReleaseLetter`), accesible desde el Ecosistema Post-Venta.

### D. Bóveda y Handover
- **Ruta**: `/dashboard/handover/[id]`
- **Flujo**:
    1.  Comprador deposita -> Fondos en Custodia.
    2.  Cita de Entrega -> Mecánico valida estado final.
    3.  Firma de Contrato -> Digital o Híbrida.
    4.  Entrega de Llaves -> Comprador escanea QR / Libera fondos.
    5.  Dispersión -> Vendedor recibe pago.

## 4. Estructura de Base de Datos (Supabase)
Tablas clave:
- `cars`: Inventario, precios, especificaciones técnicas (JSONB), estado (`status`).
- `transactions`: Relación comprador-vendedor-auto, estado de la bóveda (`IN_VAULT`, `RELEASED`).
- `documents`: URLs de archivos, estado de validación (`PENDING`, `APPROVED`), metadatos de IA.
- `notifications`: Alertas de usuario.

## 5. Inteligencia Artificial (Simulada/Heurística)
- **Búsqueda**: `ai-brain.ts` analiza lenguaje natural ("busco camioneta 2020 por menos de 300k") y lo convierte a consultas SQL de Supabase.
- **Visión**: `DocumentAnalysisService.ts` simula análisis OCR para demos (detecta desenfoque/oscuridad en nombres de archivo).

## 6. Despliegue
- **Web**: Optimizado para Vercel. Ver `DEPLOY.md`.
- **Móvil**: Listo para compilación nativa con Capacitor.
    - Android: `npx cap add android`
    - iOS: `npx cap add ios`

## 7. Notas de Mantenimiento y Operatividad

### Disponibilidad (Uptime) - Serverless
La arquitectura de Clinkar es **Serverless** (sin servidores tradicionales).
- **Frontend (Vercel)**: Escala automáticamente según tráfico.
- **Backend (Supabase)**: Base de datos gestionada y resiliente.
**Conclusión**: No requiere monitoreo humano 24/7 para estar online.

### Mantenimiento Evolutivo (Periódico)
Aunque la app no se "cae", requiere intervención humana mensual/trimestral para:
- **Seguridad**: Actualizar librerías (`npm audit fix`).
- **Tiendas App**: Actualizar binarios por cambios de política en iOS/Android.
- **Pagos**: Renovar suscripciones de Vercel/Supabase.

## 8. Guía rápida de Despliegue (Producción)

### Requisitos
- Cuenta en **Vercel** y **Supabase**.
- Variables de Entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Pasos en Vercel
1.  **Importar**: Conectar repositorio Git.
2.  **Configurar**: Framework "Next.js". Root Directory "app".
3.  **Variables**: Pegar las claves de producción.
4.  **Deploy**: Clic en finalizar.

*Para móviles, ejecutar `npx cap sync` antes de compilar en Android Studio / Xcode.*

9. Estrategia y Plan Financiero
Para ver el detalle de rentabilidad, análisis de competencia y plan de lanzamiento, consultar el documento dedicado:
- [Plan Estratégico y Financiero 2026](file:///c:/Users/cp_an/OneDrive/Escritorio/ANTIGRAVITY/NUEVO/app/STRATEGY.md)
