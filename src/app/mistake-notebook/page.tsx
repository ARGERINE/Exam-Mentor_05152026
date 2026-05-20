
"use client"

import React, { useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { MOCK_ERROR_LOGS } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  BookMarked, 
  Search, 
  Zap, 
  CheckCircle2, 
  ChevronRight,
  Info,
  Sparkles,
  Filter,
  MessageSquareQuote,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { analyzeMistake, MistakeAnalysisOutput } from '@/ai/flows/mistake-notebook-flow'
import { cn } from '@/lib/utils'

export default function MistakeNotebookPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<MistakeAnalysisOutput | null>(null)
  const [loading, setLoading] = useState(false)
  
  const selectedMistake = useMemo(() => 
    MOCK_ERROR_LOGS.find(m => m.questionId === selectedId), 
  [selectedId])

  async function handleSelect(mistake: typeof MOCK_ERROR_LOGS[0]) {
    setSelectedId(mistake.questionId)
    setLoading(true)
    setAnalysis(null)
    try {
      const result = await analyzeMistake({
        questionText: mistake.questionText || '',
        subject: mistake.subject,
        topic: mistake.topic,
        errorType: mistake.errorType,
        repeatCount: mistake.repeatCount || 1,
        examType: "NEET"
      })
      setAnalysis(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30">
        <div className="max-w-7xl mx-auto space-y-8 pb-32">
          
          <header className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
              <BookMarked className="w-8 h-8" />
              <h1 className="text-4xl font-headline font-bold text-slate-900">Mistake Notebook</h1>
            </div>
            <p className="text-slate-500 text-lg italic">
              "Errors are the data points of your evolution."
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-4 pr-2">
              {MOCK_ERROR_LOGS.map((mistake) => (
                <Card 
                  key={mistake.questionId} 
                  className={cn(
                    "cursor-pointer border-none shadow-sm transition-all",
                    selectedId === mistake.questionId ? "ring-2 ring-primary" : "bg-white"
                  )}
                  onClick={() => handleSelect(mistake)}
                >
                  <CardContent className="p-5 space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-1">{mistake.topic}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 italic">"{mistake.questionText}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedMistake && (
                <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-10 space-y-8">
                  {loading ? (
                    <Skeleton className="h-64 w-full rounded-2xl" />
                  ) : analysis && (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-primary uppercase tracking-wider">Reflection Prompt</p>
                        <p className="text-2xl font-medium italic leading-relaxed text-slate-700">
                          "{analysis.reflectionPrompt}"
                        </p>
                      </div>
                      <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100">
                        <p className="text-sm leading-relaxed text-slate-600">"{analysis.patternSignal}"</p>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </MentorLayout>
  )
}
