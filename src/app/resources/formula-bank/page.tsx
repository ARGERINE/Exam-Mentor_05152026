
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Sigma, Bookmark, Star, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECTS = ['Physics', 'Chemistry', 'Biology']
const FORMULAS_DATA = [
  { id: 'f1', name: "Coulomb's Law", expression: "F = k · (q₁ · q₂) / r²", variables: "F: Force; q: Charges; r: Distance", chapter: "Electrostatics", subject: "Physics", tags: ["High Yield"], isBookmarked: true },
  { id: 'f2', name: "Gauss's Law", expression: "Φ = q_encl / ε₀", variables: "Φ: Electric Flux; q_encl: Enclosed Charge", chapter: "Electrostatics", subject: "Physics", tags: ["Advanced"], isBookmarked: false },
]

export default function FormulaBankPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState('Physics')

  const filteredFormulas = useMemo(() => {
    return FORMULAS_DATA.filter(f => f.subject === activeTab && f.name.toLowerCase().includes(search.toLowerCase()))
  }, [activeTab, search])

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-10 pb-32">
          <header className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-1"><div className="flex items-center gap-3 text-primary"><Sigma className="w-8 h-8" /><h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Formula Bank</h1></div><p className="text-slate-500 text-lg font-medium">Searchable reference library</p></div>
            </div>
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><Input placeholder="Search formulas..." className="pl-12 h-14 rounded-2xl border-none shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <Tabs defaultValue="Physics" onValueChange={setActiveTab}><TabsList className="bg-white p-1 h-12 rounded-xl border inline-flex">{SUBJECTS.map(sub => (<TabsTrigger key={sub} value={sub} className="rounded-lg px-8 text-xs font-bold uppercase">{sub}</TabsTrigger>))}</TabsList></Tabs>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFormulas.map((f) => (<FormulaCard key={f.id} formula={f} />))}
          </div>
        </div>
      </main>
    </MentorLayout>
  )
}

function FormulaCard({ formula }: { formula: any }) {
  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white p-8 space-y-6 group">
      <div className="flex justify-between items-start"><div className="space-y-1"><h4 className="text-lg font-bold text-slate-900">{formula.name}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formula.chapter}</p></div><Bookmark className="w-4 h-4 text-slate-300" /></div>
      <div className="p-6 bg-slate-950 rounded-2xl shadow-inner"><code className="text-xl font-bold text-emerald-400 font-mono block">{formula.expression}</code></div>
      <div className="space-y-2"><div className="flex items-center gap-2 text-slate-400"><Info className="w-3.5 h-3.5" /><p className="text-[9px] font-bold uppercase">Variables</p></div><p className="text-xs font-medium text-slate-500">{formula.variables}</p></div>
    </Card>
  )
}
