import { getSupabase } from '@/lib/supabase/client'

type CreateAttemptParams = {
  examId: string
  subject?: string[] | string | null
  chapter?: string[] | string | null
  questions?: number
  duration?: number
  mode?: string

  calendarItemId?: string
  chapterName?: string
  calendarStage?: string
  attemptOrigin?: string
}

export async function createAttempt({
  examId,
  subject,
  chapter,
  questions,
  duration,
  mode,

  calendarItemId,
  chapterName,
  calendarStage,
  attemptOrigin,
}: CreateAttemptParams) {

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

  if (mode === 'practice') {
  const { data, error } = await supabase.rpc(
  'generate_practice_attempt',
  {
    p_user_id: user.id,
    p_subject_id: subject,
    p_chapter_id: chapter,

    p_calendar_item_id: calendarItemId,
    p_chapter_name: chapterName,
    p_calendar_stage: calendarStage,
    p_attempt_origin: attemptOrigin,
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

if (mode === 'custom') {

  const { data, error } = await supabase.rpc(
    'generate_custom_attempt',
    {
      p_user_id: user.id,
      p_subject_ids: subject,
      p_chapter_ids: chapter,
      p_question_count: questions,
      p_duration_minutes: duration,
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

if (mode === 'sectional') {

  const { data, error } = await supabase.rpc(
    'generate_sectional_attempt',
    {
      p_user_id: user.id,
      p_subject_id: subject,
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

if (mode === 'numerical_drill') {

  console.log("RPC PAYLOAD", {
  p_subject_id: subject,
  p_chapter_id: chapter,
  p_calendar_item_id: calendarItemId,
  p_chapter_name: chapterName,
  p_calendar_stage: calendarStage,
  p_attempt_origin: attemptOrigin,
})
  const { data, error } = await supabase.rpc(
    'generate_numerical_drill_attempt',
    {
      p_user_id: user.id,
      p_subject_id: subject,
      p_chapter_id: chapter,
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

if (mode === 'revision') {

  const { data, error } = await supabase.rpc(
    'generate_revision_attempt',
    {
      p_user_id: user.id,
      p_subject_id: subject,
      p_question_count: questions || 40,
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

  const { data, error } = await supabase.rpc(
    'generate_mock_attempt',
    {
      p_user_id: user.id,
      p_exam_id: examId,
      p_subject: subject,
      p_chapter: chapter,
      p_mode: mode,   
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
