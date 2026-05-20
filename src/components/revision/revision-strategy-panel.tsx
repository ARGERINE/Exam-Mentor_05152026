
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  memoryDecayAnalysis, 
  MemoryDecayAnalysisOutput 
} from '@/ai/flows/memory-decay-analysis-flow'
import { useStudentStore } from '@/store/use-student-store'
import { Brain, Sparkles, Clock } from 'lucide-react'

export function RevisionStrategyPanel() {
  const { examContext, revision } = useStudentStore()
  const [data, setData] = useState<MemoryDecayAnalysisOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStrategy() {
      try {
        const result = await memoryDecayAnalysis({
          topics: [{ topicName: "Electrostatics", currentRetention: 65, lastStudiedDaysAgo: 4, difficultyLevel: 'medium' }],
          examType: examContext.toUpperCase()
        })
        setData(result)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchStrategy()
  }, [examContext])

  if (loading) return <Skeleton className="h-64 w-full rounded-3xl" />

  return (
    <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2.5rem] p-10">
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Brain className="w-8 h-8 text-emerald-400" />
          <h3 className="text-2xl font-bold">The Mentor's Revision Protocol</h3>
        </div>
        <p className="text-xl italic text-slate-300">"{data?.overallRecoveryStrategy}"</p>
      </CardContent>
    </Card>
  )
}
