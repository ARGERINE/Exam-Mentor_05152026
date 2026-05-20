
"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2,
  Settings2,
  Clock,
  LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  { id: 'phy', name: 'Physics', color: '#1a56db' },
  { id: 'chem', name: 'Chemistry', color: '#0f6e56' },
  { id: 'bio', name: 'Biology', color: '#854f0b' },
] as const

export default function CustomExamConfirmationPage() {
  const router = useRouter()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [subjectSplits, setSubjectSplits] = useState<Record<string, number>>({})
  const [duration, setDuration] = useState({ hours: '3', minutes: '0' })
  const [totalQuestions, setTotalQuestions] = useState(180)
  const [difficulty, setDifficulty] = useState({ easy: 30, medium: 40, hard: 30 })
  const [negativeMarking, setNegativeMarking] = useState('yes')

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const handleSplitChange = (id: string, val: string) => {
    const num = parseInt(val) || 0
    setSubjectSplits(prev => ({ ...prev, [id]: num }))
  }

  const isConfigValid = () => {
    const totalSplit = selectedSubjects.reduce((sum, id) => sum + (subjectSplits[id] || 0), 0)
    const totalDiff = difficulty.easy + difficulty.medium + difficulty.hard
    return selectedSubjects.length > 0 && totalSplit === 100 && totalDiff === 100
  }

  const handleBegin = () => {
    if (!isConfigValid()) return
    router.push('/exams/attempt?mode=custom')
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto space-y-6 pb-20">
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/exams')} 
            className="group hover:bg-white text-slate-500 font-bold -ml-4 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Return to Selection
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            
            {/* DESIGN PANEL */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Settings2 className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-headline font-bold text-slate-900 tracking-tight">Design Your Exam</h1>
              </div>

              <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                <CardContent className="p-8 space-y-10">
                  
                  {/* STEP 1 */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 1 — Subject Selection & Split</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {SUBJECTS.map(s => (
                        <div key={s.id} className="space-y-3">
                          <button
                            onClick={() => toggleSubject(s.id)}
                            className={cn(
                              "relative w-full flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group",
                              selectedSubjects.includes(s.id) ? "shadow-sm" : "border-slate-50 bg-slate-50/50"
                            )}
                            style={{ 
                              borderColor: selectedSubjects.includes(s.id) ? s.color : undefined,
                              backgroundColor: selectedSubjects.includes(s.id) ? `${s.color}05` : undefined
                            }}
                          >
                            {selectedSubjects.includes(s.id) && (
                              <div className="absolute top-2 right-2 p-0.5 bg-white rounded-full shadow-sm" style={{ color: s.color }}>
                                <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                              </div>
                            )}
                            <span className="text-xs font-bold text-slate-700">{s.name}</span>
                          </button>
                          {selectedSubjects.includes(s.id) && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                              <Input 
                                type="number" 
                                placeholder="%" 
                                className="h-10 rounded-xl text-center font-bold text-xs" 
                                value={subjectSplits[s.id] || ''}
                                onChange={(e) => handleSplitChange(s.id, e.target.value)}
                              />
                              <span className="text-xs font-bold text-slate-400">%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STEP 2 & 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 2 — Exam Duration</Label>
                      <div className="flex gap-2">
                        <Select value={duration.hours} onValueChange={(h) => setDuration(p => ({ ...p, hours: h }))}>
                          <SelectTrigger className="rounded-xl h-12 font-bold text-xs border-slate-100 bg-slate-50/50">
                            <SelectValue placeholder="Hrs" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0,1,2,3,4,5].map(h => <SelectItem key={h} value={h.toString()}>{h} hrs</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={duration.minutes} onValueChange={(m) => setDuration(p => ({ ...p, minutes: m }))}>
                          <SelectTrigger className="rounded-xl h-12 font-bold text-xs border-slate-100 bg-slate-50/50">
                            <SelectValue placeholder="Mins" />
                          </SelectTrigger>
                          <SelectContent>
                            {['0','15','30','45'].map(m => <SelectItem key={m} value={m}>{m} mins</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 3 — Total Questions</Label>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number" 
                          className="h-12 rounded-xl text-lg font-bold border-slate-100 bg-slate-50/50" 
                          value={totalQuestions}
                          onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 0)}
                        />
                        <span className="text-xs font-bold text-slate-400">QS</span>
                      </div>
                    </div>
                  </div>

                  {/* STEP 4 */}
                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 4 — Difficulty Distribution (%)</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {['easy', 'medium', 'hard'].map(d => (
                        <div key={d} className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase text-center">{d}</p>
                          <Input 
                            type="number" 
                            className="h-12 rounded-xl text-center font-bold text-xs bg-slate-50/50 border-slate-100" 
                            value={difficulty[d as keyof typeof difficulty]}
                            onChange={(e) => setDifficulty(p => ({ ...p, [d]: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STEP 5 */}
                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 5 — Marking Scheme</Label>
                    <RadioGroup value={negativeMarking} onValueChange={setNegativeMarking} className="flex gap-4">
                      <div className="flex items-center space-x-2 bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <RadioGroupItem value="yes" id="neg-yes" />
                        <Label htmlFor="neg-yes" className="text-xs font-bold text-slate-600">Negative Marking</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
                        <RadioGroupItem value="no" id="neg-no" />
                        <Label htmlFor="neg-no" className="text-xs font-bold text-slate-600">No Negative Marking</Label>
                      </div>
                    </RadioGroup>
                  </div>

                </CardContent>
              </Card>
            </div>

            {/* SUMMARY PANEL */}
            <div className="lg:sticky lg:top-10 space-y-6">
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardHeader className="p-8 pb-6 bg-primary/5 text-center">
                  <div className="mx-auto p-4 bg-white rounded-full w-fit shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-headline font-bold text-slate-900 mt-4">Configuration Summary</CardTitle>
                </CardHeader>
                
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-6">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                      <p className="text-xl font-headline font-bold text-slate-800">{totalQuestions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                      <p className="text-xl font-headline font-bold text-slate-800">{duration.hours}h {duration.minutes}m</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject Split</Label>
                    {selectedSubjects.length > 0 ? (
                      <div className="space-y-3">
                        {selectedSubjects.map(id => {
                          const s = SUBJECTS.find(subj => subj.id === id)!
                          const pct = subjectSplits[id] || 0
                          return (
                            <div key={id} className="flex items-center gap-4">
                              <span className="text-[11px] font-bold text-slate-600 min-w-[70px]">{s.name}</span>
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                              </div>
                              <span className="text-[11px] font-bold text-slate-400 min-w-[30px] text-right">{pct}%</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No subjects selected</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Rules</Label>
                    <div className="space-y-2">
                      <RuleItem text="No page refresh or navigation" />
                      <RuleItem text="Timer starts immediately" />
                      <RuleItem text="Auto-submit on timeout" />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                    <p className="text-[11px] font-medium text-amber-800 italic">
                      "Difficulty levels and parameters will be applied as per your custom configuration."
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 space-y-6">
                    <div className="flex items-center gap-3">
                      <Checkbox id="ack-custom" checked={true} disabled className="w-4 h-4" />
                      <Label htmlFor="ack-custom" className="text-[10px] font-medium text-slate-400 leading-tight">
                        I confirm this configuration is final.
                      </Label>
                    </div>

                    <Button 
                      onClick={handleBegin}
                      disabled={!isConfigValid()}
                      className="w-full h-14 rounded-2xl font-bold text-base gap-3 shadow-xl shadow-primary/20"
                    >
                      Begin Exam <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </MentorLayout>
  )
}

function RuleItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
      <span className="text-[10px] font-bold text-slate-600">{text}</span>
    </div>
  )
}
