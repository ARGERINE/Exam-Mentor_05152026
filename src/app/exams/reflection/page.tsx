"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Sparkles, 
  Brain, 
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const supabase = createClient(supabaseUrl, supabaseKey)

const CHALLENGES = [
  "Conceptual gaps",
  "Poor revision / recall",
  "Numericals / calculations",
  "Trick questions",
  "Time management",
  "Silly mistakes",
  "Guessing / uncertainty",
  "Anxiety",
  "Fatigue",
  "Other"
]

export default function PostExamReflectionPage() {

  const router = useRouter()

  const [feel, setFeel] = useState<string | null>(null)

  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])

  const [attemptId, setAttemptId] = useState<string | null>(null)

  useEffect(() => {

    const stored = sessionStorage.getItem('reflectionData')

    if (!stored) return

    try {

      const parsed = JSON.parse(stored)

      setAttemptId(parsed.attemptId)

    } catch (err) {

      console.error('Failed to parse reflectionData', err)

    }

  }, [])
  
  const handleToggleChallenge = (challenge: string) => {
    setSelectedChallenges(prev => {
      if (prev.includes(challenge)) {
        return prev.filter(c => c !== challenge)
      }
      if (prev.length < 3) {
        return [...prev, challenge]
      }
      return prev
    })
  }

  const handleSubmit = async () => {

    try {
      if (!attemptId) {
        console.error('Missing attemptId')
        return
      }
  
      const reflectionPayload = {
        attempt_id: attemptId, // from sessionStorage or URL
        exam_feeling: feel ? feel.toLowerCase() : null,

        challenge_1: selectedChallenges[0] ?? null,
        challenge_2: selectedChallenges[1] ?? null,
        challenge_3: selectedChallenges[2] ?? null,
      }

const { error } = await supabase
  .from('attempt_reflections')
  .insert(reflectionPayload)

if (error) {
  console.error('Reflection insert failed:', error)
  return
}
  
      console.log('Reflection Payload:', reflectionPayload)
   
    } catch (err) {
      console.error('Reflection save failed:', err)
    }
  
    router.push(`/exams/results?attemptId=${attemptId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
      <div className="max-w-5xl w-full flex flex-col gap-6 max-h-[90vh]">
        
        <header className="text-center space-y-1">
          <h1 className="text-2xl lg:text-3xl font-headline font-bold text-slate-900 tracking-tight">Post-Exam Reflection</h1>
          <p className="text-sm text-slate-400 font-medium italic">
            Answer this brief questionnaire to reflect and improve performance.
          </p>
        </header>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white flex-1 flex flex-col">
          <CardContent className="p-6 lg:p-10 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-14 h-full items-center">
              
              {/* LEFT COLUMN: QUICK FEEL */}
              <section className="space-y-6 lg:border-r lg:border-slate-100 lg:pr-14 h-full flex flex-col justify-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Brain className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">How did this exam feel?</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Be honest with your emotional baseline.</p>
                </div>
                
                <RadioGroup value={feel || ""} onValueChange={setFeel} className="flex flex-col gap-3">
                  {['Easy', 'Moderate', 'Difficult'].map((option) => (
                    <div key={option}>
                      <RadioGroupItem value={option} id={`feel-${option}`} className="peer sr-only" />
                      <Label
                        htmlFor={`feel-${option}`}
                        className={cn(
                          "flex items-center justify-center h-12 rounded-xl border-2 cursor-pointer transition-all font-bold text-sm",
                          feel === option 
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" 
                            : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </section>

              {/* RIGHT COLUMN: CHALLENGES */}
              <section className="space-y-6 h-full flex flex-col justify-center">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 rounded-xl">
                        <Sparkles className="w-5 h-5 text-rose-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Identify your top 3 Challenges</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Select the primary bottlenecks encountered.</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-none",
                    selectedChallenges.length === 3 ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-400"
                  )}>
                    {selectedChallenges.length} / 3 Selected
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {CHALLENGES.map((challenge) => (
                    <div 
                      key={challenge} 
                      onClick={() => handleToggleChallenge(challenge)}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer group",
                        selectedChallenges.includes(challenge)
                          ? "border-primary/40 bg-primary/[0.03] text-primary shadow-sm"
                          : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200"
                      )}
                    >
                      <Checkbox 
                        id={`chal-${challenge}`} 
                        checked={selectedChallenges.includes(challenge)}
                        className="rounded-md h-5 w-5 pointer-events-none data-[state=checked]:bg-primary"
                      />
                      <Label className="text-xs font-bold cursor-pointer truncate leading-none">{challenge}</Label>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </CardContent>

          {/* STICKY FOOTER INSIDE CARD */}
          <footer className="p-6 bg-slate-50/50 border-t border-slate-100">
            <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
              <Button 
                disabled={!feel || selectedChallenges.length === 0}
                onClick={handleSubmit}
                className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 group relative overflow-hidden transition-all active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  See My Performance Signals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Reflection improves performance by up to 25%
              </p>
            </div>
          </footer>
        </Card>

      </div>
    </div>
  )
}


