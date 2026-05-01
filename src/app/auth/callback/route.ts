
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  
  // Parámetros capturados de la URL
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const category = searchParams.get('category')
  const year = searchParams.get('year')
  const km = searchParams.get('km')
  
  let redirectPath = next || '/dashboard';
  
  if (!next && (make || model || category)) {
    redirectPath = '/sell/onboarding';
  }

  if (code) {
    // En Next.js 16, cookies() DEBE ser esperado
    const cookieStore = await cookies()
    
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

  return NextResponse.redirect(`${origin}/dashboard`)
}
