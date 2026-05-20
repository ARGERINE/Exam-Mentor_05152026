"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Target, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Fingerprint
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionTypeData {
  format: string
  accuracy: number
  avgTime?: number
  status: 'strength' | 'vulnerable' | 'critical'
  insight: string
}

interface QuestionTypeAnalysisProps {
  data: QuestionTypeData[]
  className?: string
}

export function QuestionTypeAnalysis({ data, className }: QuestionTypeAnalysisProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] opacity-60">
        <Fingerprint className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No format data detected yet</p>
      </div>
    )
  }

  return (
    <Card className={cn("border-none shadow-sm bg-white rounded-3xl overflow-hidden border border-slate-100", className)}>
      <CardHeader className="pb-2 border-b border-slate-50 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Format Vulnerability
          </CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cognitive Format Diagnostic</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Analysis Confidence</p>
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <TrendingUp className="w-3 h-3" /> High
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-5">
          {data.map((type, i) => (
            <div key={i} className="space-y-2.5 group">
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{type.format}</p>
                    {type.avgTime && (
                      <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {type.avgTime}s avg
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 italic">"{type.insight}"</p>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[9px] font-bold border-none px-2 py-0",
                  type.status === 'strength' ? "bg-emerald-50 text-emerald-600" :
                  type.status === 'vulnerable' ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                )}>
                  {type.status}
                </Badge>
              </div>
              <div className="relative pt-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Accuracy</span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    type.status === 'strength' ? "text-emerald-600" :
                    type.status === 'vulnerable' ? "text-amber-600" : "text-rose-600"
                  )}>{type.accuracy}%</span>
                </div>
                <Progress value={type.accuracy} className={cn(
                  "h-1.5",
                  type.status === 'strength' ? "[&>div]:bg-emerald-500" :
                  type.status === 'vulnerable' ? "[&>div]:bg-amber-500" : "[&>div]:bg-rose-500"
                )} />
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 mt-2">
          <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
            <AlertTriangle className="w-3 h-3 inline mr-1 text-primary" />
            "Your stability drops significantly during 'Assertion-Reason' blocks. The mentor recommends a strategy shift to conceptual derivation."
          </p>
        </div>

        <button className="w-full h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-all flex items-center justify-center gap-2 group">
          Drill High-Risk Formats <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </CardContent>
    </Card>
  )
}
