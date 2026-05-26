import { getSupabase } from '@/lib/supabase/client'

export async function createAttempt({
  examId,
}: {
  examId: string
}) {

  const supabase = getSupabase()

  if (!supabase) {
    throw new Error('Supabase unavailable')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase.rpc(
    'generate_mock_attempt',
    {
      p_user_id: user.id,
      p_exam_id: examId,
    }
  )

  if (error) {
    console.error(error)
    throw error
  }

  return {
    attemptId: data,
  }
}