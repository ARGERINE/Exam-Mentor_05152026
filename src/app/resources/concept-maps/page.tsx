
"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Map as MapIcon, Network, ChevronRight } from 'lucide-react'

const MOCK_MAPS = [
  { id: 'm1', chapterName: "Electrostatics", subject: "Physics", conceptCount: 12, relatedChapters: ["Magnetism"], coverage: 85 },
  { id: 'm2', chapterName: "Chemical Bonding", subject: "Chemistry", conceptCount: 15, relatedChapters: ["Structure of Atom"], coverage: 72 },
]

export default function ConceptMapsPage() {
  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
          <header className="space-y-1"><div className="flex items-center gap-3 text-primary"><MapIcon className="w-8 h-8" /><h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Concept Maps</h1></div><p className="text-slate-500 text-lg font-medium">Visualise how topics connect across your syllabus</p></header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {MOCK_MAPS.map((map) => (
              <Card key={map.id} className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start"><div className="space-y-1"><Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold text-[9px] uppercase px-3 py-1">{map.subject}</Badge><h3 className="text-2xl font-headline font-bold text-slate-900">{map.chapterName}</h3></div><div className="p-3 bg-slate-50 rounded-2xl"><Network className="w-5 h-5 text-slate-400" /></div></div>
                  <div className="h-40 w-full bg-slate-50 rounded-3xl flex items-center justify-center relative"><span className="text-slate-200 font-bold uppercase tracking-widest text-[10px]">Graph Visual Placeholder</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-600">{map.conceptCount} Key Concepts</span></div><span className="text-xs font-black text-slate-900">Mastery: {map.coverage}%</span></div>
                  <Button className="w-full h-12 rounded-xl font-bold text-xs gap-2 group/btn">Open Map <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </MentorLayout>
  )
}
