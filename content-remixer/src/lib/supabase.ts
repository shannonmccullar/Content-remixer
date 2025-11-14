import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a safe client that won't crash if env vars are missing
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Export a flag to check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Database types
export interface OriginalContent {
  id: string
  content: string
  content_hash: string
  created_at: string
  updated_at: string
}

export interface RemixOutput {
  id: string
  original_content_id: string
  remix_type: string
  remixed_content: string
  metadata: Record<string, any> | null
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string | null
  favorite_remix_types: string[]
  default_settings: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  created_at: string
}

