
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  Target, 
  ClipboardList, 
  History, 
  Activity, 
  Zap, 
  Brain, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * PerformanceOverviewPage
 * The primary analytics dashboard consolidating accuracy, rank, and behavioral signals.
 */

// --- Mock Data ---
const PERF_SUMMARY = {
  overallAccuracy: 68,
  accuracyDelta: 4.2,
  predictedRank: 1245,
  rankBand: "Top 2%",
  totalExams: 24,
  examsThisPeriod: 6,
  revisionScore: 82
}

const SUBJECTS_DATA = [
  {
    name: 'Physics',
    accuracy: 62,
    totalQuestions: 450,
    easyAccuracy: 85,
    mediumAccuracy: 58,
    hardAccuracy: 32,
    weakestChapter: 'Thermodynamics',
    strongestChapter: 'Electrostatics',
    color: '#3973AC'
  },
  {
    name: 'Chemistry',
    accuracy: 74,
    totalQuestions: 510,
    easyAccuracy: 92,
    mediumAccuracy: 72,
    hardAccuracy: 48,
    weakestChapter: 'Equilibrium',
    strongestChapter: 'Chemical Bonding',
    color: '#0f6e56'
  },
  {
    name: 'Biology',
    accuracy: 88,
    totalQuestions: 920,
    easyAccuracy: 96,
    mediumAccuracy: 84,
    hardAccuracy: 71,
    weakestChapter: 'Plant Kingdom',
    strongestChapter: 'Genetics',
    color: '#854f0b'
  }
]

const TREND_DATA = [
  { date: 'Oct 17', Physics: 55, Chemistry: 68, Biology: 80 },
  { date: 'Oct 18', Physics: 58, Chemistry: 70, Biology: 82 },
  { date: 'Oct 19', Physics: 54, Chemistry: 72, Biology: 85 },
  { date: 'Oct 20', Physics: 60, Chemistry: 71, Biology: 83 },
  { date: 'Oct 21', Physics: 62, Chemistry: 74, Biology: 88 },
  { date: 'Oct 22', Physics: 61, Chemistry: 73, Biology: 87 },
  { date: 'Oct 23', Physics: 64, Chemistry: 75, Biology: 89 },
  { date: 'Oct 24', Physics: 62, Chemistry: 74, Biology: 88 },
]

const QTYPE_DATA = [
  { name: 'Single Correct', accuracy: 82 },
  { name: 'Multi Correct', accuracy: 55 },
  { name: 'Assertion-Reason', accuracy: 48 },
  { name: 'Match Column', accuracy: 72 },
  { name: 'Numerical', accuracy: 64 },
]

const HEATMAP_DATA = [
  { name: 'Kinematics', accuracy: 85 },
  { name: 'Laws of Motion', accuracy: 78 },
  { name: 'Work Energy', accuracy: 42 },
  { name: 'Thermodynamics', accuracy: 35 },
  { name: 'Electrostatics', accuracy: 88 },
  { name: 'Genetics', accuracy: 92 },
  { name: 'Plant Cell', accuracy: 76 },
  { name: 'Bonding', accuracy: 81 },
  { name: 'Equilibrium', accuracy: 44 },
  { name: 'Optics', accuracy: 58 },
  { name: 'Modern Physics', accuracy: 67 },
  { name: 'Hydrocarbons', accuracy: 52 },
  { name: 'Immunity', accuracy: 84 },
  { name: 'Photosynthesis', accuracy: 73 },
  { name: 'Respiration', accuracy: 38 },
]

