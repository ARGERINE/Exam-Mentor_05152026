
"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
export const dynamic = 'force-dynamic'

const SUBJECTS = [
  { name: 'Physics', color: '#1a56db', chapters: ['Electrostatics', 'Magnetism', 'Optics'] },
  { name: 'Chemistry', color: '#0f6e56', chapters: ['Bonding', 'Thermodynamics', 'Kinetics'] },
  { name: 'Biology', color: '#854f0b', chapters: ['Genetics', 'Cell Cycle', 'Photosynthesis'] },
] as const

export default function PracticeConfirmationPage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  const handleBegin = () => {
    if (!selectedChapter) return
    router.push(`/exams/attempt?mode=practice&chapter=${selectedChapter.toLowerCase()}`)
  }

  const activeSubject = SUBJECTS.find(s => s.name === selectedSubject)

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 flex flex-col items-center overflow-y-auto">
        <div className="max-w-[520px] w-full space-y-6 pb-20">
          
          <Button 
            variant="ghost" 
            onClick={() => router.push('/exams')} 
            className="group hover:bg-white text-slate-500 font-bold -ml-4 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Return to Selection
          </Button>

          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="p-8 pb-6 text-center space-y-4">
              <div className="mx-auto p-4 bg-primary/5 rounded-full w-fit">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-headline font-bold text-slate-900 tracking-tight">
                  Exam Rules & Confirmation
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500">
                  Practice mode — select chapter & begin
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">
              
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-4 -mx-2">
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                  <p className="text-sm font-bold text-slate-800">40</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-bold text-slate-800 whitespace-nowrap">No limit</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chapter</p>
                  <p className="text-sm font-bold text-primary truncate">{selectedChapter || '—'}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. Select Subject</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s.name}
                        onClick={() => {
                          setSelectedSubject(s.name)
                          setSelectedChapter(null)
                        }}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all group",
                          selectedSubject === s.name 
                            ? "shadow-sm" 
                            : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                        )}
                        style={{ 
                          borderColor: selectedSubject === s.name ? s.color : undefined,
                          backgroundColor: selectedSubject === s.name ? `${s.color}05` : undefined
                        }}
                      >
                        {selectedSubject === s.name && (
                          <div className="absolute top-2 right-2 p-0.5 bg-white rounded-full shadow-sm" style={{ color: s.color }}>
                            <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                          </div>
                        )}
                        <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: s.color }} />
                        <span className="text-xs font-bold text-slate-700">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSubject && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Choose Chapter</Label>
                    <Select value={selectedChapter || ''} onValueChange={setSelectedChapter}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-bold text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <SelectValue placeholder="Select a chapter..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {activeSubject?.chapters.map(ch => (
                          <SelectItem key={ch} value={ch} className="text-xs font-bold">{ch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composition</Label>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-bold text-slate-600 min-w-[120px] truncate">{selectedChapter || '—'}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    {selectedChapter && (
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: '100%', backgroundColor: activeSubject?.color }} 
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 min-w-[30px] text-right">40 Qs</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marking Scheme</Label>
                <div className="flex gap-2">
                  <MarkingChip label="Correct +1" color="bg-emerald-50 text-emerald-600" />
                  <MarkingChip label="Incorrect 0" color="bg-slate-100 text-slate-400" />
                  <MarkingChip label="Unattempted 0" color="bg-slate-100 text-slate-300" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Rules</Label>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <RuleItem text="No page refresh or navigation" />
                  <RuleItem text="Timer starts immediately" />
                  <RuleItem text="Auto-submit on timeout" />
                  <RuleItem text="Cannot resume after exit" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-6">
                <div className="flex items-center gap-3">
                  <Checkbox id="ack" checked={true} disabled className="w-4 h-4 rounded-md border-slate-200" />
                  <Label htmlFor="ack" className="text-[10px] font-medium text-slate-400 leading-tight">
                    I understand this attempt will be recorded and analyzed by the intelligence core.
                  </Label>
                </div>

                <Button 
                  disabled={!selectedChapter}
                  onClick={handleBegin}
                  className={cn(
                    "rounded-xl h-12 px-6 font-bold text-xs gap-2 transition-all",
                    !selectedChapter && "opacity-40"
                  )}
                >
                  Begin Examination <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )
}

function MarkingChip({ label, color }: { label: string, color: string }) {
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold", color)}>
      {label}
    </span>
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
