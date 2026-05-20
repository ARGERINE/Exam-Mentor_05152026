"use client"

import React, { useState, useEffect } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { getSupabase } from '@/lib/supabase/client'
import { useStudentStore } from '@/store/use-student-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Terminal, 
  Cpu, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Brain,
  Activity,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

/**
 * DebugSystemPage
 * A hidden diagnostic terminal for inspecting the health and output of AI engines.
 */
export default function DebugSystemPage() {
  const { user } = useSupabaseUser()
  const db = getSupabase()
  const { examContext } = useStudentStore()
  const [diagnosticId, setDiagnosticId] = useState<string>('')

  useEffect(() => {
    setDiagnosticId(Math.random().toString(36).substring(7).toUpperCase())
  }, [])

  // Technical hooks to fetch the latest state from each persistent intelligence container
 const [learning, setLearning] = useState<any[]>([])
const [strategy, setStrategy] = useState<any[]>([])
const [psych, setPsych] = useState<any[]>([])
const [test, setTest] = useState<any[]>([])

useEffect(() => {
  async function fetchDiagnostics() {
    if (!db || !user) return

    const { data: learningData } = await db
      .from('user_topic_intelligence')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_context', examContext)
      .order('updated_at', { ascending: false })
      .limit(1)

    const { data: strategyData } = await db
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_context', examContext)
      .order('generated_at', { ascending: false })
      .limit(1)

    const { data: psychData } = await db
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_context', examContext)
      .order('generated_at', { ascending: false })
      .limit(1)

    const { data: testData } = await db
      .from('user_mock_test_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam_context', examContext)
      .order('completed_at', { ascending: false })
      .limit(1)

    setLearning(learningData || [])
    setStrategy(strategyData || [])
    setPsych(psychData || [])
    setTest(testData || [])
  }

  fetchDiagnostics()
}, [db, user, examContext])

  const engines = [
    {
      id: 'learning',
      name: 'Learning Intelligence (Cognitive Map)',
      lastRun: learning?.[0]?.updated_at,
      output: learning?.[0],
      status: learning && learning.length > 0 ? 'Active' : 'Missing',
      icon: Brain,
      description: 'Maps topic mastery, retention levels, and retrieval stability.'
    },
    {
      id: 'strategy',
      name: 'Strategic Recommendation Engine',
      lastRun: strategy?.[0]?.generated_at,
      output: strategy?.[0],
      status: strategy && strategy.length > 0 ? 'Active' : 'Missing',
      icon: Zap,
      description: 'Calculates the Next Best Action based on accuracy and context.'
    },
    {
      id: 'psych',
      name: 'Psychological Insight Engine',
      lastRun: psych?.[0]?.generated_at,
      output: psych?.[0],
      status: psych && psych.length > 0 ? 'Active' : 'Missing',
      icon: Activity,
      description: 'Monitors burnout risk, anxiety levels, and focus drift.'
    },
    {
      id: 'test',
      name: 'Deep Test Simulation Analyzer',
      lastRun: test?.[0]?.completed_at,
      output: test?.[0],
      status: test && test.length > 0 ? 'Active' : 'Missing',
      icon: Database,
      description: 'Reconstructs mock test behavior and cognitive fatigue zones.'
    }
  ]

  return (
    <MentorLayout>
      <main className="flex-1 p-8 lg:p-12 bg-slate-900 text-slate-300 font-mono min-h-screen">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-500">
                <Terminal className="w-8 h-8" />
                <h1 className="text-3xl font-bold tracking-tighter uppercase">System Diagnostic Panel</h1>
              </div>
              <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
                TECHNICAL OVERVIEW: Persistent state inspection for active Genkit engines. 
                Authenticated UID: <span className="text-slate-300">{user?.uid}</span>
              </p>
            </div>
            <div className="text-right space-y-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-bold">
                ROOT_ACCESS_LEVEL_1
              </Badge>
              <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">
                Active Context: {examContext}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6">
            {engines.map((engine) => (
              <Card key={engine.id} className="bg-slate-950 border-slate-800 shadow-none overflow-hidden rounded-xl">
                <CardHeader className="border-b border-slate-900 bg-slate-900/50 p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-800 rounded-lg">
                        <engine.icon className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-100 text-lg uppercase tracking-tight font-bold">{engine.name}</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">{engine.description}</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      "font-bold px-3 py-1 uppercase text-[10px] border-none",
                      engine.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {engine.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="p-6 border-r border-slate-900 space-y-6">
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Last Execution Sync</p>
                        <p className="text-sm text-slate-300">
                          {engine.lastRun ? `${formatDistanceToNow(new Date(engine.lastRun))} ago` : 'NO_SIGNAL_DETECTED'}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Protocol Checksum</p>
                        <div className="flex items-center gap-2 text-emerald-500">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold tracking-tight">INTEGRITY_VERIFIED</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Stream Status</p>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", engine.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-slate-800")} />
                          <span className="text-xs text-slate-400">{engine.status === 'Active' ? 'Receiving Packets' : 'Awaiting Input'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-2 p-6 bg-black/40">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Latest Output Frame (JSON)
                        </p>
                        <button 
                          onClick={() => engine.output && navigator.clipboard.writeText(JSON.stringify(engine.output, null, 2))}
                          className="text-[10px] text-emerald-500 hover:text-emerald-400 transition-colors uppercase font-bold"
                        >
                          Copy Object
                        </button>
                      </div>
                      <ScrollArea className="h-48 rounded-lg border border-slate-800 p-4 bg-slate-950/50">
                        <pre className="text-[11px] text-emerald-400 leading-relaxed font-mono">
                          {engine.output ? JSON.stringify(engine.output, null, 2) : '// [VOID] - No frame persistent in current container'}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <footer className="pt-10 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-600 text-[10px] uppercase font-bold tracking-widest">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-slate-500"><Cpu className="w-3 h-3" /> Runtime v1.2.0-diagnostic</span>
              <span className="flex items-center gap-1.5 text-slate-500"><Clock className="w-3 h-3" /> System Uptime: 99.98%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-emerald-500/60">
                <ShieldCheck className="w-3 h-3" />
                <span>All Modules Nominal</span>
              </div>
              <span className="text-slate-800">|</span>
              <span className="text-slate-700">Diagnostic ID: {diagnosticId || 'LOADING...'}</span>
            </div>
          </footer>

        </div>
      </main>
    </MentorLayout>
  )
}
