"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CalendarDays, TrendingUp, CheckCircle2, Timer, Brain, Sparkles,
  AlertCircle, RotateCcw, Target, BookOpen, ShieldCheck, Zap, Clock, ListTodo,
  ChevronDown, ChevronUp, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabase } from '@/lib/supabase/client'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { format, startOfWeek, addDays, isToday, isBefore } from 'date-fns'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudyBlock {
  id: string
  type: 'CONCEPT' | 'PRACTICE' | 'REVISION' | 'TEST' | 'MOCK'
  topic: string
  chapterId?: string
  durationMin: number
  questionCount: number
  status: 'PENDING' | 'COMPLETED'
}

interface DayPlan {
  date: Date
  day: string
  short: string
  subject: string
  topics: string[]
  totalHours: number
  status: 'completed' | 'current' | 'pending'
  blocks: StudyBlock[]
}

interface RevisionItem {
  id: string
  topic: string
  subject: string
  revisionNumber: number
  dueDate: string
  priority: string
}

interface MockPlan {
  id: string
  type: string
  scheduledDate: Date
  label: string
}

interface WeeklyProgress {
  chapters: { done: number; total: number }
  questions: { done: number; total: number }
  revision: { done: number; total: number }
  mocks: { done: number; total: number }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BLOCK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  CONCEPT: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Concept Study' },
  PRACTICE: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Practice' },
  REVISION: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Revision' },
  TEST: { bg: 'bg-rose-50', text: 'text-rose-600', label: 'Test' },
  MOCK: { bg: 'bg-slate-800', text: 'text-white', label: 'Mock Exam' },
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORTS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PlanSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-56" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
      </div>
    </div>
  )
}

// ─── Block Card ───────────────────────────────────────────────────────────────

