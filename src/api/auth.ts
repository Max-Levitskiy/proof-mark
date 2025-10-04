import { supabase } from '@/lib/supabase'
import type { User } from '@/types/user'

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabaseProjectName = import.meta.env.VITE_PROJECT_NAME

    // Get user from localStorage as the Supabase SDK has compatibility issues with new key format
    const storageKey = `sb-${supabaseProjectName}-auth-token`
    const storedSession = localStorage.getItem(storageKey)

    if (!storedSession) return null

    const sessionData = JSON.parse(storedSession)
    const user = sessionData.user

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email!,
        full_name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name,
        avatar_url:
          session.user.user_metadata?.avatar_url ||
          session.user.user_metadata?.picture,
        created_at: session.user.created_at,
        updated_at: session.user.updated_at || session.user.created_at,
      })
    } else {
      callback(null)
    }
  })

  return () => subscription.unsubscribe()
}
