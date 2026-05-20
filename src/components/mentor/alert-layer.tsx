
"use client"

import React, { useState, useEffect } from 'react'
import { AlertCircle, Zap, Coffee, RefreshCcw } from 'lucide-react'
import { proactiveStudyNudges, ProactiveStudyNudgesOutput } from '@/ai/flows/proactive-study-nudges-flow'
import { MOCK_STUDY_DATA } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const categoryIcons = {
  burnout_risk: Coffee,
  focus_improvement: Zap,
  retention_decay: RefreshCcw,
  general_guidance: AlertCircle,
}

const categoryColors = {
  burnout_risk: "bg-red-50 text-red-600 border-red-100",
  focus_improvement: "bg-amber-50 text-amber-600 border-amber-100",
  retention_decay: "bg-blue-50 text-blue-600 border-blue-100",
  general_guidance: "bg-green-50 text-green-600 border-green-100",
}

export function AlertLayer() {
  const [nudges, setNudges] = useState<ProactiveStudyNudgesOutput[]>([])

  useEffect(() => {
    async function fetchNudges() {
      try {
        const result = await proactiveStudyNudges(MOCK_STUDY_DATA)
        setNudges([result])
      } catch (e) {
        console.error(e)
      }
    }
    fetchNudges()
  }, [])

  if (nudges.length === 0) return null

  return (
    <div className="space-y-3">
      {nudges.map((nudge, i) => {
        const Icon = categoryIcons[nudge.nudgeCategory]
        return (
          <div 
            key={i} 
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border text-sm font-medium animate-in fade-in slide-in-from-top-2",
              categoryColors[nudge.nudgeCategory]
            )}
          >
            <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
              <Icon className="w-4 h-4" />
            </div>
            <p className="flex-1 leading-relaxed">{nudge.nudgeMessage}</p>
          </div>
        )
      })}
    </div>
  )
}
