"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Brain, 
  Zap, 
  Activity,
  AlertTriangle,
  ArrowRight,
  Fingerprint,
  Layers,
  LayoutGrid
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * QuestionCategoryAnalysisPage
 * Behavioral deep-dive into performance across taxonomies and cognitive levels.
 */

// --- Mock Data ---
const CATEGORIES = [
  { name: 'Single Correct', accuracy: 82, totalAttempted: 840, correct: 688, incorrect: 120, skipped: 32, trend: 'improving' },
  { name: 'Multi Correct', accuracy: 55, totalAttempted: 120, correct: 66, incorrect: 42, skipped: 12, trend: 'stable' },
  { name: 'Assertion–Reason', accuracy: 38, totalAttempted: 150, correct: 31, incorrect: 105, skipped: 14, trend: 'declining' },
  { name: 'Match the Column', accuracy: 72, totalAttempted: 95, correct: 68, incorrect: 20, skipped: 7, trend: 'improving' },
  { name: 'Numerical', accuracy: 64, totalAttempted: 210, correct: 134, incorrect: 65, skipped: 11, trend: 'improving' },
  { name: 'Statement Based', accuracy: 51, totalAttempted: 180, correct: 92, incorrect: 78, skipped: 10, trend: 'stable' },
]

const BLOOM_DATA = [
  { level: 'Remember', accuracy: 88 },
  { level: 'Understand', accuracy: 74 },
  { level: 'Apply', accuracy: 62 },
  { level: 'Analyse', accuracy: 45 },
  { level: 'Evaluate', accuracy: 32 },
]

const SUBJECTS = ['Physics', 'Chemistry', 'Biology']
const MATRIX_DATA: Record<string, Record<string, number>> = {
  'Physics': { 'Single Correct': 78, 'Multi Correct': 45, 'Assertion–Reason': 32, 'Match the Column': 80, 'Numerical': 58, 'Statement Based': 50 },
  'Chemistry': { 'Single Correct': 84, 'Multi Correct': 52, 'Assertion–Reason': 44, 'Match the Column': 72, 'Numerical': 68, 'Statement Based': 55 },
  'Biology': { 'Single Correct': 88, 'Multi Correct': 68, 'Assertion–Reason': 38, 'Match the Column': 64, 'Numerical': 75, 'Statement Based': 48 },
}

export default function QuestionCategoryAnalysisPage() {
  const weakest = CATEGORIES.sort((a, b) => a.accuracy - b.accuracy)[0]

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-10 pb-32">
          
          {/* HEADER */}
          <header className="space-y-1">
            <div className="flex items-center gap-3 text-primary">
              <Fingerprint className="w-8 h-8" />
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Question Category Analysis</h1>
            </div>
            <p className="text-slate-500 text-lg font-medium">How you perform across different question formats and cognitive levels</p>
          </header>

          {/* WEAKEST CATEGORY CALLOUT */}
          <section className="bg-amber-50 border-2 border-amber-100 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-amber-500">
                <Target className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-headline font-bold text-slate-900">
                  Your weakest format is <span className="text-rose-500">{weakest.name}</span>
                </h3>
                <p className="text-slate-600 font-medium italic">
                  Critical bottleneck at {weakest.accuracy}% accuracy across {weakest.totalAttempted} items.
                </p>
              </div>
            </div>
            <Button size="lg" className="h-14 px-8 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20 relative z-10">
              Practice {weakest.name} Questions <ArrowRight className="w-4 h-4" />
            </Button>
          </section>

          {/* CATEGORY GRID */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Performance by Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((cat, i) => (
                <CategoryCard key={i} category={cat} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
            {/* COGNITIVE LEVEL BREAKDOWN */}
            <Card className="lg:col-span-4 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <Brain className="w-6 h-6 text-primary" />
                  Cognitive Level Breakdown
                </CardTitle>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Performance by Bloom's Taxonomy Level</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {BLOOM_DATA.map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-700">{item.level}</span>
                      <span className={cn(
                        "text-sm font-black",
                        item.accuracy > 70 ? "text-emerald-500" : item.accuracy > 50 ? "text-amber-500" : "text-rose-500"
                      )}>{item.accuracy}%</span>
                    </div>
                    <Progress value={item.accuracy} className={cn(
                      "h-1.5",
                      item.accuracy > 70 ? "[&>div]:bg-emerald-500" : item.accuracy > 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-rose-500"
                    )} />
                  </div>
                ))}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mt-4">
                  <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                    "Accuracy drops sharply at 'Analyse' and 'Evaluate' levels, indicating high reliance on rote memory over conceptual application."
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SUBJECT X CATEGORY MATRIX */}
            <Card className="lg:col-span-6 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <Layers className="w-6 h-6 text-primary" />
                  Subject × Format Matrix
                </CardTitle>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cross-sectional accuracy heatmap</p>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-b border-slate-100">
                      <TableHead className="px-8 py-5 text-[10px] font-bold uppercase text-slate-400">Subject</TableHead>
                      {CATEGORIES.map(c => (
                        <TableHead key={c.name} className="px-4 py-5 text-[10px] font-bold uppercase text-slate-400 text-center">{c.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SUBJECTS.map((sub) => (
                      <TableRow key={sub} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                        <TableCell className="px-8 py-6 font-bold text-slate-700">{sub}</TableCell>
                        {CATEGORIES.map(cat => {
                          const acc = MATRIX_DATA[sub][cat.name]
                          return (
                            <TableCell key={cat.name} className="p-1">
                              <div className={cn(
                                "h-14 flex items-center justify-center rounded-xl font-black text-xs transition-all",
                                acc > 75 ? "bg-emerald-50 text-emerald-700" :
                                acc > 50 ? "bg-amber-50 text-amber-700" :
                                "bg-rose-50 text-rose-700"
                              )}>
                                {acc}%
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-8 flex justify-end gap-6 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-emerald-100" /> Stable</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-amber-100" /> Vulnerable</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded bg-rose-100" /> Critical</div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </MentorLayout>
  )
}

function CategoryCard({ category }: { category: any }) {
  const radius = 28
  const circ = 2 * Math.PI * radius
  const offset = circ - (category.accuracy / 100) * circ
  
  const statusColor = category.accuracy > 70 ? "text-emerald-500" : category.accuracy > 40 ? "text-amber-500" : "text-rose-500"
  const borderColor = category.accuracy > 70 ? "border-emerald-100" : category.accuracy > 40 ? "border-amber-100" : "border-rose-100"

  const TrendIcon = category.trend === 'improving' ? TrendingUp : category.trend === 'declining' ? TrendingDown : Minus

  return (
    <Card className={cn("border-2 shadow-sm rounded-3xl bg-white p-6 transition-all hover:shadow-md group", borderColor)}>
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">{category.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format Intensity</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Correct</p>
              <p className="text-sm font-bold text-emerald-600">{category.correct}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Incorrect</p>
              <p className="text-sm font-bold text-rose-600">{category.incorrect}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className={cn("p-1.5 rounded-lg", category.accuracy > 70 ? "bg-emerald-50" : "bg-slate-50")}>
              <TrendIcon className={cn("w-3 h-3", category.accuracy > 70 ? "text-emerald-500" : "text-slate-400")} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {category.totalAttempted} questions solved
            </span>
          </div>
        </div>

        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90 transform">
            <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="5" />
            <circle 
              cx="40" cy="40" r={radius} fill="transparent" 
              stroke="currentColor" strokeWidth="5" 
              strokeDasharray={circ} strokeDashoffset={offset}
              strokeLinecap="round"
              className={cn("transition-all duration-1000", statusColor)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-slate-900">{category.accuracy}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
