
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
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
  }

  // Fallback a onboarding
  return NextResponse.redirect(`${origin}/sell/onboarding`)
}
