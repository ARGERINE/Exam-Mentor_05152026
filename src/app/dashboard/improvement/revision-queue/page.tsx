"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  History, 
  Clock, 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * RevisionQueuePage
 * A spaced repetition dashboard showing items due for review based on memory decay.
 */

// --- Placeholder Data ---
const MOCK_QUEUE_SUMMARY = {
  dueTodayCount: 8,
  estimatedMinutes: 45
}

const MOCK_REVISION_ITEMS = [
  // Due Today
  {
    id: '1',
    subject: 'PHYSICS',
    chapterName: 'Laws of Motion',
    questionPreview: 'A body of mass 5kg is acted upon by two perpendicular forces...',
    dueStatus: 'today',
    lastAccuracy: 65,
    revisionCount: 2,
    memoryStrength: 35
  },
  {
    id: '2',
    subject: 'BIOLOGY',
    chapterName: 'Genetics',
    questionPreview: 'The ratio of phenotypes in a dihybrid cross following independent assortment...',
    dueStatus: 'today',
    lastAccuracy: 90,
    revisionCount: 4,
    memoryStrength: 38
  },
  {
    id: '3',
    subject: 'CHEMISTRY',
    chapterName: 'Thermodynamics',
    questionPreview: 'Which of the following is an intensive property?',
    dueStatus: 'today',
    lastAccuracy: 42,
    revisionCount: 1,
    memoryStrength: 22
  },
  {
    id: '4',
    subject: 'PHYSICS',
    chapterName: 'Electrostatics',
    questionPreview: 'The electric field at a distance r from an infinitely long line...',
    dueStatus: 'today',
    lastAccuracy: 78,
    revisionCount: 3,
    memoryStrength: 39
  },
  // Due This Week
  {
    id: '5',
    subject: 'BIOLOGY',
    chapterName: 'Cell Biology',
    questionPreview: 'Which organelle is referred to as the powerhouse of the cell...',
    dueStatus: 'this_week',
    dueInDays: 2,
    lastAccuracy: 95,
    revisionCount: 5,
    memoryStrength: 65
  },
  {
    id: '6',
    subject: 'CHEMISTRY',
    chapterName: 'Chemical Bonding',
    questionPreview: 'The shape of ammonia molecule is...',
    dueStatus: 'this_week',
    dueInDays: 4,
    lastAccuracy: 88,
    revisionCount: 3,
    memoryStrength: 55
  },
  {
    id: '7',
    subject: 'PHYSICS',
    chapterName: 'Ray Optics',
    questionPreview: 'A convex lens of focal length 20cm is placed in contact...',
    dueStatus: 'this_week',
    dueInDays: 5,
    lastAccuracy: 72,
    revisionCount: 2,
    memoryStrength: 48
  },
  {
    id: '8',
    subject: 'BIOLOGY',
    chapterName: 'Human Health',
    questionPreview: 'Which of the following is a primary lymphoid organ...',
    dueStatus: 'this_week',
    dueInDays: 3,
    lastAccuracy: 84,
    revisionCount: 4,
    memoryStrength: 52
  },
  // Completed
  {
    id: '9',
    subject: 'CHEMISTRY',
    chapterName: 'Atomic Structure',
    questionPreview: 'The de Broglie wavelength of a particle is given by...',
    dueStatus: 'completed',
    lastAccuracy: 92,
    revisionCount: 6,
    memoryStrength: 85
  },
  {
    id: '10',
    subject: 'PHYSICS',
    chapterName: 'Kinematics',
    questionPreview: 'A stone is dropped from a height h...',
    dueStatus: 'completed',
    lastAccuracy: 96,
    revisionCount: 8,
    memoryStrength: 92
  }
]

