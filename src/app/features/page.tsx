'use client';

import React from 'react';
import Link from 'next/link';
import { 
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
  Binary,
  Flame,
  Search,
  Timer,
  Layout,
  BarChart3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white font-body selection:bg-primary/10">
      <MarketingNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,86,219,0.03),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-6 text-center relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Badge variant="outline" className="py-1 px-4 border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-[0.2em] rounded-full">
            Product Intelligence
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[#0f172a] max-w-4xl mx-auto leading-[1.1]">
            Every feature built around one goal — <span className="text-primary">your NEET rank</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            ExamMentor isn&apos;t a question bank. It&apos;s an intelligent preparation system that learns how you think and adapts to how you improve.
          </p>
        </div>
      </section>

      {/* FEATURE 01: ADAPTIVE PLAN */}
      <FeatureSection 
        number="01"
        tag="Planning"
        title="A plan that rebuilds itself every week"
        desc1="Most study plans are rigid. They don't care if you spent 4 hours struggling with Thermodynamics or if you mastered Genetics in 20 minutes. ExamMentor does."
        desc2="Our AI baseline assessment identifies your starting point. From there, the plan recalibrates after every attempt. Chapter priority scores are computed using a proprietary formula of current accuracy, memory decay rate, and syllabus dependency weight."
        bullets={[
          "Personalised weekly session schedule",
          "Chapter priority scoring with dependency mapping",
          "Auto-recalibration after every exam attempt",
          "Phase-aware planning (Foundation / Revision / Mock)"
        ]}
        visual={<AdaptivePlanVisual />}
      />

      {/* FEATURE 02: RANK PREDICTOR */}
      <FeatureSection 
        number="02"
        tag="Intelligence"
        title="Live predicted rank — not a guess, a calculation"
        desc1="Wondering where you stand in the national pool? Our Rank Predictor removes the anxiety of the unknown. It uses advanced percentile mapping to compare your performance against 100k+ historical data points."
        desc2="Subject-wise accuracy feeds into a rank band computation that becomes more precise with every test. As you accumulate more data, the confidence interval narrows, giving you a high-fidelity look at your actual exam-day potential."
        bullets={[
          "Predicted rank updated after every attempt",
          "Subject-wise contribution breakdown",
          "Rank trend over 8 weeks",
          "Score simulator — 'what if my accuracy reaches X%?'"
        ]}
        visual={<RankPredictorVisual />}
        reverse
        bgGray
      />

      {/* FEATURE 03: WEAK AREA ENGINE */}
      <FeatureSection 
        number="03"
        tag="Improvement"
        title="Your weaknesses, ranked by how much they cost you"
        desc1="Not all weak areas are equal. A conceptual gap in a high-weightage chapter like 'Laws of Motion' is more critical than a minor lag in 'Units and Dimensions'. The system understands these hierarchies."
        desc2="The engine tiers your vulnerabilities into Critical, Needs Attention, and Improving. It uses dependency propagation to alert you if a weak foundational chapter is blocking your mastery of advanced topics, ensuring you fix the right thing first."
        bullets={[
          "Three-tier weakness classification",
          "Dependency-aware prioritisation",
          "Accuracy trend per chapter (declining/stable/improving)",
          "One-click jump to targeted practice"
        ]}
        visual={<WeakAreaVisual />}
      />

      {/* FEATURE 04: SPACED REVISION */}
      <FeatureSection 
        number="04"
        tag="Retention"
        title="Memory decay tracking for every chapter"
        desc1="NEET is as much about memory as it is about logic. The spaced revision engine tracks exactly when you studied a topic and how well you performed, calculating a live 'Memory Strength' score (0–100)."
        desc2="Based on the Ebbinghaus Forgetting Curve, the system identifies when a concept is about to fade from your active memory. It automatically builds a daily revision queue, separating tasks into 'Due Today' and 'Due This Week' to ensure long-term retention."
        bullets={[
          "Memory strength score per chapter (0–100)",
          "Auto-scheduled revision queue",
          "Due-today / due-this-week separation",
          "Revision session with pre-selected weak questions"
        ]}
        visual={<RevisionVisual />}
        reverse
        bgGray
      />

      {/* FEATURE 05: MISTAKE NOTEBOOK */}
      <FeatureSection 
        number="05"
        tag="Analysis"
        title="Every wrong answer stored and revisitable"
        desc1="In traditional prep, mistakes are lost in a pile of paper. In ExamMentor, every incorrect or skipped answer is logged instantly into your Mistake Notebook, tagged by concept and error type."
        desc2="The system detects repeated mistakes—identifying if you keep getting 'Assertion-Reason' questions wrong in a specific subject. You can filter your history to drill down on these errors and attempt them again directly from the notebook."
        bullets={[
          "Automatic logging from every attempt",
          "Filter by subject, chapter, mistake type",
          "Repeated mistake flagging",
          "Attempt Again directly from the notebook"
        ]}
        visual={<NotebookVisual />}
      />

      {/* FEATURE 06: QUESTION ANALYTICS */}
      <FeatureSection 
        number="06"
        tag="Deep Analysis"
        title="Understand not just what you got wrong — but why"
        desc1="Data is just numbers without interpretation. Our analytics suite breaks down your performance through multiple lenses: taxonomy type, cognitive level, and execution speed."
        desc2="Are you failing at 'Applying' concepts or just 'Remembering' them? Do you spend too much time on Physics numericals compared to the national average? We provide a Subject × Question Type matrix that shows exactly where your efficiency leaks."
        bullets={[
          "Per-question time and accuracy breakdown",
          "Question type performance matrix",
          "Cognitive level analysis (Bloom's taxonomy)",
          "Subject × question type accuracy grid"
        ]}
        visual={<AnalyticsVisual />}
        reverse
        bgGray
      />

      {/* FEATURE 07: EXAM MODES */}
      <FeatureSection 
        number="07"
        tag="Practice"
        title="Six modes for every stage of preparation"
        desc1="Your preparation needs change as you move closer to exam day. ExamMentor provides six distinct environments designed to mirror every stage of the learning lifecycle."
        desc2="From high-fidelity full mocks with national percentiles to targeted revision sessions that only show you what you've forgotten, the platform adapts its interface and marking scheme to the mode you select."
        bullets={[
          "Practice Mode — chapter-focused, no time limit",
          "Sectional Test — subject-specific, timed",
          "Revision Mode — targets weak and decay content",
          "Full Mock — NEET simulation with real-time rank",
          "Custom Exam — build by chapter and difficulty",
          "CUET Mode — block-based CUET UG preparatory"
        ]}
        visual={<ExamModesVisual />}
      />

      {/* COMPARISON TABLE */}
      <section className="py-32 bg-[#0f172a] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <pattern id="dot-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="white" />
            </pattern>
            <rect width="100" height="100" fill="url(#dot-pattern)" />
          </svg>
        </div>
        <div className="container mx-auto px-6 relative z-10 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">ExamMentor vs traditional preparation</h2>
            <p className="text-slate-400 text-lg">See why students choosing data-driven prep are outperforming their peers.</p>
          </div>

          <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-6 px-8 text-white font-bold text-sm">Feature</TableHead>
                  <TableHead className="py-6 px-8 text-slate-400 font-bold text-sm">Traditional Coaching</TableHead>
                  <TableHead className="py-6 px-8 text-primary font-black text-sm bg-primary/10">ExamMentor AI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { f: "Personalised Study Plan", t: "Generic schedule", e: true },
                  { f: "Real-time Rank Tracking", t: "Only after tests", e: true },
                  { f: "Automated Revision", t: "Self-managed", e: true },
                  { f: "Behavioral Mistake Analysis", t: "Score only", e: true },
                  { f: "24/7 Availability", t: "Scheduled classes", e: true },
                  { f: "Adaptive Difficulty", t: "Fixed level", e: true },
                  { f: "Dependency Mapping", t: "None", e: true },
                  { f: "Time-per-Question Metrics", t: "Total time only", e: true },
                  { f: "Subject-wise Accuracy Hub", t: "Manual tracking", e: true },
                  { f: "Parent Transparency", t: "Limited visibility", e: true },
                ].map((row, i) => (
                  <TableRow key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="py-5 px-8 font-bold text-slate-200">{row.f}</TableCell>
                    <TableCell className="py-5 px-8 text-slate-500 font-medium">{row.t}</TableCell>
                    <TableCell className="py-5 px-8 bg-primary/10 text-center">
                      <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex p-4 bg-primary/5 rounded-full mb-4">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-[#0f172a]">Ready to see what your real rank potential is?</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Join thousands of aspirants using competitive intelligence to scale the NEET leaderboard.
          </p>
          <div className="pt-6">
            <Button asChild size="lg" className="h-16 px-16 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all group">
              <Link href="/auth" className="flex items-center gap-3">
                Sign Up Free — It&apos;s Free Forever <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function FeatureSection({ number, tag, title, desc1, desc2, bullets, visual, reverse = false, bgGray = false }: any) {
  return (
    <section className={cn("py-24 lg:py-40", bgGray ? "bg-[#f8f9fb]" : "bg-white")}>
      <div className="container mx-auto px-6">
        <div className={cn(
          "flex flex-col lg:flex-row items-center gap-16 lg:gap-32",
          reverse && "lg:flex-row-reverse"
        )}>
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <span className="text-4xl font-black text-primary/10 tracking-tighter block leading-none">{number}</span>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-widest text-[10px] px-3">{tag}</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] tracking-tight">{title}</h2>
            </div>
            <div className="space-y-4 text-lg text-slate-500 leading-relaxed font-medium">
              <p>{desc1}</p>
              <p>{desc2}</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bullets.map((b: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-[#0f172a]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full max-w-lg lg:max-w-none animate-in fade-in zoom-in-95 duration-1000">
            {visual}
          </div>
        </div>
      </div>
    </section>
  )
}

/* VISUAL MOCKUP COMPONENTS */

function AdaptivePlanVisual() {
  return (
    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden bg-white p-8 space-y-8">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weekly AI Roadmap</span>
        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-2">Recalibrated 2m ago</Badge>
      </div>
      <div className="space-y-6">
        {[
          { label: 'Laws of Motion', sub: 'High Weightage', val: 92, color: 'bg-rose-500', priority: 'P1' },
          { label: 'Thermodynamics', sub: 'Accuracy Gap', val: 75, color: 'bg-amber-500', priority: 'P2' },
          { label: 'Plant Physiology', sub: 'Memory Decay', val: 45, color: 'bg-emerald-500', priority: 'P3' }
        ].map((item, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex flex-col"><span className="text-sm font-bold text-slate-900">{item.label}</span><span className="text-[10px] text-slate-400 font-medium italic">{item.sub}</span></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">{item.priority}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.val}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RankPredictorVisual() {
  return (
    <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden bg-slate-900 p-10 flex flex-col items-center text-center space-y-8">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
          <circle cx="96" cy="96" r="80" stroke="#1a56db" strokeWidth="12" fill="transparent" strokeDasharray="502" strokeDashoffset="125" strokeLinecap="round" className="animate-[loading_2s_ease-out_forwards]" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-white italic tracking-tighter">#487</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Rank</span>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-white uppercase tracking-[0.2em]">Confidence Interval</p>
        <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-full">
          <span className="text-sm font-bold text-emerald-400 tracking-tight">94.2% Stability</span>
        </div>
      </div>
    </Card>
  )
}

function WeakAreaVisual() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-none shadow-xl rounded-3xl bg-rose-50 p-6 space-y-4">
        <div className="p-3 bg-white rounded-2xl w-fit"><Flame className="w-6 h-6 text-rose-500" /></div>
        <div><h4 className="font-bold text-rose-900">Critical</h4><p className="text-[10px] text-rose-700 font-medium">Blocking 3 units</p></div>
        <div className="h-1 w-full bg-rose-200 rounded-full"><div className="h-full bg-rose-500 w-[24%]"></div></div>
      </Card>
      <Card className="border-none shadow-xl rounded-3xl bg-amber-50 p-6 space-y-4">
        <div className="p-3 bg-white rounded-2xl w-fit"><Activity className="w-6 h-6 text-amber-500" /></div>
        <div><h4 className="font-bold text-amber-900">Attention</h4><p className="text-[10px] text-amber-700 font-medium">Declining trend</p></div>
        <div className="h-1 w-full bg-amber-200 rounded-full"><div className="h-full bg-amber-500 w-[52%]"></div></div>
      </Card>
      <Card className="border-none shadow-xl rounded-3xl bg-blue-50 p-6 space-y-4 col-span-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl"><ShieldCheck className="w-5 h-5 text-blue-500" /></div>
            <h4 className="font-bold text-blue-900 text-sm">Strategic Pivot Recommendation</h4>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </div>
      </Card>
    </div>
  )
}

function RevisionVisual() {
  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memory Decay Tracker</span>
        <h4 className="text-xl font-bold text-slate-900">Queued for Today</h4>
      </div>
      <div className="space-y-3">
        {[
          { name: 'Redox Reactions', due: '2h', color: 'text-rose-500' },
          { name: 'Kinematics', due: '5h', color: 'text-rose-500' },
          { name: 'Photosynthesis', due: 'Tomorrow', color: 'text-amber-500' }
        ].map((item, i) => (
          <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
            <div className="flex items-center gap-3"><History className="w-4 h-4 text-slate-300" /><span className="text-sm font-bold text-slate-700">{item.name}</span></div>
            <span className={cn("text-[9px] font-black uppercase tracking-tighter", item.color)}>DUE IN {item.due}</span>
          </div>
        ))}
      </div>
      <Button className="w-full h-12 rounded-xl font-bold text-xs gap-2">Start Revision Block <Zap className="w-4 h-4 fill-current" /></Button>
    </Card>
  )
}

function NotebookVisual() {
  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-300" />
        <span className="text-xs font-bold text-slate-400 uppercase">Search Mistake Notebook</span>
      </div>
      <div className="p-8 space-y-4">
        {[
          { q: 'Calculated electrostatic force without squaring r.', type: 'Calculation', sub: 'Physics' },
          { q: 'Confused NF3 dipole moment direction.', type: 'Conceptual', sub: 'Chemistry' }
        ].map((item, i) => (
          <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl space-y-3 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <Badge className="bg-primary/5 text-primary border-none text-[8px] font-bold uppercase">{item.sub}</Badge>
              <Badge variant="outline" className="text-[8px] font-bold text-slate-400 uppercase border-slate-100">{item.type}</Badge>
            </div>
            <p className="text-sm text-slate-600 italic font-medium leading-relaxed">&quot;{item.q}&quot;</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function AnalyticsVisual() {
  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 space-y-8">
      <div className="flex justify-between items-end"><h4 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Accuracy Heatmap</h4><Target className="w-5 h-5 text-primary" /></div>
      <div className="grid grid-cols-6 grid-rows-3 gap-3 h-48">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className={cn(
            "rounded-xl shadow-inner transition-colors",
            i % 5 === 0 ? "bg-rose-100" : i % 3 === 0 ? "bg-amber-100" : "bg-emerald-500/20"
          )}></div>
        ))}
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Latency Index</span>
        <span className="text-xs font-black text-slate-900">Optimal (1.2s avg)</span>
      </div>
    </Card>
  )
}

function ExamModesVisual() {
  return (
    <div className="grid grid-cols-2 gap-4 animate-pulse">
      {[
        { t: 'Practice', icon: Zap, color: 'text-blue-500' },
        { t: 'Sectional', icon: LayoutGrid, color: 'text-emerald-500' },
        { t: 'Revision', icon: History, color: 'text-amber-500' },
        { t: 'Mock', icon: Activity, color: 'text-rose-500' }
      ].map((mode, i) => (
        <div key={i} className="p-6 bg-white border-2 border-slate-50 rounded-3xl flex flex-col items-center gap-3">
          <div className={cn("p-3 rounded-2xl bg-slate-50", mode.color)}><mode.icon className="w-5 h-5" /></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{mode.t}</span>
        </div>
      ))}
    </div>
  )
}
