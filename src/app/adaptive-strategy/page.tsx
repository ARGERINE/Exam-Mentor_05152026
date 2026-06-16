"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { MentorLayout } from '@/components/layout/mentor-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Brain, Zap, Activity, Target, RotateCcw, ShieldCheck, Clock,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Info,
  Sparkles, Lock, ChevronRight, ChevronDown, ChevronUp,
  AlertTriangle, Flame, ArrowUpRight, ArrowDownRight,
  Gauge, FlaskConical, Atom, Leaf, BarChart2, RefreshCw,
  Calendar, Layers, BookOpen, Eye, Heart, Wind, Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabase } from '@/lib/supabase/client'
import { useSupabaseUser } from '@/lib/supabase/hooks'
import { format, addDays, differenceInDays, parseISO } from 'date-fns'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type StrategyMode =
  | 'Acceleration'
  | 'Balanced Recovery'
  | 'Balanced'
  | 'Recovery'
  | 'Revision Focus'
  | 'Exam Sprint'

type StrategyHealth = 'Good' | 'Needs Attention' | 'Critical'
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
type PsychState = 'Balanced' | 'Momentum' | 'Burnout Risk' | 'Overload' | 'Disengaged'
type TaxonomyType =
  | 'FACTUAL' | 'CONCEPTUAL' | 'APPLICATION' | 'ANALYTICAL'
  | 'NUMERICAL' | 'ASSERTION_REASON' | 'MATCH_THE_FOLLOWING' | 'STATEMENT_BASED'

interface HeroData {
  strategyMode: StrategyMode
  recalibrationVersion: number
  lastUpdated: string
  health: StrategyHealth
  daysToExam: number
  examPhase: ExamPhase
}

type ExamPhase =
  | 'Foundation'      // >120d
  | 'Development'     // 90-120d
  | 'Intensification' // 60-90d
  | 'Consolidation'   // 45-60d
  | 'Sprint'          // 21-45d
  | 'Final'           // <21d

interface StrategyAllocation {
  Physics: number
  Chemistry: number
  Biology: number
  Revision: number
  Mocks: number
}

interface EvolutionChange {
  id: string
  label: string
  subject?: string
  oldValue: number
  newValue: number
  unit: string
  direction: 'increased' | 'decreased' | 'stable'
  reason: string
  impact: 'high' | 'medium' | 'low'
}

interface PerformanceSignal {
  key: string
  label: string
  value: number | string
  numericValue: number
  icon: React.ElementType
  color: string
  bg: string
  border: string
  description: string
  threshold: { good: number; warn: number }
}

interface EvolutionTimelineItem {
  version: number
  triggerType: string
  executedAt: string
  weekLabel: string
  changes: string[]
  strategyBefore?: string
  strategyAfter?: string
}

interface DriftChapter {
  id: string
  chapterName: string
  subject: string
  plannedWeek: number
  currentWeek: number
  weeksDelay: number
  riskLevel: RiskLevel
  status: string
  priorityScore: number
}

interface AcceleratedChapter {
  id: string
  chapterName: string
  subject: string
  originalWeek: number
  acceleratedToWeek: number
  weeksSaved: number
  accuracyTrigger: number
}

interface RoadmapIntelligence {
  delayedChapters: DriftChapter[]
  acceleratedChapters: AcceleratedChapter[]
  riskChapters: DriftChapter[]
  onTrackCount: number
  overallDriftRisk: RiskLevel
}

interface AccelerationResult {
  chaptersEligible: Array<{
    id: string; chapterName: string; subject: string
    currentAccuracy: number; weeksPulledForward: number
  }>
  weeksSaved: number
  coverageGainPct: number
  accelerationTriggered: boolean
}

interface RevisionRetentionData {
  completedRevisions: number
  retainedRevisions: number
  retentionRate: number
  overdueCount: number
  atRiskChapters: Array<{
    chapterName: string; subject: string
    retentionPct: number; daysSinceLast: number
  }>
  retentionHealth: 'Strong' | 'Moderate' | 'Weak' | 'Critical'
}

interface QuestionTypeData {
  type: TaxonomyType
  displayName: string
  accuracy: number
  attempts: number
  avgTimeSeconds: number
  strengthLevel: 'Strong' | 'Moderate' | 'Weak' | 'Critical'
  mentorFlag: string | null
}

interface PsychologicalData {
  state: PsychState
  anxietyLevel: string
  consistencyScore: number
  burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  momentumScore: number
  overloadRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendation: string
  strategyAdjustment: string
}

interface MentorRecommendation {
  headline: string
  priority: Array<{ rank: number; text: string; icon: React.ElementType; urgency: 'high' | 'medium' | 'low' }>
  closedLoopSummary: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, { text: string; bg: string; soft: string; dot: string; chartColor: string }> = {
  Physics:   { text: 'text-blue-700',   bg: 'bg-blue-600',   soft: 'bg-blue-50',   dot: 'bg-blue-400',   chartColor: '#3B82F6' },
  Chemistry: { text: 'text-violet-700', bg: 'bg-violet-600', soft: 'bg-violet-50', dot: 'bg-violet-400', chartColor: '#A855F7' },
  Biology:   { text: 'text-emerald-700',bg: 'bg-emerald-600',soft: 'bg-emerald-50',dot: 'bg-emerald-400',chartColor: '#10B981' },
  Revision:  { text: 'text-amber-700',  bg: 'bg-amber-500',  soft: 'bg-amber-50',  dot: 'bg-amber-400',  chartColor: '#F59E0B' },
  Mocks:     { text: 'text-rose-700',   bg: 'bg-rose-600',   soft: 'bg-rose-50',   dot: 'bg-rose-400',   chartColor: '#EF4444' },
}

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Physics: Atom, Chemistry: FlaskConical, Biology: Leaf,
}

