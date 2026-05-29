"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createAttempt } from "@/lib/attempts/createAttempt"

export default function RevisionAttemptPage() {

  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentStep, setCurrentStep] = useState(0)

  const focusParam = searchParams.get("focus") || ""

const focusLabels: Record<string, string> = {
  "Incorrect Questions":
    "Incorrect Questions",

  "Low Confidence":
    "Answers with Lower Confidence",

  "Concept Instability":
    "Concept Instability",

  "Slow Correct":
    "Correct Responses where you took extra time",

  "Memory Decay":
    "Memory Decay",

  "Unattempted":
    "Previously Unattempted Questions",
}

const focus =
  focusLabels[focusParam] ||
  "Personalized Revision"

  const steps = [
  {
    icon: "📖",
    title: "Checking your previous attempts",
    subtitle:
      "Reviewing incorrectly answered questions and learning history",
    bg: "bg-emerald-50 border-emerald-200",
  },

  {
    icon: "🎯",
    title: "Examining weakness patterns",
    subtitle: focus,
    bg: "bg-violet-50 border-violet-200",
  },

  {
    icon: "🧩",
    title: "Preparing your question pool",
    subtitle:
      "Selecting the most relevant questions for weakness elimination",
    bg: "bg-amber-50 border-amber-200",
  },

  {
    icon: "💡",
    title: "Remember",
    subtitle:
      "Focus on solving problems correctly rather than quickly. Accuracy creates Mastery.",
    bg: "bg-sky-50 border-sky-200",
  },
]

  useEffect(() => {

    const timer1 = setTimeout(() => setCurrentStep(1), 3000)
    const timer2 = setTimeout(() => setCurrentStep(2), 6000)
    const timer3 = setTimeout(() => setCurrentStep(3), 9000)

    const launchRevision = async () => {

      try {

        const startTime = Date.now()

        const subject = searchParams.get("subject")

        const questions = Number(
          searchParams.get("questions") || "40"
        )

        const result = await createAttempt({
          examId: "c5ada84e-f545-46dc-b637-0ac25b9ebc9e",
          mode: "revision",
          subject,
          questions,
        })

        const elapsed = Date.now() - startTime

        const MIN_LOADING_TIME = 12000

        if (elapsed < MIN_LOADING_TIME) {

          await new Promise(resolve =>
            setTimeout(
              resolve,
              MIN_LOADING_TIME - elapsed
            )
          )
        }

        router.push(
          `/exams/attempt?attempt_id=${result.attemptId}`
        )

      } catch (error) {

        console.error(error)

        router.push("/exams/revision")
      }
    }

    launchRevision()

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }

  }, [router, searchParams])

  return (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">

    <div className="w-full max-w-2xl">

      <div className="text-center mb-8">

        <div className="text-5xl mb-4">
          📚
        </div>

        <h1 className="text-3xl font-bold text-slate-800">
          Preparing Your Revision Session
        </h1>

        <p className="text-slate-500 mt-2">
          Personalizing your weakness elimination practice
        </p>

        <p className="text-sm text-slate-400 mt-1">
          This usually takes about 10–15 seconds
        </p>

      </div>

      <div className="space-y-4">

        {steps
          .filter((_, index) => index <= currentStep)
          .map((step, index) => (

            <div
              key={index}
              className={`border rounded-2xl p-5 shadow-sm ${step.bg}`}
            >

              <div className="flex items-center gap-4">

                <div className="text-3xl shrink-0">
                  {step.icon}
                </div>

                <div className="flex-1">

                  <h3 className="font-semibold text-slate-800">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600">
                    {step.subtitle}
                  </p>

                </div>

                <div className="text-xl">
                  {index < currentStep
                    ? "✅"
                    : "⏳"}
                </div>

              </div>

            </div>

          ))}

      </div>

      <div className="mt-8">

        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
            style={{
              width: `${[25, 50, 75, 100][currentStep]}%`,
            }}
          />

        </div>

        <div className="text-center mt-3 text-sm text-slate-500">

          {currentStep === 0 &&
            "Reviewing your past attempts and identifying mistakes..."}

          {currentStep === 1 &&
            `Analyzing ${focus.toLowerCase()} patterns...`}

          {currentStep === 2 &&
            "Selecting the most relevant questions for improvement..."}

          {currentStep === 3 &&
            "Finalizing your personalized revision session..."}

        </div>

      </div>

      {currentStep >= 3 && (

        <div className="mt-8 rounded-2xl border bg-white p-5 text-center">

          <div className="font-semibold text-slate-800 mb-2">
            🧠 Revision Strategy
          </div>

          <p className="text-sm text-slate-600">
            Your Revision Session is designed to strengthen
            forgotten concepts and recurring mistakes.

            <br />
            <br />

            Focus on solving correctly rather than quickly.

            <br />

            The objective is correction and retention,
            not speed.
          </p>

        </div>

      )}

    </div>

  </div>
  )
}
