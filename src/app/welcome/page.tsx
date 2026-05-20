
"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  BrainCircuit, 
  Zap, 
  Target, 
  Activity, 
  ShieldCheck, 
  ClipboardList, 
  History, 
  Binary, 
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white text-slate-900 font-body selection:bg-primary/10">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <Badge variant="outline" className="py-1 px-4 border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-widest rounded-full animate-in fade-in slide-in-from-bottom-2 duration-700">
                <Sparkles className="w-3.5 h-3.5 mr-2" /> The Intelligent Prep Revolution
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-headline font-bold tracking-tight text-slate-900 leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                Stop Studying Blind.<br />
                <span className="text-primary">Start Studying Smart.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                ExamMentor analyzes your performance, identifies hidden weaknesses, and builds a personalized strategy to maximize your competitive rank.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/setup')}
                  className="h-16 px-10 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/20 group"
                >
                  Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-16 px-10 rounded-2xl text-lg font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  See How It Works
                </Button>
              </div>
            </div>

            <div className="flex-1 relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                {/* Abstract AI Visual */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] rotate-6 scale-95 blur-3xl opacity-50 animate-pulse" />
                <div className="relative h-full w-full bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden flex items-center justify-center">
                  <div className="p-12 space-y-8 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-primary" />
                      </div>
                      <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-2/3 animate-[loading_2s_infinite]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-slate-50 rounded-lg" />
                      <div className="h-4 w-5/6 bg-slate-50 rounded-lg" />
                      <div className="h-4 w-4/6 bg-slate-50 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="h-24 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center p-4">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Accuracy</span>
                        <span className="text-2xl font-bold text-emerald-700">92%</span>
                      </div>
                      <div className="h-24 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center p-4">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">Confidence</span>
                        <span className="text-2xl font-bold text-blue-700">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUE SECTION */}
      <section className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ValueBlock 
              icon={Binary} 
              title="Intelligent Analysis" 
              desc="Every test you take reveals patterns. We decode your behavior, accuracy, and retrieval speed to understand your cognitive limits."
            />
            <ValueBlock 
              icon={Zap} 
              title="Adaptive Strategy" 
              desc="Your study plan is a living system. It evolves based on your daily performance, ensuring you're always working on what matters most."
            />
            <ValueBlock 
              icon={Target} 
              title="Focused Improvement" 
              desc="We eliminate wasted effort by targeting specific conceptual gaps and behavioral leaks directly, cutting your prep time by 30%."
            />
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-32">
        <div className="container mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">How ExamMentor Works</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto italic">"A structured protocol for high-performance preparation."</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block" />
            
            <StepItem 
              step="1" 
              icon={ClipboardList} 
              title="Take Tests" 
              desc="Attempt high-fidelity mock simulations." 
            />
            <StepItem 
              step="2" 
              icon={Activity} 
              title="Deep Analysis" 
              desc="System maps your behavioral signals." 
            />
            <StepItem 
              step="3" 
              icon={CalendarCheck} 
              title="Generate Plan" 
              desc="AI builds your next weekly roadmap." 
            />
            <StepItem 
              step="4" 
              icon={TrendingUp} 
              title="Improve Rank" 
              desc="Watch your predicted percentile climb." 
            />
          </div>
        </div>
      </section>

      {/* 4. PRODUCT FEATURES GRID */}
      <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-24 opacity-5 rotate-12">
          <BrainCircuit className="w-[600px] h-[600px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10 space-y-20">
          <div className="max-w-2xl space-y-4">
            <Badge className="bg-primary text-white border-none font-bold px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">The Feature Engine</Badge>
            <h2 className="text-4xl font-headline font-bold tracking-tight">Full-Stack Competitive Intelligence.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Activity} 
              title="Mock Analysis" 
              desc="Reconstruct every test attempt to find fatigue zones and strategy leaks." 
            />
            <FeatureCard 
              icon={BrainCircuit} 
              title="Weakness Lab" 
              desc="A diagnostic laboratory that isolates exact conceptual gaps per chapter." 
            />
            <FeatureCard 
              icon={History} 
              title="Revision Queue" 
              desc="Smart recall queue that prevents memory decay using spaced repetition." 
            />
            <FeatureCard 
              icon={Binary} 
              title="Intelligence Hub" 
              desc="Unified stream of all cognitive signals driving your prep performance." 
            />
            <FeatureCard 
              icon={Zap} 
              title="Adaptive Strategy" 
              desc="Automated decision engine that allocates your study hours daily." 
            />
            <FeatureCard 
              icon={CalendarCheck} 
              title="Weekly Roadmap" 
              desc="Dynamic scheduling that balances subjects based on current accuracy." 
            />
          </div>
        </div>
      </section>

      {/* 5. SOCIAL PROOF / STATS */}
      <section className="py-24 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Designed for serious aspirants.</h3>
              <p className="text-slate-500 font-medium italic">Targeting the top 1% across competitive examinations.</p>
            </div>
            <div className="flex gap-16">
              <StatItem value="10k+" label="High-Fidelity Questions" />
              <StatItem value="98%" label="Analysis Accuracy" />
              <StatItem value="Rank-Focused" label="System Philosophy" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-primary text-white rounded-[3rem] p-12 lg:p-24 text-center space-y-10 shadow-2xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            <h2 className="text-4xl lg:text-6xl font-headline font-bold tracking-tight relative z-10">
              Your Rank Will Not Improve<br className="hidden sm:block" /> By Guesswork.
            </h2>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => router.push('/setup')}
                className="h-20 px-16 rounded-[1.5rem] text-xl font-black bg-white text-primary hover:bg-slate-50 shadow-xl transition-all active:scale-95 group"
              >
                Start Your Journey <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Button>
              <p className="text-primary-foreground/60 font-bold uppercase tracking-widest text-[10px]">
                No credit card required • Immediate Strategy Generation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-100">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            <span className="font-headline font-bold text-lg tracking-tight">ExamMentor AI</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2025 ExamMentor Intelligence Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function ValueBlock({ icon: Icon, title, desc }: any) {
  return (
    <div className="space-y-6 group">
      <div className="p-4 bg-white rounded-2xl w-fit shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  )
}

function StepItem({ step, icon: Icon, title, desc }: any) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 relative z-10 flex-1 px-4 group">
      <div className="relative">
        <div className="w-20 h-20 bg-white rounded-full border-4 border-slate-50 shadow-xl flex items-center justify-center group-hover:border-primary/20 transition-all duration-500">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
          {step}
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 font-medium italic">"{desc}"</p>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="border-none bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 rounded-[2rem] overflow-hidden group border border-white/5">
      <CardContent className="p-8 space-y-6">
        <div className="p-3 bg-white/10 rounded-xl w-fit group-hover:bg-primary transition-colors duration-500">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ value, label }: any) {
  return (
    <div className="text-center md:text-left space-y-1">
      <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  )
}
