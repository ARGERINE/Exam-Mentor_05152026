
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer
} from 'recharts'
import { 
  Target, 
  TrendingUp, 
  Activity,
  History,
  ShieldCheck,
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const PERF_DATA = { predictedRank: 1245, rankBandLow: 1100, rankBandHigh: 1400, confidence: 94, percentile: 99.2, estimatedScore: 612, lastUpdated: "Oct 24, 2023" }
const TREND_DATA = [ { week: 'W1', rank: 2800 }, { week: 'W2', rank: 2500 }, { week: 'W3', rank: 2650 }, { week: 'W4', rank: 2100 }, { week: 'W5', rank: 1900 }, { week: 'W6', rank: 1600 }, { week: 'W7', rank: 1450 }, { week: 'W8', rank: 1245 } ]
const FACTORS = { 
  positive: [ { label: "Biology Accuracy", impact: "+12% this month" }, { label: "Consistent Focus", impact: "45min avg sessions" } ],
  negative: [ { label: "Physics Skipped Qs", impact: "Increased by 8%" }, { label: "Mock #12 Speed", impact: "Latency in Chemistry" } ],
  neutral: [ { label: "Study Hours", impact: "5.5h / day avg" } ]
}

export default function RankPredictorPage() {
  const [sliderPhysics, setSliderPhysics] = useState(62)
  const [sliderChem, setSliderChem] = useState(74)
  const [sliderBio, setSliderBio] = useState(88)

  const simulation = useMemo(() => {
    const baseRank = PERF_DATA.predictedRank
    const totalDelta = Math.round((sliderPhysics - 62) * 8 + (sliderChem - 74) * 12 + (sliderBio - 88) * 15)
    return { newRank: Math.max(1, baseRank - totalDelta), rankDelta: baseRank - Math.max(1, baseRank - totalDelta) }
  }, [sliderPhysics, sliderChem, sliderBio])

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto space-y-10 pb-32">
          <header className="space-y-1"><h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Rank Predictor</h1><p className="text-slate-500 text-lg font-medium">AI-estimated rank based on your accuracy, speed, and exam history</p></header>
          <Card className="border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden relative"><div className="absolute top-0 right-0 p-12 opacity-5"><Target className="w-64 h-64 text-primary" /></div><CardContent className="p-10 md:p-16 flex flex-col items-center text-center space-y-10 relative z-10"><div className="space-y-4"><Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 font-bold text-[10px] uppercase tracking-[0.2em] rounded-full"><ShieldCheck className="w-3.5 h-3.5 mr-2" /> Intelligence Core Verified</Badge><div className="relative inline-block"><div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping scale-125 opacity-20" /><div className="relative bg-white p-8 rounded-full"><h2 className="text-7xl md:text-8xl font-headline font-bold text-slate-900 tracking-tighter">#{PERF_DATA.predictedRank.toLocaleString()}</h2></div></div><div className="space-y-2"><p className="text-xl font-headline font-bold text-slate-400 uppercase tracking-widest">Predicted Rank</p><p className="text-slate-500 font-medium italic">Rank Band: <span className="text-slate-900 font-bold">#{PERF_DATA.rankBandLow.toLocaleString()} – #{PERF_DATA.rankBandHigh.toLocaleString()}</span></p></div></div><div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl pt-10 border-t border-slate-50"><HeroStat label="Confidence" value={`${PERF_DATA.confidence}%`} icon={Brain} /><HeroStat label="Percentile" value={`${PERF_DATA.percentile}th`} icon={TrendingUp} /><HeroStat label="Est. Score" value={`${PERF_DATA.estimatedScore}`} icon={Activity} /><HeroStat label="Last Updated" value={PERF_DATA.lastUpdated} icon={History} /></div></CardContent></Card>
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100"><CardHeader className="p-8 border-b flex flex-row items-center justify-between"><div className="space-y-1"><CardTitle className="text-xl font-headline font-bold">Rank Trend Over Last 8 Weeks</CardTitle><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tracking competitive trajectory</p></div></CardHeader><CardContent className="p-10"><div className="h-[350px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={TREND_DATA}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} /><YAxis reversed axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} /><RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none'}} /><Line type="monotone" dataKey="rank" stroke="#3973AC" strokeWidth={4} dot={{r: 4, fill: 'white', stroke: '#3973AC', strokeWidth: 2}} /></LineChart></ResponsiveContainer></div></CardContent></Card>
          <section className="space-y-6"><h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] px-2">What's Affecting Your Rank</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FactorColumn title="Positive Factors" items={FACTORS.positive} color="emerald" icon={CheckCircle2} /><FactorColumn title="Negative Factors" items={FACTORS.negative} color="rose" icon={AlertTriangle} /><FactorColumn title="Neutral Drivers" items={FACTORS.neutral} color="slate" icon={Info} /></div></section>
          <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[3rem] overflow-hidden"><CardHeader className="p-10 pb-4"><CardTitle className="text-2xl font-headline font-bold flex items-center gap-3"><Zap className="w-6 h-6 text-amber-400 fill-current" />Score Simulator — What if?</CardTitle></CardHeader><CardContent className="p-10 space-y-12"><div className="grid grid-cols-1 md:grid-cols-2 gap-16"><div className="space-y-10"><SimSlider label="Physics Accuracy" value={sliderPhysics} onChange={setSliderPhysics} color="bg-blue-400" /><SimSlider label="Chemistry Accuracy" value={sliderChem} onChange={setSliderChem} color="bg-teal-400" /><SimSlider label="Biology Accuracy" value={sliderBio} onChange={setSliderBio} color="bg-amber-400" /></div><div className="flex flex-col justify-center items-center text-center space-y-8 p-10 bg-white/5 rounded-[2.5rem] border border-white/10 relative overflow-hidden"><div className="space-y-2 relative z-10"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulated Projection</p><h4 className="text-6xl font-headline font-bold text-white tracking-tighter">#{simulation.newRank.toLocaleString()}</h4></div><div className={cn("px-6 py-3 rounded-2xl font-bold text-sm relative z-10 flex items-center gap-2", simulation.rankDelta > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400")}>{simulation.rankDelta > 0 ? <><TrendingUp className="w-4 h-4" /> Rank Improvement: {simulation.rankDelta.toLocaleString()} Slots</> : "No Change"}</div></div></div></CardContent></Card>
        </div>
      </main>
    </MentorLayout>
  )
}

