
"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SubjectType = 'Physics' | 'Chemistry' | 'Biology'

const SUBJECTS = [
  { name: 'Physics', color: '#1a56db', questions: '50 questions' },
  { name: 'Chemistry', color: '#0f6e56', questions: '50 questions' },
  { name: 'Biology', color: '#854f0b', questions: '50 questions' },
] as const

export default function PreExamConfirmationPage() {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | null>(null)

  const handleBegin = () => {
    if (!selectedSubject) return
    router.push(`/exams/attempt?subject=${selectedSubject.toLowerCase()}`)
  }

  const activeSubjectData = SUBJECTS.find(s => s.name === selectedSubject)

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
                  Sectional test — select subject & begin
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">
              
              {/* 2. STATS BAR */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-4 -mx-2">
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                  <p className="text-sm font-bold text-slate-800">50</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-bold text-slate-800">60m</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</p>
                  <p className="text-sm font-bold text-primary truncate">{selectedSubject || '—'}</p>
                </div>
              </div>

              {/* 3. CHOOSE SUBJECT */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose Subject</Label>
                <div className="grid grid-cols-3 gap-3">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSubject(s.name as SubjectType)}
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
                      <span className="text-[9px] font-medium text-slate-400 mt-1">{s.questions}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. COMPOSITION */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composition</Label>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-bold text-slate-600 min-w-[70px]">{selectedSubject || '—'}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    {selectedSubject && (
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: '100%', backgroundColor: activeSubjectData?.color }} 
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 min-w-[30px] text-right">{selectedSubject ? '50 Qs' : '—'}</span>
                </div>
              </div>

              {/* 5. MARKING SCHEME */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marking Scheme</Label>
                <div className="flex gap-2">
                  <MarkingChip label="Correct +4" color="bg-emerald-50 text-emerald-600" />
                  <MarkingChip label="Incorrect −1" color="bg-rose-50 text-rose-600" />
                  <MarkingChip label="Unattempted 0" color="bg-slate-100 text-slate-500" />
                </div>
              </div>

              {/* 6. PROTOCOL RULES */}
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Rules</Label>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <RuleItem text="No page refresh or navigation" />
                  <RuleItem text="Timer starts immediately" />
                  <RuleItem text="Auto-submit on timeout" />
                  <RuleItem text="Cannot resume after exit" />
                </div>
              </div>

              {/* 7. INFO ALERT */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[11px] font-medium text-amber-800 leading-relaxed text-center">
                  This attempt will calibrate your readiness score and update your predictive rank band.
                </p>
              </div>

              {/* FOOTER */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-6">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="ack" 
                    checked={true} 
                    disabled 
                    className="w-4 h-4 rounded-md border-slate-200 data-[state=checked]:bg-primary data-[state=checked]:text-white" 
                  />
                  <Label htmlFor="ack" className="text-[10px] font-medium text-slate-400 leading-tight cursor-default">
                    I understand this attempt will be recorded and analyzed by the intelligence core.
                  </Label>
                </div>

                <Button 
                  disabled={!selectedSubject}
                  onClick={handleBegin}
                  className={cn(
                    "rounded-xl h-12 px-6 font-bold text-xs gap-2 transition-all",
                    !selectedSubject && "opacity-40"
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
