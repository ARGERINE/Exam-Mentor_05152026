
"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { getSupabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Timer,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Zap,
  RotateCcw,
  Bookmark,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
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
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useSupabaseUser } from '@/lib/supabase/hooks'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number
  subject: string
  topic: string
  text: string
  options: string[]
  correctAnswer: string        // the correct option text
  marks: number                // marks awarded for correct answer
  negativeMarks: number        // marks deducted for wrong answer
}

/** One entry in the real answers map */
interface AnswerRecord {
  selectedOption: string
  confidence: 'confident' | 'somewhat' | 'guess'
  timeSpent: number            // seconds spent on this question
  attemptedAt: number          // epoch ms when saved
  wasSkipped: boolean          // true = user explicitly skipped (no option selected)
}

/** Behavioral tag derived from answer + confidence + time */
type BehaviorTag =
  | 'mastery'            // correct + fast
  | 'correct_slow'       // correct + slow  → weak clarity
  | 'overconfident'      // wrong  + confident
  | 'concept_gap'        // wrong  + slow
  | 'lucky_guess'        // correct + guess
  | 'careful_wrong'      // wrong  + somewhat/guess + slow

type QuestionState = 'unvisited' | 'answered' | 'marked' | 'skipped'

// ─── Questions ────────────────────────────────────────────────────────────────
// ✅ FIX 6: Replace MOCK_QUESTIONS with a DB fetch tied to the attempt:
//   const [questions, setQuestions] = useState<Question[]>([])
//   useEffect(() => {
//     supabase.from('questions').select('*').eq('exam_id', examId).then(({ data }) => {
//       setQuestions(data ?? [])
//     })
//   }, [examId])
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "Physics",
    topic: "Electrostatics",
    text: "A point charge q is placed at the center of a cubic Gaussian surface. The electric flux through any one face of the cube is:",
    options: ["q / ε₀", "q / 4ε₀", "q / 6ε₀", "q / 8ε₀"],
    correctAnswer: "q / 6ε₀",
    marks: 4,
    negativeMarks: 1,
  },
  {
    id: 2,
    subject: "Chemistry",
    topic: "Chemical Bonding",
    text: "Which of the following molecules has the highest dipole moment?",
    options: ["NF₃", "NH₃", "CO₂", "BF₃"],
    correctAnswer: "NH₃",
    marks: 4,
    negativeMarks: 1,
  },
  {
    id: 3,
    subject: "Biology",
    topic: "Genetics",
    text: "The ratio of phenotypes in a dihybrid cross following independent assortment is:",
    options: ["3:1", "1:2:1", "9:3:3:1", "1:1:1:1"],
    correctAnswer: "9:3:3:1",
    marks: 4,
    negativeMarks: 1,
  },
]

// ─── Evaluation Engine ────────────────────────────────────────────────────────