function HeroStat({ label, value, icon: Icon }: any) { return (<div className="space-y-2 text-center md:text-left"><div className="flex items-center justify-center md:justify-start gap-2 text-slate-400"><Icon className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase tracking-widest">{label}</span></div><p className="text-2xl font-headline font-bold text-slate-900">{value}</p></div>) }
function FactorColumn({ title, items, color, icon: Icon }: any) { const colorMap: any = { emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", rose: "bg-rose-50 text-rose-600 border-rose-100", slate: "bg-slate-50 text-slate-600 border-slate-100" }; return (<div className="space-y-4"><div className="flex items-center gap-2 px-1"><Icon className={cn("w-4 h-4", color === 'emerald' ? 'text-emerald-500' : color === 'rose' ? 'text-rose-500' : 'text-slate-400')} /><h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</h4></div><div className="space-y-3">{items.map((item: any, i: number) => (<Card key={i} className={cn("border-none shadow-sm rounded-2xl p-5", colorMap[color])}><p className="text-xs font-bold mb-1">{item.label}</p><p className="text-[11px] font-medium opacity-80 italic">{item.impact}</p></Card>))}</div></div>) }
function SimSlider({ label, value, onChange, color }: any) { return (<div className="space-y-4"><div className="flex justify-between items-end"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p><span className="text-lg font-bold text-white">{value}%</span></div><Slider value={[value]} onValueChange={([val]) => onChange(val)} max={100} min={0} step={1} className={cn("py-4", color)} /></div>) }
