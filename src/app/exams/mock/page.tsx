
"use client"

import React from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { createAttempt } from '@/lib/attempts/createAttempt'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MockConfirmationPage() {
  const router = useRouter()
  const handleStartMock = async () => {
  try {
    const attempt = await createAttempt({
  examId: '59242cb9-c0f7-4a97-923c-5ad0e9fd2d49'
})

    router.push(`/exams/attempt?attempt_id=${attempt.attemptId}`)

  } catch (err) {
    console.error("Failed to start mock:", err)
  }
}
  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 flex flex-col items-center">
        <div className="max-w-[520px] w-full space-y-6 pb-20">
          <Button variant="ghost" onClick={() => router.push('/exams')} className="group text-slate-500 font-bold rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" /> All Exams</Button>
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 text-center space-y-4"><div className="mx-auto p-4 bg-primary/5 rounded-full w-fit"><ClipboardList className="w-10 h-10 text-primary" /></div><CardTitle className="text-2xl font-headline font-bold">Full Mock Test</CardTitle><CardDescription className="text-sm">Standard NEET Simulation</CardDescription></CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-3 border-y py-4 -mx-2 text-center">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p><p className="text-sm font-bold">180</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p><p className="text-sm font-bold">180 min</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Mode</p><p className="text-sm font-bold text-primary">Standard</p></div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composition</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Physics</span><span className="text-xs font-bold text-slate-400">45 Qs</span></div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: '25%' }} /></div>
                  <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Biology</span><span className="text-xs font-bold text-slate-400">90 Qs</span></div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: '50%' }} /></div>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10"><p className="text-[11px] font-medium text-slate-600 text-center italic">This result will update your rank band and performance analytics.</p></div>
              <Button onClick={handleStartMock} className="w-full h-14 rounded-2xl font-bold text-base shadow-xl">Begin Examination <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )
}
