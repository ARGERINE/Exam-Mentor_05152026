
"use client"

import React from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Brain, Zap, Activity, AlertTriangle, ArrowRight, Fingerprint, Layers, LayoutGrid, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { name: 'Single Correct', accuracy: 82, totalAttempted: 840, correct: 688, incorrect: 120, trend: 'improving' },
  { name: 'Assertion–Reason', accuracy: 38, totalAttempted: 150, correct: 31, incorrect: 105, trend: 'declining' },
  { name: 'Match the Column', accuracy: 72, totalAttempted: 95, correct: 68, incorrect: 20, trend: 'improving' },
  { name: 'Numerical', accuracy: 64, totalAttempted: 210, correct: 134, incorrect: 65, trend: 'improving' },
]

export default function QuestionCategoryAnalysisPage() {
  const weakest = CATEGORIES.sort((a, b) => a.accuracy - b.accuracy)[0]
  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-10 pb-32">
          <header className="space-y-1"><div className="flex items-center gap-3 text-primary"><Fingerprint className="w-8 h-8" /><h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Question Category Analysis</h1></div><p className="text-slate-500 text-lg font-medium">How you perform across different question formats and cognitive levels</p></header>
          <section className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8"><div className="flex items-center gap-6"><div className="p-4 bg-white rounded-2xl shadow-sm text-amber-500"><Zap className="w-8 h-8" /></div><div className="space-y-1"><h3 className="text-2xl font-headline font-bold text-slate-900">Your weakest format is <span className="text-rose-500">{weakest.name}</span></h3><p className="text-slate-600 font-medium italic">Critical bottleneck at {weakest.accuracy}% accuracy.</p></div></div><Button size="lg" className="h-14 px-8 rounded-2xl font-bold gap-2 shadow-xl">Practice {weakest.name} Questions <ArrowRight className="w-4 h-4" /></Button></section>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">{CATEGORIES.map((cat, i) => (<CategoryCard key={i} category={cat} />))}</section>
        </div>
      </main>
    </MentorLayout>
  )
}

function CategoryCard({ category }: { category: any }) {
  const statusColor = category.accuracy > 70 ? "text-emerald-500" : category.accuracy > 40 ? "text-amber-500" : "text-rose-500"
  const TrendIcon = category.trend === 'improving' ? TrendingUp : category.trend === 'declining' ? TrendingDown : Minus
  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white p-6 transition-all hover:shadow-md group">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-4 flex-1">
          <div className="space-y-1"><h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">{category.name}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format Intensity</p></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-0.5"><p className="text-[9px] font-bold text-slate-400 uppercase">Correct</p><p className="text-sm font-bold text-emerald-600">{category.correct}</p></div><div className="space-y-0.5"><p className="text-[9px] font-bold text-slate-400 uppercase">Incorrect</p><p className="text-sm font-bold text-rose-600">{category.incorrect}</p></div></div>
        </div>
        <div className="text-center shrink-0"><p className={cn("text-3xl font-black", statusColor)}>{category.accuracy}%</p><div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400"><TrendIcon className="w-3 h-3" /> {category.trend}</div></div>
      </div>
    </Card>
  )
}
