import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables in lib/supabase.ts');
}

// Prevent crash even if envs are missing (common in build steps or misconfigured envs)
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : createClient<Database>('https://placeholder.supabase.co', 'placeholder');
