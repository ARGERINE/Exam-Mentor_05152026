"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  Brain,
  Layers3,
  Clock3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECTS = [
  {
    id: '3e46469e-0f17-40e2-962b-999098b6f447',
    name: 'Physics',
    color: '#2563eb',
  },
  {
    id: '6ca51152-238f-457a-8d63-25e71e9cd0ea',
    name: 'Chemistry',
    color: '#059669',
  },
  {
    id: 'dfd1cb26-9fbb-46c5-a322-f3676e1103e3',
    name: 'Biology',
    color: '#d97706',
  },
]

const REVISION_MODES = [
  {
    key: 'smart',
    title: 'Smart Revision',
    description:
      'Hybrid cognitive recovery using incorrect, unstable, slow and spaced recall signals.',
    questions: 40,
    icon: Brain,
  },
  {
    key: 'focused',
    title: 'Focused Revision',
    description:
      'Target one specific weakness category with concentrated remediation.',
    questions: 30,
    icon: Layers3,
  },
  {
    key: 'memory',
    title: 'Memory Decay',
    description:
      'Spaced reinforcement session targeting medium & hard forgotten concepts.',
    questions: 30,
    icon: Clock3,
  },
]

const FOCUSED_OPTIONS = [
  'Incorrect Questions',
  'Low Confidence',
  'Slow Correct',
  'Skipped Questions',
  'Concept Instability',
  'Repeated Incorrect',
  'Numerical Avoidance',
]

export default function RevisionConfirmationPage() {
  const router = useRouter()

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const [selectedMode, setSelectedMode] = useState<string>('smart')

  const [focusedType, setFocusedType] = useState<string | null>(null)

  const activeMode = REVISION_MODES.find(
    (m) => m.key === selectedMode
  )

  const handleStartRevision = async () => {
    if (!selectedSubject) return

    const params = new URLSearchParams({
      mode: selectedMode,
      subject: selectedSubject,
      questions: String(activeMode?.questions || 30),
    })

    if (focusedType) {
      params.append('focus', focusedType)
    }

    router.push(`/exams/revision-attempt?${params.toString()}`)
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 flex flex-col items-center">
        <div className="max-w-[760px] w-full space-y-6 pb-20">

          <Button
            variant="ghost"
            onClick={() => router.push('/exams')}
            className="group text-slate-500 font-bold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Exams
          </Button>

          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">

            <CardHeader className="p-8 text-center space-y-4">

              <div className="mx-auto p-4 bg-primary/5 rounded-full w-fit">
                <RefreshCcw className="w-10 h-10 text-primary" />
              </div>

              <CardTitle className="text-3xl font-headline font-bold">
                Revision Engine
              </CardTitle>

              <CardDescription className="text-sm">
                Adaptive memory recovery & instability correction
              </CardDescription>

            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">

              {/* MODE SELECTOR */}

              <div className="space-y-4">

                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Revision Type
                </Label>

                <div className="grid md:grid-cols-3 gap-4">

                  {REVISION_MODES.map((mode) => {
                    const Icon = mode.icon

                    return (
                      <button
                        key={mode.key}
                        onClick={() => {
                          setSelectedMode(mode.key)
                          setFocusedType(null)
                        }}
                        className={cn(
                          "rounded-3xl border-2 p-5 text-left transition-all",
                          selectedMode === mode.key
                            ? "border-primary bg-primary/5"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        )}
                      >

                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-xl bg-slate-100">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>

                          <div>
                            <h3 className="font-bold text-sm">
                              {mode.title}
                            </h3>

                            <p className="text-[11px] text-slate-500">
                              {mode.questions} Questions
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {mode.description}
                        </p>

                      </button>
                    )
                  })}

                </div>
              </div>

              {/* FOCUSED OPTIONS */}

              {selectedMode === 'focused' && (

                <div className="space-y-4">

                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Focused Weakness Type
                  </Label>

                  <div className="grid grid-cols-2 gap-3">

                    {FOCUSED_OPTIONS.map((item) => (

                      <button
                        key={item}
                        onClick={() => setFocusedType(item)}
                        className={cn(
                          "rounded-2xl border p-4 text-sm font-medium transition-all",
                          focusedType === item
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-100 bg-slate-50 text-slate-700"
                        )}
                      >
                        {item}
                      </button>

                    ))}

                  </div>

                </div>

              )}

              {/* SUBJECTS */}

              <div className="space-y-4">

                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Choose Subject
                </Label>

                <div className="grid grid-cols-3 gap-3">

                  {SUBJECTS.map((s) => (

                    <button
                      key={s.name}
                      onClick={() => setSelectedSubject(s.id)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center",
                        selectedSubject === s.id
                          ? "border-primary bg-primary/5"
                          : "border-slate-50 bg-slate-50"
                      )}
                    >

                      <div
                        className="w-2 h-2 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: s.color }}
                      />

                      <span className="text-xs font-bold text-slate-700">
                        {s.name}
                      </span>

                    </button>

                  ))}

                </div>

              </div>

              {/* SESSION SUMMARY */}

              <div className="grid grid-cols-3 border-y py-5 text-center">

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Questions
                  </p>

                  <p className="text-sm font-bold">
                    {activeMode?.questions}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Duration
                  </p>

                  <p className="text-sm font-bold">
                    No limit
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Engine
                  </p>

                  <p className="text-sm font-bold text-primary truncate">
                    {activeMode?.title}
                  </p>
                </div>

              </div>

              {/* INFO */}

              <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100">

                <p className="text-[12px] text-amber-900 leading-relaxed text-center">

                  Revision sessions dynamically prioritize:
                  incorrect recall,
                  unstable memory traces,
                  low-confidence retrieval,
                  slow cognition,
                  taxonomy avoidance
                  and spaced reinforcement patterns.

                </p>

              </div>

              {/* START */}

              <Button
                disabled={
                  !selectedSubject ||
                  (selectedMode === 'focused' && !focusedType)
                }
                onClick={handleStartRevision}
                className="w-full h-14 rounded-2xl font-bold text-base shadow-xl"
              >

                Begin Revision

                <ArrowRight className="w-4 h-4 ml-2" />

              </Button>

            </CardContent>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )
}