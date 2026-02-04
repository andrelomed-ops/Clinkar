# Guía Completa de Configuración: Supabase + Vercel

Para asegurar que tu aplicación funcione al 100% (incluyendo Login y Magic Links), sigue estos pasos para configurar correctamente las URLs de redirección.

## Paso 1: Configurar Supabase (Datos Verificados)

1.  Entra a la configuración de Auth de tu proyecto:
    👉 **[Supabase Auth URL Configuration](https://supabase.com/dashboard/project/bkbdemosnpzfnfluufga/auth/url-configuration)**

2.  **Site URL**:
    *   Este es tu dominio principal. Copia y pega:
    ```text
    https://clinkar.vercel.app
    ```

3.  **Redirect URLs**:
    *   Aquí debes añadir las rutas permitidas. Haz clic en "Add URL" para cada una:

    **URL 1 (Producción - Crítica):**
    ```text
    https://clinkar.vercel.app/**
    ```

    **URL 2 (Tu Despliegue Actual):**
    ```text
    https://clinkar-74wcz7kns-clinkar.vercel.app/**
    ```

4.  **Guardar**:
    *   Haz clic en **Save**.

## Paso 2: Verificación Final

1.  Abre [https://clinkar.vercel.app](https://clinkar.vercel.app)
2.  Prueba iniciar sesión.
