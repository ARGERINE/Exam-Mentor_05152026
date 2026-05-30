
"use client"

import React, { useEffect, useState } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { createAttempt } from '@/lib/attempts/createAttempt'
import { getSupabase } from '@/lib/supabase/client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { useRouter } from 'next/navigation'

import {
  Settings2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

type Subject = {
  id: string
  name: string
}

type Chapter = {
  id: string
  chapter_name: string
  subject_id: string
}

export default function CustomExamPage() {


  const router = useRouter()

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])

  const [questions, setQuestions] = useState(50)
  const [duration, setDuration] = useState(60)

  const [negativeMarking, setNegativeMarking] = useState(true)

  const [easyPercent, setEasyPercent] = useState(30)
  const [mediumPercent, setMediumPercent] = useState(50)
  const [hardPercent, setHardPercent] = useState(20)

  useEffect(() => {

    const fetchSubjects = async () => {

      const supabase = getSupabase()

      if (!supabase) return

      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')

      if (error) {
        console.error(error)
        return
      }

      setSubjects(data || [])
    }

    fetchSubjects()

  }, [])

  useEffect(() => {

    const fetchChapters = async () => {

      if (selectedSubjects.length === 0) {
        setChapters([])
        return
      }

      const supabase = getSupabase()

      if (!supabase) return

      const { data, error } = await supabase
        .from('chapters')
        .select('id, chapter_name, subject_id')
        .in('subject_id', selectedSubjects)

      if (error) {
        console.error(error)
        return
      }

      setChapters(data || [])
    }

    fetchChapters()

  }, [selectedSubjects])

  const toggleSubject = (subjectId: string) => {

  const alreadySelected = selectedSubjects.includes(subjectId)

  if (!alreadySelected && selectedSubjects.length >= 3) {

    alert('Maximum 3 subjects allowed')

    return
  }

  setSelectedSubjects((prev) => {

    if (prev.includes(subjectId)) {

      return prev.filter(id => id !== subjectId)
    }

    return [...prev, subjectId]
  })
}

  const toggleChapter = (chapterId: string, subjectId: string) => {

  const chaptersForSubject = selectedChapters.filter((id) => {

    const chapter = chapters.find(ch => ch.id === id)

    return chapter?.subject_id === subjectId
  })

  const alreadySelected = selectedChapters.includes(chapterId)

  if (!alreadySelected && chaptersForSubject.length >= 5) {

    alert('Maximum 5 chapters allowed per subject')

    return
  }

  setSelectedChapters((prev) => {

    if (prev.includes(chapterId)) {
      return prev.filter(id => id !== chapterId)
    }

    return [...prev, chapterId]
  })
}

const handleCustomExam = async () => {

  try {

    const attempt = await createAttempt({
      examId: 'c3801b25-0c19-489b-b60c-4f54bcc262c0',
      subject: selectedSubjects,
      chapter: selectedChapters,
      questions,
      duration,
      mode: 'custom',
    })

    if (!attempt?.attemptId) {

      console.error('Invalid attempt response')

      return
    }

    router.push(`/exams/attempt?attempt_id=${attempt.attemptId}`)

  } catch (err) {

    console.error('Custom exam failed:', err)

  }
}

useEffect(() => {

  setSelectedChapters((prev) => {

    return prev.filter((chapterId) => {

      const chapter = chapters.find(ch => ch.id === chapterId)

      if (!chapter) return false

      return selectedSubjects.includes(chapter.subject_id)
    })
  })

}, [selectedSubjects, chapters])
  return (

    <MentorLayout>

      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 flex flex-col items-center">

        <div className="max-w-[700px] w-full space-y-6 pb-20">

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

              {/* SUBJECTS */}

              <div className="space-y-4">

                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                  Select Subjects
                </Label>

                <div className="grid grid-cols-3 gap-3">

                  {subjects.map((subject) => (

                    <button
                      key={subject.id}
                      onClick={() => toggleSubject(subject.id)}
                      className={`
                      rounded-2xl border p-3 text-[12px] leading-tight
                      font-semibold transition-all break-words min-h-[72px]
                        ${selectedSubjects.includes(subject.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 bg-slate-50'}
                      `}
                    >
                      {subject.name}
                    </button>

                  ))}

                </div>

              </div>

              {/* CHAPTERS */}

              <div className="space-y-4">

  <Label className="text-[10px] font-bold text-slate-400 uppercase">
    Select Up To 5 Chapters Per Subject
  </Label>

  <div className="space-y-6 max-h-[400px] overflow-y-auto border rounded-2xl p-4">

    {selectedSubjects.map((subjectId) => {

      const subject = subjects.find(s => s.id === subjectId)

      const subjectChapters = chapters.filter(
        ch => ch.subject_id === subjectId
      )

      return (

        <div
          key={subjectId}
          className="space-y-3 border rounded-2xl p-4 bg-slate-50"
        >

          <h3 className="font-bold text-primary">
            {subject?.name}
          </h3>

          <div className="grid grid-cols-1 gap-2">

            {subjectChapters.map((chapter) => (

              <button
                key={chapter.id}
                onClick={() =>
                  toggleChapter(chapter.id, chapter.subject_id)
                }
                className={`
                  text-left rounded-xl p-3 text-sm transition-all
                  ${
                    selectedChapters.includes(chapter.id)
                      ? 'bg-primary text-white'
                      : 'bg-white border'
                  }
                `}
              >
                {chapter.chapter_name}
              </button>

            ))}

          </div>

        </div>

      )
    })}

  </div>

</div>

              {/* QUESTIONS */}

              <div className="space-y-4">

                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                  Questions
                </Label>

                <Input
                  type="number"
                  value={questions}
                  onChange={(e) => setQuestions(Math.min(200,Math.max(30, Number(e.target.value))))}
                  className="h-12 rounded-xl bg-slate-50 border-none"
                />

              </div>

              {/* DURATION */}

              <div className="space-y-4">

                <Label className="text-[10px] font-bold text-slate-400 uppercase">
                  Duration (Min)
                </Label>

                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="h-12 rounded-xl bg-slate-50 border-none"
                />

              </div>

              {/* NEGATIVE MARKING */}

              <div className="space-y-4">

  <Label className="text-[10px] font-bold text-slate-400 uppercase">
    Negative Marking
  </Label>

  <div className="flex gap-4">

    <button
      onClick={() => setNegativeMarking(true)}
      className={`
        px-6 py-3 rounded-xl font-semibold transition-all
        ${
          negativeMarking
            ? 'bg-primary text-white'
            : 'bg-slate-100'
        }
      `}
    >
      Yes
    </button>

    <button
      onClick={() => setNegativeMarking(false)}
      className={`
        px-6 py-3 rounded-xl font-semibold transition-all
        ${
          !negativeMarking
            ? 'bg-primary text-white'
            : 'bg-slate-100'
        }
      `}
    >
      No
    </button>

  </div>

</div>

              {/* BUTTON */}

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
