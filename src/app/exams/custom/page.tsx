"use client"

import React, { useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { createAttempt } from '@/lib/attempts/createAttempt'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Settings2, ArrowLeft, ArrowRight } from 'lucide-react'

export default function CustomExamPage() {
  const router = useRouter()

  const [questions, setQuestions] = useState(50)
  const [duration, setDuration] = useState(60)

  const handleCustomExam = async () => {
    try {
      const attempt = await createAttempt({
        examCode: 'NEET',
        attemptType: 'custom',
        config: {
          questions,
          duration
        }
      })

      if (!attempt || !attempt.id) {
        console.error("Invalid attempt response")
        return
      }

      router.push(`/exams/attempt?attempt_id=${attempt.id}`)

    } catch (err) {
      console.error("Custom exam failed:", err)
    }
  }

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 flex flex-col items-center">
        <div className="max-w-[520px] w-full space-y-6 pb-20">

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
                <Settings2 className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline font-bold">
                Custom Exam
              </CardTitle>
              <CardDescription className="text-sm">
                Personalized difficulty & parameters
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">

              {/* Questions */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                  Questions
                </Label>
                <Input
                  type="number"
                  value={questions}
                  onChange={(e) => setQuestions(Number(e.target.value))}
                  className="h-12 rounded-xl bg-slate-50 border-none"
                />
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                  Duration (min)
                </Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-12 rounded-xl bg-slate-50 border-none"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[11px] font-medium text-amber-800 text-center italic">
                  Difficulty levels will be applied as per your configuration.
                </p>
              </div>

              <Button
                onClick={handleCustomExam}
                className="w-full h-14 rounded-2xl font-bold text-base shadow-xl"
              >
                Initiate Custom Exam
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

            </CardContent>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )
}