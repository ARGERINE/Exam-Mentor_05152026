"use client"

import React, { useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Star, AlertCircle, Info, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// --- Data Model (Strict) ---
const syllabusData = {
  Physics: [
    { name: "Physical World & Measurement", difficulty: "Easy", type: "Concept", priority: "Low", revision: "Low" },
    { name: "Units & Measurements", difficulty: "Easy", type: "Numerical", priority: "Medium", revision: "Medium" },
    { name: "Motion in Straight Line", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Motion in Plane", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Laws of Motion", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Work, Energy & Power", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Rotational Motion", difficulty: "Hard", type: "Numerical", priority: "High", revision: "Very High" },
    { name: "Gravitation", difficulty: "Medium", type: "Numerical", priority: "Medium", revision: "Medium" },
    { name: "Mechanical Properties (Solids)", difficulty: "Easy", type: "Concept", priority: "Low", revision: "Low" },
    { name: "Mechanical Properties (Fluids)", difficulty: "Medium", type: "Concept+Numerical", priority: "Medium", revision: "Medium" },
    { name: "Thermal Properties", difficulty: "Easy", type: "Concept", priority: "Low", revision: "Low" },
    { name: "Thermodynamics", difficulty: "Medium", type: "Concept+Numerical", priority: "High", revision: "High" },
    { name: "Kinetic Theory", difficulty: "Easy", type: "Concept", priority: "Low", revision: "Low" },
    { name: "Oscillations", difficulty: "Medium", type: "Numerical", priority: "Medium", revision: "Medium" },
    { name: "Waves", difficulty: "Medium", type: "Numerical", priority: "Medium", revision: "Medium" },
    { name: "Electrostatics", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Capacitance", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Current Electricity", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Magnetism (Moving Charges)", difficulty: "Hard", type: "Numerical", priority: "High", revision: "Very High" },
    { name: "Magnetism & Matter", difficulty: "Easy", type: "Concept", priority: "Low", revision: "Low" },
    { name: "EMI", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "AC", difficulty: "Medium", type: "Numerical", priority: "Medium", revision: "Medium" },
    { name: "EM Waves", difficulty: "Easy", type: "Remember", priority: "Low", revision: "Low" },
    { name: "Ray Optics", difficulty: "Medium", type: "Numerical", priority: "High", revision: "High" },
    { name: "Wave Optics", difficulty: "Hard", type: "Concept+Numerical", priority: "Medium", revision: "Medium" },
    { name: "Atoms", difficulty: "Easy", type: "Concept", priority: "Medium", revision: "Medium" },
    { name: "Dual Nature", difficulty: "Easy", type: "Concept", priority: "Medium", revision: "Medium" },
    { name: "Nuclei", difficulty: "Easy", type: "Remember", priority: "Medium", revision: "Medium" },
    { name: "Semiconductor", difficulty: "Easy", type: "Concept", priority: "High", revision: "High" }
  ],

  Chemistry: [
    { name: "Basic Concepts", priority: "Medium" },
    { name: "Structure of Atom", priority: "High" },
    { name: "Equilibrium", priority: "High" },
    { name: "Redox", priority: "Medium" },
    { name: "Solutions", priority: "Medium" },
    { name: "Electrochemistry", priority: "High" },
    { name: "Kinetics", priority: "High" },
    { name: "Periodicity", priority: "Medium" },
    { name: "Chemical Bonding", priority: "High" },
    { name: "p-Block", priority: "High" },
    { name: "d & f Block", priority: "Medium" },
    { name: "Coordination", priority: "High" },
    { name: "GOC", priority: "High" },
    { name: "Hydrocarbons", priority: "Medium" },
    { name: "Purification", priority: "Low" },
    { name: "Haloalkanes", priority: "Medium" },
    { name: "Alcohols/Phenols", priority: "High" },
    { name: "Aldehydes/Ketones", priority: "High" },
    { name: "Amines", priority: "High" },
    { name: "Biomolecules", priority: "Medium" },
    { name: "Practical Chemistry", priority: "Low" }
  ],

  Biology: [
    { name: "The Living World", priority: "Low" },
    { name: "Biological Classification", priority: "Medium" },
    { name: "Plant Kingdom", priority: "Medium" },
    { name: "Morphology", priority: "Medium" },
    { name: "Anatomy", priority: "Medium" },
    { name: "Photosynthesis", priority: "High" },
    { name: "Respiration", priority: "High" },
    { name: "Plant Growth", priority: "Medium" },
    { name: "Mineral Nutrition", priority: "Low" },
    { name: "Transport in Plants", priority: "Medium" },
    { name: "Cell", priority: "High" },
    { name: "Biomolecules", priority: "High" },
    { name: "Cell Cycle", priority: "High" },
    { name: "Animal Kingdom", priority: "High" },
    { name: "Structural Organisation", priority: "Medium" },
    { name: "Breathing", priority: "Medium" },
    { name: "Circulation", priority: "High" },
    { name: "Excretion", priority: "Medium" },
    { name: "Locomotion", priority: "Low" },
    { name: "Neural Control", priority: "High" },
    { name: "Chemical Coordination", priority: "High" },
    { name: "Digestion", priority: "Medium" },
    { name: "Evolution", priority: "High" },
    { name: "Inheritance", priority: "High" },
    { name: "Molecular Basis", priority: "High" },
    { name: "Human Health & Disease", priority: "High" },
    { name: "Sexual Reproduction (Plants)", priority: "Medium" },
    { name: "Biotechnology (Principles)", priority: "High" },
    { name: "Biotechnology (Applications)", priority: "High" },
    { name: "Organisms & Populations", priority: "Medium" },
    { name: "Ecosystem", priority: "Medium" },
    { name: "Biodiversity", priority: "Medium" },
    { name: "Environmental Issues", priority: "Low" },
    { name: "Human Reproduction", priority: "High" },
    { name: "Reproductive Health", priority: "Medium" },
    { name: "Microbes", priority: "Medium" }
  ]
};

// --- Reusable Component: ChapterCard ---
interface ChapterCardProps {
  name: string;
  priority: string;
  coverage: number;
  accuracy: number;
}

function Column(props: { title: string; data: any[] }) {
  const { title, data } = props;
  return (
    <div className="space-y-2">
      
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
        {title}
      </h3>

      <div className="space-y-2">
        {data.map((ch, i) => (
          <ChapterCard key={i} {...ch} />
        ))}
      </div>

    </div>
  );
}
function ChapterCard(props: any) {
  const { name, priority, coverage, accuracy } = props;
  // Mock random percentages for prototype
  // Using seed-like logic based on name to keep them stable during re-renders
  
  const getStars = (p: string) => {
    if (p === "High") return 4;
    if (p === "Medium") return 2;
    return 1;
  };

  const getStatusColor = (cov: number, acc: number, pri: string) => {
    if (pri === "High" && acc < 50) return "bg-rose-300"; // Soft Red
    if (acc > 75 && cov > 75) return "bg-blue-300"; // Soft Blue
    if (acc > 60) return "bg-emerald-300"; // Soft Green
    return "bg-amber-300"; // Soft Yellow
  };

const safeCoverage = coverage ?? 0;
const safeAccuracy = accuracy ?? 0;
const gap = safeCoverage - safeAccuracy;
const statusColor = getStatusColor(safeCoverage, safeAccuracy, priority);
const stars = getStars(priority);

return (
  <div className="relative group pr-3 w-full">
    
    {/* Status Dot */}
    <div
      className={cn(
        "absolute -right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full",
        statusColor
      )}
    />

    <Card className="rounded-lg border border-slate-100 shadow-none bg-white">
      <CardContent className="flex items-center min-h-[64px] p-0">

        {/* LEFT SECTION */}
        <div className="w-[55%] min-w-0 p-2 flex items-center">
          <div className="flex items-start justify-between w-full gap-2">

            {/* Name + Gap */}
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-slate-800 truncate">
                {name}
              </h3>

              {gap > 20 && (
                <Badge className="text-[9px] px-1.5 py-0.5 mt-1">
                  GAP
                </Badge>
              )}
            </div>

            {/* Stars */}
            <div className="flex gap-[2px] shrink-0 mt-[2px]">
              {[1, 2, 3, 4].map(i => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i <= stars
                      ? "fill-[#FF0066] text-[#FF0066]"
                      : "text-slate-200"
                  )}
                />
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-[45%] min-w-[120px] p-2 border-l border-slate-100 flex flex-col gap-1">

          {/* Coverage */}
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Coverage</span>
              <span className="font-semibold">{safeCoverage}%</span>
            </div>
            <div className="h-[2px] bg-slate-100 rounded">
              <div
                className="h-full bg-slate-300"
                style={{ width: `${safeCoverage}%` }}
              />
            </div>
          </div>

          {/* Accuracy */}
          <div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-500">Accuracy</span>
              <span className="font-semibold">{safeAccuracy}%</span>
            </div>
            <div className="h-[2px] bg-slate-100 rounded">
              <div
                className="h-full bg-slate-700"
                style={{ width: `${safeAccuracy}%` }}
              />
            </div>
          </div>

        </div>

      </CardContent>
    </Card>
  </div>
); 
}
const categorizeChapter = (coverage: number, accuracy: number, priority: string) => {
  if (priority === "High" && accuracy < 50) return "gap";
  if (accuracy > 70 && coverage > 70) return "strong";
  return "improving";
};

// --- Main Page Component ---
export default function SyllabusCoveragePage() {
const [expandedSubjects, setExpandedSubjects] = React.useState<Record<string, boolean>>({});

const toggleExpand = (subject: string) => {
  setExpandedSubjects((prev) => ({
    ...prev,
    [subject]: !prev[subject]
  }));
};
  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto space-y-12 pb-32">
          
          <header className="space-y-2">
            <h1 className="text-[24px] font-headline font-bold text-slate-900 tracking-tight">Syllabus Intelligence</h1>
            <p className="text-slate-500 text-sm font-medium">Deep dive into completion depth and retrieval accuracy across all high-yield topics.</p>
          </header>

          <div className="space-y-16">
            {Object.entries(syllabusData).map(([subject, chapters]) => (
              <section key={subject} className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h2 className="text-[20px] font-bold text-slate-800 tracking-tight">{subject}</h2>
                  <Badge variant="secondary" className="bg-white border-slate-200 text-slate-500 font-bold px-3 py-1 rounded-lg">
                    {chapters.length} Chapters
                  </Badge>
                </div>
{/* --- NEW GROUPING LOGIC --- */}
{(() => {
  
  type ChapterCategory = 'gap' | 'improving' | 'strong';

type GroupedChapter = {
  name: string;
  priority: string;
  coverage: number;
  accuracy: number;
};

  const grouped: Record<ChapterCategory, GroupedChapter[]> = {
  gap: [],
  improving: [],
  strong: []
};

  (chapters as any[]).forEach((ch) => {
    const seed = ch.name.length;
    const coverage = 30 + (seed % 61);
    const accuracy = 30 + ((seed * 7) % 61);
  
    const category = categorizeChapter(coverage, accuracy, ch.priority);
  
    grouped[category].push({
      name: ch.name,
      priority: ch.priority,
      coverage: coverage,
      accuracy: accuracy
    });
  });
  
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <Column
      title="Critical Learning Gaps"
      data={
       expandedSubjects[subject]
        ? grouped.gap
        : grouped.gap.slice(0, 5)
      }
    />

      <Column
        title="Improving Consistently"
        data={
         expandedSubjects[subject]
          ? grouped.improving
          : grouped.improving.slice(0, 5)
      }
    />

      <Column
        title="Strength Areas"
        data={
         expandedSubjects[subject]
          ? grouped.strong
          : grouped.strong.slice(0, 5)
      }
    />
      </div>

      <div className="flex justify-center pt-3">
      <button
  onClick={() => toggleExpand(subject)}
  className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
>
  {expandedSubjects[subject] ? "Show Less" : "See More"}

  <ChevronDown
    className={`w-4 h-4 transition-transform ${
      expandedSubjects[subject] ? "rotate-180" : ""
    }`}
  />
</button>
    </div>
    </>
  );
})()}
            </section>
            ))}
          </div>
        </div>
      </main>
    </MentorLayout>
  )
}