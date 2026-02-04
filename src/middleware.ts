import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // console.warn("⚠️ SUPABASE ENVS MISSING (Middleware): Skipping Auth Check.");
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // Only call getUser if we are on a protected route or if we need to check auth status
    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');

    if (isDashboardRoute) {
        const { data: { user } } = await supabase.auth.getUser()
        const demoRole = request.cookies.get('clinkar_role')?.value

        // 1. Basic Auth Check
        if (!user && !demoRole) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // 2. Admin Route Protection
        const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');
        if (isAdminRoute) {
            // Check metadata (secure) or cookie (demo/fallback)
            const role = user?.user_metadata?.role || demoRole;

            if (role !== 'ADMIN') {
                // Determine destination based on role (or just 403/dashboard)
                console.warn(`Unauthorized access attempt to Admin by: ${user?.email || 'Guest'}`);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
