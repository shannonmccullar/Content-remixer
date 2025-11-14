import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { OriginalContent, RemixOutput, UserPreferences, Tag } from '../lib/supabase'

// Helper function to generate content hash (browser-compatible)
const generateContentHash = async (content: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Original Content Operations
export const saveOriginalContent = async (content: string): Promise<OriginalContent | null> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return null
  }

  const contentHash = await generateContentHash(content)
  
  // Check if content already exists
  const { data: existing } = await supabase
    .from('original_content')
    .select('*')
    .eq('content_hash', contentHash)
    .single()

  if (existing) {
    return existing
  }

  // Insert new content
  const { data, error } = await supabase
    .from('original_content')
    .insert({
      content,
      content_hash: contentHash
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving original content:', error)
    return null
  }

  return data
}

export const getOriginalContent = async (id: string): Promise<OriginalContent | null> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('original_content')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching original content:', error)
    return null
  }

  return data
}

// Remix Output Operations
export const saveRemixOutput = async (
  originalContentId: string,
  remixType: string,
  remixedContent: string,
  metadata?: Record<string, any>
): Promise<RemixOutput | null> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('remix_outputs')
    .insert({
      original_content_id: originalContentId,
      remix_type: remixType,
      remixed_content: remixedContent,
      metadata
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving remix output:', error)
    return null
  }

  return data
}

export const getRemixOutputs = async (originalContentId: string): Promise<RemixOutput[]> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return []
  }

  const { data, error } = await supabase
    .from('remix_outputs')
    .select('*')
    .eq('original_content_id', originalContentId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching remix outputs:', error)
    return []
  }

  return data || []
}

export const getAllRemixOutputs = async (): Promise<RemixOutput[]> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return []
  }

  const { data, error } = await supabase
    .from('remix_outputs')
    .select(`
      *,
      original_content:original_content_id (
        content,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all remix outputs:', error)
    return []
  }

  return data || []
}

// User Preferences Operations
export const saveUserPreferences = async (
  userId: string | null,
  favoriteRemixTypes: string[],
  defaultSettings?: Record<string, any>
): Promise<UserPreferences | null> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      favorite_remix_types: favoriteRemixTypes,
      default_settings: defaultSettings
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving user preferences:', error)
    return null
  }

  return data
}

export const getUserPreferences = async (userId: string | null): Promise<UserPreferences | null> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user preferences:', error)
    return null
  }

  return data
}

// Tag Operations
export const createTag = async (name: string): Promise<Tag | null> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({ name })
    .select()
    .single()

  if (error) {
    console.error('Error creating tag:', error)
    return null
  }

  return data
}

export const getAllTags = async (): Promise<Tag[]> => {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return []
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data || []
}
