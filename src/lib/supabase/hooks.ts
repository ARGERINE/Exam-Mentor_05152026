
'use client'
// SUPABASE MIGRATION PLACEHOLDER: Auth hook layer for user/session tracking

import { useEffect, useState } from 'react'
import { getSupabase } from './client'

export function useSupabaseUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setLoading(false)
      return
    }

  supabase.auth.getSession().then(({ data: { session } }) => {
  setUser(session?.user ?? null)
  setLoading(false)
})

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

export function useSupabaseSession() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return session
}
