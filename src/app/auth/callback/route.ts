import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ReferralService } from '@/services/ReferralService'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL after successful sign in
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
            // Check for referral cookie
            const cookieStore = await cookies()
            const refCode = cookieStore.get('starterkar_ref')?.value
            
            if (refCode) {
                await ReferralService.assignReferral(supabase, refCode, data.user.id);
            }
            
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

