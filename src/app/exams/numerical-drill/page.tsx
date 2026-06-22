"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createAttempt } from "@/lib/attempts/createAttempt";

import { MentorLayout } from "@/components/layout/mentor-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBJECTS = [
  { name: "Physics", color: "#1a56db" },
  { name: "Chemistry", color: "#0f6e56" },
  ];

export default function NumericalDrillPage() {

  const router = useRouter()

  const [selectedSubject, setSelectedSubject] =
    useState<string | null>(null)

  const [selectedChapter, setSelectedChapter] =
    useState<string | null>(null)

    const [subjects, setSubjects] = useState<any[]>([])
    const [chapters, setChapters] = useState<any[]>([])
    useEffect(() => {

  const fetchSubjects = async () => {

    const supabase = getSupabase()

    if (!supabase) return

    const { data, error } = await supabase
      .from("subjects")
      .select("id, name")
      .in("name", ["PHYSICS", "CHEMISTRY"])

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

    if (!selectedSubject) return

    const supabase = getSupabase()

    if (!supabase) return

    const { data, error } = await supabase
      .from("chapters")
      .select("id, chapter_name")
      .eq("subject_id", selectedSubject)
      .in("chapter_type", [
        "Numerical",
        "Concept+Numerical",
      ])

    if (error) {
      console.error(error)
      return
    }

    setChapters(data || [])
  }

  fetchChapters()

}, [selectedSubject])



  const handleStart = async () => {
    if (!selectedSubject || !selectedChapter) return;

    try {
      
const attempt = await createAttempt({
  examId: '9ee23566-8e81-4c5d-98cc-43eb2fb74b5c',
  mode: 'numerical_drill',
  subject: selectedSubject,
  chapter: selectedChapter,
})

if (!attempt || !attempt.attemptId) {
  console.error("Invalid attempt response");
  return;
}

router.push(`/exams/attempt?attempt_id=${attempt.attemptId}`)
    } catch (err) {
      console.error("Sectional start failed:", err);
    }
  };

  return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 flex flex-col items-center">
        <div className="max-w-[520px] w-full space-y-6 pb-20">

          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push("/exams")}
            className="group text-slate-500 font-bold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Exams
          </Button>

          {/* Card */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">

            <CardHeader className="p-8 text-center space-y-4">
              <div className="mx-auto p-4 bg-primary/5 rounded-full w-fit">
                <LayoutGrid className="w-10 h-10 text-primary" />
              </div>

              <CardTitle className="text-2xl font-bold">
                Numerical Drill
              </CardTitle>

              <CardDescription className="text-sm">
                Focused Numerical Problem Solving Practice
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">

              {/* Stats */}
              <div className="grid grid-cols-3 border-y py-4 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p>
                  <p className="text-sm font-bold">30</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                  <p className="text-sm font-bold">90 min</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subject</p>
                  </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest">
                  Choose Subject
                </Label>

                <div className="grid grid-cols-3 gap-3">
                  {subjects.map((subject) => (

  <button
    type="button"
    key={subject.id}
    onClick={() => {
      setSelectedSubject(subject.id)
      setSelectedChapter(null)
    }}
    className={cn(
      "p-4 rounded-2xl border-2 transition-all text-center",
      selectedSubject === subject.id
        ? "border-primary bg-primary/5"
        : "border-slate-50 bg-slate-50"
    )}
  >

    <div className="w-2 h-2 rounded-full mx-auto mb-2 bg-primary" />

    <span className="text-xs font-bold text-slate-700">
      {subject.name}
    </span>

  </button>

))}
{selectedSubject && (

  <div className="space-y-4">

    <Label className="text-[10px] font-bold uppercase tracking-widest">
      Choose Chapter
    </Label>

    <Select
      value={selectedChapter || ""}
      onValueChange={setSelectedChapter}
    >

      <SelectTrigger className="rounded-xl h-12 bg-slate-50 border-none font-bold text-xs">

        <SelectValue placeholder="Select a numerical chapter..." />

      </SelectTrigger>

      <SelectContent>

        {chapters.map((chapter) => (

          <SelectItem
            key={chapter.id}
            value={chapter.id}
          >
            {chapter.chapter_name}
          </SelectItem>

        ))}

      </SelectContent>

    </Select>

  </div>

)}
                </div>
              </div>

              {/* CTA */}
              <Button
                disabled={!selectedSubject || !selectedChapter}
                onClick={handleStart}
                className="w-full h-14 rounded-2xl font-bold text-base"
              >
                Begin Test
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

            </CardContent>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )
}