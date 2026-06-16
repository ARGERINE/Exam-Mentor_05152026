"use client"

/**
 * My Learning Calendar — NEET Learning Workflow Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Route:  /study-plan/learning-calendar
 *
 * COMPLETELY INDEPENDENT of My Study Plan, Study Plan Versions, Roadmap,
 * Plan History.
 *
 * Supabase tables READ:
 *   user_baselines, chapters, subjects, chapter_performance, attempts
 *
 * Supabase tables WRITE (created on first generation if absent):
 *   learning_calendar, learning_calendar_items, scheduler_rules
 *
 * Workflow per chapter:
 *   LEARNING → P1 → P2 → QR1 → P3 → QR2 → (Mock Phase)
 *
 * Completion Gate:
 *   P1 Attempted  +  P1 Score ≥ 40%  +  Student Marks Complete
 *
 * Calendar anchor = calendar_generated_at (never re-anchors to today).
 */

import React, {
  useCallback, useEffect, useMemo, useState,
} from "react"
import { useRouter } from "next/navigation"

import { MentorLayout }  from "@/components/layout/mentor-layout"
import { Badge }         from "@/components/ui/badge"
import { Button }        from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress }      from "@/components/ui/progress"
import { Skeleton }      from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label }         from "@/components/ui/label"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"

import { supabase }        from "@/lib/supabase/client"
import { useSupabaseUser } from "@/lib/supabase/hooks"
import { createAttempt }   from "@/lib/attempts/createAttempt"
import { cn }              from "@/lib/utils"

import {
  addDays, differenceInDays, eachDayOfInterval, endOfMonth,
  format, getDay, isSameDay, isSameMonth, isToday, parseISO,
  startOfMonth, subDays, addMonths, subMonths, isAfter, isBefore,
  startOfDay, startOfWeek, endOfWeek, addWeeks, getQuarter, getYear,
  startOfQuarter, endOfQuarter, eachMonthOfInterval,
} from "date-fns"

