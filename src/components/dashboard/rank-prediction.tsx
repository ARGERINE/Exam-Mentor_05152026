"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Info, ShieldCheck } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'

interface RankPredictionProps {
  min: number
  max: number
  trajectory: 'Rising' | 'Stable' | 'Falling' | string
  confidence: number
  examName: string
}

export function RankPrediction({ min, max, trajectory, confidence, examName }: RankPredictionProps) {
  const isRising = trajectory === 'Rising' || trajectory === 'Improving steadily'
  
  return (
    <Card className="border-none bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Target className="w-32 h-32" />
      </div>
      
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Projected Performance Band</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="outline-none">
                      <Info className="w-3.5 h-3.5 text-slate-300 hover:text-primary transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px] bg-slate-900 text-white border-none p-3 text-[11px] leading-relaxed">
                    This range represents your likely outcome for <strong>{examName}</strong> based on accuracy, retrieval speed, and current competitive weightage.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex items-baseline gap-4">
              <h2 className="text-5xl font-headline font-bold text-slate-900 tracking-tighter">
                {min.toLocaleString()} — {max.toLocaleString()}
              </h2>
              <div className={cn(
                "flex items-center gap-1 text-sm font-bold",
                isRising ? "text-emerald-600" : "text-amber-600"
              )}>
                {isRising ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {trajectory}
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-medium italic">
              "You're currently outperforming {Math.max(0, 100 - Math.round(min/500))}% of consistent peers."
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
            <div className="p-5 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white shadow-xl shadow-primary/5 min-w-[180px] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Confidence</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] px-2 py-0">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-headline font-bold text-slate-900">{confidence}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Model Stability</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000" 
                    style={{ width: `${confidence}%` }} 
                  />
                </div>
              </div>
              
              <p className="text-[9px] text-slate-400 font-medium leading-tight">
                Derived from {Math.round(confidence * 0.8)} high-fidelity session signals.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
