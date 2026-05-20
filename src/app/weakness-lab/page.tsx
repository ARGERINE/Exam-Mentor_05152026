// SUPABASE MIGRATION PLACEHOLDER
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { useStudentStore } from '@/store/use-student-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  BrainCircuit,
  Timer,
  Flame,
  TrendingDown,
  Clock,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function WeaknessLabPage() {
  const { user, loading: isUserLoading } = useSupabaseUser()
  const router = useRouter()
  const { examContext } = useStudentStore()

  const [chapterPerf, setChapterPerf] = useState<any[] | null>(null)
  const [qTypePerf, setQTypePerf] = useState<any[] | null>(null)
  const [attempts, setAttempts] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Replaces Firebase hooks - Fetch data from Supabase
    const timer = setTimeout(() => {
      setChapterPerf([])
      setQTypePerf([])
      setAttempts([])
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [user])

  const diagnostics = useMemo(() => {
    if (!chapterPerf || !qTypePerf || !attempts) return null

    // A. Chapter Analysis (Ranked by Impact Score)
    const chapterData = chapterPerf.map(c => {
      const accuracy = c.accuracyPercentage || 0
      const attemptsCount = c.totalQuestionsAttempted || 0
      const impactScore = ((100 - accuracy) / 100) * attemptsCount
      return { ...c, impactScore }
    }).sort((a, b) => b.impactScore - a.impactScore)

    const errors = attempts.filter(a => !a.isCorrect)
    const totalAttempts = attempts.length || 1
    const guessing = errors.filter(a => a.timeTakenSeconds < 30).length
    const conceptGap = errors.filter(a => a.timeTakenSeconds > 90).length
    const inefficiency = attempts.filter(a => a.isCorrect && a.timeTakenSeconds > 120).length
    const weakQTypes = [...qTypePerf].sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)

    return {
      topWeakness: chapterData[0],
      mostFreqMistake: guessing > conceptGap ? 'Guessing under pressure' : 'Conceptual Gaps',
      biggestTimeLeak: weakQTypes.find(q => q.averageTimeSeconds > 100)?.questionType || 'Multi-step Reasoning',
      chapterData,
      qTypeData: weakQTypes,
      behavior: {
        guessing: Math.round((guessing / totalAttempts) * 100),
        conceptGap: Math.round((conceptGap / totalAttempts) * 100),
        inefficiency: Math.round((inefficiency / totalAttempts) * 100)
      }
    }
  }, [chapterPerf, qTypePerf, attempts])

  if (isLoading) {
    return (
      <MentorLayout>
        <main className="flex-1 p-12 space-y-8">
          <Skeleton className="h-12 w-1/3 rounded-xl" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
          <Skeleton className="h-[400px] rounded-3xl" />
        </main>
      </MentorLayout>
    )
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30">
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
          
          <header className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <BrainCircuit className="w-8 h-8" />
              <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Weakness Lab</h1>
            </div>
            <p className="text-slate-500 text-lg font-medium">Identify exactly where you are losing marks and why.</p>
          </header>

          {/* Top Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImpactCard 
              title="Highest Impact Weakness" 
              value={diagnostics?.topWeakness?.chapterName || 'None Detected'} 
              sub={`Score loss: ${Math.round(diagnostics?.topWeakness?.impactScore || 0)} pts`}
              icon={Flame}
              color="text-rose-600"
              bg="bg-rose-50"
            />
            <ImpactCard 
              title="Most Frequent Mistake" 
              value={diagnostics?.mostFreqMistake || 'Scanning...'} 
              sub="Behavioral pattern detected"
              icon={AlertTriangle}
              color="text-amber-600"
              bg="bg-amber-50"
            />
            <ImpactCard 
              title="Biggest Time Leak" 
              value={diagnostics?.biggestTimeLeak || 'Optimizing...'} 
              sub="Slowest retrieval type"
              icon={Timer}
              color="text-blue-600"
              bg="bg-blue-50"
            />
          </div>

          <Tabs defaultValue="chapters" className="space-y-6">
            <TabsList className="bg-white p-1 h-12 rounded-xl border border-slate-200 shadow-sm inline-flex">
              <TabsTrigger value="chapters" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider">Chapters</TabsTrigger>
              <TabsTrigger value="qtypes" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider">Question Types</TabsTrigger>
              <TabsTrigger value="behavior" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider">Behavior</TabsTrigger>
            </TabsList>

            <TabsContent value="chapters" className="space-y-4">
              {diagnostics?.chapterData.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 opacity-60">
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No weakness data accumulated</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {diagnostics?.chapterData.map((chapter, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-2xl overflow-hidden group">
                      <CardContent className="p-5 flex items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-slate-900 truncate">{chapter.chapterName}</h3>
                            <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-100 bg-slate-50">Impact: {Math.round(chapter.impactScore)}</Badge>
                          </div>
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">
                            {chapter.accuracyPercentage < 50 ? 'High attempt but low accuracy' : 'Moderate retrieval stability'}
                          </p>
                        </div>
                        <div className="flex items-center gap-12 shrink-0">
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Accuracy</p>
                            <p className={cn("text-lg font-bold", chapter.accuracyPercentage < 50 ? "text-rose-500" : "text-amber-500")}>{chapter.accuracyPercentage}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attempts</p>
                            <p className="text-lg font-bold text-slate-700">{chapter.totalQuestionsAttempted}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Trend</p>
                            <TrendingDown className="w-5 h-5 text-rose-400 mx-auto" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="qtypes" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {diagnostics?.qTypeData.map((type, i) => (
                  <Card key={i} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden border border-slate-100 p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900">{type.questionType}</h3>
                        <p className="text-xs text-slate-400 font-medium">Efficiency analysis for this format</p>
                      </div>
                      <Badge className={cn("border-none font-bold text-[10px] px-3", type.accuracyPercentage < 60 ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600")}>
                        {type.accuracyPercentage < 60 ? 'CRITICAL' : 'STABILIZING'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span>Accuracy</span>
                          <span>{type.accuracyPercentage}%</span>
                        </div>
                        <Progress value={type.accuracyPercentage} className={cn("h-1.5", type.accuracyPercentage < 60 ? "[&>div]:bg-rose-500" : "[&>div]:bg-blue-500")} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span>Avg Time</span>
                          <span>{type.averageTimeSeconds}s</span>
                        </div>
                        <Progress value={(type.averageTimeSeconds / 180) * 100} className="h-1.5 [&>div]:bg-slate-300" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Card className="border-none shadow-sm bg-white rounded-3xl p-8 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Error Classification</h3>
                    <p className="text-sm text-slate-500">How your errors are distributed by behavioral cause.</p>
                  </div>
                  <div className="space-y-6">
                    <BehaviorMetric label="Guessing" value={diagnostics?.behavior.guessing || 0} color="bg-rose-400" />
                    <BehaviorMetric label="Conceptual Gaps" value={diagnostics?.behavior.conceptGap || 0} color="bg-amber-400" />
                    <BehaviorMetric label="Time Pressure" value={diagnostics?.behavior.inefficiency || 0} color="bg-blue-400" />
                  </div>
                </Card>

                <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-center space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Time Analysis</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-headline font-bold">92s</span>
                      <span className="text-slate-400 font-medium">Avg/Question</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "Retrieval latency analysis active. Take more full-length simulations to map execution leaks."
                    </p>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <section className="bg-white border-2 border-primary/10 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-primary/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary text-white rounded-xl">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-slate-900">Strategic Pivot</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Weakness Lab is monitoring your attempt stream. Diagnostic remediation will be suggested once behavioral patterns stabilize.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button 
                  onClick={() => router.push('/exams/practice')}
                  size="lg" 
                  className="rounded-2xl h-16 px-10 font-bold shadow-lg shadow-primary/20 gap-2 text-base"
                >
                  Start Practice Session <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </MentorLayout>
  )
}

function ImpactCard({ title, value, sub, icon: Icon, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-6 flex flex-row items-center gap-5 group hover:shadow-md transition-shadow rounded-[2rem] border border-slate-100">
      <div className={cn("p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="font-bold text-slate-900 truncate leading-tight">{value}</h4>
        <p className="text-xs text-slate-400 font-medium italic mt-0.5">{sub}</p>
      </div>
    </Card>
  )
}

function BehaviorMetric({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", color)} />
          <span className="text-sm font-bold text-slate-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>
      <Progress value={value} className={cn("h-2", `[&>div]:${color}`)} />
    </div>
  )
}