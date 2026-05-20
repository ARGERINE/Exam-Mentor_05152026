
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { analyzeMockPerformance, MockAnalysisOutput } from '@/ai/flows/mock-analysis-flow'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { getSupabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  ClipboardList, 
  Activity, 
  Zap, 
  Target, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Brain, 
  Timer,
  ChevronRight,
  Flame,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Gauge,
  BarChart3,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MockAnalysisPage() {
  const { user } = useSupabaseUser()
  const db = getSupabase()
  const [selectedAttemptId, setSelectedId] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<MockAnalysisOutput | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const [allMocks, setAllMocks] = useState<any[]>([])
const [attemptsLoading, setAttemptsLoading] = useState(true)

useEffect(() => {
  async function fetchMocks() {
    if (!db || !user) return

    setAttemptsLoading(true)

    const { data, error } = await db
      .from('exam_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('attempt_type', 'Mock')
      .order('attempted_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error(error)
    }

    setAllMocks(data || [])
    setAttemptsLoading(false)
  }

  fetchMocks()
}, [db, user])

  useEffect(() => {
    if (allMocks && allMocks.length > 0 && !selectedAttemptId) {
      setSelectedId(allMocks[0].id)
    }
  }, [allMocks, selectedAttemptId])

  const currentMock = useMemo(() => 
    allMocks?.find(m => m.id === selectedAttemptId) || allMocks?.[0], 
  [allMocks, selectedAttemptId])

  const [questions, setQuestions] = useState<any[]>([])

useEffect(() => {
  async function fetchQuestions() {
    if (!db || !user || !selectedAttemptId) return

    const { data, error } = await db
      .from('question_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_attempt_id', selectedAttemptId)

    if (error) {
      console.error(error)
    }

    setQuestions(data || [])
  }

  fetchQuestions()
}, [db, user, selectedAttemptId])

  useEffect(() => {
    async function runAnalysis() {
      if (!currentMock || !questions || questions.length === 0) return
      setAnalyzing(true)
      try {
        const result = await analyzeMockPerformance({
          examName: "NEET Simulation",
          score: currentMock.score,
          totalQuestions: currentMock.totalQuestions,
          attempts: questions.map((q, i) => ({
            questionId: q.id,
            subject: q.questionSubjectId || 'General',
            timeTakenSeconds: q.time_taken_seconds,
            confidenceLevel: q.confidenceRating || 3,
            isCorrect: q.isCorrect,
            mistakeCategory: q.isCorrect ? 'none' : (q.time_taken_seconds < 30 ? 'careless' : 'conceptual'),
            orderAttempted: i + 1
          }))
        })
        setAiAnalysis(result)
      } catch (e) {
        console.error(e)
      } finally {
        setAnalyzing(false)
      }
    }
    if (currentMock && questions) runAnalysis()
  }, [currentMock, questions])

  if (attemptsLoading || analyzing) {
    return (
      <MentorLayout>
        <main className="flex-1 p-12 space-y-8">
          <Skeleton className="h-12 w-1/3 rounded-xl" />
          <Skeleton className="h-96 rounded-[3rem]" />
        </main>
      </MentorLayout>
    )
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30">
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
          <header className="flex justify-between items-end">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <ClipboardList className="w-8 h-8" />
                <h1 className="text-4xl font-headline font-bold text-slate-900">Mock Intelligence</h1>
              </div>
            </div>
            <Select value={selectedAttemptId || ''} onValueChange={setSelectedId}>
              <SelectTrigger className="w-64 rounded-xl border bg-white shadow-sm font-bold text-xs h-11">
                <SelectValue placeholder="Select Mock" />
              </SelectTrigger>
              <SelectContent>
                {allMocks?.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {new Date(m.attemptedAt).toLocaleDateString()} — {m.score} pts
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </header>

          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden p-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Brain className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-headline font-bold">Mentor's Tactical Narrative</h3>
              </div>
              <p className="text-xl leading-relaxed italic text-slate-600 font-body">
                "{aiAnalysis?.behavioralNarrative}"
              </p>
            </div>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )
}
