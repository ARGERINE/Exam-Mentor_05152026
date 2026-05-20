
"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RankProjection() {
  return (
    <Card className="border-none bg-gradient-to-br from-primary/5 via-background to-accent/5 shadow-sm overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm font-medium uppercase tracking-wider">Projected Performance Band</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    This range represents your likely outcome based on your last 14 days of activity.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-headline font-bold text-foreground">1,800 — 2,400</h2>
              <span className="text-xl text-muted-foreground font-light">Rank Range</span>
            </div>
            <p className="text-sm text-primary font-medium flex items-center gap-1.5 italic">
              <TrendingUp className="w-4 h-4" />
              Based on current trajectory
            </p>
          </div>
          
          <div className="p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase">Next Goal</p>
            <p className="text-sm font-semibold">Sub-1,500 Band</p>
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="bg-accent h-full w-2/3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
