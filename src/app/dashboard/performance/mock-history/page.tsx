"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  History, 
  Filter, 
  ArrowRight, 
  ChevronRight, 
  Trophy, 
  Target, 
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * MockHistoryPage
 * Displays a chronological list of all exam and sectional attempts with performance signals.
 */

// --- Placeholder Data ---
const MOCK_HISTORY_SUMMARY = {
  totalAttempts: 24,
  bestScore: 685,
  bestScoreMax: 720,
  avgAccuracy: 72
}

const MOCK_ATTEMPTS = [
  {
    id: '1',
    examName: "NEET Full Mock #12",
    examType: "Mock",
    date: "Oct 24, 2023",
    score: 610,
    maxScore: 720,
    accuracy: 85,
    timeTaken: "172m",
    physicsScore: 145,
    chemScore: 155,
    bioScore: 310,
    percentile: 98.2,
    predictedRank: 1240
  },
  {
    id: '2',
    examName: "Biology Sectional: Genetics",
    examType: "Sectional",
    date: "Oct 22, 2023",
    score: 180,
    maxScore: 200,
    accuracy: 90,
    timeTaken: "45m",
    physicsScore: 0,
    chemScore: 0,
    bioScore: 180,
    percentile: 99.1,
    predictedRank: 850
  },
  {
    id: '3',
    examName: "NEET Full Mock #11",
    examType: "Mock",
    date: "Oct 19, 2023",
    score: 540,
    maxScore: 720,
    accuracy: 75,
    timeTaken: "185m",
    physicsScore: 120,
    chemScore: 130,
    bioScore: 290,
    percentile: 94.5,
    predictedRank: 3200
  },
  {
    id: '4',
    examName: "Physics Sectional: Optics",
    examType: "Sectional",
    date: "Oct 15, 2023",
    score: 85,
    maxScore: 180,
    accuracy: 47,
    timeTaken: "60m",
    physicsScore: 85,
    chemScore: 0,
    bioScore: 0,
    percentile: 62.0,
    predictedRank: 15400
  },
  {
    id: '5',
    examName: "NEET Full Mock #10",
    examType: "Mock",
    date: "Oct 12, 2023",
    score: 590,
    maxScore: 720,
    accuracy: 82,
    timeTaken: "178m",
    physicsScore: 135,
    chemScore: 145,
    bioScore: 310,
    percentile: 96.8,
    predictedRank: 1850
  },
  {
    id: '6',
    examName: "Chemistry Sectional: Bonding",
    examType: "Sectional",
    date: "Oct 08, 2023",
    score: 142,
    maxScore: 180,
    accuracy: 78,
    timeTaken: "52m",
    physicsScore: 0,
    chemScore: 142,
    bioScore: 0,
    percentile: 92.4,
    predictedRank: 4100
  },
  {
    id: '7',
    examName: "Practice Set: Thermodynamics",
    examType: "Practice",
    date: "Oct 05, 2023",
    score: 32,
    maxScore: 100,
    accuracy: 32,
    timeTaken: "30m",
    physicsScore: 32,
    chemScore: 0,
    bioScore: 0,
    percentile: 45.0,
    predictedRank: 42000
  },
  {
    id: '8',
    examName: "NEET Full Mock #09",
    examType: "Mock",
    date: "Oct 01, 2023",
    score: 510,
    maxScore: 720,
    accuracy: 71,
    timeTaken: "190m",
    physicsScore: 110,
    chemScore: 120,
    bioScore: 280,
    percentile: 91.2,
    predictedRank: 5800
  }
]

