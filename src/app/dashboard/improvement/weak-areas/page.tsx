"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible'
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  ChevronDown, 
  Target, 
  Zap,
  Clock,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

// --- Placeholder Data Types ---
interface WeaknessData {
  chapterName: string
  subject: 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY'
  accuracy: number
  totalAttempts: number
  lastAttempted: string
  trend: 'declining' | 'stable' | 'improving'
  dependentChapters: number
}

// --- Mock Dataset ---
const MOCK_WEAKNESSES: WeaknessData[] = [
  // Critical
  { chapterName: "Thermodynamics", subject: "PHYSICS", accuracy: 32, totalAttempts: 12, lastAttempted: "2 days ago", trend: "declining", dependentChapters: 4 },
  { chapterName: "Genetics", subject: "BIOLOGY", accuracy: 28, totalAttempts: 15, lastAttempted: "1 day ago", trend: "declining", dependentChapters: 5 },
  { chapterName: "Equilibrium", subject: "CHEMISTRY", accuracy: 35, totalAttempts: 8, lastAttempted: "4 days ago", trend: "stable", dependentChapters: 3 },
  { chapterName: "Rotational Motion", subject: "PHYSICS", accuracy: 24, totalAttempts: 20, lastAttempted: "6 hours ago", trend: "declining", dependentChapters: 6 },
  { chapterName: "Chemical Bonding", subject: "CHEMISTRY", accuracy: 38, totalAttempts: 10, lastAttempted: "3 days ago", trend: "stable", dependentChapters: 2 },
  { chapterName: "Plant Physiology", subject: "BIOLOGY", accuracy: 31, totalAttempts: 18, lastAttempted: "1 week ago", trend: "declining", dependentChapters: 4 },
  
  // Needs Attention
  { chapterName: "Organic Chemistry", subject: "CHEMISTRY", accuracy: 48, totalAttempts: 25, lastAttempted: "2 days ago", trend: "stable", dependentChapters: 3 },
  { chapterName: "Electrostatics", subject: "PHYSICS", accuracy: 52, totalAttempts: 30, lastAttempted: "1 day ago", trend: "improving", dependentChapters: 2 },
  { chapterName: "Cell Biology", subject: "BIOLOGY", accuracy: 55, totalAttempts: 42, lastAttempted: "5 days ago", trend: "stable", dependentChapters: 1 },
  { chapterName: "Magnetism", subject: "PHYSICS", accuracy: 42, totalAttempts: 14, lastAttempted: "3 days ago", trend: "declining", dependentChapters: 3 },
  { chapterName: "Hydrocarbons", subject: "CHEMISTRY", accuracy: 58, totalAttempts: 22, lastAttempted: "12 hours ago", trend: "improving", dependentChapters: 2 },
  { chapterName: "Human Anatomy", subject: "BIOLOGY", accuracy: 45, totalAttempts: 35, lastAttempted: "2 weeks ago", trend: "declining", dependentChapters: 4 },

  // Improving
  { chapterName: "Modern Physics", subject: "PHYSICS", accuracy: 68, totalAttempts: 50, lastAttempted: "Yesterday", trend: "improving", dependentChapters: 1 },
  { chapterName: "Atomic Structure", subject: "CHEMISTRY", accuracy: 72, totalAttempts: 38, lastAttempted: "4 days ago", trend: "improving", dependentChapters: 0 },
  { chapterName: "Biomolecules", subject: "BIOLOGY", accuracy: 64, totalAttempts: 28, lastAttempted: "3 days ago", trend: "stable", dependentChapters: 1 },
  { chapterName: "Kinematics", subject: "PHYSICS", accuracy: 74, totalAttempts: 65, lastAttempted: "1 week ago", trend: "improving", dependentChapters: 0 },
]

