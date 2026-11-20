import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl !== 'https://placeholder.supabase.co' &&
  !rawUrl.includes('YOUR_PROJECT_ID')
)

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
