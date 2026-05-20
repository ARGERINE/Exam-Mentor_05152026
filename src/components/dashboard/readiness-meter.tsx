"use client"

import React from 'react'
import { cn } from "@/lib/utils"

interface ReadinessMeterProps {
  score: number
  className?: string
}

export function ReadinessMeter({ score, className }: ReadinessMeterProps) {
  // SVG Circle calculations
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getStatus = (s: number) => {
    if (s <= 40) return { text: "Not Ready", color: "text-rose-500", stroke: "stroke-rose-500", bg: "bg-rose-50" }
    if (s <= 75) return { text: "Improving", color: "text-amber-500", stroke: "stroke-amber-500", bg: "bg-amber-50" }
    return { text: "Ready", color: "text-emerald-500", stroke: "stroke-emerald-500", bg: "bg-emerald-50" }
  }

  const status = getStatus(score)

  return (
    <div className={cn("flex flex-col items-center justify-center group", className)}>
      <div className="relative w-28 h-28">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90 transform">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-100"
          />
          {/* Progress Circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000 ease-out", status.stroke)}
          />
        </svg>
        {/* Score Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-headline font-bold text-slate-900 leading-none">{score}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Index</span>
        </div>
      </div>
      
      {/* Dynamic Status Badge */}
      <div className={cn(
        "mt-4 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
        status.bg,
        status.color
      )}>
        {status.text}
      </div>
    </div>
  )
}