export default function MockHistoryPage() {
  const [typeFilter, setTypeFilter] = useState('All')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('Newest')

  const filteredAttempts = useMemo(() => {
    return MOCK_ATTEMPTS.filter(attempt => {
      const typeMatch = typeFilter === 'All' || attempt.examType === typeFilter
      const subjectMatch = subjectFilter === 'All' || (
        (subjectFilter === 'Physics' && attempt.physicsScore > 0) ||
        (subjectFilter === 'Chemistry' && attempt.chemScore > 0) ||
        (subjectFilter === 'Biology' && attempt.bioScore > 0)
      )
      return typeMatch && subjectMatch
    }).sort((a, b) => {
      if (sortOrder === 'Highest Score') return b.score - a.score
      return 0 // Default to newest (order in array)
    })
  }, [typeFilter, subjectFilter, sortOrder])

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto space-y-8 pb-32">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-primary">
                <History className="w-8 h-8" />
                <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Mock History</h1>
              </div>
              <p className="text-slate-500 text-lg font-medium">All your mock and sectional test attempts</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11">
                  <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-slate-400" /> <SelectValue placeholder="Type" /></div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Mock">Mock</SelectItem>
                  <SelectItem value="Sectional">Sectional</SelectItem>
                  <SelectItem value="Practice">Practice</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="All">All Subjects</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[160px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="Newest">Newest First</SelectItem>
                  <SelectItem value="Highest Score">Highest Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </header>

          {/* SUMMARY STRIP */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryChip label="Total Attempts" value={MOCK_HISTORY_SUMMARY.totalAttempts} icon={BarChart3} color="text-slate-600" bg="bg-slate-100" />
            <SummaryChip label="Best Score" value={`${MOCK_HISTORY_SUMMARY.bestScore}`} sub={`/ ${MOCK_HISTORY_SUMMARY.bestScoreMax}`} icon={Trophy} color="text-amber-600" bg="bg-amber-50" />
            <SummaryChip label="Avg Accuracy" value={`${MOCK_HISTORY_SUMMARY.avgAccuracy}%`} icon={Target} color="text-primary" bg="bg-primary/5" />
          </section>

          {/* LIST */}
          <section className="space-y-4">
            {filteredAttempts.map((attempt) => (
              <AttemptCard key={attempt.id} attempt={attempt} />
            ))}

            {filteredAttempts.length === 0 && (
              <div className="py-24 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] opacity-60">
                <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No matching attempts found</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </MentorLayout>
  )
}

function SummaryChip({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-1">
          <p className={cn("text-3xl font-headline font-bold", color)}>{value}</p>
          {sub && <span className="text-sm font-medium text-slate-400">{sub}</span>}
        </div>
      </div>
      <div className={cn("p-4 rounded-2xl", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
    </div>
  )
}

function AttemptCard({ attempt }: { attempt: any }) {
  const performanceColor = attempt.accuracy >= 75 ? "bg-emerald-500" : attempt.accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
  
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all group">
      <div className="flex items-stretch min-h-[160px]">
        {/* Performance Bar */}
        <div className={cn("w-1.5 shrink-0", performanceColor)} />
        
        <CardContent className="flex-1 p-6 md:p-8 space-y-6">
          {/* Top Row: Identity */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">{attempt.examName}</h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] uppercase px-2 py-0.5">
                  {attempt.examType}
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> {attempt.date}
              </p>
            </div>
            
            <div className="flex items-center gap-6 text-right">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Score</p>
                <p className="text-lg font-bold text-slate-900">{attempt.score} <span className="text-xs text-slate-300">/ {attempt.maxScore}</span></p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</p>
                <p className={cn("text-lg font-bold", attempt.accuracy >= 75 ? "text-emerald-600" : attempt.accuracy >= 50 ? "text-amber-600" : "text-rose-600")}>
                  {attempt.accuracy}%
                </p>
              </div>
              <div className="space-y-0.5 hidden md:block">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Time</p>
                <p className="text-lg font-bold text-slate-700 flex items-center justify-end gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-300" /> {attempt.timeTaken}
                </p>
              </div>
            </div>
          </div>

          {/* Subject Breakdown Mini-Row */}
          <div className="flex flex-wrap gap-2 pt-1">
            <SubjectPill label="Physics" score={attempt.physicsScore} color="bg-blue-50 text-blue-600" />
            <SubjectPill label="Chemistry" score={attempt.chemScore} color="bg-teal-50 text-teal-600" />
            <SubjectPill label="Biology" score={attempt.bioScore} color="bg-amber-50 text-amber-600" />
          </div>

          {/* Bottom Row: Competitive Metrics */}
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-slate-600">
                  Percentile: <span className="text-primary">{attempt.percentile}th</span>
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-bold text-slate-600">
                  Predicted Rank: <span className="text-slate-900">#{attempt.predictedRank}</span>
                </p>
              </div>
            </div>
            
            <Button variant="ghost" className="p-0 h-auto text-primary font-bold text-xs uppercase tracking-widest gap-2 hover:bg-transparent group/btn">
              View Analysis <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function SubjectPill({ label, score, color }: { label: string, score: number, color: string }) {
  if (score === 0) return null
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight", color)}>
      {label}: {score}
    </span>
  )
}
