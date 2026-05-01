
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Lógica de Redirección Estricta:
  // 1. Si hay parámetros de vehículo (make/model), el usuario viene de un flujo de venta -> Onboarding.
  // 2. Si es un login normal -> Siempre al Dashboard.
  
  let redirectPath = '/dashboard';
  
  if (make || model || category) {
    redirectPath = '/sell/onboarding';
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Fail silently in non-writeable environments
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              // Fail silently
            }
          },
        },
      }
    )
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const targetUrl = new URL(redirectPath, origin)
        
        // Solo pasar parámetros si vamos al onboarding
        if (redirectPath === '/sell/onboarding') {
            if (category) targetUrl.searchParams.set('category', category)
            if (make) targetUrl.searchParams.set('make', make)
            if (model) targetUrl.searchParams.set('model', model)
            if (year) targetUrl.searchParams.set('year', year)
            if (km) targetUrl.searchParams.set('km', km)
        }
        
        return NextResponse.redirect(targetUrl)
      }
    } catch (e) {
      console.error("Auth callback error:", e)
    }
  }

  // Fallback absoluto
  return NextResponse.redirect(`${origin}/dashboard`)
}
