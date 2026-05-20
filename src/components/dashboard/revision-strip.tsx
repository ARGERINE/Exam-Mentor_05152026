
"use client"

import React from 'react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const revisionItems = [
  { topic: "Electrostatics", retention: 82, decay: "Fading soon", subject: "Physics" },
  { topic: "Cell Division", retention: 65, decay: "Critical", subject: "Biology" },
  { topic: "Chemical Bonding", retention: 90, decay: "Stable", subject: "Chemistry" },
  { topic: "Thermodynamics", retention: 45, decay: "Review now", subject: "Physics" },
  { topic: "Plant Kingdom", retention: 75, decay: "Softening", subject: "Biology" },
]

export function RevisionStrip() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-lg font-headline font-semibold">Revision Due</h3>
          <p className="text-sm text-muted-foreground">Topics requiring recall reinforcement</p>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {revisionItems.map((item, i) => (
            <div key={i} className="w-64 flex-shrink-0 p-5 bg-white rounded-2xl border border-muted shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{item.subject}</p>
                  <p className="font-semibold text-base truncate">{item.topic}</p>
                </div>
                <Badge variant="secondary" className="bg-muted text-[10px] uppercase font-bold tracking-tighter">
                  {item.decay}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Retention</span>
                  <span>{item.retention}%</span>
                </div>
                <Progress value={item.retention} className="h-1.5" />
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