function evaluateAnswers(
  questions: Question[],
  answers: Record<string, AnswerRecord>
): {
  totalMarks: number
  earnedMarks: number
  accuracy: number
  behaviouralMap: Record<number, BehaviorTag>
  revisionList: number[]
  revisionDetails: { id: number; subject: string; topic: string; tag: BehaviorTag }[]
} {
  let earned = 0
  let total = 0
  let accuracyScore = 0
  const behaviouralMap: Record<number, BehaviorTag> = {}
  const revisionList: number[] = []
  const revisionDetails: { id: number; subject: string; topic: string; tag: BehaviorTag }[] = []

  // avg time across NON-SKIPPED answered questions
  const activeIds = Object.keys(answers)
    .map(Number)
    .filter(id => !answers[id].wasSkipped)

  const avgTime =
    activeIds.length > 0
      ? activeIds.reduce((sum, id) => sum + answers[id].timeSpent, 0) / activeIds.length
      : 60

  for (const q of questions) {
    total += q.marks
    const record = answers[q.id]
    if (!record || record.wasSkipped) continue   // skipped = no marks, no tag

    const isCorrect = record.selectedOption === q.correctAnswer
    const isFast = record.timeSpent < avgTime * 0.6
    const isSlow = record.timeSpent > avgTime * 1.5
    const isConfident = record.confidence === 'confident'
    const isGuess = record.confidence === 'guess'

    // Scoring
    if (isCorrect) {
      earned += q.marks
    
      // Confidence-weighted accuracy
      let confidenceWeight = 0
    
      if (record.confidence === 'confident') {
        confidenceWeight = 1
      } else if (record.confidence === 'somewhat') {
        confidenceWeight = 0.5
      } else {
        confidenceWeight = 0
      }
    
      accuracyScore += confidenceWeight
    
    } else {
      earned -= q.negativeMarks
    }
   
    // Behavioral tagging
    let tag: BehaviorTag
    if (isCorrect && isFast && !isGuess)      tag = 'mastery'
    else if (isCorrect && isSlow)             tag = 'correct_slow'
    else if (isCorrect && isGuess)            tag = 'lucky_guess'
    else if (!isCorrect && isConfident)       tag = 'overconfident'
    else if (!isCorrect && isSlow)            tag = 'concept_gap'
    else                                      tag = 'careful_wrong'

    behaviouralMap[q.id] = tag

    // ✅ FIX 4 (partial): revision list excludes mastery only
    if (tag !== 'mastery') {
      revisionList.push(q.id)
      revisionDetails.push({ id: q.id, subject: q.subject, topic: q.topic, tag })
    }
  }

  // ✅ FIX 4: accuracy = correct answers + Confident/ total questions (not score %)
  const accuracy =
  questions.length > 0
    ? (accuracyScore / questions.length) * 100
    : 0

  return { totalMarks: total, earnedMarks: earned, accuracy, behaviouralMap, revisionList, revisionDetails }
}

// ─── Supabase Persistence ─────────────────────────────────────────────────────

