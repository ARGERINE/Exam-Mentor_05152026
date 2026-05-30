
"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabase } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  Timer,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface Question {
  id: string
  sequence: number
  text: string
  options: {
    key: string
    text: string
  }[]

  selectedOption?: string | null
  confidenceLevel?: string | null
  timeTakenSeconds?: number
}

type QuestionState =
  | 'unvisited'
  | 'answered'
  | 'marked'
  | 'skipped'

export default function ExamAttemptPage() {

  const router = useRouter()
  const supabase = getSupabase()
  const [attemptId, setAttemptId] = useState<string | null>(null)

useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('attempt_id')

  if (id) {
    setAttemptId(id)
  }
}, [])

  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  const [currentIndex, setCurrentIndex] = useState(0)

  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const [confidenceLevel, setConfidenceLevel] = useState<
    'confident' | 'somewhat' | 'guess' | null
  >(null)

  const [paletteStates, setPaletteStates] = useState<
    Record<string, QuestionState>
  >({})

  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60)

  const [showFinishModal, setShowFinishModal] = useState(false)
  const [showTimesUpModal, setShowTimesUpModal] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const questionStartRef = useRef<number>(Date.now())

  const accumulatedTimeRef = useRef<Record<string, number>>({})

  const initialTimeRef = useRef(0)

  // ─────────────────────────────────────────────────────────────
  // Fetch Questions
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {

    const fetchQuestions = async () => {

      if (!supabase || !attemptId) {
        return
      }

    const { data: attemptMeta } = await supabase
  .from("attempts")
  .select(`
    exam_id,
    total_time_seconds
  `)
  .eq("attempt_id", attemptId)
  .single()

console.log(
  "ATTEMPT META:",
  attemptMeta
)

if (attemptMeta?.total_time_seconds) {

  setTimeLeft(
    attemptMeta.total_time_seconds
  )

} else if (attemptMeta?.exam_id) {

  const { data: examMeta } = await supabase
    .from("exams")
    .select("duration_minutes")
    .eq("id", attemptMeta.exam_id)
    .single()

  if (examMeta?.duration_minutes) {

    setTimeLeft(
      examMeta.duration_minutes * 60
    )

  }

}

      setLoadingQuestions(true)

      const { data, error } = await supabase
        .from('attempt_questions')
        .select(`
          sequence,
          selected_option,
          confidence_level,
          time_taken_seconds,
          questions (
            id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d
          )
        `)
        .eq('attempt_id', attemptId)
        .order('sequence', { ascending: true })

      if (error) {
        console.error('Question fetch failed:', error)
        setLoadingQuestions(false)
        return
      }
      
      await supabase
  .from('attempts')
  .update({
    attempt_status: 'IN_PROGRESS',
  })
  .eq('attempt_id', attemptId)

      const mappedQuestions: Question[] = (data || []).map((row: any) => ({
        id: row.questions.id,

        sequence: row.sequence,

        text: row.questions.question_text,

        options: [
          {
            key: 'A',
            text: row.questions.option_a,
          },
          {
            key: 'B',
            text: row.questions.option_b,
          },
          {
            key: 'C',
            text: row.questions.option_c,
          },
          {
            key: 'D',
            text: row.questions.option_d,
          },
        ],

        selectedOption: row.selected_option,

        confidenceLevel: row.confidence_level,

        timeTakenSeconds: row.time_taken_seconds ?? 0,
      }))

       setQuestions(mappedQuestions)

      await supabase
        .from('attempts')
        .update({
          attempt_status: 'IN_PROGRESS',
        })
        .eq('attempt_id', attemptId)

      setLoadingQuestions(false)
    }

    fetchQuestions()

  }, [attemptId, supabase])

  // ─────────────────────────────────────────────────────────────
  // Restore Existing Runtime State
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {

    const currentQuestion = questions[currentIndex]

    if (!currentQuestion) {
      return
    }

    setSelectedOption(currentQuestion.selectedOption ?? null)

    setConfidenceLevel(
      (currentQuestion.confidenceLevel as any) ?? null
    )

    questionStartRef.current = Date.now()

  }, [currentIndex, questions])

  // ─────────────────────────────────────────────────────────────
  // Global Timer
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {

    const timer = setInterval(() => {

      setTimeLeft((prev) => {

        if (prev <= 1) {
          clearInterval(timer)
          setShowTimesUpModal(true)
          handleSubmitExam()
          return 0
        }

        return prev - 1
      })

    }, 1000)

    return () => clearInterval(timer)

  }, [])

  // ─────────────────────────────────────────────────────────────
  // Loading Guards
  // ─────────────────────────────────────────────────────────────

  if (loadingQuestions) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  if (!currentQuestion) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        No questions available.
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  const formatTime = (seconds: number) => {

    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const flushQuestionTime = (questionId: string) => {

    const elapsedSeconds = Math.round(
      (Date.now() - questionStartRef.current) / 1000
    )

    accumulatedTimeRef.current[questionId] =
      (accumulatedTimeRef.current[questionId] || 0) + elapsedSeconds
  }

  // ─────────────────────────────────────────────────────────────
  // Persist Answer
  // ─────────────────────────────────────────────────────────────

  const persistAnswer = async ({
    questionId,
    selectedOption,
    confidenceLevel,
    timeTakenSeconds,
  }: {
    questionId: string
    selectedOption: string
    confidenceLevel: string
    timeTakenSeconds: number
  }) => {

    if (!supabase) {
      return
    }

    const { error } = await supabase
      .from('attempt_questions')
      .update({
        selected_option: selectedOption,
        confidence_level: confidenceLevel,
        time_taken_seconds: timeTakenSeconds,
      })
      .eq('attempt_id', attemptId)
      .eq('question_id', questionId)

    if (error) {
  console.error('Answer persistence failed:', error)
  alert(JSON.stringify(error))
  return false
    }

    return true
  }

  // ─────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────

  const navigateTo = (nextIndex: number) => {

    flushQuestionTime(currentQuestion.id)

    setCurrentIndex(nextIndex)
  }

  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
// Save & Next
// ─────────────────────────────────────────────────────────────

const handleSaveAndNext = async () => {

  if (!selectedOption) {
    handleSkip()
    return
  }

  if (!confidenceLevel) {
    alert('Please select your confidence level before continuing.')
    return
  }

  flushQuestionTime(currentQuestion.id)

  const totalTime =
    accumulatedTimeRef.current[currentQuestion.id] || 0

  const success = await persistAnswer({
    questionId: currentQuestion.id,
    selectedOption,

    confidenceLevel:
      confidenceLevel === 'confident'
        ? 'HIGH'
        : confidenceLevel === 'somewhat'
        ? 'MEDIUM'
        : 'LOW',

    timeTakenSeconds: totalTime,
  })

  if (!success) {
    return
  }

  setPaletteStates((prev) => ({
    ...prev,
    [currentQuestion.id]: 'answered',
  }))

  if (currentIndex < questions.length - 1) {
    navigateTo(currentIndex + 1)
  }
}

// ─────────────────────────────────────────────────────────────
// Skip
// ─────────────────────────────────────────────────────────────

const handleSkip = () => {

  setPaletteStates((prev) => ({
    ...prev,
    [currentQuestion.id]: 'skipped',
  }))

  setSelectedOption(null)
  setConfidenceLevel(null)

  if (currentIndex < questions.length - 1) {
    navigateTo(currentIndex + 1)
  }
}

// ─────────────────────────────────────────────────────────────
// Mark Review
// ─────────────────────────────────────────────────────────────

const handleMarkReview = () => {

  setPaletteStates((prev) => ({
    ...prev,
    [currentQuestion.id]: 'marked',
  }))

  if (currentIndex < questions.length - 1) {
    navigateTo(currentIndex + 1)
  }
}

// ─────────────────────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────────────────────

const handleClear = () => {
  setSelectedOption(null)
  setConfidenceLevel(null)
}

// ─────────────────────────────────────────────────────────────
// Submit Exam
// ─────────────────────────────────────────────────────────────

const handleSubmitExam = async () => {

  if (isSubmitting) {
    return
  }

  if (!supabase) {
    return
  }

  setIsSubmitting(true)

  try {

    flushQuestionTime(currentQuestion.id)

    const totalTime =
      accumulatedTimeRef.current[currentQuestion.id] || 0

    if (selectedOption && confidenceLevel) {

      await persistAnswer({
        questionId: currentQuestion.id,
        selectedOption,

        confidenceLevel:
          confidenceLevel === 'confident'
            ? 'HIGH'
            : confidenceLevel === 'somewhat'
            ? 'MEDIUM'
            : 'LOW',

        timeTakenSeconds: totalTime,
      })
    }

    const totalTimeSpent =
    initialTimeRef.current - timeLeft

    const { error } = await supabase
      .from('attempts')
      .update({
        attempt_status: 'EVALUATION_IN_PROGRESS',
        total_time_seconds: totalTimeSpent,
        submitted_at: new Date().toISOString(),
      })
      .eq('attempt_id', attemptId)

    if (error) {
      console.error('Submission failed:', error)
      alert(JSON.stringify(error))
      setIsSubmitting(false)
      return
    }

    console.log('SUBMIT SUCCESS')

    router.push(`/exams/results?attempt_id=${attemptId}`)

  } catch (err) {

    console.error('FINAL SUBMISSION FAILED:', err)

    alert('Submission failed. Check browser console.')

    setIsSubmitting(false)
  }
}

  // ─────────────────────────────────────────────────────────────
  // Derived Values
  // ─────────────────────────────────────────────────────────────

  const attemptedCount = Object.values(paletteStates).filter(
    (state) => state === 'answered'
  ).length

  const timerUrgency =
    timeLeft < 300
      ? 'text-rose-600 bg-rose-50'
      : timeLeft < 900
      ? 'text-amber-600 bg-amber-50'
      : 'text-slate-700 bg-slate-50'

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* LEFT PANEL */}
      <div className="flex-[3] flex flex-col bg-white">

        {/* HEADER */}
        <header className="px-6 py-4 border-b bg-white flex justify-between items-center">

          <div className="flex items-center gap-4">

            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div className="h-4 w-px bg-slate-200" />

            <Badge variant="secondary">
              LIVE EXAM
            </Badge>
          </div>
        </header>

        {/* QUESTION AREA */}
        <main className="flex-1 overflow-y-auto p-8">

          <div className="max-w-4xl mx-auto space-y-6">

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <h2 className="text-lg leading-relaxed font-medium">
                {currentQuestion.text}
              </h2>
            </div>

            {/* OPTIONS */}
            <div className="space-y-3">

              {currentQuestion.options.map((option) => (

                <button
                  key={option.key}
                  onClick={() => setSelectedOption(option.key)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left',

                    selectedOption === option.key
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 bg-white hover:border-primary/30'
                  )}
                >

                  <div className="flex items-center gap-4">

                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold',

                        selectedOption === option.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      )}
                    >
                      {option.key}
                    </div>

                    <span className="text-sm font-medium">
                      {option.text}
                    </span>
                  </div>

                  {selectedOption === option.key && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* CONFIDENCE */}
        <div className="border-t bg-white px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">
              Confidence Level
            </span>
          </div>

          <div className="flex gap-2">

            {['confident', 'somewhat', 'guess'].map((level) => (

              <Button
                key={level}
                variant={
                  confidenceLevel === level
                    ? 'default'
                    : 'outline'
                }
                onClick={() => setConfidenceLevel(level as any)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="h-16 border-t bg-white px-6 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Button
              variant="ghost"
              disabled={currentIndex === 0}
              onClick={() => navigateTo(currentIndex - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={handleClear}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              onClick={handleMarkReview}
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Mark Review
            </Button>

            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip
            </Button>

            <Button onClick={handleSaveAndNext}>
              Save & Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </footer>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="w-[300px] border-l bg-white flex flex-col">

        {/* TIMER */}
        <div className="p-4 border-b">

          <div
            className={cn(
              'flex items-center justify-center gap-2 py-3 rounded-xl font-mono font-bold text-lg',
              timerUrgency
            )}
          >
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* QUESTION NAVIGATOR */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          <div className="space-y-3">

            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Question Navigator
            </h4>

            <div className="grid grid-cols-5 gap-2">

              {questions.map((q, i) => {

                const state =
                  paletteStates[q.id] ||
                  (currentIndex === i ? 'current' : 'unvisited')

                return (
                  <button
                    key={q.id}
                    onClick={() => navigateTo(i)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-xs font-bold border transition-all',

                      currentIndex === i
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent',

                      state === 'answered'
                        ? 'bg-emerald-500 text-white'
                        : state === 'marked'
                        ? 'bg-purple-500 text-white'
                        : state === 'skipped'
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-slate-50 text-slate-400'
                    )}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* STATS */}
          <div className="pt-4 border-t">

            <div className="grid grid-cols-2 gap-3 text-center">

              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-emerald-600">
                  {attemptedCount}
                </p>
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Answered
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-2xl font-bold text-slate-700">
                  {questions.length - attemptedCount}
                </p>
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Remaining
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FINISH */}
        <div className="p-4 border-t bg-slate-50/50">

          <AlertDialog
            open={showFinishModal}
            onOpenChange={setShowFinishModal}
          >

            <AlertDialogTrigger asChild>
              <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700">
                Finish Examination
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>

              <AlertDialogHeader>

                <AlertDialogTitle>
                  Submit Examination?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  You have answered {attemptedCount} out of {questions.length} questions.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>

                <AlertDialogCancel>
                  Return
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : 'Submit Now'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* AUTO SUBMIT */}
      <Dialog
        open={showTimesUpModal}
        onOpenChange={() => {}}
      >

        <DialogContent className="max-w-sm text-center">

          <div className="space-y-6 py-4">

            <div className="mx-auto p-4 bg-rose-50 rounded-full w-fit">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold">
                Time&apos;s Up!
              </DialogTitle>

              <DialogDescription>
                Your exam is being submitted automatically.
              </DialogDescription>
            </div>

            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
