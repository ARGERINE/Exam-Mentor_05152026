"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle, 
  Zap, 
  Target, 
  Binary, 
  Fingerprint,
  ChevronRight,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Pattern {
  title: string
  accuracyTrend: number
  errorFrequency: number
  interpretation: string
}

interface ErrorPatternSnapshotProps {
  patterns: Pattern[]
  className?: string
}

export function ErrorPatternSnapshot({ patterns, className }: ErrorPatternSnapshotProps) {
  if (!patterns || patterns.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] opacity-60">
        <Fingerprint className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No patterns detected yet</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4", className)}>
      {patterns.slice(0, 4).map((pattern, i) => {
        const severity = pattern.accuracyTrend < 40 ? 'critical' : pattern.accuracyTrend < 60 ? 'vulnerable' : 'stabilizing'
        
        return (
          <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden group">
            <CardContent className="p-0 flex items-stretch">
              {/* Severity Sidebar */}
              <div className={cn(
                "w-1.5",
                severity === 'critical' ? "bg-rose-500" : severity === 'vulnerable' ? "bg-amber-500" : "bg-blue-500"
              )} />
              
              <div className="flex-1 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors">{pattern.title}</h4>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold border-none px-2 py-0",
                      severity === 'critical' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {pattern.errorFrequency}% Frequency
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-1">
                    "{pattern.interpretation}"
                  </p>
                </div>

                <div className="w-full sm:w-32 space-y-2">
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase text-slate-400">
                    <span>Accuracy</span>
                    <span className={cn(
                      severity === 'critical' ? "text-rose-500" : "text-slate-700"
                    )}>{Math.round(pattern.accuracyTrend)}%</span>
                  </div>
                  <Progress value={pattern.accuracyTrend} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
