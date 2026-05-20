import { getSupabase } from '@/lib/supabase/client'

export async function insertUserBaseline(userId: string, data: any) {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      console.warn("Supabase not connected — skipping insert")
      return null
    }

    const { error } = await supabase
      .from('user_baselines')
      .insert([
        {
          user_id: userId,
          baseline_data: data,
        },
      ])

    if (error) throw error

    console.log("Baseline inserted successfully")
    return true
  } catch (err) {
    console.error('Baseline insert error:', err)
    return null
  }
}