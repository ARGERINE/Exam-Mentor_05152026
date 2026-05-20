
"use client"

import React, { useState, useEffect } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CalendarDays, 
  TrendingUp, 
  Zap, 
  Brain, 
  Timer, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCcw, 
  LayoutGrid, 
  AlertCircle, 
  ListTodo,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Target,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

// --- MOCK DATA ---
const MOCK_WEEKLY_PLAN = [
  {
    day: "Monday",
    short: "Mon",
    subject: "Physics",
    topics: ["Thermodynamics", "Heat Transfer"],
    time: "3.5h",
    status: "completed",
    blocks: [
      { type: "Concept Study", topic: "Thermodynamics Laws", duration: "90 min" },
      { type: "Practice", topic: "30 MCQs - Heat Engines", duration: "60 min" },
      { type: "Revision", topic: "Formula recall sheet", duration: "20 min" },
      { type: "Test", topic: "Mini simulation (15Q)", duration: "40 min" }
    ]
  },
  {
    day: "Tuesday",
    short: "Tue",
    subject: "Biology",
    topics: ["Plant Physiology", "Photosynthesis"],
    time: "3h",
    status: "current",
    blocks: [
      { type: "Concept Study", topic: "Photosynthesis Cycles", duration: "75 min" },
      { type: "Practice", topic: "40 MCQs - C3/C4 Plants", duration: "60 min" },
      { type: "Revision", topic: "Diagram Review", duration: "15 min" },
      { type: "Test", topic: "Recall Quiz", duration: "30 min" }
    ]
  },
  {
    day: "Wednesday",
    short: "Wed",
    subject: "Chemistry",
    topics: ["Organic Chemistry", "Hydrocarbons"],
    time: "4h",
    status: "pending",
    blocks: [
      { type: "Concept Study", topic: "Alkanes & Alkenes", duration: "100 min" },
      { type: "Practice", topic: "25 Conversion Problems", duration: "80 min" },
      { type: "Revision", topic: "Reagent Table", duration: "30 min" },
      { type: "Test", topic: "Functional Group Quiz", duration: "30 min" }
    ]
  },
  {
    day: "Thursday",
    short: "Thu",
    subject: "Physics",
    topics: ["Modern Physics", "Dual Nature"],
    time: "3h",
    status: "pending",
    blocks: [
      { type: "Concept Study", topic: "Photoelectric Effect", duration: "80 min" },
      { type: "Practice", topic: "20 Numerical Set", duration: "60 min" },
      { type: "Revision", topic: "Key Constant recall", duration: "10 min" },
      { type: "Test", topic: "Formula Drill", duration: "30 min" }
    ]
  },
  {
    day: "Friday",
    short: "Fri",
    subject: "Biology",
    topics: ["Human Health", "Immunity"],
    time: "3.5h",
    status: "pending",
    blocks: [
      { type: "Concept Study", topic: "Antibodies & T-cells", duration: "90 min" },
      { type: "Practice", topic: "50 MCQ marathon", duration: "70 min" },
      { type: "Revision", topic: "Disease Table", duration: "20 min" },
      { type: "Test", topic: "Mixed Subject Test", duration: "30 min" }
    ]
  },
  {
    day: "Saturday",
    short: "Sat",
    subject: "Chemistry",
    topics: ["Equilibrium", "Chemical Bonding"],
    time: "4h",
    status: "pending",
    blocks: [
      { type: "Concept Study", topic: "Ionic Equilibrium", duration: "120 min" },
      { type: "Practice", topic: "35 numerical set", duration: "60 min" },
      { type: "Revision", topic: "Logic Map", duration: "30 min" },
      { type: "Test", topic: "Conceptual Drill", duration: "30 min" }
    ]
  },
  {
    day: "Sunday",
    short: "Sun",
    subject: "Full Mock",
    topics: ["All Subjects", "Full Simulation"],
    time: "5h",
    status: "pending",
    blocks: [
      { type: "Test", topic: "Full-Length Simulation", duration: "180 min" },
      { type: "Analysis", topic: "Error Identification", duration: "60 min" },
      { type: "Revision", topic: "Strategy Pivot", duration: "60 min" }
    ]
  }
]

