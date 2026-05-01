
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/sell/onboarding'

  try {
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
                // On localhost, we might need to relax 'secure' for some browsers
                const isLocalhost = origin.includes('localhost')
                cookieStore.set({ 
                  name, 
                  value, 
                  ...options,
                  secure: isLocalhost ? false : options.secure,
                  sameSite: isLocalhost ? 'lax' : options.sameSite,
                  path: '/',
                })
              } catch (error) {
                // Handle edge cases
              }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value: '', ...options, path: '/' })
              } catch (error) {
                // Handle edge cases
              }
            },
          },
        }
      )
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      console.error("Auth Callback Error:", error)
    }
  } catch (err) {
    console.error("Fatal Auth Callback Error:", err)
  }

  // If everything fails, redirect to onboarding anyway to let localStorage recovery try its magic
  return NextResponse.redirect(`${origin}/sell/onboarding`)
}
