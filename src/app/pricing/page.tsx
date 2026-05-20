"use client"

import React from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Check, 
  X, 
  ShieldCheck, 
  Zap, 
  Target, 
  Sparkles, 
  Crown, 
  ArrowRight,
  HelpCircle
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: "Basic",
    price: "Free",
    description: "Foundational tools for casual preparation.",
    features: [
      { text: "Limited practice tests", included: true },
      { text: "Basic performance metrics", included: true },
      { text: "Access to dashboard", included: true },
      { text: "Mock Analysis", included: false },
      { text: "Weakness Lab", included: false },
      { text: "Adaptive Strategy", included: false },
    ],
    cta: "Continue Free",
    variant: "outline" as const,
  },
  {
    name: "PRO",
    price: "₹499",
    period: "/month",
    description: "The complete intelligence system for serious aspirants.",
    features: [
      { text: "Unlimited high-fidelity tests", included: true },
      { text: "Full Mock Simulation Analysis", included: true },
      { text: "Deep Weakness Lab Access", included: true },
      { text: "Automated Weekly Roadmap", included: true },
      { text: "Intelligence Hub Signals", included: true },
      { text: "Adaptive Decision Engine", included: true },
    ],
    cta: "Upgrade to Pro",
    variant: "default" as const,
    highlight: true,
    badge: "Most Popular"
  },
  {
    name: "ELITE",
    price: "₹999",
    period: "/month",
    description: "Advanced analytics and priority intelligence.",
    features: [
      { text: "Everything in PRO", included: true },
      { text: "Advanced Predictive Analytics", included: true },
      { text: "Priority Feature Updates", included: true },
      { text: "Future GenAI Capabilities", included: true },
      { text: "1-on-1 Strategy Reviews", included: true },
      { text: "Early Access to New Modules", included: true },
    ],
    cta: "Go Elite",
    variant: "outline" as const,
  }
]

const FAQS = [
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your subscription at any time from your account settings. You will retain access to your plan until the end of your current billing cycle."
  },
  {
    q: "Is ExamMentor suitable for NEET aspirants?",
    a: "Absolutely. Our intelligence models are specifically calibrated for high-stakes exams like NEET, JEE, and CAT, focusing on subject-level precision and competitive rank bands."
  },
  {
    q: "How is this different from traditional test series?",
    a: "Traditional systems only show you scores. ExamMentor analyzes your 'behavioral signals'—like guessing patterns and cognitive fatigue—to tell you exactly *why* you are losing marks."
  }
]

export default function PricingPage() {
  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-16 pb-32">
          
          {/* HEADER */}
          <header className="text-center space-y-4 max-w-2xl mx-auto">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 font-bold text-xs uppercase tracking-[0.2em] rounded-full">
              Intelligence Tiers
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-slate-900 tracking-tight">
              Unlock Your Full Potential
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Access the complete intelligence system designed to decode your performance and improve your rank.
            </p>
          </header>

          {/* PRICING CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PLANS.map((plan) => (
              <Card 
                key={plan.name} 
                className={cn(
                  "relative border-2 rounded-[2.5rem] transition-all duration-500 group overflow-hidden",
                  plan.highlight 
                    ? "border-primary shadow-2xl shadow-primary/10 scale-105 z-10 bg-white" 
                    : "border-slate-100 bg-white/80 hover:bg-white hover:border-primary/20 shadow-sm"
                )}
              >
                {plan.badge && (
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-primary text-white border-none font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="p-8 pb-0 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-headline font-bold text-slate-900">{plan.price}</span>
                      {plan.period && <span className="text-slate-400 font-medium">{plan.period}</span>}
                    </div>
                  </div>
                  <CardDescription className="text-sm text-slate-500 font-medium leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                  <div className="h-px bg-slate-100 w-full" />
                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className={cn(
                            "p-0.5 rounded-full mt-0.5",
                            plan.highlight ? "bg-primary text-white" : "bg-emerald-100 text-emerald-600"
                          )}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-0.5 rounded-full mt-0.5 bg-slate-100 text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          feature.included ? "text-slate-700" : "text-slate-400"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-8 pt-0">
                  <Button 
                    variant={plan.variant} 
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-95 group",
                      plan.highlight ? "shadow-xl shadow-primary/20" : ""
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* TRUST SECTION */}
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 lg:p-16 relative overflow-hidden text-center space-y-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <ShieldCheck className="w-64 h-64" />
            </div>
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-headline font-bold">Built for serious aspirants.</h2>
              <p className="text-slate-400 text-lg font-medium italic">
                "No distractions. No social noise. Just high-fidelity intelligence to help you scale the competitive ladder."
              </p>
            </div>
            <div className="relative z-10 flex flex-wrap justify-center gap-12 pt-4">
              <TrustStat icon={Target} label="Rank Focused" />
              <TrustStat icon={Zap} label="Adaptive Engine" />
              <TrustStat icon={Sparkles} label="98% Insight Accuracy" />
            </div>
          </section>

          {/* FAQ SECTION */}
          <section className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3 text-primary">
                <HelpCircle className="w-6 h-6" />
                <h2 className="text-2xl font-headline font-bold text-slate-900">Common Questions</h2>
              </div>
              <p className="text-slate-500 font-medium">Everything you need to know about ExamMentor tiers.</p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {FAQS.map((faq, i) => (
                <AccordionItem 
                  key={i} 
                  value={`faq-${i}`} 
                  className="border-none bg-white rounded-2xl shadow-sm border border-slate-100 px-6 overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline font-bold text-slate-700 py-5 text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-500 font-medium leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

        </div>
      </main>
    </MentorLayout>
  )
}

function TrustStat({ icon: Icon, label }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-sm font-bold uppercase tracking-widest text-slate-300">{label}</span>
    </div>
  )
}
