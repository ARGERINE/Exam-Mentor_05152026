// SUPABASE MIGRATION PLACEHOLDER
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Sparkles, ArrowRight, X, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { useStudentStore } from '@/store/use-student-store'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function NextBestAction() {
  const { user, loading: isUserLoading } = useSupabaseUser()
  const router = useRouter()
  const { examContext } = useStudentStore()
  const [isVisible, setIsVisible] = useState(true)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Replaces useCollection - Fetch from Supabase recommendations table
    const timer = setTimeout(() => {
      setRecommendations([])
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [user])

  const topAction = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return null;
    const priorityMap: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...recommendations].sort((a, b) => {
      const weightA = priorityMap[a.priority as string] ?? 99;
      const weightB = priorityMap[b.priority as string] ?? 99;
      return weightA - weightB;
    })[0];
  }, [recommendations]);

  const handleAction = () => {
    if (!topAction) return;
    switch (topAction.type) {
      case 'practice': router.push('/exams/practice'); break;
      case 'review': router.push('/improvement/revision'); break;
      case 'strategic_study': router.push('/study-plan'); break;
      case 'topic_deep_dive': router.push('/analytics'); break;
      case 'test_simulation': router.push('/mock-analysis'); break;
      default: router.push('/dashboard');
    }
  };

  if (isLoading || !topAction) return null;

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-8 right-8 z-50 bg-primary p-4 rounded-full shadow-2xl hover:scale-110 transition-all pulse-accent border-4 border-white"
      >
        <Brain className="w-6 h-6 text-primary-foreground" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white/90 backdrop-blur-2xl border border-primary/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] rounded-[2.5rem] overflow-hidden">
        <div className="p-7 space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">Strategic Pivot</p>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-xl font-headline font-bold leading-tight text-foreground tracking-tight">
              {topAction.description}
            </h4>
            <div className="flex items-start gap-2">
              <div className="w-1 h-4 bg-accent rounded-full mt-1 shrink-0" />
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                "{topAction.contextInsight}"
              </p>
            </div>
          </div>

          <div className="pt-3">
            <Button 
              onClick={handleAction}
              className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group text-base font-bold"
            >
              <span>Take Action</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </div>
        </div>
        <div className="bg-primary/5 px-7 py-3 border-t border-primary/10">
          <p className="text-[9px] font-bold text-center text-primary/50 uppercase tracking-tighter">
            Evolving based on your learning rhythm
          </p>
        </div>
      </div>
    </div>
  )
}