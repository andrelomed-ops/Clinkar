
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Capturar estado para redirección
  const next = searchParams.get('next') ?? '/sell/onboarding'
  const category = searchParams.get('category')
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const year = searchParams.get('year')
  const km = searchParams.get('km')

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
              // En algunos entornos de servidor no se pueden setear cookies
              // pero exchangeCodeForSession lo requiere.
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              // Silenciar errores de borrado en el servidor
            }
          },
        },
      }
    )
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const targetUrl = new URL(next, origin)
        if (category) targetUrl.searchParams.set('category', category)
        if (make) targetUrl.searchParams.set('make', make)
        if (model) targetUrl.searchParams.set('model', model)
        if (year) targetUrl.searchParams.set('year', year)
        if (km) targetUrl.searchParams.set('km', km)
        
        return NextResponse.redirect(targetUrl)
      }
    } catch (e) {
      console.error("Auth error:", e)
    }
  }

  // Fallback seguro ante cualquier error
  return NextResponse.redirect(`${origin}/sell/onboarding`)
}
