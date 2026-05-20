// SUPABASE MIGRATION PLACEHOLDER
"use client"

import React, { useState, useEffect } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Lock, 
  AlertTriangle,
  Info,
  Mail
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { user, loading } = useSupabaseUser()
  const [plan, setPlan] = useState<any>(null)

  useEffect(() => {
    // Replaces useDoc(planRef) from Firebase
    // Fetch plan from Supabase when needed.
  }, [user])

  const handleReset = async () => {
    // Revert to baseline logic
    toast({
      title: "Plan Reset Initiated",
      description: "Your adaptive adjustments have been cleared. Reverting to baseline.",
    })
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30">
        <div className="max-w-4xl mx-auto space-y-10 pb-32">
          
          <header className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">My Account</h1>
            <p className="text-slate-500 text-lg">Manage your profile, preferences, and system governance.</p>
          </header>

          {/* Section 1: Profile Information */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-100">
            <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/5 rounded-xl">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">Profile Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display Name</p>
                  <p className="text-base font-bold text-slate-700">{user?.user_metadata?.full_name || 'Student'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-base font-bold text-slate-700">{user?.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Preferences */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-100">
            <CardHeader className="border-b border-slate-50 bg-slate-50/20 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <Settings className="w-5 h-5 text-amber-500" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">Platform Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-700">Adaptive Difficulty</p>
                  <p className="text-sm text-slate-500 font-medium italic">Mentor automatically adjusts load based on real-time accuracy.</p>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px] px-4 py-1.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  ENABLED
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Study Plan Governance */}
          <section className="space-y-8">
            <div className="space-y-2 px-2">
              <h2 className="text-2xl font-headline font-bold text-slate-900">Study Plan Governance</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">
                Your study plan follows a structured progression. Changes are controlled to maintain consistency and performance stability.
              </p>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <GovernanceCard 
                label="Current Plan" 
                value={plan ? "Baseline Plan" : "No Plan Active"} 
                isBold 
              />
              <GovernanceCard 
                label="Last Updated" 
                value={plan?.generated_at ? format(new Date(plan.generated_at), 'dd/MM/yyyy') : 'N/A'} 
              />
              <GovernanceCard 
                label="Next Scheduled Review" 
                value="In 2 weeks" 
              />
            </div>

            {/* Plan State Indicator */}
            <Card className="border-none shadow-sm rounded-[1.25rem] bg-white p-6 border border-slate-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-base font-bold text-slate-900">Governance Status</p>
                    <p className="text-sm text-slate-500 font-medium italic">System is actively managing your plan cycle for maximum retention.</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500 text-white border-none font-bold text-[11px] px-6 py-2.5 rounded-full shadow-lg shadow-emerald-100 uppercase tracking-widest">
                  Plan Locked
                </Badge>
              </div>
            </Card>

            {/* Actions Section */}
            <Card className="border-none shadow-sm rounded-[1.5rem] bg-white border border-slate-100 overflow-hidden">
              <CardHeader className="bg-slate-50/20 px-8 py-6 border-b border-slate-50">
                <CardTitle className="text-base font-bold text-slate-900 uppercase tracking-widest">Plan Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" className="rounded-2xl border-slate-200 h-14 px-8 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                    Request Early Review
                  </Button>
                  <Button variant="outline" disabled className="rounded-2xl border-slate-200 h-14 px-8 font-bold text-slate-300 opacity-50 cursor-not-allowed">
                    Lock Current Plan
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-rose-100 hover:scale-[1.02] transition-transform">
                        Reset to Baseline Plan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] p-10 border-none shadow-2xl">
                      <AlertDialogHeader className="space-y-6">
                        <div className="mx-auto p-5 bg-rose-50 rounded-full w-fit">
                          <AlertTriangle className="w-10 h-10 text-rose-500" />
                        </div>
                        <div className="space-y-2 text-center">
                          <AlertDialogTitle className="text-2xl font-headline font-bold text-slate-900">Revert to Baseline?</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-500 text-base leading-relaxed px-4">
                            This will discard your current progress-based adjustments and revert to your original baseline plan. This action cannot be undone.
                          </AlertDialogDescription>
                        </div>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-10">
                        <AlertDialogCancel className="rounded-2xl h-14 px-10 font-bold border-slate-200 mt-0 hover:bg-slate-50">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReset} className="rounded-2xl h-14 px-10 font-bold bg-rose-500 hover:bg-rose-600 border-none shadow-lg shadow-rose-100">
                          Confirm Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* System Rule Message */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-start shadow-inner">
                  <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic uppercase tracking-tight">
                    Your baseline study plan remains locked for a defined period to ensure stability. Adaptive changes are introduced only during scheduled reviews.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </main>
    </MentorLayout>
  )
}

function GovernanceCard({ label, value, isBold }: { label: string, value: string, isBold?: boolean }) {
  return (
    <Card className="bg-white border border-slate-200 p-6 rounded-[1.25rem] shadow-sm flex flex-col justify-between gap-3 hover:border-primary/20 transition-colors">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
      <p className={cn("text-base text-slate-700 tracking-tight", isBold && "font-bold text-slate-900 text-lg")}>{value}</p>
    </Card>
  )
}