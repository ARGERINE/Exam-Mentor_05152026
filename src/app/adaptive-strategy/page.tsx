// SUPABASE MIGRATION PLACEHOLDER
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { useStudentStore } from '@/store/use-student-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Zap, 
  Brain, 
  Clock, 
  ShieldCheck, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  CalendarCheck,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays } from 'date-fns'

export default function AdaptiveStrategyPage() {
  const { user, loading: isUserLoading } = useSupabaseUser()
  const { examContext } = useStudentStore()
  
  const [weakChapters, setWeakChapters] = useState<any[] | null>(null)
  const [revItems, setRevItems] = useState<any[] | null>(null)
  const [psychState, setPsychState] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate real data fetching from Supabase tables
    const timer = setTimeout(() => {
      setWeakChapters([])
      setRevItems([])
      setPsychState([{ focusLevel: 'Medium', anxietyLevel: 'Moderate' }])
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [user])

  const strategy = useMemo(() => {
    if (isLoading) return null

    const todayTasks = []
    const topWeak = weakChapters?.[0]
    const topRev = revItems?.[0]
    const state = psychState?.[0] || { focusLevel: 'Medium', anxietyLevel: 'Moderate' }

    // Task 1: High Impact Remediation
    if (topWeak) {
      todayTasks.push({
        type: 'Practice',
        topic: topWeak.chapterName || topWeak.chapterId,
        duration: '90m',
        reason: 'Accuracy < 45% detected in recent simulations',
        impact: '+12 pts potential',
        color: 'text-rose-600',
        bg: 'bg-rose-50'
      })
    }

    // Task 2: Critical Recall
    if (topRev) {
      todayTasks.push({
        type: 'Revision',
        topic: topRev.chapterId || 'Active Recall',
        duration: '45m',
        reason: 'Memory decay signal triggered (Interval passed)',
        impact: 'Stability +15%',
        color: 'text-amber-600',
        bg: 'bg-amber-50'
      })
    }

    // Task 3: Performance Drill
    todayTasks.push({
      type: 'Mock Drill',
      topic: 'Mixed Sectional',
      duration: '60m',
      reason: state.focusLevel === 'High' ? 'Peak cognitive window detected' : 'Maintain foundational rhythm',
      impact: 'Percentile +0.5',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    })

    return {
      todayTasks,
      distribution: { revision: 30, practice: 50, mock: 20 },
      phase: 'Stabilization Phase (Cycle 2)',
      lockDate: addDays(new Date(), 7),
      logicInsight: state.anxietyLevel === 'High' 
        ? "We have shifted your strategy to 'Accuracy First' to stabilize your confidence baseline before the next full mock."
        : "Strategy optimized for 'Volume & Velocity' based on your high focus stability scores."
    }
  }, [weakChapters, revItems, psychState, isLoading])

  if (isLoading) {
    return (
      <MentorLayout>
        <main className="flex-1 p-12 space-y-8">
          <Skeleton className="h-12 w-1/3 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-[500px] rounded-3xl" />
            <Skeleton className="h-[500px] rounded-3xl" />
          </div>
        </main>
      </MentorLayout>
    )
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-10 pb-32">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <Brain className="w-8 h-8" />
                <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Adaptive Plan</h1>
              </div>
              <p className="text-slate-500 text-lg">
                Automated strategy distribution for <span className="text-primary font-semibold uppercase">{examContext || 'NEET'}</span>.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold px-3 py-1">
                <Activity className="w-3.5 h-3.5 mr-1.5" /> Engine Calibrated
              </Badge>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* 1. TODAY'S AUTOMATED TASKS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" />
                  Today's Execution Protocol
                </h3>
                <span className="text-[10px] font-bold text-slate-400">{format(new Date(), 'EEEE, MMM dd')}</span>
              </div>

              <div className="space-y-4">
                {strategy?.todayTasks.map((task, i) => (
                  <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-[2rem] overflow-hidden group">
                    <CardContent className="p-0 flex items-stretch">
                      <div className={cn("w-1.5", task.color.replace('text', 'bg'))} />
                      <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Badge className={cn("border-none font-bold text-[9px] uppercase px-2 py-0.5", task.bg, task.color)}>
                              {task.type}
                            </Badge>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                              <Clock className="w-3 h-3" /> {task.duration}
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{task.topic}</h4>
                          <p className="text-sm text-slate-500 italic leading-relaxed">
                            "{task.reason}"
                          </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Impact Potential</p>
                            <p className="text-sm font-bold text-emerald-600">{task.impact}</p>
                          </div>
                          <Button size="sm" className="rounded-xl h-9 px-6 font-bold text-xs gap-2">
                            Begin <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 2. WEEKLY DISTRIBUTION & LOCK */}
            <div className="space-y-8">
              {/* Distribution Card */}
              <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100">
                <CardHeader className="border-b border-slate-50">
                  <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-primary" />
                    Strategic Split
                  </CardTitle>
                  <p className="text-xs text-slate-400 font-medium">Weekly time distribution</p>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-6">
                    <DistributionBar label="Practice" value={strategy?.distribution.practice || 0} color="bg-primary" />
                    <DistributionBar label="Revision" value={strategy?.distribution.revision || 0} color="bg-amber-400" />
                    <DistributionBar label="Mock Simulations" value={strategy?.distribution.mock || 0} color="bg-blue-400" />
                  </div>
                  
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-primary" /> Active Phase
                    </p>
                    <p className="text-sm font-bold text-slate-700">{strategy?.phase}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Logic Explanation */}
              <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Zap className="w-32 h-32" />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Brain className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">Strategy Logic</h4>
                  </div>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                    "{strategy?.logicInsight}"
                  </p>
                </div>
              </Card>

              {/* Plan Lock Indicator */}
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Lock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-900">Strategy Cycle Locked</p>
                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Recalibrating in 6 days</p>
                  </div>
                </div>
                <button className="p-2 text-emerald-400 hover:text-emerald-600 transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. SYNC BANNER */}
          <footer className="p-10 bg-white border-2 border-primary/10 rounded-[3rem] shadow-xl shadow-primary/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary text-white rounded-2xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-2xl font-headline font-bold text-slate-900">Signals Synchronized</h3>
                <p className="text-slate-500 font-medium italic">Your adaptive plan is currently absorbing performance data from your last 3 attempts.</p>
              </div>
            </div>
            <Button size="lg" variant="outline" className="rounded-2xl h-14 px-8 border-slate-200 font-bold text-slate-600">
              View Input Signals
            </Button>
          </footer>
        </div>
      </main>
    </MentorLayout>
  )
}

function DistributionBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-xs font-bold text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-900">{value}%</span>
      </div>
      <Progress value={value} className={cn("h-1.5", `[&>div]:${color}`)} />
    </div>
  )
}