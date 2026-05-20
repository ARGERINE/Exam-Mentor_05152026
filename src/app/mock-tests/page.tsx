
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Timer, 
  Zap, 
  Target, 
  Brain, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Send,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Activity,
  AlertCircle,
  Clock,
  History
} from 'lucide-react'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { getSupabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type TestState = 'selection' | 'strategy' | 'running' | 'summary'

interface Question {
  id: string
  subject: string
  text: string
  options: string[]
  correct: string
}

const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', subject: 'Biology', text: 'Which part of the plant cell is responsible for photosynthesis?', options: ['Nucleus', 'Mitochondria', 'Chloroplast', 'Ribosome'], correct: 'Chloroplast' },
  { id: 'q2', subject: 'Biology', text: 'DNA replication occurs in which phase of the cell cycle?', options: ['G1 phase', 'S phase', 'G2 phase', 'M phase'], correct: 'S phase' },
  { id: 'q3', subject: 'Chemistry', text: 'What is the oxidation state of Oxygen in H2O2?', options: ['-2', '-1', '0', '+1'], correct: '-1' },
  { id: 'q4', subject: 'Physics', text: 'The focal length of a plane mirror is:', options: ['Zero', 'Negative', 'Finite', 'Infinite'], correct: 'Infinite' },
  { id: 'q5', subject: 'Physics', text: 'Which of the following is a scalar quantity?', options: ['Velocity', 'Force', 'Acceleration', 'Energy'], correct: 'Energy' },
]

