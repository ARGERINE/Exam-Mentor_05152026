"use client"

import React, { useEffect, useState, useMemo, Suspense } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { 
  Award, 
  Target, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  History,
  ShieldCheck,
  Fingerprint,
  Timer,
  Loader2,
  AlertCircle,
  Gauge,
  AlertTriangle,
  Brain,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getSupabase } from '@/lib/supabase/client'

// ─── Interfaces ──────────────────────────────────────────────────────────

interface QuestionResult {
  id: string
  text: string
  status: 'correct' | 'incorrect' | 'skipped'
  userAnswer: string
  correctAnswer: string
  confidence: string
  time: string
  timeSeconds: number
  explanation: string
  behaviorTag: string
  behavioralInsight: string
  timeInterpretation: string
  expectedTime: number
  subjectId: string
  chapterId: string
  difficulty: string
  taxonomyCategory: string
}

interface BehavioralStats {
  mastery: number
  luckyGuess: number
  overconfident: number
  conceptGap: number
  correctSlow: number
}

interface ResultsData {
  examName: string
  score: number
  totalScore: number
  accuracy: number
  totalTimeSpent: string
  correctCount: number
  incorrectCount: number
  skippedCount: number
  attemptedCount: number
  averageTime: number
  timeEfficiency: number
  questions: QuestionResult[]
  behaviorCounts: BehavioralStats
  behavioralSummary: string
  primaryRiskPattern: string
  riskCount: number
}

// ─── Constants ────────────────────────────────────────────────────────────

