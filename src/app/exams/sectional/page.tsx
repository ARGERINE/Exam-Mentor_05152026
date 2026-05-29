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

const SUBJECTS = [
  { name: "Physics", color: "#1a56db" },
  { name: "Chemistry", color: "#0f6e56" },
  { name: "Biology", color: "#854f0b" },
];

export default function SectionalPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleStart = async () => {
    if (!selectedSubject) return;

    try {
      const subjectMap: Record<string, string> = {
  Physics: '3e46469e-0f17-40e2-962b-999098b6f447',
  Chemistry: '6ca51152-238f-457a-8d63-25e71e9cd0ea',
  Biology: 'dfd1cb26-9fbb-46c5-a322-f3676e1103e3',
};

const attempt = await createAttempt({
  examId: 'edb6ec98-6423-4b55-9998-c68281bc60fa',
  subject: subjectMap[selectedSubject],
  mode: 'sectional',
});

if (!attempt || !attempt.attemptId) {
  console.error("Invalid attempt response");
  return;
}

router.push(`/exams/attempt?attempt_id=${attempt.attemptId}`);
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
                Sectional Test
              </CardTitle>

              <CardDescription className="text-sm">
                Focused subject-specific assessment
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-0 space-y-8">

              {/* Stats */}
              <div className="grid grid-cols-3 border-y py-4 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Questions</p>
                  <p className="text-sm font-bold">50</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                  <p className="text-sm font-bold">60 min</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subject</p>
                  <p className="text-sm font-bold text-primary truncate">
                    {selectedSubject || "—"}
                  </p>
                </div>
              </div>

              {/* Subject Selection */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest">
                  Choose Subject
                </Label>

                <div className="grid grid-cols-3 gap-3">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSelectedSubject(s.name)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-center",
                        selectedSubject === s.name
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

              {/* CTA */}
              <Button
                disabled={!selectedSubject}
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