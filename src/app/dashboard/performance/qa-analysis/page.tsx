
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  History, 
  Filter, 
  Search, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Timer, 
  ChevronRight, 
  BookMarked, 
  RefreshCcw,
  Clock,
  LayoutGrid,
  BarChart3,
  ArrowRight,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * QAAnalysisPage
 * Deep dive into attempt-level question performance with expanded review and time mapping.
 */

// --- Mock Data ---
const MOCK_ATTEMPTS = [
  { id: 'att-1', examName: "NEET Full Mock #12", date: "Oct 24, 2023", score: 610, maxScore: 720, accuracy: 85, timeTaken: "172m" },
  { id: 'att-2', examName: "Biology Sectional: Genetics", date: "Oct 22, 2023", score: 180, maxScore: 200, accuracy: 90, timeTaken: "45m" },
  { id: 'att-3', examName: "Physics Sectional: Optics", date: "Oct 15, 2023", score: 85, maxScore: 180, accuracy: 47, timeTaken: "60m" },
]

const generateQuestions = (count: number) => {
  const subjects = ['Physics', 'Chemistry', 'Biology']
  const statuses = ['correct', 'incorrect', 'skipped']
  const difficulties = ['Easy', 'Medium', 'Hard']
  
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * 3)]
    const sub = subjects[Math.floor(Math.random() * 3)]
    return {
      id: i + 1,
      preview: `Consider the following reaction where a point charge q is placed...`,
      fullText: `A point charge q is placed at the center of a cubic Gaussian surface. The electric flux through any one face of the cube is calculated by dividing total flux by the number of faces. If the side length is doubled, what remains constant?`,
      subject: sub,
      chapter: "Electrostatics",
      difficulty: difficulties[Math.floor(Math.random() * 3)],
      userAnswer: status === 'skipped' ? '—' : (status === 'correct' ? 'q / 6ε₀' : 'q / ε₀'),
      correctAnswer: 'q / 6ε₀',
      timeTaken: Math.floor(Math.random() * 150) + 10,
      status: status,
      conceptTag: "Gauss's Law",
      explanation: "According to Gauss's Law, the total flux through any closed surface is q/ε₀. For a cube, which is highly symmetrical, each face receives exactly 1/6th of the total flux if the charge is at the center."
    }
  })
}

const MOCK_QUESTIONS = generateQuestions(20)