export default function WeakAreasPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY'>('ALL')
  const [isImprovingExpanded, setIsImprovingExpanded] = useState(false)

  const filteredData = useMemo(() => {
    if (activeFilter === 'ALL') return MOCK_WEAKNESSES
    return MOCK_WEAKNESSES.filter(w => w.subject === activeFilter)
  }, [activeFilter])

  const critical = filteredData.filter(w => w.accuracy < 40)
  const attention = filteredData.filter(w => w.accuracy >= 40 && w.accuracy < 60)
  const improving = filteredData.filter(w => w.accuracy >= 60 && w.accuracy <= 75)

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-10 pb-32">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Weak Areas</h1>
              <p className="text-slate-500 text-lg font-medium">Chapters and topics where your accuracy is consistently below threshold</p>
            </div>

            <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
              {['ALL', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                    activeFilter === filter 
                      ? "bg-primary text-white shadow-md" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {filter === 'ALL' ? 'All Subjects' : filter}
                </button>
              ))}
            </div>
          </header>

          {/* CRITICAL SECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-xs font-bold text-rose-600 uppercase tracking-[0.2em]">CRITICAL — Below 40% Accuracy</h2>
            </div>

            <ScrollArea className="w-full whitespace-nowrap rounded-3xl pb-4">
              <div className="flex gap-5">
                {critical.map((weakness, i) => (
                  <WeaknessCard key={i} weakness={weakness} variant="critical" onAction={() => router.push('/exams')} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>

          {/* NEEDS ATTENTION SECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">NEEDS ATTENTION — 40–60% Accuracy</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attention.map((weakness, i) => (
                <WeaknessCard key={i} weakness={weakness} variant="attention" onAction={() => router.push('/exams')} />
              ))}
            </div>
          </section>

          {/* IMPROVING SECTION (Collapsible) */}
          <section className="space-y-4 pt-4">
            <Collapsible open={isImprovingExpanded} onOpenChange={setIsImprovingExpanded} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em]">IMPROVING — 60–75% Accuracy</h2>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-400 font-bold text-[10px] uppercase gap-2 hover:bg-white">
                    {isImprovingExpanded ? 'Hide' : 'Show'} Improving Chapters ({improving.length})
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isImprovingExpanded && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {improving.map((weakness, i) => (
                    <WeaknessCard key={i} weakness={weakness} variant="improving" onAction={() => router.push('/exams')} />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>

        </div>
      </main>
    </MentorLayout>
  )
}

function WeaknessCard({ weakness, variant, onAction }: { weakness: WeaknessData, variant: 'critical' | 'attention' | 'improving', onAction: () => void }) {
  const colors = {
    critical: { border: "border-rose-100", accent: "bg-rose-500", text: "text-rose-600", bg: "bg-rose-50/50" },
    attention: { border: "border-amber-100", accent: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50/50" },
    improving: { border: "border-emerald-100", accent: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50/50" },
  }

  const subjectColors = {
    PHYSICS: "bg-blue-50 text-blue-600",
    CHEMISTRY: "bg-teal-50 text-teal-600",
    BIOLOGY: "bg-amber-50 text-amber-600"
  }

  const TrendIcon = weakness.trend === 'declining' ? TrendingDown : weakness.trend === 'improving' ? TrendingUp : Minus

  return (
    <Card className={cn(
      "min-w-[340px] border-none shadow-sm rounded-3xl overflow-hidden bg-white transition-all hover:shadow-md group",
      variant === 'critical' ? "w-[340px]" : "w-full"
    )}>
      <CardContent className="p-0 flex flex-col h-full">
        {/* Top Strip */}
        <div className={cn("h-1 w-full", colors[variant].accent)} />
        
        <div className="p-6 space-y-6 flex-1">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Badge className={cn("border-none font-bold text-[9px] uppercase px-2 py-0", subjectColors[weakness.subject])}>
                {weakness.subject}
              </Badge>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight truncate">
                {weakness.chapterName}
              </h3>
            </div>
            <div className={cn("p-2 rounded-xl", colors[variant].bg)}>
              <TrendIcon className={cn("w-4 h-4", colors[variant].text)} />
            </div>
          </div>

          {/* Accuracy Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
              <span className={cn("text-base font-bold", colors[variant].text)}>{weakness.accuracy}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", colors[variant].accent)} 
                style={{ width: `${weakness.accuracy}%` }}
              />
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Attempts</p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Activity className="w-3 h-3 text-slate-300" />
                {weakness.totalAttempts} Sessions
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Last Activity</p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Clock className="w-3 h-3 text-slate-300" />
                {weakness.lastAttempted}
              </div>
            </div>
          </div>

          {/* Dependency Alert */}
          {weakness.dependentChapters > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
              <Layers className="w-4 h-4 text-slate-400" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                Blocks <span className="text-primary">{weakness.dependentChapters} Related Topics</span>
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <Button 
            onClick={onAction}
            className="w-full rounded-xl h-11 font-bold text-xs gap-2 group/btn shadow-none"
            variant="outline"
          >
            Practice Now <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
