
"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { learningJourneyNarrative, LearningJourneyNarrativeOutput } from '@/ai/flows/learning-journey-narrative'
import { Quote } from 'lucide-react'

export function JourneyNarrative() {
  const [data, setData] = useState<LearningJourneyNarrativeOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNarrative() {
      try {
        const result = await learningJourneyNarrative({
          examType: "NEET",
          overallSummary: "You are showing great resilience in Biology.",
          performanceHighlights: ["Physics accuracy increased by 10% this week"],
          studyHabitsSummary: "You tend to study best in the mornings.",
          recentEfforts: "Deep dived into Genetics.",
          identifiedStrengths: ["Memory recall in Biology"],
          identifiedWeaknesses: ["Calculation speed in Physics"],
          causalAnalysisSummary: "Your focus drops after 40 minutes.",
          suggestedNextSteps: ["Take a 10min break every 45mins"]
        })
        setData(result)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchNarrative()
  }, [])

  if (loading) {
    return <Skeleton className="h-32 w-full rounded-2xl" />
  }

  return (
    <div className="flex gap-4 items-start">
      <Quote className="w-6 h-6 text-primary shrink-0" />
      <p className="text-lg leading-relaxed text-slate-700 font-body italic">
        "{data?.narrative}"
      </p>
    </div>
  )
}