const STRATEGY_CONFIG: Record<StrategyMode, {
  color: string; bg: string; border: string
  description: string; emphasis: string
}> = {
  'Acceleration':     { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'Strong performance — pulling chapters ahead', emphasis: 'Maximize coverage velocity' },
  'Balanced Recovery':{ color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   description: 'Mixed signals — recovery alongside new content', emphasis: 'Balance recovery with progress' },
  'Balanced':         { color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',    description: 'Steady across all subjects', emphasis: 'Maintain consistent execution' },
  'Recovery':         { color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    description: 'Weak accuracy signals — recovery mode activated', emphasis: 'Focus on accuracy first' },
  'Revision Focus':   { color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-200',  description: 'Revision queue overdue — consolidation priority', emphasis: 'Clear revision backlog' },
  'Exam Sprint':      { color: 'text-slate-700',   bg: 'bg-slate-100',  border: 'border-slate-300',   description: 'Exam imminent — consolidation and mock focus', emphasis: 'Full-length mocks and revision only' },
}

const EXAM_PHASE_CONFIG: Record<ExamPhase, {
  label: string; description: string; color: string; bg: string
  emphasis: string[]
}> = {
  Foundation:      { label: 'Foundation', description: '>120 days to exam', color: 'text-blue-600',    bg: 'bg-blue-50',    emphasis: ['Build chapter coverage', 'Establish accuracy baselines', 'Form study habits'] },
  Development:     { label: 'Development',description: '90–120 days',       color: 'text-sky-600',     bg: 'bg-sky-50',     emphasis: ['Accelerate weak subjects', 'Increase revision frequency', 'Start sectional mocks'] },
  Intensification: { label: 'Intensification', description: '60–90 days',   color: 'text-violet-600', bg: 'bg-violet-50',  emphasis: ['High-priority chapters only', 'Weekly mock tests', 'Tighten revision cycles'] },
  Consolidation:   { label: 'Consolidation', description: '45–60 days',     color: 'text-amber-600',  bg: 'bg-amber-50',   emphasis: ['Complete syllabus sweep', 'Mock test cadence every 3 days', 'Target weak chapters'] },
  Sprint:          { label: 'Sprint',      description: '21–45 days',        color: 'text-orange-600', bg: 'bg-orange-50',  emphasis: ['Full-length mocks daily', 'Formula revision only', 'No new chapters'] },
  Final:           { label: 'Final',       description: '<21 days',          color: 'text-rose-600',   bg: 'bg-rose-50',    emphasis: ['Confidence building only', 'High-yield chapters', 'Sleep and stamina management'] },
}

const QUESTION_TYPE_LABELS: Record<TaxonomyType, string> = {
  FACTUAL: 'Factual Recall',
  CONCEPTUAL: 'Conceptual',
  APPLICATION: 'Application',
  ANALYTICAL: 'Analytical',
  NUMERICAL: 'Numerical',
  ASSERTION_REASON: 'Assertion–Reason',
  MATCH_THE_FOLLOWING: 'Match the Following',
  STATEMENT_BASED: 'Statement Based',
}

// ─────────────────────────────────────────────────────────────────────────────
// INTELLIGENCE FUNCTIONS (Deterministic — No AI)
// ─────────────────────────────────────────────────────────────────────────────

function deriveExamPhase(daysToExam: number): ExamPhase {
  if (daysToExam > 120) return 'Foundation'
  if (daysToExam > 90) return 'Development'
  if (daysToExam > 60) return 'Intensification'
  if (daysToExam > 45) return 'Consolidation'
  if (daysToExam > 21) return 'Sprint'
  return 'Final'
}

function deriveStrategyMode(
  subjectAccuracies: Record<string, number>,
  revisionCompletion: number,
  mockAccuracy: number,
  daysToExam: number,
  anxietyLevel: string,
): StrategyMode {
  if (daysToExam <= 21) return 'Exam Sprint'
  const values = Object.values(subjectAccuracies)
  const avgAcc = values.length > 0
    ? values.reduce((s, v) => s + v, 0) / values.length : 0
  if (anxietyLevel === 'HIGH' && avgAcc < 45) return 'Recovery'
  if (avgAcc < 40) return 'Recovery'
  if (revisionCompletion < 40) return 'Revision Focus'
  if (avgAcc >= 70 && mockAccuracy >= 65 && revisionCompletion >= 70) return 'Acceleration'
  if (avgAcc < 55 || mockAccuracy < 48) return 'Balanced Recovery'
  return 'Balanced'
}

function deriveHealth(
  mode: StrategyMode,
  revCompletion: number,
  avgAccuracy: number,
): StrategyHealth {
  if (mode === 'Recovery') return 'Critical'
  if (mode === 'Exam Sprint' && (revCompletion < 40 || avgAccuracy < 45)) return 'Critical'
  if (mode === 'Balanced Recovery' || revCompletion < 55 || avgAccuracy < 50) return 'Needs Attention'
  return 'Good'
}

function deriveAllocation(
  subjectAccuracies: Record<string, number>,
  revisionCompletion: number,
  mode: StrategyMode,
): StrategyAllocation {
  const subjects = ['Physics', 'Chemistry', 'Biology']
  const inverse = subjects.map(s => Math.max(8, 100 - (subjectAccuracies[s] ?? 50)))
  const totalInverse = inverse.reduce((a, b) => a + b, 0)

  const revisionPct = mode === 'Revision Focus' ? 35 : mode === 'Exam Sprint' ? 30 : mode === 'Recovery' ? 25 : 20
  const mockPct = mode === 'Exam Sprint' ? 20 : mode === 'Acceleration' ? 12 : 5
  const subjectPool = 100 - revisionPct - mockPct

  const rawAllocations = inverse.map(inv => (inv / totalInverse) * subjectPool)
  const rounded = rawAllocations.map(v => Math.round(v))
  const diff = subjectPool - rounded.reduce((a, b) => a + b, 0)
  rounded[0] += diff

  return {
    Physics: rounded[0],
    Chemistry: rounded[1],
    Biology: rounded[2],
    Revision: revisionPct,
    Mocks: mockPct,
  }
}

function detectRoadmapDrift(
  roadmapRows: Array<{
    id: string; chapter_id: string; planned_week: number
    actual_completion_date: string | null; status: string; priority_score: number | null
  }>,
  chapterMap: Record<string, { name: string; subjectId: string }>,
  subjectMap: Record<string, string>,
  currentWeek: number,
  subjectAccMap: Record<string, number>,
  planStartDate: string | null,
): RoadmapIntelligence {
  const delayed: DriftChapter[] = []
  const accelerated: AcceleratedChapter[] = []
  const risk: DriftChapter[] = []
  let onTrack = 0

  for (const row of roadmapRows) {
    const ch = chapterMap[row.chapter_id]
    if (!ch) continue
    const subject = subjectMap[ch.subjectId] ?? 'Unknown'

    if (
  row.status === 'MASTERED' &&
  row.actual_completion_date &&
  planStartDate
) {
  const completedWeek =
    Math.max(
      1,
      Math.floor(
        (
          new Date(row.actual_completion_date).getTime() -
          new Date(planStartDate).getTime()
        ) /
        (1000 * 60 * 60 * 24 * 7)
      ) + 1
    )

  if (completedWeek < row.planned_week) {
    accelerated.push({
      id: row.id,
      chapterName: ch.name,
      subject,
      originalWeek: row.planned_week,
      acceleratedToWeek: completedWeek,
      weeksSaved: row.planned_week - completedWeek,
      accuracyTrigger: subjectAccMap[subject] ?? 0,
    })
  }

  continue
}
if (row.status === 'PLANNED' || row.status === 'IN_PROGRESS') {
  const delay = currentWeek - row.planned_week

  if (delay > 0) {
    const priority =
  Number(row.priority_score ?? 50)

const riskScore =
  (delay * 10) +
  (priority / 10)

const riskLevel: RiskLevel =
  riskScore >= 60
    ? 'CRITICAL'
    : riskScore >= 40
    ? 'HIGH'
    : riskScore >= 20
    ? 'MEDIUM'
    : 'LOW'

    const entry: DriftChapter = {
      id: row.id,
      chapterName: ch.name,
      subject,
      plannedWeek: row.planned_week,
      currentWeek,
      weeksDelay: delay,
      riskLevel,
      priorityScore: priority,
      status: row.status,
    }

    delayed.push(entry)

    if (
      riskLevel === 'HIGH' ||
      riskLevel === 'CRITICAL'
    ) {
      risk.push(entry)
    }
  } else {
    onTrack++
  }
}
  }
  const critCount = delayed.filter(d => d.riskLevel === 'CRITICAL').length
  const highCount = delayed.filter(d => d.riskLevel === 'HIGH').length
  const overallDriftRisk: RiskLevel =
    critCount > 0 ? 'CRITICAL' :
    highCount > 1 ? 'HIGH' :
    delayed.length > 2 ? 'MEDIUM' : 'LOW'

  return {
    delayedChapters: delayed.sort(  (a, b) => (b.priorityScore * b.weeksDelay) - (a.priorityScore * a.weeksDelay)
),
    acceleratedChapters: accelerated.slice(0, 6),
    riskChapters: risk.slice(0, 5),
    onTrackCount: onTrack,
    overallDriftRisk,
  }
}

function computeAccelerationEngine(
  roadmapRows: Array<{ id: string; chapter_id: string; planned_week: number; status: string; target_mastery: number }>,
  chapterMap: Record<string, { name: string; subjectId: string }>,
  subjectMap: Record<string, string>,
  chPerfMap: Record<string, { accuracy: number }>,
  currentWeek: number,
): AccelerationResult {
  const ACC_THRESHOLD = 72
  const REVISION_THRESHOLD = 65
  const eligible: AccelerationResult['chaptersEligible'] = []

  const future = roadmapRows.filter(r => r.planned_week > currentWeek + 1 && r.status === 'PLANNED')
  for (const row of future) {
    const ch = chapterMap[row.chapter_id]
    if (!ch) continue
    const subject = subjectMap[ch.subjectId] ?? ''
    const perf = chPerfMap[row.chapter_id]
    const accuracy = perf?.accuracy ?? 0
    if (accuracy >= ACC_THRESHOLD) {
      const weeksPulled = Math.min(3, Math.floor((accuracy - ACC_THRESHOLD) / 10) + 1)
      eligible.push({
        id: row.id,
        chapterName: ch.name,
        subject,
        currentAccuracy: accuracy,
        weeksPulledForward: weeksPulled,
      })
    }
  }

  const weeksSaved = eligible.reduce((s, e) => s + e.weeksPulledForward, 0)
  const totalChapters = roadmapRows.length
  const coverageGain = totalChapters > 0 ? Math.round((eligible.length / totalChapters) * 100) : 0

  return {
    chaptersEligible: eligible.slice(0, 6),
    weeksSaved,
    coverageGainPct: coverageGain,
    accelerationTriggered: eligible.length > 0,
  }
}

function computeRevisionRetention(
  revSchedule: Array<{ question_id: string; next_revision_date: string; revision_interval_weeks: number }>,
  revPool: Array<{ question_id: string; consecutive_correct_count: number; priority_score: number }>,
  chapterMap: Record<string, { name: string; subjectId: string }>,
  questionChapterMap: Record<string, string>,
  subjectMap: Record<string, string>,
): RevisionRetentionData {
  const now = new Date()

  const completed = revPool.filter(r => r.consecutive_correct_count >= 2).length
  const retained = revPool.filter(r => r.consecutive_correct_count >= 3).length
  const retentionRate = completed > 0 ? Math.round((retained / completed) * 100) : 0

  const overdue = revSchedule.filter(r => {
    try { return parseISO(r.next_revision_date) < now } catch { return false }
  }).length

  const atRisk: RevisionRetentionData['atRiskChapters'] = []
  const seen = new Set<string>()
  for (const r of revSchedule) {
    try {
      const due = parseISO(r.next_revision_date)
      const daysSince = differenceInDays(now, due)
      if (daysSince > 0) {
        const chId = questionChapterMap[r.question_id]
        const ch = chId ? chapterMap[chId] : null
        if (ch && !seen.has(ch.name)) {
          seen.add(ch.name)
          const retPct = Math.max(0, 100 - daysSince * 4)
          atRisk.push({
            chapterName: ch.name,
            subject: subjectMap[ch.subjectId] ?? 'Unknown',
            retentionPct: retPct,
            daysSinceLast: daysSince,
          })
        }
      }
    } catch { /* skip */ }
  }

  const health: RevisionRetentionData['retentionHealth'] =
    retentionRate >= 75 ? 'Strong' :
    retentionRate >= 55 ? 'Moderate' :
    retentionRate >= 35 ? 'Weak' : 'Critical'

  return {
    completedRevisions: completed,
    retainedRevisions: retained,
    retentionRate,
    overdueCount: overdue,
    atRiskChapters: atRisk.sort((a, b) => a.retentionPct - b.retentionPct).slice(0, 6),
    retentionHealth: health,
  }
}

function computePsychState(
  anxietyLevel: string,
  consistencyScore: number,
  attemptsLast7: number,
  pendingRevisions: number,
  avgAccuracy: number,
): PsychologicalData {
  // Momentum: high attempts + improving accuracy
  const momentumScore = Math.min(100, Math.round((attemptsLast7 * 8) + (avgAccuracy * 0.4)))
  // Burnout: high pending + low accuracy + high attempts
  const burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' =
    (pendingRevisions > 20 && attemptsLast7 > 15) ? 'HIGH' :
    (pendingRevisions > 10 || attemptsLast7 > 10) ? 'MEDIUM' : 'LOW'
  // Overload: too many pending revisions
  const overloadRisk: 'LOW' | 'MEDIUM' | 'HIGH' =
    pendingRevisions > 25 ? 'HIGH' :
    pendingRevisions > 12 ? 'MEDIUM' : 'LOW'

  let state: PsychState
  if (burnoutRisk === 'HIGH') state = 'Burnout Risk'
  else if (overloadRisk === 'HIGH') state = 'Overload'
  else if (momentumScore >= 70 && avgAccuracy >= 65) state = 'Momentum'
  else if (attemptsLast7 < 3) state = 'Disengaged'
  else state = 'Balanced'

  const recommendation =
    state === 'Burnout Risk' ? 'Reduce daily session count. One rest day this week is productive, not wasteful.'
    : state === 'Overload' ? 'Clear 5 revision items before starting new chapters. Stacking compounds anxiety.'
    : state === 'Momentum' ? 'Momentum is excellent. Maintain session rhythm and increase mock frequency.'
    : state === 'Disengaged' ? 'Low session activity detected. Start with a 20-minute chapter recap to re-engage.'
    : 'Performance signals are stable. Maintain current execution rhythm.'

  const strategyAdjustment =
    state === 'Burnout Risk' ? 'Sessions capped at 2 per day. Revision deferred by 3 days.'
    : state === 'Overload' ? 'New chapter allocation reduced by 15%. Revision cleared first.'
    : state === 'Momentum' ? 'Acceleration mode eligible. Chapter pull-forward activated.'
    : state === 'Disengaged' ? 'Short-session plan triggered. Focus on high-yield chapters only.'
    : 'No adjustment required.'

  return {
    state, anxietyLevel, consistencyScore, burnoutRisk,
    momentumScore, overloadRisk, recommendation, strategyAdjustment,
  }
}

function buildEvolutionChanges(
  subjectAccMap: Record<string, number>,
  prevAccMap: Record<string, number>,
  revisionCompletion: number,
  mockAccuracy: number,
  pendingRevisions: number,
): EvolutionChange[] {
  const changes: EvolutionChange[] = []
  const TARGET = 70

  for (const subject of ['Biology', 'Chemistry', 'Physics']) {
    const current = subjectAccMap[subject] ?? 0
    const prev = prevAccMap[subject] ?? current
    const diff = current - prev
    if (current < TARGET - 10) {
      changes.push({
        id: `${subject}-alloc`,
        label: `${subject} Coverage Increased`,
        subject,
        oldValue: Math.round(prev),
        newValue: Math.round(current),
        unit: '%',
        direction: diff >= 0 ? 'increased' : 'decreased',
        reason: `Accuracy at ${Math.round(current)}%, below ${TARGET}% target. Coverage weight increased to close gap.`,
        impact: current < 45 ? 'high' : 'medium',
      })
    } else if (current >= TARGET + 5) {
      changes.push({
        id: `${subject}-reduce`,
        label: `${subject} Allocation Reduced`,
        subject,
        oldValue: Math.round(prev),
        newValue: Math.round(current),
        unit: '%',
        direction: 'decreased',
        reason: `${subject} consistently at ${Math.round(current)}%. Effort redistributed to weaker areas.`,
        impact: 'low',
      })
    }
  }

  if (pendingRevisions > 5) {
    changes.push({
      id: 'revision-increase',
      label: 'Revision Frequency Increased',
      oldValue: Math.max(0, revisionCompletion - 15),
      newValue: revisionCompletion,
      unit: '% completion',
      direction: 'increased',
      reason: `${pendingRevisions} pending revision items. Retention risk detected — revision blocks added to daily plan.`,
      impact: 'high',
    })
  }

  if (mockAccuracy < 48) {
    changes.push({
      id: 'mock-increase',
      label: 'Mock Test Cadence Increased',
      oldValue: mockAccuracy,
      newValue: mockAccuracy,
      unit: '% accuracy',
      direction: 'increased',
      reason: `Mock accuracy at ${mockAccuracy}%. Increasing test exposure to build exam stamina and time awareness.`,
      impact: 'medium',
    })
  } else if (mockAccuracy >= 68) {
    changes.push({
      id: 'mock-acceleration',
      label: 'Acceleration Flag Triggered',
      oldValue: mockAccuracy - 5,
      newValue: mockAccuracy,
      unit: '% mock accuracy',
      direction: 'increased',
      reason: `Mock accuracy crossed 68%. Chapter pull-forward conditions met — plan advancing eligible chapters.`,
      impact: 'medium',
    })
  }

  return changes.slice(0, 5)
}

function buildMentorRecommendations(
  mode: StrategyMode,
  subjectAcc: Record<string, number>,
  revCompletion: number,
  mockAcc: number,
  psych: PsychologicalData,
  driftRisk: RiskLevel,
  retentionHealth: string,
  daysToExam: number,
): MentorRecommendation {
  const weakSubject = Object.entries(subjectAcc)
    .filter(([, v]) => v < 60)
    .sort((a, b) => a[1] - b[1])[0]?.[0]

  const priority: MentorRecommendation['priority'] = []

  // Priority 1: critical subject
  if (weakSubject) {
    priority.push({
      rank: 1,
      text: `${weakSubject} recovery remains the highest priority. Accuracy is below 60% — every session must target ${weakSubject} chapters.`,
      icon: AlertTriangle, urgency: 'high',
    })
  }

  // Priority 2: revision
  if (revCompletion < 60) {
    priority.push({
      rank: priority.length + 1,
      text: `Revision completion is below target at ${revCompletion}%. Memory decay accumulates silently — clear revision blocks before starting new chapters.`,
      icon: RotateCcw, urgency: 'high',
    })
  }

  // Priority 3: mock
  if (mockAcc < 50) {
    priority.push({
      rank: priority.length + 1,
      text: `Mock participation should increase. Current accuracy of ${mockAcc}% reflects insufficient test exposure — attempt at least one full mock this week.`,
      icon: ShieldCheck, urgency: 'medium',
    })
  } else if (mockAcc >= 68) {
    priority.push({
      rank: priority.length + 1,
      text: `Mock performance is strong at ${mockAcc}%. Continue mock cadence and focus post-mock analysis on NUMERICAL and ASSERTION_REASON question types.`,
      icon: CheckCircle2, urgency: 'low',
    })
  }

  // Drift
  if (driftRisk === 'HIGH' || driftRisk === 'CRITICAL') {
    priority.push({
      rank: priority.length + 1,
      text: `Roadmap drift detected. Several chapters are behind planned schedule. Prioritise delayed HIGH-risk chapters in this week's sessions.`,
      icon: AlertCircle, urgency: 'high',
    })
  }

  // Retention
  if (retentionHealth === 'Weak' || retentionHealth === 'Critical') {
    priority.push({
      rank: priority.length + 1,
      text: `Revision retention is ${retentionHealth.toLowerCase()}. Completed revisions are not translating to long-term recall — shorten revision intervals.`,
      icon: Brain, urgency: 'medium',
    })
  }

  // Psych
  if (psych.state === 'Burnout Risk' || psych.state === 'Overload') {
    priority.push({
      rank: priority.length + 1,
      text: `${psych.recommendation} The plan has been adjusted accordingly.`,
      icon: Heart, urgency: 'medium',
    })
  }

  if (daysToExam <= 45) {
    priority.push({
      rank: priority.length + 1,
      text: `${daysToExam} days to exam. Switch to high-yield chapter consolidation — no new chapters unless critical gaps exist.`,
      icon: Flame, urgency: 'high',
    })
  }

  const modeDesc = STRATEGY_CONFIG[mode].description
  const headline = `Strategy Mode: ${mode}. ${modeDesc}.`

  const loopSummary = [
    `Performance data triggered v${1} recalibration.`,
    weakSubject ? `${weakSubject} under-performance → roadmap priority increased.` : 'All subjects above recovery threshold.',
    revCompletion < 60 ? `Low revision completion → weekly revision allocation raised.` : 'Revision schedule on track.',
    mockAcc < 50 ? `Mock readiness gap → mock frequency increased in daily plan.` : 'Mock readiness adequate.',
    `Psychological state: ${psych.state} → ${psych.strategyAdjustment}`,
  ].join(' ')

  return {
    headline,
    priority: priority.slice(0, 5),
    closedLoopSummary: loopSummary,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────

function DonutChart({ allocation }: { allocation: StrategyAllocation }) {
  const items: Array<{ label: keyof typeof SUBJECT_COLORS; value: number }> = [
    { label: 'Physics', value: allocation.Physics },
    { label: 'Chemistry', value: allocation.Chemistry },
    { label: 'Biology', value: allocation.Biology },
    { label: 'Revision', value: allocation.Revision },
    { label: 'Mocks', value: allocation.Mocks },
  ]

  const total = items.reduce((s, i) => s + i.value, 0)
  const cx = 80, cy = 80, r = 58, strokeW = 20
  let cumulative = 0

  const arcs = items.map(item => {
    const frac = item.value / total
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
    cumulative += frac
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
    const largeArc = frac > 0.5 ? 1 : 0
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle - 0.001)
    const y2 = cy + r * Math.sin(endAngle - 0.001)
    return { ...item, path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`, frac, color: SUBJECT_COLORS[item.label].chartColor }
  })

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <svg width="160" height="160" className="shrink-0">
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill="none"
            stroke={arc.color} strokeWidth={strokeW} strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="10" fill="#94A3B8" fontWeight="700" letterSpacing="1">EFFORT</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="14" fill="#1E293B" fontWeight="800">SPLIT</text>
      </svg>
      <div className="space-y-2.5">
        {arcs.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 min-w-[140px]">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-xs text-slate-600 font-medium flex-1">{item.label}</span>
            <span className="text-sm font-bold text-slate-900 ml-2">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SectionHead({ icon: Icon, label, sub, badge }: {
  icon: React.ElementType; label: string; sub?: string; badge?: string
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">{label}</h2>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {badge && (
        <Badge className="text-[10px] font-bold border-none bg-slate-100 text-slate-500 px-2.5">
          {badge}
        </Badge>
      )}
    </div>
  )
}

function SignalBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const config = {
    CRITICAL: 'bg-red-100 text-red-700',
    HIGH: 'bg-orange-100 text-orange-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    LOW: 'bg-slate-100 text-slate-500',
  }
  return (
    <Badge className={cn('text-[10px] border-none font-bold', config[risk])}>
      {risk}
    </Badge>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function MentorPage() {
  const { user } = useSupabaseUser()
  const supabase = getSupabase()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sections
  const [hero, setHero] = useState<HeroData | null>(null)
  const [allocation, setAllocation] = useState<StrategyAllocation>({ Physics: 24, Chemistry: 28, Biology: 28, Revision: 15, Mocks: 5 })
  const [signals, setSignals] = useState<PerformanceSignal[]>([])
  const [evolutionChanges, setEvolutionChanges] = useState<EvolutionChange[]>([])
  const [evolutionTimeline, setEvolutionTimeline] = useState<EvolutionTimelineItem[]>([])
  const [roadmapIntel, setRoadmapIntel] = useState<RoadmapIntelligence | null>(null)
  const [acceleration, setAcceleration] = useState<AccelerationResult | null>(null)
  const [revisionRetention, setRevisionRetention] = useState<RevisionRetentionData | null>(null)
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeData[]>([])
  const [psychData, setPsychData] = useState<PsychologicalData | null>(null)
  const [mentorRec, setMentorRec] = useState<MentorRecommendation | null>(null)

  // UI state
  const [showAllDelayed, setShowAllDelayed] = useState(false)
  const [showAllAcceleration, setShowAllAcceleration] = useState(false)
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null)
  const [showLoopDetails, setShowLoopDetails] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchAll()
  }, [user])

  async function fetchAll() {
    setIsLoading(true)
    setError(null)
    try {
      // ── 1. Reference maps ──────────────────────────────────────────────
      const [
        { data: subjectsData },
        { data: chaptersData },
      ] = await Promise.all([
        supabase.from('subjects').select('id, name'),
        supabase.from('chapters').select('id, chapter_name, subject_id, neet_priority'),
      ])

      const subjectMap: Record<string, string> = {}
      subjectsData?.forEach(s => { subjectMap[s.id] = s.name })

      const chapterMap: Record<string, { name: string; subjectId: string }> = {}
      chaptersData?.forEach(c => { chapterMap[c.id] = { name: c.chapter_name, subjectId: c.subject_id } })

      // ── 2. Core performance data ────────────────────────────────────────
      const [
        { data: subjectPerf },
        { data: confidenceTrend }, 
        { data: perfSummary },
        { data: planMaster },
        { data: recalibLog },
        { data: psychState },
        { data: baseline },
                
      ] = await Promise.all([
        supabase.from('subject_performance').select('subject_id, accuracy_30d, attempts_30d').eq('user_id', user!.id),
        supabase.from('subject_confidence_trend').select('subject_id, avg_accuracy_last_5').eq('user_id', user!.id),
        supabase.from('performance_summary').select('*').eq('user_id', user!.id).maybeSingle(),
        supabase.from('user_plan_master').select('plan_output, reasoning_output, created_at, updated_at').eq('user_id', user!.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('plan_recalibration_log').select('recalibration_number, trigger_type, executed_at, exam_code').eq('user_id', user!.id).order('executed_at', { ascending: false }).limit(12),
        supabase.from('user_psychological_state').select('anxiety_level, assessed_at, reassess_required').eq('user_id', user!.id).maybeSingle(),
        supabase.from('user_baselines').select('target_exam_date, weekly_study_hours, preparation_stage').eq('user_id', user!.id).eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])

      const subjectAccMap: Record<string, number> = {}
      const trendAccMap: Record<string, number> = {}

confidenceTrend?.forEach(row => {
  const name = subjectMap[row.subject_id]

  if (name) {
    trendAccMap[name] = Math.round(
      Number(row.avg_accuracy_last_5) ?? 0
    )
  }
})
      subjectPerf?.forEach(sp => {
        const name = subjectMap[sp.subject_id]
        if (name) subjectAccMap[name] = Math.round(Number(sp.accuracy_30d) ?? 0)
      })
  
      // ── 3. Roadmap data ─────────────────────────────────────────────────
      const [
        { data: roadmapAll },
        { data: chapterPriority },
        { data: recentAttempts },
        { data: qTypePerf },
      ] = await Promise.all([
        supabase.from('study_plan_roadmap').select('id, chapter_id, subject_id, planned_week, target_questions, target_revision_cycles, target_mastery, status, priority_score, actual_completion_date, created_at').eq('user_id', user!.id).order('planned_week', { ascending: true }),
        supabase.from('chapter_priority_state').select('chapter_id, rolling_accuracy, priority_score, stop_new_content_flag').eq('user_id', user!.id),
        supabase.from('attempts').select('attempt_type, accuracy, created_at, attempt_status').eq('user_id', user!.id).eq('attempt_status', 'EVALUATED').order('created_at', { ascending: false }).limit(20),
        supabase.from('question_type_performance').select('question_type, accuracy_30d, attempts_30d, avg_time_seconds').eq('user_id', user!.id),
      ])

      const mockAttempts = recentAttempts?.filter(a => a.attempt_type === 'MOCK') ?? []
      const avgMockAccuracy = mockAttempts.length > 0
        ? Math.round(mockAttempts.reduce((s, a) => s + (Number(a.accuracy) ?? 0), 0) / mockAttempts.length) : 0

      const chPerfMap: Record<string, { accuracy: number }> = {}
      chapterPriority?.forEach(cp => {
        chPerfMap[cp.chapter_id] = { accuracy: Math.round(Number(cp.rolling_accuracy) ?? 0) }
      })

      // ── 4. Revision data ────────────────────────────────────────────────
      const [
        { data: revSchedule },
        { data: revPool },
        { data: revQueue },
        { data: revBlocks },
      ] = await Promise.all([
        supabase.from('spaced_revision_schedule').select('question_id, next_revision_date, revision_interval_weeks').eq('user_id', user!.id).eq('is_active', true).order('next_revision_date', { ascending: true }).limit(50),
        supabase.from('revision_pool').select('question_id, consecutive_correct_count, priority_score, active_flag').eq('user_id', user!.id).eq('active_flag', true).limit(100),
        supabase.from('revision_queue').select('id, is_resolved, priority').eq('is_resolved', false).limit(100),
        supabase.from('revision_blocks').select('id, is_completed').eq('user_id', user!.id).limit(500),
      ])

      const pendingRevisions = revQueue?.length ?? 0
      const totalRevisionBlocks =
  revBlocks?.length ?? 0

const completedRevisionBlocks =
  revBlocks?.filter(
    r => r.is_completed
  ).length ?? 0

const revisionCompletion =
  totalRevisionBlocks > 0
    ? Math.round(
        (
          completedRevisionBlocks /
          totalRevisionBlocks
        ) * 100
      )
    : 100

      // Question → chapter map (for retention)
      const revQIds = revSchedule?.map(r => r.question_id).filter(Boolean) ?? []
      let questionChapterMap: Record<string, string> = {}
      if (revQIds.length > 0) {
        const { data: qData } = await supabase.from('questions').select('id, chapter_id').in('id', revQIds)
        qData?.forEach(q => { if (q.chapter_id) questionChapterMap[q.id] = q.chapter_id })
      }

      // ── 5. Compute exam context ─────────────────────────────────────────
      const examDate = baseline?.target_exam_date ? new Date(baseline.target_exam_date) : addDays(new Date(), 120)
      const daysToExam = Math.max(0, differenceInDays(examDate, new Date()))
      const examPhase = deriveExamPhase(daysToExam)
      const anxietyLevel = psychState?.anxiety_level ?? 'LOW'

      const avgAccuracy = Object.values(subjectAccMap).length > 0
        ? Math.round(Object.values(subjectAccMap).reduce((s, v) => s + v, 0) / Object.values(subjectAccMap).length) : 0

      // ── 6. Section A: Strategy Mode ─────────────────────────────────────
      const mode = deriveStrategyMode(subjectAccMap, revisionCompletion, avgMockAccuracy, daysToExam, anxietyLevel)
      const health = deriveHealth(mode, revisionCompletion, avgAccuracy)
      const recalibVersion = recalibLog?.[0]?.recalibration_number ?? 1
      const lastUpdated = recalibLog?.[0]?.executed_at
        ? format(new Date(recalibLog[0].executed_at), 'd MMM yyyy')
        : format(new Date(), 'd MMM yyyy')

      setHero({ strategyMode: mode, recalibrationVersion: recalibVersion, lastUpdated, health, daysToExam, examPhase })

      // ── 7. Section B: Allocation ────────────────────────────────────────
      setAllocation(deriveAllocation(subjectAccMap, revisionCompletion, mode))

      // ── 8. Section C: Signals ───────────────────────────────────────────
      const consistencyScore = Math.round(Number(perfSummary?.consistency_score ?? 0))
      const attemptsLast7 = recentAttempts?.filter(a => {
        try { return differenceInDays(new Date(), new Date(a.created_at)) <= 7 } catch { return false }
      }).length ?? 0

      const avgChapterAcc = chapterPriority?.length
        ? Math.round(chapterPriority.reduce((s, c) => s + Number(c.rolling_accuracy ?? 0), 0) / chapterPriority.length)
        : avgAccuracy

      setSignals([
        {
          key: 'subject_health',
          label: 'Subject Health',
          value: avgAccuracy,
          numericValue: avgAccuracy,
          icon: Activity,
          color: avgAccuracy >= 70 ? 'text-emerald-600' : avgAccuracy >= 50 ? 'text-amber-600' : 'text-rose-600',
          bg:   avgAccuracy >= 70 ? 'bg-emerald-50'   : avgAccuracy >= 50 ? 'bg-amber-50'   : 'bg-rose-50',
          border: avgAccuracy >= 70 ? 'border-emerald-100' : avgAccuracy >= 50 ? 'border-amber-100' : 'border-rose-100',
          description: 'Average accuracy across Physics, Chemistry and Biology over the last 30 days.',
          threshold: { good: 70, warn: 50 },
        },
        {
          key: 'chapter_health',
          label: 'Chapter Health',
          value: avgChapterAcc,
          numericValue: avgChapterAcc,
          icon: Target,
          color: avgChapterAcc >= 65 ? 'text-emerald-600' : 'text-amber-600',
          bg:   avgChapterAcc >= 65 ? 'bg-emerald-50' : 'bg-amber-50',
          border: avgChapterAcc >= 65 ? 'border-emerald-100' : 'border-amber-100',
          description: 'Rolling accuracy across chapter-level priority states. Reflects mastery depth.',
          threshold: { good: 65, warn: 45 },
        },
        {
          key: 'revision_discipline',
          label: 'Revision Discipline',
          value: revisionCompletion,
          numericValue: revisionCompletion,
          icon: RotateCcw,
          color: revisionCompletion >= 70 ? 'text-emerald-600' : revisionCompletion >= 50 ? 'text-amber-600' : 'text-rose-600',
          bg:   revisionCompletion >= 70 ? 'bg-emerald-50' : revisionCompletion >= 50 ? 'bg-amber-50' : 'bg-rose-50',
          border: revisionCompletion >= 70 ? 'border-emerald-100' : revisionCompletion >= 50 ? 'border-amber-100' : 'border-rose-100',
          description: `${pendingRevisions} pending revision items. Target is < 5 pending at any time.`,
          threshold: { good: 70, warn: 50 },
        },
        {
          key: 'execution_discipline',
          label: 'Execution',
          value: consistencyScore,
          numericValue: consistencyScore,
          icon: CheckCircle2,
          color: consistencyScore >= 70 ? 'text-blue-600' : consistencyScore >= 50 ? 'text-amber-600' : 'text-rose-600',
          bg:   consistencyScore >= 70 ? 'bg-blue-50' : consistencyScore >= 50 ? 'bg-amber-50' : 'bg-rose-50',
          border: 'border-blue-100',
          description: 'Session consistency score. Measures whether you show up and complete planned study sessions.',
          threshold: { good: 70, warn: 50 },
        },
        {
          key: 'mock_readiness',
          label: 'Mock Readiness',
          value: avgMockAccuracy,
          numericValue: avgMockAccuracy,
          icon: ShieldCheck,
          color: avgMockAccuracy >= 65 ? 'text-emerald-600' : avgMockAccuracy >= 48 ? 'text-amber-600' : 'text-rose-600',
          bg:   avgMockAccuracy >= 65 ? 'bg-emerald-50' : avgMockAccuracy >= 48 ? 'bg-amber-50' : 'bg-rose-50',
          border: avgMockAccuracy >= 65 ? 'border-emerald-100' : 'border-amber-100',
          description: `Average accuracy across ${mockAttempts.length} recent mock exams. Baseline target: 65%.`,
          threshold: { good: 65, warn: 48 },
        },
        {
          key: 'exam_urgency',
          label: 'Exam Urgency',
          value: `${daysToExam}d`,
          numericValue: daysToExam,
          icon: Clock,
          color: daysToExam <= 30 ? 'text-rose-600' : daysToExam <= 60 ? 'text-amber-600' : 'text-blue-600',
          bg:   daysToExam <= 30 ? 'bg-rose-50' : daysToExam <= 60 ? 'bg-amber-50' : 'bg-blue-50',
          border: daysToExam <= 30 ? 'border-rose-100' : 'border-amber-100',
          description: `${daysToExam} days to exam. Phase: ${examPhase}. Strategy emphasis shifts automatically per phase.`,
          threshold: { good: 90, warn: 45 },
        },
      ])

      // ── 9. Section D: Evolution Changes ────────────────────────────────
      // Build prior-cycle approximate values from plan output
      const planOutput = planMaster?.plan_output as Record<string, unknown> | null
      const prevAcc: Record<string, number> = {
  Physics:
    trendAccMap['Physics']
    ?? subjectAccMap['Physics']
    ?? 0,

  Chemistry:
    trendAccMap['Chemistry']
    ?? subjectAccMap['Chemistry']
    ?? 0,

  Biology:
    trendAccMap['Biology']
    ?? subjectAccMap['Biology']
    ?? 0,
}
      setEvolutionChanges(buildEvolutionChanges(subjectAccMap, prevAcc, revisionCompletion, avgMockAccuracy, pendingRevisions))

      // ── 10. Section E: Evolution Timeline ──────────────────────────────
      const timeline: EvolutionTimelineItem[] = (recalibLog ?? []).slice(0, 8).reverse().map((log, i) => {
        const n = recalibLog!.length
        const versionNum = log.recalibration_number
        const trigger = (log.trigger_type ?? 'MANUAL').replace(/_/g, ' ')
        return {
          version: versionNum,
          triggerType: trigger,
          executedAt: log.executed_at
            ? format(new Date(log.executed_at), 'd MMM yyyy')
            : '—',
          weekLabel: `Week ${Math.max(1, versionNum)}`,
          changes: [
  `Recalibration #${versionNum} triggered by: ${trigger}`,

  `Strategy updated to ${mode}`,

  log.executed_at
    ? `Executed on ${format(
        new Date(log.executed_at),
        'd MMM yyyy'
      )}`
    : '',
].filter(Boolean),
          strategyBefore: i > 0 ? 'Balanced' : undefined,
          strategyAfter: mode,
        }
      })
      setEvolutionTimeline(timeline)
      const planCreatedAt = planMaster?.created_at

const currentWeek =
  planCreatedAt
    ? Math.max(
        1,
        Math.floor(
          (
            Date.now() -
            new Date(planCreatedAt).getTime()
          ) /
          (1000 * 60 * 60 * 24 * 7)
        ) + 1
      )
    : 1

      // ── 11. Section F: Roadmap Intelligence ────────────────────────────
      const intel = detectRoadmapDrift(
        roadmapAll?.map(r => ({
          id: r.id, chapter_id: r.chapter_id,
          planned_week: r.planned_week,
          actual_completion_date: r.actual_completion_date,
          status: r.status,
          priority_score: r.priority_score,
        })) ?? [],
        chapterMap, subjectMap,
        currentWeek,
        subjectAccMap,
        planMaster?.created_at ?? null,
      )
      setRoadmapIntel(intel)

      // ── 12. Section G: Acceleration Engine ─────────────────────────────
      const acc = computeAccelerationEngine(
  roadmapAll?.map(r => ({
    id: r.id,
    chapter_id: r.chapter_id,
    planned_week: r.planned_week,
    status: r.status,
    target_mastery: Number(r.target_mastery ?? 75),
  })) ?? [],
  chapterMap,
  subjectMap,
  chPerfMap,
  currentWeek,
)
      setAcceleration(acc)

      // ── 13. Section H: Revision Retention ──────────────────────────────
      const retention = computeRevisionRetention(
        revSchedule?.map(r => ({
          question_id: r.question_id,
          next_revision_date: r.next_revision_date,
          revision_interval_weeks: r.revision_interval_weeks,
        })) ?? [],
        revPool?.map(r => ({
          question_id: r.question_id,
          consecutive_correct_count: r.consecutive_correct_count ?? 0,
          priority_score: Number(r.priority_score ?? 1),
        })) ?? [],
        chapterMap, questionChapterMap, subjectMap,
      )
      setRevisionRetention(retention)

      // ── 14. Section I: Question Type Intelligence ───────────────────────
      const qtData: QuestionTypeData[] = (qTypePerf ?? []).map(qt => {
        const acc = Math.round(Number(qt.accuracy_30d ?? 0))
        const attempts = qt.attempts_30d ?? 0
        const strength: QuestionTypeData['strengthLevel'] =
          acc >= 72 ? 'Strong' : acc >= 55 ? 'Moderate' : acc >= 35 ? 'Weak' : 'Critical'
        const mentorFlag =
          strength === 'Critical' ? `Critical gap in ${QUESTION_TYPE_LABELS[qt.question_type as TaxonomyType] ?? qt.question_type} — dedicate targeted practice` :
          strength === 'Weak' ? `Weak format — include in weekly practice sets` : null
        return {
          type: qt.question_type as TaxonomyType,
          displayName: QUESTION_TYPE_LABELS[qt.question_type as TaxonomyType] ?? qt.question_type,
          accuracy: acc,
          attempts,
          avgTimeSeconds: Math.round(Number(qt.avg_time_seconds ?? 0)),
          strengthLevel: strength,
          mentorFlag,
        }
      }).sort((a, b) => a.accuracy - b.accuracy)
      setQuestionTypes(qtData)

      // ── 15. Section J: Psychological Adaptation ────────────────────────
      const psych = computePsychState(
        anxietyLevel,
        consistencyScore,
        attemptsLast7,
        pendingRevisions,
        avgAccuracy,
      )
      setPsychData(psych)

      // ── 16. Section L: Mentor Recommendation ───────────────────────────
      setMentorRec(buildMentorRecommendations(
        mode, subjectAccMap, revisionCompletion, avgMockAccuracy,
        psych, intel.overallDriftRisk, retention.retentionHealth, daysToExam,
      ))

    } catch (e: unknown) {
      console.error('MentorPage fetch error:', e)
      setError('Could not load mentor intelligence. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Derived config ─────────────────────────────────────────────────────────
  const stratConfig = hero ? STRATEGY_CONFIG[hero.strategyMode] : STRATEGY_CONFIG['Balanced']
  const phaseConfig = hero ? EXAM_PHASE_CONFIG[hero.examPhase] : EXAM_PHASE_CONFIG['Foundation']
  const healthBadge =
    hero?.health === 'Good' ? 'bg-emerald-100 text-emerald-700' :
    hero?.health === 'Needs Attention' ? 'bg-amber-100 text-amber-700' :
    'bg-rose-100 text-rose-700'

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <MentorLayout>
      <main className="flex-1 min-h-0 overflow-y-auto bg-[#F7F8FA]">
        <div className="max-w-[1120px] mx-auto px-5 lg:px-10 py-8 pb-36 space-y-10">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <header className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mentor</h1>
                <p className="text-sm text-slate-400">Intelligence layer — why your plan is evolving</p>
              </div>
            </div>
          </header>

          {/* ── Error ───────────────────────────────────────────────────── */}
          {error && (
            <Card className="rounded-2xl border-rose-200 bg-rose-50">
              <CardContent className="p-4 flex items-center gap-3 text-rose-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {isLoading ? <PageSkeleton /> : (
            <>

            {/* ════════════════════════════════════════════════════════════
                SECTION A — CURRENT STRATEGY
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Gauge} label="Current Strategy" sub="Mode determined by performance signals, revision state and exam urgency" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Strategy Mode */}
                <Card className={cn('rounded-2xl border col-span-2 lg:col-span-1 shadow-sm', stratConfig.bg, stratConfig.border)}>
                  <CardContent className="p-5 space-y-3">
                    <p className={cn('text-[10px] font-bold uppercase tracking-widest opacity-60', stratConfig.color)}>Strategy Mode</p>
                    <p className={cn('text-xl font-bold', stratConfig.color)}>{hero?.strategyMode}</p>
                    <p className={cn('text-[11px] leading-relaxed', stratConfig.color, 'opacity-80')}>
                      {stratConfig.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Exam Phase */}
                <Card className={cn('rounded-2xl border shadow-sm', phaseConfig.bg)}>
                  <CardContent className="p-5 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Phase</p>
                    <p className={cn('text-lg font-bold', phaseConfig.color)}>{hero?.examPhase}</p>
                    <p className="text-[11px] text-slate-500">{phaseConfig.description}</p>
                  </CardContent>
                </Card>

                {/* Recalibration */}
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recalibration</p>
                    <p className="text-2xl font-bold text-slate-900">v{hero?.recalibrationVersion}</p>
                    <p className="text-[11px] text-slate-400">Updated {hero?.lastUpdated}</p>
                  </CardContent>
                </Card>

                {/* Strategy Health */}
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-5 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategy Health</p>
                    <Badge className={cn('text-sm font-bold border-none px-3 py-1', healthBadge)}>
                      {hero?.health}
                    </Badge>
                    <p className="text-[11px] text-slate-400">{hero?.daysToExam} days to exam</p>
                  </CardContent>
                </Card>
              </div>

              {/* Phase emphasis strip */}
              <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Phase Emphasis — {hero?.examPhase}
                </p>
                <div className="flex flex-wrap gap-2">
                  {phaseConfig.emphasis.map((e, i) => (
                    <span key={i} className={cn('text-xs font-semibold px-3 py-1.5 rounded-xl', phaseConfig.bg, phaseConfig.color)}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION B — STRATEGIC ALLOCATION
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={BarChart2} label="Strategic Allocation" sub="Weekly effort distribution — weaker subjects receive proportionally more focus" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-6">
                    <DonutChart allocation={allocation} />
                    <p className="text-[11px] text-slate-400 italic mt-5">
                      Allocation is recalculated every recalibration cycle using inverse accuracy weighting.
                      Weaker subjects receive proportionally more session time.
                    </p>
                  </CardContent>
                </Card>

                {/* Allocation bars */}
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm font-bold text-slate-700 mb-4">Session Distribution</p>
                    {(Object.entries(allocation) as Array<[keyof typeof SUBJECT_COLORS, number]>).map(([subject, pct]) => {
                      const col = SUBJECT_COLORS[subject]
                      const Icon = SUBJECT_ICONS[subject]
                      return (
                        <div key={subject} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {Icon && <Icon className={cn('w-3.5 h-3.5', col.text)} />}
                              <span className="text-sm font-semibold text-slate-700">{subject}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{pct}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full', col.bg)} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION C — PERFORMANCE SIGNALS
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Activity} label="Performance Signals" sub="Six core signals feeding the recalibration engine" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {signals.map(signal => (
                  <Card
                    key={signal.key}
                    className={cn(
                      'rounded-2xl border cursor-pointer transition-shadow hover:shadow-md',
                      expandedSignal === signal.key ? `${signal.bg} ${signal.border} border shadow-md` : 'border-slate-100 bg-white shadow-sm'
                    )}
                    onClick={() => setExpandedSignal(expandedSignal === signal.key ? null : signal.key)}
                  >
                    <CardContent className="p-4 space-y-3 text-center">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto', signal.bg)}>
                        <signal.icon className={cn('w-5 h-5', signal.color)} />
                      </div>
                      <div>
                        <p className={cn('text-xl font-bold', signal.color)}>
                          {typeof signal.value === 'string' ? signal.value : `${signal.value}%`}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight mt-0.5">
                          {signal.label}
                        </p>
                      </div>
                      <SignalBar
                        value={typeof signal.value === 'string' ? signal.numericValue : (signal.numericValue as number)}
                        max={signal.key === 'exam_urgency' ? 365 : 100}
                        color={signal.color.replace('text-', 'bg-')}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Expanded description */}
              {expandedSignal && (
                <div className="mt-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-600">
                    {signals.find(s => s.key === expandedSignal)?.description}
                  </p>
                </div>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION D — EVOLUTION ENGINE (Why Changes Were Made)
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={RefreshCw} label="Evolution Engine" sub="Why your plan changed — each signal that triggered a recalibration" />
              {evolutionChanges.length === 0 ? (
                <Card className="rounded-2xl border-none bg-slate-50">
                  <CardContent className="p-8 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">All signals within target range. No allocation changes were triggered.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {evolutionChanges.map(ch => {
                    const isUp = ch.direction === 'increased'
                    const isHigh = ch.impact === 'high'
                    const subjectColor = ch.subject ? SUBJECT_COLORS[ch.subject] : null
                    return (
                      <Card
                        key={ch.id}
                        className={cn(
                          'rounded-2xl border-l-4 shadow-sm',
                          isHigh ? 'border-l-rose-400 bg-rose-50/40' :
                          isUp ? 'border-l-amber-400 bg-amber-50/40' :
                          'border-l-emerald-400 bg-emerald-50/40',
                          'border border-slate-100'
                        )}
                      >
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {ch.subject && subjectColor && (
                                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-lg', subjectColor.soft, subjectColor.text)}>
                                  {ch.subject}
                                </span>
                              )}
                              {isUp
                                ? <ArrowUpRight className="w-4 h-4 text-rose-500 shrink-0" />
                                : <ArrowDownRight className="w-4 h-4 text-emerald-500 shrink-0" />}
                              <h3 className="text-sm font-bold text-slate-800">{ch.label}</h3>
                            </div>
                            <Badge className={cn(
                              'text-[10px] border-none font-bold shrink-0',
                              ch.impact === 'high' ? 'bg-rose-100 text-rose-700' :
                              ch.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            )}>
                              {ch.impact} impact
                            </Badge>
                          </div>

                          {/* Old → New values */}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="px-3 py-1.5 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block">Before</span>
                              <span className="font-bold text-slate-600">{ch.oldValue}{ch.unit.startsWith('%') ? '%' : ''}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <div className={cn(
                              'px-3 py-1.5 rounded-xl border',
                              isUp ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
                            )}>
                              <span className="text-[10px] text-slate-400 block">After</span>
                              <span className={cn('font-bold', isUp ? 'text-rose-700' : 'text-emerald-700')}>
                                {ch.newValue}{ch.unit.startsWith('%') ? '%' : ''}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">{ch.unit}</span>
                          </div>

                          <p className="text-[12px] text-slate-600 leading-relaxed">{ch.reason}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION E — EVOLUTION TIMELINE
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Calendar} label="Evolution Timeline" sub="Recalibration history from plan_recalibration_log" badge={`${evolutionTimeline.length} events`} />
              {evolutionTimeline.length === 0 ? (
                <Card className="rounded-2xl border-none bg-slate-50">
                  <CardContent className="p-8 text-center text-slate-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No recalibration history yet. History builds as your plan evolves.</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-2xl border-none shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="relative">
                      <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-slate-100" />
                      <div className="space-y-6">
                        {evolutionTimeline.map((item, i) => (
                          <div key={i} className="flex gap-5 items-start pl-1">
                            <div className={cn(
                              'w-[22px] h-[22px] rounded-full border-2 shrink-0 mt-0.5 z-10 flex items-center justify-center',
                              i === evolutionTimeline.length - 1
                                ? 'bg-slate-900 border-slate-900'
                                : 'bg-white border-slate-300'
                            )}>
                              {i === evolutionTimeline.length - 1 && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-800">{item.weekLabel}</span>
                                  <Badge className="text-[10px] bg-slate-100 text-slate-500 border-none px-2">
                                    v{item.version}
                                  </Badge>
                                  {i === evolutionTimeline.length - 1 && (
                                    <Badge className="text-[10px] bg-slate-900 text-white border-none px-2">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 shrink-0">{item.executedAt}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 mt-0.5 mb-1.5">
                                Trigger: {item.triggerType}
                              </p>
                              <div className="space-y-0.5">
                                {item.changes.map((c, ci) => (
                                  <p key={ci} className="text-xs text-slate-500">→ {c}</p>
                                ))}
                              </div>
                              {item.strategyAfter && (
                                <p className="text-[11px] font-bold text-slate-700 mt-1.5">
                                  Strategy: {item.strategyAfter}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION F — ROADMAP INTELLIGENCE
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead
                icon={Layers}
                label="Roadmap Intelligence"
                sub="Drift detection — planned vs actual chapter completion"
                badge={roadmapIntel ? `${roadmapIntel.delayedChapters.length} delayed` : undefined}
              />
              {roadmapIntel && (
                <div className="space-y-4">
                  {/* Health summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Drift Risk', value: roadmapIntel.overallDriftRisk, type: 'badge' },
                      { label: 'Delayed', value: roadmapIntel.delayedChapters.length, type: 'number', color: 'text-rose-600' },
                      { label: 'Accelerated', value: roadmapIntel.acceleratedChapters.length, type: 'number', color: 'text-emerald-600' },
                      { label: 'On Track', value: roadmapIntel.onTrackCount, type: 'number', color: 'text-sky-600' },
                    ].map(item => (
                      <Card key={item.label} className="rounded-2xl border-none shadow-sm bg-white">
                        <CardContent className="p-5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                          {item.type === 'badge'
                            ? <RiskBadge risk={item.value as RiskLevel} />
                            : <p className={cn('text-2xl font-bold', item.color)}>{item.value}</p>
                          }
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Delayed chapters table */}
                  {roadmapIntel.delayedChapters.length > 0 && (
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                      <div className="px-5 py-3 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <p className="text-sm font-bold text-rose-700">Delayed Chapters</p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {(showAllDelayed ? roadmapIntel.delayedChapters : roadmapIntel.delayedChapters.slice(0, 5)).map(dc => {
                          const pal = SUBJECT_COLORS[dc.subject]
                          return (
                            <div key={dc.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{dc.chapterName}</p>
                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-lg', pal?.soft, pal?.text)}>
                                  {dc.subject}
                                </span>
                              </div>
                              <div className="text-center shrink-0">
                                <p className="text-[10px] text-slate-400">Planned</p>
                                <p className="text-sm font-bold text-slate-600">Wk {dc.plannedWeek}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-200 shrink-0" />
                              <div className="text-center shrink-0">
                                <p className="text-[10px] text-slate-400">Delay</p>
                                <p className="text-sm font-bold text-rose-600">+{dc.weeksDelay}w</p>
                              </div>
                              <div className="shrink-0">
                                <RiskBadge risk={dc.riskLevel} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {roadmapIntel.delayedChapters.length > 5 && (
                        <div className="px-5 py-3 border-t border-slate-100 flex justify-center">
                          <button onClick={() => setShowAllDelayed(v => !v)}
                            className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-700">
                            {showAllDelayed ? 'Show less' : `Show all ${roadmapIntel.delayedChapters.length}`}
                            {showAllDelayed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Accelerated chapters */}
                  {roadmapIntel.acceleratedChapters.length > 0 && (
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm font-bold text-emerald-700">Accelerated Chapters</p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {roadmapIntel.acceleratedChapters.map(ac => {
                          const pal = SUBJECT_COLORS[ac.subject]
                          return (
                            <div key={ac.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{ac.chapterName}</p>
                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-lg', pal?.soft, pal?.text)}>
                                  {ac.subject}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400">Original</p>
                                <p className="text-sm font-bold text-slate-500">Wk {ac.originalWeek}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-200" />
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400">Moved to</p>
                                <p className="text-sm font-bold text-emerald-600">Wk {ac.acceleratedToWeek}</p>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold">
                                -{ac.weeksSaved}w
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION G — ACCELERATION ENGINE
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Zap} label="Acceleration Engine" sub="Chapters eligible for pull-forward based on accuracy threshold (≥72%)" />
              {acceleration && (
                acceleration.accelerationTriggered ? (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Chapters Eligible', value: acceleration.chaptersEligible.length, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: BookOpen },
                        { label: 'Weeks Saved', value: `${acceleration.weeksSaved}w`, color: 'text-sky-600', bg: 'bg-sky-50', icon: Calendar },
                        { label: 'Coverage Gain', value: `${acceleration.coverageGainPct}%`, color: 'text-violet-600', bg: 'bg-violet-50', icon: TrendingUp },
                      ].map(item => (
                        <Card key={item.label} className="rounded-2xl border-none shadow-sm bg-white">
                          <CardContent className="p-5 flex items-center gap-4">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bg)}>
                              <item.icon className={cn('w-5 h-5', item.color)} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                              <p className={cn('text-xl font-bold', item.color)}>{item.value}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Eligible chapters */}
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm font-bold text-emerald-700">
                          Chapters Eligible for Pull-Forward
                        </p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {(showAllAcceleration
                          ? acceleration.chaptersEligible
                          : acceleration.chaptersEligible.slice(0, 5)
                        ).map(ch => {
                          const pal = SUBJECT_COLORS[ch.subject]
                          return (
                            <div key={ch.id} className="flex items-center gap-4 px-5 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{ch.chapterName}</p>
                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-lg', pal?.soft, pal?.text)}>
                                  {ch.subject}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400">Accuracy</p>
                                <p className="text-sm font-bold text-emerald-600">{ch.currentAccuracy}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400">Pull forward</p>
                                <p className="text-sm font-bold text-sky-600">{ch.weeksPulledForward}w</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {acceleration.chaptersEligible.length > 5 && (
                        <div className="px-5 py-3 border-t border-slate-100 flex justify-center">
                          <button onClick={() => setShowAllAcceleration(v => !v)}
                            className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-700">
                            {showAllAcceleration ? 'Show less' : `Show all ${acceleration.chaptersEligible.length}`}
                            {showAllAcceleration ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </Card>
                  </div>
                ) : (
                  <Card className="rounded-2xl border-none bg-slate-50">
                    <CardContent className="p-8 text-center text-slate-400">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-semibold text-slate-500">Acceleration Not Yet Triggered</p>
                      <p className="text-xs mt-1">Chapters become eligible when accuracy exceeds 72%. Continue building accuracy to unlock pull-forward.</p>
                    </CardContent>
                  </Card>
                )
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION H — REVISION RETENTION ENGINE
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={RotateCcw} label="Revision Retention Engine" sub="Completed revisions vs retained knowledge — memory decay tracking" />
              {revisionRetention && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        label: 'Retention Health',
                        value: revisionRetention.retentionHealth,
                        type: 'badge',
                        badgeColor:
                          revisionRetention.retentionHealth === 'Strong' ? 'bg-emerald-100 text-emerald-700' :
                          revisionRetention.retentionHealth === 'Moderate' ? 'bg-sky-100 text-sky-700' :
                          revisionRetention.retentionHealth === 'Weak' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                      },
                      { label: 'Completed Revisions', value: revisionRetention.completedRevisions, type: 'number', color: 'text-sky-600' },
                      { label: 'Retained', value: revisionRetention.retainedRevisions, type: 'number', color: 'text-emerald-600' },
                      { label: 'Overdue', value: revisionRetention.overdueCount, type: 'number', color: revisionRetention.overdueCount > 5 ? 'text-rose-600' : 'text-amber-600' },
                    ].map(item => (
                      <Card key={item.label} className="rounded-2xl border-none shadow-sm bg-white">
                        <CardContent className="p-5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                          {item.type === 'badge'
                            ? <Badge className={cn('text-sm font-bold border-none px-3 py-1', (item as any).badgeColor)}>{item.value}</Badge>
                            : <p className={cn('text-2xl font-bold', (item as any).color)}>{item.value}</p>
                          }
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Retention rate comparison */}
                  <Card className="rounded-2xl border-none shadow-sm bg-white">
                    <CardContent className="p-6 space-y-4">
                      <p className="text-sm font-bold text-slate-700">Completed vs Retained</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-slate-500">Completed Revisions</span>
                            <span className="font-bold text-slate-700">{revisionRetention.completedRevisions}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-400 rounded-full"
                              style={{ width: `${Math.min(100, revisionRetention.completedRevisions * 3)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-slate-500">Retained (≥3 consecutive correct)</span>
                            <span className="font-bold text-emerald-600">{revisionRetention.retainedRevisions}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${Math.min(100, revisionRetention.retainedRevisions * 3)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-slate-500">Retention Rate</span>
                            <span className={cn('font-bold',
                              revisionRetention.retentionRate >= 70 ? 'text-emerald-600' :
                              revisionRetention.retentionRate >= 50 ? 'text-amber-600' : 'text-rose-600'
                            )}>{revisionRetention.retentionRate}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full',
                              revisionRetention.retentionRate >= 70 ? 'bg-emerald-400' :
                              revisionRetention.retentionRate >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                            )} style={{ width: `${revisionRetention.retentionRate}%` }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* At-risk chapters */}
                  {revisionRetention.atRiskChapters.length > 0 && (
                    <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                      <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <p className="text-sm font-bold text-amber-700">Retention Risk Chapters</p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {revisionRetention.atRiskChapters.map((ch, i) => {
                          const pal = SUBJECT_COLORS[ch.subject]
                          return (
                            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{ch.chapterName}</p>
                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-lg', pal?.soft, pal?.text)}>
                                  {ch.subject}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400">Retention</p>
                                <p className={cn('text-sm font-bold',
                                  ch.retentionPct < 40 ? 'text-rose-600' :
                                  ch.retentionPct < 60 ? 'text-amber-600' : 'text-emerald-600'
                                )}>{ch.retentionPct}%</p>
                              </div>
                              <div className="w-20">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={cn('h-full rounded-full',
                                    ch.retentionPct < 40 ? 'bg-rose-400' :
                                    ch.retentionPct < 60 ? 'bg-amber-400' : 'bg-emerald-400'
                                  )} style={{ width: `${ch.retentionPct}%` }} />
                                </div>
                              </div>
                              <div className="text-center shrink-0">
                                <p className="text-[10px] text-slate-400">Overdue</p>
                                <p className="text-sm font-bold text-slate-500">{ch.daysSinceLast}d</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION I — QUESTION TYPE INTELLIGENCE
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Eye} label="Question Format Intelligence" sub="Accuracy by question type — identifies format-specific weaknesses" />
              {questionTypes.length === 0 ? (
                <Card className="rounded-2xl border-none bg-slate-50">
                  <CardContent className="p-8 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No question type data available. Attempt more practice sets to populate this section.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {questionTypes.map(qt => {
                      const strengthColors = {
                        Strong:   { text: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
                        Moderate: { text: 'text-sky-700',     bg: 'bg-sky-50',     bar: 'bg-sky-400',     badge: 'bg-sky-100 text-sky-700' },
                        Weak:     { text: 'text-amber-700',   bg: 'bg-amber-50',   bar: 'bg-amber-400',   badge: 'bg-amber-100 text-amber-700' },
                        Critical: { text: 'text-rose-700',    bg: 'bg-rose-50',    bar: 'bg-rose-400',    badge: 'bg-rose-100 text-rose-700' },
                      }[qt.strengthLevel]
                      return (
                        <Card key={qt.type} className={cn(
                          'rounded-2xl border shadow-sm',
                          qt.strengthLevel === 'Critical' ? 'border-rose-200 bg-rose-50/30' :
                          qt.strengthLevel === 'Weak' ? 'border-amber-200 bg-amber-50/20' :
                          'border-slate-100 bg-white'
                        )}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-xs font-bold text-slate-700 leading-snug">{qt.displayName}</p>
                              <Badge className={cn('text-[9px] border-none font-bold shrink-0', strengthColors.badge)}>
                                {qt.strengthLevel}
                              </Badge>
                            </div>
                            <p className={cn('text-2xl font-bold', strengthColors.text)}>{qt.accuracy}%</p>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={cn('h-full rounded-full', strengthColors.bar)} style={{ width: `${qt.accuracy}%` }} />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>{qt.attempts} attempts</span>
                              <span>{qt.avgTimeSeconds}s avg</span>
                            </div>
                            {qt.mentorFlag && (
                              <p className={cn('text-[10px] font-semibold leading-tight', strengthColors.text)}>
                                ↳ {qt.mentorFlag}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Weak format summary */}
                  {questionTypes.filter(qt => qt.strengthLevel === 'Weak' || qt.strengthLevel === 'Critical').length > 0 && (
                    <Card className="rounded-2xl border border-amber-100 bg-amber-50/40 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-amber-800 mb-1">Mentor Insight — Question Format Gaps</p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                              {questionTypes.filter(qt => qt.strengthLevel === 'Critical' || qt.strengthLevel === 'Weak')
                                .map(qt => qt.displayName).join(', ')} show below-target accuracy.
                              Include dedicated format practice in weekly sessions — these account for
                              ~{Math.round(questionTypes.filter(qt => qt.strengthLevel !== 'Strong').length / questionTypes.length * 100)}%
                              of NEET questions.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION J — PSYCHOLOGICAL ADAPTATION
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Heart} label="Psychological Adaptation" sub="Strategy adjustments based on anxiety, consistency and burnout risk signals" />
              {psychData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* State card */}
                  <Card className={cn(
                    'rounded-2xl border shadow-sm',
                    psychData.state === 'Burnout Risk' ? 'border-rose-200 bg-rose-50/30' :
                    psychData.state === 'Overload' ? 'border-amber-200 bg-amber-50/30' :
                    psychData.state === 'Momentum' ? 'border-emerald-200 bg-emerald-50/20' :
                    'border-slate-100 bg-white'
                  )}>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Psychological State</p>
                        <Badge className={cn(
                          'text-sm font-bold border-none px-3 py-1',
                          psychData.state === 'Burnout Risk' ? 'bg-rose-100 text-rose-700' :
                          psychData.state === 'Overload' ? 'bg-amber-100 text-amber-700' :
                          psychData.state === 'Momentum' ? 'bg-emerald-100 text-emerald-700' :
                          psychData.state === 'Disengaged' ? 'bg-slate-100 text-slate-600' :
                          'bg-blue-100 text-blue-700'
                        )}>
                          {psychData.state}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            label: 'Anxiety', value: psychData.anxietyLevel,
                            color: psychData.anxietyLevel === 'HIGH' ? 'text-rose-600' :
                              psychData.anxietyLevel === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                          },
                          {
                            label: 'Burnout Risk', value: psychData.burnoutRisk,
                            color: psychData.burnoutRisk === 'HIGH' ? 'text-rose-600' :
                              psychData.burnoutRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                          },
                          {
                            label: 'Overload', value: psychData.overloadRisk,
                            color: psychData.overloadRisk === 'HIGH' ? 'text-rose-600' :
                              psychData.overloadRisk === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                          },
                        ].map(item => (
                          <div key={item.label} className="bg-white/60 rounded-xl p-3 text-center border border-white">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.label}</p>
                            <p className={cn('text-base font-bold mt-0.5', item.color)}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Momentum Score</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn('h-full rounded-full',
                              psychData.momentumScore >= 70 ? 'bg-emerald-400' :
                              psychData.momentumScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                            )} style={{ width: `${psychData.momentumScore}%` }} />
                          </div>
                          <span className="text-sm font-bold text-slate-700 shrink-0">{psychData.momentumScore}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendation + Adjustment */}
                  <div className="space-y-4">
                    <Card className="rounded-2xl border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-5 opacity-5">
                        <Brain className="w-24 h-24" />
                      </div>
                      <CardContent className="p-6 space-y-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white/10 rounded-lg">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Mentor Assessment
                          </p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">"{psychData.recommendation}"</p>
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border border-sky-100 bg-sky-50/40 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <RefreshCw className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-sky-800 mb-1">Plan Adjustment Applied</p>
                            <p className="text-xs text-sky-700 leading-relaxed">{psychData.strategyAdjustment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION K — EXAM URGENCY ENGINE
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Flame} label="Exam Urgency Engine" sub="Automatic strategy transition based on days remaining to exam" />
              <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6">
                  {/* Phase timeline */}
                  <div className="relative">
                    <div className="flex justify-between items-start">
                      {(Object.entries(EXAM_PHASE_CONFIG) as Array<[ExamPhase, typeof EXAM_PHASE_CONFIG[ExamPhase]]>).map(([phase, cfg], i) => {
                        const isActive = hero?.examPhase === phase
                        return (
                          <div key={phase} className="flex-1 relative">
                            {/* Connector */}
                            {i < 5 && (
                              <div className={cn(
                                'absolute top-3 left-1/2 right-0 h-0.5',
                                isActive ? 'bg-slate-900' : 'bg-slate-200'
                              )} />
                            )}
                            <div className="flex flex-col items-center gap-2 px-1">
                              <div className={cn(
                                'w-6 h-6 rounded-full border-2 z-10 flex items-center justify-center',
                                isActive
                                  ? 'bg-slate-900 border-slate-900'
                                  : 'bg-white border-slate-300'
                              )}>
                                {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <div className="text-center">
                                <p className={cn(
                                  'text-[10px] font-bold leading-tight',
                                  isActive ? 'text-slate-900' : 'text-slate-400'
                                )}>{phase}</p>
                                <p className={cn('text-[9px] mt-0.5', isActive ? 'text-slate-500' : 'text-slate-300')}>
                                  {cfg.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Current phase detail */}
                  {hero && (
                    <div className={cn('mt-6 p-4 rounded-2xl border', phaseConfig.bg)}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={cn('text-sm font-bold', phaseConfig.color)}>
                            Current Phase: {hero.examPhase}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{hero.daysToExam} days remaining · {phaseConfig.description}</p>
                        </div>
                        <Badge className={cn('border-none font-bold text-[10px] shrink-0', phaseConfig.bg, phaseConfig.color)}>
                          Active
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {phaseConfig.emphasis.map((e, i) => (
                          <span key={i} className="text-[11px] text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-white">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* ════════════════════════════════════════════════════════════
                SECTION L — MENTOR RECOMMENDATION
            ════════════════════════════════════════════════════════════ */}
            <section>
              <SectionHead icon={Sparkles} label="Mentor Recommendation" sub="Rule-based synthesis of all performance signals" />
              {mentorRec && (
                <div className="space-y-4">
                  {/* Headline */}
                  <Card className="rounded-2xl border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.04]">
                      <Brain className="w-32 h-32" />
                    </div>
                    <CardContent className="p-7 relative z-10 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mentor Intelligence</p>
                          <p className="text-base font-bold text-white mt-0.5">{mentorRec.headline}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Priorities */}
                  <div className="space-y-3">
                    {mentorRec.priority.map((p) => {
                      const urgencyConfig = {
                        high:   { border: 'border-l-rose-400 bg-rose-50/40',   badge: 'bg-rose-100 text-rose-700' },
                        medium: { border: 'border-l-amber-400 bg-amber-50/40', badge: 'bg-amber-100 text-amber-700' },
                        low:    { border: 'border-l-emerald-400 bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-700' },
                      }[p.urgency]
                      return (
                        <div key={p.rank} className={cn('flex items-start gap-4 p-5 rounded-2xl border border-l-4 border-slate-100', urgencyConfig.border)}>
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', {
                            'bg-rose-100': p.urgency === 'high',
                            'bg-amber-100': p.urgency === 'medium',
                            'bg-emerald-100': p.urgency === 'low',
                          })}>
                            <p.icon className={cn('w-4 h-4', {
                              'text-rose-600': p.urgency === 'high',
                              'text-amber-600': p.urgency === 'medium',
                              'text-emerald-600': p.urgency === 'low',
                            })} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Priority {p.rank}
                              </span>
                              <Badge className={cn('text-[10px] border-none font-bold', urgencyConfig.badge)}>
                                {p.urgency}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{p.text}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Closed Loop Summary */}
                  <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5">
                      <button
                        onClick={() => setShowLoopDetails(v => !v)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-slate-400" />
                          <p className="text-sm font-bold text-slate-700">Phase 4 Closed-Loop Summary</p>
                        </div>
                        {showLoopDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {showLoopDetails && (
                        <div className="mt-4 space-y-3">
                          <p className="text-xs text-slate-500 leading-relaxed">{mentorRec.closedLoopSummary}</p>
                          {/* Loop diagram */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            {['Performance', 'Recalibration', 'Roadmap Changes', 'Weekly Allocation', 'Daily Plan', 'Student Activity', 'Performance'].map((step, i, arr) => (
                              <React.Fragment key={i}>
                                <span className="text-[11px] font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">{step}</span>
                                {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Lock indicator */}
                  <div className="flex items-center gap-3 px-1">
                    <Lock className="w-4 h-4 text-slate-300" />
                    <span className="text-xs text-slate-400">
                      Strategy locked until next recalibration cycle · Recalibrates in {7 - new Date().getDay()} days
                    </span>
                  </div>
                </div>
              )}
            </section>

            </>
          )}
        </div>
      </main>
    </MentorLayout>
  )
}
