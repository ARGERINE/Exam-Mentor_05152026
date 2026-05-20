"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Map as MapIcon, 
  ArrowLeft, 
  ArrowRight, 
  ChevronRight, 
  Search, 
  Layers, 
  Zap, 
  Brain,
  Info,
  Network,
  Maximize2,
  Filter,
  Sigma,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ConceptMapsPage
 * A visual knowledge graph browser allowing students to see syllabus interconnections.
 */

// --- Mock Data ---
const MOCK_MAPS = [
  {
    id: 'm1',
    chapterName: "Electrostatics",
    subject: "Physics",
    conceptCount: 12,
    relatedChapters: ["Magnetism", "Capacitance"],
    coverage: 85,
    concepts: [
      { name: "Coulomb's Law", description: "Describes the force between two stationary electrical charges.", relatedFormulas: "F = k(q1q2)/r²", appearsIn: ["Gravitation", "Atomic Structure"] },
      { name: "Gauss's Law", description: "Relates the distribution of electric charge to the resulting electric field.", relatedFormulas: "Φ = q/ε₀", appearsIn: ["Magnetism", "Calculus"] },
      { name: "Electric Potential", description: "Work done to move a unit charge from infinity to a point.", relatedFormulas: "V = W/q", appearsIn: ["Current Electricity"] }
    ]
  },
  {
    id: 'm2',
    chapterName: "Chemical Bonding",
    subject: "Chemistry",
    conceptCount: 15,
    relatedChapters: ["Structure of Atom", "Organic Chemistry"],
    coverage: 72,
    concepts: [
      { name: "Hybridization", description: "Mixing atomic orbitals to form new hybrid orbitals.", relatedFormulas: "Steric Number Rule", appearsIn: ["Organic Chemistry", "P-Block"] },
      { name: "VSEPR Theory", description: "Predicts the geometry of individual molecules.", relatedFormulas: "Bond Angle Calculations", appearsIn: ["Molecular Biology"] }
    ]
  },
  {
    id: 'm3',
    chapterName: "Genetics",
    subject: "Biology",
    conceptCount: 22,
    relatedChapters: ["Evolution", "Molecular Basis"],
    coverage: 64,
    concepts: [
      { name: "Mendelian Laws", description: "Principles of inheritance including dominance and segregation.", relatedFormulas: "9:3:3:1 Ratio", appearsIn: ["Evolution"] }
    ]
  },
  {
    id: 'm4',
    chapterName: "Thermodynamics",
    subject: "Physics",
    conceptCount: 18,
    relatedChapters: ["Equilibrium", "Kinetic Theory"],
    coverage: 45,
    concepts: [
      { name: "Entropy", description: "Measure of molecular disorder or randomness.", relatedFormulas: "ΔS = ΔQ/T", appearsIn: ["Chemistry Equilibrium"] }
    ]
  },
  {
    id: 'm5',
    chapterName: "Equilibrium",
    subject: "Chemistry",
    conceptCount: 14,
    relatedChapters: ["Thermodynamics", "Redox"],
    coverage: 58,
    concepts: []
  },
  {
    id: 'm6',
    chapterName: "Magnetism",
    subject: "Physics",
    conceptCount: 11,
    relatedChapters: ["Electrostatics", "EMI"],
    coverage: 92,
    concepts: []
  },
  {
    id: 'm7',
    chapterName: "Organic Chemistry",
    subject: "Chemistry",
    conceptCount: 30,
    relatedChapters: ["Bonding", "Hydrocarbons"],
    coverage: 32,
    concepts: []
  },
  {
    id: 'm8',
    chapterName: "Optics",
    subject: "Physics",
    conceptCount: 16,
    relatedChapters: ["Wave Nature", "Atoms"],
    coverage: 78,
    concepts: []
  }
]

