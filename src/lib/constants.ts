export const EXAM_CODES = ['NEET_UG', 'CUET'] as const;
export type ExamCode = typeof EXAM_CODES[number];

export const SUBJECTS = ['PHYSICS', 'CHEMISTRY', 'BIOLOGY'] as const;
export type Subject = typeof SUBJECTS[number];

export const ATTEMPT_TYPES = ['PRACTICE', 'SECTIONAL', 'MOCK', 'REVISION'] as const;
export type AttemptType = typeof ATTEMPT_TYPES[number];

export const ATTEMPT_STATUSES = ['CREATED', 'IN_PROGRESS', 'PAUSED', 'EVALUATION_IN_PROGRESS', 'EVALUATED', 'ARCHIVED'] as const;
export type AttemptStatus = typeof ATTEMPT_STATUSES[number];

export const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const CONFIDENCE_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[number];

export const TAXONOMY_TYPES = [
  'FACTUAL',
  'CONCEPTUAL',
  'APPLICATION',
  'ANALYTICAL',
  'NUMERICAL',
  'ASSERTION_REASON',
  'MATCH_THE_FOLLOWING',
  'STATEMENT_BASED',
] as const;
export type TaxonomyType = typeof TAXONOMY_TYPES[number];

export const TAXONOMY_CATEGORIES = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE'] as const;
export type TaxonomyCategory = typeof TAXONOMY_CATEGORIES[number];

export const USER_PLANS = ['FREE', 'PRO', 'INSTITUTIONAL'] as const;
export type UserPlan = typeof USER_PLANS[number];

export const USER_ROLES = ['STUDENT', 'ADMIN'] as const;
export type UserRole = typeof USER_ROLES[number];

export const REVISION_REASONS = ['INCORRECT', 'SKIPPED', 'TIME_HEAVY'] as const;
export type RevisionReason = typeof REVISION_REASONS[number];

export const CHALLENGE_TYPES = [
  'CONCEPTUAL_GAPS',
  'POOR_REVISION',
  'NUMERICALS',
  'TRICK_QUESTIONS',
  'TIME_MANAGEMENT',
  'SILLY_MISTAKES',
  'GUESSING',
  'PERFORMANCE_ANXIETY',
  'FATIGUE',
  'NONE',
  'OTHER',
] as const;
export type ChallengeType = typeof CHALLENGE_TYPES[number];

export const PREPARATION_STAGES = ['JUST_STARTED', 'EARLY', 'MID', 'ADVANCED', 'REVISION_ONLY'] as const;
export type PreparationStage = typeof PREPARATION_STAGES[number];

export const SESSION_TYPES = ['NEW', 'REVISION', 'MOCK', 'REMEDIATION'] as const;
export type SessionType = typeof SESSION_TYPES[number];

export const MOCK_PHASES = ['EARLY', 'MID', 'FINAL'] as const;
export type MockPhase = typeof MOCK_PHASES[number];

// NEET-specific scoring rules
export const NEET_SCORING = { CORRECT: 4, INCORRECT: -1, UNATTEMPTED: 0 } as const;

// NEET exam blueprint
export const NEET_BLUEPRINT = {
  PHYSICS: 45,
  CHEMISTRY: 45,
  BIOLOGY: 90,
  TOTAL: 180,
  DURATION_MINUTES: 200,
  MAX_SCORE: 720,
} as const;

// Time thresholds per subject (seconds) — used to flag slow questions
export const TIME_THRESHOLDS_SECONDS = { BIOLOGY: 100, CHEMISTRY: 120, PHYSICS: 180 } as const;
