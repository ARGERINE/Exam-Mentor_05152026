"use client"

import React from 'react'
import { AlertCircle, Coffee, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BurnoutAlertBannerProps {
  level: 'low' | 'moderate' | 'high'
  message: string
}

/**
 * BurnoutAlertBanner
 * A high-visibility banner that surfaces when burnout thresholds are crossed.
 */
export function BurnoutAlertBanner({ level, message }: BurnoutAlertBannerProps) {
  // If the threshold isn't crossed (risk is low), don't render anything
  if (level === 'low') return null

  return (
    <div className={cn(
      "w-full p-5 mb-8 rounded-[2rem] border-2 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700 overflow-hidden relative group",
      level === 'high' 
        ? "bg-rose-50 border-rose-100 text-rose-900" 
        : "bg-amber-50 border-amber-100 text-amber-900"
    )}>
      {/* Decorative Background Icon */}
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
        <ShieldAlert className="w-24 h-24" />
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        <div className={cn(
          "p-4 rounded-2xl shrink-0 shadow-sm",
          level === 'high' ? "bg-white text-rose-600" : "bg-white text-amber-600"
        )}>
          {level === 'high' ? <AlertCircle className="w-7 h-7" /> : <Coffee className="w-7 h-7" />}
        </div>
        
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h4 className="font-headline font-bold text-xl tracking-tight leading-none">
            {level === 'high' ? 'Critical Burnout Signal' : 'Cognitive Fatigue Detected'}
          </h4>
          <p className="text-sm font-medium opacity-80 leading-relaxed italic max-w-2xl">
            "{message}"
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <Button 
            className={cn(
              "flex-1 sm:flex-none h-12 px-8 rounded-xl font-bold transition-all shadow-lg",
              level === 'high' 
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200" 
                : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
            )}
          >
            Accept Rest Protocol
          </Button>
        </div>
      </div>
    </div>
  )
}
