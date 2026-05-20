"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Timer, 
  Zap, 
  AlertTriangle, 
  Info, 
  ArrowUpRight,
  Gauge
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimeEfficiencyProps {
  avgTime: number
  status: 'optimal' | 'rushing' | 'slow'
  alerts: { id: string; type: 'warning' | 'info'; message: string }[]
}

export function TimeEfficiency({ avgTime, status, alerts }: TimeEfficiencyProps) {
  const statusConfig = {
    optimal: { color: "text-blue-500", bg: "bg-blue-50", bar: "bg-blue-500", label: "Competitive Velocity" },
    rushing: { color: "text-rose-500", bg: "bg-rose-50", bar: "bg-rose-500", label: "High Rush Risk" },
    slow: { color: "text-amber-500", bg: "bg-amber-50", bar: "bg-amber-500", label: "Execution Latency" }
  }

  const current = statusConfig[status]

  return (
    <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden border border-slate-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
        <div className="space-y-1">
          <CardTitle className="text-lg font-headline font-bold flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Time Economy
          </CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Diagnostic</p>
        </div>
        <Badge className={cn("px-3 py-1 rounded-lg border-none font-bold text-[9px] uppercase", current.bg, current.color)}>
          {current.label}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative">
            <div className="text-5xl font-headline font-bold text-slate-900 tracking-tighter">
              {avgTime}<span className="text-lg text-slate-400 ml-1">s</span>
            </div>
            <div className="absolute -top-4 -right-8 p-2 bg-slate-50 rounded-xl">
              <Timer className="w-4 h-4 text-slate-300" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Average per question</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
            <span>Velocity Index</span>
            <span className={current.color}>{status.toUpperCase()}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", current.bar)} 
              style={{ width: status === 'rushing' ? '30%' : status === 'optimal' ? '60%' : '90%' }} 
            />
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={cn(
              "p-4 rounded-2xl flex items-start gap-3 border",
              alert.type === 'warning' ? "bg-amber-50/50 border-amber-100" : "bg-blue-50/50 border-blue-100"
            )}>
              {alert.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              )}
              <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                "{alert.message}"
              </p>
            </div>
          ))}
        </div>

        <button className="w-full h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors flex items-center justify-center gap-2">
          View Subject Latency Map <ArrowUpRight className="w-3 h-3" />
        </button>
      </CardContent>
    </Card>
  )
}
