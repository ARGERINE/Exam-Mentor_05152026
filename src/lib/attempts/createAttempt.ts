import { supabase } from '@/lib/supabase/client'

export async function createAttempt({
  examCode,
  attemptType,
  config
}: {
  examCode: string

  attemptType:
    | 'practice'
    | 'mock'
    | 'sectional'
    | 'custom'

  config?: {
    questions?: number
    duration?: number

    subject?: {
      id?: string
      name?: string
    }

    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'

    chapters?: string[]
  }
}) {

  // ✅ Fallback mode
  if (!supabase) {
    const fakeAttemptId = 'attempt_' + Date.now()

    console.log("Fallback attempt:", fakeAttemptId)

    return {
      id: fakeAttemptId,
      isFallback: true
    }
  }

  // ✅ Real mode
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from('attempts')
    .insert({
  user_id: user.id,
  exam_code: examCode,
  attempt_type: attemptType,
  status: 'IN_PROGRESS',
  started_at: new Date().toISOString(),

  config: config ?? null,
})
    .select()
    .single()

  if (error) {
    throw error
  }

  return {
    id: data.id,
    isFallback: false
  }
}