export default function WeeklyRoadmapPage() {
  const [isGenerated, setIsGenerated] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [selectedDayIndex, setSelectedDayIndex] = useState(1) // Tuesday as default current

  const handleGenerate = () => {
    setIsRegenerating(true)
    setTimeout(() => {
      setIsGenerated(true)
      setIsRegenerating(false)
    }, 1500)
  }

  const selectedDay = MOCK_WEEKLY_PLAN[selectedDayIndex]

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto min-h-screen relative">
        
        {/* REGENERATION OVERLAY */}
        {isRegenerating && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
            <div className="p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              <Brain className="w-16 h-16 text-primary animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-headline font-bold text-slate-900">Rebuilding your strategy...</h2>
              <p className="text-slate-500 font-medium italic">Synchronizing performance signals with syllabus weightage.</p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-10 pb-32">
          
          {/* STATE 1: EMPTY */}
          {!isGenerated ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-in fade-in zoom-in-95 duration-700">
              <Card className="max-w-md w-full border-none shadow-2xl rounded-[3rem] bg-white overflow-hidden p-10 text-center space-y-8">
                <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto">
                  <Target className="w-16 h-16 text-slate-200" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Map Your Strategy</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    We need your recent performance to generate a personalized weekly roadmap.
                  </p>
                </div>
                <div className="space-y-6">
                  <Button 
                    onClick={handleGenerate}
                    size="lg" 
                    className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 gap-3 group"
                  >
                    Generate Weekly Plan <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </Button>
                  
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="flex items-center gap-3 text-left p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Focus on weak topics</p>
                    </div>
                    <div className="flex items-center gap-3 text-left p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <LayoutGrid className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Balance subjects intelligently</p>
                    </div>
                    <div className="flex items-center gap-3 text-left p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Improve consistency</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            /* STATE 2: MAIN UI */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* TOP BAR */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-primary">
                    <CalendarDays className="w-8 h-8" />
                    <h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">Weekly Roadmap</h1>
                  </div>
                  <p className="text-slate-500 text-lg font-medium italic">Your personalized execution protocol for this cycle.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
                  <div className="px-4 border-r border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Pulse</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-2xl font-bold text-slate-900">68%</span>
                    </div>
                  </div>
                  <div className="px-4 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase px-3 py-1">
                      Improving
                    </Badge>
                  </div>
                </div>
              </header>

              {/* SECTION 1: WEEK OVERVIEW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {MOCK_WEEKLY_PLAN.map((day, i) => (
                  <Card 
                    key={i}
                    onClick={() => setSelectedDayIndex(i)}
                    className={cn(
                      "cursor-pointer transition-all duration-300 rounded-[2rem] border-2 group relative overflow-hidden",
                      selectedDayIndex === i ? "border-primary bg-primary/[0.03] shadow-xl ring-4 ring-primary/5" : "border-white bg-white hover:border-primary/20",
                      day.status === 'completed' && "bg-emerald-50/30"
                    )}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day.short}</span>
                        {day.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {day.status === 'current' && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      
                      <div className="space-y-1">
                        <p className={cn(
                          "text-sm font-bold truncate",
                          selectedDayIndex === i ? "text-primary" : "text-slate-700"
                        )}>{day.subject}</p>
                        <div className="flex flex-col gap-0.5">
                          {day.topics.map((t, idx) => (
                            <p key={idx} className="text-[10px] text-slate-400 font-medium truncate">• {t}</p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">{day.time}</span>
                        <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-primary/10 transition-colors">
                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* SECTION 2: DAILY BREAKDOWN */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <ListTodo className="w-4 h-4" />
                      {selectedDay.day} Detailed Execution
                    </h2>
                    <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3">{selectedDay.time} Allocated</Badge>
                  </div>

                  <div className="space-y-4">
                    {selectedDay.blocks.map((block, i) => (
                      <Card key={i} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-md transition-all">
                        <CardContent className="p-6 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0",
                              block.type === 'Concept Study' ? "bg-blue-50 text-blue-600" :
                              block.type === 'Practice' ? "bg-amber-50 text-amber-600" :
                              block.type === 'Revision' ? "bg-purple-50 text-purple-600" :
                              "bg-rose-50 text-rose-600"
                            )}>
                              {block.type.substring(0, 1)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{block.type}</p>
                              <h4 className="text-lg font-bold text-slate-900">{block.topic}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-10 shrink-0">
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Duration</p>
                              <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <Timer className="w-3.5 h-3.5 text-slate-300" /> {block.duration}
                              </p>
                            </div>
                            <Button size="sm" variant="ghost" className="rounded-xl h-10 w-10 p-0 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50">
                              <CheckCircle2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* RIGHT SIDEBAR: PRIORITIES & NOTES */}
                <div className="space-y-8">
                  
                  {/* SECTION 3: PRIORITY FOCUS */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> Strategic Priorities
                    </h3>
                    <div className="space-y-3">
                      <PriorityCard title="Weakest Area" value="Thermodynamics" color="text-rose-600" bg="bg-rose-50" icon={AlertCircle} />
                      <PriorityCard title="Most Improved" value="Biology" color="text-emerald-600" bg="bg-emerald-50" icon={TrendingUp} />
                      <PriorityCard title="Risk Area" value="Organic Chemistry" color="text-amber-600" bg="bg-amber-50" icon={ShieldCheck} />
                    </div>
                  </div>

                  {/* SECTION 4: STRATEGY NOTES */}
                  <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Brain className="w-32 h-32" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h4 className="text-sm font-bold uppercase tracking-widest">Mentor's Note</h4>
                      </div>
                      <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
                        "This week focuses on strengthening Physics fundamentals while maintaining Biology momentum. Chemistry requires stabilization through reaction mapping."
                      </p>
                    </div>
                  </Card>

                  {/* SECTION 5: ACTION BUTTONS */}
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={handleGenerate}
                      variant="outline" 
                      className="h-14 rounded-2xl border-slate-200 font-bold text-slate-600 hover:bg-white transition-all gap-2"
                    >
                      <RefreshCcw className="w-4 h-4" /> Regenerate Roadmap
                    </Button>
                    <Button className="h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2">
                      Mark Today Complete <CheckCircle2 className="w-4 h-4" />
                    </Button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </MentorLayout>
  )
}

function PriorityCard({ title, value, color, bg, icon: Icon }: any) {
  return (
    <Card className="border-none shadow-sm bg-white p-5 rounded-[1.5rem] overflow-hidden group hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110", bg)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-base font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}
