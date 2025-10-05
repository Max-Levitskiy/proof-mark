import { supabase } from '@/lib/supabase'
import { useQuery, useMutation } from '@tanstack/react-query'
import type { Database } from '@/types/supabase'

export type FeatureSubscription = Database['public']['Tables']['feature_subscriptions']['Row']

const TABLE = 'feature_subscriptions'

// Insert subscription, handling duplicate (unique constraint) gracefully
export async function subscribeToFeature(
  email: string,
  featureName: string,
  userId?: string | null
): Promise<{ success: boolean; alreadySubscribed?: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return { success: false, error: 'Email is required.' }
  }

  const payload = {
    email: normalizedEmail,
    feature_name: featureName,
    user_id: userId ?? null,
  }

  const { error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    // Unique violation
    if ((error as any)?.code === '23505') {
      return { success: true, alreadySubscribed: true }
    }
    console.error('subscribeToFeature error:', error)
    return { success: false, error: error.message || 'Subscription failed' }
  }

  return { success: true }
}

// Check if an email is already subscribed for a feature
export async function checkSubscription(
  email: string,
  featureName: string
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) return false

  const { data, error } = await supabase
    .from(TABLE)
    .select('id')
    .eq('email', normalizedEmail)
    .eq('feature_name', featureName)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    // ignore "Results contain 0 rows" style; otherwise log unexpected errors
    console.error('checkSubscription error:', error)
  }

  return Boolean(data?.id)
}

// TanStack Query hooks
export function useCheckSubscription(email: string, featureName: string) {
  return useQuery({
    queryKey: ['feature-subscription', email?.toLowerCase(), featureName],
    queryFn: () => checkSubscription(email, featureName),
    enabled: Boolean(email && featureName),
  })
}

export function useSubscribeToFeature() {
  return useMutation({
    mutationFn: ({
      email,
      featureName,
      userId,
    }: {
      email: string
      featureName: string
      userId?: string | null
    }) => subscribeToFeature(email, featureName, userId),
  })
}