export default function PerformanceOverviewPage() {
  const [timeRange, setTimeRange] = useState('Last 7 days')

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-10 pb-32">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Performance</h1>
              <p className="text-slate-500 text-lg font-medium">Your complete academic profile at a glance</p>
            </div>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                <SelectItem value="All Time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </header>

          {/* ROW 1: KPI STRIP */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              label="Overall Accuracy" 
              value={`${PERF_SUMMARY.overallAccuracy}%`} 
              detail={`${PERF_SUMMARY.accuracyDelta > 0 ? '+' : ''}${PERF_SUMMARY.accuracyDelta}% vs last period`}
              icon={Activity}
              color="text-primary"
              isPositive={PERF_SUMMARY.accuracyDelta > 0}
            />
            <KPICard 
              label="Predicted Rank" 
              value={`#${PERF_SUMMARY.predictedRank}`} 
              detail={`Band: ${PERF_SUMMARY.rankBand}`}
              icon={Target}
              color="text-emerald-600"
            />
            <KPICard 
              label="Exams Taken" 
              value={PERF_SUMMARY.totalExams} 
              detail={`This period: ${PERF_SUMMARY.examsThisPeriod}`}
              icon={ClipboardList}
              color="text-blue-600"
            />
            <KPICard 
              label="Revision Score" 
              value={`${PERF_SUMMARY.revisionScore}/100`} 
              detail="Memory health indicator"
              icon={Brain}
              color="text-amber-600"
            />
          </section>

          {/* ROW 2: SUBJECT BREAKDOWN */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {SUBJECTS_DATA.map((subject) => (
              <SubjectCard key={subject.name} subject={subject} />
            ))}
          </section>

          {/* ROW 3: TRENDS & BREAKDOWN */}
          <section className="grid grid-cols-1 lg:grid-cols-10 gap-8">
            {/* Accuracy Trend Chart */}
            <Card className="lg:col-span-6 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden border border-slate-100">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-headline font-bold">Accuracy Over Time</CardTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cross-subject progression map</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} 
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} 
                      />
                      <RechartsTooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle"
                        wrapperStyle={{paddingBottom: '20px', fontSize: '11px', fontWeight: 700}}
                      />
                      <Line type="monotone" dataKey="Physics" stroke="#3973AC" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6}} />
                      <Line type="monotone" dataKey="Chemistry" stroke="#0f6e56" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6}} />
                      <Line type="monotone" dataKey="Biology" stroke="#854f0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: 'white'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Question Type Breakdown */}
            <Card className="lg:col-span-4 border-none shadow-sm bg-white rounded-[2rem] overflow-hidden border border-slate-100">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-xl font-headline font-bold">Performance by Question Type</CardTitle>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Efficiency per taxonomy</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={QTYPE_DATA} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} 
                        width={100}
                      />
                      <RechartsTooltip 
                         cursor={{fill: '#f8fafc'}}
                         contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)'}}
                      />
                      <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                        {QTYPE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.accuracy > 70 ? '#10b981' : entry.accuracy > 50 ? '#f59e0b' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ROW 4: HEATMAP STRIP */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Chapter Accuracy Heatmap
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-emerald-500" /> &gt;70%</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-amber-500" /> 40-70%</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-rose-500" /> &lt;40%</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-2 min-w-max">
                  {HEATMAP_DATA.map((chapter, i) => (
                    <div key={i} className="group relative">
                      <div className={cn(
                        "w-12 h-12 rounded-xl transition-all duration-300 cursor-help",
                        chapter.accuracy > 70 ? "bg-emerald-500/10 hover:bg-emerald-500" :
                        chapter.accuracy > 40 ? "bg-amber-500/10 hover:bg-amber-500" :
                        "bg-rose-500/10 hover:bg-rose-500"
                      )} />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 text-white rounded-xl text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{chapter.name}</p>
                        <p className="text-xl font-bold">{chapter.accuracy}%</p>
                        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </MentorLayout>
  )
}

function KPICard({ label, value, detail, icon: Icon, color, isPositive }: any) {
  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white p-6 flex items-center gap-5 group hover:shadow-md transition-shadow border border-slate-100">
      <div className={cn("p-4 rounded-[1.5rem] shrink-0 transition-transform group-hover:scale-110", color.replace('text', 'bg').concat('/10'))}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <h4 className="text-2xl font-headline font-bold text-slate-900">{value}</h4>
        <div className="flex items-center gap-1">
          {isPositive !== undefined && (
            isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />
          )}
          <p className={cn("text-[10px] font-bold", isPositive === true ? "text-emerald-500" : isPositive === false ? "text-rose-500" : "text-slate-400")}>
            {detail}
          </p>
        </div>
      </div>
    </Card>
  )
}

function SubjectCard({ subject }: { subject: any }) {
  const radius = 32
  const circ = 2 * Math.PI * radius
  const offset = circ - (subject.accuracy / 100) * circ

  return (
    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-md transition-all group">
      <CardContent className="p-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-headline font-bold text-slate-900 group-hover:text-primary transition-colors">{subject.name}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{subject.totalQuestions} Questions solved</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90 transform">
              <circle cx="40" cy="40" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
              <circle 
                cx="40" cy="40" r={radius} fill="transparent" 
                stroke={subject.color} strokeWidth="6" 
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-sm text-slate-800">
              {subject.accuracy}%
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Difficulty Breakdown</p>
            <div className="flex gap-1.5 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400" style={{width: `${subject.easyAccuracy}%`}} />
              <div className="h-full bg-amber-400" style={{width: `${subject.mediumAccuracy}%`}} />
              <div className="h-full bg-rose-400" style={{width: `${subject.hardAccuracy}%`}} />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
              <span>Easy {subject.easyAccuracy}%</span>
              <span>Med {subject.mediumAccuracy}%</span>
              <span>Hard {subject.hardAccuracy}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
              <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Strongest</p>
              <p className="text-[11px] font-bold text-slate-700 truncate">{subject.strongestChapter}</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
              <p className="text-[8px] font-bold text-rose-600 uppercase tracking-widest mb-1">Weakest</p>
              <p className="text-[11px] font-bold text-slate-700 truncate">{subject.weakestChapter}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
