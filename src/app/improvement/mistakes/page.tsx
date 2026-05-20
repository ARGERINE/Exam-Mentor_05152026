
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  BookMarked, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  Filter,
  History,
  CheckCircle,
  Calendar,
  Clock,
  ArrowUpRight,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_NOTEBOOK = { totalMistakes: 142, resolvedThisWeek: 28, repeatedMistakes: 14 }
const MOCK_MISTAKES = [
  { id: '1', subject: 'PHYSICS', chapterName: 'Electrostatics', date: 'Oct 24, 2023', questionText: 'If the distance between two point charges is doubled, the force between them becomes one-fourth of its original value...', userAnswer: 'Coulomb\'s Law of Repulsion', correctAnswer: 'Coulomb\'s Inverse Square Law', conceptTag: 'Force Calculation', type: 'Incorrect', isRepeated: true, attempts: 2 },
  { id: '2', subject: 'BIOLOGY', chapterName: 'Genetics', date: 'Oct 23, 2023', questionText: 'A dihybrid cross between two heterozygotes following Mendel\'s law will yield a phenotypic ratio of...', userAnswer: '3:1', correctAnswer: '9:3:3:1', conceptTag: 'Dihybrid Cross', type: 'Incorrect', isRepeated: false, attempts: 1 },
  { id: '3', subject: 'CHEMISTRY', chapterName: 'Chemical Bonding', date: 'Oct 22, 2023', questionText: 'Which of the following molecules has the maximum dipole moment despite having a symmetrical structure?', userAnswer: 'CH4', correctAnswer: 'NH3', conceptTag: 'Molecular Geometry', type: 'Marked for Review', isRepeated: false, attempts: 1 },
  { id: '4', subject: 'PHYSICS', chapterName: 'Modern Physics', date: 'Oct 22, 2023', questionText: 'The work function of a metal surface is 2.0 eV. What is the maximum wavelength of light that can cause photoelectric emission?', userAnswer: '620 nm', correctAnswer: '621.2 nm', conceptTag: 'Photoelectric Effect', type: 'Incorrect', isRepeated: true, attempts: 3 },
  { id: '5', subject: 'BIOLOGY', chapterName: 'Cell Biology', date: 'Oct 21, 2023', questionText: 'Which organelle is referred to as the "powerhouse of the cell" and contains its own circular DNA?', userAnswer: 'Nucleus', correctAnswer: 'Mitochondria', conceptTag: 'Cell Organelles', type: 'Incorrect', isRepeated: false, attempts: 1 },
]

export default function MistakeNotebookPage() {
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortOrder, setSortBy] = useState('Most Recent')

  const filteredMistakes = useMemo(() => {
    return MOCK_MISTAKES.filter(m => {
      const subjectMatch = subjectFilter === 'All' || m.subject === subjectFilter.toUpperCase()
      const typeMatch = typeFilter === 'All' || m.type === typeFilter
      return subjectMatch && typeMatch
    })
  }, [subjectFilter, typeFilter])

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto space-y-8 pb-32">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3 text-primary"><BookMarked className="w-8 h-8" /><h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Mistake Notebook</h1></div>
              <p className="text-slate-500 text-lg font-medium">Every question you got wrong or flagged for review — organized for you</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11"><div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /><SelectValue placeholder="Subject" /></div></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="All">All Subjects</SelectItem><SelectItem value="Physics">Physics</SelectItem><SelectItem value="Chemistry">Chemistry</SelectItem><SelectItem value="Biology">Biology</SelectItem></SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11"><div className="flex items-center gap-2"><History className="w-3.5 h-3.5" /><SelectValue placeholder="Type" /></div></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="All">All Types</SelectItem><SelectItem value="Incorrect">Incorrect</SelectItem><SelectItem value="Skipped">Skipped</SelectItem><SelectItem value="Marked for Review">Marked for Review</SelectItem></SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] rounded-xl border-slate-200 bg-white shadow-sm font-bold text-xs h-11"><div className="flex items-center gap-2"><ArrowUpRight className="w-3.5 h-3.5" /><SelectValue placeholder="Sort" /></div></SelectTrigger>
                <SelectContent className="rounded-xl"><SelectItem value="Most Recent">Most Recent</SelectItem><SelectItem value="Most Attempts">Most Attempts</SelectItem><SelectItem value="Lowest Accuracy">Lowest Accuracy</SelectItem></SelectContent>
              </Select>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryChip label="Total Mistakes" value={MOCK_NOTEBOOK.totalMistakes} icon={AlertTriangle} color="text-slate-600" bg="bg-slate-100" />
            <SummaryChip label="Resolved this week" value={MOCK_NOTEBOOK.resolvedThisWeek} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
            <SummaryChip label="Repeated mistakes" value={MOCK_NOTEBOOK.repeatedMistakes} icon={History} color="text-amber-600" bg="bg-amber-50" />
          </section>

          <section className="space-y-4">
            {filteredMistakes.map((mistake) => (
              <MistakeCard key={mistake.id} mistake={mistake} />
            ))}
            {filteredMistakes.length === 0 && (
              <div className="py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] opacity-60"><BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No mistakes found for active filters</p></div>
            )}
          </section>
        </div>
      </main>
    </MentorLayout>
  )
}

function SummaryChip({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className={cn("flex items-center justify-between p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm", bg)}>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={cn("text-3xl font-headline font-bold", color)}>{value}</p>
      </div>
      <div className={cn("p-4 rounded-2xl", bg.replace('/50', '').replace('bg-', 'bg-white/50 text-'))}><Icon className={cn("w-6 h-6", color)} /></div>
    </div>
  )
}

function MistakeCard({ mistake }: { mistake: any }) {
  const subjectColors: any = { PHYSICS: "bg-blue-50 text-blue-600", CHEMISTRY: "bg-teal-50 text-teal-600", BIOLOGY: "bg-amber-50 text-amber-600" }
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-all group">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Badge className={cn("border-none font-bold text-[9px] uppercase px-3 py-1", subjectColors[mistake.subject])}>{mistake.subject}</Badge>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{mistake.chapterName}</h4>
            {mistake.isRepeated && <Badge className="bg-amber-50 text-amber-600 border border-amber-100 font-bold text-[9px] uppercase px-2 py-0.5">Repeated Mistake</Badge>}
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {mistake.date}</span>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-body font-medium text-slate-800 leading-relaxed line-clamp-2 italic">"{mistake.questionText}"</p>
          <button className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">See Full Question <ChevronRight className="w-2.5 h-2.5" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-rose-50/30 border border-rose-100/50 space-y-2"><p className="text-[9px] font-bold text-rose-400 uppercase tracking-[0.2em]">Your Answer</p><div className="flex items-center gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0" /><p className="text-sm font-bold text-rose-700">{mistake.userAnswer}</p></div></div>
          <div className="p-5 rounded-2xl bg-emerald-50/30 border border-emerald-100/50 space-y-2"><p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Correct Answer</p><div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /><p className="text-sm font-bold text-emerald-700">{mistake.correctAnswer}</p></div></div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3"><Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 font-bold text-[9px] uppercase px-3 py-1 rounded-lg">{mistake.conceptTag}</Badge><span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> {mistake.attempts} Attempts</span></div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-xl border-slate-200 h-10 px-6 font-bold text-[10px] uppercase gap-2">Attempt Again <Zap className="w-3.5 h-3.5" /></Button>
            <Button className="flex-1 sm:flex-none rounded-xl h-10 px-8 font-bold text-[10px] uppercase gap-2 shadow-lg">Mark Resolved <CheckCircle2 className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
