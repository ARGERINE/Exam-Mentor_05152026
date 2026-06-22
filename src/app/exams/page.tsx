
"use client"

import React from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const EXAM_TYPES = [
  { id: 'practice', title: 'Practice Mode', description: 'Chapter-wise learning and conceptual grounding', questions: 40, duration: 'No time limit', href: '/exams/practice' },
  { id: 'sectional', title: 'Sectional Test', description: 'Subject-specific assessment', questions: 50, duration: '60 minutes', href: '/exams/sectional' },
  { id: 'revision', title: 'Revision Mode', description: 'Targeted memory decay remediation', questions: 40, duration: 'No time limit', href: '/exams/revision' },
  { id: 'numerical-drill', title: 'Numerical Drill', description: 'Master calculation-intensive questions through focused numerical problem solving', questions: 30, duration: '90 minutes', href: '/exams/numerical-drill'
},
  { id: 'mock', title: 'Mock Test', description: 'Full-length NEET simulation', questions: 180, duration: '180 minutes', href: '/exams/mock' },
  { id: 'custom', title: 'Customized Exam', description: 'User defined parameters', questions: 'Custom', duration: 'Custom', href: '/exams/custom' },
]

export default function ExamsPage() {
  const router = useRouter()
  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30">
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
          <header className="space-y-1"><h1 className="text-4xl font-headline font-bold text-slate-900 tracking-tight">EXAMINATIONS</h1><p className="text-slate-500 text-lg font-medium">Select your testing specification</p></header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXAM_TYPES.map((exam) => (
              <Card key={exam.id} className="transition-all duration-300 rounded-3xl border-2 border-slate-100 bg-white hover:border-primary/20 hover:shadow-lg group">
                <CardContent className="p-6 space-y-6 flex flex-col h-full">
                  <div className="flex items-center gap-4"><div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors"><LayoutGrid className="w-5 h-5" /></div><h3 className="text-xl font-headline font-bold text-slate-900 leading-tight">{exam.title}</h3></div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{exam.description}</p>
                  <div className="space-y-4 pt-2 border-t border-slate-50"><div className="grid grid-cols-2 gap-4"><div><p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p><p className="text-sm font-bold text-slate-700">{exam.questions}</p></div><div><p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p><p className="text-sm font-bold text-slate-700">{exam.duration}</p></div></div></div>
                  <div className="pt-4 mt-auto"><Button onClick={() => router.push(exam.href)} className="w-full h-12 rounded-xl text-sm font-bold shadow-sm" variant="outline">Select Mode</Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </MentorLayout>
  )
}