async function persistAttempt(
  supabase: ReturnType<typeof getSupabase>,
  attemptId: string,
  answers: Record<string, AnswerRecord>,
  evaluation: ReturnType<typeof evaluateAnswers>,
  totalTimeLeft: number,
  totalDuration: number
){
  const totalTimeSpent = totalDuration - totalTimeLeft

  // 1. Upsert attempt summary
  const { error: attemptError } = await supabase
    .from('attempts')
    .upsert({
      id: attemptId,
      status: 'submitted',
      earned_marks: evaluation.earnedMarks,
      total_marks: evaluation.totalMarks,
      accuracy: evaluation.accuracy,
      total_time_spent: totalTimeSpent,
      submitted_at: new Date().toISOString(),
    })

  if (attemptError) console.error('Attempt upsert error:', attemptError)

  // 2. Insert individual answer rows
  const answerRows = Object.entries(answers).map(([questionId, record]) => ({
    attempt_id: attemptId,
    question_id: Number(questionId),
    selected_option: record.selectedOption,
    confidence: record.confidence,
    time_spent: record.timeSpent,
    attempted_at: new Date(record.attemptedAt).toISOString(),
    behavior_tag: evaluation.behaviouralMap[Number(questionId)] ?? null,
    is_correct:
      MOCK_QUESTIONS.find(q => q.id === Number(questionId))?.correctAnswer ===
      record.selectedOption,
  }))

  if (answerRows.length > 0) {
    const { error: answerError } = await supabase
      .from('attempt_questions')
      .upsert(answerRows, { onConflict: 'attempt_id,question_id' })

    if (answerError) console.error('Answer upsert error:', answerError)
  }

  // 3. Insert revision queue entries
  if (evaluation.revisionList.length > 0) {
    const revisionRows = evaluation.revisionList.map(qId => ({
      attempt_id: attemptId,
      question_id: qId,
      behavior_tag: evaluation.behaviouralMap[qId] ?? null,
      priority:
  evaluation.behaviouralMap[qId] === 'overconfident'
    ? 'high'
    : evaluation.behaviouralMap[qId] === 'concept_gap'
    ? 'medium'
    : 'low',
    }))

    const { error: revError } = await supabase
    .from('revision_queue')
    .upsert(revisionRows, {
      onConflict: 'attempt_id,question_id'})

    if (revError) console.error('Revision upsert error:', revError)
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const TOTAL_DURATION = 3600 // 1 hour in seconds

export default function ExamAttemptPage() {
  const router = useRouter()

  const supabase = getSupabase()
  const { user } = useSupabaseUser()

  // ── attempt id ─────────────────────────────────────────────────────────────
  // ✅ FIX 5: In production, receive attemptId from searchParams or auth context:
  //   const { attemptId } = useSearchParams()  — ties attempt to user + session
  //   This enables resume, cross-device consistency, and plan linkage.
  const [attemptId] = useState<string>(
    () => `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  )

  // ── navigation ──────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0)

  // ── REAL answer store ───────────────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({})

  // ── current question transient state (restored when navigating back) ────────
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<'confident' | 'somewhat' | 'guess' | null>(null)

  // ── per-question time tracking ───────────────────────────────────────────────
  const questionStartRef = useRef<number>(Date.now())         // when current Q was opened
  const accumulatedTimeRef = useRef<Record<number, number>>({}) // seconds spent per qId so far

  // ── global exam timer ────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION)

  // ── palette (UI state, now reflects REAL answers) ────────────────────────────
  const [paletteStates, setPaletteStates] = useState<Record<number, QuestionState>>({})

  // ── modals ───────────────────────────────────────────────────────────────────
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [showTimesUpModal, setShowTimesUpModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────────
  // Restore previous answer when navigating to a question
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const qId = MOCK_QUESTIONS[currentIndex]?.id
    if (!qId) return

    const existing = answers[qId]
    if (existing && !existing.wasSkipped && existing.selectedOption) {
      setSelectedOption(existing.selectedOption)
      setConfidence(existing.confidence)
    } else {
      setSelectedOption(null)
      setConfidence(null)
    }

    // Reset per-question timer for this visit
    questionStartRef.current = Date.now()
  }, [currentIndex]) // intentionally exclude `answers` to avoid reset on save

  // ─────────────────────────────────────────────────────────────────────────────
  // Global exam countdown
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setShowTimesUpModal(true)
          handleSubmitExam(true) // auto-submit
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  /** Flush elapsed time for current question into the accumulator */
  const flushQuestionTime = useCallback((qId: number) => {
    const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000)
    accumulatedTimeRef.current[qId] = (accumulatedTimeRef.current[qId] ?? 0) + elapsed
  }, [])

  const navigateTo = useCallback(
    (nextIndex: number) => {
      const currentQId = MOCK_QUESTIONS[currentIndex]?.id
      if (currentQId !== undefined) flushQuestionTime(currentQId)
      setCurrentIndex(nextIndex)
    },
    [currentIndex, flushQuestionTime]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────────

  const handleOptionSelect = (val: string) => setSelectedOption(val)

  const handleSaveAndNext = () => {
    const q = MOCK_QUESTIONS[currentIndex]

    // ✅ FIX 2: Allow proceeding without confidence (treat as 'guess'); skip if no option either
    if (!selectedOption) {
      // No answer selected — treat as a skip
      handleSkip()
      return
    }

    flushQuestionTime(q.id)

    const record: AnswerRecord = {
  selectedOption,
  confidence: confidence ?? 'guess',
  timeSpent: accumulatedTimeRef.current[q.id] ?? 0,
  attemptedAt: Date.now(),
  wasSkipped: false,
}
    setAnswers(prev => ({ ...prev, [q.id]: record }))
    setPaletteStates(prev => ({ ...prev, [q.id]: 'answered' }))

    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleMarkForReview = () => {
    const q = MOCK_QUESTIONS[currentIndex]

    // Save whatever is selected (if anything) before marking
    if (selectedOption && confidence) {
      flushQuestionTime(q.id)
      const record: AnswerRecord = {
  selectedOption,
  confidence: confidence ?? 'guess',
  timeSpent: accumulatedTimeRef.current[q.id] ?? 0,
  attemptedAt: Date.now(),
  wasSkipped: false,
}
      setAnswers(prev => ({ ...prev, [q.id]: record }))
    }

    setPaletteStates(prev => ({ ...prev, [q.id]: 'marked' }))
    if (currentIndex < MOCK_QUESTIONS.length - 1) navigateTo(currentIndex + 1)
  }

  const handleSkip = () => {
    const q = MOCK_QUESTIONS[currentIndex]
    flushQuestionTime(q.id)

    // ✅ FIX 1: store a real record so time + behavior data is never lost
    const record: AnswerRecord = {
  selectedOption: selectedOption ?? '',
  confidence: confidence ?? 'guess',
  timeSpent: accumulatedTimeRef.current[q.id] ?? 0,
  attemptedAt: Date.now(),
  wasSkipped: true,
}
    setAnswers(prev => ({ ...prev, [q.id]: record }))
    setPaletteStates(prev => ({ ...prev, [q.id]: 'skipped' }))
    if (currentIndex < MOCK_QUESTIONS.length - 1) navigateTo(currentIndex + 1)
  }

  const handleClear = () => {
    const q = MOCK_QUESTIONS[currentIndex]
    setSelectedOption(null)
    setConfidence(null)
    // Remove stored answer for this question if cleared
    setAnswers(prev => {
      const next = { ...prev }
      delete next[q.id]
      return next
    })
    setPaletteStates(prev => {
      const next = { ...prev }
      if (next[q.id] === 'answered') delete next[q.id]
      return next
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit / Evaluation / Persistence
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSubmitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (isSubmitting) return
      setIsSubmitting(true)

      // Flush time for current question one final time
      const currentQId = MOCK_QUESTIONS[currentIndex]?.id

      // ✅ FIX 3: build final answers snapshot immutably — no direct state mutation
      let finalAnswers = { ...answers }

      if (currentQId !== undefined) {
        flushQuestionTime(currentQId)
        // Auto-save any unsaved answer on current question at submit time
        if (selectedOption && !finalAnswers[currentQId]) {
          finalAnswers = {
            ...finalAnswers,
            [currentQId]: {
              selectedOption,
              confidence: confidence ?? 'guess',
              timeSpent: accumulatedTimeRef.current[currentQId] ?? 0,
              attemptedAt: Date.now(),
              wasSkipped: false,
            },
          }
        }
      }

      // ✅ REAL: run evaluation engine with clean snapshot
      const evaluation = evaluateAnswers(MOCK_QUESTIONS, finalAnswers)

      // ✅ REAL: persist to Supabase
      try {
        await persistAttempt(supabase, attemptId, finalAnswers, evaluation, timeLeft, TOTAL_DURATION)
      } catch (err) {
        console.error('Supabase persistence failed:', err)
      }

      // ✅ REAL: pass all data to reflection page via sessionStorage
      const reflectionPayload = {
        attemptId,
        earnedMarks: evaluation.earnedMarks,
        totalMarks: evaluation.totalMarks,
        accuracy: evaluation.accuracy,
        behaviouralMap: evaluation.behaviouralMap,
        revisionList: evaluation.revisionList,
        revisionDetails: evaluation.revisionDetails,
        answers: finalAnswers,
        totalTimeSpent: TOTAL_DURATION - timeLeft,
      }
      sessionStorage.setItem('reflectionData', JSON.stringify(reflectionPayload))

      router.push(`/exams/reflection?attemptId=${attemptId}`)
    },
    [
      isSubmitting,
      currentIndex,
      flushQuestionTime,
      selectedOption,
      confidence,
      answers,
      attemptId,
      timeLeft,
      router,
    ]
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived UI values
  // ─────────────────────────────────────────────────────────────────────────────

  const currentQuestion = MOCK_QUESTIONS[currentIndex]
  const timerUrgency =
    timeLeft < 300
      ? "text-rose-600 bg-rose-50"
      : timeLeft < 900
      ? "text-amber-600 bg-amber-50"
      : "text-slate-700 bg-slate-50"

  // ✅ REAL count: only non-skipped answers
  const attemptedCount = Object.values(answers).filter(a => !a.wasSkipped).length

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* LEFT: MAIN QUESTION AREA (75%) */}
      <div className="flex-[3] flex flex-col relative bg-white lg:bg-slate-50">
        <header className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">
              Question {currentIndex + 1} of {MOCK_QUESTIONS.length}
            </p>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold text-[10px] uppercase px-2">
                {currentQuestion.subject}
              </Badge>
              <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] uppercase px-2">
                {currentQuestion.topic}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-slate-400 hover:text-rose-500 rounded-lg text-xs font-medium"
          >
            <Flag className="w-3.5 h-3.5 mr-1.5" /> Report Issue
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 animate-in fade-in duration-300">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-body font-medium leading-[1.6] text-slate-900">
                {currentQuestion.text}
              </h2>
            </div>

            <RadioGroup
              value={selectedOption || ""}
              onValueChange={handleOptionSelect}
              className="grid grid-cols-1 gap-3"
            >
              {currentQuestion.options.map((option, idx) => (
                <div key={idx}>
                  <RadioGroupItem value={option} id={`opt-${idx}`} className="peer sr-only" />
                  <Label
                    htmlFor={`opt-${idx}`}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all font-medium text-sm",
                      selectedOption === option
                        ? "border-primary bg-primary/[0.03] text-primary shadow-sm"
                        : "border-white lg:border-slate-100 bg-white hover:border-primary/20 shadow-sm"
                    )}
                  >
                    <span className="flex items-center gap-4">
                      <span className={cn(
                        "w-7 h-7 rounded-md flex items-center justify-center border font-bold text-[10px] transition-colors",
                        selectedOption === option
                          ? "bg-primary text-white border-primary"
                          : "bg-slate-50 text-slate-400 border-slate-100"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </span>
                    {selectedOption === option && <CheckCircle2 className="w-4 h-4" />}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </main>

        {/* CONFIDENCE PANEL */}
        <div className={cn(
          "absolute bottom-[56px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl transition-all duration-300 ease-in-out z-10",
          selectedOption ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}>
          <div className="max-w-4xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-sm font-bold text-slate-900">How confident are you about this answer?</p>
            </div>

            <RadioGroup
              value={confidence || ""}
              onValueChange={(val) => setConfidence(val as typeof confidence)}
              className="flex gap-2"
            >
              {[
                {
                  id: 'confident',
                  label: 'Confident',
                  active: 'bg-emerald-500 text-white border-emerald-500',
                  idle: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                },
                {
                  id: 'somewhat',
                  label: 'Somewhat',
                  active: 'bg-blue-500 text-white border-blue-500',
                  idle: 'bg-blue-50 text-blue-600 border-blue-100',
                },
                {
                  id: 'guess',
                  label: 'Guess',
                  active: 'bg-slate-600 text-white border-slate-600',
                  idle: 'bg-slate-100 text-slate-600 border-slate-200',
                },
              ].map((level) => (
                <div key={level.id} className="relative">
                  <RadioGroupItem value={level.id} id={level.id} className="peer sr-only" />
                  <Label
                    htmlFor={level.id}
                    className={cn(
                      "px-4 py-1.5 rounded-lg border font-bold text-xs cursor-pointer transition-all block text-center min-w-[100px]",
                      confidence === level.id ? level.active : level.idle
                    )}
                  >
                    {level.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <footer className="h-14 border-t bg-white px-6 flex items-center justify-between shrink-0 z-20 relative">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 rounded-lg text-slate-400 font-bold text-[10px] group"
              onClick={() => currentIndex > 0 && navigateTo(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 rounded-lg text-slate-300 font-bold text-[10px] hover:text-rose-500"
              onClick={handleClear}
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px]"
              onClick={handleMarkForReview}
            >
              <Bookmark className="w-3 h-3 mr-1.5" /> Mark Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 rounded-lg border-slate-200 text-slate-500 font-bold text-[10px]"
              onClick={handleSkip}
            >
              Skip
            </Button>
            <Button
              size="sm"
              className="h-10 rounded-lg px-6 font-bold shadow-md shadow-primary/20 text-xs group"
              onClick={handleSaveAndNext}
            >
              Save & Next <ChevronRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </footer>
      </div>

      {/* RIGHT SIDEBAR (25%) */}
      <aside className="w-[300px] border-l bg-white flex flex-col shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        {/* Timer */}
        <div className="p-4 border-b">
          <div className={cn(
            "flex items-center justify-center gap-2 py-2 rounded-xl font-mono font-bold text-lg shadow-inner transition-colors duration-500",
            timerUrgency
          )}>
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Question Navigator */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Question Navigator</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {MOCK_QUESTIONS.map((q, i) => {
                const state = paletteStates[q.id] || (currentIndex === i ? 'current' : 'unvisited')
                return (
                  <button
                    key={q.id}
                    onClick={() => navigateTo(i)}
                    className={cn(
                      "w-[32px] h-[32px] rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border",
                      currentIndex === i ? "border-primary ring-2 ring-primary/10 bg-white text-primary" : "border-transparent",
                      state === 'answered' ? "bg-emerald-500 text-white" :
                      state === 'marked'   ? "bg-purple-500 text-white"  :
                      state === 'skipped'  ? "bg-slate-100 text-slate-400" :
                                             "bg-slate-50 text-slate-400"
                    )}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-3 border-t border-slate-50">
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Legend</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-3">
              <LegendItem color="bg-emerald-500" label="Done" />
              <LegendItem color="bg-purple-500" label="Review" />
              <LegendItem color="bg-slate-100" label="Skipped" />
              <LegendItem color="bg-slate-50" label="Open" />
            </div>
          </div>

          {/* Live stats */}
          <div className="space-y-2 pt-3 border-t border-slate-50">
            <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Progress</h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-lg font-bold text-emerald-600">{attemptedCount}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Answered</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-lg font-bold text-slate-700">{MOCK_QUESTIONS.length - attemptedCount}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Remaining</p>
              </div>
            </div>
          </div>

          </div>

        {/* Finish button */}
        <div className="p-4 border-t bg-slate-50/50">
          <AlertDialog open={showFinishModal} onOpenChange={setShowFinishModal}>
            <AlertDialogTrigger asChild>
              <Button className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-100 transition-all active:scale-95">
                Finish Examination
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[1.5rem] p-8 max-w-md">
              <AlertDialogHeader className="space-y-4">
                <div className="mx-auto p-3 bg-emerald-50 rounded-full w-fit">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <AlertDialogTitle className="text-xl font-bold text-center">
                  Are you sure you want to finish?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center text-slate-500 text-sm">
                  You have answered{' '}
                  <span className="font-bold text-slate-900">{attemptedCount}</span> out of{' '}
                  <span className="font-bold text-slate-900">{MOCK_QUESTIONS.length}</span> questions.
                  You will not be able to change your answers after submitting.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-3 sm:justify-center mt-6">
                <AlertDialogCancel className="flex-1 h-11 rounded-xl border-slate-200 font-bold text-xs mt-0">
                  Return to Exam
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleSubmitExam(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs border-none"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
                  ) : 'Submit Now'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* AUTO-SUBMIT DIALOG */}
      <Dialog open={showTimesUpModal} onOpenChange={() => {}}>
        <DialogContent className="rounded-[1.5rem] p-10 max-w-sm text-center border-none shadow-2xl">
          <div className="space-y-6">
            <div className="mx-auto p-4 bg-rose-50 rounded-full w-fit">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold">Time&apos;s Up!</DialogTitle>
              <DialogDescription className="text-slate-500">
                Your exam is being submitted automatically.
              </DialogDescription>
            </div>
            <div className="flex justify-center pt-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
        {label}
      </span>
    </div>
  )
}