function BlockCard({ block, onToggle }: { block: StudyBlock; onToggle: (id: string) => void }) {
  const style = BLOCK_STYLES[block.type] ?? BLOCK_STYLES.CONCEPT
  return (
    <Card className={cn(
      'border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all',
      block.status === 'COMPLETED' ? 'opacity-60' : 'bg-white'
    )}>
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0', style.bg, style.text)}>
            {block.type.charAt(0)}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{style.label}</p>
            <h4 className="text-base font-bold text-slate-900">{block.topic}</h4>
            {block.questionCount > 0 && (
              <p className="text-xs text-slate-400">{block.questionCount} Questions</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Duration</p>
            <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-slate-300" /> {block.durationMin} min
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggle(block.id)}
            className={cn('rounded-xl h-10 w-10 p-0 transition-colors',
              block.status === 'COMPLETED'
                ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50')}
          >
            <CheckCircle2 className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WeeklyPlanPage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabase()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([])
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0)
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>([])
  const [mockPlan, setMockPlan] = useState<MockPlan[]>([])
  const [progress, setProgress] = useState<WeeklyProgress>({
    chapters: { done: 0, total: 0 },
    questions: { done: 0, total: 0 },
    revision: { done: 0, total: 0 },
    mocks: { done: 0, total: 0 },
  })
  const [weeklyPulse, setWeeklyPulse] = useState(0)
  const [mentorNote, setMentorNote] = useState('')
  const [expandedRevision, setExpandedRevision] = useState(false)
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set())

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const todayDayIdx = Math.max(0, Math.min(6, new Date().getDay() === 0 ? 6 : new Date().getDay() - 1))

  useEffect(() => {
    if (!user) return
    setSelectedDayIdx(todayDayIdx)
    fetchData()
  }, [user])

  async function fetchData() {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Maps
      const { data: subjectsData } = await supabase.from('subjects').select('id, name')
      const subjectMap: Record<string, string> = {}
      subjectsData?.forEach(s => { subjectMap[s.id] = s.name })

      const { data: chaptersData } = await supabase.from('chapters').select('id, chapter_name, subject_id')
      const chapterMap: Record<string, { name: string; subject: string }> = {}
      chaptersData?.forEach(c => {
        chapterMap[c.id] = { name: c.chapter_name, subject: subjectMap[c.subject_id] ?? 'Unknown' }
      })

      // 2. Active weekly plan
      const { data: weeklyPlanData } = await supabase
        .from('weekly_plans')
        .select('id, week_start, week_end, focus_subjects, recommended_actions')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // 3. Weekly sessions
      let sessions: any[] = []
      if (weeklyPlanData?.id) {
        const { data: sessionsData } = await supabase
          .from('weekly_sessions')
          .select('id, chapter_id, session_type, planned_question_count, completed_question_count, status, scheduled_date')
          .eq('weekly_plan_id', weeklyPlanData.id)
          .order('scheduled_date', { ascending: true })
        sessions = sessionsData ?? []
      } else {
        // Fallback: load from study_plan_roadmap as best-effort
        const { data: roadmapData } = await supabase
          .from('study_plan_roadmap')
          .select('id, chapter_id, planned_week, target_questions, target_revision_cycles, status')
          .eq('user_id', user!.id)
          .in('status', ['IN_PROGRESS', 'PLANNED'])
          .order('priority_score', { ascending: false })
          .limit(14)
        roadmapData?.forEach((r, i) => {
          const dayOffset = i % 5  // Mon-Fri
          sessions.push({
            id: r.id,
            chapter_id: r.chapter_id,
            session_type: i % 4 === 0 ? 'CONCEPT' : i % 4 === 1 ? 'PRACTICE' : i % 4 === 2 ? 'REVISION' : 'TEST',
            planned_question_count: r.target_questions ?? 60,
            completed_question_count: 0,
            status: 'PENDING',
            scheduled_date: format(addDays(weekStart, dayOffset), 'yyyy-MM-dd'),
          })
        })
      }

      // 4. Build day plans
      const dayMap: Record<string, { sessions: any[]; subjects: Set<string> }> = {}
      for (let i = 0; i < 7; i++) {
        const dateKey = format(addDays(weekStart, i), 'yyyy-MM-dd')
        dayMap[dateKey] = { sessions: [], subjects: new Set() }
      }
      sessions.forEach(s => {
        const key = typeof s.scheduled_date === 'string'
          ? s.scheduled_date.substring(0, 10)
          : format(new Date(s.scheduled_date), 'yyyy-MM-dd')
        if (dayMap[key]) {
          dayMap[key].sessions.push(s)
          const ch = chapterMap[s.chapter_id]
          if (ch) dayMap[key].subjects.add(ch.subject)
        }
      })

      const plans: DayPlan[] = DAY_NAMES.map((dayName, i) => {
        const date = addDays(weekStart, i)
        const key = format(date, 'yyyy-MM-dd')
        const daySessions = dayMap[key]?.sessions ?? []
        const subjects = [...(dayMap[key]?.subjects ?? [])]
        const isMock = i === 5 || i === 6

        const blocks: StudyBlock[] = isMock
          ? [{
            id: `mock-${i}`,
            type: 'MOCK',
            topic: i === 5 ? 'Full Mock Test' : 'Sectional Mock',
            durationMin: i === 5 ? 200 : 90,
            questionCount: i === 5 ? 180 : 45,
            status: 'PENDING',
          }]
          : daySessions.map(s => {
            const ch = chapterMap[s.chapter_id]
            const type = s.session_type as StudyBlock['type']
            const durationMap: Record<string, number> = {
              CONCEPT: 90, PRACTICE: 60, REVISION: 30, TEST: 45, MOCK: 200
            }
            return {
              id: s.id,
              type,
              topic: ch ? `${ch.name}` : 'Study Session',
              chapterId: s.chapter_id,
              durationMin: durationMap[type] ?? 60,
              questionCount: s.planned_question_count ?? 0,
              status: s.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
            }
          })

        const totalMinutes = blocks.reduce((s, b) => s + b.durationMin, 0)
        const date_ = date
        const dayStatus: DayPlan['status'] =
          isToday(date_) ? 'current' :
          isBefore(date_, new Date()) && !isToday(date_) ? 'completed' :
          'pending'

        return {
          date,
          day: dayName,
          short: DAY_SHORTS[i],
          subject: isMock ? (i === 5 ? 'Full Mock' : 'Sectional') : subjects[0] ?? 'Rest',
          topics: isMock ? ['All Subjects', i === 6 ? 'Analysis' : 'Full Simulation'] : subjects,
          totalHours: Math.round((totalMinutes / 60) * 10) / 10,
          status: dayStatus,
          blocks,
        }
      })

      setWeekPlan(plans)

      // 5. Progress
      const totalSessions = sessions.length
      const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length
      const totalQ = sessions.reduce((s, sess) => s + (sess.planned_question_count ?? 0), 0)
      const doneQ = sessions.reduce((s, sess) => s + (sess.completed_question_count ?? 0), 0)
      const revSessions = sessions.filter(s => s.session_type === 'REVISION')
      const doneRev = revSessions.filter(s => s.status === 'COMPLETED').length

      setProgress({
        chapters: { done: completedSessions, total: totalSessions },
        questions: { done: doneQ, total: totalQ },
        revision: { done: doneRev, total: revSessions.length },
        mocks: { done: 0, total: 2 },
      })

      // 6. Performance summary for pulse
      const { data: perfSummary } = await supabase
        .from('performance_summary')
        .select('confidence_score, rolling_5_mock_accuracy')
        .eq('user_id', user!.id)
        .maybeSingle()
      setWeeklyPulse(Math.round(perfSummary?.confidence_score ?? perfSummary?.rolling_5_mock_accuracy ?? 0))

      // 7. Revision queue
      const { data: revQueue } = await supabase
        .from('revision_queue')
        .select('id, question_id, behavior_tag, priority, created_at')
        .eq('is_resolved', false)
        .limit(10)
      const revItems: RevisionItem[] = (revQueue ?? []).map((r, i) => ({
        id: r.id,
        topic: `Revision Item ${i + 1}`,
        subject: 'Mixed',
        revisionNumber: i + 1,
        dueDate: format(addDays(weekStart, i % 7), 'dd MMM'),
        priority: r.priority ?? 'MEDIUM',
      }))
      setRevisionItems(revItems)

      // 8. Mock schedule
      const mocks: MockPlan[] = [
        { id: 'mock-sat', type: 'Full NEET', scheduledDate: addDays(weekStart, 5), label: 'Saturday' },
        { id: 'mock-sun', type: 'Sectional', scheduledDate: addDays(weekStart, 6), label: 'Sunday' },
      ]
      setMockPlan(mocks)

      // 9. Mentor note from plan or default
      const note = (weeklyPlanData?.recommended_actions as any)?.mentor_note
        ?? `This week focuses on your top-priority chapters. Complete all practice sessions before attempting tests. Revision cycles are critical — do not skip them.`
      setMentorNote(note)

    } catch (e: any) {
      console.error('WeeklyPlan fetch error:', e)
      setError('Failed to load weekly plan. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleToggleBlock(blockId: string) {
    setCompletedBlocks(prev => {
      const next = new Set(prev)
      if (next.has(blockId)) next.delete(blockId)
      else next.add(blockId)
      return next
    })
  }

  const selectedDay = weekPlan[selectedDayIdx]

  const effectiveBlocks = useMemo(() => {
    if (!selectedDay) return []
    return selectedDay.blocks.map(b => ({
      ...b,
      status: completedBlocks.has(b.id) ? 'COMPLETED' : b.status,
    })) as StudyBlock[]
  }, [selectedDay, completedBlocks])

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10 pb-32">

          {isLoading ? <PlanSkeleton /> : (
            <>
              {/* Header */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-primary">
                    <CalendarDays className="w-8 h-8" />
                    <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Weekly Study Plan</h1>
                  </div>
                  <p className="text-slate-500 font-medium italic">Your personalized execution protocol for this cycle.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="px-4 border-r border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Pulse</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-2xl font-bold text-slate-900">{weeklyPulse}%</span>
                    </div>
                  </div>
                  <div className="px-4 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase px-3 py-1">Improving</Badge>
                  </div>
                </div>
              </header>

              {error && (
                <Card className="rounded-2xl border-rose-200 bg-rose-50">
                  <CardContent className="p-4 flex items-center gap-3 text-rose-700">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Hero stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Planned Hours', value: weekPlan.reduce((s, d) => s + d.totalHours, 0).toFixed(1), icon: Clock },
                  { label: 'Planned Questions', value: progress.questions.total, icon: Target },
                  { label: 'Planned Revision', value: `${progress.revision.total} Sessions`, icon: RotateCcw },
                  { label: 'Planned Mocks', value: progress.mocks.total, icon: BookOpen },
                ].map(item => (
                  <Card key={item.label} className="rounded-2xl border-none shadow-sm bg-white">
                    <CardContent className="p-5 flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                        <p className="text-xl font-bold text-slate-900">{item.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Section 1: Day Picker */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weekPlan.map((day, i) => (
                  <Card
                    key={i}
                    onClick={() => setSelectedDayIdx(i)}
                    className={cn(
                      'cursor-pointer transition-all duration-200 rounded-[2rem] border-2 group relative overflow-hidden',
                      selectedDayIdx === i ? 'border-primary bg-primary/[0.03] shadow-xl ring-4 ring-primary/5' : 'border-white bg-white hover:border-primary/20',
                      day.status === 'completed' && 'bg-emerald-50/30'
                    )}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day.short}</span>
                        {day.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {day.status === 'current' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className={cn('text-sm font-bold truncate', selectedDayIdx === i ? 'text-primary' : 'text-slate-700')}>{day.subject}</p>
                        {day.topics.slice(0, 2).map((t, idx) => (
                          <p key={idx} className="text-[10px] text-slate-400 truncate">• {t}</p>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">{day.totalHours}h</span>
                        <ChevronRight className={cn('w-3 h-3', selectedDayIdx === i ? 'text-primary' : 'text-slate-200')} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Section 2 & 3: Day Detail + Sidebar */}
              {selectedDay && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Day Blocks */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="flex items-center justify-between px-1">
                      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ListTodo className="w-4 h-4" />
                        {selectedDay.day} Detailed Execution
                      </h2>
                      <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3">
                        {selectedDay.totalHours}h Allocated
                      </Badge>
                    </div>

                    {effectiveBlocks.length > 0 ? (
                      <div className="space-y-3">
                        {effectiveBlocks.map(block => (
                          <BlockCard key={block.id} block={block} onToggle={handleToggleBlock} />
                        ))}
                      </div>
                    ) : (
                      <Card className="rounded-2xl border-none bg-slate-50">
                        <CardContent className="p-8 text-center text-slate-400">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No sessions scheduled for this day.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Strategic Priorities */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" /> Strategic Priorities
                      </h3>
                      {[
                        { label: 'Planned Sessions', value: `${effectiveBlocks.length} blocks`, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
                        { label: 'Completed', value: `${effectiveBlocks.filter(b => b.status === 'COMPLETED').length} / ${effectiveBlocks.length}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Total Time', value: `${selectedDay.totalHours}h`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                      ].map(item => (
                        <Card key={item.label} className="border-none shadow-sm bg-white p-4 rounded-[1.5rem]">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2.5 rounded-xl shrink-0', item.bg)}>
                              <item.icon className={cn('w-4 h-4', item.color)} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                              <p className="text-sm font-bold text-slate-900">{item.value}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Mentor Note */}
                    <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-5 opacity-5">
                        <Brain className="w-24 h-24" />
                      </div>
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-widest">Mentor's Note</h4>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic relative z-10">"{mentorNote}"</p>
                    </Card>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full h-12 rounded-2xl border-slate-200 font-bold text-slate-600 gap-2">
                        <RotateCcw className="w-4 h-4" /> Regenerate Roadmap
                      </Button>
                      <Button className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/20 gap-2">
                        Mark Today Complete <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Revision Schedule */}
              {revisionItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Revision Schedule</h2>
                    <button
                      onClick={() => setExpandedRevision(v => !v)}
                      className="text-xs text-slate-500 flex items-center gap-1"
                    >
                      {expandedRevision ? 'Show Less' : 'Show All'}
                      {expandedRevision ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                  <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <div className="divide-y divide-slate-50">
                      {(expandedRevision ? revisionItems : revisionItems.slice(0, 5)).map(item => (
                        <div key={item.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{item.topic}</p>
                            <p className="text-[11px] text-slate-400">{item.subject} · Revision #{item.revisionNumber}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-500">{item.dueDate}</span>
                            <Badge className={cn('text-[10px] border-none font-bold',
                              item.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' :
                              item.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-500')}>
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* Section 5: Mock Plan */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mock Plan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockPlan.map((mock, i) => (
                    <Card key={mock.id} className="rounded-2xl border-none shadow-sm bg-white">
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-xl shrink-0">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mock {i + 1}</p>
                          <p className="text-base font-bold text-slate-900">{mock.type}</p>
                          <p className="text-xs text-slate-400">{mock.label} · {format(mock.scheduledDate, 'd MMM yyyy')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Section 6: Completion Tracking */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Completion Tracking</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Sessions', done: progress.chapters.done, total: progress.chapters.total, color: 'bg-primary' },
                    { label: 'Questions', done: progress.questions.done, total: progress.questions.total, color: 'bg-amber-500' },
                    { label: 'Revision', done: progress.revision.done, total: progress.revision.total, color: 'bg-purple-500' },
                    { label: 'Mocks', done: progress.mocks.done, total: progress.mocks.total, color: 'bg-emerald-500' },
                  ].map(item => {
                    const pct = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0
                    return (
                      <Card key={item.label} className="rounded-2xl border-none shadow-sm bg-white">
                        <CardContent className="p-5 space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <span className="text-sm font-bold text-slate-700">{item.done}/{item.total}</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                          <p className="text-xs text-slate-500">{pct}% complete</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>

            </>
          )}
        </div>
      </main>
    </MentorLayout>
  )
}
