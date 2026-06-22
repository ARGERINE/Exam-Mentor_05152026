"use client"

/**
 * My Learning Calendar — NEET Learning Workflow Engine V2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Route:  /study-plan/learning-calendar
 *
 * Improvements over V1:
 *  - Fixed broken generateCalendar() (unreachable code after early closing brace)
 *  - Fixed JSX syntax error in CalGrid (duplicate <div> open tag)
 *  - Fixed setReadiness() never being called
 *  - Added Board Exam Freeze (Feb 10 – Mar 25) with visual indicator
 *  - Added Chapter Status System (⚪🔵🟡🟢🔴) driven by performance data
 *  - Added Pause/Resume system with 6 pause reasons
 *  - Fixed Ahead/Behind color rules to match spec (0-14 blue, 15-25 green/yellow, 26+ green★/red)
 *  - Added NUMERICAL_DRILL to STAGE_OFFSETS
 *  - Removed dead buildLegacySchedule() code
 *  - buildChapterMilestones() now correctly receives all 3 arguments
 *  - Quarterly grid replaced with a Milestones timeline view
 *  - viewMonth/calView persisted to sessionStorage so navigating away and
 *    back doesn't reset the calendar to today/monthly
 *  - Removed Today's Plan, Risk Alerts, and Revision Queue cards (kept
 *    dashboard data computation intact for future re-use)
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
import { Label }         from "@/components/ui/label"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

import { supabase }        from "@/lib/supabase/client"
import { useSupabaseUser } from "@/lib/supabase/hooks"
import { createAttempt }   from "@/lib/attempts/createAttempt"
import { cn }              from "@/lib/utils"

import {
  addDays, differenceInDays, eachDayOfInterval, endOfMonth,
  format, getDay, isSameDay, isSameMonth, isToday, parseISO,
  startOfMonth, subDays, addMonths, subMonths, isAfter, isBefore,
  startOfDay, startOfWeek, endOfWeek, getYear,
} from "date-fns"

import {
  AlertCircle, AlertTriangle, BookOpen, Calendar, CheckCircle2,
  ChevronLeft, ChevronRight,
  Circle, Clock, Flame, GraduationCap, Lock, PlayCircle,
  RefreshCw, RotateCcw, Sparkles, Star, TrendingDown, TrendingUp,
  Zap, ShieldAlert, BookMarked, FlaskConical, Leaf, Pause, PauseCircle,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Stage = "LEARNING" | "NUMERICAL_DRILL" | "P1" | "P2" | "QR1" | "P3" | "QR2"
type ActivityType = "LEARNING" | "NUMERICAL_DRILL" | "PRACTICE" | "REVISION" | "MOCK" | "BUFFER" | "BOARD_BREAK"
type ItemStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "OVERDUE" | "LOCKED"
type CalView = "monthly" | "milestones" | "yearly"

// Chapter status driven by performance — NOT manually set
type ChapterStatus =
  | "NOT_STARTED"   // ⚪ No learning started
  | "IN_PROGRESS"   // 🔵 Learning started
  | "PRACTICE_PENDING" // 🟡 Learning complete, P1 not attempted
  | "COMPLETED"     // 🟢 P1 >= 40%
  | "REWORK_REQUIRED"  // 🔴 P1 < 40%

const CHAPTER_STATUS_DOT: Record<ChapterStatus, string> = {
  NOT_STARTED:      "⚪",
  IN_PROGRESS:      "🔵",
  PRACTICE_PENDING: "🟡",
  COMPLETED:        "🟢",
  REWORK_REQUIRED:  "🔴",
}

const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  NOT_STARTED:      "Not Started",
  IN_PROGRESS:      "In Progress",
  PRACTICE_PENDING: "Practice Pending",
  COMPLETED:        "Completed",
  REWORK_REQUIRED:  "Rework Required",
}

type PauseReason = "NEED_BREAK" | "SCHOOL_EXAMS" | "FAMILY_EVENT" | "TRAVEL" | "ILLNESS" | "OTHER"

const PAUSE_REASON_LABELS: Record<PauseReason, string> = {
  NEED_BREAK:    "Need a Break",
  SCHOOL_EXAMS:  "School Exams",
  FAMILY_EVENT:  "Family Event",
  TRAVEL:        "Travel",
  ILLNESS:       "Illness",
  OTHER:         "Other",
}

interface PauseState {
  isPaused: boolean
  pauseReason: PauseReason | null
  pauseStartDate: string | null
  pauseEndDate: string | null
  pauseDays: number
}

interface CalItem {
  id: string
  calendarId: string
  chapterId: string | null
  chapterName: string
  subjectId: string | null
  subjectName: string
  stage: Stage
  activityType: ActivityType
  scheduledDate: string
  status: ItemStatus
  p1Score: number | null
  p1Attempted: boolean
  p1Passed: boolean
  canComplete: boolean
  learningDayIndex?: number
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
  phase?: string | null
  chapterStatus?: ChapterStatus
}

interface CalendarMeta {
  id: string
  generatedAt: string
  examDate: string
  revisionZoneStart: string
  totalChapters: number
  weeklyStudyHours: number
  examCode: string
  pauseState?: PauseState
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
  todayItems: CalItem[]
  revisionQueue: CalItem[]
  chapterStatusCounts: Record<ChapterStatus, number>
}

interface ReadinessBreakdown {
  excellent: number
  strong: number
  acceptable: number
  weak: number
  untested: number
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LEARNING_DAYS: Record<string, number> = {
  Easy: 3,
  Medium: 4,
  Hard: 5,
  "Physics Numerical Heavy": 6,
}

const DEFAULT_LEARNING_DAYS = 4
const BUFFER_DAYS = 1
const REVISION_ZONE_DAYS = 90

// Board exam freeze: Feb 10 – Mar 25 (month is 0-indexed in Date constructor)
const BOARD_FREEZE_START = { month: 1, day: 10 }  // Feb 10
const BOARD_FREEZE_END   = { month: 2, day: 25 }  // Mar 25

const STAGE_OFFSETS: Record<Exclude<Stage, "LEARNING">, number> = {
  NUMERICAL_DRILL: 0,
  P1:  1,
  P2:  21,
  QR1: 45,
  P3:  75,
  QR2: 90,
}

const SUBJECT_LABEL: Record<string, string> = {
  PHYSICS: "Physics", CHEMISTRY: "Chemistry", BIOLOGY: "Biology",
}
const SUBJECT_DOT: Record<string, string> = {
  PHYSICS: "bg-orange-400", CHEMISTRY: "bg-sky-400", BIOLOGY: "bg-emerald-400",
}
const SUBJECT_TEXT: Record<string, string> = {
  PHYSICS: "text-orange-700", CHEMISTRY: "text-sky-700", BIOLOGY: "text-emerald-700",
}

const ACTIVITY_CHIP: Record<ActivityType | "COMPLETED" | "OVERDUE", string> = {
  LEARNING:     "bg-blue-100 text-blue-700",
  NUMERICAL_DRILL: "bg-cyan-100 text-cyan-700",
  PRACTICE:     "bg-purple-100 text-purple-700",
  REVISION:     "bg-amber-100 text-amber-700",
  MOCK:         "bg-red-100 text-red-700",
  BUFFER:       "bg-slate-100 text-slate-500",
  BOARD_BREAK:  "bg-pink-100 text-pink-700",
  COMPLETED:    "bg-emerald-100 text-emerald-700",
  OVERDUE:      "bg-orange-100 text-orange-700",
}

const STAGE_LABEL: Record<Stage, string> = {
  LEARNING:        "Study",
  NUMERICAL_DRILL: "Numerical Drill",
  P1:  "Practice I",
  P2:  "Practice II",
  QR1: "Quick Revision I",
  P3:  "Practice III",
  QR2: "Quick Revision II",
}

const PRACTICE_EXAM_ID = "056f6347-d963-4c82-a3ec-eff587dfc99c"

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the given date falls within the board exam freeze window
 * for ANY year (Feb 10 – Mar 25).
 */
function isBoardFreeze(date: Date): boolean {
  const m = date.getMonth()  // 0-indexed
  const d = date.getDate()
  if (m === BOARD_FREEZE_START.month && d >= BOARD_FREEZE_START.day) return true
  if (m === BOARD_FREEZE_END.month   && d <= BOARD_FREEZE_END.day)   return true
  return false
}

