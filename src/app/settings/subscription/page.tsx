"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  CreditCard, 
  Check, 
  X, 
  ArrowRight, 
  Download, 
  Users, 
  Copy, 
  Zap, 
  Crown,
  ShieldCheck,
  History,
  Info,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

/**
 * SubscriptionPage
 * Comprehensive billing and plan management for the student.
 * Route: /settings/subscription
 */

// --- Placeholder Data ---
const MOCK_SUB = {
  planName: "PRO", // {sub.planName}
  status: "Active", // {sub.status}
  expiryDate: "Dec 24, 2025", // {sub.expiryDate}
  referralCode: "MENTOR-782X", // {sub.referralCode}
  referralCount: 4, // {sub.referralCount}
  rewardStatus: "1 month free earned" // {sub.rewardStatus}
}

const MOCK_BILLING = [
  { date: "Oct 24, 2024", plan: "PRO (Annual)", amount: "₹4,999", status: "Paid" },
  { date: "Oct 24, 2023", plan: "PRO (Annual)", amount: "₹4,999", status: "Paid" },
  { date: "Sep 24, 2023", plan: "Monthly Trial", amount: "₹0", status: "Completed" },
]

const FEATURES = [
  { name: "Unlimited practice questions", free: "partial", pro: "✓", institution: "✓" },
  { name: "Mock tests (Full length)", free: "✗", pro: "✓", institution: "✓" },
  { name: "AI adaptive study plan", free: "✗", pro: "✓", institution: "✓" },
  { name: "Rank predictor", free: "✗", pro: "✓", institution: "✓" },
  { name: "Weak area analysis", free: "✗", pro: "✓", institution: "✓" },
  { name: "CUET module", free: "✗", pro: "partial", institution: "✓" },
  { name: "Priority support", free: "✗", pro: "✓", institution: "✓" },
  { name: "Custom exam builder", free: "✗", pro: "✓", institution: "✓" },
]