export default function MockTestsPage() {
  const router = useRouter()
  const { user } = useSupabaseUser()
  const db = getSupabase()
  
  const [state, setState] = useState<TestState>('selection')
  const [selectedMock, setSelectedMock] = useState<{ id: string, name: string } | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(1800) // 30 mins for demo
  const [sectionSwitches, setSectionSwitches] = useState(0)
  const [lastSubject, setLastSubject] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number>(0)

  // Timer logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>
    if (state === 'running' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0) {
      handleSubmit()
    }
    return () => clearInterval(timer)
  }, [state, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTest = () => {
    setStartTime(Date.now())
    setState('running')
  }

  const handleSelectAnswer = (ans: string) => {
    const q = MOCK_QUESTIONS[currentIndex]
    if (lastSubject && lastSubject !== q.subject) {
      setSectionSwitches(prev => prev + 1)
    }
    setLastSubject(q.subject)
    setAnswers(prev => ({ ...prev, [q.id]: ans }))
  }

  const handleSubmit = async () => {
    if (!user || !db || !selectedMock) return
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const correctCount = MOCK_QUESTIONS.filter(q => answers[q.id] === q.correct).length
    const score = (correctCount / MOCK_QUESTIONS.length) * 100

    const attemptId = `mock_att_${Date.now()}`
    const attemptData = {
      id: attemptId,
      userId: user.id,
      mockTestId: selectedMock.id,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      score: Math.round(score),
      timeTakenMinutes: Math.round(timeTaken / 60),
      performanceAnalysis: `Navigated ${sectionSwitches} section switches. Accuracy peak in ${MOCK_QUESTIONS[0].subject}.`,
      examId: 'neet'
    }

    try {
      const { error } = await db
  .from('mock_attempts')
  .insert([attemptData])

if (error) {
  console.error('Error saving mock attempt:', error)
}
      setState('summary')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30">
        <div className="max-w-5xl mx-auto space-y-10 pb-32">
          
          {state === 'selection' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="space-y-2">
                <h1 className="text-4xl font-headline font-bold text-slate-900">Mock Examination Center</h1>
                <p className="text-slate-500 text-lg">Select a full-length simulation to calibrate your competitive readiness.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: 'm1', name: 'NEET 2025 Full Mock #1', questions: 180, time: '180m', difficulty: 'Standard' },
                  { id: 'm2', name: 'NEET 2025 Full Mock #2', questions: 180, time: '180m', difficulty: 'Advanced' },
                  { id: 'm3', name: 'Biology Sectional Mock', questions: 90, time: '90m', difficulty: 'Targeted' },
                ].map((mock) => (
                  <Card key={mock.id} className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-3xl overflow-hidden group">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] uppercase tracking-widest">{mock.difficulty}</Badge>
                          <h3 className="text-xl font-headline font-bold text-slate-900">{mock.name}</h3>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" /> {mock.questions} Questions
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" /> {mock.time}
                        </div>
                      </div>

                      <Button 
                        onClick={() => { setSelectedMock(mock); setState('strategy'); }}
                        className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/10 group-hover:scale-[1.02] transition-transform"
                      >
                        Prepare Strategy <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {state === 'strategy' && selectedMock && (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
              <header className="text-center space-y-4">
                <div className="inline-flex p-4 bg-primary/10 rounded-full mb-2">
                  <Brain className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-headline font-bold text-slate-900">Pre-Test Strategy Suggestion</h2>
                <p className="text-slate-500 italic">"Execution is as important as knowledge. Let's map your path."</p>
              </header>

              <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs">1</div>
                      <p className="text-lg font-medium">Start with <span className="text-emerald-400 font-bold">Biology</span> to build momentum and bank time.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">2</div>
                      <p className="text-lg font-medium">Tackle <span className="text-blue-400 font-bold">Chemistry</span> next, focusing on organic recall.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-xs">3</div>
                      <p className="text-lg font-medium">Reserve the final 60 mins for <span className="text-amber-400 font-bold">Physics</span> calculations.</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Mental Anchor</p>
                    </div>
                    <p className="text-sm italic text-white/70">"If you hit a calculation block in Physics, don't switch subjects immediately. Use the '2-minute rule' before moving on."</p>
                  </div>

                  <Button 
                    onClick={handleStartTest}
                    className="w-full h-16 rounded-2xl text-lg font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-2xl"
                  >
                    Enter Simulation <Play className="ml-2 w-5 h-5 fill-current" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {state === 'running' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Mock</p>
                    <h3 className="font-bold text-slate-900">{selectedMock?.name}</h3>
                  </div>
                  <div className="h-10 w-px bg-slate-100 hidden sm:block" />
                  <div className="space-y-1 hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section</p>
                    <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px]">{MOCK_QUESTIONS[currentIndex].subject}</Badge>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl font-mono font-bold text-xl shadow-inner",
                  timeLeft < 300 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-primary"
                )}>
                  <Timer className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                  <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden min-h-[400px] flex flex-col">
                    <div className="h-1.5 w-full bg-slate-50">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }} />
                    </div>
                    <CardContent className="p-10 lg:p-16 flex-1 flex flex-col justify-center space-y-12">
                      <div className="space-y-4">
                        <span className="text-primary font-bold text-sm">Question {currentIndex + 1} of {MOCK_QUESTIONS.length}</span>
                        <h2 className="text-2xl md:text-3xl font-body leading-relaxed text-slate-900 font-medium">
                          {MOCK_QUESTIONS[currentIndex].text}
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {MOCK_QUESTIONS[currentIndex].options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSelectAnswer(option)}
                            className={cn(
                              "flex items-center justify-between px-8 py-6 rounded-2xl border-2 transition-all font-medium text-lg text-left",
                              answers[MOCK_QUESTIONS[currentIndex].id] === option 
                                ? "border-primary bg-primary/[0.02] text-primary" 
                                : "border-slate-50 hover:border-primary/20 bg-white"
                            )}
                          >
                            {option}
                            {answers[MOCK_QUESTIONS[currentIndex].id] === option && <ShieldCheck className="w-6 h-6" />}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                    <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between">
                      <Button 
                        variant="ghost" 
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex(prev => prev - 1)}
                        className="rounded-xl px-6 h-12 font-bold"
                      >
                        <ChevronLeft className="mr-2 w-4 h-4" /> Previous
                      </Button>
                      <Button 
                        onClick={() => {
                          if (currentIndex < MOCK_QUESTIONS.length - 1) {
                            setCurrentIndex(prev => prev + 1)
                          } else {
                            handleSubmit()
                          }
                        }}
                        className="rounded-xl px-10 h-12 font-bold"
                      >
                        {currentIndex === MOCK_QUESTIONS.length - 1 ? "Finish Attempt" : "Save & Next"} <ChevronRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                      <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-slate-400">Navigation Map</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-5 gap-2">
                        {MOCK_QUESTIONS.map((q, i) => (
                          <button
                            key={q.id}
                            onClick={() => setCurrentIndex(i)}
                            className={cn(
                              "aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all",
                              currentIndex === i ? "bg-primary text-white" : 
                              answers[q.id] ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                              "bg-slate-50 text-slate-400 border border-slate-100"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
                    <div className="flex items-center gap-2 text-amber-600">
                      <Zap className="w-4 h-4 fill-current" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Tactical Alert</p>
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed font-medium italic">
                      "You've switched sections {sectionSwitches} times. Avoid fragmented focus; try to finish the current subject block."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === 'summary' && (
            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <header className="text-center space-y-4">
                <div className="inline-flex p-6 bg-emerald-50 rounded-full mb-2">
                  <ShieldCheck className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-4xl font-headline font-bold text-slate-900">Submission Received</h2>
                <p className="text-slate-500 text-lg max-w-lg mx-auto">Your performance signals have been processed and integrated into your dashboard.</p>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-8 bg-white rounded-[2rem] shadow-sm text-center space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
                  <p className="text-4xl font-headline font-bold text-primary">
                    {Math.round((MOCK_QUESTIONS.filter(q => answers[q.id] === q.correct).length / MOCK_QUESTIONS.length) * 100)}%
                  </p>
                </div>
                <div className="p-8 bg-white rounded-[2rem] shadow-sm text-center space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Index</p>
                  <p className="text-4xl font-headline font-bold text-blue-500">Fast</p>
                </div>
                <div className="p-8 bg-white rounded-[2rem] shadow-sm text-center space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Switches</p>
                  <p className="text-4xl font-headline font-bold text-amber-500">{sectionSwitches}</p>
                </div>
              </div>

              <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-10 flex flex-col md:flex-row gap-10 items-center">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Activity className="w-5 h-5" />
                      <h3 className="text-xl font-headline font-bold">Quick Insights</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed italic">
                      "Your navigation was efficient, but you showed hesitation in the middle Chemistry block. Your rank prediction is stabilizing around the 500-800 band."
                    </p>
                  </div>
                  <div className="shrink-0 w-full md:w-auto">
                    <Button 
                      onClick={() => router.push('/mock-analysis')}
                      size="lg" 
                      className="rounded-2xl px-10 h-14 font-bold shadow-xl shadow-primary/20 gap-2"
                    >
                      Deep Analysis Report <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center gap-4">
                <Button variant="ghost" onClick={() => setState('selection')} className="rounded-xl font-bold">Return to Selection</Button>
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="rounded-xl font-bold">Go to Dashboard</Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </MentorLayout>
  )
}
