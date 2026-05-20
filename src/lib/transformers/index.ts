import { DashboardVM, RevisionVM, RevisionItemVM, WeakAreaVM } from '@/store/use-student-store';
import { WeeklyPlanOutput } from '@/ai/flows/generate-weekly-plan-flow';
import { formatDistanceToNow, subDays, isAfter } from 'date-fns';

/**
 * transformToDashboardVM
 * Aggregates all user-scoped Firestore data into a data-driven view model.
 */
export function transformToDashboardVM(
  chapterPerformance: any[],
  questionAttempts: any[],
  examAttempts: any[],
  nextBestActions: any[],
  psychStates: any[],
  revisionItems: any[],
  questionTypePerformance: any[]
): DashboardVM {
  const now = new Date();
  const last7Days = subDays(now, 7);

  // 1. KPI Aggregation
  const getSubjectProgress = (subjectId: string) => {
    const chapters = chapterPerformance.filter(c => c.subjectId?.toLowerCase() === subjectId.toLowerCase());
    return {
      done: chapters.filter(c => c.chapterCompletionStatus === 'Completed').length,
      total: Math.max(chapters.length, 1) // Fallback to 1 to avoid division by zero
    };
  };

  const currentQuestions = questionAttempts.filter(a => isAfter(new Date(a.attemptedAt), last7Days));
  
  const currentExams = examAttempts.filter(a => isAfter(new Date(a.attemptedAt), last7Days));

  const avgAccuracy = examAttempts.length > 0 
    ? Math.round(examAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / examAttempts.length)
    : Math.round(questionAttempts.filter(a => a.isCorrect).length / (questionAttempts.length || 1) * 100);

  // 2. Psychological State
  const latestPsych = psychStates[0] || { 
    anxietyLevel: 'Low', 
    focusLevel: 'High', 
    burnoutRisk: 'Low', 
    confidenceMismatchRisk: 'Low',
    interpretation: 'Mental stamina optimal.' 
  };
  const levelMap = { 'Low': 20, 'Medium': 50, 'High': 80, 'Moderate': 50 };

  // 3. Error Patterns (Client-side heuristics)
  const errors = questionAttempts.filter(a => !a.isCorrect);
  const totalAttempts = questionAttempts.length || 1;
  
  const guessingCount = errors.filter(a => a.timeTakenSeconds < 30).length;
  const conceptGapCount = errors.filter(a => a.timeTakenSeconds > 90).length;
  const inefficiencyCount = questionAttempts.filter(a => a.isCorrect && a.timeTakenSeconds > 90).length;

  // 4. Time Management
  const totalTime = questionAttempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0);
  const avgTime = Math.round(totalTime / totalAttempts);
  const heavyCount = questionAttempts.filter(a => a.timeTakenSeconds > 90).length;
  const rushedCount = questionAttempts.filter(a => a.timeTakenSeconds < 30).length;

  return {
    kpis: {
      chapters: {
        physics: getSubjectProgress('Physics'),
        chemistry: getSubjectProgress('Chemistry'),
        biology: getSubjectProgress('Biology'),
      },
      totalQuestions: { value: questionAttempts.length, delta: currentQuestions.length },
      examsTaken: { value: examAttempts.length, delta: currentExams.length },
      accuracy: { value: avgAccuracy, delta: 2 } // Mocked delta for demo
    },
    strategy: {
      tasks: nextBestActions.map(a => ({
        id: a.id,
        task: a.actionType,
        reason: a.reason,
        impact: a.impact,
        priority: a.priorityLevel || 'medium'
      })),
      summary: latestPsych.interpretation
    },
    psychProfile: {
      anxiety: levelMap[latestPsych.anxietyLevel as keyof typeof levelMap] || 30,
      confidence: 100 - (levelMap[latestPsych.confidenceMismatchRisk as keyof typeof levelMap] || 20),
      focus: levelMap[latestPsych.focusLevel as keyof typeof levelMap] || 70,
      burnout: levelMap[latestPsych.burnoutRisk as keyof typeof levelMap] || 20,
      interpretation: latestPsych.interpretation,
      level: (latestPsych.burnoutRisk?.toLowerCase() || 'low') as any
    },
    revisionQueue: revisionItems.map(r => ({
      id: r.id,
      topic: r.chapterId || r.questionId,
      lastAttempted: r.addedAt ? formatDistanceToNow(new Date(r.addedAt)) : 'Never',
      accuracyTrend: 65, // Mocked trend
      priority: r.priorityLevel
    })),
    weaknessSnapshot: {
      chapters: chapterPerformance
        .sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)
        .slice(0, 3)
        .map(c => ({
          name: c.chapterName || c.chapterId,
          accuracy: c.accuracyPercentage,
          severity: c.accuracyPercentage < 40 ? 'critical' : c.accuracyPercentage < 60 ? 'moderate' : 'slight'
        })),
      questionType: questionTypePerformance
        .sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)
        .slice(0, 1)
        .map(q => ({ name: q.questionType, accuracy: q.accuracyPercentage }))[0] || { name: 'None', accuracy: 100 }
    },
    errorPatterns: {
      guessing: Math.round(guessingCount / totalAttempts * 100),
      conceptGap: Math.round(conceptGapCount / totalAttempts * 100),
      inefficiency: Math.round(inefficiencyCount / totalAttempts * 100),
      insight: guessingCount > conceptGapCount ? "Majority errors due to guessing under time pressure." : "Errors indicate specific conceptual gaps in hard topics."
    },
    timeManagement: {
      avgTimePerQuestion: avgTime,
      heavyPercentage: Math.round(heavyCount / totalAttempts * 100),
      rushedPercentage: Math.round(rushedCount / totalAttempts * 100),
      status: avgTime > 100 ? 'slow' : avgTime < 45 ? 'rushing' : 'optimal',
      interpretation: rushedCount > heavyCount ? "You rush easy questions but slow down on hard ones." : "Consistent pacing detected across difficulty levels."
    },
    insight: avgAccuracy > 75 ? "Your performance is peaking. Maintain stability." : "Foundational retrieval gaps detected in core subjects.",
  };
}

