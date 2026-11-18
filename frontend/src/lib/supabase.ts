import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : undefined)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : undefined)

const isTest = import.meta.env.MODE === 'test' || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test')
const isProd = import.meta.env.PROD

if (!supabaseUrl || !supabaseAnonKey) {
  if (isProd) {
    console.error('CRITICAL: Supabase production credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing! Live authentication and remote database queries will fail.')
  } else if (!isTest) {
    console.warn('Notice: Missing Supabase Environment Variables - Operating in offline demo simulation mode.')
  }
}

// In test environment or offline demo mode, fall back to safe placeholder endpoints to avoid constructor crash
export const supabase = createClient(
  supabaseUrl || (isTest ? 'https://test-project.supabase.co' : 'https://placeholder.supabase.co'),
  supabaseAnonKey || (isTest ? 'test-anon-key-placeholder' : 'placeholder-anon-key')
)
