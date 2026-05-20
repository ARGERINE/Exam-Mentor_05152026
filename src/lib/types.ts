import type {
  Subject,
  AttemptType,
  AttemptStatus,
  DifficultyLevel,
  ConfidenceLevel,
  TaxonomyType,
  TaxonomyCategory,
  UserPlan,
  UserRole,
  RevisionReason,
  ChallengeType,
  PreparationStage,
  SessionType,
  MockPhase,
  ExamCode,
} from './constants';

// Mirrors: public.users table
export interface AppUser {
  id: string; // UUID
  email: string;
  plan: UserPlan; // 'FREE' | 'PRO' | 'INSTITUTIONAL'
  role: UserRole; // 'STUDENT' | 'ADMIN'
  created_at: string; // ISO timestamp
}

// Mirrors: public.user_baselines table
export interface UserBaseline {
  id: string;
  user_id: string;
  exam_code: ExamCode;
  target_exam_date: string; // 'YYYY-MM-DD'
  weekly_study_hours: number;
  preparation_stage: PreparationStage;
  subject_self_rating: Record<Subject, number>; // { PHYSICS: 7, ... }
  subject_confidence: Record<Subject, 'LOW' | 'STABLE' | 'HIGH'>;
  is_active: boolean;
  version_number: number;
  reset_used: boolean;
  is_evolved: boolean;
  evolved_at?: string;
  evolution_trigger?: string;
  created_at: string;
}

// Mirrors: public.subjects table
export interface AppSubject {
  id: string;
  name: Subject;
}

// Mirrors: public.chapters table
export interface Chapter {
  id: string;
  subject_id: string;
  unit: string;
  chapter_name: string;
  slug: string;
  class_level: 'XI' | 'XII';
  chapter_order: number;
}

// Mirrors: public.questions table
export interface Question {
  id: string;
  unique_question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  difficulty: DifficultyLevel;
  taxonomy_category: TaxonomyCategory;
  taxonomy_type: TaxonomyType;
  explanation?: string;
  image_ref?: string;
  subject_id: string;
  chapter_id: string;
  expected_time_seconds: number;
}

// Mirrors: public.attempts table
export interface Attempt {
  attempt_id: string; // UUID — primary key
  user_id: string;
  exam_id: string;
  attempt_type: AttemptType;
  attempt_status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  total_score?: number;
  accuracy?: number;
  total_time_seconds?: number;
  mock_phase?: MockPhase;
  version_number: number;
  evaluation_completed_at?: string;
  processing_duration_ms?: number;
  created_at: string;
}

// Mirrors: public.attempt_questions table
export interface AttemptQuestion {
  attempt_id: string;
  question_id: string;
  sequence: number;
  selected_option?: 'A' | 'B' | 'C' | 'D';
  is_correct?: boolean;
  time_taken_seconds?: number;
  confidence_level?: ConfidenceLevel;
  is_time_heavy?: boolean;
  red_zone_flag?: boolean;
  correct_option?: 'A' | 'B' | 'C' | 'D';
  created_at: string;
}

// Mirrors: public.attempt_reflections table
export interface AttemptReflection {
  id: string;
  attempt_id: string;
  challenge: ChallengeType;
  created_at: string;
}

// Mirrors: public.subject_performance table
export interface SubjectPerformance {
  id: string;
  user_id: string;
  subject_id: string;
  attempts_30d: number;
  correct_30d: number;
  accuracy_30d: number;
  easy_correct: number;
  easy_attempts: number;
  medium_correct: number;
  medium_attempts: number;
  hard_correct: number;
  hard_attempts: number;
  last_updated: string;
}

// Mirrors: public.chapter_performance table
export interface ChapterPerformance {
  id: string;
  user_id: string;
  chapter_id: string;
  attempts_30d: number;
  correct_30d: number;
  accuracy_30d: number;
  easy_correct: number;
  easy_attempts: number;
  medium_correct: number;
  medium_attempts: number;
  hard_correct: number;
  hard_attempts: number;
  last_updated: string;
}

// Mirrors: public.question_type_performance table
export interface QuestionTypePerformance {
  id: string;
  user_id: string;
  question_type: TaxonomyType;
  attempts_30d: number;
  correct_30d: number;
  accuracy_30d: number;
  avg_time_seconds: number;
  last_updated: string;
}

// Mirrors: public.performance_summary table
export interface PerformanceSummary {
  user_id: string;
  subject_accuracy: Record<Subject, number>;
  chapter_accuracy: Record<string, number>;
  taxonomy_accuracy: Record<TaxonomyType, number>;
  rolling_5_mock_accuracy: number;
  consistency_score: number;
  confidence_score: number;
  percentile: number;
  predicted_rank_range: string;
  last_updated: string;
}

// Mirrors: public.revision_pool table
export interface RevisionPoolItem {
  id: string;
  user_id: string;
  question_id: string;
  reason: RevisionReason;
  consecutive_correct_count: number;
  active_flag: boolean;
  last_attempted_at?: string;
  priority_score: number;
  created_at: string;
}

// Mirrors: public.weekly_plans table
export interface WeeklyPlan {
  id: string;
  user_id: string;
  exam_code: ExamCode;
  week_start: string; // 'YYYY-MM-DD'
  week_end: string; // 'YYYY-MM-DD'
  exam_date: string; // 'YYYY-MM-DD'
  is_active: boolean;
  recalibration_version: number;
  created_at: string;
}

// Mirrors: public.weekly_sessions table
export interface WeeklySession {
  id: string;
  weekly_plan_id: string;
  chapter_id?: string;
  session_type: SessionType;
  planned_question_count: number;
  completed_question_count: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  scheduled_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

// Mirrors: public.subscriptions table
export interface Subscription {
  id: string;
  user_id: string;
  plan: UserPlan;
  status: string;
  valid_until?: string; // 'YYYY-MM-DD'
  created_at: string;
}

// Mirrors: public.user_psychological_state table
export interface PsychologicalState {
  user_id: string;
  anxiety_level: 'LOW' | 'MEDIUM' | 'HIGH';
  assessed_at: string;
  reassess_required: boolean;
}

// Mirrors: public.spaced_revision_schedule table
export interface SpacedRevisionSchedule {
  id: string;
  user_id: string;
  exam_code: ExamCode;
  question_id: string;
  source_attempt_id: string;
  next_revision_date: string; // 'YYYY-MM-DD'
  revision_interval_weeks: 1 | 2 | 3;
  is_active: boolean;
  created_at: string;
}