import {
  AlertCircle, AlertTriangle, BookOpen, Calendar, Check, CheckCircle2,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Circle, Clock, Flame, GraduationCap, Lock, PlayCircle,
  RefreshCw, RotateCcw, Sparkles, Star, TrendingDown, TrendingUp,
  Zap, ShieldAlert, BookMarked, FlaskConical, Leaf,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Stage = "LEARNING" | "NUMERICAL_DRILL" | "P1" | "P2" | "QR1" | "P3" | "QR2"
type ActivityType = | "LEARNING" | "NUMERICAL_DRILL" | "PRACTICE" | "REVISION" | "MOCK" | "BUFFER"
type ItemStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "OVERDUE" | "LOCKED"
type CalView = "monthly" | "quarterly" | "yearly"

interface CalItem {
  id: string
  calendarId: string
  chapterId: string | null
  chapterName: string
  subjectId: string | null
  subjectName: string
  stage: Stage
  activityType: ActivityType
  scheduledDate: string          // "YYYY-MM-DD"
  status: ItemStatus
  // P1 data (enriched at load time)
  p1Score: number | null         // accuracy from chapter_performance
  p1Attempted: boolean
  canComplete: boolean           // p1Attempted && p1Score >= 40
  // for LEARNING-band display
  learningDayIndex?: number      // 1,2,3… or "BUFFER"
  isBufferDay?: boolean
  chapterDifficulty: string | null
  neetPriority: string | null
  targetStartDate?: string | null
targetCompletionDate?: string | null
actualCompletionDate?: string | null

practice1Date?: string | null
practice2Date?: string | null
practice3Date?: string | null

revision1Date?: string | null
revision2Date?: string | null

numericalDrillDate?: string | null

scheduleStatus?: string | null
}

interface CalMeta {
  id: string
  generatedAt: string
  examDate: string
  revisionZoneStart: string
  totalChapters: number
  weeklyStudyHours: number
  examCode: string
}

interface SubjectProgress {
  subject: string
  completed: number
  total: number
  pct: number
}

interface WeeklyWorkload {
  p1: number
  p2: number
  p3: number
  qr1: number
  qr2: number
  numericalDrills: number
  overdueRevisions: number
  overduePractice: number
}
interface DashboardData {
  totalChapters: number
  completedChapters: number
  overallCoveragePct: number
  daysRemaining: number
  examDate: string
  examCode: string
  revisionZoneStart: string
  subjectProgress: SubjectProgress[]
  weeklyWorkload: WeeklyWorkload
  scheduleStatus: "ON_TRACK" | "AHEAD" | "BEHIND"
  aheadBehindDays: number
  practiceBacklog: number
  revisionBacklog: number
}

interface ReadinessBreakdown {
  excellent: number   // > 85%
  strong: number      // 70–85%
  acceptable: number  // 40–70%
  weak: number        // < 40%
  untested: number
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

// Days a chapter occupies in the learning phase (fixed by difficulty)
const LEARNING_DAYS: Record<string, number> = {
  Easy: 3,
  Medium: 4,
  Hard: 5,
  "Physics Numerical Heavy": 6,
}

const DEFAULT_LEARNING_DAYS = 4
const BUFFER_DAYS = 1
const REVISION_ZONE_DAYS = 90

// Practice offsets from the day AFTER the learning+buffer block ends
const STAGE_OFFSETS: Record<
  Exclude<Stage, "LEARNING">,
  number
> = {
  NUMERICAL_DRILL: 0,
  P1: 1,
  P2: 21,
  QR1: 45,
  P3: 75,
  QR2: 90,
}

// Calendar density: concurrent chapter streams from weekly hours
const SUBJECT_LABEL: Record<string, string> = {
  PHYSICS: "Physics", CHEMISTRY: "Chemistry", BIOLOGY: "Biology",
}
const SUBJECT_DOT: Record<string, string> = {
  PHYSICS: "bg-orange-400", CHEMISTRY: "bg-sky-400", BIOLOGY: "bg-emerald-400",
}
const SUBJECT_TEXT: Record<string, string> = {
  PHYSICS: "text-orange-700", CHEMISTRY: "text-sky-700", BIOLOGY: "text-emerald-700",
}
const SUBJECT_LIGHT: Record<string, string> = {
  PHYSICS: "bg-orange-50 border-orange-200", CHEMISTRY: "bg-sky-50 border-sky-200",
  BIOLOGY: "bg-emerald-50 border-emerald-200",
}

// Activity colors (type-based, NOT subject-based)
const ACTIVITY_BG: Record<ActivityType, string> = {
  LEARNING: "bg-blue-500",
  NUMERICAL_DRILL: "bg-indigo-500",
  PRACTICE: "bg-purple-500",
  REVISION: "bg-amber-500",
  MOCK: "bg-red-500",
  BUFFER: "bg-slate-300",
}

const ACTIVITY_CHIP: Record<ActivityType | "COMPLETED" | "OVERDUE", string> = {
  LEARNING:  "bg-blue-100 text-blue-700",
  NUMERICAL_DRILL: "bg-indigo-500",
  PRACTICE:  "bg-purple-100 text-purple-700",
  REVISION:  "bg-amber-100 text-amber-700",
  MOCK:      "bg-red-100 text-red-700",
  BUFFER:    "bg-slate-100 text-slate-500",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  OVERDUE:   "bg-orange-100 text-orange-700",
}

const STAGE_LABEL: Record<Stage, string> = {
  LEARNING: "Study",
  NUMERICAL_DRILL: "Numerical Drill",
  P1: "Practice I",
  P2: "Practice II",
  QR1: "Quick Revision I",
  P3: "Practice III",
  QR2: "Quick Revision II",
}

const PRACTICE_EXAM_ID = "056f6347-d963-4c82-a3ec-eff587dfc99c"

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULING ENGINE
// Pure function — no Supabase calls. Returns rows ready to batch-insert.
// ─────────────────────────────────────────────────────────────────────────────

interface RawChapter {
  id: string
  chapter_name: string
  subject_id: string
  subjectName: string
  class_level: string | null
  neet_priority: string | null
  chapter_difficulty: string | null
  chapter_type: string | null
  chapter_order: number | null
}

function buildLegacySchedule(
  chapters: RawChapter[],
  anchor: Date,
  examDate: Date,
  weeklyHours: number,
): Omit<CalItem, "id" | "calendarId" | "p1Score" | "p1Attempted" | "canComplete">[] {
  const revZoneStart    = subDays(examDate, REVISION_ZONE_DAYS)
  const coverageEnd     = subDays(revZoneStart, 1)
  const streams         = 1 
  void weeklyHours

  // Sort: High priority first, then by chapter_order
    const sorted = [...chapters].sort((a, b) => {
    const pa = a.neet_priority === "High" ? 0 : a.neet_priority === "Medium" ? 1 : 2
    const pb = b.neet_priority === "High" ? 0 : b.neet_priority === "Medium" ? 1 : 2
    if (pa !== pb) return pa - pb
    return (a.chapter_order ?? 999) - (b.chapter_order ?? 999)
  })

  // Subject interleaving: round-robin BIO → PHY → CHEM
  const queues: Record<string, RawChapter[]> = { BIOLOGY: [], PHYSICS: [], CHEMISTRY: [] }
  const overflow: RawChapter[] = []
  sorted.forEach(ch => {
    const q = queues[ch.subjectName]
    if (q) q.push(ch)
    else overflow.push(ch)
  })
  const interleaved: RawChapter[] = []
  const order = ["BIOLOGY", "PHYSICS", "CHEMISTRY"]
  let oi = 0
  while (order.some(s => queues[s].length) || overflow.length) {
    const subj = order[oi % order.length]
    oi++
    if (queues[subj]?.length) { interleaved.push(queues[subj].shift()!); continue }
    if (overflow.length) { interleaved.push(overflow.shift()!); continue }
  }

  const items: Omit<CalItem, "id" | "calendarId" | "p1Score" | "p1Attempted" | "canComplete">[] = []

  // Parallel stream cursors (one per stream)
  const cursors = Array.from({ length: streams }, (_, i) => addDays(anchor, i))

  interleaved.forEach((ch, idx) => {
    const cursor = cursors[idx % streams]
    if (isAfter(cursor, coverageEnd)) return   // no room left

    const learningDays =
      LEARNING_DAYS[ch.chapter_difficulty ?? ""] ?? DEFAULT_LEARNING_DAYS

    // Emit LEARNING day items (one per day)
    for (let d = 0; d < learningDays; d++) {
      const dayDate = addDays(cursor, d)
      if (isAfter(dayDate, coverageEnd)) break
      items.push({
        chapterId: ch.id,
        chapterName: ch.chapter_name,
        subjectId: ch.subject_id,
        subjectName: ch.subjectName,
        stage: "LEARNING",
        activityType: "LEARNING",
        scheduledDate: format(dayDate, "yyyy-MM-dd"),
        status: "SCHEDULED",
        learningDayIndex: d + 1,
        isBufferDay: false,
        chapterDifficulty: ch.chapter_difficulty,
        neetPriority: ch.neet_priority,
      })
    }

    // Emit BUFFER day
    const bufferDate = addDays(cursor, learningDays)
    if (!isAfter(bufferDate, coverageEnd)) {
      items.push({
        chapterId: ch.id,
        chapterName: ch.chapter_name,
        subjectId: ch.subject_id,
        subjectName: ch.subjectName,
        stage: "LEARNING",
        activityType: "BUFFER",
        scheduledDate: format(bufferDate, "yyyy-MM-dd"),
        status: "SCHEDULED",
        learningDayIndex: learningDays + 1,
        isBufferDay: true,
        chapterDifficulty: ch.chapter_difficulty,
        neetPriority: ch.neet_priority,
      })
    }

    // Block end: cursor advances by (learningDays + BUFFER_DAYS)
    const blockEnd = addDays(cursor, learningDays + BUFFER_DAYS)
    cursors[idx % streams] = addDays(blockEnd, 1)

    // Emit Practice & Revision items
    const practiceRevStages: Array<{ stage: Stage; type: ActivityType }> = [
      { stage: "P1",  type: "PRACTICE" },
      { stage: "P2",  type: "PRACTICE" },
      { stage: "QR1", type: "REVISION" },
      { stage: "P3",  type: "PRACTICE" },
      { stage: "QR2", type: "REVISION" },
    ]
    practiceRevStages.forEach(({ stage, type }) => {
      const stageDate = addDays(
  cursor,
  STAGE_OFFSETS[stage as Exclude<Stage, "LEARNING">]
)
      if (isAfter(stageDate, examDate)) return
      items.push({
        chapterId: ch.id,
        chapterName: ch.chapter_name,
        subjectId: ch.subject_id,
        subjectName: ch.subjectName,
        stage,
        activityType: type,
        scheduledDate: format(stageDate, "yyyy-MM-dd"),
        status: "SCHEDULED",
        chapterDifficulty: ch.chapter_difficulty,
        neetPriority: ch.neet_priority,
      })
    })
  })

  // Mock tests every 7 days inside revision zone
  let mockDate = addDays(revZoneStart, 3)
  while (!isAfter(mockDate, subDays(examDate, 1))) {
    items.push({
      chapterId: null,
      chapterName: "Full Mock Test",
      subjectId: null,
      subjectName: "ALL",
      stage: "LEARNING",
      activityType: "MOCK",
      scheduledDate: format(mockDate, "yyyy-MM-dd"),
      status: "SCHEDULED",
      chapterDifficulty: null,
      neetPriority: "High",
    })
    mockDate = addDays(mockDate, 7)
  }

  return items
}

function buildChapterMilestones(
chapters: RawChapter[],
planStartDate: Date,
examDate: Date,
) {
const rows: any[] = []

let hardTrackCursor = new Date(planStartDate)
let normalTrackCursor = new Date(planStartDate)

const sorted = [...chapters].sort((a, b) => {
  const pa =
    a.neet_priority === "High"
      ? 0
      : a.neet_priority === "Medium"
      ? 1
      : 2

  const pb =
    b.neet_priority === "High"
      ? 0
      : b.neet_priority === "Medium"
      ? 1
      : 2

  if (pa !== pb) return pa - pb

  return (a.chapter_order ?? 999) - (b.chapter_order ?? 999)
})

for (const ch of sorted) {

  const isHard =
    ch.chapter_difficulty === "Hard" ||
    ch.chapter_difficulty === "Physics Numerical Heavy"

  const cursor = isHard
    ? hardTrackCursor
    : normalTrackCursor

const learningDays =
  LEARNING_DAYS[ch.chapter_difficulty ?? ""] ??
  DEFAULT_LEARNING_DAYS

const targetStartDate = new Date(cursor)

const targetCompletionDate = addDays(
  targetStartDate,
  learningDays + BUFFER_DAYS
)

const practice1Date = addDays(targetCompletionDate, 1)

const practice2Date = addDays(targetCompletionDate, 21)

const revision1Date = addDays(targetCompletionDate, 45)

const practice3Date = addDays(targetCompletionDate, 75)

const revision2Date = addDays(targetCompletionDate, 90)

const numericalDrillDate =
  ch.chapter_type === "Numerical" ||
  ch.chapter_type === "Concept+Numerical"
    ? targetCompletionDate
    : null

rows.push({
  chapterId: ch.id,
  chapterName: ch.chapter_name,

  subjectId: ch.subject_id,
  subjectName: ch.subjectName,

  chapterDifficulty: ch.chapter_difficulty,
  neetPriority: ch.neet_priority,

  targetStartDate: format(targetStartDate, "yyyy-MM-dd"),
  targetCompletionDate: format(targetCompletionDate, "yyyy-MM-dd"),

  practice1Date: format(practice1Date, "yyyy-MM-dd"),
  practice2Date: format(practice2Date, "yyyy-MM-dd"),
  practice3Date: format(practice3Date, "yyyy-MM-dd"),

  revision1Date: format(revision1Date, "yyyy-MM-dd"),
  revision2Date: format(revision2Date, "yyyy-MM-dd"),

  numericalDrillDate:
    numericalDrillDate
      ? format(numericalDrillDate, "yyyy-MM-dd")
      : null,

  scheduleStatus: "PENDING",
})

const nextStart = addDays(targetCompletionDate, 1)

  if (isHard) {
    hardTrackCursor = nextStart
  } else {
    normalTrackCursor = nextStart
  }
}

return rows
}


// ─────────────────────────────────────────────────────────────────────────────
// COMPUTE STATUS
// ─────────────────────────────────────────────────────────────────────────────

function resolveStatus(storedStatus: string, scheduledDate: string, today: Date): ItemStatus {
  if (storedStatus === "COMPLETED") return "COMPLETED"
  const d = parseISO(scheduledDate)
  if (isBefore(d, today) && !isSameDay(d, today)) return "OVERDUE"
  if (isToday(d)) return "ACTIVE"
  return "SCHEDULED"
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

function DashSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-[520px] w-full rounded-2xl" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PRACTICE I COMPLETION WIDGET
// Shown for every LEARNING chapter — radio + score badge
// ─────────────────────────────────────────────────────────────────────────────

interface P1CompletionWidgetProps {
  item: CalItem
  onMarkComplete: (item: CalItem) => void
  completingId: string | null
}

function P1CompletionWidget({ item, onMarkComplete, completingId }: P1CompletionWidgetProps) {
  const [selected, setSelected] = useState<string>("")

  if (item.activityType !== "LEARNING" || item.isBufferDay) return null
  if (item.status === "COMPLETED") {
    return (
      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-600">Chapter Completed</span>
        {item.p1Score !== null && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto",
            item.p1Score >= 70 ? "bg-emerald-100 text-emerald-700" :
            item.p1Score >= 40 ? "bg-amber-100 text-amber-700" :
            "bg-rose-100 text-rose-700",
          )}>
            P1: {Math.round(item.p1Score)}%
          </span>
        )}
      </div>
    )
  }

  const showGate = item.p1Attempted && !item.canComplete
  const eligible = item.canComplete

  return (
    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
      {/* P1 score display */}
      {item.p1Score !== null && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Practice I Score:</span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            item.p1Score >= 70 ? "bg-emerald-100 text-emerald-700" :
            item.p1Score >= 40 ? "bg-amber-100 text-amber-700" :
            "bg-rose-100 text-rose-700",
          )}>
            {Math.round(item.p1Score)}%
          </span>
          {item.p1Score < 40 && (
            <span className="text-[10px] text-rose-500 font-medium">— Retry Required</span>
          )}
        </div>
      )}

      {/* Gate warning */}
      {showGate && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-2">
          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-700 font-medium">
            Practice I score below 40%. Retry Practice I before marking complete.
          </p>
        </div>
      )}

      {/* Radio for chapter completion */}
      {eligible && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Mark Chapter Complete
          </p>
          <RadioGroup
            value={selected}
            onValueChange={setSelected}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="complete" id={`complete-${item.id}`} />
              <Label
                htmlFor={`complete-${item.id}`}
                className="text-xs font-medium text-slate-700 cursor-pointer"
              >
                Yes, I have mastered this chapter
              </Label>
            </div>
          </RadioGroup>
          {selected === "complete" && (
            <Button
              size="sm"
              className="h-7 text-xs font-bold rounded-lg px-3 gap-1.5 mt-1"
              disabled={completingId === item.id}
              onClick={() => onMarkComplete(item)}
            >
              {completingId === item.id
                ? <RotateCcw className="w-3 h-3 animate-spin" />
                : <Check className="w-3 h-3" />}
              Confirm & Mark Complete
            </Button>
          )}
        </div>
      )}

      {!item.p1Attempted && !item.p1Score && (
        <p className="text-[11px] text-slate-400 italic">
          Attempt Practice I first to unlock completion.
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR GRID — Google-Calendar-style monthly view
// ─────────────────────────────────────────────────────────────────────────────

interface CalGridProps {
  viewMonth: Date
  dayMap: Map<string, CalItem[]>
  onDayClick: (d: Date) => void
  selectedDate: Date | null
  revZoneStart: Date | null
  examDate: Date | null
  today: Date
}

function CalGrid({
  viewMonth, dayMap, onDayClick, selectedDate, revZoneStart, examDate, today,
}: CalGridProps) {
  const mStart = startOfMonth(viewMonth)
  const mEnd   = endOfMonth(viewMonth)
  const padStart = (getDay(mStart) + 6) % 7   // Mon=0
  const padEnd   = (7 - ((getDay(mEnd) + 6) % 7 + 1)) % 7
  const gridDays = eachDayOfInterval({
    start: subDays(mStart, padStart),
    end:   addDays(mEnd, padEnd),
  })

  const HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {HEADERS.map(h => (
          <div key={h} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {h}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
        {gridDays.map(day => {
          const key      = format(day, "yyyy-MM-dd")
          const items    = dayMap.get(key) ?? []
          const inMonth  = isSameMonth(day, viewMonth)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const todayCell  = isToday(day)
          const isRevZone  = revZoneStart && examDate
            ? !isBefore(day, revZoneStart) && !isAfter(day, examDate)
            : false
          const isExamDay  = examDate ? isSameDay(day, examDate) : false

          // Collect unique activity types for dots
          const actTypes = [...new Set(items.map(i => i.activityType))].slice(0, 4)
          const hasOverdue = items.some(i => i.status === "OVERDUE")

          return (
            <div
              key={key}
              onClick={() => inMonth && onDayClick(day)}
              className={cn(
                "relative min-h-[82px] p-1.5 bg-white transition-colors",
                inMonth ? "cursor-pointer hover:bg-slate-50" : "opacity-30 pointer-events-none",
                isSelected   ? "bg-primary/5 ring-2 ring-inset ring-primary/40"  : "",
                isRevZone && inMonth && !isExamDay ? "bg-red-50/50" : "",
                isExamDay    ? "bg-red-100" : "",
              )}
            >
              {/* Date number */}
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                  todayCell ? "bg-primary text-white font-bold" : "text-slate-600",
                  isExamDay ? "bg-red-600 text-white" : "",
                )}>
                  {format(day, "d")}
                </span>
                {isRevZone && inMonth && !isExamDay && (
                  <span className="text-[7px] font-bold text-red-400 leading-none">REV</span>
                )}
              </div>

              {/* Activity bands */}
              {items.length > 0 && (
                <div className="space-y-0.5">
                  {items.slice(0, 3).map((item, idx) => {
                    const chip = item.status === "COMPLETED" ? ACTIVITY_CHIP.COMPLETED
                      : item.status === "OVERDUE" ? ACTIVITY_CHIP.OVERDUE
                      : ACTIVITY_CHIP[item.activityType]
                    return (
                      <div
                        key={idx}
                        className={cn("text-[8px] font-semibold px-1 py-0.5 rounded truncate leading-tight", chip)}
                      >
                        {item.activityType === "MOCK" ? "Mock Test"
                          : item.isBufferDay ? `${item.chapterName} · Buffer`
                          : item.learningDayIndex && item.activityType === "LEARNING"
                          ? `${item.chapterName} · Day ${item.learningDayIndex}`
                          : item.chapterName}
                      </div>
                    )
                  })}
                  {items.length > 3 && (
                    <div className="text-[8px] font-bold text-slate-400 pl-1">
                      +{items.length - 3} more
                    </div>
                  )}
                </div>
              )}

              {isExamDay && (
                <div className="text-[8px] font-bold text-red-600 mt-0.5 truncate">EXAM DAY</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// QUARTERLY VIEW  (3 months side by side)
// ─────────────────────────────────────────────────────────────────────────────

function QuarterlyView({
  viewMonth, dayMap, onDayClick, selectedDate, revZoneStart, examDate, today,
}: CalGridProps) {
  // Show 3 consecutive months starting from viewMonth
  const months = [0, 1, 2].map(i => addMonths(viewMonth, i))
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {months.map(m => (
        <div key={m.toISOString()} className="space-y-1">
          <p className="text-sm font-bold text-slate-700 text-center">
            {format(m, "MMMM yyyy")}
          </p>
          <CalGrid
            viewMonth={m}
            dayMap={dayMap}
            onDayClick={onDayClick}
            selectedDate={selectedDate}
            revZoneStart={revZoneStart}
            examDate={examDate}
            today={today}
          />
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// YEARLY VIEW  (12 months)
// ─────────────────────────────────────────────────────────────────────────────

function YearlyView({
  viewMonth, dayMap, revZoneStart, examDate, today,
}: Omit<CalGridProps, "onDayClick" | "selectedDate">) {
  // Build 12-month summary bars
  const anchorYear = getYear(viewMonth)
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(anchorYear, i, 1)
    return m
  })

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {months.map(m => {
        const mStart = startOfMonth(m)
        const mEnd   = endOfMonth(m)
        const isRev  = revZoneStart && examDate
          ? !isBefore(mStart, revZoneStart) && !isAfter(mStart, examDate)
          : false
        const isCurrentMonth = isSameMonth(m, today)

        // Tally by type
        let learn = 0, prac = 0, rev = 0, mock = 0, done = 0
        dayMap.forEach((items, key) => {
          const d = parseISO(key)
          if (!isSameMonth(d, m)) return
          items.forEach(it => {
            if (it.status === "COMPLETED") done++
            else if (it.activityType === "LEARNING")  learn++
            else if (it.activityType === "PRACTICE")  prac++
            else if (it.activityType === "REVISION")  rev++
            else if (it.activityType === "MOCK")      mock++
          })
        })
        const total = learn + prac + rev + mock + done

        return (
          <Card
            key={m.toISOString()}
            className={cn(
              "rounded-xl border shadow-sm",
              isCurrentMonth ? "ring-2 ring-primary/30 border-primary/20" : "border-slate-200",
              isRev ? "bg-red-50" : "bg-white",
            )}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-xs font-bold",
                  isCurrentMonth ? "text-primary" : "text-slate-700",
                  isRev ? "text-red-600" : "",
                )}>
                  {format(m, "MMM yyyy")}
                </p>
                {isRev && <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">Mock Zone</span>}
              </div>

              {total > 0 ? (
                <>
                  <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                    {learn > 0  && <div className="bg-blue-400"   style={{ flex: learn  }} />}
                    {prac  > 0  && <div className="bg-purple-400" style={{ flex: prac   }} />}
                    {rev   > 0  && <div className="bg-amber-400"  style={{ flex: rev    }} />}
                    {mock  > 0  && <div className="bg-red-400"    style={{ flex: mock   }} />}
                    {done  > 0  && <div className="bg-emerald-400"style={{ flex: done   }} />}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {[
                      { label: "Study",    val: learn, color: "text-blue-600"    },
                      { label: "Practice", val: prac,  color: "text-purple-600"  },
                      { label: "Revision", val: rev,   color: "text-amber-600"   },
                      { label: "Mock",     val: mock,  color: "text-red-600"     },
                    ].map(r => r.val > 0 && (
                      <div key={r.label} className="flex items-center gap-1">
                        <span className={cn("text-[10px] font-bold", r.color)}>{r.val}</span>
                        <span className="text-[10px] text-slate-400">{r.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-[10px] text-slate-300 italic">No activities</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface DayPanelProps {
  date: Date
  items: CalItem[]
  onClose: () => void
  onLaunchPractice: (item: CalItem) => void
  onMarkComplete: (item: CalItem) => void
  actionLoadingId: string | null
  revZoneStart: Date | null
}

function DayPanel({
  date, items, onClose, onLaunchPractice, onMarkComplete, actionLoadingId, revZoneStart,
}: DayPanelProps) {
  const isRevZone = revZoneStart ? !isBefore(date, revZoneStart) : false
  const groups = {
    LEARNING:  items.filter(i => i.activityType === "LEARNING" && !i.isBufferDay),
    BUFFER:    items.filter(i => i.isBufferDay),
    PRACTICE:  items.filter(i => i.activityType === "PRACTICE"),
    REVISION:  items.filter(i => i.activityType === "REVISION"),
    MOCK:      items.filter(i => i.activityType === "MOCK"),
  }

  function GroupSection({
    title, groupItems, chip,
  }: { title: string; groupItems: CalItem[]; chip: string }) {
    if (!groupItems.length) return null
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        {groupItems.map(item => {
          const statusChip = item.status === "COMPLETED" ? ACTIVITY_CHIP.COMPLETED
            : item.status === "OVERDUE" ? ACTIVITY_CHIP.OVERDUE
            : chip
          const accent = SUBJECT_DOT[item.subjectName]
          const canLaunch = item.activityType === "PRACTICE" && item.status !== "COMPLETED"
          const isMock = item.activityType === "MOCK"
          const isLoading = actionLoadingId === item.id

          return (
            <Card
              key={item.id}
              className={cn(
                "rounded-xl border shadow-sm",
                item.status === "COMPLETED" ? "bg-emerald-50 border-emerald-200" :
                item.status === "OVERDUE"   ? "bg-orange-50 border-orange-200" :
                "bg-white border-slate-100",
              )}
            >
              <CardContent className="p-3 space-y-2">
                {/* Header row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {accent && <div className={cn("w-2 h-2 rounded-full shrink-0", accent)} />}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {item.chapterName}
                        {item.learningDayIndex && !item.isBufferDay
                          ? ` · Day ${item.learningDayIndex}`
                          : item.isBufferDay ? " · Buffer Day" : ""}
                      </p>
                      {item.subjectName !== "ALL" && (
                        <p className={cn("text-[10px] font-medium", SUBJECT_TEXT[item.subjectName] ?? "text-slate-400")}>
                          {SUBJECT_LABEL[item.subjectName] ?? item.subjectName}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", statusChip)}>
                    {item.status === "COMPLETED" ? "Done" :
                     item.status === "OVERDUE"   ? "Overdue" :
                     STAGE_LABEL[item.stage]}
                  </span>
                </div>

                {/* P1 score display (for all items of a chapter) */}
                {item.p1Score !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">P1 Score:</span>
                    <span className={cn(
                      "font-bold",
                      item.p1Score >= 70 ? "text-emerald-600" :
                      item.p1Score >= 40 ? "text-amber-600" : "text-rose-600",
                    )}>
                      {Math.round(item.p1Score)}%
                    </span>
                    {item.p1Score < 40 && (
                      <span className="text-[10px] text-rose-500">— below gate</span>
                    )}
                  </div>
                )}

                {/* P1 Completion widget for LEARNING items */}
                <P1CompletionWidget
                  item={item}
                  onMarkComplete={onMarkComplete}
                  completingId={actionLoadingId}
                />

                {/* Launch button for practice/mock */}
                {(canLaunch || isMock) && (
                  <Button
                    size="sm"
                    className={cn(
                      "h-7 text-xs font-bold rounded-lg px-3 gap-1.5",
                      isMock ? "bg-red-600 hover:bg-red-700" : "",
                    )}
                    disabled={isLoading}
                    onClick={() => onLaunchPractice(item)}
                  >
                    {isLoading
                      ? <RotateCcw className="w-3 h-3 animate-spin" />
                      : <PlayCircle className="w-3 h-3" />}
                    {isMock ? "Start Mock" : `Start ${STAGE_LABEL[item.stage]}`}
                  </Button>
                )}
                {(item.stage === "QR1" || item.stage === "QR2") && item.status !== "COMPLETED" && (
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg px-3" disabled>
                    {STAGE_LABEL[item.stage]} — Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {format(date, "EEEE")}
          </p>
          <p className="text-base font-bold text-slate-900">{format(date, "d MMMM yyyy")}</p>
          {isRevZone && (
            <Badge className="mt-1 text-[10px] font-bold bg-red-100 text-red-700 border-none">
              Exam Simulation Zone
            </Badge>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6 italic">
            {isRevZone ? "Exam Simulation Zone — Mock Tests & Revision only" : "No activities scheduled"}
          </p>
        )}
        <GroupSection title="Learning Tasks"  groupItems={groups.LEARNING}  chip={ACTIVITY_CHIP.LEARNING}  />
        <GroupSection title="Buffer Day"       groupItems={groups.BUFFER}    chip={ACTIVITY_CHIP.BUFFER}    />
        <GroupSection title="Practice Tasks"  groupItems={groups.PRACTICE}  chip={ACTIVITY_CHIP.PRACTICE}  />
        <GroupSection title="Revision Tasks"  groupItems={groups.REVISION}  chip={ACTIVITY_CHIP.REVISION}  />
        <GroupSection title="Mock Tests"      groupItems={groups.MOCK}      chip={ACTIVITY_CHIP.MOCK}      />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LearningCalendarPage() {
  const { user }  = useSupabaseUser()
  const router    = useRouter()
  const today     = useMemo(() => startOfDay(new Date()), [])

  type PS = "loading" | "empty" | "generating" | "ready" | "error"
  const [ps, setPs]                         = useState<PS>("loading")
  const [errorMsg, setErrorMsg]             = useState<string | null>(null)
  const [genProgress, setGenProgress]       = useState(0)
  const [calMeta, setCalMeta]               = useState<CalendarMeta | null>(null)
  const [allItems, setAllItems]             = useState<CalItem[]>([])
  const [dashboard, setDashboard]           = useState<DashboardData | null>(null)
  const [readiness, setReadiness]           = useState<ReadinessBreakdown | null>(null)
  const [calView, setCalView]               = useState<CalView>("monthly")
  const [viewMonth, setViewMonth]           = useState<Date>(today)
  const [selectedDate, setSelectedDate]     = useState<Date | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Deduplicated meta state type
  type CalendarMeta = {
    id: string; generatedAt: string; examDate: string
    revisionZoneStart: string; totalChapters: number
    weeklyStudyHours: number; examCode: string
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => { if (user) init() }, [user])

  async function init() {
    setPs("loading")
    try {
      const { data: cal, error: calErr } = await supabase
        .from("learning_calendar")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      // 42P01 = table does not exist
      if (calErr && calErr.code !== "42P01") throw calErr
      if (!cal) { setPs("empty"); return }

      await loadItems(cal)
    } catch (e: any) {
      if (e?.code === "42P01" || e?.message?.includes("does not exist")) {
        setPs("empty")
      } else {
        setErrorMsg(e?.message ?? "Failed to load calendar")
        setPs("error")
      }
    }
  }

  async function loadItems(cal: any) {
    // 1. Load all items
    const { data: rawItems, error: iErr } = await supabase
      .from("learning_calendar_items")
      .select("*")
      .eq("calendar_id", cal.id)
      .order("scheduled_date", { ascending: true })
    if (iErr) throw iErr

    // 2. Chapter performance for P1 scores
    const chIds = [...new Set(
      (rawItems ?? []).map((i: any) => i.chapter_id).filter(Boolean)
    )]
    let perfMap: Record<string, { accuracy: number; attempts: number }> = {}
    if (chIds.length) {
      const { data: perf } = await supabase
        .from("chapter_performance")
        .select("chapter_id, accuracy_30d, attempts_30d")
        .eq("user_id", user!.id)
        .in("chapter_id", chIds)
      perf?.forEach((p: any) => {
        perfMap[p.chapter_id] = {
          accuracy: Number(p.accuracy_30d ?? 0),
          attempts: Number(p.attempts_30d ?? 0),
        }
      })
    }

    const examDate      = parseISO(cal.exam_date)
    const revZoneStart  = subDays(examDate, REVISION_ZONE_DAYS) 

    // 3. Enrich items
      const items: CalItem[] = []

;(rawItems ?? []).forEach((raw: any) => {
  const perf = raw.chapter_id ? perfMap[raw.chapter_id] : null

  const p1Score = perf?.accuracy ?? null
  const p1Attempted = (perf?.attempts ?? 0) > 0
  const canComplete = p1Attempted && (p1Score ?? 0) >= 40

  const pushEvent = (
    stage: Stage,
    activityType: ActivityType,
    date: string | null
  ) => {
    if (!date) return

    items.push({
      id: `${raw.id}-${stage}`,
      calendarId: raw.calendar_id,

      chapterId: raw.chapter_id,
      chapterName: raw.chapter_name,

      subjectId: raw.subject_id,
      subjectName: raw.subject_name,

      stage,
      activityType,

      scheduledDate: date,

      status: resolveStatus(
        raw.status ?? "SCHEDULED",
        date,
        today
      ),

      p1Score,
      p1Attempted,
      canComplete,

      chapterDifficulty: raw.chapter_difficulty ?? null,
      neetPriority: raw.neet_priority ?? null,

      targetStartDate: raw.target_start_date ?? null,
      targetCompletionDate: raw.target_completion_date ?? null,
      actualCompletionDate: raw.actual_completion_date ?? null,

      practice1Date: raw.practice_1_date ?? null,
      practice2Date: raw.practice_2_date ?? null,
      practice3Date: raw.practice_3_date ?? null,

      revision1Date: raw.revision_1_date ?? null,
      revision2Date: raw.revision_2_date ?? null,

      numericalDrillDate: raw.numerical_drill_date ?? null,

      scheduleStatus: raw.schedule_status ?? "PENDING",
    })
  }

  pushEvent(
    "LEARNING",
    "LEARNING",
    raw.target_start_date
  )

  pushEvent(
    "P1",
    "PRACTICE",
    raw.practice_1_date
  )

  pushEvent(
    "P2",
    "PRACTICE",
    raw.practice_2_date
  )

  pushEvent(
    "QR1",
    "REVISION",
    raw.revision_1_date
  )

  pushEvent(
    "P3",
    "PRACTICE",
    raw.practice_3_date
  )

  pushEvent(
    "QR2",
    "REVISION",
    raw.revision_2_date
  )

  if (raw.numerical_drill_date) {
    pushEvent(
      "NUMERICAL_DRILL",
      "NUMERICAL_DRILL",
      raw.numerical_drill_date
    )
  }
})

    setAllItems(items)
    setCalMeta({
      id:               cal.id,
      generatedAt:      cal.generated_at,
      examDate:         cal.exam_date,
      revisionZoneStart: format(revZoneStart, "yyyy-MM-dd"),
      totalChapters:    cal.total_chapters,
      weeklyStudyHours: cal.weekly_study_hours,
      examCode:         cal.exam_code,
    })
    setViewMonth(today)

    // 4. Build dashboard
    buildDashboard(items, cal, perfMap, examDate, revZoneStart)
    setPs("ready")
  }

  function buildDashboard(
    items: CalItem[],
    cal: any,
    perfMap: Record<string, { accuracy: number; attempts: number }>,
    examDate: Date,
    revZoneStart: Date,
  ) {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const weekEnd   = endOfWeek(today, { weekStartsOn: 1 })

    // Learning items (unique chapters) — ignore buffer + mock
    const learningItems = items.filter(
  i =>
    i.activityType === "LEARNING"
)
    const totalChapters    = learningItems.length
    const completedChapters = learningItems.filter(i => i.status === "COMPLETED").length
    const coveragePct      = totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0

    // Subject progress
    const subs = ["PHYSICS", "CHEMISTRY", "BIOLOGY"]
    const subjectProgress: SubjectProgress[] = subs.map(s => {
      const sChs   = learningItems.filter(i => i.subjectName === s)
      const sDone  = sChs.filter(i => i.status === "COMPLETED").length
      return { subject: s, completed: sDone, total: sChs.length, pct: sChs.length ? Math.round((sDone / sChs.length) * 100) : 0 }
    })

    // Weekly workload (next 7 days)
    const weekItems = items.filter(i => {
      const d = parseISO(i.scheduledDate)
      return !isBefore(d, today) && !isAfter(d, addDays(today, 7))
    })
    const weeklyWorkload: WeeklyWorkload = {
  p1: weekItems.filter(i => i.stage === "P1").length,
  p2: weekItems.filter(i => i.stage === "P2").length,
  p3: weekItems.filter(i => i.stage === "P3").length,

  qr1: weekItems.filter(i => i.stage === "QR1").length,
  qr2: weekItems.filter(i => i.stage === "QR2").length,

  numericalDrills:
    weekItems.filter(i => i.stage === "NUMERICAL_DRILL").length,

  overdueRevisions:
    items.filter(
      i =>
        i.status === "OVERDUE" &&
        i.activityType === "REVISION"
    ).length,

  overduePractice:
    items.filter(
      i =>
        i.status === "OVERDUE" &&
        i.activityType === "PRACTICE"
    ).length,
}

    const daysRemaining = Math.max(0, differenceInDays(examDate, today))

    // Velocity
    const anchorDate  = parseISO(cal.generated_at)
    const daysPassed  = Math.max(1, differenceInDays(today, anchorDate))
    const actualPace  = (completedChapters / daysPassed) * 7
    const daysLeft    = Math.max(1, differenceInDays(revZoneStart, today))
    const expectedPace = ((totalChapters - completedChapters) / daysLeft) * 7
    const ratio = expectedPace > 0 ? actualPace / expectedPace : 1
    const scheduleStatus: DashboardData["scheduleStatus"] =
      ratio >= 1.05 ? "AHEAD" : ratio >= 0.9 ? "ON_TRACK" : "BEHIND"
    const aheadBehindDays = Math.abs(Math.round((ratio - 1) * daysLeft))

    setDashboard({
      totalChapters, completedChapters, overallCoveragePct: coveragePct,
      daysRemaining, examDate: cal.exam_date, examCode: cal.exam_code,
      revisionZoneStart: format(revZoneStart, "yyyy-MM-dd"),
      subjectProgress, weeklyWorkload,
      scheduleStatus, aheadBehindDays,
      practiceBacklog: weeklyWorkload.overduePractice,
      revisionBacklog: weeklyWorkload.overdueRevisions,
    })

    // Readiness
    const scored = Object.values(perfMap).filter(p => p.attempts > 0)
    const r: ReadinessBreakdown = { excellent: 0, strong: 0, acceptable: 0, weak: 0, untested: 0 }
    scored.forEach(p => {
      if (p.accuracy > 85)      r.excellent++
      else if (p.accuracy >= 70) r.strong++
      else if (p.accuracy >= 40) r.acceptable++
      else                       r.weak++
    })
    r.untested = learningItems
  .filter(i => i.chapterId)
  .filter(i => !perfMap[i.chapterId!]?.attempts)
  .length
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GENERATE
  // ──────────────────────────────────────────────────────────────────────────
  async function generateCalendar() {
    setPs("generating"); setGenProgress(5)
    try {
      // 1. Baseline
      const { data: bl, error: bErr } = await supabase
        .from("user_baselines")
        .select("exam_code, target_exam_date, weekly_study_hours, created_at")
        .eq("user_id", user!.id).eq("is_active", true)
        .order("created_at", { ascending: false }).limit(1).maybeSingle()
      if (bErr || !bl) throw new Error(bErr?.message ?? "No active baseline. Please complete setup first.")
      setGenProgress(15)

      // 2. Subjects
      const { data: subRows } = await supabase.from("subjects").select("id, name")
      const subjMap: Record<string, string> = {}
      subRows?.forEach((s: any) => { subjMap[s.id] = s.name })
      setGenProgress(22)

      // 3. Chapters (NEET subjects only)
      const neetIds = (subRows ?? []).filter((s: any) => ["PHYSICS","CHEMISTRY","BIOLOGY"].includes(s.name)).map((s: any) => s.id)
      const { data: chs, error: chErr } = await supabase
        .from("chapters")
        .select(`id, chapter_name, subject_id, class_level, chapter_order, neet_priority, chapter_difficulty, chapter_type `)
        .in("subject_id", neetIds)
        .order("chapter_order", { ascending: true })
      if (chErr || !chs?.length) throw new Error("No chapters found.")
      setGenProgress(35)

      const richChs: RawChapter[] = chs.map((c: any) => ({
  id: c.id,
  chapter_name: c.chapter_name,
  subject_id: c.subject_id,
  class_level: c.class_level,
  subjectName: subjMap[c.subject_id] ?? "UNKNOWN",
  neet_priority: c.neet_priority,
  chapter_difficulty: c.chapter_difficulty,
  chapter_type: c.chapter_type,
  chapter_order: c.chapter_order,
}))

      // 4. Run engine
      const onboardingDate = today
      const anchor = addDays(onboardingDate, 7)
      const examDate = parseISO(bl.target_exam_date)
      const hrs     = bl.weekly_study_hours ?? 20
      const scheduled = buildChapterMilestones( richChs, anchor, examDate)
      console.log("SCHEDULED COUNT =", scheduled.length)

      if (scheduled.length > 0) {
      console.log("FIRST SCHEDULED ROW =", scheduled[0])
}
      setGenProgress(55)

      // 5. Deactivate old calendars
      await supabase.from("learning_calendar").update({ is_active: false }).eq("user_id", user!.id)

      // 6. Insert new calendar
      const revZoneStart = subDays(examDate, REVISION_ZONE_DAYS)
      const { data: newCal, error: calInsErr } = await supabase
        .from("learning_calendar")
        .insert({
  user_id: user!.id,
  exam_code: bl.exam_code,
  exam_date: bl.target_exam_date,
  generated_at: format(onboardingDate, "yyyy-MM-dd"),
  onboarding_date: format(onboardingDate, "yyyy-MM-dd"),
  plan_start_date: format(anchor, "yyyy-MM-dd"),
  revision_zone_start: format(revZoneStart, "yyyy-MM-dd"),
  total_chapters: richChs.length,
  weekly_study_hours: hrs,
  is_active: true,
})
        .select("id").single()
      if (calInsErr) throw calInsErr
      setGenProgress(65)

      // 7. Batch insert items
      console.log("SCHEDULED COUNT", scheduled.length)
      console.log("FIRST ITEM", scheduled[0])
      const rows = scheduled.map(item => ({
  calendar_id: newCal.id,
  user_id: user!.id,

  chapter_id: item.chapterId,
  chapter_name: item.chapterName,

  subject_id: item.subjectId,
  subject_name: item.subjectName,

  stage: "LEARNING",
  activity_type: "LEARNING",

  scheduled_date: item.targetStartDate,
  status: "SCHEDULED",

  chapter_difficulty: item.chapterDifficulty,
  neet_priority: item.neetPriority,

  target_start_date: item.targetStartDate ?? null,
  target_completion_date: item.targetCompletionDate ?? null,
  actual_completion_date: item.actualCompletionDate ?? null,

  practice_1_date: item.practice1Date ?? null,
  practice_2_date: item.practice2Date ?? null,
  practice_3_date: item.practice3Date ?? null,

  revision_1_date: item.revision1Date ?? null,
  revision_2_date: item.revision2Date ?? null,

  numerical_drill_date: item.numericalDrillDate ?? null,

  schedule_status: item.scheduleStatus ?? "PENDING",
}))
      const BATCH = 50
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error: bErr2 } = await supabase.from("learning_calendar_items").insert(rows.slice(i, i + BATCH))
        if (bErr2) throw bErr2
        setGenProgress(65 + Math.round(((i + BATCH) / rows.length) * 30))
      }
      setGenProgress(100)

      // 8. Reload
      await loadItems({ id: newCal.id, exam_date: bl.target_exam_date, exam_code: bl.exam_code, generated_at: format(anchor, "yyyy-MM-dd"), total_chapters: richChs.length, weekly_study_hours: hrs })
    } catch (e: any) {
      console.error("Generate error:", e)
      setErrorMsg(e?.message ?? "Failed to generate calendar.")
      setPs("error")
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────────
  const handleLaunchPractice = useCallback(async (item: CalItem) => {
    setActionLoadingId(item.id)
    try {
      const attempt = await createAttempt({
        examId:  PRACTICE_EXAM_ID,
        subject: item.subjectId ?? undefined,
        chapter: item.chapterId ?? undefined,
        mode:    item.activityType === "MOCK" ? "mock" : "practice",
      })
      if (!attempt?.attemptId) throw new Error("No attempt returned")
      router.push(`/exams/attempt?attempt_id=${attempt.attemptId}`)
    } catch (e) { console.error(e) }
    finally { setActionLoadingId(null) }
  }, [router])

  const handleMarkComplete = useCallback(async (item: CalItem) => {
    if (!item.canComplete) return
    setActionLoadingId(item.id)
    try {
      // Update the LEARNING day-1 item to COMPLETED
      // Also update any other LEARNING items for this chapter
      const { error } = await supabase
        .from("learning_calendar_items")
        .update({ status: "COMPLETED" })
        .eq("calendar_id", item.calendarId)
        .eq("chapter_id", item.chapterId)
        .eq("activity_type", "LEARNING")

      if (error) throw error

      setAllItems(prev =>
        prev.map(i =>
          i.calendarId === item.calendarId &&
          i.chapterId  === item.chapterId  &&
          i.activityType === "LEARNING"
            ? { ...i, status: "COMPLETED" as ItemStatus }
            : i
        )
      )
      // Refresh dashboard counts
      setDashboard(prev => {
        if (!prev) return prev
        const comp = prev.completedChapters + 1
        const pct  = prev.totalChapters ? Math.round((comp / prev.totalChapters) * 100) : 0
        return { ...prev, completedChapters: comp, overallCoveragePct: pct }
      })
    } catch (e) { console.error(e) }
    finally { setActionLoadingId(null) }
  }, [])

  // ──────────────────────────────────────────────────────────────────────────
  // DAY MAP
  // ──────────────────────────────────────────────────────────────────────────
  const dayMap = useMemo(() => {
    const m = new Map<string, CalItem[]>()
    allItems.forEach(item => {
      const k = item.scheduledDate
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(item)
    })
    return m
  }, [allItems])

  const selectedDayItems = useMemo(() =>
    selectedDate ? dayMap.get(format(selectedDate, "yyyy-MM-dd")) ?? [] : []
  , [selectedDate, dayMap])

  const revZoneStartDate = calMeta ? parseISO(calMeta.revisionZoneStart) : null
  const examDateObj      = calMeta ? parseISO(calMeta.examDate)          : null

  // ──────────────────────────────────────────────────────────────────────────
  // RISK ALERTS
  // ──────────────────────────────────────────────────────────────────────────
  const riskAlerts = useMemo(() => {
    const a: string[] = []
    if (!dashboard) return a
    if (dashboard.scheduleStatus === "BEHIND")
      a.push(`Coverage ${dashboard.aheadBehindDays}d behind schedule. Increase daily study time.`)
    if (dashboard.practiceBacklog > 5)
      a.push(`${dashboard.practiceBacklog} practice sessions overdue.`)
    if (dashboard.revisionBacklog > 5)
      a.push(`${dashboard.revisionBacklog} revision sessions overdue — memory decay risk.`)
    if (dashboard.daysRemaining <= REVISION_ZONE_DAYS && dashboard.completedChapters < dashboard.totalChapters)
      a.push(`${dashboard.totalChapters - dashboard.completedChapters} chapters incomplete — already in Exam Simulation Zone.`)
    return a
  }, [dashboard])

  const [showAlerts, setShowAlerts] = useState(false)

  // ──────────────────────────────────────────────────────────────────────────
  // EMPTY STATE
  // ──────────────────────────────────────────────────────────────────────────
  if (ps === "empty") return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-xl mx-auto mt-24 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto">
            <GraduationCap className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">No Learning Calendar Found</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              Generate your personalised NEET learning calendar to get a complete
              day-by-day schedule from today to exam day.
            </p>
          </div>
          <Card className="rounded-2xl border-slate-200 bg-white text-left">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-bold text-slate-700 mb-3">What gets built:</p>
              {[
                "Every chapter scheduled with multi-day learning blocks",
                "Practice I, II, III at scientifically spaced intervals",
                "Quick Revision I & II to prevent memory decay",
                "90-day Exam Simulation Zone with Mock Tests",
                "Subject-balanced schedule (Bio · Phy · Chem rotation)",
              ].map(t => (
                <p key={t} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-primary mt-0.5 font-bold">✓</span>{t}
                </p>
              ))}
            </CardContent>
          </Card>
          <Button
            className="rounded-2xl h-12 px-10 font-bold text-base shadow-lg shadow-primary/20 gap-2"
            onClick={generateCalendar}
          >
            <Sparkles className="w-4 h-4" />
            Generate My Learning Calendar
          </Button>
        </div>
      </main>
    </MentorLayout>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // GENERATING
  // ──────────────────────────────────────────────────────────────────────────
  if (ps === "generating") return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-md mx-auto mt-32 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Building Your Calendar…</h2>
            <p className="text-sm text-slate-500">
              {genProgress < 35 ? "Loading syllabus data" :
               genProgress < 60 ? "Scheduling chapters with multi-day blocks" :
               genProgress < 90 ? "Writing practice & revision schedule" :
               "Finalising…"}
            </p>
          </div>
          <Progress value={genProgress} className="h-2.5" />
          <p className="text-xs text-slate-400">{genProgress}%</p>
        </div>
      </main>
    </MentorLayout>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // LOADING
  // ──────────────────────────────────────────────────────────────────────────
  if (ps === "loading") return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          <Skeleton className="h-8 w-64" />
          <DashSkeleton />
        </div>
      </main>
    </MentorLayout>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // ERROR
  // ──────────────────────────────────────────────────────────────────────────
  if (ps === "error") return (
    <MentorLayout>
      <main className="flex-1 p-6 lg:p-10 bg-slate-50/30 overflow-y-auto">
        <div className="max-w-xl mx-auto mt-20">
          <Card className="rounded-2xl border-rose-200 bg-rose-50">
            <CardContent className="p-5 flex items-start gap-3 text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-semibold text-sm">{errorMsg ?? "Something went wrong"}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-lg border-rose-300 text-rose-700" onClick={init}>Retry</Button>
                  <Button size="sm" variant="outline" className="rounded-lg border-rose-300 text-rose-700" onClick={generateCalendar}>Regenerate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </MentorLayout>
  )

  // ──────────────────────────────────────────────────────────────────────────
  // READY
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <MentorLayout>
      <main className="flex-1 overflow-y-auto bg-slate-50/30">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-10 py-7 pb-24 space-y-6">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Learning Calendar</h1>
                {calMeta && (
                  <p className="text-xs text-slate-400">
                    {calMeta.examCode} · Anchored {format(parseISO(calMeta.generatedAt), "d MMM yyyy")}
                    · Exam {format(parseISO(calMeta.examDate), "d MMM yyyy")}
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm" variant="outline"
              className="rounded-xl h-8 text-xs font-semibold gap-2 border-slate-200 text-slate-600"
              onClick={generateCalendar}
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </Button>
          </div>

          {/* ── Risk Alerts ───────────────────────────────────────────────── */}
          {riskAlerts.length > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50">
              <button
                className="w-full flex items-center justify-between px-4 py-3"
                onClick={() => setShowAlerts(v => !v)}
              >
                <div className="flex items-center gap-2 text-orange-700">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-sm font-bold">{riskAlerts.length} Risk Alert{riskAlerts.length > 1 ? "s" : ""}</span>
                </div>
                {showAlerts ? <ChevronUp className="w-4 h-4 text-orange-400" /> : <ChevronDown className="w-4 h-4 text-orange-400" />}
              </button>
              {showAlerts && (
                <div className="px-4 pb-3 space-y-1.5 border-t border-orange-200">
                  {riskAlerts.map((a, i) => (
                    <p key={i} className="text-xs text-orange-700 flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {a}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Dashboard Metrics Row 1 ───────────────────────────────────── */}
          {dashboard && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Chapters */}
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chapters</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {dashboard.completedChapters}
                      <span className="text-sm font-medium text-slate-400"> / {dashboard.totalChapters}</span>
                    </p>
                    <Progress value={dashboard.overallCoveragePct} className="h-1.5" />
                    <p className="text-[10px] text-slate-400">
                      {dashboard.totalChapters - dashboard.completedChapters} remaining
                    </p>
                  </CardContent>
                </Card>

                {/* Coverage */}
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coverage</p>
                    <p className="text-2xl font-bold text-slate-900">{dashboard.overallCoveragePct}%</p>
                    <p className="text-[10px] text-slate-400">completed chapters only</p>
                    <div className="flex items-center gap-1.5">
                      {dashboard.scheduleStatus === "AHEAD"    && <TrendingUp   className="w-3 h-3 text-emerald-500" />}
                      {dashboard.scheduleStatus === "BEHIND"   && <TrendingDown  className="w-3 h-3 text-rose-500"   />}
                      {dashboard.scheduleStatus === "ON_TRACK" && <TrendingUp   className="w-3 h-3 text-blue-400"   />}
                      <span className={cn(
                        "text-[10px] font-bold",
                        dashboard.scheduleStatus === "AHEAD"    ? "text-emerald-600" :
                        dashboard.scheduleStatus === "BEHIND"   ? "text-rose-600"    : "text-blue-600",
                      )}>
                        {dashboard.scheduleStatus === "AHEAD"  ? `${dashboard.aheadBehindDays}d ahead` :
                         dashboard.scheduleStatus === "BEHIND" ? `${dashboard.aheadBehindDays}d behind` : "On Track"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* My Upcoming Practice This Week */}
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Practice This Week
                    </p>
                    <div className="space-y-1">
                      {[
                        { label: "Practice I",   val: dashboard.weeklyWorkload.p1,  color: "text-purple-600" },
                        { label: "Practice II",  val: dashboard.weeklyWorkload.p2,  color: "text-violet-600" },
                        { label: "Practice III", val: dashboard.weeklyWorkload.p3,  color: "text-indigo-600" },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">{r.label}</span>
                          <span className={cn("text-xs font-bold", r.color)}>{r.val}</span>
                        </div>
                      ))}
                      {dashboard.weeklyWorkload.overduePractice > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] font-bold text-orange-600">
                            {dashboard.weeklyWorkload.overduePractice} overdue
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* My Upcoming Revisions This Week */}
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Revisions This Week
                    </p>
                    <div className="space-y-1">
                      {[
                        { label: "Quick Rev I",  val: dashboard.weeklyWorkload.qr1, color: "text-amber-600" },
                        { label: "Quick Rev II", val: dashboard.weeklyWorkload.qr2, color: "text-yellow-600" },
                      ].map(r => (
                        <div key={r.label} className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">{r.label}</span>
                          <span className={cn("text-xs font-bold", r.color)}>{r.val}</span>
                        </div>
                      ))}
                      {dashboard.weeklyWorkload.overdueRevisions > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] font-bold text-orange-600">
                            {dashboard.weeklyWorkload.overdueRevisions} overdue
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Row 2: Subject progress + Readiness + Exam countdown ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Subject-wise Chapters Completed */}
                <Card className="rounded-2xl border-none shadow-sm bg-white col-span-1">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chapters Completed</p>
                    {dashboard.subjectProgress.map(sp => (
                      <div key={sp.subject} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", SUBJECT_DOT[sp.subject])} />
                            <span className={cn("text-xs font-semibold", SUBJECT_TEXT[sp.subject])}>
                              {SUBJECT_LABEL[sp.subject]}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {sp.completed} / {sp.total}
                            <span className="text-[10px] text-slate-400 ml-1">({sp.pct}%)</span>
                          </span>
                        </div>
                        <Progress value={sp.pct} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Baseline Readiness */}
                {readiness && (
                  <Card className="rounded-2xl border-none shadow-sm bg-white col-span-1">
                    <CardContent className="p-4 space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Baseline Readiness
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Excellent", val: readiness.excellent,  range: ">85%",    bg: "bg-emerald-50", text: "text-emerald-700" },
                          { label: "Strong",    val: readiness.strong,     range: "70–85%",  bg: "bg-blue-50",    text: "text-blue-700"    },
                          { label: "Acceptable",val: readiness.acceptable, range: "40–70%",  bg: "bg-amber-50",   text: "text-amber-700"   },
                          { label: "Weak",      val: readiness.weak,       range: "<40%",    bg: "bg-rose-50",    text: "text-rose-700"    },
                        ].map(r => (
                          <div key={r.label} className={cn("rounded-xl p-2.5 text-center", r.bg)}>
                            <p className={cn("text-lg font-bold", r.text)}>{r.val}</p>
                            <p className={cn("text-[10px] font-semibold", r.text)}>{r.label}</p>
                            <p className="text-[9px] text-slate-400">{r.range}</p>
                          </div>
                        ))}
                      </div>
                      {readiness.untested > 0 && (
                        <p className="text-[10px] text-slate-400 text-center">
                          + {readiness.untested} chapters untested
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Days Remaining + Exam date */}
                <Card className={cn(
                  "rounded-2xl border-none shadow-sm col-span-1",
                  dashboard.daysRemaining <= 30 ? "bg-red-50" :
                  dashboard.daysRemaining <= 90 ? "bg-amber-50" : "bg-white",
                )}>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days Remaining</p>
                      <p className={cn(
                        "text-4xl font-bold mt-1",
                        dashboard.daysRemaining <= 30 ? "text-red-600" :
                        dashboard.daysRemaining <= 90 ? "text-amber-600" : "text-slate-900",
                      )}>
                        {dashboard.daysRemaining}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">until {dashboard.examCode} on {format(parseISO(dashboard.examDate), "d MMM yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Simulation Zone</p>
                      <p className="text-sm font-bold text-red-600 mt-0.5">
                        {format(parseISO(dashboard.revisionZoneStart), "d MMM yyyy")}
                      </p>
                      <p className="text-[10px] text-slate-400">mock tests & revision only after this date</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* ── Calendar Section ──────────────────────────────────────────── */}
          <div className="flex gap-5">

            {/* Left: Calendar */}
            <div className="flex-1 min-w-0">
              <Card className="rounded-2xl border-none shadow-sm bg-white">
                <CardContent className="p-5 space-y-4">

                  {/* Controls row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                        onClick={() => setViewMonth(v =>
                          calView === "yearly" ? new Date(getYear(v) - 1, 0, 1)
                          : calView === "quarterly" ? subMonths(v, 3)
                          : subMonths(v, 1)
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-sm font-bold text-slate-800 min-w-[120px] text-center">
                        {calView === "yearly"
                          ? getYear(viewMonth)
                          : calView === "quarterly"
                          ? `Q${getQuarter(viewMonth)} ${getYear(viewMonth)}`
                          : format(viewMonth, "MMMM yyyy")}
                      </h2>
                      <button
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                        onClick={() => setViewMonth(v =>
                          calView === "yearly" ? new Date(getYear(v) + 1, 0, 1)
                          : calView === "quarterly" ? addMonths(v, 3)
                          : addMonths(v, 1)
                        )}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        onClick={() => setViewMonth(today)}
                      >
                        Today
                      </button>
                    </div>

                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(["monthly","quarterly","yearly"] as CalView[]).map(v => (
                        <button
                          key={v}
                          onClick={() => setCalView(v)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                            calView === v
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-700",
                          )}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { label: "Study",     color: "bg-blue-500"     },
                      { label: "Practice",  color: "bg-purple-500"   },
                      { label: "Revision",  color: "bg-amber-500"    },
                      { label: "Mock",      color: "bg-red-500"      },
                      { label: "Completed", color: "bg-emerald-500"  },
                      { label: "Overdue",   color: "bg-orange-500"   },
                      { label: "Buffer",    color: "bg-slate-300"    },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", l.color)} />
                        <span className="text-[10px] text-slate-500">{l.label}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-3 rounded-sm bg-red-100 border border-red-200" />
                      <span className="text-[10px] text-slate-500">Exam Zone</span>
                    </div>
                  </div>

                  {/* Calendar grid */}
                  {calView === "monthly" && (
                    <CalGrid
                      viewMonth={viewMonth}
                      dayMap={dayMap}
                      onDayClick={d => setSelectedDate(prev => prev && isSameDay(prev, d) ? null : d)}
                      selectedDate={selectedDate}
                      revZoneStart={revZoneStartDate}
                      examDate={examDateObj}
                      today={today}
                    />
                  )}
                  {calView === "quarterly" && (
                    <QuarterlyView
                      viewMonth={viewMonth}
                      dayMap={dayMap}
                      onDayClick={d => setSelectedDate(prev => prev && isSameDay(prev, d) ? null : d)}
                      selectedDate={selectedDate}
                      revZoneStart={revZoneStartDate}
                      examDate={examDateObj}
                      today={today}
                    />
                  )}
                  {calView === "yearly" && (
                    <YearlyView
                      viewMonth={viewMonth}
                      dayMap={dayMap}
                      revZoneStart={revZoneStartDate}
                      examDate={examDateObj}
                      today={today}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Day panel */}
            {selectedDate && (
              <div className="w-[360px] shrink-0">
                <Card className="rounded-2xl border-none shadow-sm bg-white sticky top-4 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                  <DayPanel
                    date={selectedDate}
                    items={selectedDayItems}
                    onClose={() => setSelectedDate(null)}
                    onLaunchPractice={handleLaunchPractice}
                    onMarkComplete={handleMarkComplete}
                    actionLoadingId={actionLoadingId}
                    revZoneStart={revZoneStartDate}
                  />
                </Card>
              </div>
            )}
          </div>

          {/* ── Anchor note ───────────────────────────────────────────────── */}
          {calMeta && (
            <p className="text-center text-[11px] text-slate-400">
              Calendar anchored to <strong>{format(parseISO(calMeta.generatedAt), "d MMM yyyy")}</strong>.
              Schedule remains fixed until explicitly regenerated.
            </p>
          )}
        </div>
      </main>
    </MentorLayout>
  )
}