/**
 * Derives chapter status AUTOMATICALLY from Practice-I attempt outcomes
 * stored on learning_calendar_items (practice_1_attempted, practice_1_score).
 * This is the single source of truth — no manual completion flag is used.
 *
 * Rule (per business rules):
 *   if (!practice_1_attempted)      → PRACTICE_PENDING (once learning has started)
 *   if (practice_1_score >= 40)     → COMPLETED
 *   else                            → REWORK_REQUIRED
 *
 * NOT_STARTED / IN_PROGRESS are preserved for chapters that haven't reached
 * the learning stage yet, or are mid-learning before Practice I is due.
 */
function deriveChapterStatus(
  hasLearningItem: boolean,
  learningStarted: boolean,
  p1Attempted: boolean,
  p1Score: number | null,
): ChapterStatus {
  if (!hasLearningItem) return "NOT_STARTED"
  if (!p1Attempted) {
    return learningStarted ? "PRACTICE_PENDING" : "IN_PROGRESS"
  }
  if ((p1Score ?? 0) >= 40) return "COMPLETED"
  return "REWORK_REQUIRED"
}

/**
 * Resolves the display status of a single calendar item.
 *
 * For LEARNING items, completion is now driven automatically by
 * `autoCompleted` (derived from practice_1_attempted + practice_1_score),
 * NOT by a manually-set status column. For all other milestone types
 * (P2/P3/QR1/QR2/NUMERICAL_DRILL/MOCK) the stored status is unaffected —
 * those milestones contribute to mastery/retention only and are not
 * governed by the Practice-I completion rule (Rule 4).
 */
function resolveStatus(
  storedStatus: string,
  scheduledDate: string,
  today: Date,
  autoCompleted: boolean = false,
): ItemStatus {
  if (autoCompleted) return "COMPLETED"
  if (storedStatus === "COMPLETED") return "COMPLETED"
  const d = parseISO(scheduledDate)
  if (isBefore(d, today) && !isSameDay(d, today)) return "OVERDUE"
  if (isToday(d)) return "ACTIVE"
  return "SCHEDULED"
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULING ENGINE
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
  phase?: string | null
}

/**
 * Builds chapter milestones with:
 *  - Board exam freeze respected
 *  - Daily load balancing (max 3 events/day, max 2 chapter starts/day)
 *  - Numerical chapter spacing (min 7 days between numerical starts per subject)
 *  - XI before XII sequencing with 14-day buffer between phases
 *  - Practice/Revision windows with ±day flexibility
 */
function buildChapterMilestones(
  chapters: RawChapter[],
  planStartDate: Date,
  examDate: Date,
): any[] {
  const rows: any[] = []

  const dailyLoad     = new Map<string, number>()
  const chapterStarts = new Map<string, number>()
  const lastNumericalStartBySubject = new Map<string, Date>()

  let hardTrackCursor   = new Date(planStartDate)
  let normalTrackCursor = new Date(planStartDate)

  let lastXICompletionDate:  Date | null = null
  let lastXIICompletionDate: Date | null = null
  let phase2StartDate:       Date | null = null

  function getDateKey(date: Date) {
    return format(date, "yyyy-MM-dd")
  }

  /** Skip board-freeze days and return the next available date */
  function skipFreeze(date: Date): Date {
    let d = new Date(date)
    while (isBoardFreeze(d)) {
      d = addDays(d, 1)
    }
    return d
  }

  /**
   * Finds the best date near preferredDate (within ±minusDays..plusDays)
   * that has the lowest daily load and does not exceed 3 events/day.
   * Also skips board freeze dates.
   */
  function reserveDate(
    preferredDate: Date,
    minusDays: number,
    plusDays: number,
  ): Date {
    let bestDate: Date | null = null
    let bestLoad = 999

    for (let offset = -minusDays; offset <= plusDays; offset++) {
      const candidate = skipFreeze(addDays(preferredDate, offset))
      const key  = getDateKey(candidate)
      const load = dailyLoad.get(key) ?? 0
      if (load >= 3) continue
      if (load < bestLoad) {
        bestLoad = load
        bestDate = candidate
        if (load === 0) break
      }
    }

    if (!bestDate) bestDate = skipFreeze(preferredDate)

    const key = getDateKey(bestDate)
    dailyLoad.set(key, (dailyLoad.get(key) ?? 0) + 1)
    return bestDate
  }

  function sortChapters(list: typeof chapters) {
    return [...list].sort((a, b) => {
      const pa = a.neet_priority === "High" ? 0 : a.neet_priority === "Medium" ? 1 : 2
      const pb = b.neet_priority === "High" ? 0 : b.neet_priority === "Medium" ? 1 : 2
      if (pa !== pb) return pa - pb
      return (a.chapter_order ?? 999) - (b.chapter_order ?? 999)
    })
  }

  const xiChapters  = sortChapters(chapters.filter(c => c.class_level === "XI"))
  const xiiChapters = sortChapters(chapters.filter(c => c.class_level === "XII"))
  const sorted      = [...xiChapters, ...xiiChapters]

  for (const ch of sorted) {
    const isHard =
      ch.chapter_difficulty === "Hard" ||
      ch.chapter_difficulty === "Physics Numerical Heavy"

    let cursor = isHard ? new Date(hardTrackCursor) : new Date(normalTrackCursor)

    // Phase II cannot start before phase2StartDate
    if (ch.class_level === "XII" && phase2StartDate) {
      if (cursor < phase2StartDate) cursor = new Date(phase2StartDate)
    }

    // Skip board freeze for chapter start
    cursor = skipFreeze(cursor)

    // Enforce max 2 chapter starts per day
    while ((chapterStarts.get(getDateKey(cursor)) ?? 0) >= 2) {
      cursor = skipFreeze(addDays(cursor, 1))
    }

    let targetStartDate = new Date(cursor)

    const isNumericalChapter =
      ch.chapter_type === "Numerical" ||
      ch.chapter_type === "Concept+Numerical"

    // Enforce min 7-day gap between numerical chapter starts per subject
    if (isNumericalChapter) {
      const previous = lastNumericalStartBySubject.get(ch.subject_id)
      if (previous && differenceInDays(targetStartDate, previous) < 7) {
        targetStartDate = skipFreeze(addDays(previous, 7))
      }
    }

    const learningDays =
      LEARNING_DAYS[ch.chapter_difficulty ?? ""] ?? DEFAULT_LEARNING_DAYS

    const targetCompletionDate = addDays(targetStartDate, learningDays + BUFFER_DAYS)

    // Track phase end dates
    if (ch.class_level === "XI") {
      if (!lastXICompletionDate || targetCompletionDate > lastXICompletionDate) {
        lastXICompletionDate = targetCompletionDate
        phase2StartDate      = addDays(lastXICompletionDate, 14)
      }
    } else if (ch.class_level === "XII") {
      if (!lastXIICompletionDate || targetCompletionDate > lastXIICompletionDate) {
        lastXIICompletionDate = targetCompletionDate
      }
    }

    // Numerical drill: near completion, before P1
    const numericalDrillDate = isNumericalChapter
      ? reserveDate(targetCompletionDate, 1, 1)
      : null

    const practice1BaseDate = numericalDrillDate
      ? addDays(numericalDrillDate, 1)
      : addDays(targetCompletionDate, 1)

    const practice1Date = reserveDate(practice1BaseDate, 0, 2)
    const practice2Date = reserveDate(addDays(targetCompletionDate, STAGE_OFFSETS.P2), 3, 3)
    const revision1Date = reserveDate(addDays(targetCompletionDate, STAGE_OFFSETS.QR1), 2, 2)
    const practice3Date = reserveDate(addDays(targetCompletionDate, STAGE_OFFSETS.P3), 5, 5)
    const revision2Date = reserveDate(addDays(targetCompletionDate, STAGE_OFFSETS.QR2), 3, 3)

    // Register learning event in load tracker
    const learningKey = getDateKey(targetStartDate)
    dailyLoad.set(learningKey, (dailyLoad.get(learningKey) ?? 0) + 1)
    chapterStarts.set(
      getDateKey(targetStartDate),
      (chapterStarts.get(getDateKey(targetStartDate)) ?? 0) + 1,
    )

    if (isNumericalChapter) {
      lastNumericalStartBySubject.set(ch.subject_id, targetStartDate)
    }

    rows.push({
      chapterId:    ch.id,
      chapterName:  ch.chapter_name,
      phase:        ch.class_level === "XI" ? "PHASE_1" : "PHASE_2",
      subjectId:    ch.subject_id,
      subjectName:  ch.subjectName,
      chapterDifficulty: ch.chapter_difficulty,
      neetPriority:      ch.neet_priority,

      targetStartDate:      format(targetStartDate, "yyyy-MM-dd"),
      targetCompletionDate: format(targetCompletionDate, "yyyy-MM-dd"),
      actualCompletionDate: null,

      practice1Date: format(practice1Date, "yyyy-MM-dd"),
      practice2Date: format(practice2Date, "yyyy-MM-dd"),
      practice3Date: format(practice3Date, "yyyy-MM-dd"),
      revision1Date: format(revision1Date, "yyyy-MM-dd"),
      revision2Date: format(revision2Date, "yyyy-MM-dd"),
      numericalDrillDate: numericalDrillDate
        ? format(numericalDrillDate, "yyyy-MM-dd")
        : null,

      scheduleStatus: "PENDING",
    })

    const nextStart = addDays(targetCompletionDate, 1)
    if (isHard) hardTrackCursor   = nextStart
    else        normalTrackCursor = nextStart
  }

  return rows
}

