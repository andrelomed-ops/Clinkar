import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const refCode = request.nextUrl.searchParams.get('ref')
    if (refCode) {
        response.cookies.set('starterkar_ref', refCode, { 
            path: '/', 
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax'
        })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
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

    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

    if (isDashboardRoute || isAdminRoute) {
        const { data: { user } } = await supabase.auth.getUser()
        const demoRole = request.cookies.get('starterkar_role')?.value

        if (!user && !demoRole) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (isAdminRoute) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user?.id)
                .single();
            
            const role = profile?.role || demoRole;
            
            if (role !== 'admin' && role !== 'ADMIN') {
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