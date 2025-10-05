import { supabase } from '@/lib/supabase'

export async function signInWithGoogle() {
  // Encode current URL to pass through OAuth flow
  const returnUrl = window.location.pathname + window.location.search
  const encodedReturnUrl = encodeURIComponent(returnUrl)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?returnUrl=${encodedReturnUrl}`,
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