// ─────────────────────────────────────────────────────────────────────────────
// AHEAD/BEHIND COLOR — matches spec exactly
// 0-14 days: blue | 15-25 ahead: green | 15-25 behind: yellow | 26+ ahead: green★ | 26+ behind: red
// ─────────────────────────────────────────────────────────────────────────────

function getAheadBehindStyle(status: "ON_TRACK" | "AHEAD" | "BEHIND", days: number): {
  color: string; icon: React.ReactNode; label: string
} {
  if (status === "ON_TRACK" || days <= 14) {
    return {
      color: "text-blue-600",
      icon: <TrendingUp className="w-3 h-3 text-blue-500" />,
      label: status === "ON_TRACK" ? "On Track" : days > 0 ? `${days}d ${status === "AHEAD" ? "ahead" : "behind"}` : "On Track",
    }
  }
  if (status === "AHEAD") {
    if (days <= 25) return { color: "text-emerald-600", icon: <TrendingUp className="w-3 h-3 text-emerald-500" />, label: `${days}d ahead` }
    return { color: "text-emerald-700 font-black", icon: <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />, label: `${days}d ahead ★` }
  }
  // BEHIND
  if (days <= 25) return { color: "text-yellow-600", icon: <TrendingDown className="w-3 h-3 text-yellow-500" />, label: `${days}d behind` }
  return { color: "text-red-600 font-bold", icon: <TrendingDown className="w-3 h-3 text-red-500" />, label: `${days}d behind` }
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
// PAUSE / RESUME DIALOG
// ─────────────────────────────────────────────────────────────────────────────

interface PauseDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: PauseReason, days: number) => void
}

