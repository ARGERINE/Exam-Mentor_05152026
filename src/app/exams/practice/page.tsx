
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAttempt } from '@/lib/attempts/createAttempt';
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  { name: 'Physics', color: '#1a56db', chapters: ['Electrostatics', 'Magnetism', 'Optics'] },
  { name: 'Chemistry', color: '#0f6e56', chapters: ['Bonding', 'Thermodynamics', 'Kinetics'] },
  { name: 'Biology', color: '#854f0b', chapters: ['Genetics', 'Cell Cycle', 'Photosynthesis'] },
]

export default function PracticeConfirmationPage() {
  const router = useRouter()
  const handleStartPractice = async () => {
    console.log("CLICKED")
  
    if (!selectedSubject || !selectedChapter) {
      console.log("Missing selection")
      return
    }
  
    try {
      const attempt = await createAttempt({
  examId: '056f6347-d963-4c82-a3ec-eff587dfc99c',
})

console.log("Attempt:", attempt)

if (!attempt || !attempt.attemptId) {
  console.error("Invalid attempt response")
  return
}

router.push(`/exams/attempt?attempt_id=${attempt.attemptId}`)
  
    } catch (err) {
      console.error("Practice start failed:", err)
    }
  }
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 flex flex-col items-center">
        <div className="max-w-[520px] w-full space-y-6 pb-20">
          <Button variant="ghost" onClick={() => router.push('/exams')} className="group text-slate-500 font-bold rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" /> All Exams</Button>
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 text-center space-y-4"><div className="mx-auto p-4 bg-primary/5 rounded-full w-fit"><Zap className="w-10 h-10 text-primary" /></div><CardTitle className="text-2xl font-headline font-bold">Practice Mode</CardTitle><CardDescription className="text-sm">Conceptual learning session</CardDescription></CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="grid grid-cols-3 border-y py-4 -mx-2 text-center">
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p><p className="text-sm font-bold">40</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p><p className="text-sm font-bold">No limit</p></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase">Chapter</p><p className="text-sm font-bold text-primary truncate">{selectedChapter || '—'}</p></div>
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose Subject</Label>
                <div className="grid grid-cols-3 gap-3">
                  {SUBJECTS.map(s => (
                    <button
                    type="button"
                    key={s.name}
                    onClick={() => {
                      setSelectedSubject(s.name);
                      setSelectedChapter(null);
                    }}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all text-center",
                      selectedSubject === s.name
                        ? "border-primary bg-primary/5"
                        : "border-slate-50 bg-slate-50"
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-xs font-bold text-slate-700">{s.name}</span>
                  </button>
                  ))}
                </div>
              </div>
              {selectedSubject && (
                <div className="space-y-4 animate-in fade-in"><Label className="text-[10px] font-bold text-slate-400 uppercase">Choose Chapter</Label>
                  <Select value={selectedChapter || ''} onValueChange={setSelectedChapter}>
                    <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-xs"><SelectValue placeholder="Select a chapter..." /></SelectTrigger>
                    <SelectContent>{SUBJECTS.find(s => s.name === selectedSubject)?.chapters.map(ch => (<SelectItem key={ch} value={ch}>{ch}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              )}
              <Button disabled={!selectedChapter} onClick={handleStartPractice} className="w-full h-14 rounded-2xl font-bold text-base shadow-xl">Begin Practice <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )
}
