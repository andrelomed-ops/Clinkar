# Guia de Mantenimiento y Operatividad

Esta guía responde a la pregunta: *¿La aplicación necesita un humano supervisándola 24/7 para no caerse?*

## 1. Disponibilidad (Uptime) - **NO Requiere Humano**
La arquitectura de Clinkar es **Serverless** (sin servidores tradicionales que administrar).
- **Frontend (Vercel)**: La página se mantiene online automáticamente. Vercel escala los servidores según el tráfico. Si entran 1 o 1 millón de usuarios, el sistema aguanta sin intervención humana.
- **Backend (Supabase)**: La base de datos es gestionada. Supabase (AWS bajo el capó) asegura que los datos estén disponibles.

**Conclusión**: No necesitas contratar a alguien "de guardia" para asegurarse de que la página cargue. Eso es automático.

## 2. Mantenimiento Evolutivo - **SI Requiere Humano (Periódico)**
Aunque la app no se "cae", el software envejece. Se recomienda intervención humana periódica para:
- **Actualizaciones de Seguridad**: Las librerías (npm packages) sacan parches de seguridad que deben instalarse.
- **Políticas de Tiendas (Apps)**: Google Play y Apple App Store cambian sus reglas cada año. Si no actualizas la app nativa, podrían retirarla de la tienda.
- **Pagos de Servicios**: Asegurar que las tarjetas de crédito en Vercel/Supabase tengan fondos.

## 3. Soporte Operativo - **SI Requiere Humano (Diario)**
La app es una herramienta, pero el negocio la opera gente:
- **Admin**: Alguien debe aprobar los documentos en el Dashboard Legal.
- **Soporte**: Alguien debe contestar si un usuario reporta un problema.

## Recomendación
1.  **Fase de Lanzamiento**: Contratar una póliza de soporte técnico "por horas" o un desarrollador freelance para revisiones mensuales.
2.  **Fase de Crecimiento**: Contratar un DevOps o Lead Developer _in-house_ cuando el tráfico justifique optimizaciones avanzadas.
