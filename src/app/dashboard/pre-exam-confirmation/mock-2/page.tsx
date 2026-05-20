
"use client"

import React from 'react'
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
  ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Mock2ConfirmationPage() {
  const router = useRouter()

  const handleBegin = () => {
    router.push('/exams/attempt?mock=2')
  }

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
                <ClipboardList className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-headline font-bold text-slate-900 tracking-tight">
                  Mock Rules & Confirmation
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500">
                  Full-length NEET simulation: Advanced Level
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">
              
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-4 -mx-2">
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions</p>
                  <p className="text-sm font-bold text-slate-800">180</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-bold text-slate-800 whitespace-nowrap">180 min</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mode</p>
                  <p className="text-sm font-bold text-primary truncate">Full Mock</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composition</Label>
                <div className="space-y-3">
                  <CompositionItem label="Physics" count="45 Qs" color="#1a56db" width="25%" />
                  <CompositionItem label="Chemistry" count="45 Qs" color="#0f6e56" width="25%" />
                  <CompositionItem label="Biology" count="90 Qs" color="#854f0b" width="50%" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Marking Scheme</Label>
                <div className="flex gap-2">
                  <MarkingChip label="Correct +4" color="bg-emerald-50 text-emerald-600" />
                  <MarkingChip label="Incorrect −1" color="bg-rose-50 text-rose-600" />
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

              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-[11px] font-medium text-rose-800 leading-relaxed text-center">
                  This is a full-length NEET simulation at Advanced Level. Your result will update your rank band and performance analytics.
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-50 gap-6">
                <div className="flex items-center gap-3">
                  <Checkbox id="ack" checked={true} disabled className="w-4 h-4 rounded-md border-slate-200" />
                  <Label htmlFor="ack" className="text-[10px] font-medium text-slate-400 leading-tight">
                    I understand this attempt will be recorded and analyzed by the intelligence core.
                  </Label>
                </div>

                <Button 
                  onClick={handleBegin}
                  className="rounded-xl h-12 px-6 font-bold text-xs gap-2 transition-all shadow-xl shadow-primary/10"
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

function CompositionItem({ label, count, color, width }: { label: string, count: string, color: string, width: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] font-bold text-slate-600 min-w-[70px]">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-slate-300" style={{ width, backgroundColor: color }} />
      </div>
      <span className="text-[11px] font-bold text-slate-400 min-w-[35px] text-right">{count}</span>
    </div>
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