const QUESTIONS_PER_PAGE = 10
type FilterType = 'All' | 'Incorrect' | 'Overconfident' | 'Concept Gap' | 'Lucky Guess' | 'Slow Correct'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const attemptId = searchParams.get('attempt_id')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultsData, setResultsData] = useState<ResultsData | null>(null)
  
  // UI State
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>('All')

  // ─── Data Fetching ────────────────────────────────────────────────────────
  
  useEffect(() => {
    if (!attemptId) {
      router.push('/exams')
      return
    }

    async function fetchResults() {
      try {
        setLoading(true)
        const supabase = getSupabase()
        if (!supabase) throw new Error('Intelligence core disconnected.')

        const { data: attempt, error: attemptErr } = await supabase
        .from('attempts')
        .select('*')
        .eq('attempt_id', attemptId)
        .single()

        if (attemptErr || !attempt) throw new Error('Attempt not found.')

        const { data: answers, error: answersErr } = await supabase
  .from('attempt_questions')
  .select(`
    sequence,
    selected_option,
    correct_option,
    confidence_level,
    time_taken_seconds,
    questions:question_id (
  id,
  question_text,
  correct_option,
  explanation,
  expected_time_seconds,
  subject_id,
  chapter_id,
  difficulty,
  taxonomy_category
)
  `)
  .eq('attempt_id', attemptId)
  .order('sequence', { ascending: true })

        if (answersErr) throw answersErr

        let correct = 0, incorrect = 0, skipped = 0, totalTime = 0, totalExpectedTime = 0
        let mastery = 0, luckyGuess = 0, overconfident = 0, conceptGap = 0, correctSlow = 0

        const mappedQuestions: QuestionResult[] = (answers || [])
          .map((ans: any) => {
            const q = ans.questions
            if (!q) return null

            const isCorrect =
            ans.selected_option &&
            ans.selected_option === q.correct_option

            const status = isCorrect
            ? 'correct'
            : (ans.selected_option ? 'incorrect' : 'skipped')

            const timeTaken = ans.time_taken_seconds ?? 0
            const expectedTime = q.expected_time_seconds || 60
            
            let tag = 'standard'

if (isCorrect && ans.confidence_level === 'HIGH') {
  tag = 'mastery'
}
else if (isCorrect && ans.confidence_level === 'LOW') {
  tag = 'lucky_guess'
}
else if (!isCorrect && ans.confidence_level === 'HIGH') {
  tag = 'overconfident'
}
else if (!isCorrect && timeTaken > expectedTime * 1.3) {
  tag = 'concept_gap'
}
else if (isCorrect && timeTaken > expectedTime * 1.3) {
  tag = 'correct_slow'
}

if (status === 'correct') correct++
else if (status === 'incorrect') incorrect++
else skipped++

totalTime += timeTaken
totalExpectedTime += expectedTime

if (tag === 'mastery') mastery++
if (tag === 'lucky_guess') luckyGuess++
if (tag === 'overconfident') overconfident++
if (tag === 'concept_gap') conceptGap++
if (tag === 'correct_slow') correctSlow++

            return {
              id: q.id,
              text: q.question_text,
              status,
              userAnswer: ans.selected_option || '—',
              correctAnswer: q.correct_option,
              confidence: ans.confidence_level || 'MEDIUM',
              time: `${timeTaken}s`,
              timeSeconds: timeTaken,
              explanation: q.explanation || "Derivation logic follows standard conceptual patterns.",
              behaviorTag: tag,
              behavioralInsight: tag === 'overconfident' ? "High confidence incorrect response detected. Misconception risk." : 
                                 tag === 'concept_gap' ? "Slow incorrect response indicates retrieval blockage." :
                                 tag === 'lucky_guess' ? "Correct answer with low confidence. Foundations need review." :
                                 tag === 'mastery' ? "Optimal recall speed with high precision." : "Standard performance.",
              timeInterpretation: timeTaken < expectedTime * 0.7 ? "Faster than expected" : 
                                  timeTaken > expectedTime * 1.3 ? "Slower than expected" : "Within range",
              expectedTime,
              subjectId: q.subject_id,
              chapterId: q.chapter_id,
              difficulty: q.difficulty,
              taxonomyCategory: q.taxonomy_category,
            }
          })
          .filter((q): q is QuestionResult => q !== null)

        const attempted = correct + incorrect
        const behaviorCounts = { mastery, luckyGuess, overconfident, conceptGap, correctSlow }
        
        // Determine Primary Risk Pattern
        const risks = [
          { label: 'Overconfident conceptual errors', count: overconfident },
          { label: 'Concept gaps in complex topics', count: conceptGap },
          { label: 'Guess-heavy response patterns', count: luckyGuess },
          { label: 'Latency in familiar topics', count: correctSlow }
        ].sort((a, b) => b.count - a.count)

        const finalScore = (correct * 4) - incorrect

const finalAccuracy =
  attempted > 0
    ? Math.round((correct / attempted) * 100)
    : 0

await supabase
  .from('attempts')
  .update({
    total_score: finalScore,
    accuracy: finalAccuracy,
    evaluation_completed_at: new Date().toISOString(),
    attempt_status: 'EVALUATED',
  })
  .eq('attempt_id', attemptId)

        setResultsData({
          examName: attempt.attempt_type ? `${attempt.attempt_type} Result` : 'NEET Simulation',
          score: (correct * 4) - incorrect,
          totalScore: mappedQuestions.length * 4,
          accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
          attemptedCount: attempted,
          correctCount: correct,
          incorrectCount: incorrect,
          skippedCount: skipped,
          averageTime: attempted > 0 ? Math.round(totalTime / attempted) : 0,
          timeEfficiency: totalTime > 0 ? Math.round((totalExpectedTime / totalTime) * 100) : 100,
          totalTimeSpent: `${Math.round(totalTime / 60)}m`,
          questions: mappedQuestions,
          behaviorCounts,
          behavioralSummary: "Behavioral evaluation generated from live attempt analytics.",
          primaryRiskPattern: risks[0].count > 0 ? risks[0].label : "No critical risks detected",
          riskCount: risks[0].count
        })

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [attemptId, router])

  // ─── Computed Filtering & Pagination ────────────────────────────────────

  const filteredQuestions = useMemo(() => {
    if (!resultsData) return []
    if (activeFilter === 'All') return resultsData.questions
    return resultsData.questions.filter(q => {
      if (activeFilter === 'Incorrect') return q.status === 'incorrect'
      if (activeFilter === 'Overconfident') return q.behaviorTag === 'overconfident'
      if (activeFilter === 'Concept Gap') return q.behaviorTag === 'concept_gap'
      if (activeFilter === 'Lucky Guess') return q.behaviorTag === 'lucky_guess'
      if (activeFilter === 'Slow Correct') return q.behaviorTag === 'correct_slow'
      return true
    })
  }, [resultsData, activeFilter])

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * QUESTIONS_PER_PAGE
    return filteredQuestions.slice(start, start + QUESTIONS_PER_PAGE)
  }, [filteredQuestions, currentPage])

  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE)

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <main className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
      <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Decoding Performance Signals...</p>
    </main>
  )

  if (error || !resultsData) return (
    <main className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center min-h-[60vh]">
      <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
      <h2 className="text-xl font-bold">Analysis Unavailable</h2>
      <Button onClick={() => router.push('/exams')} className="mt-4">Return to Exams</Button>
    </main>
  )

  return (
    <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto min-h-screen">
      <div className="max-w-6xl mx-auto w-full space-y-10 pb-20">

        <header className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-primary">
              <Award className="w-8 h-8" />
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Performance Report</h1>
            </div>
            <p className="text-base text-slate-500 font-medium">{resultsData.examName}</p>
          </div>
          <Badge className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 mr-2" /> Analysis Synchronized
          </Badge>
        </header>

        {/* TOP KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard title="Total Score" value={resultsData.score} subValue={`/ ${resultsData.totalScore}`} icon={Target} color="text-primary" detail="Final competitive score" />
          <KPICard title="Accuracy" value={`${resultsData.accuracy}%`} icon={Activity} color="text-emerald-600" detail={`Across ${resultsData.attemptedCount} attempts`} />
          <KPICard title="Primary Risk Pattern" value={resultsData.primaryRiskPattern} icon={AlertTriangle} color="text-rose-600" detail={`Detected in ${resultsData.riskCount} questions`} isFullWidth />
        </div>

        {/* COGNITIVE RISK PROFILE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Cognitive Risk Profile</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RiskCard label="Overconfident Errors" count={resultsData.behaviorCounts.overconfident} insight="Misconception in core logic" />
            <RiskCard label="Concept Gaps" count={resultsData.behaviorCounts.conceptGap} insight="Retrieval blockage detected" />
            <RiskCard label="Slow Retrieval" count={resultsData.behaviorCounts.correctSlow} insight="Conceptual hesitation" />
            <RiskCard label="Guess-Based Correct" count={resultsData.behaviorCounts.luckyGuess} insight="Accuracy stability at risk" />
          </div>
        </section>

        {/* IMPROVEMENT SIGNALS */}
        <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden border border-slate-100">
          <CardHeader className="bg-slate-50/50 border-b p-8">
            <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Primary Improvement Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <SignalItem title="Foundation" insight={resultsData.accuracy < 60 ? "Conceptual retrieval weak" : "Foundations stabilizing"} detail="Focus on high-weightage units" />
            <SignalItem title="Velocity" insight={resultsData.averageTime > 100 ? "Slow solving detected" : "Competitive pacing observed"} detail="Optimize calculation speed" />
            <SignalItem title="Stability" insight={resultsData.behaviorCounts.overconfident > 3 ? "Confidence mismatch risk" : "Confidence aligned with skill"} detail="Audit high-confidence errors" />
          </CardContent>
        </Card>

        {/* ANSWER REVIEW WITH FILTERS */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-3">
                <History className="w-6 h-6 text-primary" />
                Answer Review
              </h2>
              <p className="text-sm text-slate-500 font-medium">Deep dive into each response signal.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['All', 'Incorrect', 'Overconfident', 'Concept Gap', 'Lucky Guess', 'Slow Correct'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all",
                    activeFilter === f ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {paginatedQuestions.map((q, i) => {
                const qNum = (currentPage - 1) * QUESTIONS_PER_PAGE + i + 1
                return (
                  <AccordionItem 
                    key={q.id} 
                    value={`item-${q.id}`}
                    className={cn(
                      "border rounded-[1.5rem] bg-white overflow-hidden transition-all",
                      q.status === 'correct' ? "border-slate-100" : "border-rose-100"
                    )}
                  >
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-slate-50/30">
                      <div className="flex items-center gap-4 text-left w-full">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0",
                          q.status === 'correct' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {q.status === 'correct' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 leading-relaxed truncate">
                            <span className="text-slate-400 mr-2">Q{qNum}.</span>
                            {q.text}
                          </p>
                        </div>
                        <Badge variant="outline" className="hidden sm:block border-slate-100 text-[9px] uppercase px-2">
                          {q.subjectId}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-10 pb-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-slate-100 space-y-2">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Your Response</p>
                          <p className="text-sm font-bold text-slate-700">{q.userAnswer}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 space-y-2">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Correct Solution</p>
                          <p className="text-sm font-bold text-slate-700">{q.correctAnswer}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Certainty</p>
                          <p className="text-xs font-bold text-slate-700">{q.confidence}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Time</p>
                          <p className="text-xs font-bold text-slate-700">{q.time}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-xl">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Pacing</p>
                          <p className={cn(
                            "text-[10px] font-bold",
                            q.timeInterpretation.includes('Slower') ? "text-rose-500" : "text-emerald-500"
                          )}>{q.timeInterpretation}</p>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-6">
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-3 h-3" /> Academic Logic
                          </h5>
                          <p className="text-sm text-slate-600 leading-relaxed italic">{q.explanation}</p>
                        </div>
                        <div className="space-y-3 pt-6 border-t border-slate-200">
                          <h5 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Brain className="w-3 h-3" /> {q.status === 'correct' ? 'Why This Response Succeeded' : 'Why This Response Failed'}
                          </h5>
                          <p className="text-sm font-bold text-slate-800 italic leading-relaxed">"{q.behavioralInsight}"</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 px-4">
                <p className="text-xs font-medium text-slate-400">
                  Showing <span className="font-bold text-slate-900">{(currentPage - 1) * QUESTIONS_PER_PAGE + 1}–{Math.min(currentPage * QUESTIONS_PER_PAGE, filteredQuestions.length)}</span> of {filteredQuestions.length} Questions
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="rounded-lg h-9 w-9 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center px-4 bg-white border rounded-lg text-xs font-bold">
                    {currentPage} / {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="rounded-lg h-9 w-9 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* REVISION FOOTER */}
        <footer className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 opacity-20 pointer-events-none" />
          <div className="space-y-4 relative z-10 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Fingerprint className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-headline font-bold">Revision Priorities Generated</h3>
            </div>
            <p className="text-sm text-slate-400 font-medium italic max-w-xl">
              Our intelligence core has identified {resultsData.behaviorCounts.conceptGap + resultsData.behaviorCounts.overconfident} critical remediation nodes from this attempt.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
            <Button variant="outline" onClick={() => router.push('/dashboard/improvement/weak-areas')} className="rounded-xl h-12 px-6 border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold text-xs">
              Review Weak Areas
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/improvement/mistake-notebook')} className="rounded-xl h-12 px-6 border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold text-xs">
              Open Mistake Notebook
            </Button>
            <Button onClick={() => router.push('/dashboard/improvement/revision-queue')} className="rounded-xl h-12 px-8 font-bold text-xs shadow-xl shadow-primary/20">
              Start Revision Queue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </footer>

      </div>
    </main>
  )
}

export default function ExamResultsPage() {
  return (
    <MentorLayout>
      <Suspense fallback={
        <div className="flex-1 p-6 lg:p-10 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </MentorLayout>
  )
}

function KPICard({ title, value, subValue, icon: Icon, color, detail, isFullWidth }: any) {
  return (
    <Card className={cn(
      "border-none shadow-sm rounded-[2rem] bg-white p-6 space-y-4 relative overflow-hidden group hover:shadow-md transition-shadow",
      isFullWidth && "md:col-span-1"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl bg-slate-50", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-headline font-bold tracking-tight", color)}>{value}</span>
          {subValue && <span className="text-lg font-medium text-slate-400">{subValue}</span>}
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{detail}</p>
      </div>
    </Card>
  )
}

function RiskCard({ label, count, insight }: { label: string, count: number, insight: string }) {
  return (
    <Card className="border border-slate-100 bg-white/50 p-6 rounded-[1.5rem] space-y-2 hover:bg-white transition-colors">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={cn("text-lg font-black", count > 0 ? "text-rose-500" : "text-slate-300")}>{count}</span>
      </div>
      <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">"{insight}"</p>
    </Card>
  )
}

function SignalItem({ title, insight, detail }: { title: string, insight: string, detail: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{title}</p>
      <p className="text-base font-bold text-slate-900 leading-tight">{insight}</p>
      <p className="text-[11px] font-medium text-slate-500">{detail}</p>
    </div>
  )
}
