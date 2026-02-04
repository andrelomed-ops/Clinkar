# Guía de Despliegue - Clinkar v1.0

¡Felicidades! Tu aplicación está lista para salir a producción. Aquí tienes los pasos recomendados para desplegar en **Vercel** (recomendado para Next.js).

## 1. Requisitos Previos
- Cuenta en GitHub / GitLab / Bitbucket.
- Cuenta en [Vercel](https://vercel.com).
- Variables de entorno de Supabase listas (URL y CANON_KEY).

## 2. Configuración del Proyecto
Asegúrate de que tu repositorio tenga los últimos cambios de la Fase 10 (Optimizaciones).

## 3. Despliegue en Vercel

1.  **Importar Proyecto**:
    - Ve a tu dashboard de Vercel y haz clic en "Add New..." > "Project".
    - Selecciona tu repositorio git `clinkar`.

2.  **Configurar Build**:
    - Framework Preset: **Next.js** (Detectado automáticamente).
    - Root Directory: `app` (Si tu proyecto está en una subcarpeta, ajústalo).

3.  **Variables de Entorno**:
    Agrega las siguientes variables en la sección "Environment Variables":
    - `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de proyecto Supabase.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave pública anónima.

4.  **Desplegar**:
    - Haz clic en "Deploy".
    - Vercel construirá tu aplicación, optimizará las imágenes y generará las rutas estáticas.

## 4. Verificación Post-Despliegue
- Entra a la URL que te da Vercel (ej. `clinkar.vercel.app`).
- Prueba el flujo de `/buy` (verificando que carguen las imágenes).
- Prueba el login (asegúrate de agregar la URL de Vercel en la lista de "Redirect URLs" en Supabase Auth).

## 5. Mantenimiento
- **Logs**: Revisa la pestaña "Logs" en Vercel para ver errores en tiempo real.
- **Analytics**: Activa Vercel Analytics para ver métricas de velocidad real de usuarios.

---

### Notas Adicionales
- **Capacitor**: Si planeas lanzar la app móvil, ejecuta `npx cap sync` para actualizar los plugins nativos antes de compilar en Android Studio / Xcode.
