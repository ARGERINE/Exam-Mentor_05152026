
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  Zap, 
  CreditCard, 
  Users, 
  Settings2,
  ChevronRight,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketingNavbar } from '@/components/marketing-navbar';
import { MarketingFooter } from '@/components/marketing-footer';
import { cn } from '@/lib/utils';

// --- FAQ DATA ---
const FAQ_CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: Sparkles },
  { id: 'exam-practice', label: 'Exam & Practice', icon: Zap },
  { id: 'study-plan-ai', label: 'Study Plan & AI', icon: BookOpen },
  { id: 'pricing-billing', label: 'Pricing & Billing', icon: CreditCard },
  { id: 'parents', label: 'Parents', icon: Users },
  { id: 'technical', label: 'Technical', icon: Settings2 },
];

const FAQ_DATA = {
  'getting-started': [
    {
      q: "What is ExamMentor?",
      a: "ExamMentor is an AI-powered NEET and CUET preparation platform that builds a personalised study plan for each student, tracks performance at a question level, predicts your rank after every attempt, and schedules revisions based on memory decay. It is not a question bank — it is an intelligent preparation system."
    },
    {
      q: "Who is ExamMentor built for?",
      a: "ExamMentor is built primarily for Class 11, Class 12, and dropper students preparing for NEET UG and CUET. Parents can also access a progress view to track their child's preparation quality."
    },
    {
      q: "Do I need to pay to get started?",
      a: "No. The free plan is available forever with no credit card required. You get access to 500 practice questions per month, 1 mock test per month, and basic performance tracking."
    },
    {
      q: "How is ExamMentor different from Byju's, Unacademy, or PW?",
      a: "Those platforms primarily deliver video lectures and test series. ExamMentor is focused entirely on adaptive practice and rank improvement. We don't replace your teacher — we make every hour of practice more effective."
    },
    {
      q: "Can I use ExamMentor alongside my coaching institute?",
      a: "Absolutely. Most of our students use ExamMentor alongside their regular coaching. The platform complements classroom teaching by ensuring what you learn actually sticks and translates to rank."
    },
    {
      q: "Is ExamMentor available as a mobile app?",
      a: "A mobile app is currently in development. ExamMentor is fully functional on mobile browsers and is optimised for mobile use in the meantime."
    }
  ],
  'exam-practice': [
    {
      q: "What exam modes are available?",
      a: "Six modes — Practice Mode (chapter-wise, no time limit), Sectional Test (subject-specific, 50 questions, 60 minutes), Revision Mode (targets weak and memory-decayed content), Full Mock Test (NEET simulation, 180 questions, 180 minutes), Custom Exam (build your own by chapter and difficulty), and CUET Mode (block-based simulation)."
    },
    {
      q: "How many questions are in the question bank?",
      a: "Over 50,000 questions across Physics, Chemistry, and Biology, spanning all NEET and CUET syllabus chapters. Questions are tagged by difficulty, chapter, cognitive level, and question type."
    },
    {
      q: "Are the mock tests similar to actual NEET?",
      a: "Yes. Full mock tests follow the NTA NEET pattern — 180 questions, 180 minutes, +4/−1 marking. Advanced mock tests include difficulty calibration to simulate both standard and advanced NEET years."
    },
    {
      q: "Can I attempt the same questions again?",
      a: "Yes — through the Mistake Notebook, which lets you re-attempt any incorrectly answered or skipped question. The Revision Queue also resurfaces questions based on your memory decay pattern."
    },
    {
      q: "What happens if I exit an exam midway?",
      a: "Timed exams (Sectional Tests and Mock Tests) cannot be resumed after exit — this is by design to simulate real exam conditions. Practice Mode and Revision Mode have no such restriction."
    }
  ],
  'study-plan-ai': [
    {
      q: "How does the AI study plan work?",
      a: "After your first diagnostic attempt, ExamMentor establishes a baseline for your accuracy, speed, and weak chapters. The AI then generates a weekly plan with daily sessions, prioritising chapters based on accuracy, memory decay, chapter dependencies, and your target exam date. The plan recalibrates automatically after every attempt."
    },
    {
      q: "How often does the plan update?",
      a: "The plan recalibrates after every exam attempt. You will see updated chapter priorities and revised weekly sessions within a few minutes of completing any test."
    },
    {
      q: "What is the Rank Predictor and how accurate is it?",
      a: "The Rank Predictor estimates your NEET rank based on your current accuracy rates by subject, question type performance, and a percentile mapping derived from historical NEET data. It provides a rank band (e.g., #450–#600) rather than a single number, and narrows as you complete more attempts. It is an estimation tool — not a guarantee."
    },
    {
      q: "What is memory decay and how does ExamMentor use it?",
      a: "Memory decay refers to the natural forgetting of information over time. ExamMentor tracks how long ago you last correctly answered questions in each chapter and assigns a memory strength score. When strength drops below a threshold, those questions are added to your Revision Queue automatically."
    },
    {
      q: "Can the AI plan be manually adjusted?",
      a: "Yes. You can mark chapters as high priority, skip chapters, and adjust your daily study target in Preferences. The AI respects your manual inputs and recalibrates around them."
    }
  ],
  'pricing-billing': [
    {
      q: "What is included in the free plan?",
      a: "500 practice questions per month, 1 full mock test per month, basic performance overview, 20 Mistake Notebook entries, and syllabus coverage tracker."
    },
    {
      q: "How does the 7-day free trial work?",
      a: "When you upgrade to PRO, you get full access for 7 days free. If you cancel within 7 days, you are not charged anything. After 7 days, your subscription begins at ₹299/month or ₹2,499/year."
    },
    {
      q: "Can I get a refund?",
      a: "Yes. We offer a 7-day no-questions-asked refund from the date of your first charge. Contact support at support@exammentor.in with your registered email."
    },
    {
      q: "Is there a discount for annual plans?",
      a: "Yes — the annual plan is ₹2,499, which is equivalent to ₹208/month — a 30% saving compared to the monthly plan."
    }
  ],
  'parents': [
    {
      q: "Can parents track their child's progress?",
      a: "Yes. Parents can be added as a linked viewer on their child's account. They get a simplified progress view showing accuracy trends, predicted rank, and weekly study hours — without access to the exam environment itself."
    },
    {
      q: "Is ExamMentor safe for minors?",
      a: "ExamMentor collects only the minimum data required for the service. No personal data is shared with third parties. Students under 18 should ideally sign up with parental awareness."
    },
    {
      q: "How do I know if my child is actually using it?",
      a: "The parent view shows daily login activity, exam attempts, and study hours in the current week. You can see exactly which chapters were practised and how accuracy is trending."
    },
    {
      q: "Can I purchase a subscription for my child?",
      a: "Yes. You can sign up with your child's details and complete payment from your end. The account belongs to the student."
    }
  ],
  'technical': [
    {
      q: "Which browsers and devices are supported?",
      a: "ExamMentor works on all modern browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile. For the best experience, we recommend Chrome on desktop."
    },
    {
      q: "What should I do if an exam crashes midway?",
      a: "Contact support immediately at support@exammentor.in with your registered email and the exam name. We can review your session and reinstate your attempt in most cases within 24 hours."
    },
    {
      q: "Is my data secure?",
      a: "All data is encrypted in transit (TLS) and at rest. We use industry-standard authentication and do not store payment information on our servers. Payments are processed securely via Razorpay."
    }
  ]
};

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return FAQ_DATA;

    const filtered: any = {};
    Object.entries(FAQ_DATA).forEach(([category, questions]) => {
      const matches = questions.filter(
        item => 
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matches.length > 0) {
        filtered[category] = matches;
      }
    });
    return filtered;
  }, [searchQuery]);

  const hasResults = Object.keys(filteredFaqs).length > 0;

  return (
    <div className="min-h-screen bg-white font-body selection:bg-primary/10">
      <MarketingNavbar />

      {/* HERO SECTION */}
      <section className="pt-32 pb-16 lg:pt-48 lg:pb-24 bg-[#f8f9fb]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <Badge variant="outline" className="py-1 px-4 border-primary/20 bg-primary/5 text-primary font-bold text-xs uppercase tracking-[0.2em] rounded-full">
              Support Center
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-[#0f172a] leading-[1.1]">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Everything students and parents ask before signing up for the intelligence-led revolution in NEET prep.
            </p>
            
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search FAQs by keywords..." 
                className="h-14 pl-12 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary text-base font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* TABS & ACCORDIONS */}
      <main className="container mx-auto px-6 py-16 lg:py-24">
        {!searchQuery ? (
          <div className="max-w-4xl mx-auto space-y-12">
            <Tabs defaultValue="getting-started" onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto pb-4 scrollbar-hide">
                <TabsList className="bg-slate-100 p-1 rounded-2xl inline-flex min-w-max">
                  {FAQ_CATEGORIES.map((cat) => (
                    <TabsTrigger 
                      key={cat.id} 
                      value={cat.id} 
                      className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
                      <cat.icon className="w-4 h-4 mr-2 hidden sm:inline-block" />
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {FAQ_CATEGORIES.map((cat) => (
                <div key={cat.id} className={cn(activeTab === cat.id ? "block" : "hidden", "animate-in fade-in duration-500")}>
                  <div className="pt-10 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="p-3 bg-primary/5 rounded-2xl">
                        <cat.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#0f172a]">{cat.label}</h2>
                    </div>
                    
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-4">
                      {FAQ_DATA[cat.id as keyof typeof FAQ_DATA].map((item, idx) => (
                        <AccordionItem 
                          key={idx} 
                          value={`item-${idx}`} 
                          className="border border-slate-100 rounded-[2rem] bg-white shadow-sm overflow-hidden px-6"
                        >
                          <AccordionTrigger className="py-6 hover:no-underline font-bold text-lg text-slate-800 text-left hover:text-primary transition-colors">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="pb-6 text-slate-500 text-base leading-relaxed font-medium italic">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              ))}
            </Tabs>
          </div>
        ) : (
          /* SEARCH RESULTS VIEW */
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-slate-100 pb-6 px-2">
              <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">
                Search Results for "{searchQuery}"
              </h2>
              <Button variant="ghost" onClick={() => setSearchQuery('')} className="text-primary font-bold text-xs">
                Clear search
              </Button>
            </div>

            {hasResults ? (
              <div className="space-y-12">
                {Object.entries(filteredFaqs).map(([category, questions]: any) => (
                  <div key={category} className="space-y-6">
                    <div className="flex items-center gap-2 text-primary px-2">
                      <Badge className="bg-primary/10 text-primary border-none uppercase tracking-tighter text-[10px]">
                        {FAQ_CATEGORIES.find(c => c.id === category)?.label}
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      {questions.map((item: any, idx: number) => (
                        <Card key={idx} className="border border-slate-100 rounded-[2rem] bg-white shadow-sm">
                          <CardContent className="p-8 space-y-4">
                            <h3 className="text-xl font-bold text-[#0f172a]">{item.q}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed italic">{item.a}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center space-y-6">
                <div className="inline-flex p-6 bg-slate-50 rounded-full">
                  <HelpCircle className="w-12 h-12 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900">No matching questions found</h3>
                  <p className="text-slate-500">Try searching for other keywords like 'billing', 'rank', or 'NEET'.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STILL HAVE QUESTIONS CTA */}
        <section className="max-w-4xl mx-auto mt-32">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-[#0f172a] text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <MessageSquare className="w-64 h-64" />
            </div>
            <CardContent className="p-10 lg:p-16 relative z-10 text-center space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Didn&apos;t find what you were looking for?</h2>
                <p className="text-slate-400 text-lg font-medium italic">
                  Our academic team is ready to help you navigate your journey.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-primary hover:bg-[#1e40af] text-lg font-bold shadow-xl shadow-primary/20">
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact Support <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="ghost" className="h-16 px-8 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5">
                  Chat on WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
      {label}
    </div>
  )
}
