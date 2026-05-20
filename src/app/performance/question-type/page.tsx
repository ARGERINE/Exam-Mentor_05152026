
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { History, CheckCircle2, XCircle, MinusCircle, Timer, BookMarked, RefreshCcw, Clock, LayoutGrid, BarChart3, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_ATTEMPTS = [ { id: 'att-1', examName: "NEET Full Mock #12", date: "Oct 24, 2023", score: 610, maxScore: 720, accuracy: 85, timeTaken: "172m" } ]
const MOCK_QUESTIONS = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, preview: `Consider the following reaction where a point charge q...`, fullText: `A point charge q is placed at the center of a cubic Gaussian surface. The electric flux through any one face of the cube is calculated by dividing total flux by the number of faces.`, subject: 'Physics', chapter: "Electrostatics", difficulty: 'Medium', userAnswer: 'q / 6ε₀', correctAnswer: 'q / 6ε₀', timeTaken: 92, status: 'correct', conceptTag: "Gauss's Law", explanation: "According to Gauss's Law, the total flux through any closed surface is q/ε₀. Each face receives 1/6th if symmetrical." }))

export default function QAAnalysisPage() {
  const [selectedId, setSelectedId] = useState(MOCK_ATTEMPTS[0].id)
  const selectedAttempt = MOCK_ATTEMPTS.find(a => a.id === selectedId)

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-primary">
                <History className="w-8 h-8" />
                <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Q/A Analysis</h1>
              </div>
              <p className="text-slate-500 text-lg font-medium">Question-level breakdown across all your attempts</p>
            </div>
          </header>
          {selectedAttempt && (
            <section className="bg-white p-6 rounded-[2rem] border shadow-sm flex flex-wrap items-center gap-12">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam</p>
                <p className="text-lg font-headline font-bold">{selectedAttempt.examName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                <p className="text-lg font-headline font-bold">{selectedAttempt.score} / {selectedAttempt.maxScore}</p>
              </div>
            </section>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-0">
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="col-span-1">Q#</div>
                    <div className="col-span-5">Question Preview</div>
                    <div className="col-span-2">Subject</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-2">Status</div>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {MOCK_QUESTIONS.map((q) => (
                      <AccordionItem key={q.id} value={`q-${q.id}`} className="border-b last:border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-slate-50/50 transition-all hover:no-underline group">
                          <div className="grid grid-cols-12 gap-4 w-full text-left items-center">
                            <div className="col-span-1 text-xs font-bold text-slate-400">#{q.id}</div>
                            <div className="col-span-5 text-xs font-bold text-slate-700 truncate pr-4">{q.preview}</div>
                            <div className="col-span-2">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none text-[9px] font-bold uppercase">{q.subject}</Badge>
                            </div>
                            <div className="col-span-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <Timer className="w-3 h-3 text-slate-300" /> {q.timeTaken}s
                            </div>
                            <div className="col-span-2">
                              {q.status === 'correct' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-slate-50/30 p-8 space-y-8 animate-in fade-in duration-300">
                          <div className="space-y-4">
                            <Badge className="bg-primary/5 text-primary border-none font-bold text-[9px] uppercase px-3 py-1">{q.chapter} — {q.difficulty}</Badge>
                            <h4 className="text-lg font-body leading-relaxed text-slate-900 font-medium">{q.fullText}</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnswerPill label="Your Answer" value={q.userAnswer} status={q.status} />
                            <AnswerPill label="Correct Answer" value={q.correctAnswer} status="correct" />
                          </div>
                          <div className="p-6 bg-white rounded-2xl border space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                              <Badge variant="outline" className="text-[10px] border-primary/20 text-primary font-bold">EXPLANATION</Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{q.explanation}"</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
            <aside className="lg:col-span-3 space-y-6">
              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white p-8 text-center space-y-10">
                <div className="space-y-1">
                  <p className="text-5xl font-headline font-bold text-slate-900 tracking-tighter">92s</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Avg Per Question</p>
                </div>
                <Button className="w-full h-14 rounded-2xl font-bold gap-2">
                  Analyze Next Attempt <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </MentorLayout>
  )
}

function AnswerPill({ label, value, status }: any) {
  const isCorrect = status === 'correct'
  return (
    <div className={cn("p-4 rounded-2xl border-2 space-y-1.5", isCorrect ? "border-emerald-100 bg-emerald-50/50" : "border-rose-100 bg-rose-50/50")}>
      <p className={cn("text-[9px] font-bold uppercase tracking-widest", isCorrect ? "text-emerald-500" : "text-rose-500")}>{label}</p>
      <div className="flex items-center gap-2">
        {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  )
}
