
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Sigma, 
  Bookmark, 
  ChevronRight, 
  Star, 
  LayoutGrid, 
  Info,
  Clock,
  Sparkles,
  Zap,
  BookMarked
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * FormulaBankPage
 * A centralized reference library for high-yield formulas and equations.
 */

// --- Placeholder Data ---
const SUBJECTS = ['Physics', 'Chemistry', 'Biology']

const FORMULAS_DATA = [
  // PHYSICS: ELECTROSTATICS
  {
    id: 'f1',
    name: "Coulomb's Law",
    expression: "F = k · (q₁ · q₂) / r²",
    variables: "F: Electrostatic Force (N); q: Charges (C); r: Distance (m); k: 9 × 10⁹ Nm²/C²",
    chapter: "Electrostatics",
    subject: "Physics",
    tags: ["High Yield", "Fundamental"],
    isBookmarked: true
  },
  {
    id: 'f2',
    name: "Gauss's Law",
    expression: "Φ = q_encl / ε₀",
    variables: "Φ: Electric Flux; q_encl: Enclosed Charge; ε₀: Permittivity of Free Space",
    chapter: "Electrostatics",
    subject: "Physics",
    tags: ["Calculus Based", "Advanced"],
    isBookmarked: false
  },
  {
    id: 'f3',
    name: "Electric Potential (Point Charge)",
    expression: "V = k · q / r",
    variables: "V: Potential (Volts); k: Coulomb constant; q: Charge; r: Distance",
    chapter: "Electrostatics",
    subject: "Physics",
    tags: ["High Yield"],
    isBookmarked: false
  },
  {
    id: 'f4',
    name: "Capacitance (Parallel Plate)",
    expression: "C = ε₀ · A / d",
    variables: "C: Capacitance (F); ε₀: Permittivity; A: Plate Area; d: Separation",
    chapter: "Electrostatics",
    subject: "Physics",
    tags: ["Numericals", "Concept"],
    isBookmarked: true
  },
  // PHYSICS: MAGNETISM
  {
    id: 'f5',
    name: "Lorentz Force",
    expression: "F = q(E + v × B)",
    variables: "F: Total Force; E: Electric Field; v: Velocity; B: Magnetic Field",
    chapter: "Magnetism",
    subject: "Physics",
    tags: ["Vector", "High Yield"],
    isBookmarked: false
  },
  {
    id: 'f6',
    name: "Biot-Savart Law",
    expression: "dB = (μ₀/4π) · (I dl × r̂) / r²",
    variables: "B: Magnetic Field; μ₀: Permeability; I: Current; dl: Length element",
    chapter: "Magnetism",
    subject: "Physics",
    tags: ["Advanced", "Theory"],
    isBookmarked: false
  },
  {
    id: 'f7',
    name: "Ampere's Law",
    expression: "∮ B · dl = μ₀ · I",
    variables: "B: Field; dl: Line element; μ₀: Constant; I: Enclosed Current",
    chapter: "Magnetism",
    subject: "Physics",
    tags: ["Fundamental"],
    isBookmarked: false
  },
  {
    id: 'f8',
    name: "Magnetic Flux",
    expression: "Φ_B = B · A · cosθ",
    variables: "Φ_B: Flux (Webers); B: Field strength; A: Area; θ: Angle",
    chapter: "Magnetism",
    subject: "Physics",
    tags: ["Numericals"],
    isBookmarked: false
  },
  // PHYSICS: OPTICS
  {
    id: 'f9',
    name: "Mirror Formula",
    expression: "1/f = 1/v + 1/u",
    variables: "f: Focal length; v: Image distance; u: Object distance",
    chapter: "Optics",
    subject: "Physics",
    tags: ["High Yield", "Standard"],
    isBookmarked: true
  },
  {
    id: 'f10',
    name: "Snell's Law",
    expression: "n₁ sinθ₁ = n₂ sinθ₂",
    variables: "n: Refractive index; θ: Angle of incidence/refraction",
    chapter: "Optics",
    subject: "Physics",
    tags: ["Concept"],
    isBookmarked: false
  },
  {
    id: 'f11',
    name: "Lens Maker's Formula",
    expression: "1/f = (μ - 1)(1/R₁ - 1/R₂)",
    variables: "f: Focal length; μ: Refractive index; R: Radius of curvature",
    chapter: "Optics",
    subject: "Physics",
    tags: ["High Yield", "Numericals"],
    isBookmarked: false
  },
  {
    id: 'f12',
    name: "Magnification (Lens)",
    expression: "m = h' / h = v / u",
    variables: "m: Magnification; h': Image height; h: Object height; v, u: Distances",
    chapter: "Optics",
    subject: "Physics",
    tags: ["High Yield"],
    isBookmarked: false
  },
]