export default function RevisionQueuePage() {
  const [activeTab, setActiveTab] = useState('today')

  const filteredItems = useMemo(() => {
    return MOCK_REVISION_ITEMS.filter(item => {
      if (activeTab === 'today') return item.dueStatus === 'today'
      if (activeTab === 'this_week') return item.dueStatus === 'this_week'
      if (activeTab === 'completed') return item.dueStatus === 'completed'
      return true
    })
  }, [activeTab])

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto space-y-8 pb-32">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-primary">
                <History className="w-8 h-8" />
                <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Revision Queue</h1>
              </div>
              <p className="text-slate-500 text-lg font-medium">Questions due today based on your memory decay pattern</p>
            </div>
            <Button size="lg" className="rounded-2xl h-14 px-8 font-bold gap-2 shadow-xl shadow-primary/20">
              Start Revision Session <ArrowRight className="w-4 h-4" />
            </Button>
          </header>

          {/* DUE TODAY BANNER */}
          <section className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] flex items-center gap-5">
            <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600">
              <Brain className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-amber-900">
              {MOCK_QUEUE_SUMMARY.dueTodayCount} items due for revision today · 
              Estimated time: <span className="text-amber-600">{MOCK_QUEUE_SUMMARY.estimatedMinutes} minutes</span>
            </p>
          </section>

          {/* TABS & LIST */}
          <Tabs defaultValue="today" onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="bg-white p-1 h-12 rounded-xl border border-slate-200 shadow-sm inline-flex">
              <TabsTrigger value="today" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider">Due Today</TabsTrigger>
              <TabsTrigger value="this_week" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider">Due This Week</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 m-0">
              {filteredItems.map((item) => (
                <QueueCard key={item.id} item={item} />
              ))}

              {filteredItems.length === 0 && (
                <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] opacity-60">
                  <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">No revisions {activeTab === 'completed' ? 'completed yet this week' : 'due in this period'}</h3>
                    <p className="text-slate-500 text-sm font-medium">Your retention is currently within optimal stability zones.</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </MentorLayout>
  )
}

function QueueCard({ item }: { item: any }) {
  const subjectColors: any = {
    PHYSICS: "bg-blue-500",
    CHEMISTRY: "bg-teal-500",
    BIOLOGY: "bg-amber-500"
  }

  const memoryColor = item.memoryStrength < 40 ? "bg-rose-500" : item.memoryStrength < 70 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white hover:shadow-md transition-all group">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-6 md:gap-10">
          
          {/* LEFT: IDENTITY */}
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", subjectColors[item.subject])} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.subject}</p>
              <h4 className="text-base font-bold text-slate-900 truncate leading-tight">{item.chapterName}</h4>
            </div>
          </div>

          {/* CENTRE: PREVIEW */}
          <div className="flex-1 min-w-0 hidden lg:block">
            <p className="text-sm font-medium text-slate-500 italic truncate leading-relaxed">
              "{item.questionPreview}"
            </p>
          </div>

          {/* RIGHT: METRICS */}
          <div className="flex items-center gap-8 shrink-0 w-full md:w-auto justify-between md:justify-end">
            <div className="space-y-3 w-32 hidden sm:block">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                <span>Memory Strength</span>
                <span className={cn(memoryColor.replace('bg-', 'text-'))}>{item.memoryStrength}%</span>
              </div>
              <Progress value={item.memoryStrength} className={cn("h-1", `[&>div]:${memoryColor}`)} />
            </div>

            <div className="text-right min-w-[100px]">
              {item.dueStatus === 'today' && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Due Today</span>}
              {item.dueStatus === 'this_week' && <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Due in {item.dueInDays} days</span>}
              {item.dueStatus === 'completed' && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Completed</span>}
              
              <div className="flex items-center justify-end gap-3 mt-1">
                <span className="text-xs font-bold text-slate-700">{item.lastAccuracy}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Revised {item.revisionCount}x</span>
              </div>
            </div>

            <Button className="rounded-xl h-11 px-6 font-bold text-xs gap-2 shrink-0">
              {item.dueStatus === 'completed' ? 'Re-Review' : 'Revise Now'} 
              <Zap className="w-3.5 h-3.5 fill-current" />
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}

