// All Firestore collection paths in one place.
// Field names inside documents match PostgreSQL column names exactly.

export const PATHS = {
  // Top-level collections
  users: () => 'users',
  user: (uid: string) => `users/${uid}`,

  // User-scoped subcollections
  baselines: (uid: string) => `users/${uid}/baselines`,
  activeBaseline: (uid: string) => `users/${uid}/baselines/active`,

  attempts: (uid: string) => `users/${uid}/attempts`,
  attempt: (uid: string, attemptId: string) => `users/${uid}/attempts/${attemptId}`,
  attemptQuestions: (uid: string, attemptId: string) => `users/${uid}/attempts/${attemptId}/attempt_questions`,
  attemptReflections: (uid: string) => `users/${uid}/attempt_reflections`,

  subjectPerformance: (uid: string) => `users/${uid}/subject_performance`,
  chapterPerformance: (uid: string) => `users/${uid}/chapter_performance`,
  questionTypePerformance: (uid: string) => `users/${uid}/question_type_performance`,
  performanceSummary: (uid: string) => `users/${uid}/performance_summary/current`,

  revisionPool: (uid: string) => `users/${uid}/revision_pool`,
  spacedRevisionSchedule: (uid: string) => `users/${uid}/spaced_revision_schedule`,
  userRevisionPreferences: (uid: string) => `users/${uid}/revision_preferences/current`,

  weeklyPlans: (uid: string) => `users/${uid}/weekly_plans`,
  activeWeeklyPlan: (uid: string) => `users/${uid}/weekly_plans/active`,
  weeklySessions: (uid: string, planId: string) => `users/${uid}/weekly_plans/${planId}/weekly_sessions`,

  psychologicalState: (uid: string) => `users/${uid}/psychological_state/current`,
  subscriptions: (uid: string) => `users/${uid}/subscriptions`,

  // Shared/global collections
  subjects: () => 'subjects',
  chapters: () => 'chapters',
  questions: () => 'questions',
  exams: () => 'exams',
  examBlueprints: () => 'exam_blueprints',
  examSections: () => 'exam_sections',
  examPhaseConfig: () => 'exam_phase_config',
  percentileMapping: () => 'percentile_mapping',
} as const;