export default function FormulaBankPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState('Physics')
  const [activeChapter, setActiveChapter] = useState('All')
  const [bookmarks, setBookmarks] = useState<string[]>(['f1', 'f4', 'f9'])

  const filteredFormulas = useMemo(() => {
    return FORMULAS_DATA.filter(f => {
      const subjectMatch = f.subject === activeTab
      const chapterMatch = activeChapter === 'All' || f.chapter === activeChapter
      const searchMatch = f.name.toLowerCase().includes(search.toLowerCase()) || 
                          f.expression.toLowerCase().includes(search.toLowerCase()) ||
                          f.chapter.toLowerCase().includes(search.toLowerCase())
      return subjectMatch && chapterMatch && searchMatch
    })
  }, [activeTab, activeChapter, search])

  const chaptersForSubject = useMemo(() => {
    const list = FORMULAS_DATA.filter(f => f.subject === activeTab).map(f => f.chapter)
    return Array.from(new Set(list))
  }, [activeTab])

  const bookmarkedItems = useMemo(() => {
    return FORMULAS_DATA.filter(f => bookmarks.includes(f.id))
  }, [bookmarks])

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleScrollToChapter = (chapter: string) => {
    setActiveChapter(chapter)
    const element = document.getElementById(`chapter-${chapter}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-10 pb-32">
          
          {/* HEADER */}
          <header className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-primary">
                  <Sigma className="w-8 h-8" />
                  <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Formula Bank</h1>
                </div>
                <p className="text-slate-500 text-lg font-medium">Searchable formula and equation reference — available anytime</p>
              </div>
              <Badge variant="outline" className="bg-white border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
                {FORMULAS_DATA.length} Reference Nodes
              </Badge>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
              </div>
              <Input 
                placeholder="Search formulas, constants, equations..." 
                className="pl-12 h-14 rounded-2xl border-none shadow-sm bg-white focus:ring-2 focus:ring-primary text-base font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Tabs defaultValue="Physics" onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-white p-1 h-12 rounded-xl border border-slate-200 shadow-sm inline-flex">
                {SUBJECTS.map(sub => (
                  <TabsTrigger key={sub} value={sub} className="rounded-lg px-8 text-xs font-bold uppercase tracking-wider">
                    {sub}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </header>

          {/* BOOKMARKED SECTION */}
          {bookmarkedItems.length > 0 && !search && (
            <section className="animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-3 text-amber-600">
                  <Star className="w-5 h-5 fill-current" />
                  <h3 className="text-lg font-headline font-bold uppercase tracking-widest">Your Bookmarked Formulas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarkedItems.map((f) => (
                    <FormulaCard key={f.id} formula={f} isBookmarked={true} onToggle={() => toggleBookmark(f.id)} />
                  ))}
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            
            {/* SIDEBAR NAVIGATION */}
            <aside className="w-full lg:w-[200px] shrink-0 sticky top-0 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">Chapters</h4>
              <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <SidebarButton 
                  label="All Chapters" 
                  active={activeChapter === 'All'} 
                  onClick={() => setActiveChapter('All')} 
                />
                {chaptersForSubject.map(ch => (
                  <SidebarButton 
                    key={ch} 
                    label={ch} 
                    active={activeChapter === ch} 
                    onClick={() => handleScrollToChapter(ch)} 
                  />
                ))}
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 space-y-12">
              {chaptersForSubject.map(chapter => {
                const formulasInChapter = filteredFormulas.filter(f => f.chapter === chapter)
                if (formulasInChapter.length === 0) return null

                return (
                  <section key={chapter} id={`chapter-${chapter}`} className="space-y-6 animate-in fade-in duration-700">
                    <div className="flex items-center gap-4 px-2">
                      <div className="h-px flex-1 bg-slate-200" />
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">{chapter}</h3>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formulasInChapter.map((f) => (
                        <FormulaCard 
                          key={f.id} 
                          formula={f} 
                          isBookmarked={bookmarks.includes(f.id)} 
                          onToggle={() => toggleBookmark(f.id)} 
                        />
                      ))}
                    </div>
                  </section>
                )
              })}

              {filteredFormulas.length === 0 && (
                <div className="py-32 text-center space-y-4 bg-white/50 border-2 border-dashed border-slate-200 rounded-[3rem] opacity-60">
                  <Search className="w-12 h-12 text-slate-300 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-slate-900 font-bold uppercase tracking-widest text-sm">No matches found</p>
                    <p className="text-slate-500 text-xs font-medium">Try searching for different keywords or subject tags.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </MentorLayout>
  )
}

function SidebarButton({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap",
        active ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600 hover:bg-white"
      )}
    >
      {label}
    </button>
  )
}

function FormulaCard({ formula, isBookmarked, onToggle }: { formula: any, isBookmarked: boolean, onToggle: () => void }) {
  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden group hover:shadow-md transition-all">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{formula.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formula.chapter}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={cn(
              "p-2 rounded-xl transition-all",
              isBookmarked ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-300 hover:text-slate-500"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
          </button>
        </div>

        <div className="p-6 bg-slate-950 rounded-2xl relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sigma className="w-12 h-12 text-white" />
          </div>
          <code className="text-xl md:text-2xl font-bold text-emerald-400 font-mono tracking-tight block relative z-10">
            {formula.expression}
          </code>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <p className="text-[9px] font-bold uppercase tracking-widest">Variable Protocol</p>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
              {formula.variables}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
            {formula.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-400 border-none font-bold text-[8px] uppercase px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
