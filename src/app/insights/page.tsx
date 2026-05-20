"use client"

import React, { useState, useEffect } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { 
  TrendingUp, 
  Target, 
  ClipboardCheck, 
  Activity, 
  AlertTriangle,
  ArrowUpRight,
  Info,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock Data Definitions
const SUMMARY_DATA = [
  { label: "Avg Score", value: "540", sub: "/ 720", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Accuracy", value: "64%", sub: "+2% vs last", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Tests Taken", value: "12", sub: "Last 30 days", icon: ClipboardCheck, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Performance", value: "Moderate", sub: "Stabilizing", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
]

const TREND_DATA = [
  { day: "Mon", score: 480 },
  { day: "Tue", score: 520 },
  { day: "Wed", score: 500 },
  { day: "Thu", score: 560 },
  { day: "Fri", score: 590 },
  { day: "Sat", score: 610 },
  { day: "Sun", score: 630 }
]

const SUBJECT_DATA = [
  { subject: "Physics", accuracy: 58, color: "hsl(var(--chart-1))" },
  { subject: "Chemistry", accuracy: 62, color: "hsl(var(--chart-2))" },
  { subject: "Biology", accuracy: 71, color: "hsl(var(--chart-4))" },
]

const WEAK_TOPICS = [
  { name: "Thermodynamics", accuracy: 42 },
  { name: "Electrochemistry", accuracy: 48 },
  { name: "Mechanics", accuracy: 50 },
  { name: "Organic Chemistry", accuracy: 52 },
  { name: "Genetics", accuracy: 55 },
]

const trendChartConfig = {
  score: { label: "Mock Score", color: "hsl(var(--primary))" }
} satisfies ChartConfig

const subjectChartConfig = {
  accuracy: { label: "Accuracy %", color: "hsl(var(--primary))" }
} satisfies ChartConfig

export default function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [hasData] = useState(true) // Switch to false to test empty state

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!hasData) {
    return (
      <MentorLayout>
        <main className="flex-1 p-12 flex items-center justify-center bg-slate-50/30">
          <div className="text-center space-y-6 max-w-sm">
            <div className="p-6 bg-white rounded-full w-fit mx-auto shadow-sm border border-slate-100">
              <Activity className="w-12 h-12 text-slate-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">No Analytics Available</h2>
              <p className="text-slate-500 font-medium">
                No performance data yet. Start your first test to unlock diagnostic insights.
              </p>
            </div>
          </div>
        </main>
      </MentorLayout>
    )
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
          
          <header className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Performance Insights</h1>
            <p className="text-slate-500 text-lg">Real-time diagnostic snapshot of your preparation trajectory.</p>
          </header>

          {/* SECTION 1: SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
            ) : (
              SUMMARY_DATA.map((card, i) => (
                <Card key={i} className="border-none shadow-sm rounded-3xl bg-white p-6 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div className={cn("p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform", card.bg)}>
                      <card.icon className={cn("w-6 h-6", card.color)} />
                    </div>
                    <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none font-bold text-[9px] uppercase tracking-widest">{card.label}</Badge>
                  </div>
                  <div className="space-y-1 relative z-10">
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-3xl font-headline font-bold text-slate-900">{card.value}</h4>
                      <span className="text-xs font-bold text-slate-400">{card.sub}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* SECTION 2: PERFORMANCE TREND */}
            <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100">
              <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Mock Performance Trend
                  </CardTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Last 7 Full Simulations</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <Info className="w-4 h-4 text-slate-300" />
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                ) : (
                  <div className="h-[300px] w-full">
                    <ChartContainer config={trendChartConfig} className="h-full w-full">
                      <LineChart data={TREND_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 12, fontWeight: 600, fill: 'hsl(var(--muted-foreground))'}} 
                        />
                        <YAxis hide domain={[400, 700]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="var(--color-score)" 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: "white", strokeWidth: 3, stroke: "var(--color-score)" }} 
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECTION 3: SUBJECT STRENGTH */}
            <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100">
              <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  Subject Mastery
                </CardTitle>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Accuracy Ratio (%)</p>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <Skeleton className="h-[300px] w-full rounded-2xl" />
                ) : (
                  <div className="h-[300px] w-full">
                    <ChartContainer config={subjectChartConfig} className="h-full w-full">
                      <BarChart data={SUBJECT_DATA} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="subject" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fontSize: 11, fontWeight: 700}} 
                        />
                        <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fontSize: 10}} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} barSize={40}>
                          {SUBJECT_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SECTION 4: WEAK TOPICS LIST */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h3 className="text-2xl font-headline font-bold text-slate-900 flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  Weak Topics Diagnostic
                </h3>
                <p className="text-sm text-slate-500 font-medium">Prioritize these chapters to maximize score recovery.</p>
              </div>
              <Badge className="bg-rose-50 text-rose-600 border-none px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">Action Required</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-3xl" />)
              ) : (
                WEAK_TOPICS.map((topic, i) => (
                  <Card key={i} className="border-none shadow-sm bg-white rounded-3xl p-6 group hover:shadow-md transition-all">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors">{topic.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact: High</p>
                        </div>
                        <span className="text-sm font-black text-rose-500">{topic.accuracy}%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              topic.accuracy < 45 ? "bg-rose-500" : "bg-amber-400"
                            )} 
                            style={{ width: `${topic.accuracy}%` }} 
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span>Conceptual Gap</span>
                          <span className="flex items-center gap-1">Fix Now <ChevronRight className="w-2 h-2" /></span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
              
              {!loading && (
                <Card className="border-2 border-dashed border-slate-200 bg-transparent rounded-3xl flex flex-col items-center justify-center p-8 space-y-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer group">
                  <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 group-hover:text-primary">View Full Remedial Hub</p>
                </Card>
              )}
            </div>
          </section>

        </div>
      </main>
    </MentorLayout>
  )
}