export default function QAAnalysisPage() {
  const [selectedAttemptId, setSelectedAttemptId] = useState(MOCK_ATTEMPTS[0].id)
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const selectedAttempt = MOCK_ATTEMPTS.find(a => a.id === selectedAttemptId)

  const filteredQuestions = useMemo(() => {
    return MOCK_QUESTIONS.filter(q => {
      const subMatch = subjectFilter === 'All' || q.subject === subjectFilter
      const statusMatch = statusFilter === 'All' || q.status === statusFilter.toLowerCase()
      return subMatch && statusMatch
    })
  }, [subjectFilter, statusFilter])

  const timeStats = {
    avg: 92,
    distribution: { fast: 30, normal: 50, slow: 20 },
    slowest: [
      { chapter: "Rotational Motion", time: "165s" },
      { chapter: "Genetics", time: "142s" },
      { chapter: "Thermodynamics", time: "128s" },
    ]
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-primary">
                <History className="w-8 h-8" />
                <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Q/A Analysis</h1>
              </div>
              <p className="text-slate-500 text-lg font-medium">Question-level breakdown across all your attempts</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedAttemptId} onValueChange={setSelectedAttemptId}>
                <SelectTrigger className="w-[240px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11">
                  <div className="flex items-center gap-2"><LayoutGrid className="w-3.5 h-3.5 text-slate-400" /> <SelectValue placeholder="Select Attempt" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  {MOCK_ATTEMPTS.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.examName} ({a.date})</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Subjects</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Correct">Correct</SelectItem>
                  <SelectItem value="Incorrect">Incorrect</SelectItem>
                  <SelectItem value="Skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </header>

          {/* ATTEMPT SUMMARY STRIP */}
          {selectedAttempt && (
            <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-12">
              <SummaryItem label="Exam" value={selectedAttempt.examName} sub={selectedAttempt.date} />
              <SummaryItem label="Score" value={`${selectedAttempt.score}`} sub={`/ ${selectedAttempt.maxScore}`} />
              <SummaryItem label="Accuracy" value={`${selectedAttempt.accuracy}%`} color={selectedAttempt.accuracy > 70 ? "text-emerald-600" : "text-rose-600"} />
              <SummaryItem label="Time Taken" value={selectedAttempt.timeTaken} />
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            
            {/* LEFT: QUESTION LIST (70%) */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-1">Q#</div>
                    <div className="col-span-4">Question Preview</div>
                    <div className="col-span-2">Subject</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1"></div>
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    {filteredQuestions.map((q) => (
                      <AccordionItem key={q.id} value={`q-${q.id}`} className="border-b border-slate-50 last:border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-50/50 transition-all hover:no-underline group">
                          <div className="grid grid-cols-12 gap-4 w-full text-left items-center">
                            <div className="col-span-1 text-xs font-bold text-slate-400">#{q.id}</div>
                            <div className="col-span-4 text-xs font-bold text-slate-700 truncate pr-4">{q.preview}</div>
                            <div className="col-span-2">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[9px] font-bold uppercase">{q.subject}</Badge>
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <Timer className="w-3 h-3 text-slate-300" /> {q.timeTaken}s
                            </div>
                            <div className="col-span-2">
                              {q.status === 'correct' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              {q.status === 'incorrect' && <XCircle className="w-4 h-4 text-rose-500" />}
                              {q.status === 'skipped' && <MinusCircle className="w-4 h-4 text-slate-300" />}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-slate-50/30 p-8 space-y-8 animate-in fade-in duration-300">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] uppercase px-3 py-1">
                                {q.chapter} — {q.difficulty}
                              </Badge>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold border-slate-200 gap-2">
                                  <BookMarked className="w-3 h-3" /> Add to Notebook
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-bold border-slate-200 gap-2">
                                  <RefreshCcw className="w-3 h-3" /> Mark for Revision
                                </Button>
                              </div>
                            </div>
                            <h4 className="text-lg font-body leading-relaxed text-slate-800 font-medium">
                              {q.fullText}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnswerPill label="Your Answer" value={q.userAnswer} status={q.status} />
                            <AnswerPill label="Correct Answer" value={q.correctAnswer} status="correct" />
                          </div>

                          <div className="p-6 bg-white rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary font-bold">EXPLANATION</Badge>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concept: {q.conceptTag}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                              "{q.explanation}"
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Pagination Placeholder */}
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200">
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl font-bold">1</Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl font-bold bg-primary text-white">2</Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl font-bold">3</Button>
                  <span className="px-2 text-slate-300">...</span>
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl font-bold">12</Button>
                </div>
              </div>
            </div>

            {/* RIGHT: TIME ANALYSIS (30%) */}
            <aside className="lg:col-span-3 space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white border border-slate-100">
                <CardHeader className="border-b border-slate-50 p-6">
                  <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Time Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-10">
                  <div className="text-center space-y-1">
                    <p className="text-5xl font-headline font-bold text-slate-900 tracking-tighter">{timeStats.avg}s</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Avg Per Question</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Distribution</p>
                    <div className="h-2 w-full flex rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${timeStats.distribution.fast}%` }} />
                      <div className="h-full bg-blue-400" style={{ width: `${timeStats.distribution.normal}%` }} />
                      <div className="h-full bg-rose-400" style={{ width: `${timeStats.distribution.slow}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <DistributionLabel label="Fast" color="bg-emerald-400" />
                      <DistributionLabel label="Normal" color="bg-blue-400" />
                      <DistributionLabel label="Slow" color="bg-rose-400" />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slowest Items</p>
                    <div className="space-y-3">
                      {timeStats.slowest.map((s, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                          <span className="text-xs font-bold text-slate-600 truncate mr-4">{s.chapter}</span>
                          <span className="text-xs font-black text-rose-500 shrink-0">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-amber-800 leading-relaxed italic">
                      "High retrieval latency in Rotational Motion suggests conceptual gaps or lack of calculation shorthand."
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full h-14 rounded-2xl font-bold text-sm gap-2 shadow-xl shadow-primary/20">
                Analyze Next Attempt <ArrowRight className="w-4 h-4" />
              </Button>
            </aside>

          </div>
        </div>
      </main>
    </MentorLayout>
  )
}

function SummaryItem({ label, value, sub, color = "text-slate-900" }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className={cn("text-lg font-headline font-bold", color)}>{value}</p>
        {sub && <span className="text-xs font-medium text-slate-400">{sub}</span>}
      </div>
    </div>
  )
}

function AnswerPill({ label, value, status }: any) {
  const isCorrect = status === 'correct'
  const isIncorrect = status === 'incorrect'
  const isSkipped = status === 'skipped'

  return (
    <div className={cn(
      "p-4 rounded-2xl border-2 space-y-1.5",
      isCorrect ? "border-emerald-100 bg-emerald-50/50" : 
      isIncorrect ? "border-rose-100 bg-rose-50/50" : 
      "border-slate-100 bg-slate-50/50"
    )}>
      <p className={cn(
        "text-[9px] font-bold uppercase tracking-widest",
        isCorrect ? "text-emerald-500" : isIncorrect ? "text-rose-500" : "text-slate-400"
      )}>{label}</p>
      <div className="flex items-center gap-2">
        {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {isIncorrect && <XCircle className="w-4 h-4 text-rose-500" />}
        {isSkipped && <MinusCircle className="w-4 h-4 text-slate-300" />}
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  )
}

function DistributionLabel({ label, color }: { label: string, color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("w-1.5 h-1.5 rounded-full", color)} />
      <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
    </div>
  )
}