/**
 * buildRevisionVM
 * Maps the revision queue to topic intelligence for a "Memory Recovery" view.
 */
export function buildRevisionVM(intelligence: any[], queue: any[]): RevisionVM {
  const items: RevisionItemVM[] = queue
    .filter(q => !q.isCompleted)
    .map(q => {
      const intel = intelligence.find(i => i.topicId === q.entityId) || {};
      const scheduledDate = q.scheduledFor ? new Date(q.scheduledFor) : new Date();
      
      return {
        id: q.id,
        intelligenceId: intel.id || '',
        topic: q.entityId,
        subject: q.examId || 'General',
        retention: intel.retentionScore || 50,
        priority: q.priority === 'urgent' ? 'high' : q.priority === 'high' ? 'high' : q.priority === 'medium' ? 'medium' : 'low',
        forgettingETA: q.scheduledFor ? `Next review in ${formatDistanceToNow(scheduledDate)}` : 'Review due now',
        behavioralInsight: q.reason || "Periodic reinforcement required to maintain mastery.",
      };
    });

  return {
    high: items.filter(i => i.priority === 'high'),
    medium: items.filter(i => i.priority === 'medium'),
    low: items.filter(i => i.priority === 'low'),
    overallStrategy: items.some(i => i.priority === 'high') 
      ? "Immediate intervention required in critical memory zones."
      : "Memory stability is optimal. Stick to the scheduled light revision."
  };
}

/**
 * buildWeaknessVM
 * Interprets AI pattern analysis into actionable UI clusters.
 */
export function buildWeaknessVM(aiOutput: any): WeakAreaVM {
  return {
    clusters: (aiOutput.clusters || []).map((c: any) => ({
      ...c,
      insightText: c.interpretation,
      actionSuggestion: c.suggestedAction
    })),
    repeatedErrors: aiOutput.repeatedErrors || [],
    overallDiagnostic: aiOutput.overallDiagnostic || "Our intelligence is currently mapping your behavioral signals."
  };
}

/**
 * generateWeeklyPlanVM
 * Formats AI-generated plan into a mentor-led roadmap.
 */
export function generateWeeklyPlanVM(rawPlan: WeeklyPlanOutput): any {
  return {
    ...rawPlan,
    insightBanner: rawPlan.insightBanner,
    interpretation: `This week is optimized for ${rawPlan.overview.priorityFocus.toLowerCase()} based on recent accuracy fluctuations.`,
  };
}