export default function ConceptMapsPage() {
  const [view, setView] = useState<'browser' | 'detail'>('browser')
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null)
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0)
  const [subjectFilter, setSubjectFilter] = useState('All')

  const selectedMap = useMemo(() => 
    MOCK_MAPS.find(m => m.id === selectedMapId), 
  [selectedMapId])

  const filteredMaps = useMemo(() => {
    return MOCK_MAPS.filter(m => subjectFilter === 'All' || m.subject === subjectFilter)
  }, [subjectFilter])

  const handleOpenMap = (id: string) => {
    setSelectedMapId(id)
    setSelectedConceptIndex(0)
    setView('detail')
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto space-y-8 pb-32">
          
          {view === 'browser' ? (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* BROWSER HEADER */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 text-primary">
                    <MapIcon className="w-8 h-8" />
                    <h1 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">Concept Maps</h1>
                  </div>
                  <p className="text-slate-500 text-lg font-medium">Visualise how topics connect across your syllabus</p>
                </div>

                <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                  {['All', 'Physics', 'Chemistry', 'Biology'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSubjectFilter(f)}
                      className={cn(
                        "px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                        subjectFilter === f ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </header>

              {/* MAP GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredMaps.map((map) => (
                  <Card key={map.id} className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden group hover:shadow-md transition-all">
                    <CardContent className="p-0">
                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <Badge variant="secondary" className={cn(
                              "border-none font-bold text-[9px] uppercase px-3 py-1",
                              map.subject === 'Physics' ? "bg-blue-50 text-blue-600" :
                              map.subject === 'Chemistry' ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"
                            )}>
                              {map.subject}
                            </Badge>
                            <h3 className="text-2xl font-headline font-bold text-slate-900 group-hover:text-primary transition-colors">{map.chapterName}</h3>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-2xl">
                            <Network className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>

                        {/* MINI GRAPH PLACEHOLDER */}
                        <div className="h-40 w-full bg-slate-50 rounded-3xl relative overflow-hidden flex items-center justify-center">
                          <svg width="200" height="120" viewBox="0 0 200 120" className="opacity-20">
                            <circle cx="100" cy="60" r="8" fill="currentColor" className="text-primary" />
                            <circle cx="60" cy="30" r="5" fill="currentColor" className="text-primary" />
                            <circle cx="140" cy="30" r="5" fill="currentColor" className="text-primary" />
                            <circle cx="60" cy="90" r="5" fill="currentColor" className="text-primary" />
                            <circle cx="140" cy="90" r="5" fill="currentColor" className="text-primary" />
                            <line x1="100" y1="60" x2="60" y2="30" stroke="currentColor" strokeWidth="2" />
                            <line x1="100" y1="60" x2="140" y2="30" stroke="currentColor" strokeWidth="2" />
                            <line x1="100" y1="60" x2="60" y2="90" stroke="currentColor" strokeWidth="2" />
                            <line x1="100" y1="60" x2="140" y2="90" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {map.relatedChapters.map(ch => (
                              <Badge key={ch} variant="outline" className="text-[8px] font-bold uppercase tracking-tighter border-slate-100 text-slate-400">
                                {ch}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold text-slate-600">{map.conceptCount} Key Concepts</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Mastery</p>
                                <p className="text-xs font-black text-slate-900">{map.coverage}%</p>
                              </div>
                              <Progress value={map.coverage} className="w-16 h-1" />
                            </div>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleOpenMap(map.id)}
                          className="w-full h-12 rounded-xl font-bold text-xs gap-2 group/btn"
                        >
                          Open Map <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* DETAIL HEADER */}
              <header className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setView('browser')} className="rounded-xl font-bold text-slate-500 hover:bg-white group">
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> All Maps
                </Button>
                <div className="text-center">
                  <h2 className="text-2xl font-headline font-bold text-slate-900">{selectedMap?.chapterName}</h2>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">{selectedMap?.subject}</p>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-200 h-10 px-6 font-bold text-xs text-slate-600 hover:bg-white">
                  <Maximize2 className="w-3.5 h-3.5 mr-2" /> Fullscreen
                </Button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
                {/* LARGE GRAPH AREA */}
                <Card className="border-none shadow-xl bg-slate-900 rounded-[3rem] overflow-hidden relative min-h-[500px] flex items-center justify-center">
                  {/* GRAPH BACKGROUND SVG */}
                  <svg className="absolute inset-0 w-full h-full opacity-10">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>

                  <div className="relative w-full h-full p-10">
                    {/* Mock Graph Nodes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <GraphNode label={selectedMap?.chapterName || ''} isCentral size="lg" />
                    </div>
                    
                    {selectedMap?.concepts.map((c, i) => {
                      const angle = (i * (360 / (selectedMap.concepts.length || 1))) * (Math.PI / 180)
                      const radius = 160
                      const x = Math.cos(angle) * radius
                      const y = Math.sin(angle) * radius
                      
                      return (
                        <div 
                          key={i} 
                          className="absolute top-1/2 left-1/2 transition-all duration-700"
                          style={{ 
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                          }}
                        >
                          <GraphNode 
                            label={c.name} 
                            active={selectedConceptIndex === i} 
                            onClick={() => setSelectedConceptIndex(i)}
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="absolute bottom-8 left-10 flex gap-6 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" /> Core Topic
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full border border-white/40" /> Dependent Concept
                    </div>
                  </div>
                </Card>

                {/* RIGHT INFO PANEL */}
                <aside className="space-y-6">
                  {selectedMap?.concepts[selectedConceptIndex] ? (
                    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-right-4 duration-500">
                      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Concept Detail</p>
                          <CardTitle className="text-xl font-headline font-bold text-slate-900 leading-tight">
                            {selectedMap.concepts[selectedConceptIndex].name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Info className="w-4 h-4" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Description</h4>
                          </div>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                            "{selectedMap.concepts[selectedConceptIndex].description}"
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-primary">
                            <Sigma className="w-4 h-4" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Key Formula</h4>
                          </div>
                          <div className="p-4 bg-slate-950 rounded-2xl shadow-inner group relative overflow-hidden">
                            <code className="text-base font-bold text-emerald-400 font-mono tracking-tight block truncate">
                              {selectedMap.concepts[selectedConceptIndex].relatedFormulas}
                            </code>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Layers className="w-4 h-4" />
                            <h4 className="text-[10px] font-bold uppercase tracking-widest">Cross-Chapter Appearance</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedMap.concepts[selectedConceptIndex].appearsIn.map(tag => (
                              <Badge key={tag} variant="secondary" className="bg-slate-50 text-slate-500 border-none font-bold text-[9px] uppercase px-3 py-1">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 gap-3 group">
                          View Study Notes <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10 text-center space-y-4 opacity-60">
                      <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
                        <Zap className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Select a node in the graph to view conceptual intelligence
                      </p>
                    </Card>
                  )}

                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-4">
                    <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                      This map is generated based on recent exam weightage and cross-subject dependencies.
                    </p>
                  </div>
                </aside>
              </div>
            </div>
          )}

        </div>
      </main>
    </MentorLayout>
  )
}

function GraphNode({ label, isCentral = false, active = false, size = 'md', onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-300 relative group",
        isCentral ? "bg-primary text-white shadow-2xl scale-110 z-20" : 
        active ? "bg-white text-primary border-4 border-primary scale-110 z-10" : 
        "bg-slate-800 text-slate-400 border border-slate-700 hover:border-white hover:text-white",
        size === 'lg' ? "w-28 h-28 p-4" : "w-16 h-16 p-2"
      )}
    >
      <span className={cn(
        "font-bold text-center leading-tight tracking-tight",
        size === 'lg' ? "text-sm" : "text-[9px]"
      )}>{label}</span>
      
      {/* Decorative pulse for active node */}
      {active && (
        <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 scale-150" />
      )}
      
      {/* Connector line back to center placeholder */}
      {!isCentral && (
        <div className="absolute top-1/2 left-1/2 h-0.5 bg-white/5 pointer-events-none -z-10 origin-left" style={{ width: '160px', transform: 'rotate(180deg)' }} />
      )}
    </button>
  )
}
