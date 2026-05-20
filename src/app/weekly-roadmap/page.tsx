
"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, TrendingUp, Zap, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react'

const MOCK_WEEKLY_PLAN = [
  { day: "Monday", short: "Mon", subject: "Physics", topics: ["Thermodynamics"], time: "3.5h", status: "completed" },
  { day: "Tuesday", short: "Tue", subject: "Biology", topics: ["Plant Physiology"], time: "3h", status: "current" },
]

export default function WeeklyRoadmapPage() {
  const [isGenerated, setIsGenerated] = useState(true)
  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10 pb-32">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2"><div className="flex items-center gap-3 text-primary"><CalendarDays className="w-8 h-8" /><h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Weekly Roadmap</h1></div><p className="text-slate-500 text-lg font-medium italic">Your personalized execution protocol for this cycle.</p></div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border shadow-sm"><div className="px-4 border-r text-center"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Pulse</p><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-2xl font-bold text-slate-900">68%</span></div></div></div>
          </header>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {MOCK_WEEKLY_PLAN.map((day, i) => (
              <Card key={i} className="rounded-[2rem] border-2 border-white bg-white hover:border-primary/20 transition-all cursor-pointer"><CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start"><span className="text-xs font-bold text-slate-400 uppercase">{day.short}</span>{day.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}</div>
                <div className="space-y-1"><p className="text-sm font-bold text-slate-700">{day.subject}</p></div>
                <div className="pt-3 border-t flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400">{day.time}</span><ChevronRight className="w-3 h-3 text-slate-300" /></div>
              </CardContent></Card>
            ))}
          </div>
          <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] p-10"><div className="space-y-6"><div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-emerald-400" /><h4 className="text-sm font-bold uppercase tracking-widest">Strategy Overview</h4></div><p className="text-xl leading-relaxed italic text-slate-300">"This cycle focuses on stabilizing Physics fundamentals while maintaining Biology momentum."</p></div></Card>
        </div>
      </main>
    </MentorLayout>
  )
}
