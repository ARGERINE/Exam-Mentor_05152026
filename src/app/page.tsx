import React from 'react';
import Link from 'next/link';
import { 
  Play, 
  ArrowRight, 
  Zap, 
  Target, 
  Activity, 
  CheckCircle2, 
  History, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  LayoutGrid, 
  BrainCircuit, 
  MessageSquareQuote,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-body selection:bg-primary/10">
      <MarketingNavbar />

      {/* SECTION 1: HERO */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,86,219,0.05),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <Badge variant="outline" className="py-1 px-4 border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-[0.2em] rounded-full">
                Trusted by 10,000+ NEET Aspirants
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-[#0f172a] leading-[1.1]">
                Stop Studying Harder.<br />
                <span className="text-[#1a56db]">Start Studying Smarter.</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                ExamMentor&apos;s adaptive AI builds your personal study plan, identifies your weak areas, and predicts your NEET rank — updated after every practice session.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Button asChild size="lg" className="h-16 px-10 rounded-xl bg-[#1a56db] hover:bg-[#1e40af] text-lg font-bold shadow-2xl shadow-blue-500/20 group transition-all active:scale-[0.98]">
                  <Link href="/auth" className="flex items-center gap-2">
                    Sign Up Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" className="h-16 px-8 rounded-xl font-bold text-slate-600 gap-2 hover:bg-slate-50">
                  <Play className="w-5 h-5 fill-slate-600" /> Watch Demo
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8 border-t border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-[#0f172a]">50,000+</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Questions</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-[#0f172a]">AI-Powered</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Rank Predictor</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-bold text-[#0f172a]">Updated</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Daily</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative animate-in fade-in zoom-in-95 duration-1000">
              {/* UI MOCKUP ILLUSTRATION */}
              <div className="relative bg-white rounded-[32px] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="h-2 w-32 bg-slate-100 rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Rank Predictor Gauge */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center space-y-3">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="42" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                        <circle cx="48" cy="48" r="42" stroke="#1a56db" strokeWidth="8" fill="transparent" strokeDasharray="264" strokeDashoffset="66" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xl font-black text-slate-900">#487</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Predicted Rank</span>
                  </div>

                  {/* Accuracy Ring */}
                  <div className="p-6 bg-[#1a56db] text-white rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-xl shadow-blue-500/20">
                    <span className="text-3xl font-black italic tracking-tighter">92%</span>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest text-center">Biology Accuracy</span>
                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[92%]"></div>
                    </div>
                  </div>
                </div>

                {/* Revision Queue List */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Revision Queue</span>
                  {[
                    { name: 'Organic Chemistry', status: 'Due Today', color: 'text-rose-500' },
                    { name: 'Thermodynamics', status: 'Due Tomorrow', color: 'text-amber-500' },
                    { name: 'Plant Physiology', status: 'Stable', color: 'text-emerald-500' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <span className="text-xs font-bold text-slate-700">{item.name}</span>
                      <span className={cn("text-[9px] font-black uppercase tracking-tighter", item.color)}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative Floating Elements */}
              <div className="absolute -top-10 -right-10 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-bounce duration-[3000ms]">
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
              <div className="absolute -bottom-6 -left-6 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 animate-pulse">
                <BrainCircuit className="w-8 h-8 text-[#1a56db]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM STATEMENT */}
      <section className="bg-[#0f172a] py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="white" />
            </pattern>
            <rect width="100" height="100" fill="url(#grid-pattern)" />
          </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-20">
          <div className="space-y-4">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">Sound familiar?</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">NEET prep shouldn&apos;t feel like guesswork.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "You study for hours but don't know which chapters actually matter for your rank." },
              { text: "You take mock tests but never understand why you scored what you scored." },
              { text: "Your study plan is generic — made for everyone, optimised for no one." }
            ].map((card, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[32px] hover:bg-white/10 transition-all group">
                <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed italic italic group-hover:text-white transition-colors">
                  &quot;{card.text}&quot;
                </p>
              </div>
            ))}
          </div>

          <div className="pt-10 flex flex-col items-center gap-6">
            <p className="text-2xl font-headline font-bold text-slate-400">ExamMentor fixes all three.</p>
            <div className="w-1 h-20 bg-gradient-to-b from-primary to-transparent rounded-full"></div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-[#f8f9fb]">
        <div className="container mx-auto px-6 text-center space-y-20">
          <div className="space-y-4">
            <span className="text-[#854f0b] font-bold uppercase tracking-[0.2em] text-sm">Simple. Intelligent. Effective.</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">From signup to rank improvement in 3 steps</h2>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            {/* Connecting line (Desktop) */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden lg:block -z-0"></div>
            
            {[
              { step: "01", title: "Tell us your goal", body: "Set your target rank and exam date. ExamMentor builds a baseline from your first diagnostic attempt." },
              { step: "02", title: "Practice with intelligence", body: "Every question you attempt is analysed. The AI adjusts your plan and schedules revisions automatically." },
              { step: "03", title: "Watch your rank improve", body: "After each exam, your predicted rank and accuracy update in real time. You always know exactly where you stand." }
            ].map((step, i) => (
              <div key={i} className="flex-1 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative z-10 space-y-6 hover:-translate-y-2 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-[#1a56db] text-white flex items-center justify-center font-black text-xl mx-auto shadow-lg shadow-blue-500/20">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-[#0f172a]">{step.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURE HIGHLIGHTS */}
      <section id="features" className="py-32 space-y-40">
        {/* Feature 1 */}
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 w-full bg-slate-50 p-10 rounded-[3rem] border border-slate-100 animate-in fade-in slide-in-from-left-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl space-y-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">This Week&apos;s AI Plan</span>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-700">Physics: Rotational Motion</span><span className="text-xs font-bold text-rose-500">Priority 1</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full"><div className="h-full bg-rose-500 w-[95%]"></div></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-700">Chemistry: Equilibrium</span><span className="text-xs font-bold text-amber-500">Priority 2</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full"><div className="h-full bg-amber-500 w-[70%]"></div></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-700">Biology: Genetics</span><span className="text-xs font-bold text-emerald-500">Maintenance</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 w-[40%]"></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <Badge className="bg-[#1a56db]/10 text-[#1a56db] border-none font-bold text-[10px] px-3 uppercase tracking-widest">Adaptive Intelligence</Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight">A study plan that evolves with you</h3>
              <p className="text-lg text-slate-500 leading-relaxed italic">
                ExamMentor&apos;s AI analyses your accuracy, speed, and memory decay patterns across every chapter. It rebuilds your weekly plan every time you complete an attempt — so you always work on what moves your rank.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
            <div className="flex-1 w-full bg-slate-900 p-10 rounded-[3rem] animate-in fade-in slide-in-from-right-8">
              <div className="bg-white/5 border border-white/10 p-12 rounded-[2rem] flex flex-col items-center space-y-6 text-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                    <circle cx="80" cy="80" r="70" stroke="#1a56db" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="88" strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black text-white italic">#487</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RANK</span>
                  </div>
                </div>
                <div className="px-6 py-2 bg-[#1a56db]/20 rounded-full border border-primary/30">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Confidence Interval: 94.2%</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <Badge className="bg-[#0f6e56]/10 text-[#0f6e56] border-none font-bold text-[10px] px-3 uppercase tracking-widest">Rank Prediction</Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight">Know your NEET rank before exam day</h3>
              <p className="text-lg text-slate-500 leading-relaxed italic">
                Our rank predictor uses your subject-wise accuracy, question type performance, and historical percentile data to give you a live predicted rank band — updated after every session.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 w-full bg-slate-50 p-10 rounded-[3rem] animate-in fade-in slide-in-from-left-8">
              <div className="space-y-4">
                {[
                  { name: 'Thermodynamics Laws', day: 'Today', icon: Clock, color: 'bg-rose-100 text-rose-600' },
                  { name: 'Redox Reactions', day: 'Today', icon: Activity, color: 'bg-rose-100 text-rose-600' },
                  { name: 'Plant Cell Cycles', day: '2 Days', icon: History, color: 'bg-amber-100 text-amber-600' }
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-xl", item.color)}><item.icon className="w-5 h-5" /></div>
                      <span className="text-sm font-bold text-[#0f172a]">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100 transition-opacity">REVISE IN {item.day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <Badge className="bg-[#854f0b]/10 text-[#854f0b] border-none font-bold text-[10px] px-3 uppercase tracking-widest">Smart Revision</Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight">Never forget what you&apos;ve already learned</h3>
              <p className="text-lg text-slate-500 leading-relaxed italic">
                The spaced repetition engine tracks memory decay for every chapter. It queues the right questions at exactly the right moment — so retention compounds over time.
              </p>
            </div>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
            <div className="flex-1 w-full bg-slate-50 p-10 rounded-[3rem] animate-in fade-in slide-in-from-right-8">
              <div className="grid grid-cols-6 grid-rows-4 gap-2 h-64">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className={cn(
                    "rounded-md shadow-inner transition-colors",
                    i % 7 === 0 ? "bg-rose-200" : i % 5 === 0 ? "bg-amber-200" : "bg-emerald-400"
                  )}></div>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-3 uppercase tracking-widest">Deep Analytics</Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight leading-tight">Understand every mistake, not just your score</h3>
              <p className="text-lg text-slate-500 leading-relaxed italic">
                Question-level analysis breaks down every attempt by chapter, difficulty, question type, and time taken. The Mistake Notebook logs every error so nothing slips through.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: EXAM MODES */}
      <section className="py-32 bg-[#f8f9fb]">
        <div className="container mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
            <span className="text-[#0f6e56] font-bold uppercase tracking-[0.2em] text-sm">Built for every stage of your prep</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0f172a] tracking-tight">Six exam modes, one platform</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Practice Mode", body: "Chapter-by-chapter with no time pressure", icon: BrainCircuit, color: "text-blue-500" },
              { title: "Sectional Test", body: "Subject-specific, 50 Qs, 60 minutes", icon: LayoutGrid, color: "text-[#0f6e56]" },
              { title: "Revision Mode", body: "Targets only your weak and forgotten topics", icon: History, color: "text-[#854f0b]" },
              { title: "Mock Test", body: "Full NEET simulation, 180 questions, 180 minutes", icon: Activity, color: "text-rose-500" },
              { title: "CUET Mode", body: "Block-based CUET UG preparation", icon: ShieldCheck, color: "text-purple-500" },
              { title: "Custom Exam", body: "Build your own test by chapter and difficulty", icon: Target, color: "text-[#0f172a]" }
            ].map((mode, i) => (
              <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className={cn("p-4 rounded-2xl w-fit mb-6 bg-slate-50 group-hover:bg-primary/5 transition-colors", mode.color)}>
                  <mode.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[#0f172a] mb-2">{mode.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{mode.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: SOCIAL PROOF */}
      <section className="py-32">
        <div className="container mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-sm">What students and parents are saying</span>
            <h2 className="text-4xl font-bold text-[#0f172a] tracking-tight">Real results from real aspirants</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                name: "Priya Sharma", info: "NEET 2024, AIR 312", 
                quote: "The rank predictor told me I was at AIR 800 three months before the exam. I followed the adaptive plan and finished at 312. I genuinely don't think I would have cracked it without ExamMentor." 
              },
              { 
                name: "Rajesh Mehta", info: "Father of a 2024 qualifier", 
                quote: "As a parent I had no way to track my son's actual preparation quality. ExamMentor gave me a dashboard I could actually understand — accuracy trends, weak chapters, predicted rank. It changed our household's stress level." 
              },
              { 
                name: "Arjun Nair", info: "NEET 2025 aspirant", 
                quote: "I was scoring 480 consistently on mocks. Within six weeks of using ExamMentor's weak area engine my sectional scores jumped by 40 marks in Physics alone." 
              }
            ].map((test, i) => (
              <div key={i} className="p-10 bg-[#f8f9fb] rounded-[2.5rem] relative overflow-hidden group">
                <MessageSquareQuote className="absolute top-8 right-8 w-12 h-12 text-slate-200 group-hover:text-primary/10 transition-colors" />
                <div className="space-y-6 relative z-10">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed italic">&quot;{test.quote}&quot;</p>
                  <div className="pt-6 border-t border-slate-200">
                    <p className="font-bold text-[#0f172a]">{test.name}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{test.info}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: PRICING PREVIEW */}
      <section className="py-32 bg-[#f8f9fb]">
        <div className="container mx-auto px-6 text-center space-y-16">
          <h2 className="text-4xl font-bold text-[#0f172a] tracking-tight">Start free. Upgrade when you&apos;re ready.</h2>
          
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
            {/* FREE Plan */}
            <div className="flex-1 p-10 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col space-y-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest">FREE</h3>
                <div className="text-4xl font-black text-slate-900 italic">₹0 <span className="text-sm font-bold text-slate-400 uppercase">forever</span></div>
              </div>
              <ul className="text-left space-y-4 flex-1">
                {['Limited practice tests', 'Basic performance metrics', 'Standard NEET questions', 'Mobile app access'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-300" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="h-14 rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                <Link href="/auth">Continue Free</Link>
              </Button>
            </div>

            {/* PRO Plan */}
            <div className="flex-1 p-10 bg-white rounded-[2.5rem] border-4 border-[#1a56db] shadow-2xl relative flex flex-col space-y-8">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#1a56db] text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg">
                Most Popular
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#1a56db] uppercase tracking-widest">PRO</h3>
                <div className="text-4xl font-black text-slate-900 italic">₹299 <span className="text-sm font-bold text-slate-400 uppercase">/ month</span></div>
              </div>
              <ul className="text-left space-y-4 flex-1">
                {['Unlimited Adaptive Sessions', 'Full Mock Sim Analysis', 'Weak Area Lab Access', 'Live Rank Predictor', 'Personalised AI Roadmap', 'Spaced Repetition Engine', 'Doubt Solver Assistant', 'Priority Support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-[#0f172a]">
                    <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="h-14 rounded-xl bg-[#1a56db] hover:bg-[#1e40af] text-white font-bold shadow-xl shadow-blue-500/20">
                <Link href="/auth">Upgrade to PRO</Link>
              </Button>
            </div>
          </div>

          <Link href="/pricing" className="inline-flex items-center gap-2 font-bold text-primary hover:underline text-sm uppercase tracking-widest">
            View full plan comparison <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA BANNER */}
      <section className="py-24 bg-[#1a56db] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 text-center space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">Your NEET rank is a number you can move.</h2>
          <p className="text-xl text-white/80 font-medium italic">
            Join 10,000+ students who stopped guessing and started improving.
          </p>
          <Button asChild size="lg" className="h-20 px-16 rounded-[2rem] bg-white text-[#1a56db] hover:bg-slate-50 text-2xl font-black shadow-2xl transition-all active:scale-95 group">
            <Link href="/auth" className="flex items-center gap-3">
              Sign Up Free — It&apos;s Free Forever <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
