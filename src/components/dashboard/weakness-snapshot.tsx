
"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AlertTriangle, Zap, Target } from 'lucide-react'

const weakZones = [
  { concept: "Inverse-Square Relationships", sub: "Physics", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  { concept: "Aromatic Substitution Logic", sub: "Chemistry", icon: Zap, color: "text-primary", bg: "bg-primary/5" },
  { concept: "Pedigree Analysis Speed", sub: "Biology", icon: Target, color: "text-accent", bg: "bg-accent/5" },
]

export function WeaknessSnapshot() {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-lg font-headline font-semibold">Weakness Snapshot</CardTitle>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Emerging conceptual patterns</p>
      </CardHeader>
      <CardContent className="px-0 pt-2 space-y-4">
        {weakZones.map((zone, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-default">
            <div className={`p-2.5 rounded-xl ${zone.bg} transition-transform group-hover:scale-110`}>
              <zone.icon className={`w-5 h-5 ${zone.color}`} />
            </div>
            <div className="flex-1 border-b border-muted pb-4">
              <p className="font-medium text-foreground">{zone.concept}</p>
              <p className="text-xs text-muted-foreground">{zone.sub}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
