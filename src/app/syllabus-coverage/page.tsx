"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Star, ChevronDown, ChevronUp, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getSupabase } from '@/lib/supabase/client'
import { useSupabaseUser } from '@/lib/supabase/hooks'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChapterRow {
  id: string
  chapter_name: string
  unit: string
  neet_priority: string | null
  subject_name: string
  coverage: number       // derived: roadmap status
  accuracy: number       // derived: chapter_performance
  status: 'MASTERED' | 'IN_PROGRESS' | 'PLANNED' | 'DEFERRED'
}

interface SubjectSummary {
  name: string
  totalChapters: number
  completedChapters: number
  coveragePct: number
  avgAccuracy: number
  confidenceTrend: 'up' | 'down' | 'stable'
}

interface HeroData {
  overallCoverage: number
  chaptersCompleted: number
  totalChapters: number
  projectedCompletion: string
  coverageStatus: 'On Track' | 'Ahead' | 'Delayed'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatProjectedDate(weeksLeft: number): string {
  const d = new Date()
  d.setDate(d.getDate() + weeksLeft * 7)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function categorize(accuracy: number, coverage: number, priority: string): 'gap' | 'improving' | 'strong' {
  if (priority === 'High' && accuracy < 50) return 'gap'
  if (accuracy >= 70 && coverage >= 70) return 'strong'
  return 'improving'
}

function getPriorityStars(p: string | null): number {
  if (p === 'High') return 4
  if (p === 'Medium') return 2
  return 1
}

function statusDot(accuracy: number, coverage: number, priority: string) {
  if (priority === 'High' && accuracy < 50) return 'bg-rose-400'
  if (accuracy >= 70 && coverage >= 70) return 'bg-blue-400'
  if (accuracy >= 55) return 'bg-emerald-400'
  return 'bg-amber-400'
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="rounded-2xl border-none shadow-sm bg-white">
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function SubjectSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}

// ─── Chapter Card ─────────────────────────────────────────────────────────────

function ChapterCard({ chapter }: { chapter: ChapterRow }) {
  const stars = getPriorityStars(chapter.neet_priority)
  const dot = statusDot(chapter.accuracy, chapter.coverage, chapter.neet_priority ?? 'Low')
  const gap = chapter.coverage - chapter.accuracy

  return (
    <div className="relative group pr-3 w-full">
      <div className={cn('absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full', dot)} />
      <Card className="rounded-xl border border-slate-100 shadow-none bg-white hover:shadow-sm transition-shadow">
        <CardContent className="flex items-center min-h-[64px] p-0">
          {/* Left */}
          <div className="w-[55%] min-w-0 p-3 flex items-center">
            <div className="flex items-start justify-between w-full gap-2">
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold text-slate-800 truncate">{chapter.chapter_name}</h3>
                {gap > 20 && (
                  <Badge className="text-[9px] px-1.5 py-0.5 mt-1 bg-rose-100 text-rose-700 border-none">GAP</Badge>
                )}
              </div>
              <div className="flex gap-[2px] shrink-0 mt-[2px]">
                {[1, 2, 3, 4].map(i => (
                  <Star
                    key={i}
                    className={cn('w-3 h-3', i <= stars ? 'fill-[#FF0066] text-[#FF0066]' : 'text-slate-200')}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Right */}
          <div className="w-[45%] min-w-[120px] p-3 border-l border-slate-100 flex flex-col gap-1">
            <div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Coverage</span>
                <span className="font-semibold">{chapter.coverage}%</span>
              </div>
              <div className="h-[2px] bg-slate-100 rounded">
                <div className="h-full bg-slate-300 rounded" style={{ width: `${chapter.coverage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Accuracy</span>
                <span className="font-semibold">{chapter.accuracy}%</span>
              </div>
              <div className="h-[2px] bg-slate-100 rounded">
                <div className="h-full bg-slate-700 rounded" style={{ width: `${chapter.accuracy}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Subject Section ──────────────────────────────────────────────────────────

function SubjectSection({ subject, chapters }: { subject: SubjectSummary; chapters: ChapterRow[] }) {
  const [expanded, setExpanded] = useState(false)

  const grouped = useMemo(() => {
    const gap: ChapterRow[] = []
    const improving: ChapterRow[] = []
    const strong: ChapterRow[] = []
    chapters.forEach(ch => {
      const cat = categorize(ch.accuracy, ch.coverage, ch.neet_priority ?? 'Low')
      if (cat === 'gap') gap.push(ch)
      else if (cat === 'improving') improving.push(ch)
      else strong.push(ch)
    })
    return { gap, improving, strong }
  }, [chapters])

  const slice = (arr: ChapterRow[]) => expanded ? arr : arr.slice(0, 4)

  const trendIcon = subject.confidenceTrend === 'up'
    ? <TrendingUp className="w-3 h-3 text-emerald-500" />
    : subject.confidenceTrend === 'down'
    ? <TrendingUp className="w-3 h-3 text-rose-500 rotate-180" />
    : <span className="w-3 h-3 text-slate-400">–</span>

  return (
    <section className="space-y-6">
      {/* Subject Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{subject.name}</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="text-[11px] font-bold text-slate-600">{subject.coveragePct}%</span>
              <span className="text-[10px] text-slate-400">coverage</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="text-[11px] font-bold text-slate-600">{subject.avgAccuracy}%</span>
              <span className="text-[10px] text-slate-400">accuracy</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full">
              {trendIcon}
              <span className="text-[10px] text-slate-400">trend</span>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-500 font-bold px-3 py-1 rounded-lg">
          {subject.completedChapters} / {subject.totalChapters} Chapters
        </Badge>
      </div>

      {/* Grouped Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-rose-500 uppercase tracking-wider px-1">Critical Learning Gaps</h3>
          <div className="space-y-2">
            {slice(grouped.gap).map(ch => <ChapterCard key={ch.id} chapter={ch} />)}
            {grouped.gap.length === 0 && (
              <p className="text-[12px] text-slate-400 px-2 py-4">No critical gaps. Keep it up!</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider px-1">Improving Consistently</h3>
          <div className="space-y-2">
            {slice(grouped.improving).map(ch => <ChapterCard key={ch.id} chapter={ch} />)}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold text-blue-500 uppercase tracking-wider px-1">Strength Areas</h3>
          <div className="space-y-2">
            {slice(grouped.strong).map(ch => <ChapterCard key={ch.id} chapter={ch} />)}
          </div>
        </div>
      </div>

      {/* See More Toggle */}
      {(grouped.gap.length > 4 || grouped.improving.length > 4 || grouped.strong.length > 4) && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            {expanded ? 'Show Less' : 'See More'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </section>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SyllabusCoveragePage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabase()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hero, setHero] = useState<HeroData | null>(null)
  const [subjects, setSubjects] = useState<SubjectSummary[]>([])
  const [chaptersBySubject, setChaptersBySubject] = useState<Record<string, ChapterRow[]>>({})

  useEffect(() => {
    if (!user) return
    fetchData()
  }, [user])

  async function fetchData() {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Fetch all subjects
      const { data: subjectsData, error: subErr } = await supabase
        .from('subjects')
        .select('id, name')
      if (subErr) throw subErr

      // 2. Fetch all chapters with subject info
      const { data: chaptersData, error: chErr } = await supabase
        .from('chapters')
        .select('id, chapter_name, unit, neet_priority, subject_id')
        .order('roadmap_order', { ascending: true })
      if (chErr) throw chErr

      // 3. Fetch roadmap for this user (coverage = status of chapter in roadmap)
      const { data: roadmapData, error: rdErr } = await supabase
        .from('study_plan_roadmap')
        .select('chapter_id, status, target_mastery')
        .eq('user_id', user!.id)
      if (rdErr) throw rdErr

      // 4. Fetch chapter_performance for accuracy
      const { data: perfData, error: perfErr } = await supabase
        .from('chapter_performance')
        .select('chapter_id, accuracy_30d, attempts_30d')
        .eq('user_id', user!.id)
      if (perfErr) throw perfErr

      // Build lookup maps
      const subjectMap: Record<string, string> = {}
      subjectsData?.forEach(s => { subjectMap[s.id] = s.name })

      const roadmapMap: Record<string, { status: string; target_mastery: number }> = {}
      roadmapData?.forEach(r => {
        roadmapMap[r.chapter_id] = { status: r.status, target_mastery: r.target_mastery }
      })

      const perfMap: Record<string, { accuracy_30d: number; attempts_30d: number }> = {}
      perfData?.forEach(p => {
        perfMap[p.chapter_id] = { accuracy_30d: p.accuracy_30d ?? 0, attempts_30d: p.attempts_30d ?? 0 }
      })

      // Derive coverage % from roadmap status
      function deriveCoverage(status?: string): number {
        if (!status) return 0
        if (status === 'MASTERED') return 100
        if (status === 'IN_PROGRESS') return 55
        if (status === 'DEFERRED') return 20
        return 0  // PLANNED
      }

      // Build chapter rows
      const grouped: Record<string, ChapterRow[]> = {}
      const subjectStats: Record<string, { total: number; completed: number; accuracies: number[] }> = {}

      chaptersData?.forEach(ch => {
        const subjectName = subjectMap[ch.subject_id] ?? 'Unknown'
        const perf = perfMap[ch.id]
        const rm = roadmapMap[ch.id]
        const coverage = deriveCoverage(rm?.status)
        const accuracy = Math.round(perf?.accuracy_30d ?? 0)

        const row: ChapterRow = {
          id: ch.id,
          chapter_name: ch.chapter_name,
          unit: ch.unit,
          neet_priority: ch.neet_priority,
          subject_name: subjectName,
          coverage,
          accuracy,
          status: (rm?.status as ChapterRow['status']) ?? 'PLANNED',
        }

        if (!grouped[subjectName]) grouped[subjectName] = []
        grouped[subjectName].push(row)

        if (!subjectStats[subjectName]) subjectStats[subjectName] = { total: 0, completed: 0, accuracies: [] }
        subjectStats[subjectName].total++
        if (rm?.status === 'MASTERED') subjectStats[subjectName].completed++
        if (perf?.attempts_30d > 0) subjectStats[subjectName].accuracies.push(accuracy)
      })

      // Build subject summaries
      const summaries: SubjectSummary[] = Object.entries(subjectStats).map(([name, stats]) => {
        const avgAccuracy = stats.accuracies.length
          ? Math.round(stats.accuracies.reduce((a, b) => a + b, 0) / stats.accuracies.length)
          : 0
        const coveragePct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
        return {
          name,
          totalChapters: stats.total,
          completedChapters: stats.completed,
          coveragePct,
          avgAccuracy,
          confidenceTrend: avgAccuracy >= 70 ? 'up' : avgAccuracy >= 50 ? 'stable' : 'down',
        }
      })

      // Build hero
      const totalChapters = chaptersData?.length ?? 0
      const completedChapters = roadmapData?.filter(r => r.status === 'MASTERED').length ?? 0
      const overallCoverage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
      const weeksLeft = Math.ceil((totalChapters - completedChapters) / Math.max(1, completedChapters / Math.max(1, 18)))
      const coverageStatus: HeroData['coverageStatus'] =
        overallCoverage >= 70 ? 'Ahead' : overallCoverage >= 50 ? 'On Track' : 'Delayed'

      setHero({
        overallCoverage,
        chaptersCompleted: completedChapters,
        totalChapters,
        projectedCompletion: formatProjectedDate(weeksLeft),
        coverageStatus,
      })
      setSubjects(summaries)
      setChaptersBySubject(grouped)
    } catch (e: any) {
      console.error('SyllabusCoverage fetch error:', e)
      setError('Failed to load syllabus data. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  const statusBadgeClass = hero?.coverageStatus === 'Ahead'
    ? 'bg-emerald-100 text-emerald-700'
    : hero?.coverageStatus === 'Delayed'
    ? 'bg-rose-100 text-rose-700'
    : 'bg-blue-100 text-blue-700'

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto space-y-10 pb-32">

          {/* Header */}
          <header className="space-y-2">
            <h1 className="text-[24px] font-headline font-bold text-slate-900 tracking-tight">
              Syllabus Coverage
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Track your progress toward complete syllabus mastery.
            </p>
          </header>

          {/* Hero Row */}
          {isLoading ? (
            <HeroSkeleton />
          ) : hero ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Coverage */}
              <Card className="rounded-2xl border-none shadow-sm bg-white">
                <CardContent className="p-5 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Coverage</p>
                  <p className="text-3xl font-bold text-slate-900">{hero.overallCoverage}%</p>
                  <Progress value={hero.overallCoverage} className="h-1.5" />
                </CardContent>
              </Card>
              {/* Chapters Completed */}
              <Card className="rounded-2xl border-none shadow-sm bg-white">
                <CardContent className="p-5 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chapters Completed</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {hero.chaptersCompleted}
                    <span className="text-base font-medium text-slate-400"> / {hero.totalChapters}</span>
                  </p>
                  <Progress value={(hero.chaptersCompleted / Math.max(1, hero.totalChapters)) * 100} className="h-1.5" />
                </CardContent>
              </Card>
              {/* Projected Completion */}
              <Card className="rounded-2xl border-none shadow-sm bg-white">
                <CardContent className="p-5 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projected Completion</p>
                  <p className="text-xl font-bold text-slate-900 leading-tight">{hero.projectedCompletion}</p>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">at current pace</span>
                  </div>
                </CardContent>
              </Card>
              {/* Coverage Status */}
              <Card className="rounded-2xl border-none shadow-sm bg-white">
                <CardContent className="p-5 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coverage Status</p>
                  <div>
                    <Badge className={cn('text-sm font-bold px-3 py-1 border-none', statusBadgeClass)}>
                      {hero.coverageStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs">relative to target</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Subject Coverage Cards */}
          {!isLoading && subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {subjects.map(s => (
                <Card key={s.name} className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-700">{s.name}</p>
                      <span className="text-xl font-bold text-slate-900">{s.coveragePct}%</span>
                    </div>
                    <Progress value={s.coveragePct} className="h-1.5" />
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{s.completedChapters} / {s.totalChapters} Chapters</span>
                      <span>Avg Accuracy: {s.avgAccuracy}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400">Confidence:</span>
                      <span className={cn('font-semibold', s.confidenceTrend === 'up' ? 'text-emerald-600' : s.confidenceTrend === 'down' ? 'text-rose-600' : 'text-amber-600')}>
                        {s.confidenceTrend === 'up' ? '↑ Rising' : s.confidenceTrend === 'down' ? '↓ Declining' : '→ Stable'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <Card className="rounded-2xl border-rose-200 bg-rose-50">
              <CardContent className="p-5 flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Per-Subject Breakdown */}
          {isLoading ? (
            <div className="space-y-12">
              {['Physics', 'Chemistry', 'Biology'].map(s => (
                <div key={s} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <SubjectSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {subjects.map(s => (
                <SubjectSection
                  key={s.name}
                  subject={s}
                  chapters={chaptersBySubject[s.name] ?? []}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </MentorLayout>
  )
}