export default function SubscriptionPage() {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(MOCK_SUB.referralCode)
    setIsCopied(true)
    toast({ title: "Referral code copied!" })
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-10 pb-32">
          
          <header className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Manage Subscription</h1>
            <p className="text-slate-500 text-lg font-medium">Your current plan and billing details</p>
          </header>

          <div className="space-y-8">
            
            {/* 1. CURRENT PLAN CARD */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                <Crown className="w-32 h-32 text-primary" />
              </div>
              <CardHeader className="p-10 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-4">
                    <Badge className={cn(
                      "px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border-none shadow-sm",
                      MOCK_SUB.planName === 'PRO' ? "bg-primary text-white" : 
                      MOCK_SUB.planName === 'INSTITUTION' ? "bg-purple-500 text-white" : 
                      "bg-slate-100 text-slate-500"
                    )}>
                      {MOCK_SUB.planName} PLAN
                    </Badge>
                    <div className="space-y-1">
                      <h2 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">
                        {MOCK_SUB.planName === 'PRO' ? 'Professional Intelligence' : 'Baseline Access'}
                      </h2>
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                        Status: <span className="text-emerald-500 font-bold">{MOCK_SUB.status}</span> • Valid until {MOCK_SUB.expiryDate}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 w-full md:w-auto">
                    {MOCK_SUB.planName === 'FREE' ? (
                      <Button size="lg" className="w-full md:w-auto h-14 px-10 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-2">
                        Upgrade to PRO <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="lg" className="w-full md:w-auto h-14 px-10 rounded-2xl border-slate-200 text-slate-600 font-bold bg-white hover:bg-slate-50">
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pt-8 border-t border-slate-50">
                  <FeatureItem text="Unlimited adaptive practice sessions" />
                  <FeatureItem text="Deep-dive mock behavior analysis" />
                  <FeatureItem text="Syllabus vulnerability mapping" />
                  <FeatureItem text="Weekly intelligence-led roadmap" />
                  <FeatureItem text="Memory decay revision queue" />
                  <FeatureItem text="Competitive rank predictor" />
                </div>
              </CardContent>
            </Card>

            {/* 2. PLAN COMPARISON TABLE */}
            <section className="space-y-6 pt-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                <Info className="w-4 h-4" /> Intelligence Tiers
              </h3>
              <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white border border-slate-100">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                      <TableHead className="w-[40%] px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Feature Breakdown</TableHead>
                      <TableHead className="text-center font-bold text-slate-500">FREE</TableHead>
                      <TableHead className={cn(
                        "text-center font-black text-primary bg-primary/5 border-x-2 border-primary/10",
                        MOCK_SUB.planName === 'PRO' && "bg-primary/[0.03]"
                      )}>
                        PRO
                      </TableHead>
                      <TableHead className="text-center font-bold text-purple-600">ELITE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FEATURES.map((f, i) => (
                      <TableRow key={i} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                        <TableCell className="px-8 py-4 text-sm font-bold text-slate-700">{f.name}</TableCell>
                        <TableCell className="text-center">
                          <Indicator val={f.free} />
                        </TableCell>
                        <TableCell className={cn(
                          "text-center bg-primary/5 border-x-2 border-primary/10",
                          MOCK_SUB.planName === 'PRO' && "bg-primary/[0.03]"
                        )}>
                          <Indicator val={f.pro} active />
                        </TableCell>
                        <TableCell className="text-center">
                          <Indicator val={f.institution} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </section>

            {/* 3. BILLING HISTORY */}
            <section className="pt-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="billing" className="border-none">
                  <AccordionTrigger className="flex items-center gap-3 px-2 py-4 hover:no-underline group">
                    <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Billing History</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 animate-in fade-in slide-in-from-top-2">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-100">
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow className="border-b border-slate-100">
                            <TableHead className="px-8 font-bold text-[10px] uppercase text-slate-400">Date</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase text-slate-400">Plan</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase text-slate-400">Amount</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase text-slate-400">Status</TableHead>
                            <TableHead className="text-right px-8 font-bold text-[10px] uppercase text-slate-400">Invoice</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MOCK_BILLING.map((b, i) => (
                            <TableRow key={i} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                              <TableCell className="px-8 py-5 font-bold text-slate-600">{b.date}</TableCell>
                              <TableCell className="font-medium text-slate-700">{b.plan}</TableCell>
                              <TableCell className="font-bold text-slate-900">{b.amount}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">
                                  {b.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right px-8">
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-bold text-primary gap-2 hover:bg-primary/5">
                                  <Download className="w-3 h-3" /> PDF
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* 4. REFERRAL SECTION */}
            <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Users className="w-32 h-32" />
              </div>
              <CardContent className="p-10 space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-headline font-bold">Refer & Earn Intelligence</h3>
                    <p className="text-sm text-slate-400 font-medium">Scale your preparation while rewarding your circle.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Exclusive Code</p>
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-2xl font-mono font-bold text-primary tracking-tighter">
                          {MOCK_SUB.referralCode}
                        </code>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={handleCopyCode}
                          className={cn(
                            "h-10 px-4 rounded-xl font-bold transition-all",
                            isCopied ? "bg-emerald-500 text-white" : "bg-white text-slate-900"
                          )}
                        >
                          {isCopied ? <ShieldCheck className="w-4 h-4" /> : <Copy className="w-4 h-4 mr-2" />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 md:border-l md:border-white/10 md:pl-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Growth</p>
                      <p className="text-3xl font-headline font-bold text-white">{MOCK_SUB.referralCount} <span className="text-sm text-slate-400 font-medium">Friends joined</span></p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{MOCK_SUB.rewardStatus}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* FOOTER INFO */}
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-loose">
            Secure billing powered by Intelligence Pay. <br />
            Need help? Contact support@exammentor.ai
          </p>
        </div>
      </main>
    </MentorLayout>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="p-1 rounded-full bg-emerald-50 text-emerald-600">
        <Check className="w-3.5 h-3.5" />
      </div>
      <span className="text-sm font-medium text-slate-600">{text}</span>
    </div>
  )
}

function Indicator({ val, active }: { val: string, active?: boolean }) {
  if (val === '✓') return <Check className={cn("w-5 h-5 mx-auto", active ? "text-primary" : "text-emerald-500")} />
  if (val === '✗') return <X className="w-5 h-5 mx-auto text-slate-200" />
  if (val === 'partial') return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-4 h-1 bg-amber-400 rounded-full" />
      <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Limited</span>
    </div>
  )
  return null
}
