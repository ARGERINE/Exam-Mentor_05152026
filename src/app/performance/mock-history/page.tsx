
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
  Trophy, 
  Target, 
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_HISTORY_SUMMARY = { totalAttempts: 24, bestScore: 685, bestScoreMax: 720, avgAccuracy: 72 }
const MOCK_ATTEMPTS = [
  { id: '1', examName: "NEET Full Mock #12", examType: "Mock", date: "Oct 24, 2023", score: 610, maxScore: 720, accuracy: 85, timeTaken: "172m", physicsScore: 145, chemScore: 155, bioScore: 310, percentile: 98.2, predictedRank: 1240 },
  { id: '2', examName: "Biology Sectional: Genetics", examType: "Sectional", date: "Oct 22, 2023", score: 180, maxScore: 200, accuracy: 90, timeTaken: "45m", physicsScore: 0, chemScore: 0, bioScore: 180, percentile: 99.1, predictedRank: 850 },
  { id: '3', examName: "NEET Full Mock #11", examType: "Mock", date: "Oct 19, 2023", score: 540, maxScore: 720, accuracy: 75, timeTaken: "185m", physicsScore: 120, chemScore: 130, bioScore: 290, percentile: 94.5, predictedRank: 3200 },
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
    }).sort((a, b) => sortOrder === 'Highest Score' ? b.score - a.score : 0)
  }, [typeFilter, subjectFilter, sortOrder])

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto space-y-8 pb-32">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-primary"><History className="w-8 h-8" /><h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Mock History</h1></div>
              <p className="text-slate-500 text-lg font-medium">All your mock and sectional test attempts</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[140px] rounded-xl bg-white shadow-sm font-bold text-xs h-11"><div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-slate-400" /><SelectValue placeholder="Type" /></div></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="All">All Types</SelectItem><SelectItem value="Mock">Mock</SelectItem><SelectItem value="Sectional">Sectional</SelectItem></SelectContent></Select>
              <Select value={sortOrder} onValueChange={setSortOrder}><SelectTrigger className="w-[160px] rounded-xl bg-white shadow-sm font-bold text-xs h-11"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="Newest">Newest First</SelectItem><SelectItem value="Highest Score">Highest Score</SelectItem></SelectContent></Select>
            </div>
          </header>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryChip label="Total Attempts" value={MOCK_HISTORY_SUMMARY.totalAttempts} icon={BarChart3} color="text-slate-600" bg="bg-slate-100" />
            <SummaryChip label="Best Score" value={`${MOCK_HISTORY_SUMMARY.bestScore}`} sub={`/ ${MOCK_HISTORY_SUMMARY.bestScoreMax}`} icon={Trophy} color="text-amber-600" bg="bg-amber-50" />
            <SummaryChip label="Avg Accuracy" value={`${MOCK_HISTORY_SUMMARY.avgAccuracy}%`} icon={Target} color="text-primary" bg="bg-primary/5" />
          </section>
          <section className="space-y-4">
            {filteredAttempts.map((attempt) => (<AttemptCard key={attempt.id} attempt={attempt} />))}
          </section>
        </div>
      </main>
    </MentorLayout>
  )
}

function SummaryChip({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
      <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p><div className="flex items-baseline gap-1"><p className={cn("text-3xl font-headline font-bold", color)}>{value}</p>{sub && <span className="text-sm font-medium text-slate-400">{sub}</span>}</div></div>
      <div className={cn("p-4 rounded-2xl", bg)}><Icon className={cn("w-6 h-6", color)} /></div>
    </div>
  )
}

function AttemptCard({ attempt }: { attempt: any }) {
  const performanceColor = attempt.accuracy >= 75 ? "bg-emerald-500" : attempt.accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all">
      <div className="flex items-stretch min-h-[160px]"><div className={cn("w-1.5 shrink-0", performanceColor)} />
        <CardContent className="flex-1 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1"><div className="flex items-center gap-3"><h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">{attempt.examName}</h3><Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] uppercase px-2 py-0.5">{attempt.examType}</Badge></div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {attempt.date}</p></div>
            <div className="flex items-center gap-6 text-right"><div className="space-y-0.5"><p className="text-[9px] font-bold text-slate-400 uppercase">Score</p><p className="text-lg font-bold text-slate-900">{attempt.score} <span className="text-xs text-slate-300">/ {attempt.maxScore}</span></p></div><div className="space-y-0.5"><p className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</p><p className={cn("text-lg font-bold", attempt.accuracy >= 75 ? "text-emerald-600" : attempt.accuracy >= 50 ? "text-amber-600" : "text-rose-600")}>{attempt.accuracy}%</p></div><div className="space-y-0.5 hidden md:block"><p className="text-[9px] font-bold text-slate-400 uppercase">Time</p><p className="text-lg font-bold text-slate-700 flex items-center justify-end gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-300" /> {attempt.timeTaken}</p></div></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-8"><div className="flex items-center gap-2.5"><TrendingUp className="w-4 h-4 text-primary" /><p className="text-xs font-bold text-slate-600">Percentile: <span className="text-primary">{attempt.percentile}th</span></p></div><div className="flex items-center gap-2.5"><Target className="w-4 h-4 text-emerald-500" /><p className="text-xs font-bold text-slate-600">Predicted Rank: <span className="text-slate-900">#{attempt.predictedRank}</span></p></div></div>
            <Button variant="ghost" className="p-0 h-auto text-primary font-bold text-xs uppercase tracking-widest gap-2 hover:bg-transparent group/btn">View Analysis <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" /></Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
