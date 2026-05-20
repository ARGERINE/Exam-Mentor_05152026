import { getSupabase } from './client'

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return data
  } catch (err) {
    console.error('Sign in error:', err)
    return null
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    return data
  } catch (err) {
    console.error('Sign up error:', err)
    return null
  }
}

export async function signOut() {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { error } = await supabase.auth.signOut()

    if (error) throw error

    window.location.href = '/auth'

    return true
  } catch (err) {
    console.error('Sign out error:', err)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const supabase = getSupabase()
    if (!supabase) return null

    const { data, error } = await supabase.auth.getUser()

    if (error) throw error

    return data?.user || null
  } catch (err) {
    console.error('Get current user error:', err)
    return null
  }
}