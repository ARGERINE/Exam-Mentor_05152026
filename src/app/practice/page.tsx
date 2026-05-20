
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ChevronRight, 
  Brain, 
  Timer,
  ArrowLeft,
  Target,
  Zap,
  Activity,
  Award,
  History,
  Info
} from 'lucide-react'
import { personalizedAnswerExplanation, PersonalizedAnswerExplanationOutput } from '@/ai/flows/personalizedAnswerExplanation'
import { usePracticeStore, AttemptType, ConfidenceLevel, DifficultyLevel } from '@/store/use-practice-store'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { getSupabase } from '@/lib/supabase/client'

import { cn } from '@/lib/utils'

const SUBJECTS = ['Physics', 'Chemistry', 'Biology'];

export default function PracticePage() {
  const { user } = useSupabaseUser()
  const db = getSupabase()
  const { 
    isSessionActive, 
    selectedSubject, 
    difficulty,
    sessionId,
    sessionStats,
    setSubject, 
    setDifficulty,
    startSession, 
    endSession,
    nextQuestion
  } = usePracticeStore()

  const [step, setStep] = useState(0) // 0: Setup, 1: Question, 2: Feedback
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<PersonalizedAnswerExplanationOutput | null>(null)
  const [loading, setLoading] = useState(false)

  const currentQuestion = {
    id: 'q_elec_001',
    topicId: 'electrostatics',
    question: "If the distance between two charges is doubled, what happens to the electrostatic force?",
    options: ["It becomes double", "It becomes half", "It becomes one-fourth", "It remains the same"],
    correct: "It becomes one-fourth",
    concept: "Coulomb's Law",
    difficulty: "easy" as const
  }

  const handleStart = () => {
    startSession(`sess_${Date.now()}`)
    setStep(1)
  }

  async function handleSubmit() {
    if (!selectedOption || !user || !db || !sessionId) return
    setLoading(true)
    try {
      const result = await personalizedAnswerExplanation({
        question: currentQuestion.question,
        userAnswer: selectedOption,
        correctAnswer: currentQuestion.correct,
        concept: currentQuestion.concept,
        examType: "NEET",
        difficulty: currentQuestion.difficulty,
        performanceHistorySummary: "You are consistent with basic physics concepts."
      })
      setExplanation(result)
      setStep(2)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {step === 0 && (
            <div className="space-y-8 animate-in fade-in">
              <h1 className="text-3xl font-headline font-bold">Adaptive Practice</h1>
              <div className="grid grid-cols-3 gap-3">
                {SUBJECTS.map(s => (
                  <Button key={s} variant={selectedSubject === s ? "default" : "outline"} onClick={() => setSubject(s)}>{s}</Button>
                ))}
              </div>
              <Button size="lg" className="w-full h-16 rounded-2xl" disabled={!selectedSubject} onClick={handleStart}>Start Session</Button>
            </div>
          )}

          {step >= 1 && (
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10 space-y-8">
              <h2 className="text-2xl font-body">{currentQuestion.question}</h2>
              <RadioGroup onValueChange={setSelectedOption} className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={opt} className="peer sr-only" />
                    <Label htmlFor={opt} className={cn("flex-1 p-6 rounded-2xl border-2 cursor-pointer transition-all", selectedOption === opt ? "border-primary bg-primary/5" : "border-slate-50")}>{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
              {step === 1 && <Button size="lg" onClick={handleSubmit} disabled={!selectedOption || loading}>{loading ? "Analyzing..." : "Confirm"}</Button>}
              {step === 2 && explanation && (
                <div className="bg-slate-900 text-white p-8 rounded-[2rem] space-y-4">
                  <h3 className="text-xl font-bold">Mentor's Logic</h3>
                  <p className="italic text-lg">"{explanation.explanation}"</p>
                  <Button onClick={() => setStep(0)}>Next Challenge</Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </MentorLayout>
  )
}
