
"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { day: 'Mon', effort: 45, impact: 30 },
  { day: 'Tue', effort: 52, impact: 40 },
  { day: 'Wed', effort: 38, impact: 45 },
  { day: 'Thu', effort: 65, impact: 50 },
  { day: 'Fri', effort: 48, impact: 55 },
  { day: 'Sat', effort: 70, impact: 60 },
  { day: 'Sun', effort: 55, impact: 65 },
]

const chartConfig = {
  effort: {
    label: "Study Effort",
    color: "hsl(var(--primary))",
  },
  impact: {
    label: "Learning Impact",
    color: "hsl(var(--accent))",
  },
}

export function LearningRhythm() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-lg font-headline font-semibold">Consistency & Learning Rhythm</CardTitle>
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          "Your effort is steady, but impact fluctuates. Consider deep-work blocks."
        </p>
      </CardHeader>
      <CardContent className="px-0 pt-4">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEffort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-effort)" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="var(--color-effort)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-impact)" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="var(--color-impact)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="effort" 
              stroke="var(--color-effort)" 
              fillOpacity={1} 
              fill="url(#colorEffort)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="impact" 
              stroke="var(--color-impact)" 
              fillOpacity={1} 
              fill="url(#colorImpact)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
