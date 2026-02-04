import { createBrowserClient as createBrowserClientInternal } from '@supabase/ssr'

export function createBrowserClient() {
    return createBrowserClientInternal(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    )
}
