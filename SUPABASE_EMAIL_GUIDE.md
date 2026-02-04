# Guía de Personalización de Correos en Supabase

Para que tus usuarios reciban correos con la marca **Clinkar** y no "Supabase", sigue estos pasos:

## 1. Cambiar el Nombre del Remitente (Sender Name)
Esto hará que en la bandeja de entrada diga "Clinkar" en lugar de "noreply".

1.  Ve a tu proyecto en Supabase.
2.  Entra a **Authentication** (Icono de usuarios) -> **Providers** -> **Email**.
3.  Baja hasta encontrar **"SMTP Settings"** (aunque uses el servidor por defecto, puedes cambiar el nombre).
    *   Si usas el servidor por defecto de Supabase, busca la sección **"Custom SMTP"** y asegúrate de que esté APAGADO si no tienes uno propio, pero busca **"Sender Name"** en la configuración general de Email.
    *   *Nota: Supabase a veces limita esto en el plan gratis si no configuras tu propio SMTP. Si no ves la opción de "Sender Name" directo, tendrás que configurar un SMTP propio (como AWS SES o Resend) para tener control total. PERO, puedes editar el template.*

## 2. Personalizar el Asunto y el Cuerpo del Correo
Esto es lo más importante para la experiencia de usuario.

1.  Ve a **Authentication** -> **Email Templates**.
2.  Selecciona **"Confirm Your Signup"**.

### Asunto (Subject)
Cambia:
`Confirm your signup`
Por:
`Bienvenido a Clinkar - Confirma tu cuenta`

### Cuerpo (Body)
Puedes usar HTML básico. Copia y pega este ejemplo para que se vea profesional:

```html
<h2>¡Bienvenido a Clinkar!</h2>
<p>Gracias por unirte a la plataforma más segura para comprar y vender autos.</p>
<p>Para activar tu cuenta y acceder a tu garage digital, por favor confirma tu correo haciendo clic aquí:</p>
<p>
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
    Confirmar mi cuenta
  </a>
</p>
<p style="font-size: 12px; color: #666;">Si no creaste esta cuenta, puedes ignorar este correo.</p>
```

3.  Dale a **Save**.

## 3. Probar la Experiencia Completa
1.  Asegúrate de haber vuelto a activar **"Confirm email"** en *Authentication -> Providers -> Email*.
2.  Regístrate con un correo nuevo en tu app.
3.  Verás que el correo llega con tu nuevo asunto y diseño.
4.  Al dar clic en "Confirmar mi cuenta", te llevará al Dashboard y verás la animación de celebración 🎉.