function PauseDialog({ open, onClose, onConfirm }: PauseDialogProps) {
  const [reason, setReason] = useState<PauseReason>("NEED_BREAK")
  const [days,   setDays]   = useState(3)

  const needsRecalibration = days >= 7
  const dayOptions = [1,2,3,5,7,10,14,21,30,45]

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PauseCircle className="w-4 h-4 text-amber-500" />
            Pause Learning Calendar
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</Label>
            <Select value={reason} onValueChange={v => setReason(v as PauseReason)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PAUSE_REASON_LABELS) as [PauseReason, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</Label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                    days === d
                      ? "bg-primary text-white border-primary"
                      : "text-slate-600 border-slate-200 hover:border-slate-400",
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {days >= 1 && days <= 6 && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 font-medium">
              ✓ Short break — no recalibration needed. Calendar resumes automatically.
            </div>
          )}
          {days >= 7 && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 font-medium">
              ⚠ Longer pause — calendar will recalculate remaining tasks from your resume date (does NOT regenerate).
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
          <Button className="rounded-xl gap-2" onClick={() => onConfirm(reason, days)}>
            <Pause className="w-3 h-3" />
            Pause for {days} day{days > 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTER STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

function ChapterStatusBadge({ status }: { status: ChapterStatus }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm cursor-default select-none">
            {CHAPTER_STATUS_DOT[status]}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs font-medium">{CHAPTER_STATUS_LABEL[status]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// P1 STATUS DISPLAY (read-only)
// Chapter completion is fully automatic — derived from practice_1_attempted,
// practice_1_score, practice_1_passed on learning_calendar_items. This is a
// display-only component; there is no manual "mark complete" action.
// ─────────────────────────────────────────────────────────────────────────────

interface P1StatusDisplayProps {
  item: CalItem
}

function P1StatusDisplay({ item }: P1StatusDisplayProps) {
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

  const needsRework = item.p1Attempted && !item.canComplete

  return (
    <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
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

      {needsRework && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-2">
          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-700 font-medium">
            Practice I score below 40%. Retry Practice I — the chapter will be
            marked complete automatically once you score 40% or higher.
          </p>
        </div>
      )}

      {!item.p1Attempted && (
        <p className="text-[11px] text-slate-400 italic">
          Attempt Practice I to automatically update this chapter's status.
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDAR GRID
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
  const mStart   = startOfMonth(viewMonth)
  const mEnd     = endOfMonth(viewMonth)
  const padStart = (getDay(mStart) + 6) % 7
  const padEnd   = (7 - ((getDay(mEnd) + 6) % 7 + 1)) % 7
  const gridDays = eachDayOfInterval({
    start: subDays(mStart, padStart),
    end:   addDays(mEnd, padEnd),
  })

  const HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {HEADERS.map(h => (
          <div key={h} className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
        {gridDays.map(day => {
          const key         = format(day, "yyyy-MM-dd")
          const items       = dayMap.get(key) ?? []
          const inMonth     = isSameMonth(day, viewMonth)
          const isSelected  = selectedDate ? isSameDay(day, selectedDate) : false
          const todayCell   = isToday(day)
          const isBoardFreezeDay = isBoardFreeze(day)
          const isRevZone   = revZoneStart && examDate
            ? !isBefore(day, revZoneStart) && !isAfter(day, examDate)
            : false
          const isExamDay   = examDate ? isSameDay(day, examDate) : false

          return (
            <div
              key={key}
              onClick={() => inMonth && onDayClick(day)}
              className={cn(
                "relative min-h-[82px] p-1.5 bg-white transition-colors",
                inMonth ? "cursor-pointer hover:bg-slate-50" : "opacity-30 pointer-events-none",
                isSelected ? "bg-primary/5 ring-2 ring-inset ring-primary/40" : "",
                isRevZone && inMonth && !isExamDay ? "bg-red-50/50" : "",
                isExamDay ? "bg-red-100" : "",
                // Board freeze: soft pink wash
                isBoardFreezeDay && inMonth ? "bg-pink-50/60" : "",
              )}
            >
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
                {isBoardFreezeDay && inMonth && (
                  <span className="text-[7px] font-bold text-pink-400 leading-none">BOARD</span>
                )}
              </div>

              {items.length > 0 && (
                <div className="space-y-0.5">
                  {items.slice(0, 3).map((item, idx) => {
                    const chip =
                      item.status === "COMPLETED" ? ACTIVITY_CHIP.COMPLETED :
                      item.status === "OVERDUE"   ? ACTIVITY_CHIP.OVERDUE :
                      ACTIVITY_CHIP[item.activityType]

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "text-[8px] font-semibold px-1 py-0.5 rounded truncate leading-tight border-l-2",
                          chip,
                          item.phase === "PHASE_1" ? "border-l-blue-500" :
                          item.phase === "PHASE_2" ? "border-l-violet-500" :
                          "border-l-transparent",
                        )}
                      >
                        {item.activityType === "MOCK"
                          ? "Mock Test"
                          : item.activityType === "BOARD_BREAK"
                          ? "Board Break"
                          : item.isBufferDay
                          ? `${item.chapterName} · Buffer`
                          : item.stage === "LEARNING"
                          ? item.chapterName
                          : `${item.chapterName} · ${STAGE_LABEL[item.stage]}`}
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

              {/* Board freeze indicator (no items) */}
              {isBoardFreezeDay && inMonth && items.length === 0 && (
                <div className="text-[8px] text-pink-400 font-medium mt-0.5">Board Prep</div>
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
// MILESTONES VIEW
// Vertical timeline of phase transitions, board freeze, exam simulation zone,
// mock tests and exam day — replaces the old 3-month grid (redundant with
// monthly/yearly views) with information unique to this scale.
// ─────────────────────────────────────────────────────────────────────────────

type MilestoneKind = "PHASE" | "BOARD" | "EXAM_ZONE" | "MOCK" | "EXAM_DAY" | "TODAY"

interface Milestone {
  id: string
  date: Date
  kind: MilestoneKind
  title: string
  subtitle?: string
  isRange?: { start: Date; end: Date }
}

const MILESTONE_STYLE: Record<MilestoneKind, { dot: string; bg: string; text: string; icon: React.ReactNode }> = {
  PHASE:     { dot: "bg-violet-500",  bg: "bg-violet-50 border-violet-200",  text: "text-violet-700",  icon: <BookMarked className="w-3.5 h-3.5" /> },
  BOARD:     { dot: "bg-pink-500",    bg: "bg-pink-50 border-pink-200",      text: "text-pink-700",    icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  EXAM_ZONE: { dot: "bg-red-500",     bg: "bg-red-50 border-red-200",        text: "text-red-700",     icon: <Flame className="w-3.5 h-3.5" /> },
  MOCK:      { dot: "bg-orange-500",  bg: "bg-orange-50 border-orange-200",  text: "text-orange-700",  icon: <FlaskConical className="w-3.5 h-3.5" /> },
  EXAM_DAY:  { dot: "bg-red-700",     bg: "bg-red-100 border-red-300",       text: "text-red-800",     icon: <GraduationCap className="w-3.5 h-3.5" /> },
  TODAY:     { dot: "bg-primary",     bg: "bg-primary/5 border-primary/20",  text: "text-primary",     icon: <Star className="w-3.5 h-3.5" /> },
}

function buildMilestones(
  allItems: CalItem[],
  revZoneStart: Date | null,
  examDate: Date | null,
  today: Date,
): Milestone[] {
  const ms: Milestone[] = []

  // Phase I / II transitions — derived from last learning item per phase
  const phase1Learning = allItems.filter(i => i.phase === "PHASE_1" && i.activityType === "LEARNING")
  const phase2Learning = allItems.filter(i => i.phase === "PHASE_2" && i.activityType === "LEARNING")

  if (phase1Learning.length) {
    const lastDate = phase1Learning.reduce((max, i) => {
      const d = parseISO(i.scheduledDate)
      return d > max ? d : max
    }, parseISO(phase1Learning[0].scheduledDate))
    const exitDate = addDays(lastDate, 14)
    ms.push({
      id: "phase1-exit",
      date: exitDate,
      kind: "PHASE",
      title: "Phase I Complete — Class XI Foundation",
      subtitle: `Exit ${format(exitDate, "d MMM yyyy")} · last learning + 14d buffer`,
    })
  }

  if (phase2Learning.length) {
    const lastDate = phase2Learning.reduce((max, i) => {
      const d = parseISO(i.scheduledDate)
      return d > max ? d : max
    }, parseISO(phase2Learning[0].scheduledDate))
    const exitDate = addDays(lastDate, 14)
    ms.push({
      id: "phase2-exit",
      date: exitDate,
      kind: "PHASE",
      title: "Phase II Complete — Class XII Foundation",
      subtitle: `Exit ${format(exitDate, "d MMM yyyy")} · last learning + 14d buffer`,
    })
  }

  // Board exam freeze windows occurring between today and exam date
  if (examDate) {
    let y = today.getFullYear()
    const endY = examDate.getFullYear()
    while (y <= endY) {
      const start = new Date(y, BOARD_FREEZE_START.month, BOARD_FREEZE_START.day)
      const end   = new Date(y, BOARD_FREEZE_END.month, BOARD_FREEZE_END.day)
      if (!isBefore(end, today) && !isAfter(start, examDate)) {
        ms.push({
          id: `board-${y}`,
          date: start,
          kind: "BOARD",
          title: "Board Examination Break",
          subtitle: `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")} · no new learning scheduled`,
          isRange: { start, end },
        })
      }
      y++
    }
  }

  // Exam simulation zone start
  if (revZoneStart) {
    ms.push({
      id: "exam-zone",
      date: revZoneStart,
      kind: "EXAM_ZONE",
      title: "Exam Simulation Zone Begins",
      subtitle: "Mock tests & revision only from this date onward",
    })
  }

  // Mock tests
  const mocks = allItems.filter(i => i.activityType === "MOCK")
  mocks.forEach((m, idx) => {
    ms.push({
      id: `mock-${m.id}`,
      date: parseISO(m.scheduledDate),
      kind: "MOCK",
      title: `Full Mock Test ${idx + 1}`,
    })
  })

  // Exam day
  if (examDate) {
    ms.push({
      id: "exam-day",
      date: examDate,
      kind: "EXAM_DAY",
      title: "Exam Day",
      subtitle: format(examDate, "EEEE, d MMMM yyyy"),
    })
  }

  // Today marker
  ms.push({
    id: "today-marker",
    date: today,
    kind: "TODAY",
    title: "Today",
    subtitle: format(today, "EEEE, d MMMM yyyy"),
  })

  return ms.sort((a, b) => a.date.getTime() - b.date.getTime())
}

function MilestonesView({
  allItems, revZoneStart, examDate, today,
}: {
  allItems: CalItem[]
  revZoneStart: Date | null
  examDate: Date | null
  today: Date
}) {
  const milestones = useMemo(
    () => buildMilestones(allItems, revZoneStart, examDate, today),
    [allItems, revZoneStart, examDate, today],
  )

  if (!milestones.length) {
    return <p className="text-sm text-slate-400 italic text-center py-10">No milestones to display yet.</p>
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-slate-200" />

      <div className="space-y-4">
        {milestones.map(m => {
          const style = MILESTONE_STYLE[m.kind]
          const isPast = isBefore(m.date, today) && !isSameDay(m.date, today)

          return (
            <div key={m.id} className="relative">
              {/* Dot */}
              <div
                className={cn(
                  "absolute -left-6 top-1 w-[19px] h-[19px] rounded-full border-4 border-white shadow",
                  style.dot,
                  isPast ? "opacity-40" : "",
                )}
              />
              <Card className={cn("rounded-xl border shadow-sm", style.bg, isPast ? "opacity-60" : "")}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={cn("shrink-0 mt-0.5", style.text)}>{style.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs font-bold", style.text)}>{m.title}</p>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {format(m.date, "d MMM yyyy")}
                      </span>
                    </div>
                    {m.subtitle && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{m.subtitle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// YEARLY VIEW
// ─────────────────────────────────────────────────────────────────────────────

function YearlyView({
  viewMonth, dayMap, revZoneStart, examDate, today,
}: Omit<CalGridProps, "onDayClick" | "selectedDate">) {
  const anchorYear = getYear(viewMonth)
  const months = Array.from({ length: 12 }, (_, i) => new Date(anchorYear, i, 1))

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {months.map(m => {
        const mStart = startOfMonth(m)
        const isRev  = revZoneStart && examDate
          ? !isBefore(mStart, revZoneStart) && !isAfter(mStart, examDate)
          : false
        const isCurrentMonth = isSameMonth(m, today)
        const isBoardMonth =
          (m.getMonth() === 1 || m.getMonth() === 2)

        let learn = 0, prac = 0, rev = 0, mock = 0, done = 0
        dayMap.forEach((items, key) => {
          const d = parseISO(key)
          if (!isSameMonth(d, m)) return
          items.forEach(it => {
            if (it.status === "COMPLETED")          done++
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
              isRev ? "bg-red-50" : isBoardMonth ? "bg-pink-50" : "bg-white",
            )}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-xs font-bold",
                  isCurrentMonth ? "text-primary" :
                  isRev ? "text-red-600" :
                  isBoardMonth ? "text-pink-600" : "text-slate-700",
                )}>
                  {format(m, "MMM yyyy")}
                </p>
                {isRev && (
                  <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">Mock Zone</span>
                )}
                {isBoardMonth && !isRev && (
                  <span className="text-[9px] font-bold text-pink-500 bg-pink-100 px-1.5 py-0.5 rounded-full">Board</span>
                )}
              </div>

              {total > 0 ? (
                <>
                  <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
                    {learn > 0 && <div className="bg-blue-400"    style={{ flex: learn }} />}
                    {prac  > 0 && <div className="bg-purple-400"  style={{ flex: prac  }} />}
                    {rev   > 0 && <div className="bg-amber-400"   style={{ flex: rev   }} />}
                    {mock  > 0 && <div className="bg-red-400"     style={{ flex: mock  }} />}
                    {done  > 0 && <div className="bg-emerald-400" style={{ flex: done  }} />}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {[
                      { label: "Study",    val: learn, color: "text-blue-600"   },
                      { label: "Practice", val: prac,  color: "text-purple-600" },
                      { label: "Revision", val: rev,   color: "text-amber-600"  },
                      { label: "Mock",     val: mock,  color: "text-red-600"    },
                    ].filter(r => r.val > 0).map(r => (
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
  actionLoadingId: string | null
  revZoneStart: Date | null
}

function DayPanel({
  date, items, onClose, onLaunchPractice, actionLoadingId, revZoneStart,
}: DayPanelProps) {
  const isRevZone = revZoneStart ? !isBefore(date, revZoneStart) : false
  const isBoardFreezeDay = isBoardFreeze(date)

  const groups = {
    LEARNING:  items.filter(i => i.activityType === "LEARNING" && !i.isBufferDay),
    BUFFER:    items.filter(i => i.isBufferDay),
    PRACTICE:  items.filter(i => i.activityType === "PRACTICE"),
    REVISION:  items.filter(i => i.activityType === "REVISION"),
    MOCK:      items.filter(i => i.activityType === "MOCK"),
    NUMERICAL: items.filter(i => i.activityType === "NUMERICAL_DRILL"),
  }

  function GroupSection({
    title, groupItems, chip,
  }: { title: string; groupItems: CalItem[]; chip: string }) {
    if (!groupItems.length) return null
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        {groupItems.map(item => {
          const statusChip =
            item.status === "COMPLETED" ? ACTIVITY_CHIP.COMPLETED :
            item.status === "OVERDUE"   ? ACTIVITY_CHIP.OVERDUE :
            chip
          const accent = SUBJECT_DOT[item.subjectName]
          const canLaunch = 
  (
    item.activityType === "PRACTICE" ||
    item.activityType === "REVISION" ||
    item.activityType === "NUMERICAL_DRILL"
  ) &&
  item.status !== "COMPLETED"
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {accent && <div className={cn("w-2 h-2 rounded-full shrink-0", accent)} />}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {item.chapterStatus && (
                          <ChapterStatusBadge status={item.chapterStatus} />
                        )}
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.chapterName}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 truncate">
                        {STAGE_LABEL[item.stage]}
                        {item.learningDayIndex && !item.isBufferDay
                          ? ` • Day ${item.learningDayIndex}`
                          : item.isBufferDay ? " • Buffer Day" : ""}
                      </p>
                      {item.subjectName !== "ALL" && (
                        <p className={cn("text-[10px] font-medium", SUBJECT_TEXT[item.subjectName] ?? "text-slate-400")}>
                          {SUBJECT_LABEL[item.subjectName] ?? item.subjectName}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    statusChip,
                  )}>
                    {item.status === "COMPLETED" ? "Done" :
                     item.status === "OVERDUE"   ? "Overdue" : item.status}
                  </span>
                </div>

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

                <P1StatusDisplay item={item} />

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
                    {
  item.activityType === "NUMERICAL_DRILL"
    ? "Start Numerical Drill"
    : item.activityType === "REVISION"
      ? "Start Revision"
      : isMock
        ? "Start Mock"
        : `Start ${STAGE_LABEL[item.stage]}`
}
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
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {format(date, "EEEE")}
          </p>
          <p className="text-base font-bold text-slate-900">{format(date, "d MMMM yyyy")}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {isRevZone && (
              <Badge className="text-[10px] font-bold bg-red-100 text-red-700 border-none">
                Exam Simulation Zone
              </Badge>
            )}
            {isBoardFreezeDay && (
              <Badge className="text-[10px] font-bold bg-pink-100 text-pink-700 border-none">
                Board Examination Period
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isBoardFreezeDay && (
          <div className="rounded-xl bg-pink-50 border border-pink-200 p-3 text-xs text-pink-700 font-medium">
            Board Examination Break (Feb 10 – Mar 25). No new learning scheduled.
          </div>
        )}
        {items.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6 italic">
            {isRevZone     ? "Exam Simulation Zone — Mock Tests & Revision only" :
             isBoardFreezeDay ? "Board Exam break — rest and board preparation" :
             "No activities scheduled"}
          </p>
        )}
        <GroupSection title="Learning Tasks"     groupItems={groups.LEARNING}  chip={ACTIVITY_CHIP.LEARNING}        />
        <GroupSection title="Numerical Drills"   groupItems={groups.NUMERICAL} chip={ACTIVITY_CHIP.NUMERICAL_DRILL} />
        <GroupSection title="Buffer Day"         groupItems={groups.BUFFER}    chip={ACTIVITY_CHIP.BUFFER}          />
        <GroupSection title="Practice Tasks"     groupItems={groups.PRACTICE}  chip={ACTIVITY_CHIP.PRACTICE}        />
        <GroupSection title="Revision Tasks"     groupItems={groups.REVISION}  chip={ACTIVITY_CHIP.REVISION}        />
        <GroupSection title="Mock Tests"         groupItems={groups.MOCK}      chip={ACTIVITY_CHIP.MOCK}            />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW STATE PERSISTENCE
// The page component unmounts on navigation (Next.js route change), so plain
// useState always re-initializes to defaults on return. Persisting the last
// viewed month + calendar view mode to sessionStorage keeps the calendar
// where the user left it for the lifetime of the browser tab.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_MONTH_KEY = "lc:viewMonth"
const CAL_VIEW_KEY   = "lc:calView"

function readStoredViewMonth(fallback: Date): Date {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.sessionStorage.getItem(VIEW_MONTH_KEY)
    if (!raw) return fallback
    const parsed = parseISO(raw)
    return isNaN(parsed.getTime()) ? fallback : parsed
  } catch {
    return fallback
  }
}

function readStoredCalView(fallback: CalView): CalView {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.sessionStorage.getItem(CAL_VIEW_KEY)
    if (raw === "monthly" || raw === "milestones" || raw === "yearly") return raw
    return fallback
  } catch {
    return fallback
  }
}

function writeStoredViewMonth(d: Date) {
  if (typeof window === "undefined") return
  try { window.sessionStorage.setItem(VIEW_MONTH_KEY, format(d, "yyyy-MM-dd")) } catch { /* ignore */ }
}

function writeStoredCalView(v: CalView) {
  if (typeof window === "undefined") return
  try { window.sessionStorage.setItem(CAL_VIEW_KEY, v) } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LearningCalendarPage() {
  const { user } = useSupabaseUser()
  const router   = useRouter()
  const today    = useMemo(() => startOfDay(new Date()), [])

  type PS = "loading" | "empty" | "generating" | "ready" | "error"
  const [ps, setPs]                           = useState<PS>("loading")
  const [errorMsg, setErrorMsg]               = useState<string | null>(null)
  const [genProgress, setGenProgress]         = useState(0)
  const [calMeta, setCalMeta]                 = useState<CalendarMeta | null>(null)
  const [allItems, setAllItems]               = useState<CalItem[]>([])
  const [dashboard, setDashboard]             = useState<DashboardData | null>(null)
  const [readiness, setReadiness]             = useState<ReadinessBreakdown | null>(null)
  // Lazily initialize from sessionStorage (not `today`/"monthly") so a route
  // change and return doesn't snap the calendar back to its defaults.
  const [calView, setCalView]                 = useState<CalView>(() => readStoredCalView("monthly"))
  const [viewMonth, setViewMonth]             = useState<Date>(() => readStoredViewMonth(today))
  const [selectedDate, setSelectedDate]       = useState<Date | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [pauseState, setPauseState]           = useState<PauseState>({
    isPaused: false, pauseReason: null, pauseStartDate: null, pauseEndDate: null, pauseDays: 0,
  })

  // Persist whenever the user navigates the calendar or switches views
  useEffect(() => { writeStoredViewMonth(viewMonth) }, [viewMonth])
  useEffect(() => { writeStoredCalView(calView) }, [calView])

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

  // ──────────────────────────────────────────────────────────────────────────
  // LOAD ITEMS
  // ──────────────────────────────────────────────────────────────────────────
  async function loadItems(cal: any) {
    const { data: rawItems, error: iErr } = await supabase
      .from("learning_calendar_items")
      .select("*")
      .eq("calendar_id", cal.id)
      .order("scheduled_date", { ascending: true })
    if (iErr) throw iErr

    const chIds = [...new Set(
      (rawItems ?? []).map((i: any) => i.chapter_id).filter(Boolean)
    )]

    // chapter_performance continues to feed Analytics / Baseline Readiness
    // ONLY — it is not used for chapter completion (Rule 1: do not modify
    // Analytics logic; Rule 3: completion is determined by Practice I only).
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

    const examDate     = parseISO(cal.exam_date)
    const revZoneStart = subDays(examDate, REVISION_ZONE_DAYS)

    const items: CalItem[] = []

    ;(rawItems ?? []).forEach((raw: any) => {
      // Source of truth for chapter completion: Practice I outcome stored
      // directly on learning_calendar_items (NOT chapter_performance, NOT
      // a manual completion flag, NOT UI/local state).
      const p1Attempted = !!raw.practice_1_attempted
      const p1Score      = raw.practice_1_score !== null && raw.practice_1_score !== undefined
        ? Number(raw.practice_1_score)
        : null
      const p1Passed     = !!raw.practice_1_passed
      const canComplete  = p1Attempted && (p1Score ?? 0) >= 40

      // Chapter status is derived automatically from Practice I — no manual
      // completion flag is consulted.
      const learningStarted = !!raw.target_start_date && !isAfter(parseISO(raw.target_start_date), today)
      const chapterStatus = deriveChapterStatus(
        !!raw.target_start_date,
        learningStarted,
        p1Attempted,
        p1Score,
      )

      // A LEARNING item is automatically COMPLETED once Practice I has been
      // attempted and scored >= 40% (Rule 3). It is automatically flagged
      // for rework when attempted below 40%, but that does not change its
      // ItemStatus (still tracked, just shown with a rework chapter status).
      const learningAutoCompleted = p1Attempted && p1Passed

      const pushEvent = (
        stage: Stage,
        activityType: ActivityType,
        date: string | null,
      ) => {
        if (!date) return
        const isLearningStage = stage === "LEARNING"
        items.push({
          id:           `${raw.id}-${stage}`,
          calendarId:   raw.calendar_id,
          chapterId:    raw.chapter_id,
          chapterName:  raw.chapter_name,
          subjectId:    raw.subject_id,
          subjectName:  raw.subject_name,
          stage,
          activityType,
          scheduledDate: date,
          status: resolveStatus(
            raw.status ?? "SCHEDULED",
            date,
            today,
            isLearningStage ? learningAutoCompleted : false,
          ),
          p1Score,
          p1Attempted,
          p1Passed,
          canComplete,
          chapterDifficulty: raw.chapter_difficulty ?? null,
          neetPriority:      raw.neet_priority ?? null,
          targetStartDate:      raw.target_start_date ?? null,
          targetCompletionDate: raw.target_completion_date ?? null,
          actualCompletionDate: raw.actual_completion_date ?? null,
          practice1Date:   raw.practice_1_date ?? null,
          practice2Date:   raw.practice_2_date ?? null,
          practice3Date:   raw.practice_3_date ?? null,
          revision1Date:   raw.revision_1_date ?? null,
          revision2Date:   raw.revision_2_date ?? null,
          numericalDrillDate: raw.numerical_drill_date ?? null,
          scheduleStatus:  raw.schedule_status ?? "PENDING",
          phase:           raw.phase ?? null,
          chapterStatus,
        })
      }

      pushEvent("LEARNING",        "LEARNING",        raw.target_start_date)
      pushEvent("P1",              "PRACTICE",        raw.practice_1_date)
      pushEvent("P2",              "PRACTICE",        raw.practice_2_date)
      pushEvent("QR1",             "REVISION",        raw.revision_1_date)
      pushEvent("P3",              "PRACTICE",        raw.practice_3_date)
      pushEvent("QR2",             "REVISION",        raw.revision_2_date)

      if (raw.numerical_drill_date) {
        pushEvent("NUMERICAL_DRILL", "NUMERICAL_DRILL", raw.numerical_drill_date)
      }
    })

    setAllItems(items)
    setCalMeta({
      id:                cal.id,
      generatedAt:       cal.generated_at,
      examDate:          cal.exam_date,
      revisionZoneStart: format(revZoneStart, "yyyy-MM-dd"),
      totalChapters:     cal.total_chapters,
      weeklyStudyHours:  cal.weekly_study_hours,
      examCode:          cal.exam_code,
    })
    setViewMonth(today)
    buildDashboard(items, cal, perfMap, examDate, revZoneStart)
    setPs("ready")
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ──────────────────────────────────────────────────────────────────────────
  function buildDashboard(
    items: CalItem[],
    cal: any,
    perfMap: Record<string, { accuracy: number; attempts: number }>,
    examDate: Date,
    revZoneStart: Date,
  ) {
    const learningItems     = items.filter(i => i.activityType === "LEARNING")
    const totalChapters     = learningItems.length
    const completedChapters = learningItems.filter(i => i.status === "COMPLETED").length
    const coveragePct       = totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0

    const subjectProgress: SubjectProgress[] = ["PHYSICS", "CHEMISTRY", "BIOLOGY"].map(s => {
      const sChs  = learningItems.filter(i => i.subjectName === s)
      const sDone = sChs.filter(i => i.status === "COMPLETED").length
      return {
        subject: s, completed: sDone, total: sChs.length,
        pct: sChs.length ? Math.round((sDone / sChs.length) * 100) : 0,
      }
    })

    const weekItems = items.filter(i => {
      const d = parseISO(i.scheduledDate)
      return !isBefore(d, today) && !isAfter(d, addDays(today, 7))
    })

    const weeklyWorkload: WeeklyWorkload = {
      p1:                weekItems.filter(i => i.stage === "P1").length,
      p2:                weekItems.filter(i => i.stage === "P2").length,
      p3:                weekItems.filter(i => i.stage === "P3").length,
      qr1:               weekItems.filter(i => i.stage === "QR1").length,
      qr2:               weekItems.filter(i => i.stage === "QR2").length,
      numericalDrills:   weekItems.filter(i => i.stage === "NUMERICAL_DRILL").length,
      overdueRevisions:  items.filter(i => i.status === "OVERDUE" && i.activityType === "REVISION").length,
      overduePractice:   items.filter(i => i.status === "OVERDUE" && i.activityType === "PRACTICE").length,
    }

    const daysRemaining = Math.max(0, differenceInDays(examDate, today))
    const anchorDate    = parseISO(cal.generated_at)
    const daysPassed    = Math.max(1, differenceInDays(today, anchorDate))
    const actualPace    = (completedChapters / daysPassed) * 7
    const daysLeft      = Math.max(1, differenceInDays(revZoneStart, today))
    const expectedPace  = ((totalChapters - completedChapters) / daysLeft) * 7
    const ratio         = expectedPace > 0 ? actualPace / expectedPace : 1
    const scheduleStatus: DashboardData["scheduleStatus"] =
      ratio >= 1.05 ? "AHEAD" : ratio >= 0.9 ? "ON_TRACK" : "BEHIND"
    const aheadBehindDays = Math.abs(Math.round((ratio - 1) * daysLeft))

    // Today's items
    const todayKey   = format(today, "yyyy-MM-dd")
    const todayItems = items.filter(i => i.scheduledDate === todayKey)

    // Revision queue: upcoming QR1/QR2 items not yet completed
    const revisionQueue = items
      .filter(i =>
        (i.stage === "QR1" || i.stage === "QR2") &&
        i.status !== "COMPLETED"
      )
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, 10)

    // Chapter status counts
    const chapterStatusCounts: Record<ChapterStatus, number> = {
      NOT_STARTED: 0, IN_PROGRESS: 0, PRACTICE_PENDING: 0, COMPLETED: 0, REWORK_REQUIRED: 0,
    }
    learningItems.forEach(i => {
      if (i.chapterStatus) chapterStatusCounts[i.chapterStatus]++
    })

    setDashboard({
      totalChapters, completedChapters, overallCoveragePct: coveragePct,
      daysRemaining, examDate: cal.exam_date, examCode: cal.exam_code,
      revisionZoneStart: format(revZoneStart, "yyyy-MM-dd"),
      subjectProgress, weeklyWorkload,
      scheduleStatus, aheadBehindDays,
      practiceBacklog:  weeklyWorkload.overduePractice,
      revisionBacklog:  weeklyWorkload.overdueRevisions,
      todayItems,
      revisionQueue,
      chapterStatusCounts,
    })

    // Readiness breakdown — derived from Practice I outcomes
    // (practice_1_attempted / practice_1_score on learning_calendar_items),
    // per Rule 5. chapter_performance / perfMap remains untouched and is
    // not used here (Rule 1: Analytics logic is not modified).
    const r: ReadinessBreakdown = { excellent: 0, strong: 0, acceptable: 0, weak: 0, untested: 0 }
    learningItems.forEach(i => {
      if (!i.p1Attempted || i.p1Score === null) {
        r.untested++
        return
      }
      if      (i.p1Score > 85) r.excellent++
      else if (i.p1Score >= 70) r.strong++
      else if (i.p1Score >= 40) r.acceptable++
      else                      r.weak++
    })

    setReadiness(r)
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GENERATE
  // ──────────────────────────────────────────────────────────────────────────
  async function generateCalendar() {
    setPs("generating"); setGenProgress(5)
    try {
      const { data: bl, error: bErr } = await supabase
        .from("user_baselines")
        .select("exam_code, target_exam_date, weekly_study_hours, created_at")
        .eq("user_id", user!.id).eq("is_active", true)
        .order("created_at", { ascending: false }).limit(1).maybeSingle()
      if (bErr || !bl) throw new Error(bErr?.message ?? "No active baseline. Please complete setup first.")
      setGenProgress(15)

      const { data: subRows } = await supabase.from("subjects").select("id, name")
      const subjMap: Record<string, string> = {}
      subRows?.forEach((s: any) => { subjMap[s.id] = s.name })
      setGenProgress(22)

      const neetIds = (subRows ?? [])
        .filter((s: any) => ["PHYSICS", "CHEMISTRY", "BIOLOGY"].includes(s.name))
        .map((s: any) => s.id)

      const { data: chs, error: chErr } = await supabase
        .from("chapters")
        .select("id, chapter_name, subject_id, class_level, chapter_order, neet_priority, chapter_difficulty, chapter_type")
        .in("subject_id", neetIds)
        .order("chapter_order", { ascending: true })
      if (chErr || !chs?.length) throw new Error("No chapters found.")
      setGenProgress(35)

      const richChs: RawChapter[] = chs.map((c: any) => ({
        id:               c.id,
        chapter_name:     c.chapter_name,
        subject_id:       c.subject_id,
        class_level:      c.class_level,
        subjectName:      subjMap[c.subject_id] ?? "UNKNOWN",
        neet_priority:    c.neet_priority,
        chapter_difficulty: c.chapter_difficulty,
        chapter_type:     c.chapter_type,
        chapter_order:    c.chapter_order,
      }))

      // ── Run scheduling engine ────────────────────────────────────────────
      const onboardingDate = today
      const anchor         = addDays(onboardingDate, 7)
      const examDate       = parseISO(bl.target_exam_date)
      const hrs            = bl.weekly_study_hours ?? 20

      // FIX: buildChapterMilestones now receives correct 3 arguments
      const scheduled = buildChapterMilestones(richChs, anchor, examDate)
      console.log("SCHEDULED COUNT =", scheduled.length)
      setGenProgress(55)

      // Deactivate old calendars
      await supabase.from("learning_calendar").update({ is_active: false }).eq("user_id", user!.id)

      // Insert new calendar record
      const revZoneStart = subDays(examDate, REVISION_ZONE_DAYS)
      const { data: newCal, error: calInsErr } = await supabase
        .from("learning_calendar")
        .insert({
          user_id:             user!.id,
          exam_code:           bl.exam_code,
          exam_date:           bl.target_exam_date,
          generated_at:        format(onboardingDate, "yyyy-MM-dd"),
          onboarding_date:     format(onboardingDate, "yyyy-MM-dd"),
          plan_start_date:     format(anchor, "yyyy-MM-dd"),
          revision_zone_start: format(revZoneStart, "yyyy-MM-dd"),
          total_chapters:      richChs.length,
          weekly_study_hours:  hrs,
          is_active:           true,
        })
        .select("id").single()
      if (calInsErr) throw calInsErr
      setGenProgress(65)

      // Batch insert items
      const rows = scheduled.map((item: any) => ({
        calendar_id:   newCal.id,
        user_id:       user!.id,
        chapter_id:    item.chapterId,
        chapter_name:  item.chapterName,
        subject_id:    item.subjectId,
        subject_name:  item.subjectName,
        phase:         item.phase ?? null,
        stage:         "LEARNING",
        activity_type: "LEARNING",
        scheduled_date:      item.targetStartDate,
        status:              "SCHEDULED",
        chapter_difficulty:  item.chapterDifficulty,
        neet_priority:       item.neetPriority,
        target_start_date:      item.targetStartDate ?? null,
        target_completion_date: item.targetCompletionDate ?? null,
        actual_completion_date: null,
        practice_1_date:     item.practice1Date ?? null,
        practice_2_date:     item.practice2Date ?? null,
        practice_3_date:     item.practice3Date ?? null,
        revision_1_date:     item.revision1Date ?? null,
        revision_2_date:     item.revision2Date ?? null,
        numerical_drill_date: item.numericalDrillDate ?? null,
        schedule_status:     item.scheduleStatus ?? "PENDING",
      }))

      const BATCH = 50
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error: bErr2 } = await supabase
          .from("learning_calendar_items")
          .insert(rows.slice(i, i + BATCH))
        if (bErr2) throw bErr2
        setGenProgress(65 + Math.round(((i + BATCH) / rows.length) * 30))
      }
      setGenProgress(100)

      await loadItems({
        id:              newCal.id,
        exam_date:       bl.target_exam_date,
        exam_code:       bl.exam_code,
        generated_at:    format(anchor, "yyyy-MM-dd"),
        total_chapters:  richChs.length,
        weekly_study_hours: hrs,
      })
    } catch (e: any) {
      console.error("Generate error:", e)
      setErrorMsg(e?.message ?? "Failed to generate calendar.")
      setPs("error")
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PAUSE / RESUME
  // ──────────────────────────────────────────────────────────────────────────
  async function handlePause(reason: PauseReason, days: number) {
    setShowPauseDialog(false)
    const pauseEnd = format(addDays(today, days), "yyyy-MM-dd")
    const newState: PauseState = {
      isPaused: true,
      pauseReason: reason,
      pauseStartDate: format(today, "yyyy-MM-dd"),
      pauseEndDate:   pauseEnd,
      pauseDays:      days,
    }
    setPauseState(newState)
    // Persist to Supabase if desired
    if (calMeta) {
      await supabase
        .from("learning_calendar")
        .update({
          is_paused:        true,
          pause_reason:     reason,
          pause_start_date: newState.pauseStartDate,
          pause_end_date:   pauseEnd,
        })
        .eq("id", calMeta.id)
    }
  }

  async function handleResume() {
    const newState: PauseState = {
      isPaused: false, pauseReason: null,
      pauseStartDate: null, pauseEndDate: null, pauseDays: 0,
    }
    setPauseState(newState)
    if (calMeta) {
      await supabase
        .from("learning_calendar")
        .update({ is_paused: false, pause_reason: null, pause_start_date: null, pause_end_date: null })
        .eq("id", calMeta.id)
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────────────────────
  const handleLaunchPractice = useCallback(async (item: CalItem) => {
    setActionLoadingId(item.id)
    try {
      const mode =
  item.activityType === "MOCK"
    ? "mock"
    : item.activityType === "NUMERICAL_DRILL"
      ? "numerical_drill"
      : item.activityType === "REVISION"
        ? "revision"
        : "practice"

console.log("ITEM ID", item.id)
console.log("CHAPTER ID", item.chapterId)
console.log("SUBJECT ID", item.subjectId)
console.log("STAGE", item.stage)
console.log("FULL ITEM", item)

console.log("CALENDAR ITEM ID SENT", item.calendarId)
const attempt = await createAttempt({
  
  examId: PRACTICE_EXAM_ID,

  subject: item.subjectId ?? undefined,
  chapter: item.chapterId ?? undefined,

  calendarItemId: item.calendarId,
  chapterName: item.chapterName,
  calendarStage: item.stage,
  attemptOrigin: "LEARNING_CALENDAR",

  mode,
})
      if (!attempt?.attemptId) throw new Error("No attempt returned")
      router.push(`/exams/attempt?attempt_id=${attempt.attemptId}`)
    } catch (e) { console.error(e) }
    finally { setActionLoadingId(null) }
  }, [router])

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
  // RENDER: EMPTY STATE
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
                "Numerical drills for calculation-heavy chapters",
                "Practice I, II, III at spaced intervals (Day 1, 21, 75)",
                "Quick Revision I & II at Day 45 & 90 to prevent memory decay",
                "90-day Exam Simulation Zone with weekly Mock Tests",
                "Board Exam freeze: Feb 10 – Mar 25",
                "Subject-balanced schedule (Bio → Phy → Chem rotation)",
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
              {genProgress < 35  ? "Loading syllabus data" :
               genProgress < 60  ? "Scheduling chapters with spaced learning blocks" :
               genProgress < 90  ? "Writing practice, revision & numerical drill schedule" :
               "Finalising…"}
            </p>
          </div>
          <Progress value={genProgress} className="h-2.5" />
          <p className="text-xs text-slate-400">{genProgress}%</p>
        </div>
      </main>
    </MentorLayout>
  )

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
  // RENDER: READY
  // ──────────────────────────────────────────────────────────────────────────
  const aheadBehindStyle = dashboard
    ? getAheadBehindStyle(dashboard.scheduleStatus, dashboard.aheadBehindDays)
    : null

  return (
    <MentorLayout>
      <PauseDialog
        open={showPauseDialog}
        onClose={() => setShowPauseDialog(false)}
        onConfirm={handlePause}
      />

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
            <div className="flex items-center gap-2">
              {pauseState.isPaused ? (
                <Button
                  size="sm" variant="outline"
                  className="rounded-xl h-8 text-xs font-semibold gap-2 border-amber-300 text-amber-700"
                  onClick={handleResume}
                >
                  <PlayCircle className="w-3 h-3" /> Resume Calendar
                </Button>
              ) : (
                <Button
                  size="sm" variant="outline"
                  className="rounded-xl h-8 text-xs font-semibold gap-2 border-slate-200 text-slate-600"
                  onClick={() => setShowPauseDialog(true)}
                >
                  <Pause className="w-3 h-3" /> Pause
                </Button>
              )}
              <Button
                size="sm" variant="outline"
                className="rounded-xl h-8 text-xs font-semibold gap-2 border-slate-200 text-slate-600"
                onClick={generateCalendar}
              >
                <RefreshCw className="w-3 h-3" /> Regenerate
              </Button>
            </div>
          </div>

          {/* ── Dashboard Metrics ─────────────────────────────────────────── */}
          {dashboard && (
            <>
              {/* ── Row: Subject progress + Chapter Status + Readiness + Exam ─ */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {/* Subject progress */}
                <Card className="rounded-2xl border-none shadow-sm bg-white col-span-1">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Chapters Completed
                    </p>
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

                {/* Chapter Status System — performance driven */}
                <Card className="rounded-2xl border-none shadow-sm bg-white col-span-1">
                  <CardContent className="p-4 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Chapter Status
                    </p>
                    <div className="space-y-1.5">
                      {(Object.entries(CHAPTER_STATUS_DOT) as [ChapterStatus, string][]).map(([status, dot]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{dot}</span>
                            <span className="text-xs text-slate-600">{CHAPTER_STATUS_LABEL[status]}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {dashboard.chapterStatusCounts?.[status] ?? 0}
                          </span>
                        </div>
                      ))}
                    </div>
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
                          { label: "Excellent",  val: readiness.excellent,  range: ">85%",   bg: "bg-emerald-50", text: "text-emerald-700" },
                          { label: "Strong",     val: readiness.strong,     range: "70–85%", bg: "bg-blue-50",    text: "text-blue-700"   },
                          { label: "Acceptable", val: readiness.acceptable, range: "40–70%", bg: "bg-amber-50",   text: "text-amber-700"  },
                          { label: "Weak",       val: readiness.weak,       range: "<40%",   bg: "bg-rose-50",    text: "text-rose-700"   },
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

                {/* Days Remaining */}
                <Card className={cn(
                  "rounded-2xl border-none shadow-sm col-span-1",
                  dashboard.daysRemaining <= 30 ? "bg-red-50" :
                  dashboard.daysRemaining <= 90 ? "bg-amber-50" : "bg-white",
                )}>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days Remaining</p>
                        {aheadBehindStyle && (
                          <div className="flex items-center gap-1">
                            {aheadBehindStyle.icon}
                            <span className={cn("text-[10px] font-bold", aheadBehindStyle.color)}>
                              {aheadBehindStyle.label}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className={cn(
                        "text-4xl font-bold mt-1",
                        dashboard.daysRemaining <= 30 ? "text-red-600" :
                        dashboard.daysRemaining <= 90 ? "text-amber-600" : "text-slate-900",
                      )}>
                        {dashboard.daysRemaining}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        until {dashboard.examCode} on {format(parseISO(dashboard.examDate), "d MMM yyyy")}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {dashboard.completedChapters} / {dashboard.totalChapters} chapters
                        · {dashboard.overallCoveragePct}% coverage
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Simulation Zone</p>
                      <p className="text-sm font-bold text-red-600 mt-0.5">
                        {format(parseISO(dashboard.revisionZoneStart), "d MMM yyyy")}
                      </p>
                      <p className="text-[10px] text-slate-400">mock tests & revision only after this date</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Board Freeze</p>
                      <p className="text-sm font-bold text-pink-600 mt-0.5">Feb 10 – Mar 25</p>
                      <p className="text-[10px] text-slate-400">no new learning scheduled</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* ── Calendar Section ──────────────────────────────────────────── */}
          <div className="flex gap-5">
            <div className="flex-1 min-w-0">
              <Card className="rounded-2xl border-none shadow-sm bg-white">
                <CardContent className="p-5 space-y-4">

                  {/* Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {calView !== "milestones" ? (
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                          onClick={() => setViewMonth(v =>
                            calView === "yearly" ? new Date(getYear(v) - 1, 0, 1) : subMonths(v, 1)
                          )}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h2 className="text-sm font-bold text-slate-800 min-w-[120px] text-center">
                          {calView === "yearly"
                            ? getYear(viewMonth)
                            : format(viewMonth, "MMMM yyyy")}
                        </h2>
                        <button
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                          onClick={() => setViewMonth(v =>
                            calView === "yearly" ? new Date(getYear(v) + 1, 0, 1) : addMonths(v, 1)
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
                    ) : (
                      <h2 className="text-sm font-bold text-slate-800">
                        Roadmap Milestones
                      </h2>
                    )}

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(["monthly", "milestones", "yearly"] as CalView[]).map(v => (
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

                  {/* Legend — hidden for milestones (timeline is self-explanatory) */}
                  {calView !== "milestones" && (
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: "Study",          color: "bg-blue-500"    },
                        { label: "Numerical Drill", color: "bg-cyan-400"   },
                        { label: "Practice",        color: "bg-purple-500" },
                        { label: "Revision",        color: "bg-amber-500"  },
                        { label: "Mock",            color: "bg-red-500"    },
                        { label: "Completed",       color: "bg-emerald-500"},
                        { label: "Overdue",         color: "bg-orange-500" },
                        { label: "Buffer",          color: "bg-slate-300"  },
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
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-3 rounded-sm bg-pink-100 border border-pink-200" />
                        <span className="text-[10px] text-slate-500">Board Break</span>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-200">
                        <div className="w-2 h-3 bg-blue-500 rounded-sm" />
                        <span className="text-[10px] text-slate-500">Phase I (XI)</span>
                        <div className="w-2 h-3 bg-violet-500 rounded-sm" />
                        <span className="text-[10px] text-slate-500">Phase II (XII)</span>
                      </div>
                    </div>
                  )}

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
                  {calView === "milestones" && (
                    <MilestonesView
                      allItems={allItems}
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

            {/* Day panel */}
            {selectedDate && (
              <div className="w-[360px] shrink-0">
                <Card className="rounded-2xl border-none shadow-sm bg-white sticky top-4 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
                  <DayPanel
                    date={selectedDate}
                    items={selectedDayItems}
                    onClose={() => setSelectedDate(null)}
                    onLaunchPractice={handleLaunchPractice}
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
