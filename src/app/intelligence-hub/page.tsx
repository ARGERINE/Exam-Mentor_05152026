"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Zap, 
  Binary,
  Code,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_SIGNALS = [
  {
    id: '1',
    type: 'Weakness',
    category: 'LEARNING',
    title: "Thermodynamics is Weak",
    description: "Accuracy below 45% in recent tests",
    severity: 'High',
    icon: AlertTriangle
  },
  {
    id: '2',
    type: 'Consistency',
    category: 'TEST',
    title: "Inconsistent Scores",
    description: "High variation across last 5 tests",
    severity: 'Medium',
    icon: Activity
  },
  {
    id: '3',
    type: 'Improvement',
    category: 'STRATEGY',
    title: "Biology Improving",
    description: "Accuracy increased by 12% this week",
    severity: 'Low',
    icon: TrendingUp
  },
  {
    id: '4',
    type: 'Risk',
    category: 'PSYCH',
    title: "Accuracy Dropping",
    description: "Decline observed in last 3 tests",
    severity: 'High',
    icon: Zap
  }
]

export default function IntelligenceHubPage() {
  const [activeTab, setActiveTab] = useState('ALL')
  const [isDebugMode, setIsDebugMode] = useState(false)

  const filteredSignals = MOCK_SIGNALS.filter(signal => 
    activeTab === 'ALL' || signal.category === activeTab
  )

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <Binary className="w-8 h-8" />
                <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Intelligence Hub</h1>
              </div>
              <p className="text-slate-500 text-lg font-medium">Inspecting the cognitive signals driving your performance</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="debug-mode" 
                    checked={isDebugMode} 
                    onCheckedChange={setIsDebugMode} 
                  />
                  <Label htmlFor="debug-mode" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-pointer">Debug Mode</Label>
                </div>
              </div>
            </div>
          </header>

          <Tabs defaultValue="ALL" onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white p-1 h-12 rounded-xl border border-slate-200 shadow-sm mb-8 inline-flex">
              <TabsTrigger value="ALL" className="rounded-lg px-6 text-xs font-bold uppercase tracking-wider">All</TabsTrigger>
              <TabsTrigger value="LEARNING" className="rounded-lg px-6 text-xs font-bold uppercase tracking-wider">Learning</TabsTrigger>
              <TabsTrigger value="TEST" className="rounded-lg px-6 text-xs font-bold uppercase tracking-wider">Test</TabsTrigger>
              <TabsTrigger value="PSYCH" className="rounded-lg px-6 text-xs font-bold uppercase tracking-wider">Psych</TabsTrigger>
              <TabsTrigger value="STRATEGY" className="rounded-lg px-6 text-xs font-bold uppercase tracking-wider">Strategy</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSignals.map((signal) => (
                <Card 
                  key={signal.id} 
                  className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 rounded-[2rem] overflow-hidden group border border-slate-100"
                >
                  <CardContent className="p-7 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className={cn(
                        "p-3.5 rounded-2xl transition-transform group-hover:scale-110",
                        signal.severity === 'High' ? "bg-rose-50 text-rose-500" :
                        signal.severity === 'Medium' ? "bg-amber-50 text-amber-500" :
                        "bg-emerald-50 text-emerald-500"
                      )}>
                        <signal.icon className="w-6 h-6" />
                      </div>
                      <Badge className={cn(
                        "border-none font-bold text-[9px] uppercase px-3 py-1 rounded-lg",
                        signal.severity === 'High' ? "bg-rose-100 text-rose-600" :
                        signal.severity === 'Medium' ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      )}>
                        {signal.severity} Priority
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors tracking-tight">{signal.title}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{signal.description}"</p>
                    </div>

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{signal.type} Signal</span>
                      <div className="flex items-center gap-1.5 text-primary opacity-60">
                        <Info className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase">Source: Engine</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredSignals.length === 0 && (
                <div className="col-span-full py-32 text-center space-y-4 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] opacity-60">
                  <Binary className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-slate-900 font-bold uppercase tracking-widest text-sm">No signals detected</p>
                    <p className="text-slate-500 text-xs font-medium">Take more tests to activate competitive intelligence.</p>
                  </div>
                </div>
              )}
            </div>
          </Tabs>

          {isDebugMode && (
            <Card className="border-none shadow-2xl bg-slate-900 text-white rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="border-b border-white/10 px-10 py-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Code className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-xl uppercase tracking-[0.2em] font-bold">Engine Debug Console</CardTitle>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Raw Signal Stream v1.2.0</p>
                  </div>
                </div>
                <div className="flex gap-10">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Score</p>
                    <p className="text-2xl font-headline font-bold text-emerald-400">540</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accuracy</p>
                    <p className="text-2xl font-headline font-bold text-emerald-400">64%</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="bg-black/40 rounded-3xl p-8 border border-white/5 font-mono text-[12px] text-emerald-400/80 overflow-auto max-h-[400px] custom-scrollbar shadow-inner">
                  <pre className="leading-relaxed">{JSON.stringify({
                    signals: MOCK_SIGNALS,
                    activeFilter: activeTab,
                    timestamp: new Date().toISOString(),
                    engineContext: "NEET_HIGH_FIDELITY",
                    activeBuffers: ["CHAPTER_MASTER_SYNC", "PSYCH_STABILITY_POLL"]
                  }, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </MentorLayout>
  )
}
